# 0005 — React island boundaries (HTML-first hydration)

DECISION: React islands are used **only** for genuine interactivity, hydrated lazily, following the
preference order `Astro/static HTML → CSS → native browser behavior → small JS → React island → WebGL`.
CONTEXT: Astro makes it easy to over-reach for React. We want to avoid shipping a React runtime for
things that are static or CSS-solvable (perf budget, docs 15).
OPTIONS:
- HTML-first with minimal, lazy islands (chosen).
- React-by-default components everywhere (rejected — defeats Astro's zero-JS advantage).
WHY: Keeps initial JS island-only and small; each island is a deliberate, justified cost.
RULES:
- Do **not** hydrate something merely because it *can* be React.
- Prefer `client:visible` / `client:idle` over `client:load`; static where possible.
- Each island is code-split and cleans up on unmount (no orphaned rAF/listeners).
- Any new client dependency is challenged by the Performance Reviewer and logged here if significant.
TRADEOFFS: Occasionally more effort to express an interaction without reaching for a heavy React lib.
Accepted.
STATUS: accepted (principle)
DATE: 2026-09-19
