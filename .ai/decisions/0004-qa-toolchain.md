# 0004 — QA toolchain: Playwright + axe + Lighthouse + Vitest

DECISION: Standardize on **Playwright** (Chromium/Firefox/WebKit) for browser/E2E/visual/console,
**@axe-core/playwright** for a11y, **@lhci/cli** (Lighthouse CI) for perf, **Vitest** for unit/logic,
and **ESLint + Prettier + TypeScript(strict)** for static analysis.
CONTEXT: The QA protocol requires cross-browser rendering, responsive testing, visual regression,
keyboard/a11y, reduced-motion, console/network capture, and performance budgets. We want the smallest
coherent toolchain.
OPTIONS:
- Playwright (chosen) vs Cypress/WebdriverIO — Playwright covers cross-browser + screenshots + visual
  + console/network in one tool.
- axe-core/playwright (chosen) — runs inside existing Playwright runs; no second stack.
- Lighthouse CI (chosen) vs manual Lighthouse — reproducible, scriptable.
- Vitest (chosen) vs Jest — better fit for the Vite/Astro toolchain.
- **Storybook: rejected/deferred** — the browser-based `/design-lab` is already our component/token
  environment; Storybook would duplicate it. Revisit only if isolated component states become
  unmanageable.
WHY: One browser tool for most needs; a11y and perf integrate cleanly; avoids redundant environments
(QA §18/§20).
TRADEOFFS: Playwright browser binaries add setup weight; Lighthouse runs are slower (kept out of the
fast `qa` command, in `qa:full`/`test:performance`).
STATUS: accepted — **not yet installed** (no app exists to test yet). Install at app scaffold.
DATE: 2026-09-19
