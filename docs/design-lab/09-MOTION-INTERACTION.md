# 09 — Motion & Interaction

Motion must feel like **weighted machinery settling into place** — precise, controlled, mechanical.
Never bouncy, toy-like, random, or over-animated. Every motion earns its place (doc 04 P5/P6) and
survives the "Remove It" test (QA protocol §26 → doc 16): if removing it doesn't make the
experience worse, it goes.

## Motion philosophy

1. **Motion reveals; it doesn't perform.** Its jobs: reveal content from black (the booth-light
   move, doc 03), orient the user, give interaction feedback, and pace the story of the finish.
2. **Restraint scales up.** Micro-interactions everywhere small; cinematic sequences rare and
   reserved for the reveal payoff.
3. **Reduced motion is a first-class path,** not a fallback afterthought (see below + QA §7).
4. **Smooth ≠ slow.** Never fight native scroll; never add artificial sluggishness (QA §12).

## Timing tokens (candidate)

Few, named durations — not dozens of random values (QA §13):

| Token | Duration | Use |
|-------|----------|-----|
| `dur-micro` | 120–160ms | hover, focus, button press, small state |
| `dur-ui` | 240–320ms | menus, toggles, card state, tooltips |
| `dur-transition` | 360–480ms | section/element reveals, view changes |
| `dur-cinematic` | 600–900ms | hero reveal, major sequence beats (rare) |

## Easing tokens (candidate)

Mechanical character = decisive start, long controlled settle. Candidates:

| Token | Curve | Feel |
|-------|-------|------|
| `ease-out-mech` | `cubic-bezier(0.16, 1, 0.3, 1)` | expo-out; fast then settles — default reveal |
| `ease-in-out-mech` | `cubic-bezier(0.65, 0, 0.35, 1)` | weighted both ends — panels/toggles |
| `ease-out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | gentle settle — text/opacity |

Springs only where a subtle physical settle helps (e.g. magnetic pull); tuned **critically damped
/ no overshoot** — no visible bounce.

## Signature interactions (candidates — each must pass "Remove It")

- **Reveal-from-black:** opacity + small translate (≤24px) + optional slight scale (≤1.02) as
  elements enter the booth light on scroll (IntersectionObserver). Subtle; no big flights.
- **Chrome edge on hover:** interactive surfaces gain a specular edge (doc 05/07) — feedback via
  *light*, not size.
- **Magnetic CTA (maybe):** primary CTA pulls slightly toward the pointer. Fun but on the chopping
  block — must justify vs. custom-cursor/particle temptations (all default-suspect).
- **Section pacing:** quiet → technical → cinematic registers (doc 05) sequenced on scroll.

**Suspect-by-default list** (allowed only if it clearly earns it): parallax, glow, blur, magnetic
buttons, custom cursor, particles, horizontal scroll, marquee, giant text, autoplay video, shader
FX. Each is logged with a justification in doc 17 or cut.

## Scroll strategy — evaluate before adopting (QA §12)

Default position: **native scroll + IntersectionObserver + CSS scroll-driven animations** where
supported. Add a smooth-scroll library **only if** choreography genuinely needs it.

If a smooth-scroll lib (e.g. **Lenis**) is trialed, it must pass: keyboard nav, anchor links,
back/forward, browser find, `prefers-reduced-motion`, mobile touch, trackpad, scroll restoration,
and screen-reader use. Any failure = revert to native. No scroll-jacking, no delayed controls.

## Reduced motion (`prefers-reduced-motion: reduce`) — required

When set, the experience must stay fully usable and coherent:
- No parallax, no large continuous movement, no scale-heavy reveals, no scroll-hijacking.
- Reveals collapse to **instant or a ≤120ms opacity fade** — content simply *is there*.
- Any WebGL animation pauses to a static, representative frame (doc 11).
- Auto-playing motion stops.

This is enforced by a Playwright reduced-motion scenario (doc 16, QA §7).

## Tooling evaluation (decide in the Lab; smallest system wins)

| Tool | Consider for | Verdict criteria |
|------|--------------|------------------|
| Native CSS + IntersectionObserver | most reveals/feedback | first choice; zero JS cost |
| CSS scroll-driven animations | scroll-linked reveals | use where browser support allows |
| View Transitions API | route/section transitions | progressive enhancement |
| **GSAP + ScrollTrigger** | complex choreography | add only if native can't express it |
| **Lenis** | smooth scroll | add only if it passes the §12 gate |
| Motion (Framer) | React-island interactions | evaluate vs. GSAP; don't stack both |

**Do not install everything.** Each library added is justified in doc 17 and measured against the
bundle/perf budget (doc 15, QA §21).
