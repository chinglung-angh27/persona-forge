# Persona Architecture — Design Spec

**Date:** 2026-08-28
**Status:** Approved-intent (user said "start"). Pre-implementation.
**Source proposal:** `PERSONA_ARCHITECTURE_PROPOSAL.md`

## Goal

Move Persona Forge from an implicit, unmodeled single persona (two strings on
`UserSession`) to an explicit model: **a user owns many Personas, exactly one is
active at a time, and every workspace view + every AI call is scoped to that
active Persona.** Persona creation and management live in a separate **Persona
Library**, distinct from the immersive workspace.

## Constraints (discovered during inspection)

- Client-only React 19 SPA (Vite). `express` is in `package.json` but **never
  imported** — there is no backend, no DB, no API server.
- Persistence is browser `localStorage` (`pf_*` keys), read/written directly in
  `src/App.tsx`.
- No router library. Navigation is `useState<ViewMode>` + a `MoreMenu` overlay.
- The only AI chokepoint is `callGemini()` in `src/lib/geminiClient.ts`, called
  only by `SimulatorView.evaluateCustom`, which builds the prompt from
  `activeTraits` passed down from `App.tsx`.
- Seed data exists as `INITIAL_*` constants in `src/data/initialData.ts`.

## Decision: smallest change that satisfies the model

Keep the client-only, localStorage architecture. **Do not** add a backend, a
router, or new state-management libraries. Introduce a first-class `Persona`
entity and re-scope existing state into it. Isolation is **structural** (per-
persona data lives inside the persona object; views receive only
`activePersona`; writes funnel through one helper) — not procedural guards.

## Data model

### `UserSession` (user-level, app-wide) — slimmed
```
email: string
isAuthenticated: boolean
modelIntensity: 'Passive' | 'Balanced' | 'Aggressive'
predictiveInsights: boolean
activePersonaId: string
```
Removed from `UserSession`: `personaName`, `archetype`, `consistencyScore`
(the latter is now derived per active persona).

### `Persona` (new, per-persona — owns all persona data)
```
id: string
name: string
archetype: string
identityStatement: string            // new; short "who I am" line
traits: Trait[]
blendedReferenceIds: string[]        // was global `blendedReferences`
dailyMissions: DailyMission[]
habits: HabitItem[]
reflections: ReflectionEntry[]
evolutionItems: EvolutionItem[]
simulatorResults: { scenarioId: string; score: number; ts: string }[]
createdAt: string                    // ISO-8601
lastActiveAt: string                 // ISO-8601
status: 'draft' | 'active' | 'archived'
```

### Shared, NOT per-persona
- `ReferenceItem` catalog — global constant (`INITIAL_REFERENCES`).
- Simulator scenario catalog — global constant (`INITIAL_SIMULATOR_SCENARIOS`).

## State reshape (`src/App.tsx`)

Replace the 9 flat `useState`s (`traits`, `blendedReferences`, `dailyMissions`,
`habits`, `reflections`, `evolutionItems`, `scenarios`, `references`,
`session.personaName/archetype`) with:

```
personas: Persona[]                 // loaded from pf_personas
activePersonaId: string             // loaded from pf_activePersonaId
session: UserSession (slimmed)      // pf_session
references: ReferenceItem[] (const)
scenarios: SimulatorScenario[] (const)
activePersona = useMemo(() => personas.find(p => p.id === activePersonaId)!)
```

**Write helper (single source of truth for all persona mutations):**
```ts
function updateActivePersona(partial: Partial<Persona> | ((p: Persona) => Persona)) {
  setPersonas(prev => prev.map(p =>
    p.id === activePersonaId ? (typeof partial === 'function' ? partial(p) : { ...p, ...partial }) : p
  ));
}
```
Every existing handler (`handleApplyReference`, `handleToggleMission`,
`handleAddMission`, `handleToggleHabitDay`, `handleAddHabit`,
`handleAddReflection`, `handleAddEvolution`, `handleRecordSimulationResult`,
`handleResetTraits`) is rewritten to call `updateActivePersona` (or read from
`activePersona`) instead of the global flat state. `handleApplyReference`
moves the trait-modifier application and evolution-log entry onto the active
persona.

**Consistency score:** recompute via the existing `useMemo`, swapping the inputs
to `activePersona.dailyMissions / habits / reflections / evolutionItems`.

## Views touched (logic unchanged; only prop sources swap)

`TodayView`, `DNAEditorView`, `TrainView`, `JournalView`, `MyPersonaView`,
`EvolutionView`, `ReferenceLibraryView` — receive `activePersona.*` (and per-
persona arrays) instead of flat globals. Internal rendering logic is preserved.

## New UI

1. **`PersonaSwitcher`** (in `Navigation`, prominent — NOT buried in settings):
   shows current persona, opens the list, switches, links to Library/Create.
2. **`PersonaLibraryView`** (`ViewMode: 'library'`): card list of owned personas
   (name, identity statement, core traits, reference influence, created, last
   active, status, progress) with Open(switch)/Edit/Archive. Visually distinct
   from the workspace. Read-only over `personas` — never mixes datasets.
3. **`CreatePersonaView`** (`ViewMode: 'persona-new'`, minimal v1): name +
   archetype + optional reference blend → seeds a `Persona` from `INITIAL_*`
   templates → sets it active. Defers the full 10-step wizard to v2.

## Login change

`LoginView` collects **email only** (bootstraps the first persona via a default
seed). Subsequent personas are created in the Library. `handleLogin` is updated
to set `session.email` and create/select the first `Persona`.

## Routing

**Option A (chosen):** keep `ViewMode` nav, add `'library'`, `'persona-new'`,
`'persona-manage'`. Reflect active persona as `?persona=<id>` via the History
API (no `react-router`). On load, restore `activePersonaId` from the query.
`react-router` nested routes deferred to v2.

## Persistence / storage migration

- Remove flat keys: `pf_traits`, `pf_missions`, `pf_habits`, `pf_reflections`,
  `pf_evolution`, `pf_blended_refs`.
- Add: `pf_personas` (array), `pf_activePersonaId` (string).
- Slim `pf_session` to user-level fields + `activePersonaId`.
- Keep `pf_gemini_*` cache.
- Stamp `PF_DATA_VERSION`.
- **Migration on boot:** if any legacy flat key exists and `pf_personas` does
  not, build one seed `Persona` from the legacy `pf_*` values + `INITIAL_*`
  templates, write `pf_personas` + `pf_activePersonaId`, delete legacy keys.
  On failure, fall back to a clean one-persona seed + console warning; never crash.
- Rollback remains `localStorage.clear()` (`handlePurgeData`).

## AI context isolation

`SimulatorView.evaluateCustom` already receives `traits` as an argument — keep
it. `App.tsx` passes `activePersona.traits` (already wired as `activeTraits`).
No other persona object is ever in scope in a workspace view, and prompts are
built only from the active persona. Cross-contamination is impossible by
construction. Cache key already hashes prompt contents, so per-persona prompts
cache independently.

## Data isolation strategy (structural)

- Per-persona data lives **inside** the persona object; no global trait/mission/
  reflection store exists to leak from.
- Workspace views receive **only** `activePersona`, never `personas`.
- All writes funnel through `updateActivePersona` (immutably replaces exactly
  the active element).
- The Library is the only consumer of `personas`, and it only reads/selects.

## Testing

- Extend `src/__tests__/types.test.ts` coverage for the new `Persona` type.
- Keep `src/lib/__tests__/geminiClient.test.ts` green.
- Add a focused unit test for `migrateLegacy()` (legacy flat shape → one-seed
  persona) and for `updateActivePersona` (mutates only the active persona,
  leaves others untouched).
- Manual: switch persona in `PersonaSwitcher` → all views + consistency score +
  simulator prompt reflect only the active persona; create a second persona in
  Library → becomes active; reload with `?persona=<id>` → restores.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| `App.tsx` handlers mutate flat globals | Funnel through `updateActivePersona`; keep view logic identical |
| `handleApplyReference` mutates global traits + evolution | Scope both to active persona |
| Consistency score from globals | Recompute from `activePersona` arrays via existing `useMemo` |
| LoginView overloaded as creation | Split: email-only login; creation in Library |
| Large diff regresses views | Swaps only prop sources; add unit tests for migration + write helper |

## Deferred (v2, not required for correct architecture)

Full 10-step creation wizard (principles/rules/comm-style/persona-code
generator); nested `react-router` routes; per-persona reference-blend undo;
aggregated overview feature (explicitly separate from the per-persona workspace).

## Mental model (final)

```
USER → PERSONA LIBRARY (create / manage / switch) → ONE ACTIVE PERSONA
     → PERSONA WORKSPACE (live / practice / reflect / evolve)
```
Multiple personas can exist. Only one is active. Creation/management live in a
separate Library. The active persona is the single source of context for every
workspace view and every AI call.
