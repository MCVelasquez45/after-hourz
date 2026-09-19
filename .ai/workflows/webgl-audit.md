# Workflow — WebGL Audit

**Goal:** decide whether a 3D/WebGL idea should exist, and if so, prove it meets the performance,
fallback, cleanup, and accessibility bar. Run before any WebGL ships.

## Steps
1. **Step 0 gate (persona: threejs-director / skill: threejs):** *Does this need WebGL?* If CSS/video/
   image/native suffices, recommend that and **stop**.
2. If it survives Step 0, prototype it as an **isolated, code-split Lab island**.
3. **Measure** (the `threejs` skill checklist): FPS · draw calls · triangles · texture sizes · shader
   complexity · GPU memory · resize · offscreen behavior · mobile/low-power.
4. **Verify robustness:** adaptive DPR · IntersectionObserver pause offscreen · lazy init · dynamic
   quality tiers · **cleanup on unmount** (no orphaned/duplicate rAF) · **graceful fallback** (never a
   blank hero) · `webglcontextlost` handling · failed-texture fallback.
5. **Accessibility/motion:** page still makes sense without the canvas; respects
   `prefers-reduced-motion` (pauses to a still frame).
6. **Perf integration:** run the `performance` skill — confirm it doesn't blow the JS budget or LCP;
   it must be lazy and not block core content.
7. **Red Team** the effect: is it gimmick or story? What's the worst-case device experience?
8. **Decide:** prototype-in-lab / ship-with-conditions / cut. Record in `.ai/decisions/` + `docs/17`.

## Pass criteria
Step 0 justified · 5-point bar met point-by-point · 60fps desktop + acceptable mobile · fallback +
context-loss handled · cleanup verified · reduced-motion honored · within perf budget.
