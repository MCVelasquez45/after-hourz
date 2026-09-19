# After Hourz — Design Lab

This is the **design intelligence** for After Hourz. It is not the website. Nothing here is
production code. Every decision that will later shape the customer-facing experience is
reasoned out and recorded here *first*, so that when we build, we are executing a considered
plan rather than improvising.

> **Quality bar:** the finished experience should be able to stand next to work from Apple,
> Vercel, SpaceX, Stripe, Linear, and Porsche — not by imitating them, but by matching their
> discipline: restraint, hierarchy, typography, motion, and technical execution. We extract
> principles. We do not copy.

## The one-line thesis

**Craftsmanship translated into software.** After Hourz is body, paint, and restoration work
done with patience after the world has gone quiet. The site should feel like a finished panel
under controlled light: deep, reflective, precise — revealed slowly, never shouted.

See `03-ART-DIRECTION.md` for the full thesis.

## How to read these docs

| # | File | What it decides |
|---|------|-----------------|
| 00 | `00-DESIGN-LAB-README.md` | This map + governance |
| 01 | `01-BRAND-CONTEXT.md` | Who After Hourz is; what is in / out of scope |
| 02 | `02-ASSET-INVENTORY.md` | Every supplied asset, catalogued |
| 03 | `03-ART-DIRECTION.md` | The central visual thesis ("Booth Light") |
| 04 | `04-DESIGN-PRINCIPLES.md` | The rules every decision is tested against |
| 05 | `05-VISUAL-LANGUAGE.md` | The vocabulary: surfaces, edges, marks, layout moods |
| 06 | `06-TYPOGRAPHY.md` | Type roles, scale, licensing |
| 07 | `07-COLOR-MATERIAL-LIGHT.md` | The value ladder, accent discipline, material model |
| 08 | `08-SPACING-GEOMETRY.md` | The mathematical foundation for space & grid |
| 09 | `09-MOTION-INTERACTION.md` | Motion philosophy, easing, tooling evaluation |
| 10 | `10-PHOTOGRAPHY-DIRECTION.md` | How photography must look; truth constraints |
| 11 | `11-3D-WEBGL-DIRECTION.md` | Where (if anywhere) 3D earns its place |
| 12 | `12-REFERENCE-STUDY.md` | Principles extracted from world-class work |
| 13 | `13-EXPERIENCE-PRINCIPLES.md` | How the whole thing should *feel* to use |
| 14 | `14-DESIGN-CRITIQUE.md` | The Red Team; the review team model |
| 15 | `15-TECHNICAL-DIRECTION.md` | Stack, performance, accessibility, architecture |

Read 03 → 04 → 07 → 08 → 06 first; those lock the core. Everything else builds on them.

## Governance

- **Originals are sacred.** See `../../public/assets/PROVENANCE.md`.
- **No production build yet.** No homepage, no deploy, no design system locked. This is the lab.
- **No invented client facts.** Anything we don't know is marked `CLIENT INPUT REQUIRED`.
- **The Red Team can kill ideas** (see doc 14). "Technically impressive" is not a defense.
- **Provisional by design.** Tokens/values here are *candidates from a reasoned system*, not
  final. They become real tokens only after the Design Lab app validates them side-by-side.

## Status

- [x] Repository audit
- [x] Asset provenance system + originals preserved
- [x] Asset inventory
- [x] Design-lab documentation foundation (this pass)
- [ ] Design Lab **application** (next phase — requires approval)
- [ ] Production experience (later; requires approval)
