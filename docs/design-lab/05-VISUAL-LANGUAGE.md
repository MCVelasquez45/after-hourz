# 05 — Visual Language

The concrete vocabulary that makes "Booth Light" (doc 03) buildable. If doc 03 is the thesis and
doc 04 is the law, this is the *dictionary*.

## Surfaces (planes of the booth)

Everything sits on one of a few planes, drawn from the value ladder (doc 07):
- **Base / `ink`** — the room. The default background. Most of the screen.
- **Panel / `graphite`–`steel`** — raised matte surfaces (cards, nav, sections). Recede quietly.
- **Feature / painted-metal** — the rare glossy surface reserved for hero/feature moments.
- **Edge / chrome** — hairlines and dividers that catch light (1px, high-contrast, sparing).

Elevation is expressed through **value + a single light edge**, not through big blurry shadows.
A raised element is slightly lighter on top (light source) and separated by a hairline — like a
panel gap on a body, not a floating card.

## Edges, corners, radii

- **Precision geometry.** Prefer crisp edges and small, consistent radii. Default radius token
  small (e.g. 2–6px range, one or two steps only). Large pill/blob radii read as consumer-app,
  not shop-precise — avoid except for true pills (tags) if used at all.
- **Hairlines** at 1px in `ash`, or a chrome gradient edge for feature elements.
- **Panel gaps** (thin dark seams between surfaces) are a signature motif — they evoke body
  panel fit-and-finish. Use them instead of heavy borders.

## Marks & iconography

- Icons: thin, geometric, single-weight line icons — technical, like blueprint/gauge marks. No
  filled cartoon icons. Small, precise, used only where they aid comprehension.
- **Spec plates / data labels**: a recurring device — small mono-type labels in `pewter`/`silver`
  on `graphite`, styled like a stamped ID plate or a paint-code sticker (e.g. `PAINT · 2K URETHANE`,
  `EST · CLIENT INPUT REQUIRED`). These carry personality *and* real information (doc 04 P4/P5).
- **Rules & registration marks**: thin measurement ticks, corner registration marks, and index
  numbers (e.g. `01 / 04`) as an editorial, technical texture. Sparingly.

## The legacy-vocabulary nod (handle with care)

The legacy poster's chrome/blackletter lettering is *not* our system (doc 06). If we honor car
culture at all, it's through **one small, deliberate gesture** — e.g. a single chrome-treated
wordmark or a subtle pinstripe hairline — never as decoration across the UI. The Red Team must
approve any such nod as *authentic*, not *kitsch* (doc 14).

## Composition moods (three layout registers)

1. **Editorial-quiet** — mostly `ink`, one image or headline, vast negative space. Hero, section
   intros, statements. This is the default and the most on-brand register.
2. **Technical-index** — structured grid, spec plates, numerals, dense but precise. Portfolio
   lists, service specs, process steps. Shows rigor.
3. **Cinematic-band** — full-bleed or wide panoramic imagery (the A-003 ratio is perfect), type
   sitting in the negative space. Reveals, dividers, the finish payoff.

A page rhythms *between* these registers — quiet, then technical, then cinematic — like the arc
of a build: intake → work → reveal.

## Texture

- **Fine grain / noise**: a very subtle film grain over large dark fields prevents banding on
  near-black gradients and adds a photographic, non-digital feel. Extremely low opacity. Store in
  `public/assets/textures/`.
- **No** carbon fiber, brushed-metal wallpaper, or diamond-plate. Material comes from *rendering*
  (value + specular), not from tiled texture images (doc 01 ban list).

## Buttons & interactive elements (preview — full states in the Lab)

- Primary: `signal` blue, treated as a lit surface (subtle top highlight), crisp edge, `chrome`
  text. Hover raises specular (`signal-hot`) not size.
- Secondary: `steel` surface, `ash` hairline, `silver` text; hover reveals a chrome edge.
- Focus: visible `ice`/`signal` ring, always (doc 07, doc 15).
- Motion on interaction is a fast, mechanical settle (doc 09) — never bouncy.

## Do / Don't quick table

| Do | Don't |
|----|-------|
| Depth via value + hairline + panel gap | Big soft drop shadows everywhere |
| Blue as a lit edge/signal | Blue fields and blue gradients |
| Crisp small radii, technical marks | Blobby pills, cartoon icons |
| One deliberate culture nod | Chrome/blackletter across the UI |
| Grain to stop banding | Carbon-fiber / metal wallpaper |
