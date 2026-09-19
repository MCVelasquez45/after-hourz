# `.ai/` — After Hourz Design Intelligence Layer

This directory makes the repository **teach an AI coding agent how to work on After Hourz correctly**
— the brand, the art direction, the engineering standards, the QA bar, the critique process, and the
asset rules — even with zero prior conversation context.

## Why this exists
An agent that starts fresh should be able to: (1) load the non-negotiable context, (2) pick the right
reviewer role, (3) follow a repeatable procedure, and (4) refuse to declare work "done" without
adversarial review. This layer encodes all four. It **operationalizes** `docs/design-lab/`; it does
not replace it. **`docs/design-lab/` is authoritative** — if `.ai/` and it disagree, the docs win.

## Structure

```
.ai/
├── README.md            ← you are here (how to use this layer)
├── context/             ← concise, must-load facts (routes into docs/design-lab)
│   ├── brand-context.md         · design-principles.md
│   ├── technical-principles.md  · client-asset-rules.md · quality-bar.md
├── prompts/             ← REVIEWER PERSONAS (who reviews + what they interrogate)
│   ├── creative-director · art-director · design-critic · red-team
│   ├── product-designer  · motion-director · threejs-director
│   ├── frontend-architect · accessibility-reviewer · performance-reviewer
│   └── photography-director
├── skills/              ← EXECUTABLE PROCEDURES (how to actually do the thing)
│   ├── art-direction · visual-qa · responsive-review · playwright-review
│   ├── accessibility · performance · motion · threejs
│   └── asset-provenance · design-refinement
├── workflows/           ← SEQUENCES that orchestrate skills + personas
│   ├── explore-design-direction · build-design-experiment
│   ├── visual-refinement-loop · responsive-audit · webgl-audit
│   └── full-quality-gate · production-readiness
├── decisions/           ← lightweight decision log (ADR-lite)
└── reviews/             ← recorded review runs (incl. the dry-run validation)
```

### The distinction (no redundancy)
- **prompts/ = personas.** A mindset + a list of hard questions + what it rejects + output format.
  You *adopt* a persona to evaluate work.
- **skills/ = procedures.** Concrete, ordered steps (often with commands) to *produce or verify*
  something. You *execute* a skill.
- **workflows/ = orchestration.** They call skills and personas in a defined order.

A persona (e.g. Accessibility Reviewer) asks the hard questions; the matching skill
(`skills/accessibility`) is the checklist + commands that answer them.

## How an agent should start (cold-start procedure)
1. Read `/CLAUDE.md` (root router) → then this file.
2. Load `context/` (all five files are short and mandatory).
3. Identify the task type and pick a **workflow** from `workflows/`.
4. The workflow tells you which **skills** to run and which **personas** to apply.
5. Never let the **implementer** approve its own work — route through the review sequence below.
6. Log any meaningful decision in `decisions/`; log review runs in `reviews/`.

## The multi-agent review sequence (for significant design work)
```
IMPLEMENTER → Product Designer → Art Director → Creative Director
→ Motion / Creative Dev (if applicable) → Accessibility → Performance
→ RED TEAM → Implementer refinement → Final Visual QA
```
Personas must **disagree when appropriate** — that is the point (see `reviews/` for the dry-run
proving they produce different perspectives). If every reviewer says the same thing, the prompts are
too weak; improve them.

## Brand guardrails that must never drift
After Hourz · Anthony Montoya · Southern California roots · **NO NorCal branding** (legacy art =
reference only). Thematic language: after hours · craft · paint · restoration · transformation ·
chrome · reflection · precision · darkness · controlled light · authentic automotive culture. Do
**not** mutate the brand into cyberpunk, generic luxury, streetwear, racing/motorsports, futuristic
EV, or generic-mechanic-shop unless the client explicitly directs it. (`context/brand-context.md`)

## Reference policy (quality references, not templates)
Apple · Vercel · SpaceX · Porsche · Stripe · Linear · premium studios are **quality references**.
For each: record **Observation → Principle → Application to After Hourz → What not to copy**
(`docs/design-lab/12-REFERENCE-STUDY.md`).

## Provenance of this layer
Prompt structure is influenced by common patterns in the open-source `f/prompts.chat` ecosystem
(expert-role framing, adversarial critique, structured analysis) — **adapted, not copied**, and made
project-specific. Our repository is authoritative; external prompt libraries only supplement it.
See `decisions/0006-prompt-library-provenance.md`.
