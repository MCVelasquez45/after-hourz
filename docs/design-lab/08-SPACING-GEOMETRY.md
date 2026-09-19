# 08 — Spacing & Geometry

Space is designed, not defaulted. We reject "8/16/24/32 because everyone uses it." Instead we
derive a scale from a ratio and justify every step. Restraint (doc 04 P3) and precision (P4) live
here.

> Values are a **candidate system** to validate in the Design Lab app.

## The spacing scale — geometric, ratio 1.5 ("perfect fifth")

We use a **geometric progression with ratio 1.5**, seeded at a 0.5rem (8px) optical base. Why 1.5:
it grows fast enough to create clear separation between "related" and "unrelated" elements (big,
brand-defining negative space — the "cure time" of the layout) while remaining predictable. It is
deliberately a *different* ratio than the type scale's 1.25 (doc 06) so spatial rhythm and text
rhythm don't collapse into one monotonous beat.

| Token | Calc | rem | ~px | Use |
|-------|------|-----|-----|-----|
| `space-3xs` | base ÷ 2 | 0.25 | 4 | hairline gaps, icon nudges |
| `space-2xs` | base | 0.5 | 8 | tight internal padding |
| `space-xs` | ×1.5 | 0.75 | 12 | label ↔ value |
| `space-sm` | ×1.5² | 1.125 | 18 | component padding |
| `space-md` | ×1.5³ | 1.6875 | 27 | element separation |
| `space-lg` | ×1.5⁴ | 2.531 | ~40 | group separation |
| `space-xl` | ×1.5⁵ | 3.797 | ~61 | subsection spacing |
| `space-2xl` | ×1.5⁶ | 5.695 | ~91 | section padding (mobile) |
| `space-3xl` | ×1.5⁷ | 8.543 | ~137 | section padding (desktop) |
| `space-4xl` | ×1.5⁸ | 12.815 | ~205 | major cinematic breaks |

The 4px minimum (`space-3xs`) exists because sub-4px optical adjustments are the smallest a screen
should express; touch spacing never goes below `space-2xs` between targets (doc 15 a11y).

**Section spacing is fluid**: `clamp(space-2xl, …vw, space-4xl)` so vertical rhythm breathes from
mobile to ultra-wide without hard jumps.

## Grid system

- **12 columns**, but rarely all used — asymmetric layouts pull content to 6–8 cols and leave the
  rest as intentional void (doc 05 editorial-quiet). Symmetry is a decision, never a default (the
  "accidental symmetry" defect, doc 16).
- **Gutters** scale with the space scale (`space-md`→`space-lg`).
- **Container max-widths** (content, not viewport): reading ~72ch; standard content ~1200–1280px;
  wide/cinematic content can exceed but text never does (doc 06 ultra-wide rule).
- **Outer margins** grow on ultra-wide instead of stretching content.

## Fluid responsive geometry

- Prefer `clamp()` for type and section spacing so there are fewer hard breakpoints and no "dead"
  in-between widths.
- Named breakpoints for *recomposition* (not just scaling): 390, 768, 1024, 1440, 1728+.
- Use container queries where a component must adapt to its slot, not the viewport.

## Aspect-ratio system (images & media)

Consistent ratios keep crops intentional (doc 10) and prevent layout shift (doc 15 CLS):

| Ratio | Use |
|-------|-----|
| 21:9 | Cinematic band / panoramic (A-003 native ~2.87 ≈ this) |
| 16:9 | Standard hero / video |
| 3:2 | Photography default (A-002 native ≈ this) |
| 4:5 | Portrait detail (hands, macro, vertical) |
| 1:1 | Grid thumbnails, spec tiles |

Every `<img>`/media box declares width+height or `aspect-ratio` so space is reserved before load.

## Optical & compositional rules

- **Optical alignment over metric alignment**: align to the visual edge of glyphs/shapes, not just
  the bounding box (punctuation hang, icon centering). This is where "precision is visible" (P4).
- **Golden-ratio (≈1.618)** as an *option* for hero crops and the split point of asymmetric layouts
  — a tool, not a mandate.
- **Negative space is content.** Treat large voids as deliberate composition (the booth around the
  car). If a layout feels cramped (doc 16 defect list), the fix is usually more space, not smaller
  type.
- **Baseline relationships:** align type and components to a consistent vertical rhythm derived from
  the body line-height so stacked elements share a beat.

## From system → tokens (later)

These decisions become real tokens (CSS custom properties / config) only after Lab validation
(doc 23 in the QA protocol → doc 16). We will not generate hundreds of tokens up front; each token
must map to a decision above.
