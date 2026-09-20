import { describe, it, expect, beforeEach } from 'vitest';
import { callLLM, setMockMode } from '../openrouterClient';

beforeEach(() => setMockMode(true));

it('returns deterministic output without a network call', async () => {
  const out = await callLLM({ model: 'openai/gpt-4o-mini', contents: 'hello' });
  expect(out).toContain('[MOCK]');
});

it('same prompt is cached (still 0 requests)', async () => {
  const a = await callLLM({ model: 'openai/gpt-4o-mini', contents: 'x' });
  const b = await callLLM({ model: 'openai/gpt-4o-mini', contents: 'x' });
  expect(a).toBe(b);
});
