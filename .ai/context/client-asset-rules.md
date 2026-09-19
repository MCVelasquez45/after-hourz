# Context — Client Asset Rules (must-load)

Concise summary. **Authoritative:** `public/assets/PROVENANCE.md` and `docs/design-lab/02`, `10`.

## The one rule that matters most
**`public/assets/originals/` is IMMUTABLE.** Never resize, crop, recolor, rename destructively,
overwrite, convert in place, or run generative edits on an original. They are stored read-only
(`chmod 444`) on purpose. Every derivative is a **new file** in `public/assets/derived/`.

## Asset classes (always know which you're touching)
- **CLIENT** — supplied by Anthony. Real, immutable, portfolio-eligible (if it's his work).
- **GENERATED** — AI/composite (e.g. the legacy poster A-001). **Never** implied as real completed work.
- **LICENSED** — third-party with usage terms. Record the license.
- **REFERENCE** — inspiration only; lives in `public/assets/references/`; **never shipped**.
- **DERIVED** — produced from an original; lives in `public/assets/derived/`; logged in PROVENANCE.

## Truth in imagery
- Only present work Anthony actually performed as his work.
- The legacy poster is generated → mood/vocabulary reference only, and carries out-of-scope **NorCal**
  branding to strip.
- Missing shots ⇒ labeled placeholders + `CLIENT INPUT REQUIRED`, never fabricated.

## Adding any asset (run the provenance skill)
Record: SOURCE (client/generated/licensed/reference/derived) · ORIGINAL path · DERIVATIVE path ·
MODIFICATIONS · INTENDED USE · RIGHTS/NOTES. Procedure: `.ai/skills/asset-provenance/SKILL.md`.

## Current originals (do not touch)
`originals/brand/after-hourz-legacy-promo-poster.png` (generated, NorCal — reference only) ·
`originals/vehicles/classic-chevy-blue-white-front-quarter.png` (client) ·
`originals/vehicles/classic-chevy-blue-white-side-profile.png` (client). Checksums in PROVENANCE.md.
