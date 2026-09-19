# Workflow — Full Quality Gate

**Goal:** the milestone gate a Design Lab experience must pass before it's called mature. Maps to the
QA spec (`docs/16`) and the "Design-Lab ready" definition (QA §42).

## Preconditions
App scaffolded; QA tooling installed (Playwright, axe, Lighthouse, Vitest, ESLint/Prettier/TS).
> **Status today:** tooling is specified but not yet installed (no app). This workflow becomes runnable
> after scaffold + tooling setup.

## Sequence (evidence required at each step)
1. **Static QA** — `pnpm qa` (typecheck → lint → unit → build → critical Playwright). All pass.
2. **Browser matrix** — Playwright on **Chromium + Firefox + WebKit** across the viewport matrix.
3. **Visual regression** — `pnpm test:visual`; inspect diffs; update baselines only after review.
4. **Responsive audit** — `responsive-audit` workflow; contact sheets reviewed.
5. **Accessibility** — `pnpm test:a11y`; axe 0 serious/critical; keyboard journey; reduced motion.
6. **Performance** — `pnpm test:performance`; vitals within budget; bundle/image/font checks.
7. **WebGL (if any)** — `webgl-audit` passed.
8. **Console/network** — no unexplained errors or failed requests; internal links valid.
9. **Design critique + Red Team** — personas applied to rendered result; concerns triaged.
10. **Asset & truth check** — originals untouched (checksums match); no fabricated facts.

## Gate (all must hold — QA §42)
app starts · prod build passes · lint + typecheck clean · core Playwright passes on all 3 engines ·
all viewports usable/coherent · keyboard works · reduced-motion path works · no unexplained console/
network errors · axe 0 serious/critical unresolved · visual snapshots exist **and were reviewed** ·
originals untouched · no fabricated facts · **no deployment occurred.**

## Output
A milestone entry in `docs/design-lab/17-QUALITY-LOG.md` with **per-browser/per-viewport evidence**
(PASS/FAIL/OPEN) — never confidence language. Failures block the gate; investigate cause before
weakening any assertion (QA §40).
