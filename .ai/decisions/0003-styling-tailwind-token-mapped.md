# 0003 — Styling: Tailwind, token-mapped

DECISION: Use **Tailwind CSS**, configured strictly from the After Hourz tokens (docs 06/07/08).
CONTEXT: Need a consistent, auditable styling layer that expresses the design system rather than
arbitrary values. Owner selected Tailwind.
OPTIONS:
- **Tailwind, token-mapped** (chosen) — theme derived from our color ladder, 1.5 spacing scale, 1.25
  type scale; utilities become the system; easy to grep for off-system values.
- **Vanilla CSS + custom properties** — zero utility dependency, max control, more manual discipline.
WHY: Speed + consistency + enforceability. Because the theme is generated *from* the tokens, Tailwind
utilities can't drift off-system easily; off-token values stand out in review.
TRADEOFFS: Utility-class verbosity in markup; must keep the Tailwind theme and the CSS-variable token
layer in sync (single source of truth = the tokens). The token layer (CSS custom properties) remains
authoritative so non-Tailwind contexts (e.g. WebGL, canvas) read the same values.
NOTE: Prefer Tailwind's current major with a CSS-first `@theme`/variable bridge so tokens live in CSS
and Tailwind consumes them — finalize exact version at scaffold time.
STATUS: accepted
DATE: 2026-09-19
