---
name: accessibility
description: Run automated (axe) + manual (keyboard, reduced-motion, screen-reader-naming) accessibility checks and fix violations. A11y failures are P1.
when_to_use:
  - after any UI change; before declaring a direction mature
outputs:
  - axe results, keyboard-journey result, contrast checks, remediations
related:
  - .ai/prompts/accessibility-reviewer.md
  - .ai/skills/playwright-review/SKILL.md
  - docs/design-lab/15-TECHNICAL-DIRECTION.md
---

# Skill: Accessibility

Designed in, not patched on. Violations are **P1** — fix before aesthetic polish.

## Automated (axe via Playwright)
```bash
# after app + playwright exist:
pnpm test:a11y   # runs @axe-core/playwright over each route
```
Assert **0 serious/critical** violations. For each violation: record rule id + node + fix. Don't
suppress a rule to pass — fix the markup.

## Manual-through-automation
- **Keyboard journey:** Tab through the whole page. Verify logical order, **visible focus** (signal/
  ice ring against `ink`), Enter/Space activate, Esc closes, Arrow keys where applicable, **no traps**,
  focus restored after dialogs/menus.
- **Reduced motion:** emulate `prefers-reduced-motion: reduce` → page fully usable, no parallax/
  scroll-hijack/large motion; content coherent.
- **Screen-reader naming:** every control has an accessible name; icon-only controls labeled; images
  have honest `alt` describing the work (decorative → `alt=""`).

## Contrast
Verify real text/background pairs: body ≥ **4.5:1**, large/UI ≥ **3:1** on near-black surfaces
(`docs/07`). Adjust the value ladder, never the standard. Never convey meaning by color alone.

## Structure
One logical `h1`, correct heading order, landmarks (`header/nav/main/footer`), lists/sections proper,
form labels tied to inputs, no duplicate IDs.

## Done when
- axe: 0 serious/critical unresolved (or each documented with a real reason).
- Keyboard journey passes; focus always visible; no traps.
- Reduced-motion path coherent; contrast pairs meet AA; alt text honest.
- Results recorded in `docs/design-lab/17-QUALITY-LOG.md`.
