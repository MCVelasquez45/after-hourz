# CLAUDE.md — After Hourz (project routing layer)

> This file is a **router**, not a manual. It tells an AI coding agent the non-negotiable facts and
> where to read deeper. Do not paste design docs here. Keep it short.

## Project
**After Hourz** — owner **Anthony Montoya**. Automotive body work, custom paint, restoration, and
custom vehicle craftsmanship (cars, trucks, bikes).

## Regional rule (do not violate)
Anthony is **Southern California raised**. **DO NOT use NorCal branding**, Northern-California
geography/imagery, the "QUINCY" mural, or the California-outline "NorCal" badge. The legacy supplied
poster containing "NorCal" is a **historical/reference asset only** (see `docs/design-lab/01`, `02`).

## Design objective
A premium automotive digital experience built on: craftsmanship · transformation · material · light
· paint · chrome · precision · restraint · cinematic storytelling. Thesis = **"Booth Light"**
(`docs/design-lab/03-ART-DIRECTION.md`). Extract principles from great work; never copy (`docs/12`).

## Engineering objective
**HTML first. JavaScript by exception.** Preference order for any interactivity:
`Astro/static HTML → CSS → native browser behavior → small JS → React island → WebGL`.
Stack: **Astro + React islands + pnpm + Tailwind (token-mapped)**. Three.js/WebGL only where it
earns its place (`docs/11`). Full rationale: `docs/design-lab/15-TECHNICAL-DIRECTION.md`.

## Mandatory rules
- **Preserve original client assets** — `public/assets/originals/` is immutable (see PROVENANCE.md).
- **Never fabricate client facts** — mark unknowns `CLIENT INPUT REQUIRED`.
- **No deployment without explicit approval.**
- **Inspect before modifying. Render before judging.** Look at pixels, not just source.
- Test responsive states · run Playwright · inspect screenshots · run accessibility checks.
- **Challenge the design** (Red Team) before declaring anything done. Implementer never self-approves.
- Document meaningful decisions in `.ai/decisions/`.

## Current phase
Foundation + design-intelligence only. **The production website has NOT been built.** No app is
scaffolded yet; QA tooling in `docs/16` is a **spec**, not yet installed.

## Where to read deeper (routing)
- **How to work / which role to use →** `.ai/README.md`
- **Reviewer roles (personas) →** `.ai/prompts/`
- **Executable procedures →** `.ai/skills/`
- **Multi-step processes →** `.ai/workflows/`
- **Brand, art direction, engineering, QA (authoritative) →** `docs/design-lab/` (files 00–17)
- **Asset rules & provenance →** `public/assets/PROVENANCE.md`, `.ai/context/client-asset-rules.md`
- **Decision log →** `.ai/decisions/`

`docs/design-lab/` is the **authoritative** source of truth. `.ai/` operationalizes it for agents.
If the two ever conflict, `docs/design-lab/` wins and `.ai/` must be corrected.
