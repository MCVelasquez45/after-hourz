---
name: playwright-review
description: Drive the app with Playwright across Chromium/Firefox/WebKit to capture screenshots, verify interactions/keyboard/hover/scroll, and collect console + network errors. The engine behind visual, responsive, a11y, and console QA.
when_to_use:
  - any browser-level verification (screenshots, interactions, console/network health)
outputs:
  - per-browser/per-viewport screenshots, interaction results, console+network logs
related:
  - .ai/skills/visual-qa/SKILL.md
  - .ai/skills/responsive-review/SKILL.md
  - .ai/skills/accessibility/SKILL.md
  - docs/design-lab/16-QA-QUALITY-SYSTEM.md
---

# Skill: Playwright Review

Playwright is the single tool for cross-browser rendering, interaction, screenshots, visual
regression, and console/network capture (chosen in `docs/16`; see `.ai/decisions/`).

> **Status:** Playwright is specified but **not yet installed** (no app to test yet). When the app is
> scaffolded, install per the QA spec, then this skill becomes runnable. Until then, treat this as the
> procedure to wire up.

## Setup (when the app exists)
```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install --with-deps
```
Config: 3 projects (Chromium, Firefox, WebKit) × the viewport matrix; `trace: 'on-first-retry'`,
`screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`. Test dir `tests/e2e`, snapshots
`tests/visual/snapshots`.

## What to drive
- **Navigation:** visit each route; assert it loads; follow internal links (no dead routes / fake `#`).
- **Interactions:** click, hover (verify hover states), keyboard (Tab/Shift-Tab/Enter/Space/Esc/Arrow),
  focus visibility, scrolling behavior.
- **Screenshots:** full-page + sections, deterministic (animation off / seeked). Visual assertions
  via `toHaveScreenshot`.
- **Animation states:** verify entrance/exit end-states and reduced-motion behavior.
- **Console + network:** collect `page.on('console')` errors/warnings and `page.on('requestfailed')`;
  fail on unexpected entries (see `console.spec` in `docs/16`).

## Discipline (`docs/16`, QA §40)
On a failing assertion: investigate cause (product wrong? test wrong? snapshot stale?
nondeterministic? real cross-browser bug?) **before** touching the assertion. Never weaken a test to
go green.

## Done when
- Core suite passes on **Chromium + Firefox + WebKit**.
- Console + network are clean (or every exception is documented as intentional in `docs/17`).
- Screenshots captured for `visual-qa` review.
