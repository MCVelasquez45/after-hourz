# 0008 — Tailwind v4 via @tailwindcss/vite

DECISION: Use **Tailwind v4** through the **`@tailwindcss/vite`** plugin, with tokens defined in CSS
`@theme` (source of truth in `src/styles/tokens.css`).
CONTEXT: Prompt §7 requires the *current supported* Astro/Tailwind integration, not a deprecated one.
OPTIONS:
- `@tailwindcss/vite` (chosen) — the current, non-deprecated path for Tailwind v4.
- `@astrojs/tailwind` (rejected) — deprecated for v4.
WHY: v4's CSS-first `@theme` makes our tokens the single source of truth AND emits them as `:root`
custom properties, so utilities, hand-written CSS, and non-CSS contexts (canvas/WebGL) share one set
of values (satisfies §6 + §7 in one mechanism).
TRADEOFFS: v4 is newer; some v3 tutorials/config patterns don't apply. Acceptable.
STATUS: accepted
DATE: 2026-09-19
