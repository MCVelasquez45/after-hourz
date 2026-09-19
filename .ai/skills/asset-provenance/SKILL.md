---
name: asset-provenance
description: Add any asset safely — classify its source, keep originals immutable, create derivatives correctly, and log provenance. Run every time an asset enters or is transformed.
when_to_use:
  - adding, importing, cropping, treating, or exporting any image/media asset
outputs:
  - a provenance record appended to public/assets/PROVENANCE.md + correctly placed files
related:
  - .ai/prompts/photography-director.md
  - public/assets/PROVENANCE.md
  - docs/design-lab/02-ASSET-INVENTORY.md
---

# Skill: Asset Provenance

**`public/assets/originals/` is immutable.** Every derivative is a new file. Every asset is logged.

## Classify first (SOURCE)
`CLIENT` (Anthony's, real) · `GENERATED` (AI/composite — never implied as real work) · `LICENSED`
(record terms) · `REFERENCE` (inspiration only, `public/assets/references/`, never shipped) · `DERIVED`
(made from an original, `public/assets/derived/`).

## Adding a NEW original (from the client)
1. Copy (never move) into the correct `originals/<brand|vehicles|shop|misc>/` with a descriptive,
   non-destructive name.
2. `chmod 444` it (read-only).
3. Record SHA-256 and full inventory fields in `PROVENANCE.md` and `docs/02`:
   filename · source · dimensions · format · ratio · subject · usage · quality · orientation ·
   dominant characteristics · legacy-branding? · hero-suitable? · restrictions.

## Creating a DERIVATIVE (crop/treatment/web export)
1. Read **from** an original, write a **new file** into the matching `derived/` subdir
   (`web|crops|thumbnails|masks|treatments`). Never write back over the original.
2. Append a row to the **Derivative log** in `PROVENANCE.md`:
   derivative path · made-from (original) · tool/operation · date · purpose (+ output format/quality/
   intended viewport).

## Truth guardrails
- Never present GENERATED/DERIVED imagery as Anthony's completed work.
- The legacy poster (A-001) is GENERATED + carries **NorCal** → reference/vocabulary only.
- Missing shots ⇒ labeled placeholder + `CLIENT INPUT REQUIRED`.

## Verify integrity anytime
```bash
find public/assets/originals -name '*.png' -exec shasum -a 256 {} \;   # compare to PROVENANCE.md
```

## Done when
- File is in the correct location with correct permissions.
- A complete provenance/derivative record exists; originals' checksums unchanged.
