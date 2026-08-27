---
name: app-roast
description: Brutally honest product critique of an app — idea merit, per-feature pros/cons, and a cut/keep/improve list. Grounded in actual code, no fluff.
disable-model-invocation: true
---

# app-roast

User wants a no-BS assessment of an app: is the core idea sound, what each feature
actually does vs claims, and what to cut / keep / improve.

## Rules
- READ the real code first (types, components, data). Never critique from the README or vibes.
- Separate the *shell* (UI, structure) from the *core* (does it actually compute/do what it claims?).
- For each feature: state what it CLAIMS, what the code ACTUALLY does, then PROS / CONS.
- Call out theater: hardcoded values presented as computed, auth that gates nothing, flags/booleans that do nothing, dead config.
- End with a ranked IMPROVE list (do-first = highest payoff) and a CUT list (remove or it's lying).
- No praise padding. No "great job". Brutal but specific and actionable.

## Output format
```
## Brutal Honesty: <app name>
### The idea — <one-line verdict>
<2-4 sentences on whether the core concept holds>

### Per-feature
- **<feature>**: claims X / actually Y
  - PRO: ...
  - CON: ...

### Keep / Improve / Cut
- KEEP: ...
- IMPROVE (ranked): 1. ... 2. ...
- CUT: ...
```
