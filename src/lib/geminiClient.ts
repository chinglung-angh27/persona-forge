// Single chokepoint for every Gemini call in Persona Forge.
// Goal: never waste the AI Studio-injected GEMINI_API_KEY.
//   - Cache identical prompts (localStorage) -> repeat prompts cost 0 requests.
//   - Mock mode for tests / offline -> 0 requests, deterministic output.
// Route ALL live calls through callGemini(); never hit the SDK directly.

export interface GeminiCall {
  model: string;
  contents: string;
  config?: { maxOutputTokens?: number; temperature?: number };
}

const CACHE_PREFIX = 'pf_gemini_';
const MOCK_FLAG = 'PF_MOCK_GEMINI';

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// ponytail: global flag, per-call override when tests need control.
let forcedMock: boolean | null = null;
export function setMockMode(on: boolean | null) {
  forcedMock = on;
}

function isMock(): boolean {
  if (forcedMock !== null) return forcedMock;
  return typeof process !== 'undefined' && process.env?.[MOCK_FLAG] === '1';
}

function cacheKey(c: GeminiCall): string {
  return CACHE_PREFIX + hash(c.model + '|' + c.contents);
}

function cached(c: GeminiCall): string | null {
  try {
    const raw = localStorage.getItem(cacheKey(c));
    return raw ? JSON.parse(raw).text : null;
  } catch {
    return null;
  }
}

function store(c: GeminiCall, text: string) {
  try {
    localStorage.setItem(cacheKey(c), JSON.stringify({ text }));
  } catch {
    /* quota/SSR ignore */
  }
}

// Deterministic mock so tests never touch the network.
function mockReply(c: GeminiCall): string {
  return `[MOCK] ${c.contents.slice(0, 80)}`;
}

// Thrown only when no Gemini runtime is wired (AI Studio key absent).
// Callers use this to fall back to local eval WITHOUT masking real API/parse errors.
export class GeminiUnavailableError extends Error {}

// True only when a real Gemini runtime is wired (AI Studio injects `google.genai`).
// Lets UI claim "online" honestly instead of always showing the badge.
export function isGeminiAvailable(): boolean {
  return Boolean((globalThis as any).google?.genai?.models?.generateContent);
}

// AI Studio injects `google.genai` at runtime; fallback to npm SDK if present.
async function liveCall(c: GeminiCall): Promise<string> {
  const cap = c.config?.maxOutputTokens ?? 1024;
  const g = (globalThis as any).google?.genai;
  if (!g?.models?.generateContent) {
    throw new GeminiUnavailableError('Gemini runtime unavailable (no google.genai global)');
  }
  const res = await g.models.generateContent({
    model: c.model,
    contents: c.contents,
    config: { ...c.config, maxOutputTokens: cap },
  });
  return res.text ?? '';
}

export async function callGemini(c: GeminiCall): Promise<string> {
  if (isMock()) return mockReply(c);
  const hit = cached(c);
  if (hit) return hit;
  const text = await liveCall(c);
  store(c, text);
  return text;
}
