// Single chokepoint for every LLM call in Persona Forge.
// Uses OpenRouter (https://openrouter.ai) — free tier, one key, 100+ models.
//   - Cache identical prompts (localStorage) -> repeat prompts cost 0 requests.
//   - Mock mode for tests / offline -> 0 requests, deterministic output.
//   - Retry with exponential backoff + jitter.
//   - Timeout via AbortSignal.
//   - Circuit breaker to fail fast when upstream is down.
// Route ALL live calls through callLLM(); never hit the API directly.

export interface LLMCall {
  model: string;
  contents: string;
  config?: { maxOutputTokens?: number; temperature?: number };
  signal?: AbortSignal;
  timeoutMs?: number;
}

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const CACHE_PREFIX = 'pf_llm_';
const MOCK_FLAG = 'PF_MOCK_LLM';

// Circuit breaker state
interface CircuitState {
  failures: number;
  lastFailure: number;
  open: boolean;
}
const circuitBreaker: CircuitState = { failures: 0, lastFailure: 0, open: false };
const CIRCUIT_THRESHOLD = 5; // open after 5 consecutive failures
const CIRCUIT_RESET_MS = 30_000; // try again after 30s

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

let forcedMock: boolean | null = null;
export function setMockMode(on: boolean | null) {
  forcedMock = on;
}

function isMock(): boolean {
  if (forcedMock !== null) return forcedMock;
  return typeof process !== 'undefined' && process.env?.[MOCK_FLAG] === '1';
}

function cacheKey(c: LLMCall): string {
  return CACHE_PREFIX + hash(c.model + '|' + c.contents);
}

function cached(c: LLMCall): string | null {
  try {
    const raw = localStorage.getItem(cacheKey(c));
    return raw ? JSON.parse(raw).text : null;
  } catch {
    return null;
  }
}

function store(c: LLMCall, text: string) {
  try {
    localStorage.setItem(cacheKey(c), JSON.stringify({ text }));
  } catch {
    /* quota/SSR ignore */
  }
}

function mockReply(c: LLMCall): string {
  return `[MOCK] ${c.contents.slice(0, 80)}`;
}

export class LLMUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMUnavailableError';
  }
}

export class LLMTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMTimeoutError';
  }
}

export class LLMCircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMCircuitOpenError';
  }
}

export function isLLMAvailable(): boolean {
  return Boolean(import.meta.env.VITE_OPENROUTER_API_KEY);
}

function checkCircuit(): void {
  const now = Date.now();
  if (circuitBreaker.open) {
    if (now - circuitBreaker.lastFailure > CIRCUIT_RESET_MS) {
      circuitBreaker.open = false;
      circuitBreaker.failures = 0;
    } else {
      throw new LLMCircuitOpenError('Circuit breaker open — upstream unavailable');
    }
  }
}

function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  if (circuitBreaker.failures >= CIRCUIT_THRESHOLD) {
    circuitBreaker.open = true;
  }
}

function recordSuccess(): void {
  circuitBreaker.failures = 0;
  circuitBreaker.open = false;
}

async function liveCall(c: LLMCall): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new LLMUnavailableError('OpenRouter API key missing (VITE_OPENROUTER_API_KEY)');

  checkCircuit();

  const cap = c.config?.maxOutputTokens ?? 1024;
  const timeoutMs = c.timeoutMs ?? 30_000;

  // Create AbortController with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const signal = c.signal ?? controller.signal;

  const attemptFetch = async (attempt: number): Promise<string> => {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': import.meta.env.VITE_APP_URL ?? '',
          'X-Title': 'Persona Forge',
        },
        body: JSON.stringify({
          model: c.model,
          messages: [{ role: 'user', content: c.contents }],
          max_tokens: cap,
          temperature: c.config?.temperature ?? 0.7,
          stream: false,
        }),
        signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = new LLMUnavailableError(`OpenRouter ${res.status}: ${res.statusText}`);
        // Don't retry on 4xx (client errors)
        if (res.status >= 400 && res.status < 500) {
          throw err;
        }
        throw err;
      }

      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? '';
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new LLMTimeoutError(`Request timed out after ${timeoutMs}ms`);
      }
      throw e;
    }
  };

  // Retry with exponential backoff + jitter
  const maxRetries = 3;
  let lastError: Error;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await attemptFetch(attempt);
      recordSuccess();
      return result;
    } catch (e) {
      lastError = e as Error;
      // Don't retry on circuit open, timeout, or client errors (4xx)
      if (
        e instanceof LLMCircuitOpenError ||
        e instanceof LLMTimeoutError ||
        (e instanceof LLMUnavailableError && e.message.includes('4'))
      ) {
        recordFailure();
        throw e;
      }
      recordFailure();
      if (attempt < maxRetries) {
        const baseDelay = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
        const jitter = Math.random() * 250; // 0-250ms
        await new Promise((r) => setTimeout(r, baseDelay + jitter));
      }
    }
  }
  throw lastError!;
}

export async function callLLM(c: LLMCall): Promise<string> {
  if (isMock()) return mockReply(c);
  const hit = cached(c);
  if (hit) return hit;
  const text = await liveCall(c);
  store(c, text);
  return text;
}