---
name: mock-genai
description: Keep all Gemini calls free — route through the cached client and intercept in tests so zero API requests fire.
disable-model-invocation: true
---

# mock-genai

Persona Forge runs on Google AI Studio; the GEMINI_API_KEY is injected at runtime and
is a finite resource. This skill enforces a request-free workflow.

## Rules (enforce on every change)

1. **Never call the SDK directly.** All live Gemini traffic goes through
   `src/lib/geminiClient.ts` -> `callGemini({ model, contents, config })`.
   It caches identical prompts in localStorage (repeat prompts = 0 requests) and
   caps `maxOutputTokens`.

2. **Tests fire 0 requests.** Set mock mode so `liveCall` is never reached:
   - Per test: `import { setMockMode } from '@/lib/geminiClient'; setMockMode(true);`
   - Or env: `PF_MOCK_GEMINI=1 npm test`

3. **If a real network call must be simulated in a test**, intercept at the
   boundary by mocking `callGemini` with `vi.mock('../lib/geminiClient', ...)`.
   Do NOT import `@google/genai` in tests.

## Test template

```ts
// src/lib/__tests__/geminiClient.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { callGemini, setMockMode } from '../geminiClient';

beforeEach(() => setMockMode(true));

it('returns deterministic output without a network call', async () => {
  const out = await callGemini({ model: 'gemini', contents: 'hello' });
  expect(out).toContain('[MOCK]');
});

it('same prompt is cached (still 0 requests)', async () => {
  const a = await callGemini({ model: 'gemini', contents: 'x' });
  const b = await callGemini({ model: 'gemini', contents: 'x' });
  expect(a).toBe(b);
});
```

## Checklist before claiming "free"
- [ ] No file imports `@google/genai` or `google.genai` except `geminiClient.ts`.
- [ ] `PF_MOCK_GEMINI=1 npm test` passes with no outbound requests.
- [ ] Any new call passes through `callGemini` with a `maxOutputTokens` cap.
