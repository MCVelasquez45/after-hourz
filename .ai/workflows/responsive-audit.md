# Workflow — Responsive Audit

**Goal:** confirm every surface is intentionally composed across the full device range, not "desktop
stacked." Run after layout work and as part of `full-quality-gate`.

## Steps
1. Start the app (`pnpm dev`/`preview`). Enumerate target routes.
2. Run `responsive-review` across the full matrix (320 → 1920), Chromium primary; spot-check WebKit +
   Firefox for layout divergence.
3. Capture per-viewport screenshots; assemble a **desktop | tablet | mobile contact sheet** per route.
4. Inspect each viewport as pixels for: reading order · re-crops · fluid type (not just shrink) ·
   measure ≤ 75ch · ultra-wide margin (not stretched text) · whitespace · nav reachability · touch
   targets (~44px) · overflow/horizontal scroll · hero subject preserved on mobile.
5. Apply the **Product Designer** + **Art Director** personas to the contact sheets.
6. File findings by severity; fix P0/P1 (overflow, cut content, unusable nav/targets) immediately.
7. Re-capture changed viewports; confirm no regression.
8. Log the audit in `docs/design-lab/17-QUALITY-LOG.md`.

## Pass criteria
No overflow at any width · each breakpoint is a deliberate composition · touch targets pass · mobile
is not merely stacked desktop · ultra-wide is coherent (air, capped measure).
