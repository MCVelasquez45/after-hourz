# 14 — Design Critique & Red Team

We do not operate as one unquestioned designer. Every direction is reviewed by a simulated
multidisciplinary team, and a **Red Team** whose job is to *kill* weak ideas. Disagreements are
documented, not averaged into a safe mush (doc 04 P10).

## The review roles

| Role | Owns | The question it keeps asking |
|------|------|------------------------------|
| **Creative Director** | thesis, tone, story, differentiation | Does this communicate *After Hourz* specifically? |
| **Art Director** | composition, photo, material, type relationships | Is the composition genuinely sophisticated? |
| **Product Designer** | usability, hierarchy, IA, conversion, responsive | Can a real person understand and navigate this? |
| **Motion Designer** | choreography, timing, easing, restraint | Is the movement *improving* the experience? |
| **3D / Creative Dev** | Three.js, shaders, depth, perf-of-effect | Are we using technology meaningfully — or to show off? |
| **Front-End Architect** | architecture, perf, a11y, maintainability | Are we paying too much (compute/complexity) for the effect? |
| **Brand Strategist** | authenticity, consistency, perception | Is this *authentic* to a craftsman shop, or a costume? |
| **Accessibility Reviewer** | real usability for all | Can everyone actually use this? |
| **Red Team Critic** *(mandatory)* | breaking the work | Why shouldn't we ship this? |

## The Red Team charter

The Red Team actively **searches for reasons the work is mediocre.** It has the authority to reject
ideas that are technically impressive but wrong for After Hourz. Standard interrogation:

- Is this actually distinctive, or does it look like an automotive template?
- Is it appropriate for After Hourz, or are we chasing a trend (doc 04 P10)?
- Is the interaction *helping the story*, or decorating it (doc 09, QA §26)?
- Is the typography doing real work, or just being big (doc 06)?
- Is the experience too busy? Too safe?
- **Would this still feel premium with animation turned off** (doc 04 P7)?
- Are we confusing visual complexity with quality?
- Can we remove something and improve the composition (doc 04 P3)?
- Would a top creative studio approve this — honestly?
- Is anything here fabricated or overclaimed (doc 04 P8)?

**Default posture:** skeptical. If an effect's value is uncertain, it is cut, not kept.

## How a critique runs (per major pass)

1. Render the work as pixels across the viewport matrix (doc 16) — critique **screenshots**, not
   source code. Technical correctness ≠ good art direction.
2. Each role logs its strongest concern.
3. Red Team attempts to break it (visually, functionally, and on the "is this mediocre?" axis).
4. Concerns are triaged by severity P0–P3 (doc 16, QA §33).
5. Justified refinements are made; each is recorded in `17-QUALITY-LOG.md`.
6. **Document disagreements** where the team doesn't converge — don't paper over them.

## Competing directions, not compromise

When directions genuinely diverge, we **build them side-by-side** in the Design Lab (e.g.
*Direction A / B*, later named by thesis — QA §36) and choose one strong direction rather than
blending three into something safe. Each documented with: hypothesis · principles · type · geometry
· imagery · motion · 3D strategy · strengths · weaknesses · critique.

### Seed tension to resolve (first real critique fodder)
- **A: Industrial-minimal** — near-pure Vercel/Linear rigor; culture nearly invisible; maximal
  restraint. Risk: too cold / generic-premium, loses the soul.
- **B: Cinematic car-culture** — leans into the vehicles, the night shop, one authentic culture nod
  (doc 05). Risk: tips toward kitsch / template if undisciplined.
  The Lab exists to settle this with pixels, not opinions.

## Standing rule against self-congratulation (ties to QA §37)

Never report "everything looks perfect." Report **evidence** and **open concerns**. A review with
zero concerns is a review that wasn't done. The absence of found problems is logged as a risk, not a
victory.
