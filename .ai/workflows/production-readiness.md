# Workflow — Production Readiness

**Goal:** the final checklist *before* the production experience could be considered shippable.
This is a future phase. **It requires explicit client/owner approval to begin, and approval to deploy.**

> **Not now.** The production website has not been built and must not be started without approval
> (`CLAUDE.md`, and every prior pass). This document exists so the bar is defined in advance.

## Preconditions
- A chosen, matured direction that has passed `full-quality-gate` repeatedly.
- Real client content supplied (business facts, real photography) — no `CLIENT INPUT REQUIRED` left in
  anything user-facing.

## Readiness checklist
### Content & truth
- All business facts real and client-approved (address, hours, phone, services, etc.).
- All imagery truthful: client work labeled as such; no generated/derived image implied as real work;
  **no NorCal branding** anywhere.
- Copy reviewed by Brand Strategist + Creative Director for voice and accuracy.

### Experience
- `full-quality-gate` passes on the whole site (all routes, all engines, all viewports).
- Product Designer sign-off on journeys (esp. contact/quote); no dead links; no dark patterns.
- Reduced-motion + keyboard + screen-reader journeys verified end-to-end.

### Engineering
- Performance budgets met site-wide (LCP/CLS/INP) with evidence; bundle within budget.
- Image + font pipelines final; originals immutable; derivatives logged.
- SEO fundamentals + structured metadata; sensible titles/descriptions/OpenGraph.
- Error/empty/loading states handled; 404 route designed.
- CI green (typecheck/lint/test/build/Playwright/a11y/visual).

### Governance
- Decision log current; open decisions closed or explicitly accepted.
- Security review of any integrations/MCP/tooling; no unnecessary access to secrets/prod/other repos.
- **Deployment plan approved in writing by the owner.**

## Output
A go/no-go readiness report with evidence. `DEPLOYED: NO` until the owner explicitly approves. Even
then, deploy is a separate, explicitly-authorized action.
