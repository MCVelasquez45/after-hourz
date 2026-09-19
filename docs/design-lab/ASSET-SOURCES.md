# Asset Sources & Provenance (prototypes)

Every non-client asset used in the prototype experiences is recorded here. Client originals remain
immutable (`public/assets/originals/`, see `../../public/assets/PROVENANCE.md`).

## Sourcing decision (senior call, documented per §6/§7)

External stock/photo downloading was evaluated and **deliberately not used** for these prototypes:
in this build environment, third-party image licences cannot be verified reliably per-file and the
downloads are not reproducible (they'd become an untraceable, licence-ambiguous blob in the repo —
exactly what §7 warns against). Instead, prototype visual density is built from:

1. **CLIENT** — the supplied Chevrolet photos, used honestly at appropriate scale (never upscaled past
   their resolution; the 640px front-3/4 stays small/inset; the 1536px side profile used wider).
2. **GENERATED (in-code, original)** — SVG/CSS/gradient "scenes" authored in this repo: chrome plates,
   metallic-flake clearcoat, paint-booth inspection light, dusk-to-night skies, wet asphalt, film
   grain, ornamental illuminated plaques (derived from the poster's visual DNA). 100% original, no
   third-party licence, fully reproducible, performant, responsive.

These are **not placeholders** — they are designed visual content. Where real cinematic photography
would be stronger (hero-scale vehicle/process shots), the design leaves intentional, composed frames
for it and the recommendation to commission a shoot stands (docs/10). No frame is left empty.

## Classification legend
CLIENT · GENERATED · STOCK · REFERENCE · DERIVED

## Register

| Asset | Class | Source / method | Licence | Used in | Notes |
|-------|-------|-----------------|---------|---------|-------|
| `originals/vehicles/classic-chevy-blue-white-side-profile.png` | CLIENT | Anthony (paste, 2026-09-19) | client-owned | all 3 prototypes (work) | 1536×535; attribution unconfirmed → neutral copy only |
| `originals/vehicles/classic-chevy-blue-white-front-quarter.png` | CLIENT | Anthony (paste, 2026-09-19) | client-owned | all 3 prototypes (inset/cards) | 640×459; used small only |
| `originals/brand/after-hourz-legacy-promo-poster.png` | CLIENT/REFERENCE | Anthony (paste) | client-owned | **not shipped** — visual-DNA brief only | contains NorCal → excluded from all output |
| `src/assets/derived/study-chevy-*.png` | DERIVED | byte-copy of the two client photos | client-owned | Astro image pipeline input | for AVIF/WebP generation; no edits |
| In-code SVG/CSS scenes (chrome, paint-flake, booth light, dusk, asphalt, grain, plaques) | GENERATED | authored in this repo (prototype CSS/Astro) | original / project-owned | all 3 prototypes | no external dependency |

## Fonts
Type uses self-hostable open-license families with system fallbacks (see docs/06). No font binaries are
bundled yet; fallback stacks are active. Any font file added later will be logged here with its licence
(SIL OFL or equivalent) before shipping. **No pirated fonts.**

## Rule
No stock/generated imagery is ever presented as Anthony's completed customer work. No fabricated
project names, awards, testimonials, or stats are attached to any image (§9, §36).
