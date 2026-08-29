# PERSONA ARCHITECTURE PROPOSAL

> Status: Inspection complete. **No code has been changed.** This document proposes
> the smallest architectural change required to move Persona Forge from "one implicit,
> unmodeled persona" to "one explicitly-active Persona at a time, with a separate
> Persona Library for creating/managing/switching."

---

## 1. Current Architecture

### Stack
- **Client-only React 19 SPA** built with Vite. No server entrypoint exists in `src/`.
- `express` is listed in `package.json` dependencies but is **never imported anywhere** in the app. There is no API, no DB, no backend.
- Persistence = **browser `localStorage`**, accessed directly from `App.tsx` via `pf_*` keys.
- No router library installed (`react-router` absent). Navigation is a `useState<ViewMode>` enum plus a `MoreMenu` overlay. The active screen is `currentView`, not a URL.

### State model (`src/App.tsx`)
`App.tsx` is the single source of truth. It holds **nine independent `useState` values**, all loaded from `localStorage`:

| State | localStorage key | What it is |
|---|---|---|
| `session` (`UserSession`) | `pf_session` | `email`, `personaName`, `archetype`, `isAuthenticated`, `consistencyScore`, `modelIntensity`, `predictiveInsights` |
| `traits` (`Trait[]`) | `pf_traits` | the ONE persona's trait values |
| `references` | (constant) | global reference catalog, `INITIAL_REFERENCES` |
| `blendedReferences` (`string[]`) | `pf_blended_refs` | ids of blended references |
| `dailyMissions` | `pf_missions` | missions |
| `habits` | `pf_habits` | habits |
| `reflections` | `pf_reflections` | journal reflections |
| `evolutionItems` | `pf_evolution` | evolution log |
| `scenarios` | (constant) | simulator scenarios |

### Types (`src/types.ts`)
- **There is no `Persona` type.** A "persona" is represented only by two strings on `UserSession` (`personaName`, `archetype`).
- `UserSession` does **not** link to any owned data — traits, missions, etc. are separate top-level globals with no parent pointer.

### Views
- `LoginView` is the **only creation surface**: a single form (persona name + one of 4 archetypes + optional email). Submitting logs in AND creates the persona in one step. There is no list, no switch, no library.
- `Navigation` (sidebar + mobile dock): 4 primary tabs — `today`, `dna`, `train`, `journal` — plus a `More` sheet exposing `more-persona`, `more-references`, `more-evolution`, `more-settings`.
- `MyPersonaView` (`more-persona`) shows a single read-only-ish profile (hard-coded "The Strategic Operator" copy). It is **buried in More**, not a library.
- `TodayView` (the dashboard) renders the active archetype + traits-derived consistency ring. It reads global `traits`/`missions`/`evolution` — never a scoped object.
- `DNAEditorView`, `TrainView`, `JournalView`, `EvolutionView`, `ReferenceLibraryView`, `SettingsView` all read the same global singletons.

### AI context (`src/lib/geminiClient.ts`, `src/components/SimulatorView.tsx`)
- Exactly **one** AI chokepoint: `callGemini()`. Only `SimulatorView.evaluateCustom` calls it.
- The prompt is built from `traits.map(t => \`${t.name}: ${t.value}\`)` — the global `traits` passed in as `activeTraits` from `App.tsx`.
- Today this is "safe" only because there is one persona. There is no mechanism to scope or to leak other personas, because other personas don't exist.

---

## 2. Problems With Current Persona Model

1. **Multiple personas are not modeled at all.** No `Persona` type, no array, no `activePersonaId`. The product asks for "many personas, one active" — the data model supports **zero structure for this**.
2. **All persona data is global and unscoped.** Traits, missions, habits, reflections, evolution are flat top-level state with no owning persona. There is nothing to "switch between," and no boundary to prevent mixing — because there is only ever one implicit blob.
3. **Dashboard/management are conflated.** The only "persona" surfaces (`MyPersonaView`, `LoginView`) live under `More` or the login screen. There is no dedicated Library and no switch affordance.
4. **No active-Persona context object.** Persona identity is two strings in `session`; nothing ties `session.personaName` to the fifteen traits or any other dataset.
5. **Creation is entangled with login.** You cannot create a second persona without the login form; you cannot switch at all.
6. **AI context is per-global-traits, not per-persona.** Works only because N=1. The moment a second persona exists, the prompt builder must receive the **active** persona's traits and nothing else — that scoping does not yet exist as a guaranteed invariant.

The honest summary: the app already behaves like "one active persona" — it just never modeled that persona as an entity and has no machinery for a second one. The refactor's job is to **promote the implicit single persona into an explicit, swappable entity**, and add the Library/creation layer around it.

---

## 3. Proposed Persona Model

Keep the client-only, localStorage architecture. Introduce a first-class `Persona` entity that **owns** all per-persona data. Demote everything else to either (a) user-level settings or (b) a global reference catalog.

```
UserSession (user-level, app-wide)
├── email
├── activePersonaId        // ← pointer to the ONE active persona
├── modelIntensity         // arguably user-level; keep here
└── predictiveInsights

Persona (per-persona, owned data)
├── id
├── name
├── archetype
├── identityStatement      // short "who I am" line (new)
├── traits: Trait[]
├── blendedReferenceIds: string[]
├── dailyMissions: DailyMission[]
├── habits: HabitItem[]
├── reflections: ReflectionEntry[]
├── evolutionItems: EvolutionItem[]
├── simulatorResults: { scenarioId, score, ts }[]   // per-persona audit trail
├── createdAt
├── lastActiveAt
└── status: 'draft' | 'active' | 'archived'

ReferenceItem (global catalog — shared, NOT per persona)
PersonaScenario catalog — global, shared (results are per-persona)
```

- `App.tsx` state becomes: `personas: Persona[]`, `activePersonaId: string`. A **derived `activePersona`** is computed via `personas.find(p => p.id === activePersonaId)`.
- All existing views receive `activePersona.*` instead of the flat globals.
- **The single source of truth for writes is one helper:** `updateActivePersona(partial)` that immutably maps over `personas` and replaces only the active one. This structurally guarantees no other persona is touched.

---

## 4. Active Persona Concept

- `activePersona` is derived, never stored redundantly.
- Every workspace view (`today`, `dna`, `train`, `journal`, `more-*`) is rendered **entirely from `activePersona`**. Nothing in those views receives the `personas` array.
- Switching = `setActivePersonaId(id)` + update `lastActiveAt`. Every view recomputes because it reads the derived object.
- The dashboard gets a persistent **active-Persona identity banner** (name + archetype + identity statement) so the current persona is visually unmistakable at all times.
- Consistency score is recomputed **per active persona** from its own missions/habits/reflections/sim-results.

---

## 5. Persona Library

New primary destination: **`Persona Library`** (`ViewMode: 'library'`), visually distinct from the workspace.

- Lists all owned personas as cards showing: name, identity statement, core traits (mini bars or chips), reference influences (blended count/avatars), creation date, last active, status, optional progress indicator (consistency score).
- Each card: **Open (switch → becomes active)**, **Edit/Manage**, **Archive**.
- Clearly separated from the workspace: different visual treatment (e.g., a "management/creation environment" vs. the immersive workspace). Not a Gmail-style account switcher — make it feel like entering a different identity space.
- The Library is for **selection and management only**. It never mixes multiple personas' data into one dashboard.

---

## 6. Persona Creation Flow

Dedicated, separate from the dashboard. Target flow:

```
Persona Library
  → Create New Persona
      → Choose / Search References
      → Analyze Reference
      → Extract Traits
      → Customize Traits
      → Define Principles
      → Define Behavioral Rules
      → Define Communication Style
      → Generate Persona Code
      → Review Persona
      → Create Persona  →  becomes the active Persona
```

**Minimal v1 (recommended first cut):** a single `CreatePersonaView` form — name, archetype, optional reference blend, optional identity statement — that seeds a new `Persona` from the existing `INITIAL_*` templates (traits/missions/habits/etc.) and sets it active. This reuses all current seed data and avoids building the full 10-step wizard up front. The full multi-step flow is a **follow-up**, not required for the architecture to be correct.

- Creation is **never forced from the Dashboard**. The dashboard stays about *living* the active persona.
- The first-ever launch still uses `LoginView`, but `LoginView` should collect only the **user email** (and optionally bootstrap a first persona). Subsequent personas are created in the Library.

---

## 7. Dashboard Changes

- `TodayView` already centers on `personaArchetype` + a consistency ring. Minimal change: feed it `activePersona` instead of global `session.personaName`/`traits`.
- Add the **active-Persona identity banner** at the top so "who am I being right now" is the first thing shown.
- The dashboard answers: *Who this persona is · What it stands for · How I should behave · What to practice · How I'm doing · What I'm learning · How it's evolving* — all sourced from `activePersona` only.
- No aggregated multi-persona data on the dashboard.

---

## 8. Routing Changes

There is **no router**. Two options:

- **Option A — state-based (RECOMMENDED, smallest change):** keep `ViewMode` nav. Add `'library'`, `'persona-new'`, and `'persona-manage'`. The workspace remains the 4 tabs. Reflect the active persona in the URL **as a query param** (`?persona=<id>`) via the History API (no new dependency) so the active context is explicit, bookmarkable, and survives reload/share — without pulling in `react-router`.
- **Option B — nested routes (`/personas`, `/personas/new`, `/personas/[id]/dashboard`, …):** cleaner URLs, but requires adding `react-router` and restructuring every view's props/lifecycle. **Defer to v2** unless shareable deep-links are a hard requirement.

Recommendation: **Option A now**, with the `?persona=` query sync. This satisfies "make the active context explicit where appropriate" without introducing a routing library the app doesn't need.

---

## 9. Database Changes

**None structurally.** There is no SQL/NoSQL — storage is `localStorage`. The change is a **shape migration of the persisted JSON**:

- Remove flat keys: `pf_traits`, `pf_missions`, `pf_habits`, `pf_reflections`, `pf_evolution`, `pf_blended_refs`.
- Add: `pf_personas` (array of `Persona`) and `pf_activePersonaId` (string).
- Keep `pf_session` but slim it to user-level fields (`email`, `modelIntensity`, `predictiveInsights`, `isAuthenticated`). Remove `personaName`/`archetype` from session (they now live on the persona).
- Keep `pf_gemini_*` cache and the global `INITIAL_REFERENCES` catalog (constant).
- Version the store with `PF_DATA_VERSION` so future migrations are detectable.

No duplicate persona systems, no extra profile tables, no rewrite of working logic — just a repackaging of existing flat data into a per-persona envelope.

---

## 10. API Changes

**None.** No backend exists. `callGemini()` stays the single chokepoint. The only change is at the **call site**: `SimulatorView.evaluateCustom` must receive `activePersona.traits` (already passed as `activeTraits` from `App.tsx` — `App` just passes the active persona's traits instead of the global `traits`). The caching key already hashes the prompt contents, so per-persona prompts cache independently.

---

## 11. Frontend Changes

1. **`src/types.ts`** — add `Persona`; refactor `UserSession` (drop `personaName`/`archetype` from it; add `activePersonaId`). Optionally add `Principle`, `BehavioralRule`, `CommunicationStyle` for the full creation flow (v2).
2. **`src/App.tsx`** — replace the 9 flat `useState`s with `personas` + `activePersonaId` + derived `activePersona`; add `updateActivePersona(partial)` helper; rewrite handlers (`handleApplyReference`, `handleToggleMission`, `handleAddReflection`, `handleRecordSimulationResult`, etc.) to operate on the active persona only; recompute consistency score per active persona.
3. **`src/components/PersonaSwitcher.tsx`** (new) — prominent switcher in `Navigation` (not buried in settings): shows current persona, opens the list, switches, and links to Library/Create. Visually central.
4. **`src/components/PersonaLibraryView.tsx`** (new) — list/manage/switch.
5. **`src/components/CreatePersonaView.tsx`** (new, v1 minimal) — name + archetype + optional reference blend → seeds persona from `INITIAL_*` → sets active.
6. **`src/components/Navigation.tsx`** — add Library entry; keep 4 tabs as the active-persona workspace; host the `PersonaSwitcher`.
7. **`src/components/LoginView.tsx`** — collect email only (bootstrap first persona elsewhere); stop overloading it as the creation form.
8. **Views** (`TodayView`, `DNAEditorView`, `TrainView`, `JournalView`, `MyPersonaView`, `EvolutionView`, `ReferenceLibraryView`) — swap flat props for `activePersona.*`. Logic otherwise unchanged.

---

## 12. AI Context Changes

- Invariant: **AI requests receive only `activePersona` data.** Enforced by the fact that `App` passes `activePersona.traits` into `SimulatorView` and no other persona object is ever in scope in a workspace view.
- `SimulatorView.evaluateCustom` already builds the prompt from the `traits` argument — keep it; just ensure the argument is the active persona's traits (one-line change in `App.tsx`).
- No persona A data can influence persona B because persona B's data is never loaded into a workspace view and never serialized into a prompt. Structural isolation, not a guard you have to remember to call.

---

## 13. Data Isolation Strategy

The isolation is **structural, not procedural**:

- Per-persona data lives **inside** the persona object. There is no global traits/missions/reflections store to leak from.
- Workspace views receive **only `activePersona`**, never `personas`.
- All writes funnel through **`updateActivePersona(partial)`**, which maps over `personas` and replaces exactly one element (the active one) immutably.
- The Library is the **only** place that receives `personas`, and it only reads/selects — it never mixes their datasets into one screen.

Result: cross-contamination is impossible by construction, not by convention.

---

## 14. Migration Strategy

On app boot, detect legacy shape and wrap it:

1. If `pf_traits` (or any legacy flat key) exists **and** `pf_personas` does not:
   - Read `session.personaName`/`session.archetype`.
   - Build one seed `Persona` from the existing `pf_*` values + `INITIAL_*` templates.
   - Write `pf_personas` (array of 1) + `pf_activePersonaId` (that persona's id).
   - Delete the legacy flat keys.
2. Stamp `PF_DATA_VERSION`.
3. If migration fails, fall back to a clean seed (one default persona) and surface a console warning — never crash.
4. Rollback = `localStorage.clear()` (existing `handlePurgeData` behavior preserved).

Because the seed templates (`INITIAL_TRAITS`, `INITIAL_DAILY_MISSIONS`, …) already exist, a brand-new user simply gets one default persona created on first launch. No data loss for existing users.

---

## 15. Risks

| Risk | Mitigation |
|---|---|
| `App.tsx` is large; many handlers mutate flat globals | Funnel all writes through `updateActivePersona(partial)`; change handlers in one pass; keep view logic identical. |
| `handleApplyReference` currently mutates **global** traits + adds a **global** evolution entry | Move both onto the active persona (`blendedReferenceIds` + `traits` + `evolutionItems` inside the persona). |
| Consistency score is computed from globals | Recompute from `activePersona`'s own arrays via the existing `useMemo` (just swap inputs). |
| Reference blending is currently destructive to traits (adds modifiers permanently) | Keep behavior but scope it to the active persona; optionally snapshot pre-blend values for reversibility (v2). |
| LoginView overloaded as creation | Split: email-only login; creation moves to Library. First-run bootstraps one persona. |
| Large diff could regress views | Keep each view's internal logic unchanged; only swap prop sources. Add/keep Vitest on `types` + `geminiClient`. |

---

## 16. Minimal Implementation Plan

**Phase 0 — Types & storage (no behavior change to UI)**
- Add `Persona` to `types.ts`; trim `UserSession` to user-level + `activePersonaId`.
- Add `loadPersonas()` / `migrateLegacy()` helpers with `PF_DATA_VERSION`.

**Phase 1 — State reshape in `App.tsx` (core of the work)**
- Replace 9 flat states with `personas` + `activePersonaId` + derived `activePersona`.
- Add `updateActivePersona(partial)`; rewrite handlers to use it.
- Wire existing views with `activePersona.*` (views otherwise unchanged).
- Verify migration from legacy localStorage works.

**Phase 2 — Switcher + Library + minimal Create**
- `PersonaSwitcher` in `Navigation` (prominent, primary context).
- `PersonaLibraryView` (`'library'`): list / switch / manage.
- `CreatePersonaView` (`'persona-new'`): name + archetype + optional reference blend → seed from `INITIAL_*` → set active.

**Phase 3 — URL sync (lightweight, optional)**
- Reflect active persona as `?persona=<id>` via History API; restore on load. No router dependency.

**Phase 4 — Verify AI isolation & polish**
- Confirm `SimulatorView` receives `activePersona.traits` only; prompt cannot contain other personas.
- Add active-persona identity banner to `TodayView`.
- Visual distinction between Workspace (immersive) and Library (management).

**Deferred (v2, not required for correct architecture):**
- Full 10-step creation wizard (principles/rules/comm-style/persona-code generator).
- Nested `react-router` routes.
- Per-persona reference-blend undo.
- Aggregated overview feature (explicitly separate from the per-persona workspace).

---

### One-line mental model after this change

```
USER  →  PERSONA LIBRARY (create / manage / switch)  →  ONE ACTIVE PERSONA
     →  PERSONA WORKSPACE (live / practice / reflect / evolve)
```

Multiple personas **can** exist. Only **one** is active. Creation/management live in a separate Library. The active persona is the single source of context for every workspace view and every AI call.
