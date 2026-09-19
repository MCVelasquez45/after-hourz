# Workflow — Visual Refinement Loop

The core iterate-to-quality loop for any Design Lab experience. This is the orchestration; the
mechanics live in the `design-refinement` skill.

```
DISCOVER
   ↓
HYPOTHESIS
   ↓
IMPLEMENT
   ↓
RENDER
   ↓
SCREENSHOT        → skill: visual-qa (+ playwright-review)
   ↓
CRITIQUE          → persona: art-director, creative-director, design-critic
   ↓
RED TEAM          → persona: red-team
   ↓
RESPONSIVE REVIEW → skill: responsive-review
   ↓
ACCESSIBILITY     → skill: accessibility (persona: accessibility-reviewer)
   ↓
PERFORMANCE       → skill: performance (persona: performance-reviewer)
   ↓
REFINE            → fix highest severity first (P0/P1 before P2/P3)
   ↓
RENDER AGAIN → (loop)
```

## Rules
- **Judge pixels, not source.** Render before you decide anything is good.
- **Implementer never self-approves.** Route through the reviewer sequence (`.ai/README.md`).
- **Report evidence,** never "looks perfect" (per-browser/per-viewport PASS/FAIL/OPEN).
- **Log every pass** in `docs/design-lab/17-QUALITY-LOG.md` (observed / changed / validation / open).

## Stop condition
Continue until additional changes no longer represent a **meaningful, high-confidence improvement**.
Stop when further changes are **subjective churn rather than clear improvement** — do not chase
arbitrary perfection indefinitely. Record why you stopped.

## Entry / exit
- **Entry:** a built, rendered experiment (from `build-design-experiment`).
- **Exit:** P0/P1 clear, meaningful P2 resolved, evidence logged → eligible for `full-quality-gate`.
