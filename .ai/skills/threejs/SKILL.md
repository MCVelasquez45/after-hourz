---
name: threejs
description: Prototype and gate Three.js/WebGL experiments — starting from "does this need WebGL?" — with performance, fallback, cleanup, and reduced-motion requirements enforced.
when_to_use:
  - any 3D/WebGL/shader idea is proposed or being built
outputs:
  - need-it decision, perf measurements, fallback + failure handling, verdict
related:
  - .ai/prompts/threejs-director.md
  - docs/design-lab/11-3D-WEBGL-DIRECTION.md
---

# Skill: Three.js / WebGL

3D does not make a site premium — restraint and craft do. It must **justify its existence**.

## Step 0 (mandatory): Does this need WebGL?
Could CSS, video, imagery, or native browser capability achieve the same experience more simply? If
yes, do that instead and stop here.

## The 5-point bar (all must be yes) — `docs/11`
1. Expresses the brand better than photo/video/CSS (material/reflection/depth = "Booth Light").
2. Holds **60fps** on a mid-range laptop; behaves on mobile.
3. Degrades to a **static, on-brand fallback** (never a blank hero).
4. Respects `prefers-reduced-motion` (pauses to a still frame).
5. Lazy-loaded + code-split; never blocks LCP or core content.

## Build requirements
- Vanilla **Three.js** in a single code-split island; **R3F/Drei only if React is already in play**.
- **Adaptive DPR** (cap pixel ratio); **IntersectionObserver** to pause the loop offscreen; lazy init.
- **Dynamic quality tiers** (detect capability; reduce on low-power/mobile); texture compression/sizes;
  geometry simplification.
- **Cleanup on unmount:** cancel `requestAnimationFrame`, dispose geometries/materials/textures,
  remove listeners — no orphaned/duplicate loops.
- **Failure handling:** detect WebGL creation failure → fallback image in the same layout box; handle
  `webglcontextlost` (pause/restore/fallback); failed texture/HDR load → fallback, log, don't crash.

## Measure (before shipping)
FPS · draw calls · triangle count · texture sizes · shader complexity · GPU memory · resize behavior ·
offscreen behavior · mobile/low-power behavior. Verify errors/cleanup via Playwright + console checks.

## Done when
- Step 0 answered; 5-point bar passed point-by-point (or the idea is cut/deferred to an isolated Lab
  experiment).
- Perf measured, fallback + context-loss handled, cleanup verified, reduced-motion honored.
- Verdict + measurements recorded in `.ai/decisions/` and `docs/design-lab/17-QUALITY-LOG.md`.
