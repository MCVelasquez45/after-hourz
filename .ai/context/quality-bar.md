# Context — Quality Bar (must-load)

Concise summary. **Authoritative:** `docs/design-lab/16-QA-QUALITY-SYSTEM.md`, `14`, `04`.

## What "done" means (the 200% definition)
No known broken states · no obvious visual defects · no preventable a11y failures · no avoidable
responsive problems · no unnecessary console errors · no major perf regressions · no unfinished
interactions · no unexplained arbitrary design decisions · no "good enough" stop when an obvious
improvement remains. **Report the truth — never manufacture scores or hide failures.**

## The loop (never stop at "it compiles")
```
DESIGN → BUILD → RENDER → INSPECT (pixels) → TEST → CRITIQUE → RED TEAM → REFINE → RETEST
```
Stop only when another iteration yields no meaningful, high-confidence improvement without a bad
tradeoff — not at arbitrary perfection, and not at first green.

## Evidence, not confidence language
Never say "everything looks perfect." Report per-browser / per-viewport PASS/FAIL/OPEN with evidence
(axe violations = N, console errors = N, build = PASS, etc.). A review with zero concerns wasn't done.

## Severity (fix order)
- **P0 Broken** (unusable/build fail/crash/nav impossible) → **P1 Serious** (a11y blocker, mobile
  breakage, severe perf regression, wrong content) → **P2 Quality** (spacing/crop/type/alignment/
  awkward motion) → **P3 Polish**. Resolve P0/P1 before any aesthetic polish; clear meaningful P2
  before calling a direction mature.

## Rendering & responsive are mandatory
Judge **pixels, not source**. Test the viewport matrix (mobile → tablet → laptop → desktop →
ultra-wide). Mobile is its own composition, not "desktop stacked."

## Review is adversarial
The implementer never approves its own work. Route through the review sequence (`.ai/README.md`) and
let the **Red Team** try to kill it (`.ai/prompts/red-team.md`).

## Gate before declaring "Design-Lab ready"
App starts · prod build passes · lint + typecheck clean · core Playwright passes on all 3 engines ·
all viewports usable · keyboard works · reduced-motion path works · no unexplained console/network
errors · axe: 0 serious/critical unresolved · visual snapshots exist **and were reviewed** · originals
untouched · no fabricated facts · **no deploy**.
