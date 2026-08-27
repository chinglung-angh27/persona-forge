---
name: project-conventions
description: Persona Forge code conventions. Invoke before editing or adding files to match existing style.
user-invocable: false
---

# Persona Forge — Conventions

- Stack: React 19 + TypeScript, Vite 6, Tailwind v4 (via `@tailwindcss/vite`), Express (server-side Gemini via `@google/genai`).
- Components: one view per file in `src/components/*View.tsx`, named exports (e.g. `export function DashboardView()`).
- Shared types live in `src/types.ts`. Do not inline duplicate types.
- Seed data in `src/data/initialData.ts`, exported as `INITIAL_*` constants; never mutate them — copy before editing.
- Path alias `@/*` → repo root (configured in tsconfig + vite). Import via `@/...` not relative `../../`.
- State: React `useState`/`useEffect`; session persisted to `localStorage` under `pf_session`.
- Icons: `lucide-react`. Animations: `motion`. Styling: Tailwind utility classes only (no CSS modules).
- Secrets: only via `.env.local`; never commit; never hardcode `GEMINI_API_KEY`.
- Lint = `tsc --noEmit` (`npm run lint`). No separate ESLint config.
