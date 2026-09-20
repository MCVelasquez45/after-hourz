# After Hourz — Brand System (Design Lab)

> **One brand, three editions.** Chrome Heritage / Booth Light / After Dark are three
> art-direction interpretations of a **single** After Hourz identity — never three brands.
> Authoritative source: the client-supplied poster (`public/assets/originals/brand/`).

## Identity anchor — the logo is LOCKED

The client wordmark is the custom **dimensional chrome lettering** reading **AFTER HOURZ /
BY ANTHONY MONTOYA** from the supplied poster. It is authoritative and must not be
redesigned, replaced with a generic sans wordmark, or reduced to a plain-text "AFTER HOURZ".

**Web derivatives** (non-destructive crops of the real lettering — never a redraw), generated
by `scripts/brand-derive.mjs` into `public/assets/derived/brand/`:

| Asset | Size | Use |
| --- | --- | --- |
| `after-hourz-lockup.{png,webp}` | 982×246 | Hero / major branding moments (AFTER HOURZ + byline + scrollwork) |
| `after-hourz-lockup-sm.{png,webp}` | 640×160 | Smaller lockup |
| `after-hourz-wordmark.{png,webp}` | 900×176 | Nav / compact (AFTER HOURZ letters) |
| `after-hourz-wordmark-sm.{png,webp}` | 420×82 | Mobile nav |
| `after-hourz-wordmark-mono.{png,webp}` | 900×176 | Grayscale, for busy/coloured photographic grounds |

Render via `src/components/brand/BrandMark.astro` (`variant="lockup|wordmark|wordmark-mono"`).
Derivatives are chrome-on-near-black and use `mix-blend-mode: screen`, so they sit cleanly on
any dark brand surface. **Do not** distort proportions, stretch, or auto-trace a worse SVG.

### Regional rule
The poster's **NORCAL** badge, the California-outline map, "insert city, NorCal" copy, and the
**QUINCY** mural are legacy regional elements and are **excluded** from every derivative (the
top-band crops omit them). Anthony is Southern California raised. The stored original is never
modified (`pnpm verify:assets` confirms checksum).

## Core palette — black · chrome · cobalt blue (LOCKED)

Sampled from the poster with `scripts/brand-derive.mjs`, finalized by the Art Director. Tokens
live in `src/styles/tokens.css` as `--ah-*`. This is the shared family for all three editions.

| Token | Hex | Role |
| --- | --- | --- |
| `--ah-black` | `#08090c` | Brand ground |
| `--ah-ink` | `#010101` | Poster true black |
| `--ah-graphite` | `#161c26` | Raised dark surface |
| `--ah-gunmetal` | `#1f2a38` | Panels / cards on black |
| `--ah-steel` | `#24384f` | Dark steel-blue (sampled shop) |
| `--ah-cobalt-deep` | `#14224e` | Candy-cobalt ground (sampled Impala body) |
| `--ah-cobalt` | `#1c3a78` | Brand-core cobalt |
| `--ah-blue` | `#2e6bb5` | Electric blue — links, active, key accent |
| `--ah-blue-hot` | `#4a8fe0` | Brighter interactive blue |
| `--ah-ice` | `#7fc0ee` | Ice-blue highlight / rim light |
| `--ah-chrome-shadow` | `#4a525c` | Chrome low |
| `--ah-chrome` | `#8a929c` | Chrome mid (sampled) |
| `--ah-chrome-hi` | `#c7cdd4` | Chrome highlight |
| `--ah-specular` | `#f5f8fb` | Blown specular white |

**Warm environmental light** may appear inside *photography* (dusk, sodium, shop lamps) but the
**UI palette stays black / chrome / cobalt-blue** — no orange or teal brand accents.

## Edition map (shared brand ≠ shared composition)

- **Chrome Heritage** — heritage / custom lettering / chrome / candy-flake culture. **Benchmark
  (frozen).** Its warm candy accent is drawn from real candy paint; it still lives in the
  black/chrome family with the locked logo.
- **Booth Light** — paint / precision / surface / controlled inspection light. Dark ground,
  high-gloss cobalt, chrome edges, macro clearcoat; craft revealed by moving light.
- **After Dark** — Southern California custom-car culture, evening/shop life, movement. Black /
  chrome / cobalt with warm practical light only inside the photography.

## Provenance
All `derived/brand/*` assets are transformations of the client's own poster (client work).
External photography under `public/assets/prototype/` remains stock **prototype reference**,
documented in `ASSET-SOURCES.md`, never presented as Anthony's completed work.
