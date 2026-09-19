# Asset Provenance & Governance

This file is the source of truth for where every asset came from and how it may be used.
It exists to protect **client-supplied originals** and to make derivative work auditable.

## Golden rules

1. **`originals/` is immutable.** Files there are the only copies of client-supplied material.
   Never resize, crop, recolor, rename destructively, overwrite, convert in place, or run
   generative edits against them. They are stored **read-only** (`chmod 444`) on purpose.
2. **Every derivative is a new file** created *from* an original into `derived/`, never over it.
3. **Record provenance here** whenever an asset is added, and whenever a derivative is produced.
4. If you are unsure whether something is an original, treat it as one.

## Directory contract

| Path | Contents | Mutable? |
|------|----------|----------|
| `originals/brand/` | Logos, legacy promo art, brand marks from the client | **No** |
| `originals/vehicles/` | Client photos of vehicles / their work | **No** |
| `originals/shop/` | Client photos of the shop, tools, process | **No** |
| `originals/misc/` | Anything else client-supplied | **No** |
| `derived/web/` | Web-optimized exports (AVIF/WebP/resized) | Yes (regenerable) |
| `derived/crops/` | Compositional crops | Yes (regenerable) |
| `derived/thumbnails/` | Small previews | Yes (regenerable) |
| `derived/masks/` | Cutouts / alpha masks | Yes (regenerable) |
| `derived/treatments/` | Color-graded / stylized versions | Yes (regenerable) |
| `textures/` | Non-client textures (noise, grain, paper) | Yes |
| `motion/` | Video / image-sequence sources | Yes |
| `references/` | External inspiration — **never shipped**, study only | Yes |

## Original assets received (Session 1 — 2026-09-19)

Source: pasted directly by the client's representative (Mark Velasquez) during the
design-lab kickoff session. Full descriptive inventory lives in
`docs/design-lab/02-ASSET-INVENTORY.md`.

| File | SHA-256 | Dimensions | Notes |
|------|---------|-----------|-------|
| `originals/brand/after-hourz-legacy-promo-poster.png` | `9f0ce18b6bb90d294d8da047731fda7b1bae52a0efcdf4652c0c42e8d885ff84` | 1070×1536 | **Contains legacy NorCal branding — DO NOT carry forward.** Reference only. |
| `originals/vehicles/classic-chevy-blue-white-front-quarter.png` | `c3c3f800edf6431fb48eb90e995d498f5472c24b69f314a0811ab2a9c1409bd3` | 640×459 | Blue/white mid-'50s Chevrolet, front 3/4, outdoor show. Client source material. |
| `originals/vehicles/classic-chevy-blue-white-side-profile.png` | `cd50b805bea1fb45590bd9be5a5882f7c95e67be6e8a8b337be02fff08799cd8` | 1536×535 | Same/similar vehicle, side profile. Client source material. |

To verify integrity at any time:

```bash
find public/assets/originals -name '*.png' -exec shasum -a 256 {} \;
```

## Derivative log

_No derivatives created yet. Add a row here every time you generate one:_

| Derivative | Made from (original) | Tool / operation | Date | Purpose |
|------------|----------------------|------------------|------|---------|
| _(none yet)_ | | | | |
