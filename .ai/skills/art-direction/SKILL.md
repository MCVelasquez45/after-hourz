---
name: art-direction
description: Turn a raw idea or brief into a concrete, on-thesis composition using the After Hourz visual system (Booth Light) — before implementation, and to correct drift during it.
when_to_use:
  - starting a new section/page/direction
  - a composition feels generic or off-brand and needs re-grounding
outputs:
  - a composition plan (register, focal point, type, imagery, color/light, motion) grounded in tokens
related:
  - .ai/prompts/creative-director.md
  - .ai/prompts/art-director.md
  - docs/design-lab/03-ART-DIRECTION.md
  - docs/design-lab/05-VISUAL-LANGUAGE.md
---

# Skill: Art Direction

Translate intent into a composition that is unmistakably After Hourz ("Booth Light": near-black
space, one controlled light, the reveal as payoff). Use before you write markup, and again if a build
drifts generic.

## Procedure
1. **State the idea in one sentence.** If you can't, stop — there's no idea yet (Creative Director).
2. **Pick the register** (`docs/05`): *editorial-quiet* (default), *technical-index*, or
   *cinematic-band*. Most pages rhythm quiet → technical → cinematic (the build arc, `docs/13`).
3. **Choose the focal point** and the deliberate tension (asymmetry, contrast). Decide where the eye
   goes first, second, third.
4. **Set imagery** via `photography-director`: class it (client/generated/reference/derived), pick
   crop/ratio (`docs/08`), reserve negative space for type. Truth first.
5. **Set type** from the scale (ratio 1.25, fluid display via `clamp()`), roles = display/body/mono,
   tabular numerals for specs (`docs/06`). No meaningless giant type.
6. **Set color & light** from the value ladder; blue as one small light source, one key light,
   specular over ambient (`docs/07`). No flat `#000`.
7. **Set space** from the 1.5 scale; negative space is content; 12-col asymmetric (`docs/08`).
8. **Decide motion** only if it earns it (`motion` skill): what reveals, what orients (`docs/09`).
9. **Self-check** against the design principles decision test, then hand to Visual QA + personas.

## Anti-patterns to refuse
automotive template · flames/checkerboard/neon · carbon-fiber wallpaper · luxury black-and-gold ·
gradients-as-personality · giant meaningless type · random 3D · animation for its own sake ·
NorCal/legacy chrome-blackletter as a system · brand drift (cyberpunk/streetwear/EV/motorsports).

## Done when
- A written composition plan exists (register, focal point, type, imagery+provenance, color/light,
  space, motion) with every choice traceable to a token/doc — no arbitrary values.
- It passes the Creative Director "why does this belong to After Hourz?" test.
