---
name: visual-qa
description: Render the app, capture screenshots across viewports, inspect pixels, critique, fix, recapture, compare. Use whenever a visual surface is built or changed — never judge a visual feature from source alone.
when_to_use:
  - after building/changing any visible surface
  - before applying the art-director / creative-director personas
outputs:
  - screenshots per viewport + a written pixel critique + a fix list (P0-P3)
related:
  - .ai/prompts/art-director.md
  - .ai/skills/responsive-review/SKILL.md
  - docs/design-lab/16-QA-QUALITY-SYSTEM.md
---

# Skill: Visual QA

**Judge pixels, not source.** Code review cannot catch a bad crop, weak rhythm, or muddy contrast.

## Procedure
1. **Run the app.** `pnpm dev` (or `pnpm preview` on a production build for accurate perf/paint).
2. **Drive it with Playwright** (see `playwright-review`). Navigate to each target route.
3. **Capture** full-page + key sections at each viewport family (see `responsive-review` for the
   matrix). Disable animation or seek to a known end-state for deterministic shots.
4. **Inspect the actual images.** Open them. Look, don't assume.
5. **Critique** against the defect checklist below and the Art Director persona.
6. **Fix** the highest-severity issues (P0/P1 before P2/P3).
7. **Recapture** and **compare** to the previous shot. Confirm the fix helped and caused no regression.
8. Repeat until no obvious issue remains (see `design-refinement`).

## Defect checklist (what to hunt for)
awkward empty space · cramped areas · broken hierarchy · line-length problems (outside 60–75ch) ·
text collisions · poor crops · accidental symmetry · weak alignment · inconsistent radii · strange
vertical rhythm · over/undersized type · poor contrast · floating unrelated elements · unbalanced
composition · mobile that's just "desktop stacked" · generic look · unnecessary decorative effects ·
flat `#000` blacks · "chrome/paint" that's just gray fill.

## Contact sheet (milestones)
Generate a **desktop | tablet | mobile** side-by-side so responsive inconsistencies are impossible to
ignore. Never bury mobile shots in artifacts nobody opens.

## Done when
- Every target route reviewed as pixels at every viewport family.
- P0/P1 visual issues resolved; remaining P2/P3 logged in `docs/design-lab/17-QUALITY-LOG.md`.
- Screenshots retained for the review record; baselines updated only after inspecting the diff.
