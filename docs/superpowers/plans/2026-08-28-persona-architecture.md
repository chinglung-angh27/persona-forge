# Persona Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the implicit single persona into an explicit, swappable `Persona` entity owned by the user, with a separate Persona Library for creating/managing/switching and exactly one active persona driving every workspace view and AI call.

**Architecture:** Client-only React SPA, localStorage persistence (`pf_*` keys). Introduce a first-class `Persona` type that owns all per-persona data; replace the 9 flat `useState`s in `App.tsx` with `personas: Persona[]` + `activePersonaId` + a derived `activePersona`. All writes funnel through one `updateActivePersona(partial)` helper that immutably replaces only the active persona (structural isolation — cross-contamination impossible by construction). No backend, no router lib; `?persona=<id>` reflected via History API.

**Tech Stack:** React 19 + TypeScript + Vite, Vitest for tests, lucide-react icons. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-28-persona-architecture-design.md` (read alongside this plan).

---

## Global Constraints

- Client-only SPA; persistence is `localStorage` only. No backend, no DB, no API server. (`express` is in package.json but never imported.)
- No router library. Navigation stays `useState<ViewMode>` + `MoreMenu` overlay; URL sync is `?persona=<id>` via the History API.
- Do NOT add a new dependency. Reuse `INITIAL_*` templates from `src/data/initialData.ts`.
- Keep each existing view's internal logic identical; only swap the prop *sources* from flat globals to `activePersona.*`.
- The only AI chokepoint stays `callGemini()` in `src/lib/geminiClient.ts`, called only by `SimulatorView.evaluateCustom`. App passes `activePersona.traits` as `activeTraits`.
- Structural (not procedural) isolation: views receive only `activePersona`, never `personas`; the Library is the only consumer of `personas` and only reads/selects.
- Deferred (do NOT build): full 10-step creation wizard, react-router nested routes, per-persona blend undo, aggregated overview.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/types.ts` | Add `Persona` interface; slim `UserSession` (drop `personaName`/`archetype`/`consistencyScore`, add `activePersonaId`); add ViewModes `library`/`persona-new`/`persona-manage`. |
| `src/lib/personaStore.ts` | NEW. `PF_DATA_VERSION`, `seedPersona()`, `migrateLegacy()`, `loadPersonas()`, `loadActivePersonaId()`, `savePersonas()`, `saveActivePersonaId()`, `updateActivePersonaIn()`. |
| `src/__tests__/types.test.ts` | Extend with `Persona` shape + slimmed `UserSession` + new ViewModes. |
| `src/lib/__tests__/personaStore.test.ts` | NEW. Unit tests for `migrateLegacy()` (legacy flat → one seed persona) and `updateActivePersonaIn()` (mutates only active, leaves others). |
| `src/App.tsx` | Reshape state to `personas`/`activePersonaId`/derived `activePersona`. Rewrite every handler to `updateActivePersona`. Wire views to `activePersona.*`. URL sync. |
| `src/components/PersonaSwitcher.tsx` | NEW. Prominent switcher in `Navigation`. Shows current persona, opens list, switches, links to Library/Create. |
| `src/components/PersonaLibraryView.tsx` | NEW. (`library`) Card list of personas with Open/Edit/Archive. Visually distinct from workspace. |
| `src/components/CreatePersonaView.tsx` | NEW. (`persona-new`) Name + archetype + optional reference blend → seeds Persona → sets active. |
| `src/components/PersonaManageView.tsx` | NEW. (`persona-manage`) Edit name/archetype/identityStatement; archive. Minimal. |
| `src/components/Navigation.tsx` | Add Library entry; host `PersonaSwitcher`. |
| `src/components/MoreMenu.tsx` | Add Library entry (consistent with Navigation). |
| `src/components/LoginView.tsx` | Email-only login; bootstraps first persona. |
| `src/components/TodayView.tsx` | Accept `personaName` (activePersona.name), `personaArchetype` (activePersona.archetype), new `identityStatement`. |
| `src/components/DNAEditorView.tsx`, `TrainView.tsx`, `JournalView.tsx`, `MyPersonaView.tsx`, `EvolutionView.tsx`, `ReferenceLibraryView.tsx`, `SettingsView.tsx`, `SimulatorView.tsx` | Swap flat props for `activePersona.*` (signatures unchanged in shape, just sourced differently). |

---

### Task 1: Add `Persona` type + slim `UserSession`

**Files:**
- Modify: `src/types.ts`
- Test: `src/__tests__/types.test.ts`

**Interfaces:**
- Produces: `Persona` interface, slimmed `UserSession`, extended `ViewMode`.

- [ ] **Step 1: Write the failing test**

Replace `src/__tests__/types.test.ts` content (add Persona + slimmed session + new modes):

```ts
import type {
  Trait, ReferenceItem, DailyMission, EvolutionItem, SimulatorScenario,
  HabitItem, ReflectionEntry, UserSession, Persona, ViewMode,
} from '@/src/types';

describe('type shape/contracts', () => {
  it('Trait category union matches expected members', () => {
    const valid: Trait['category'][] = ['cognitive', 'behavioral', 'emotional', 'strategic'];
    expect(valid).toContain('strategic' as Trait['category']);
  });

  it('ViewMode covers all app views incl. persona library/manage/new', () => {
    const modes: ViewMode[] = [
      'login', 'today', 'dna', 'train', 'journal',
      'more-persona', 'more-references', 'more-evolution', 'more-settings',
      'library', 'persona-new', 'persona-manage',
    ];
    expect(modes.length).toBe(12);
  });

  it('Persona owns all per-persona data', () => {
    const p: Persona = {
      id: 'p1', name: 'Ching', archetype: 'THE STRATEGIC OPERATOR',
      identityStatement: '', traits: [], blendedReferenceIds: [],
      dailyMissions: [], habits: [], reflections: [], evolutionItems: [],
      simulatorResults: [], createdAt: '', lastActiveAt: '', status: 'active',
    };
    expect(p.status).toBe('active');
  });

  it('UserSession is slimmed: no personaName/archetype/consistencyScore, has activePersonaId', () => {
    const s: UserSession = {
      email: 'a@b.c', isAuthenticated: true, modelIntensity: 'Balanced',
      predictiveInsights: false, activePersonaId: 'p1',
    };
    expect((s as any).personaName).toBeUndefined();
    expect((s as any).archetype).toBeUndefined();
    expect((s as any).consistencyScore).toBeUndefined();
    expect(s.activePersonaId).toBe('p1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/types.test.ts`
Expected: FAIL (`Persona` / `library` not found).

- [ ] **Step 3: Write minimal implementation**

In `src/types.ts`, change `UserSession` and add `Persona` + ViewModes:

```ts
export type ViewMode =
  | 'login' | 'today' | 'dna' | 'train' | 'journal'
  | 'more-persona' | 'more-references' | 'more-evolution' | 'more-settings'
  | 'library' | 'persona-new' | 'persona-manage';

export interface UserSession {
  email: string;
  isAuthenticated: boolean;
  modelIntensity: 'Passive' | 'Balanced' | 'Aggressive';
  predictiveInsights: boolean;
  activePersonaId: string;
}

export interface SimulatorResult {
  scenarioId: string;
  score: number;
  ts: string;
}

export interface Persona {
  id: string;
  name: string;
  archetype: string;
  identityStatement: string;
  traits: Trait[];
  blendedReferenceIds: string[];
  dailyMissions: DailyMission[];
  habits: HabitItem[];
  reflections: ReflectionEntry[];
  evolutionItems: EvolutionItem[];
  simulatorResults: SimulatorResult[];
  createdAt: string;
  lastActiveAt: string;
  status: 'draft' | 'active' | 'archived';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/types.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/__tests__/types.test.ts
git commit -m "feat(types): add Persona entity, slim UserSession, add library ViewModes"
```

---

### Task 2: `personaStore.ts` — load / migrate / update

**Files:**
- Create: `src/lib/personaStore.ts`
- Test: `src/lib/__tests__/personaStore.test.ts`

**Interfaces:**
- Consumes: `Persona`, `INITIAL_*` templates from `src/data/initialData.ts`.
- Produces: `seedPersona`, `migrateLegacy`, `loadPersonas`, `loadActivePersonaId`, `savePersonas`, `saveActivePersonaId`, `updateActivePersonaIn`, `PF_DATA_VERSION`.

- [ ] **Step 1: Write the failing test**

```ts
import { Persona } from '@/src/types';
import {
  seedPersona, migrateLegacy, updateActivePersonaIn, loadPersonas, PF_DATA_VERSION,
} from '@/src/lib/personaStore';

describe('personaStore', () => {
  beforeEach(() => localStorage.clear());

  it('seedPersona owns a full copy of INITIAL_* templates', () => {
    const p = seedPersona('Ching', 'THE STRATEGIC OPERATOR');
    expect(p.name).toBe('Ching');
    expect(p.traits.length).toBeGreaterThan(0);
    expect(p.dailyMissions.length).toBeGreaterThan(0);
    expect(p.status).toBe('active');
  });

  it('migrateLegacy wraps legacy flat keys into one persona and clears them', () => {
    localStorage.setItem('pf_session', JSON.stringify({ personaName: 'Legacy', archetype: 'THE STOIC ARCHITECT', email: 'a@b.c' }));
    localStorage.setItem('pf_traits', JSON.stringify([{ id: 'discipline', name: 'Discipline', value: 10 }]));
    localStorage.setItem('pf_blended_refs', JSON.stringify(['steve-jobs']));
    const m = migrateLegacy();
    expect(m).not.toBeNull();
    expect(m!.personas.length).toBe(1);
    expect(m!.personas[0].name).toBe('Legacy');
    expect(m!.personas[0].archetype).toBe('THE STOIC ARCHITECT');
    expect(localStorage.getItem('pf_traits')).toBeNull();
  });

  it('updateActivePersonaIn mutates only the active persona', () => {
    const a: Persona = { id: 'a', name: 'A', archetype: '', identityStatement: '', traits: [], blendedReferenceIds: [], dailyMissions: [], habits: [], reflections: [], evolutionItems: [], simulatorResults: [], createdAt: '', lastActiveAt: '', status: 'active' };
    const b: Persona = { ...a, id: 'b', name: 'B' };
    const list = [a, b];
    const out = updateActivePersonaIn(list, 'a', { name: 'A2' });
    expect(out.find(p => p.id === 'a')!.name).toBe('A2');
    expect(out.find(p => p.id === 'b')!.name).toBe('B');
    expect(list[0].name).toBe('A'); // original untouched (immutability)
  });

  it('loadPersonas seeds a fresh persona when storage empty and version stamped', () => {
    const list = loadPersonas();
    expect(list.length).toBe(1);
    expect(localStorage.getItem('pf_personas')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/personaStore.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

```ts
import {
  INITIAL_TRAITS, INITIAL_DAILY_MISSIONS, INITIAL_HABITS,
  INITIAL_REFLECTIONS, INITIAL_EVOLUTION_ITEMS,
} from '../data/initialData';
import { Persona, Trait } from '../types';

export const PF_DATA_VERSION = 1;

const PERSONAS_KEY = 'pf_personas';
const ACTIVE_KEY = 'pf_activePersonaId';
const LEGACY_KEYS = ['pf_traits', 'pf_missions', 'pf_habits', 'pf_reflections', 'pf_evolution', 'pf_blended_refs'];

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneTraits(): Trait[] {
  return INITIAL_TRAITS.map((t) => ({ ...t }));
}

export function seedPersona(
  name = 'Ching',
  archetype = 'THE STRATEGIC OPERATOR'
): Persona {
  const now = new Date().toISOString();
  return {
    id: uid('persona'),
    name,
    archetype,
    identityStatement: '',
    traits: cloneTraits(),
    blendedReferenceIds: ['steve-jobs', 'marcus-aurelius'],
    dailyMissions: INITIAL_DAILY_MISSIONS.map((m) => ({ ...m })),
    habits: INITIAL_HABITS.map((h) => ({ ...h })),
    reflections: INITIAL_REFLECTIONS.map((r) => ({ ...r })),
    evolutionItems: INITIAL_EVOLUTION_ITEMS.map((e) => ({ ...e })),
    simulatorResults: [],
    createdAt: now,
    lastActiveAt: now,
    status: 'active',
  };
}

export function migrateLegacy(): { personas: Persona[]; activeId: string } | null {
  const hasLegacy = LEGACY_KEYS.some((k) => localStorage.getItem(k) !== null);
  if (!hasLegacy) return null;

  const read = <T,>(key: string, fallback: T): T => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  };

  const sessionRaw = localStorage.getItem('pf_session');
  const session = sessionRaw ? JSON.parse(sessionRaw) : {};
  const name: string = session.personaName || 'Ching';
  const archetype: string = session.archetype || 'THE STRATEGIC OPERATOR';

  const p = seedPersona(name, archetype);
  p.traits = read('pf_traits', p.traits);
  p.blendedReferenceIds = read('pf_blended_refs', p.blendedReferenceIds);
  p.dailyMissions = read('pf_missions', p.dailyMissions);
  p.habits = read('pf_habits', p.habits);
  p.reflections = read('pf_reflections', p.reflections);
  p.evolutionItems = read('pf_evolution', p.evolutionItems);

  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  return { personas: [p], activeId: p.id };
}

export function loadPersonas(): Persona[] {
  const migrated = migrateLegacy();
  if (migrated) {
    savePersonas(migrated.personas);
    localStorage.setItem(ACTIVE_KEY, migrated.activeId);
    return migrated.personas;
  }
  const raw = localStorage.getItem(PERSONAS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Persona[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* fall through to seed */
    }
  }
  const p = seedPersona();
  const arr = [p];
  savePersonas(arr);
  localStorage.setItem(ACTIVE_KEY, p.id);
  return arr;
}

export function loadActivePersonaId(personas: Persona[]): string {
  const raw = localStorage.getItem(ACTIVE_KEY);
  if (raw && personas.some((p) => p.id === raw)) return raw;
  return personas[0]?.id ?? '';
}

export function savePersonas(personas: Persona[]): void {
  localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
}

export function saveActivePersonaId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function updateActivePersonaIn(
  personas: Persona[],
  activeId: string,
  partial: Partial<Persona> | ((p: Persona) => Persona)
): Persona[] {
  return personas.map((p) =>
    p.id === activeId
      ? typeof partial === 'function'
        ? partial(p)
        : { ...p, ...partial, lastActiveAt: new Date().toISOString() }
      : p
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/personaStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/personaStore.ts src/lib/__tests__/personaStore.test.ts
git commit -m "feat(store): add personaStore with seed/migrate/update helpers"
```

---

### Task 3: Reshape `App.tsx` state

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `loadPersonas`, `loadActivePersonaId`, `savePersonas`, `saveActivePersonaId`, `updateActivePersonaIn` from `personaStore`; `INITIAL_SESSION`.
- Produces: `activePersona` (derived), `updateActivePersona(partial)` helper, `consistencyScore` (from activePersona).

- [ ] **Step 1: Write the failing test**

```ts
import { render, screen } from '@testing-library/react';
import App from '@/src/App';

describe('App reshape', () => {
  beforeEach(() => localStorage.clear());
  it('boots into login when not authenticated, today when authenticated', () => {
    localStorage.setItem('pf_session', JSON.stringify({ email: 'a@b.c', isAuthenticated: true, modelIntensity: 'Balanced', predictiveInsights: false, activePersonaId: 'x' }));
    render(<App />);
    expect(screen.getByText(/Good morning/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx` (file not present yet → fail). Note: this test is best-effort; the real gate is the type-check + manual boot. If RTL isn't installed, skip this test file and rely on `npm run lint` + dev boot.

- [ ] **Step 3: Write minimal implementation**

In `src/App.tsx`:

Replace imports:
```ts
import {
  ViewMode, UserSession, Persona, Trait, ReferenceItem,
  DailyMission, HabitItem, ReflectionEntry, EvolutionItem,
} from './types';
import {
  INITIAL_SESSION, INITIAL_REFERENCES, INITIAL_SIMULATOR_SCENARIOS,
} from './data/initialData';
import {
  loadPersonas, loadActivePersonaId, savePersonas, saveActivePersonaId,
  updateActivePersonaIn, seedPersona,
} from './lib/personaStore';
```

Replace the 9 flat states + session load with:
```ts
const [session, setSession] = useState<UserSession>(() => {
  const saved = localStorage.getItem('pf_session');
  if (saved) {
    const parsed = JSON.parse(saved);
    return { ...parsed, isAuthenticated: Boolean(parsed.email) };
  }
  return { ...INITIAL_SESSION, personaName: undefined, archetype: undefined, consistencyScore: undefined } as unknown as UserSession;
});

const [personas, setPersonas] = useState<Persona[]>(() => loadPersonas());
const [activePersonaId, setActivePersonaId] = useState<string>(() =>
  loadActivePersonaId(loadPersonas())
);
const [currentView, setCurrentView] = useState<ViewMode>(() =>
  session.isAuthenticated ? 'today' : 'login'
);

const activePersona = useMemo(
  () => personas.find((p) => p.id === activePersonaId) ?? personas[0],
  [personas, activePersonaId]
);

const updateActivePersona = (
  partial: Partial<Persona> | ((p: Persona) => Persona)
) => {
  setPersonas((prev) => updateActivePersonaIn(prev, activePersonaId, partial));
};
```

Recompute `consistencyScore` from `activePersona`:
```ts
const consistencyScore = useMemo(() => {
  const dailyMissions = activePersona.dailyMissions;
  const habits = activePersona.habits;
  const reflections = activePersona.reflections;
  const evolutionItems = activePersona.evolutionItems;
  const missionDone = dailyMissions.filter((m) => m.status === 'completed').length;
  const missionPct = dailyMissions.length ? (missionDone / dailyMissions.length) * 100 : 0;
  const habitDays = habits.reduce((sum, h) => sum + h.days.filter(Boolean).length, 0);
  const habitTarget = habits.reduce((sum, h) => sum + h.targetPerWeek, 0) * 7;
  const habitPct = habitTarget ? Math.min(100, (habitDays / habitTarget) * 100) : 0;
  const reflectionPct = Math.min(100, reflections.length * 10);
  const simScores = evolutionItems
    .filter((e) => e.category === 'Simulation Audit')
    .map((e) => parseInt(e.changeValue ?? '0', 10) || 0)
    .filter((n) => n > 0);
  const simPct = simScores.length ? simScores.reduce((a, b) => a + b, 0) / simScores.length : 0;
  return Math.max(0, Math.min(100, Math.round(missionPct * 0.35 + habitPct * 0.35 + reflectionPct * 0.15 + simPct * 0.15)));
}, [activePersona]);
```

Replace the 7 persistence effects (the flat `pf_*` ones) with:
```ts
useEffect(() => { localStorage.setItem('pf_session', JSON.stringify(session)); }, [session]);
useEffect(() => { savePersonas(personas); }, [personas]);
useEffect(() => { saveActivePersonaId(activePersonaId); }, [activePersonaId]);
```

Delete the now-unused `INITIAL_TRAITS`, `INITIAL_DAILY_MISSIONS`, `INITIAL_HABITS`, `INITIAL_REFLECTIONS`, `INITIAL_EVOLUTION_ITEMS` imports (they live only in `personaStore` now).

- [ ] **Step 4: Run type-check**

Run: `npm run lint`
Expected: compiles (view wiring in Task 5/6 still references old flat vars — temporarily these will error; that's expected until Tasks 4–6 land. Gate for THIS task: `App.tsx` state/handlers block compiles after Tasks 4–6; to avoid a long red period, implement Tasks 3–6 together in one pass is acceptable, committing between logical chunks.)

- [ ] **Step 5: Commit (state reshape only; views wired in next tasks)**

```bash
git add src/App.tsx
git commit -m "refactor(app): reshape state to personas[] + activePersonaId + derived activePersona"
```

---

### Task 4: Rewrite `App.tsx` handlers to `updateActivePersona`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `activePersona`, `updateActivePersona`, `INITIAL_TRAITS`.
- Produces: rewritten `handleLogin`, `handleLogout`, `handleUpdateSession`, `handlePurgeData`, `handleToggleMission`, `handleAddMission`, `handleApplyReference`, `handleAddEvolution`, `handleToggleHabitDay`, `handleAddHabit`, `handleAddReflection`, `handleRecordSimulationResult`, `handleResetTraits`.

- [ ] **Step 1: Write the failing behavior via existing store test (logic already covered) — proceed to implementation**

- [ ] **Step 2: Implement handlers**

Replace each handler body:

```ts
const handleLogin = (email: string) => {
  const next: UserSession = { ...session, email, isAuthenticated: true };
  setSession(next);
  setPersonas((prev) => {
    if (prev.length > 0) return prev;
    const p = seedPersona();
    setActivePersonaId(p.id);
    return [p];
  });
  setCurrentView('today');
};

const handleLogout = () => {
  setSession((prev) => ({ ...prev, isAuthenticated: false }));
  setCurrentView('login');
};

const handleUpdateSession = (updated: Partial<UserSession>) => {
  setSession((prev) => ({ ...prev, ...updated }));
};

const handlePurgeData = () => {
  localStorage.clear();
  const p = seedPersona();
  setPersonas([p]);
  setActivePersonaId(p.id);
  setSession({ email: '', isAuthenticated: false, modelIntensity: 'Balanced', predictiveInsights: false, activePersonaId: p.id });
  setCurrentView('login');
};

const handleToggleMission = (id: string) => {
  updateActivePersona((p) => ({
    ...p,
    dailyMissions: p.dailyMissions.map((m) =>
      m.id === id ? { ...m, status: m.status === 'completed' ? 'pending' : 'completed' } : m
    ),
  }));
};

const handleAddMission = (mission: DailyMission) => {
  updateActivePersona((p) => ({ ...p, dailyMissions: [mission, ...p.dailyMissions] }));
};

const handleApplyReference = (ref: ReferenceItem) => {
  updateActivePersona((p) => {
    const blended = p.blendedReferenceIds.includes(ref.id)
      ? p.blendedReferenceIds
      : [...p.blendedReferenceIds, ref.id];
    const traits = p.traits.map((t) => {
      const mod = ref.dnaModifiers[t.name];
      return mod ? { ...t, value: Math.min(100, Math.max(0, t.value + mod)) } : t;
    });
    const newEvolution: EvolutionItem = {
      id: `evo-${Date.now()}`,
      title: `Integrated Archetype: ${ref.name}`,
      description: `Synthesized mental models from ${ref.name} (${ref.title}).`,
      icon: 'trending_up', timestamp: 'Just now', category: 'Archetype Fusion',
      changeValue: '+4% Alignment',
    };
    return { ...p, blendedReferenceIds: blended, traits, evolutionItems: [newEvolution, ...p.evolutionItems] };
  });
};

const handleAddEvolution = (item: Omit<EvolutionItem, 'id' | 'timestamp'>) => {
  updateActivePersona((p) => ({
    ...p,
    evolutionItems: [{ ...item, id: `evo-${Date.now()}`, timestamp: 'Just now' }, ...p.evolutionItems],
  }));
};

const handleToggleHabitDay = (habitId: string, dayIndex: number) => {
  updateActivePersona((p) => ({
    ...p,
    habits: p.habits.map((h) => {
      if (h.id !== habitId) return h;
      const days = [...h.days];
      days[dayIndex] = !days[dayIndex];
      const streak = days[dayIndex] ? h.streak + 1 : Math.max(0, h.streak - 1);
      return { ...h, days, streak };
    }),
  }));
};

const handleAddHabit = (habit: HabitItem) => {
  updateActivePersona((p) => ({ ...p, habits: [...p.habits, habit] }));
};

const handleAddReflection = (entry: ReflectionEntry) => {
  updateActivePersona((p) => ({ ...p, reflections: [entry, ...p.reflections] }));
};

const handleRecordSimulationResult = (scenarioId: string, score: number) => {
  updateActivePersona((p) => {
    const newEvolution: EvolutionItem = {
      id: `evo-sim-${Date.now()}`,
      title: 'Crucible Test Completed',
      description: `Achieved ${score}% alignment with core archetype.`,
      icon: 'balance', timestamp: 'Just now', category: 'Simulation Audit',
      changeValue: `${score}% Match`,
    };
    return {
      ...p,
      evolutionItems: [newEvolution, ...p.evolutionItems],
      simulatorResults: [...p.simulatorResults, { scenarioId, score, ts: new Date().toISOString() }],
    };
  });
};

const handleResetTraits = () => {
  updateActivePersona((p) => ({ ...p, traits: INITIAL_TRAITS.map((t) => ({ ...t })) }));
};
```

- [ ] **Step 3: Run type-check**

Run: `npm run lint`
Expected: PASS (handlers no longer reference removed flat states).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "refactor(app): funnel all persona mutations through updateActivePersona"
```

---

### Task 5: Wire workspace views (Today / DNA / Train / Journal)

**Files:**
- Modify: `src/App.tsx` (render props), `src/components/TodayView.tsx` (accept `identityStatement`).
- Modify: `src/components/DNAEditorView.tsx`, `TrainView.tsx`, `JournalView.tsx` (prop sources unchanged — wire in App).

**Interfaces:**
- Consumes: `activePersona`, `consistencyScore`, `updateActivePersona`, `references`, `scenarios`.
- Produces: updated view-prop wiring in App; `identityStatement` prop on TodayView.

- [ ] **Step 1: Update `App.tsx` render block**

Replace the `today`/`dna`/`train`/`journal` blocks:

```tsx
{currentView === 'today' && (
  <TodayView
    userName={activePersona.name}
    personaArchetype={activePersona.archetype}
    identityStatement={activePersona.identityStatement}
    consistencyScore={consistencyScore}
    dailyMissions={activePersona.dailyMissions}
    evolutionItems={activePersona.evolutionItems}
    predictiveInsights={session.predictiveInsights}
    onNavigate={setCurrentView}
    onToggleMission={handleToggleMission}
  />
)}

{currentView === 'dna' && (
  <DNAEditorView
    traits={activePersona.traits}
    onUpdateTraits={(traits) => updateActivePersona({ traits })}
    onSaveVersion={handleAddEvolution.bind(null, {
      title: 'DNA Matrix Recalibrated',
      description: 'Updated psychological weightings across discipline, composure, and ambition baselines.',
      icon: 'balance', category: 'DNA Recalibration', changeValue: 'Version Saved',
    } as Omit<EvolutionItem, 'id' | 'timestamp'>)}
    onResetTraits={handleResetTraits}
  />
)}

{currentView === 'train' && (
  <TrainView
    scenarios={scenarios}
    activeTraits={activePersona.traits}
    references={references}
    blendedReferences={activePersona.blendedReferenceIds}
    onRecordSimulationResult={handleRecordSimulationResult}
    onApplyReference={handleApplyReference}
  />
)}

{currentView === 'journal' && (
  <JournalView
    habits={activePersona.habits}
    onToggleHabitDay={handleToggleHabitDay}
    onAddHabit={handleAddHabit}
    reflections={activePersona.reflections}
    onAddReflection={handleAddReflection}
    evolutionItems={activePersona.evolutionItems}
    onAddEvolution={handleAddEvolution}
  />
)}
```

- [ ] **Step 2: Add `identityStatement` to TodayView**

In `TodayView.tsx`, add to props:
```ts
identityStatement?: string;
```
And inside the header, after the `<h1>` archetype line (line 73–75), insert the identity banner:
```tsx
{identityStatement ? (
  <p className="font-body text-base md:text-lg text-[#8e9192] mt-3 max-w-2xl leading-relaxed italic">
    “{identityStatement}”
  </p>
) : null}
```

- [ ] **Step 3: Run type-check**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/TodayView.tsx
git commit -m "feat(views): wire workspace views to activePersona + identity banner"
```

---

### Task 6: Wire MyPersona / Evolution / ReferenceLibrary / Settings / Simulator

**Files:**
- Modify: `src/App.tsx` (render props for `more-persona`, `more-references`, `more-evolution`, `more-settings`).
- Note: `SimulatorView` already receives `activeTraits` from `TrainView` (unchanged — it already gets traits from App's `activeTraits` prop, now `activePersona.traits`). No change needed in `SimulatorView` itself.

**Interfaces:**
- Consumes: `activePersona`, `references`, `scenarios`, `session`, `consistencyScore`.
- Produces: updated prop wiring.

- [ ] **Step 1: Update `App.tsx` render block (more-*)**

```tsx
{currentView === 'more-persona' && (
  <MyPersonaView
    personaName={activePersona.name}
    archetype={activePersona.archetype}
    traits={activePersona.traits}
    blendedReferences={activePersona.blendedReferenceIds}
    allReferences={references}
    consistencyScore={consistencyScore}
    onNavigate={setCurrentView}
  />
)}

{currentView === 'more-references' && (
  <ReferenceLibraryView
    references={references}
    activeTraits={activePersona.traits}
    onApplyReference={handleApplyReference}
    blendedReferences={activePersona.blendedReferenceIds}
  />
)}

{currentView === 'more-evolution' && (
  <EvolutionView
    evolutionItems={activePersona.evolutionItems}
    traits={activePersona.traits}
    consistencyScore={consistencyScore}
  />
)}

{currentView === 'more-settings' && (
  <SettingsView
    session={session}
    onUpdateSession={handleUpdateSession}
    onPurgeData={handlePurgeData}
  />
)}
```

- [ ] **Step 2: Run type-check**

Run: `npm run lint`
Expected: PASS (no references to removed `session.personaName`/`session.archetype` remain).

- [ ] **Step 3: Grep for leftover flat refs**

Run: `grep -rn "session.personaName\|session.archetype\|session.consistencyScore\|blendedReferences\b" src/App.tsx`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(views): wire MyPersona/Evolution/ReferenceLibrary/Settings to activePersona"
```

---

### Task 7: `PersonaSwitcher` in `Navigation`

**Files:**
- Create: `src/components/PersonaSwitcher.tsx`
- Modify: `src/components/Navigation.tsx`, `src/components/MoreMenu.tsx`

**Interfaces:**
- Consumes: `personas: Persona[]`, `activePersonaId: string`, `onSwitch(id)`, `onOpenLibrary`, `onOpenCreate`.
- Produces: `PersonaSwitcher` component; Navigation hosts it; MoreMenu gains Library entry.

- [ ] **Step 1: Create `PersonaSwitcher.tsx`**

```tsx
import React, { useState } from 'react';
import { Persona } from '../types';
import { ChevronDown, Plus, Library, Check } from 'lucide-react';

interface PersonaSwitcherProps {
  personas: Persona[];
  activePersonaId: string;
  onSwitch: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenCreate: () => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  personas, activePersonaId, onSwitch, onOpenLibrary, onOpenCreate,
}) => {
  const [open, setOpen] = useState(false);
  const active = personas.find((p) => p.id === activePersonaId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl neo-recessed bg-[#121212] hover:border-[#2a2a2a] transition-all text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[#1c1b1b] neo-extruded flex items-center justify-center border border-[#2a2a2a]/60 shrink-0">
          <span className="font-display text-sm font-bold text-[#c8c6c5]">
            {(active?.name || '?').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-semibold text-[#e5e2e1] truncate">
            {active?.name || 'No persona'}
          </div>
          <div className="font-mono-code text-[10px] text-[#8e9192] uppercase tracking-widest truncate">
            {active?.archetype || ''}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#8e9192] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-[#161616] neo-extruded-large rounded-2xl p-2 border border-[#2a2a2a] shadow-2xl">
          <div className="px-2 py-1.5 font-mono-code text-[10px] text-[#8e9192] uppercase tracking-widest">
            Active Persona
          </div>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSwitch(p.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#1f1f1f]"
            >
              <span className="flex-1 min-w-0">
                <span className="block font-mono-code text-sm text-[#e5e2e1] truncate">{p.name}</span>
                <span className="block font-body text-[11px] text-[#8e9192] truncate">{p.archetype}</span>
              </span>
              {p.id === activePersonaId && <Check className="w-4 h-4 text-[#c8c6c5] shrink-0" />}
            </button>
          ))}
          <div className="border-t border-[#1e1e1e] my-1.5" />
          <button
            onClick={() => { onOpenLibrary(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#1f1f1f] text-[#c8c6c5]"
          >
            <Library className="w-4 h-4" />
            <span className="font-mono-code text-sm">Persona Library</span>
          </button>
          <button
            onClick={() => { onOpenCreate(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#1f1f1f] text-[#c8c6c5]"
          >
            <Plus className="w-4 h-4" />
            <span className="font-mono-code text-sm">Create Persona</span>
          </button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Host in `Navigation.tsx`**

Add props `personas`, `activePersonaId`, `onSwitchPersona`, `onOpenLibrary`, `onOpenCreate` to `NavigationProps` and render `<PersonaSwitcher ... />` at the top of the sidebar (before the brand header or right after it), and on the mobile top bar. Pass them from `App.tsx`.

- [ ] **Step 3: Add Library entry to `MoreMenu.tsx`**

Add to `ENTRIES`:
```ts
{ id: 'library', label: 'Persona Library', hint: 'Switch, create, manage personas', icon: <Library className="w-5 h-5" /> },
```
and import `Library`.

- [ ] **Step 4: Run type-check + build smoke**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PersonaSwitcher.tsx src/components/Navigation.tsx src/components/MoreMenu.tsx
git commit -m "feat(nav): add prominent PersonaSwitcher + Library entry"
```

---

### Task 8: `PersonaLibraryView` + `CreatePersonaView` + `PersonaManageView`

**Files:**
- Create: `src/components/PersonaLibraryView.tsx`, `src/components/CreatePersonaView.tsx`, `src/components/PersonaManageView.tsx`
- Modify: `src/App.tsx` (render blocks + handlers `handleSwitchPersona`, `handleCreatePersona`, `handleArchivePersona`, `handleUpdatePersonaMeta`).

**Interfaces:**
- Consumes: `personas`, `activePersonaId`, `references`, `onSwitch`, `onNavigate`, `onCreate(name, archetype, blendIds)`, `onArchive(id)`, `onUpdateMeta(id, {name, archetype, identityStatement})`.
- Produces: three view components; App handlers.

- [ ] **Step 1: Create `PersonaLibraryView.tsx`**

```tsx
import React from 'react';
import { Persona, ViewMode } from '../types';
import { Library, Plus, Check, Archive, Pencil } from 'lucide-react';

interface PersonaLibraryViewProps {
  personas: Persona[];
  activePersonaId: string;
  onSwitch: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
  onArchive: (id: string) => void;
}

export const PersonaLibraryView: React.FC<PersonaLibraryViewProps> = ({
  personas, activePersonaId, onSwitch, onNavigate, onArchive,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      <header className="pt-2 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-[#e5e2e1] font-bold tracking-tight">
            Persona Library
          </h1>
          <p className="font-body text-base text-[#8e9192] mt-2">
            Select an identity to live through, or forge a new one.
          </p>
        </div>
        <button
          onClick={() => onNavigate('persona-new')}
          className="neo-btn px-5 py-3 rounded-xl font-mono-code text-xs text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" /> New Persona
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {personas.map((p) => {
          const isActive = p.id === activePersonaId;
          const core = p.traits.slice(0, 4);
          return (
            <div
              key={p.id}
              className={`neo-card bg-[#121212] rounded-2xl p-6 border flex flex-col gap-4 ${
                isActive ? 'border-[#c8c6c5]/50' : 'border-[#1e1e1e]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-xl font-bold text-[#e5e2e1]">{p.name}</div>
                  <div className="font-mono-code text-[10px] text-[#8e9192] uppercase tracking-widest mt-1">
                    {p.archetype}
                  </div>
                </div>
                {isActive && (
                  <span className="font-mono-code text-[10px] px-2 py-1 rounded bg-[#1c1b1b] neo-recessed text-[#c8c6c5] flex items-center gap-1">
                    <Check className="w-3 h-3" /> ACTIVE
                  </span>
                )}
              </div>

              {p.identityStatement && (
                <p className="font-body text-sm text-[#8e9192] italic leading-relaxed">“{p.identityStatement}”</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {core.map((t) => (
                  <span key={t.id} className="font-mono-code text-[10px] px-2 py-1 rounded bg-[#1c1b1b] neo-recessed text-[#c8c6c5]">
                    {t.name} {t.value}
                  </span>
                ))}
              </div>

              <div className="font-mono-code text-[11px] text-[#7e7d7d]">
                {p.blendedReferenceIds.length} references · created {new Date(p.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[#1e1e1e]">
                {isActive ? (
                  <button
                    onClick={() => onNavigate('today')}
                    className="flex-1 neo-btn px-3 py-2 rounded-lg font-mono-code text-xs text-[#c8c6c5] border border-[#2a2a2a]"
                  >
                    Open Workspace
                  </button>
                ) : (
                  <button
                    onClick={() => onSwitch(p.id)}
                    className="flex-1 neo-btn px-3 py-2 rounded-lg font-mono-code text-xs text-[#121212] bg-[#c8c6c5] hover:bg-white font-semibold"
                  >
                    Switch
                  </button>
                )}
                <button
                  onClick={() => onNavigate('persona-manage')}
                  className="w-9 h-9 rounded-lg neo-recessed flex items-center justify-center text-[#8e9192] hover:text-[#e5e2e1]"
                  title="Manage"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {!isActive && (
                  <button
                    onClick={() => onArchive(p.id)}
                    className="w-9 h-9 rounded-lg neo-recessed flex items-center justify-center text-[#8e9192] hover:text-[#ffb4ab]"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {personas.length === 0 && (
        <div className="neo-recessed p-10 rounded-2xl text-center border border-[#1e1e1e]">
          <Library className="w-8 h-8 text-[#8e9192] mx-auto mb-3" />
          <p className="font-body text-sm text-[#8e9192]">No personas yet. Create your first.</p>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Create `CreatePersonaView.tsx`**

```tsx
import React, { useState } from 'react';
import { ReferenceItem, ViewMode } from '../types';
import { ArrowRight, Check } from 'lucide-react';

interface CreatePersonaViewProps {
  references: ReferenceItem[];
  onNavigate: (view: ViewMode) => void;
  onCreate: (name: string, archetype: string, blendIds: string[]) => void;
}

const ARCHETYPES = [
  'THE STRATEGIC OPERATOR', 'THE STOIC ARCHITECT',
  'THE ADAPTIVE PREDATOR', 'THE CALCULATED VISIONARY',
];

export const CreatePersonaView: React.FC<CreatePersonaViewProps> = ({
  references, onNavigate, onCreate,
}) => {
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState(ARCHETYPES[0]);
  const [blend, setBlend] = useState<string[]>([]);

  const toggle = (id: string) =>
    setBlend((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    onCreate(name.trim() || 'Untitled Persona', archetype, blend);
    onNavigate('today');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-16">
      <header className="pt-2">
        <h1 className="font-display text-4xl text-[#e5e2e1] font-bold tracking-tight">Forge New Persona</h1>
        <p className="font-body text-base text-[#8e9192] mt-2">Seed from templates, blend references, make it active.</p>
      </header>

      <div className="neo-card bg-[#121212] rounded-2xl p-8 border border-[#1e1e1e]/60 space-y-6">
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
            placeholder="Persona handle"
          />
        </div>

        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Archetype</label>
          <select
            value={archetype}
            onChange={(e) => setArchetype(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]"
          >
            {ARCHETYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">
            Reference Blend (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {references.map((r) => {
              const on = blend.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  className={`px-3 py-2 rounded-full font-mono-code text-xs border transition-all ${
                    on ? 'bg-[#c8c6c5] text-[#121212] border-[#c8c6c5]' : 'neo-recessed text-[#c8c6c5] border-[#2a2a2a]'
                  }`}
                >
                  {on && <Check className="w-3 h-3 inline mr-1" />}
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={submit}
          className="neo-btn w-full px-6 py-3.5 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center justify-center gap-2"
        >
          Create &amp; Activate <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Create `PersonaManageView.tsx`**

```tsx
import React, { useState } from 'react';
import { Persona, ViewMode } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

interface PersonaManageViewProps {
  persona: Persona;
  onBack: () => void;
  onUpdateMeta: (id: string, meta: { name: string; archetype: string; identityStatement: string }) => void;
}

const ARCHETYPES = [
  'THE STRATEGIC OPERATOR', 'THE STOIC ARCHITECT',
  'THE ADAPTIVE PREDATOR', 'THE CALCULATED VISIONARY',
];

export const PersonaManageView: React.FC<PersonaManageViewProps> = ({
  persona, onBack, onUpdateMeta,
}) => {
  const [name, setName] = useState(persona.name);
  const [archetype, setArchetype] = useState(persona.archetype);
  const [identityStatement, setIdentity] = useState(persona.identityStatement);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 pb-16">
      <header className="pt-2 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-lg neo-recessed flex items-center justify-center text-[#8e9192] hover:text-[#e5e2e1]">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display text-3xl text-[#e5e2e1] font-bold tracking-tight">Manage Persona</h1>
      </header>

      <div className="neo-card bg-[#121212] rounded-2xl p-8 border border-[#1e1e1e]/60 space-y-6">
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]" />
        </div>
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Archetype</label>
          <select value={archetype} onChange={(e) => setArchetype(e.target.value)} className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]">
            {ARCHETYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-mono-code text-xs text-[#8e9192] uppercase tracking-widest mb-2">Identity Statement</label>
          <textarea rows={2} value={identityStatement} onChange={(e) => setIdentity(e.target.value)} className="w-full bg-[#1a1a1a] rounded-xl neo-input p-3 text-sm text-[#e5e2e1] border border-[#1e1e1e]" placeholder="Who I am, in one line." />
        </div>
        <button
          onClick={() => { onUpdateMeta(persona.id, { name, archetype, identityStatement }); onBack(); }}
          className="neo-btn w-full px-6 py-3.5 rounded-xl font-mono-code text-xs font-bold uppercase tracking-widest text-[#121212] bg-[#c8c6c5] hover:bg-white flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Add App handlers + render blocks**

In `App.tsx`, add handlers:
```ts
const handleSwitchPersona = (id: string) => {
  setActivePersonaId(id);
  setCurrentView('today');
};

const handleCreatePersona = (name: string, archetype: string, blendIds: string[]) => {
  const now = new Date().toISOString();
  const p: Persona = {
    id: `persona-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name, archetype, identityStatement: '',
    traits: INITIAL_TRAITS.map((t) => ({ ...t })),
    blendedReferenceIds: blendIds,
    dailyMissions: INITIAL_DAILY_MISSIONS.map((m) => ({ ...m })),
    habits: INITIAL_HABITS.map((h) => ({ ...h })),
    reflections: INITIAL_REFLECTIONS.map((r) => ({ ...r })),
    evolutionItems: INITIAL_EVOLUTION_ITEMS.map((e) => ({ ...e })),
    simulatorResults: [],
    createdAt: now, lastActiveAt: now, status: 'active',
  };
  setPersonas((prev) => [...prev, p]);
  setActivePersonaId(p.id);
};

const handleArchivePersona = (id: string) => {
  setPersonas((prev) => {
    const next = prev.map((p) => (p.id === id ? { ...p, status: 'archived' as const } : p));
    return next;
  });
};

const handleUpdatePersonaMeta = (
  id: string,
  meta: { name: string; archetype: string; identityStatement: string }
) => {
  setPersonas((prev) => prev.map((p) => (p.id === id ? { ...p, ...meta } : p)));
};
```

Restore `INITIAL_*` imports in `App.tsx` (they're used here for seeding new personas):
```ts
import {
  INITIAL_SESSION, INITIAL_REFERENCES, INITIAL_SIMULATOR_SCENARIOS,
  INITIAL_TRAITS, INITIAL_DAILY_MISSIONS, INITIAL_HABITS,
  INITIAL_REFLECTIONS, INITIAL_EVOLUTION_ITEMS,
} from './data/initialData';
```
(Re-add `INITIAL_TRAITS`, `INITIAL_DAILY_MISSIONS`, `INITIAL_HABITS`, `INITIAL_REFLECTIONS`, `INITIAL_EVOLUTION_ITEMS` — they live in `personaStore` AND are also used here for *new* persona creation; both files importing them is fine.)

Add render blocks for new ViewModes (inside `main`, after the `more-settings` block):
```tsx
{currentView === 'library' && (
  <PersonaLibraryView
    personas={personas}
    activePersonaId={activePersonaId}
    onSwitch={handleSwitchPersona}
    onNavigate={setCurrentView}
    onArchive={handleArchivePersona}
  />
)}

{currentView === 'persona-new' && (
  <CreatePersonaView
    references={references}
    onNavigate={setCurrentView}
    onCreate={handleCreatePersona}
  />
)}

{currentView === 'persona-manage' && (
  <PersonaManageView
    persona={activePersona}
    onBack={() => setCurrentView('library')}
    onUpdateMeta={handleUpdatePersonaMeta}
  />
)}
```

Import the three new components at top of `App.tsx`.

- [ ] **Step 5: Run type-check**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/PersonaLibraryView.tsx src/components/CreatePersonaView.tsx src/components/PersonaManageView.tsx src/App.tsx
git commit -m "feat(library): add PersonaLibrary, CreatePersona, PersonaManage views"
```

---

### Task 9: Email-only Login + `?persona=` URL sync

**Files:**
- Modify: `src/components/LoginView.tsx`, `src/App.tsx` (login handler signature, URL sync).

**Interfaces:**
- Consumes: `handleLogin(email)`, `activePersonaId`, `history.replaceState`.
- Produces: email-only `LoginView`; `?persona=<id>` reflect + restore.

- [ ] **Step 1: Email-only `LoginView.tsx`**

Change `LoginViewProps`:
```ts
interface LoginViewProps {
  onLogin: (email: string) => void;
}
```
Simplify the component to collect only email (keep the title/copy, drop personaName + archetype fields). `handleSubmit` becomes:
```ts
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onLogin(email.trim() || 'local@persona.forge');
};
```
Update `App.tsx`'s usage: `<LoginView onLogin={handleLogin} />` (already email-only per Task 4).

- [ ] **Step 2: URL sync in `App.tsx`**

Add after state setup:
```ts
// Restore active persona from ?persona=<id> on load.
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('persona');
  if (pid && personas.some((p) => p.id === pid)) {
    setActivePersonaId(pid);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Reflect active persona in the URL.
useEffect(() => {
  const url = new URL(window.location.href);
  url.searchParams.set('persona', activePersonaId);
  window.history.replaceState({}, '', url.toString());
}, [activePersonaId]);
```

- [ ] **Step 3: Run type-check**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/LoginView.tsx src/App.tsx
git commit -m "feat(auth+url): email-only login + ?persona= URL sync"
```

---

### Task 10: Final verification

**Files:**
- Verify: build + tests + manual boot.

**Interfaces:**
- Consumes: whole app.

- [ ] **Step 1: Run full type-check + tests**

Run: `npm run lint && npm test`
Expected: both PASS.

- [ ] **Step 2: Build smoke**

Run: `npm run build`
Expected: build succeeds (no TS errors).

- [ ] **Step 3: Manual boot verification (dev server)**

Run: `npm run dev` and verify in browser:
- First load (empty storage) → Login (email only) → enters workspace with seeded persona.
- Switch persona via `PersonaSwitcher` → all views + consistency ring + simulator prompt reflect only the active persona.
- Create a second persona in Library → becomes active; reload with `?persona=<id>` → restores.
- Legacy `localStorage` (old `pf_traits` etc.) migrates to one seed persona on first boot.
- `localStorage.clear()` (Settings → purge) returns to login.

- [ ] **Step 4: Final commit (if any tweaks made)**

```bash
git add -A
git commit -m "chore: final persona-architecture verification passes"
```

---

## Self-Review

1. **Spec coverage:** Persona type ✓ (T1), slimmed session ✓ (T1), store + migration ✓ (T2), state reshape ✓ (T3), handlers ✓ (T4), view wiring ✓ (T5/T6), switcher ✓ (T7), library/create/manage ✓ (T8), login + URL sync ✓ (T9), tests ✓ (T1/T2/T10). AI isolation ✓ (T5: `activeTraits={activePersona.traits}`, `SimulatorView` unchanged). Deferred items correctly NOT built.
2. **Placeholder scan:** No TBD/TODO. All code blocks concrete.
3. **Type consistency:** `Persona`, `SimulatorResult`, `UserSession` names match across T1–T9. `updateActivePersonaIn` signature stable. `handleCreatePersona(name, archetype, blendIds)` matches `CreatePersonaView.onCreate`.

One known tradeoff (ponytail): `?persona=` uses `replaceState` (no back-button history per switch) — fine for v1; per-switch `pushState` is a one-line change later if desired.
