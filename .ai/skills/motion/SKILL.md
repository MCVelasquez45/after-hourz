---
name: motion
description: Add or review motion so it is intentional, mechanical, token-based, and reduced-motion-safe. Every animation must answer "why does this move?"
when_to_use:
  - adding/reviewing any animation, transition, scroll behavior, or reveal
outputs:
  - per-animation justification + timing/easing from tokens + reduced-motion verification
related:
  - .ai/prompts/motion-director.md
  - docs/design-lab/09-MOTION-INTERACTION.md
---

# Skill: Motion

Motion communicates or it's cut (P6). Feel = weighted machinery settling — mechanical, controlled,
never bouncy/toy-like/random.

## Procedure
1. For each proposed animation, answer **"WHY DOES THIS MOVE?"** (reveal / orient / feedback / story).
   No answer ⇒ don't add it.
2. Run the **"Remove It" test:** if removing it doesn't make the experience worse, remove it.
3. Use **named tokens only** (`docs/09`): durations micro 120–160 / ui 240–320 / transition 360–480 /
   cinematic 600–900ms (rare); easing e.g. `cubic-bezier(0.16,1,0.3,1)`; springs critically-damped.
4. Prefer the cheapest mechanism (HTML-first order): CSS + IntersectionObserver / CSS scroll-driven
   before JS libs. Add GSAP/Lenis/Motion only if justified (log in `.ai/decisions/`), code-split.
5. Implement the **reduced-motion path in the same change**: `@media (prefers-reduced-motion: reduce)`
   collapses motion to instant or ≤120ms fade; no parallax/scroll-hijack/large movement.
6. Verify in-browser (Playwright): normal + reduced-motion; check end-states; confirm no scroll-jacking
   and that "smooth" isn't "slow" (if a smooth-scroll lib is trialed, run the `docs/09` gate).

## Suspect-by-default (justify or cut)
parallax · glow · blur · magnetic buttons · custom cursor · particles · horizontal scroll · marquee ·
autoplay video · shader FX.

## Done when
- Every animation has a stated reason and uses tokens (no ad-hoc durations/easings).
- Reduced-motion verified coherent; no scroll-jank; suspect effects justified or removed.
- Decisions/justifications recorded (`.ai/decisions/` or `docs/17`).
