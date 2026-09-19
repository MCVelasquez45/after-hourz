# 11 — 3D / WebGL Direction

Three.js is a **potential tool, not a requirement.** A site does not become premium by adding
WebGL — it becomes premium through restraint, material, and craft (doc 04). 3D must **justify its
existence** or it is cut (doc 04 P5, QA §26 "Remove It").

## The bar 3D must clear

Before any WebGL ships, it must answer *yes* to all:
1. Does it express the brand better than a photo/video/CSS could? (material, reflection, depth)
2. Does it hold **60fps** on a mid-range laptop and behave on mobile?
3. Does it degrade gracefully to a static, on-brand fallback if WebGL fails or is unsupported?
4. Does it respect `prefers-reduced-motion` (pauses to a still frame)?
5. Is it lazy-loaded so it never blocks LCP or the core experience?

If any answer is *no*, it doesn't ship — regardless of how impressive it is.

## Where 3D could genuinely earn its place (candidates, ranked)

1. **A single hero material moment.** A real-time reflective surface — chrome/deep-gloss paint —
   with an HDR environment map, so light plays across it as the pointer/scroll moves. This is the
   *most on-thesis* use: it literally renders "Booth Light." One moment, not everywhere.
2. **Slow vehicle reveal.** A dark-to-lit reveal of a model or a photogrammetry/depth treatment —
   only viable with real high-quality source (doc 10) and a strong performance story.
3. **Paint/flake shader study.** A subtle metallic-flake or clear-coat depth shader on a hero
   surface. High risk of gimmick — Red Team must approve (doc 14).

Everything else (floating particles, ambient 3D objects, gratuitous scenes) is **rejected by
default** (doc 01 ban list).

## Hard reality: we don't have 3D-ready assets yet

We have no 3D models and only low/med-res photos. So near-term, 3D is **explored in the Lab as an
isolated experiment**, not committed to production. A material/environment study (option 1) can be
prototyped with primitives + an HDR map to prove the look and the perf budget *before* asking the
client for model/scan assets. `CLIENT INPUT REQUIRED` for any vehicle model/scan.

## Performance gates (QA §10/§11 — enforced in doc 16)

Every WebGL experiment is measured for:
- FPS (target ≥60 desktop; graceful on mobile) · draw calls · triangle count · texture sizes ·
  shader complexity · GPU memory · resize behavior · **cleanup on unmount** (no orphaned
  `requestAnimationFrame`, no duplicate loops) · offscreen behavior.

Mandatory techniques:
- **IntersectionObserver** to pause the render loop when the canvas is offscreen.
- **Adaptive DPR** (cap pixel ratio; scale to maintain frame budget).
- **Lazy initialization** (init only when in view / after core content).
- **Dynamic quality tiers** (detect capability; reduce for low-power/mobile).
- Texture compression / sensible sizes; geometry simplification.

## Failure & degradation (QA §11)

- Detect WebGL support/creation failure → render the **static poster fallback** (a treated image,
  doc 10) in the exact same layout box. **Never a blank hero.**
- Handle **lost context** (`webglcontextlost`) → pause, attempt restore, else fallback.
- Failed texture/HDR load → fallback image; log, don't crash.
- All of the above verified by Playwright + console checks (doc 16, QA §11/§14).

## Tooling (only if 3D is greenlit)

- **Three.js** core; **React Three Fiber + Drei** *only if* the app already uses React islands
  (doc 15) — otherwise vanilla Three in a single island to avoid bundle bloat.
- GLSL for the custom material; `postprocessing` only if a specific effect needs it and passes the
  perf gate.
- The whole 3D island is **code-split** and excluded from the base bundle (doc 15, QA §21).

## Recommendation for this phase

Treat 3D as a **contained Lab experiment (Direction candidate), not a foundation dependency.** Prove
the material look + perf budget in isolation; decide production inclusion only after (a) real assets
exist and (b) the Red Team confirms it serves the craft, not the demo.
