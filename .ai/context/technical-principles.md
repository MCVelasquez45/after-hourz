# Context — Technical Principles (must-load)

Concise summary. **Authoritative:** `docs/design-lab/15-TECHNICAL-DIRECTION.md`.

## Stack (decided)
**Astro + React islands + pnpm + Tailwind (token-mapped, from docs 06/07/08).** TypeScript strict.
See `.ai/decisions/` for the rationale (Astro vs Next; pnpm; Tailwind).

## The preference order (HTML first, JS by exception)
```
Astro/static HTML → CSS → native browser behavior → small JS → React island → WebGL
```
Do **not** hydrate something merely because it *can* be React. Each island is code-split, lazy where
possible, and cleans up after itself (no orphaned rAF/listeners).

## Non-negotiable engineering bar
- Semantic HTML; WCAG **AA**; full keyboard; visible focus; no traps.
- Responsive is **composed** per device, never "desktop stacked."
- Images: AVIF/WebP, responsive `srcset`/`sizes`, lazy below the fold, reserve space (`aspect-ratio`).
  Originals immutable; serve **derivatives** only.
- Fonts: 3–4 roles max; prefer variable fonts; self-host; `font-display: swap`; subset when useful.
- Reduced JS by default; every major dependency must justify its bytes.
- Progressive enhancement: core content/nav works without JS.

## Performance budgets (initial)
LCP ≤ **2.5s** · CLS ≤ **0.1** · INP ≤ **200ms**. Initial client JS intentionally small (island-only;
set a concrete KB budget once a baseline exists). No multi-MB images to small devices.

## WebGL rule
Three.js/WebGL only where it expresses the brand better than photo/video/CSS **and** holds 60fps,
degrades gracefully (never a blank hero), respects reduced motion, and lazy-loads. (`docs/11`)

## QA (spec exists; tooling not yet installed)
Playwright (Chromium/Firefox/WebKit) · `@axe-core/playwright` · Lighthouse CI · Vitest · ESLint +
Prettier + TS strict. Commands (planned): `qa`, `qa:full`, `test:visual`, `test:a11y`,
`test:performance`. Full spec: `docs/design-lab/16-QA-QUALITY-SYSTEM.md`. **Status:** documented, not
yet wired — no app exists to test yet.
