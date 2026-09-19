# Workflow — Build a Design Experiment

**Goal:** implement a chosen direction/section as a Design Lab experiment (not production), then drive
it through refinement. Use after `explore-design-direction` selects a direction.

## Preconditions
- A chosen, approved direction with a composition plan (`art-direction` skill output).
- App scaffolded (Astro + React islands + pnpm + Tailwind). If not, that's a separate scaffold step —
  **stop and confirm** before scaffolding (it's a phase boundary).

## Steps
1. **Load context** + the direction's composition plan + relevant `docs/design-lab/*`.
2. **Implement HTML-first** (`frontend-architect` order): static Astro → CSS/tokens → native → small JS
   → React island → WebGL. Map all values to tokens (`docs/06,07,08`); no arbitrary values.
3. **Assets:** run `asset-provenance` for anything new; use derivatives only; truthful attribution.
4. **Motion (if any):** run the `motion` skill; implement the reduced-motion path in the same change.
5. **3D (if any):** run the `threejs` skill; Step-0 "does this need WebGL?" first.
6. **Label it** clearly as a Lab experiment (avoid repo entropy, QA §20/§36).
7. **Enter the refinement loop:** hand off to `visual-refinement-loop`.

## Guardrails
No production pages, no fabricated content, no deploy. Every dependency added is justified in
`.ai/decisions/`. Implementer does not self-approve — the loop routes through reviewers.

## Output
A labeled, rendered Lab experiment ready for `visual-refinement-loop`, with a Pass entry started in
`docs/design-lab/17-QUALITY-LOG.md`.
