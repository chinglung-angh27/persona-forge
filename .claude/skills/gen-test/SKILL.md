---
name: gen-test
description: Scaffold Vitest tests for Persona Forge data/logic. User-invoked when adding or verifying tests.
disable-model-invocation: true
---

# gen-test

Persona Forge has no test runner. To add tests:

1. Add Vitest: `npm i -D vitest` and a `test` script: `"test": "vitest run"`.
2. Create `src/**/__tests__/*.test.ts` next to the code under test.
3. Test the pure logic in `src/data/initialData.ts` and `src/types.ts` first (no React rendering needed):
   - Each `INITIAL_*` array is non-empty.
   - `Trait.value` is `0..100` for every trait.
   - `INITIAL_SIMULATOR_SCENARIOS` have unique ids.
4. Run `npm test`. Keep tests green; do not widen the suite until the happy path passes.

Example:
```ts
import { INITIAL_TRAITS } from '@/data/initialData';
test('trait values within range', () => {
  for (const t of INITIAL_TRAITS) {
    expect(t.value).toBeGreaterThanOrEqual(0);
    expect(t.value).toBeLessThanOrEqual(100);
  }
});
```
