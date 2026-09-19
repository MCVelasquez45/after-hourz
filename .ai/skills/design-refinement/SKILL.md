---
name: design-refinement
description: The core iterate-to-quality loop. Build → render → screenshot → critique → red team → responsive → a11y → performance → refine → re-render, until further change is churn not improvement.
when_to_use:
  - implementing or maturing any Design Lab experience
outputs:
  - a refined surface + a pass entry in the quality log with evidence
related:
  - .ai/workflows/visual-refinement-loop.md
  - .ai/skills/visual-qa/SKILL.md
  - docs/design-lab/16-QA-QUALITY-SYSTEM.md
---

# Skill: Design Refinement

Never stop at "it compiles." Iterate until quality stops meaningfully improving.

## The loop
```
DISCOVER → HYPOTHESIS → IMPLEMENT → RENDER → SCREENSHOT → CRITIQUE → RED TEAM
→ RESPONSIVE → ACCESSIBILITY → PERFORMANCE → REFINE → RENDER AGAIN → …
```
Concretely each pass:
1. **Static QA:** typecheck, lint, unit, build. Fix failures.
2. **Browser QA:** `playwright-review` — interactions, console, network. Fix.
3. **Visual QA:** `visual-qa` — capture + inspect pixels. Identify defects.
4. **Responsive QA:** `responsive-review` — full viewport matrix.
5. **A11y QA:** `accessibility` — axe + keyboard + reduced motion.
6. **Perf QA:** `performance` — vitals, bundle, images, fonts, animation/WebGL cost.
7. **Critique:** apply Art Director + Creative Director personas to the screenshots.
8. **Red Team:** apply `red-team` — try to kill it; surface tradeoffs.
9. **Refine:** make only *justified* changes (fix highest severity first, P0/P1 before P2/P3).
10. **Log the pass** in `docs/design-lab/17-QUALITY-LOG.md` (observed / changed / validation / open).

## Severity order
Resolve **P0** (broken) → **P1** (a11y/mobile/perf/content) before any **P2** (spacing/crop/type/
alignment) → **P3** (polish). Don't polish over a broken foundation.

## Stop condition (important)
Stop when another iteration would produce **no meaningful, high-confidence improvement without an
undesirable tradeoff** — i.e., remaining changes are subjective churn, not clear gains. Do **not** chase
arbitrary perfection forever. Record why you stopped.

## Guardrails
Implementer never self-approves — route through the review sequence (`.ai/README.md`). Report evidence,
never "looks perfect." Originals immutable; no fabricated facts; no deploy.
