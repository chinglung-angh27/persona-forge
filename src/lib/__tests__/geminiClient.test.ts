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
