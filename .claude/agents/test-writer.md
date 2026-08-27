---
name: test-writer
description: Wires up Vitest and generates tests for Persona Forge data/logic. Use when adding the missing test suite.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

You are adding the missing test suite to Persona Forge (currently zero tests).

Steps:
1. `npm i -D vitest` and add `"test": "vitest run"` to package.json scripts.
2. Add a `vitest.config.ts` (node environment; react plugin not required for data tests).
3. Write `src/data/__tests__/initialData.test.ts` and `src/__tests__/types.test.ts` covering:
   - Every `INITIAL_*` export is a non-empty array.
   - All `Trait.value` ∈ [0,100]; `category` is a valid union member.
   - `INITIAL_SIMULATOR_SCENARIOS` / `INITIAL_TRAITS` / `INITIAL_REFERENCES` have unique `id`.
   - A type-level check that `UserSession`/`ViewMode` are used consistently.
4. Run `npm test` and iterate until green. Report the final passing count and any logic bug found.

Keep tests minimal and aligned with the existing `@/` alias and `types.ts` exports. Do not add a UI/render test framework.
