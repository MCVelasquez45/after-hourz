---
name: responsive-review
description: Verify every surface is intentionally composed (not just stacked) across the full viewport matrix from 320px to ultra-wide. Mobile is its own composition.
when_to_use:
  - after any layout work
  - as part of the visual refinement loop and full quality gate
outputs:
  - per-viewport screenshots + composition verdict + fixes
related:
  - .ai/skills/visual-qa/SKILL.md
  - docs/design-lab/08-SPACING-GEOMETRY.md
  - docs/design-lab/16-QA-QUALITY-SYSTEM.md
---

# Skill: Responsive Review

**Responsive is verified, never assumed from desktop.** Mobile is a composition, not "desktop
stacked" (`docs/13`, `docs/08`).

## Viewport matrix (capture all)
| Class | Sizes |
|-------|-------|
| Desktop | 1440×900, 1728×1117 |
| Ultra-wide | 1920×1080 |
| Tablet | 1024×768, 834×1194 |
| Mobile | 430×932, 393×852, 390×844, 360×800 |
| Very narrow | 320×568 |

Run each across Chromium at minimum; spot-check WebKit (Safari-family) + Firefox for layout diffs.

## What to evaluate per viewport (not just "does it fit")
- **Reading order** & content hierarchy still make sense.
- **Crop changes** — imagery re-crops appropriately (art direction per size, `docs/10`); vehicle
  front-end / body-line not lost on mobile.
- **Typography** recomposed (fluid `clamp()`), not just shrunk; no oversized mobile headings; measure
  stays 60–75ch; ultra-wide caps text width and adds margin (not more text).
- **Whitespace/density** intentional at each size.
- **Navigation** reachable and usable (thumb zone on mobile).
- **Touch targets** comfortable (~44px) and spaced; no hover-only affordances on touch.
- **Image placement** and section rhythm hold.

## Red flags (P1/P2)
horizontal scroll/overflow · text collisions · content cut off · desktop layout merely stacked ·
tap targets too small/tight · hero image losing its subject · ultra-wide text running full width.

## Done when
- All viewport families captured and reviewed as pixels.
- Each breakpoint is a deliberate composition; no overflow; touch targets pass.
- Findings logged (P0/P1 fixed) in `docs/design-lab/17-QUALITY-LOG.md`.
