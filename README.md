<div align="center">
  <img src="public/pf-logo-512.png" alt="Persona Forge logo" width="120" />
  <h1>Persona Forge</h1>
  <p><strong>Design an identity. Forge it under pressure. Execute it daily.</strong></p>
  <p>
    <a href="https://persona-forge-chinglung-angh27s-projects.vercel.app"><strong>Live Demo</strong></a>
  </p>
</div>

Persona Forge is a psychological evolution engine for building and training AI personas — and, through them, yourself. Pick an archetype, calibrate a six-trait DNA matrix, fuse in the mental models of history's greats, then pressure-test the result in branching simulations and multi-agent debates. A daily operating system of missions, habits, and reflections turns the persona from concept into conduct, scored every day by a consistency engine.

Everything runs client-side. Your data lives in your browser, not on a server.

---

## The core loop

```
CREATE  →  CALIBRATE  →  PRESSURE-TEST  →  EXECUTE  →  EVOLVE
Persona     DNA            Simulations      Missions     Consistency
archetype   matrix         + AI debates     habits       score + timeline
                           scenarios       reflections
```

1. **Create** a persona from one of four archetypes — *The Strategic Operator*, *The Stoic Architect*, *The Adaptive Predator*, *The Calculated Visionary* — or blend your own.
2. **Calibrate** six DNA traits (Discipline, Confidence, Charisma, Creativity, Ambition, Composure), each 0–100 across cognitive, behavioral, emotional, and strategic categories.
3. **Pressure-test** decisions in unlockable training scenarios, or unleash four AI agents to debate your persona's response from opposing angles.
4. **Execute** daily missions, weekly habits, and guided reflections.
5. **Evolve** — every action feeds a consistency score and a living evolution timeline.

---

## Features

### Personas & Archetypes
- Multiple switchable personas with draft / active / archived lifecycle.
- Four built-in archetypes plus freeform identity statements.
- Persona library with create, manage, archive, and purge flows.
- Shareable personas via `?persona=` links — copy a URL and anyone opening it loads that persona.

### DNA Matrix Editor
- Six traits with tactile 0–100 calibration, versioned saves, and one-click reset.
- Every recalibration is recorded in the evolution timeline ("DNA Matrix Recalibrated").

### Training Simulator
- Branching scenarios (Standard / Elevated / Critical stakes) with trait-weighted options, alignment scores, and written feedback per choice.
- **Unlock chain:** score 70+ to unlock the next scenario.
- **Scenario Creator:** author your own dilemmas with custom options and trait weights.
- **Multi-agent simulation:** four agents — Strategist, Antagonist, Analyst, Synthesizer — run an explore → debate (2 rounds) → verify → synthesize pipeline against your persona's DNA, with strict schema-validated outputs and a final verdict plus alignment score.

### Reference Library & Archetype Fusion
- A library of great minds across Tech Visionaries, Athletes, Fictional, Historical, and Philosophers — Jobs, Ronaldo, Marcus Aurelius, Da Vinci, Alexander the Great, Sherlock Holmes, and more.
- Applying a reference fuses its DNA modifiers into your traits and logs an "Archetype Fusion" evolution event.
- Full CRUD: add, edit, and delete your own references.

### Today Dashboard
- **Consistency score (0–100):** missions 35% · habits 35% · reflections 15% · simulation audits 15%.
- Daily missions with XP values and urgency flags, evolution timeline, and optional AI predictive insights.

### Journal, Habits & Streaks
- Weekly habits with per-day tracking, streak counts, and streak analytics.
- Reflections with prompts, sentiment tags (constructive / stoic / breakthrough / neutral), and AI-generated reflection prompts.
- A chronological evolution log of everything your persona has been through.

### Local-first & Installable
- No backend, no database, no account server — all state persists in `localStorage` (with automatic migration from legacy keys).
- Email-only local login, per-persona data isolation.
- Progressive Web App: installable, offline-capable via service worker, custom icons and theme.
- Android wrapper (`twa/`) for Trusted Web Activity builds.

---

## How the AI works

All language-model calls go through a single chokepoint (`src/lib/openrouterClient.ts`) backed by [OpenRouter](https://openrouter.ai) (default model: `openai/gpt-4o-mini`, swappable — see `.env.example`):

- **Prompt caching** in `localStorage` — repeat prompts cost zero requests.
- **Retry with exponential backoff + jitter**, request timeouts, and typed errors.
- **Circuit breaker** — fails fast after 5 consecutive upstream failures, recovers after 30s.
- **Mock mode** (`PF_MOCK_LLM=1`) — deterministic offline responses so the full test suite never touches the network.
- Without an API key the app runs fully; AI features report themselves unavailable instead of breaking.

---

## Tech stack

| Layer      | Choice                                                        |
|------------|---------------------------------------------------------------|
| UI         | React 19, Tailwind CSS 4, Motion, lucide-react                |
| Build      | Vite 6, TypeScript 5, path alias `@`                          |
| AI         | OpenRouter (`openai/gpt-4o-mini`), Zod-validated outputs      |
| State      | React hooks + `localStorage` (no backend)                     |
| Testing    | Vitest (unit + client-intercepted LLM tests)                  |
| PWA        | Web manifest + service worker, TWA Android shell              |
| Deploy     | Vercel (preview + production)                                 |

Dark "obsidian tactile" theme throughout — Epilogue / IBM Plex Sans / JetBrains Mono — with a desktop sidebar and mobile bottom-dock navigation.

---

## Getting started

**Prerequisites:** Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional but unlocks AI features)
cp .env.example .env
# Get a free key at https://openrouter.ai/keys, then set:
#   VITE_OPENROUTER_API_KEY="sk-or-v1-..."
#   VITE_APP_URL="http://localhost:3000"

# 3. Run the app
npm run dev        # → http://localhost:3000
```

| Script          | What it does                              |
|-----------------|-------------------------------------------|
| `npm run dev`   | Start Vite dev server                     |
| `npm run build` | Production build to `dist/`               |
| `npm run preview` | Preview the production build locally    |
| `npm test`      | Run the Vitest suite (fully offline)      |
| `npm run lint`  | Type-check with `tsc --noEmit`            |

### Environment variables

| Variable                  | Required | Purpose                                              |
|---------------------------|----------|------------------------------------------------------|
| `VITE_OPENROUTER_API_KEY` | For AI   | OpenRouter key — enables debates, insights, reflections |
| `VITE_APP_URL`            | No       | Sent as `HTTP-Referer` for OpenRouter rankings       |

> Vite inlines `VITE_*` variables at **build** time. If you add the key to Vercel after deploying, redeploy so it gets baked in.

---

## Project structure

```
src/
├── App.tsx                  # View routing + cross-cutting handlers
├── types.ts                 # Persona, Trait, Scenario, Habit… domain model
├── data/initialData.ts      # Seed traits, missions, references, scenarios
├── hooks/                   # useSession, usePersona, useSimulation,
│                            # useJournal, useNavigation, useReferenceLibrary
├── components/
│   ├── TodayView.tsx        # Dashboard + consistency score
│   ├── DNAEditorView.tsx    # Trait calibration
│   ├── TrainView.tsx        # Scenario simulator + unlock chain
│   ├── MultiAgentSimulator.tsx  # 4-agent debate pipeline UI
│   ├── ScenarioCreator.tsx  # Author custom dilemmas
│   ├── ReferenceLibraryView.tsx + ReferenceEditorView.tsx
│   ├── JournalView.tsx      # Habits, reflections, evolution log
│   ├── StreakAnalytics.tsx  # Habit streak insights
│   ├── PersonaLibraryView.tsx / CreatePersonaView.tsx / PersonaManageView.tsx
│   ├── Navigation.tsx / MoreMenu.tsx / SettingsView.tsx / LoginView.tsx
│   └── ui/                  # Shared primitives (calendar, …)
└── lib/
    ├── openrouterClient.ts  # Single LLM chokepoint (cache/retry/circuit)
    ├── multiAgent.ts        # Debate engine + Zod schemas
    ├── personaStore.ts      # localStorage persistence + migration
    ├── journalDates.ts      # Habit/mission date normalization
    └── sw-register.ts       # Service worker registration
```

---

## Privacy

There is no server component. Personas, journals, habits, and settings never leave your device except for the LLM prompts you explicitly trigger (sent to OpenRouter) — and prompt caching means repeats don't even do that. Deleting browser storage, or purging data in Settings, wipes everything.

## Roadmap

- Persona vs. persona sparring in the multi-agent arena
- Spaced-repetition reflection reviews
- Export / import personas as portable JSON
- Server-synced accounts (opt-in, keeping local-first default)

---

Issues and pull requests are welcome. If Persona Forge helped you think sharper, share your persona link and your consistency score.
