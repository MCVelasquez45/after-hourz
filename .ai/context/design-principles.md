# Context — Design Principles (must-load)

Concise summary. **Authoritative:** `docs/design-lab/04-DESIGN-PRINCIPLES.md` (+ `03`, `05`, `07`, `08`).

## Thesis: "Booth Light"
Near-black space, one controlled light source, surfaces revealed slowly. Depth over decoration. The
reveal is the payoff. Craftsmanship translated into software.

## The ten principles (test every decision)
1. **Craft is the content** — the work is the hero; UI serves it.
2. **Darkness is the canvas, light is the tool** — never flat `#000`; color = a light source.
3. **Restraint is a feature** — remove until it breaks, then add one thing back.
4. **Precision is visible** — true alignment, tabular numerals, optical adjustments.
5. **Every element earns its place** — "looks cool" is not a job.
6. **Motion communicates, or it's cut** — and respects `prefers-reduced-motion`.
7. **Premium with animation OFF** — static screenshot must already read premium.
8. **Truth over polish** — never fabricate to fill a screen.
9. **Performance is part of the design** — 60fps, fast LCP, low CLS, accessible.
10. **Distinctive, not trendy** — principle over trend; must look like *After Hourz*.

## The decision test
Serves the craft? · Can anything be removed? · Precisely aligned? · Holds with motion off? ·
All true? · Fast & accessible? · Distinctive to After Hourz? Fail any ⇒ don't ship until fixed.

## Core tokens (candidates — validate in the Lab)
- **Color/value:** near-black ladder `ink #0A0B0D → graphite → steel → … → chrome #E6EAEF`; single
  accent `signal #2E7BFF` used sparingly as light. (`docs/07`)
- **Type:** roles = display / body / mono; scale ratio **1.25**; fluid display via `clamp()`. (`docs/06`)
- **Space:** geometric scale ratio **1.5**; 12-col asymmetric grid; negative space is content. (`docs/08`)
- **Motion:** few named durations (micro 120–160 / ui 240–320 / transition 360–480 / cinematic
  600–900ms); mechanical easing; reduced-motion first-class. (`docs/09`)
