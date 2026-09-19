# 06 — Typography

Type should read as **precision instrumentation** — stamped plates, spec sheets, confident
industrial display — without tipping into automotive cliché (no chrome script, no blackletter as
a system; see doc 01/05).

> Fonts named below are **candidates**. Final selection happens in the Design Lab app, judged on
> real screens. Licensing is documented per candidate. Nothing paid ships without written note.

## Type roles (four voices, no more)

1. **Display** — hero statements, section titles. Confident, tight, slightly industrial.
2. **Body / UI** — reading text, labels, navigation. Neutral, highly legible, invisible.
3. **Mono / technical** — spec plates, numerals, measurements, index marks. Mechanical.
4. *(Optional)* **Accent nod** — a single treated wordmark gesture only (doc 05). Not a text face.

Keeping roles to 3–4 families/weights is a performance decision too (doc 15: fonts budget).

## Candidate faces

| Role | First choice (open-license) | Alt / licensed | Notes |
|------|-----------------------------|----------------|-------|
| Display | **Space Grotesk** or **Archivo (incl. Expanded)** | Neue Haas Grotesk Display, Söhne (paid) | Space Grotesk = mechanical warmth; Archivo Expanded = spec-plate width |
| Body/UI | **Inter** | IBM Plex Sans | Inter: superb legibility, huge weight range, variable font |
| Mono | **IBM Plex Mono** or **JetBrains Mono** | Söhne Mono (paid) | For labels, VIN/paint-code plates, tabular numerals |

All first choices are **SIL Open Font License (free, commercial-OK, embeddable)** — verify each
license file at integration and record versions. No paid font enters the build without a logged
license decision (`CLIENT INPUT REQUIRED` if a paid face is desired).

**Numerals are load-bearing.** Prefer faces with **tabular lining figures**; enable
`font-feature-settings: "tnum"` for any spec/price/measurement so columns align (doc 04 P4).

## The type scale — a documented system, not arbitrary sizes

We use a **modular scale on the major third ratio (1.25)** for text, seeded at a 1rem (16px) base.
Why 1.25: tight enough for harmonious UI hierarchy, distinct enough to separate levels. It is a
*different* ratio than the spacing scale's 1.5 (doc 08) — deliberate tension between type rhythm
and spatial rhythm.

Base 1rem, ratio 1.25 (rounded):

| Step | rem | ~px @16 | Typical role |
|------|-----|---------|--------------|
| −1 | 0.80 | 12.8 | Captions, spec-plate labels (mono) |
| 0 | 1.00 | 16 | Body |
| 1 | 1.25 | 20 | Lead / large body |
| 2 | 1.563 | 25 | Subheading |
| 3 | 1.953 | 31 | H3 |
| 4 | 2.441 | 39 | H2 |
| 5 | 3.052 | 49 | H1 (interior) |
| 6 | 3.815 | 61 | Section display |
| 7+ | fluid | — | Hero display (see fluid rule) |

**Display sizes are fluid, not stepped.** Hero/display type uses `clamp()` tied to the viewport so
it scales continuously (doc 08). Illustrative:
`clamp(2.5rem, 1.5rem + 5vw, 6rem)` — validated per breakpoint in the Lab, never shipped blind.

## Hierarchy across breakpoints

We must *recompose*, not just shrink, at each width (doc 24 in the QA protocol → doc 16):

- **320–390px:** hero display large but controlled (avoid the "oversized heading" defect). Tighten
  the fluid clamp's floor. One idea per screen. Generous line-height for body.
- **768px (tablet):** display grows; two-column technical layouts become possible.
- **1024px:** editorial asymmetry begins; wider negative space.
- **1440px:** full display scale; hero can breathe.
- **1728px+ / ultra-wide:** cap measure/`max-width` so line length stays readable; add margin, not
  more text width. Display can go cinematic. Never let text run the full ultra-wide.

## Measure, leading, tracking

- **Measure:** body 60–75ch max (`max-width` in `ch`). Never full-bleed paragraphs.
- **Leading:** body ~1.5–1.6; display tight ~1.0–1.1. Mono labels ~1.3.
- **Tracking:** display slightly negative (tight, confident, ~−0.01 to −0.02em); mono/all-caps
  labels slightly positive (+0.04 to +0.08em) for legibility of stamped-plate text.
- Use all-caps **only** for short mono labels/spec plates, never for reading text.

## Personality without cliché

- The "automotive" feeling comes from **mono spec plates, tabular numerals, condensed/expanded
  display width, and tight tracking** — not from themed fonts. This is how Porsche/technical brands
  read premium: rigor, not costume (doc 12).
- The legacy chrome/blackletter is **not** reintroduced as a text system.

## Open decisions

- Display: warmth (Space Grotesk) vs. authority (Archivo Expanded)? Build both in the Lab type
  study and A/B on the hero.
- Do we license one premium display face for the wordmark only? `CLIENT INPUT REQUIRED` (budget).
- Confirm variable-font usage to minimize weight downloads (doc 15).
