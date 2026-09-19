---
name: performance
description: Measure Core Web Vitals, bundle size, image/font weight, and animation/WebGL cost; challenge every dependency; fix genuine problems without gaming the score.
when_to_use:
  - after adding deps/images/fonts/motion/WebGL; before declaring a direction mature
outputs:
  - vitals + bundle/image/font report with specific weight-reduction actions
related:
  - .ai/prompts/performance-reviewer.md
  - docs/design-lab/15-TECHNICAL-DIRECTION.md
---

# Skill: Performance

Speed is part of quality (P9). Measure, don't guess. Never game Lighthouse.

## Budgets
LCP ≤ **2.5s** · CLS ≤ **0.1** · INP ≤ **200ms**. Initial client JS small (island-only; set a concrete
kB budget once a baseline exists). No multi-MB images to small devices.

## Measure (when app exists)
```bash
pnpm build
pnpm test:performance   # Lighthouse CI (@lhci/cli) against key routes
```
Also inspect the build's bundle stats / a lightweight analyzer for oversized or duplicated libs.

## Checklist
- **JS/hydration:** initial kB; any `client:load` that should be `client:visible/idle` or static;
  unused JS.
- **Images:** AVIF/WebP; `srcset`/`sizes` match display; lazy below-fold; `aspect-ratio` reserves
  space (no CLS); never serve raw originals.
- **Fonts:** ≤ 3–4 roles; variable fonts; subset; `font-display: swap`; self-hosted.
- **Animation/WebGL:** main-thread time, long tasks, offscreen pausing (see `threejs`).
- **Dependencies:** for each, ask **"what are we buying with these bytes?"** Replace with lighter/
  native or drop. Log the justification in `.ai/decisions/`.

## Discipline
Fix the real cause (oversized image, eager hydration, unsubset font) — never delete design
functionality to inflate a score. Mark anything unmeasured as "unverified."

## Done when
- Vitals within budget on key routes (with evidence), or gaps logged with a plan.
- Every dependency justified; no oversized/duplicate libs; image + font pipeline correct.
- Results recorded in `docs/design-lab/17-QUALITY-LOG.md`.
