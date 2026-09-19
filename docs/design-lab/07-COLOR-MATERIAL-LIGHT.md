# 07 — Color, Material & Light

The most important document for the "Booth Light" look. We think like an automotive photographer
and an industrial designer: **black is a range, not a value; blue is a light, not a fill.**

> All values below are **provisional candidates from a reasoned system**, to be validated in the
> Design Lab app against real imagery. They are not final tokens.

## Principle: build depth with value, not with `#000`

Pure `#000000` kills depth — nothing can sit *below* it, and it flattens under real reflections.
We use a **value ladder of near-blacks and neutrals** so surfaces can layer, recede, and catch
light. This mirrors how a painter reads a dark panel: never one black, always many.

## The neutral value ladder (near-black → specular white)

| Token (proposed) | Hex | Role |
|------------------|-----|------|
| `ink` | `#0A0B0D` | Page base — the booth. Deepest surface. |
| `graphite` | `#121418` | Raised surface / recessed panels |
| `steel` | `#1E222A` | Cards, elevated surfaces |
| `ash` | `#333945` | Borders, hairlines, dividers (low contrast) |
| `pewter` | `#7E8896` | Muted text, captions (raised from `#5B6472` after Lab axe testing to meet AA 4.5:1 on ink/graphite — see docs/17 Pass 01) |
| `aluminum` | `#8B94A1` | Secondary text |
| `silver` | `#C4CBD4` | Primary body text on dark |
| `chrome` | `#E6EAEF` | High-emphasis text / headings |
| `specular` | `#F7F9FB` | Highlights, spec-plate text, rare peak white |

Rationale: this is a roughly perceptual progression (steps grow in lightness with even visual
spacing), giving ~9 usable "planes" of depth — enough to render surfaces, elevation, and text
hierarchy entirely in neutrals, reserving color for light.

## The accent: one controlled electric blue (from the client's own world)

The blue exists in both the client's paint (A-002/A-003) and the legacy poster's rim light. We
keep the *light*, not the poster. Blue is used like a **rim light / focus / signal** — small,
intentional, never a field.

| Token (proposed) | Hex | Role |
|------------------|-----|------|
| `signal` | `#2E7BFF` | Primary accent: focus, key CTA, active state, links |
| `signal-hot` | `#5A97FF` | Hover / brighter specular of the accent |
| `cobalt` | `#0B3FA8` | Deep accent for gradients-of-light, shadowed blue |
| `ice` | `#B9D4FF` | Cool tint for tiny highlights / rim on chrome |

**Accent discipline (hard rule):** on any given viewport, blue should occupy a *small* fraction
of the pixels — think a single lit edge, one button, one active label. If blue is doing the work
that composition and value should do, remove it. (Red Team enforces — doc 14.)

## Material model — how surfaces should read

We are simulating **four real materials.** Everything on screen should belong to one.

1. **Painted metal (deep gloss):** dark base + a *narrow, bright* specular streak. High contrast
   between the reflection and the body color = "wet" gloss. Used for hero surfaces / feature cards.
2. **Chrome / polished aluminum:** reflects the environment — dark surroundings with a hard white
   and a hint of `ice`/`signal` rim. Achieved with sharp light-to-dark gradients + a crisp edge
   highlight, not a gray fill. Used for dividers, key accents, focus rings.
3. **Matte graphite / primer:** low specular, soft. Recedes. This is most of the UI (`graphite`
   / `steel` surfaces). Lets glossy elements pop.
4. **Glass (used rarely):** subtle, low-blur, never frosted-everything. A hairline light edge +
   very slight transparency. Heavy glassmorphism is banned (doc 01).

## Light behavior

- **One key light.** Compositions imply a single dominant light (top / top-left is the default),
  so highlights and shadows stay consistent. Inconsistent light = amateur.
- **Specular > ambient.** Presence comes from *tight bright highlights on dark*, not from raising
  overall brightness. Keep the room dark; let edges catch light.
- **Reflection implies quality.** A subtle reflection under a vehicle image or a card reads as a
  polished floor — a strong, cheap-to-fake cue of a high-end shop. Use sparingly and physically
  plausibly (fades, slight blur, never a mirror).

## Accessibility (non-negotiable — see doc 15)

- Body text (`silver` `#C4CBD4`) on `ink` `#0A0B0D` must meet **WCAG AA (≥4.5:1)**; headings/large
  text ≥3:1. Verify every text/background pair in the Lab; adjust the ladder, not the standard.
- **Never** rely on `signal` blue alone to convey meaning (color-blind users) — pair with
  text/icon/position.
- Focus states use a **visible** `signal`/`ice` ring with sufficient contrast against `ink`.

## Explicitly banned

Gold/luxury-black-and-gold · rainbow gradients · neon glow spam · large flat blue fills ·
pure `#000` as the primary surface · frosted-glass-everything · color used where value should do
the work.

## Open decisions

- Exact accent-blue hue: match the client's real paint more literally (cooler cyan) vs. the
  refined UI blue above? Decide against real imagery in the Lab.
- Is there a secondary warm neutral (a hint of warmth in the darks) to avoid a clinical feel?
  Test a warm-black vs. neutral-black variant.
