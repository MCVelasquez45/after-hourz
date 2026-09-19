# 16 — QA & Quality System

The engineering quality gates every future Design Lab experiment must pass. Philosophy:
**DESIGN → BUILD → RENDER → INSPECT → TEST → CRITIQUE → REFINE → RETEST**, repeated until another
iteration yields no meaningful high-confidence improvement without a bad tradeoff.

> **"200%"** = no known broken states · no obvious visual defects · no preventable a11y failures ·
> no avoidable responsive problems · no unnecessary console errors · no major perf regressions ·
> no unfinished interactions · no unexplained arbitrary design decisions · no "good enough" stop when
> an obvious improvement remains. **We report the truth — never manufacture scores or hide failures**
> (QA §37).

## Status of this system

This document is the **spec**. The tooling is **installed and wired once the stack is confirmed**
(doc 15 Open decisions) — the QA harness needs an application to render (there is none yet). Nothing
below is claimed as "passing" until it has actually run; results live in `17-QUALITY-LOG.md`.

## Toolchain (planned — smallest coherent set)

| Concern | Tool | Justification |
|---------|------|---------------|
| Browser automation / E2E / visual | **Playwright** (Chromium, Firefox, WebKit) | required (QA §2); one tool covers cross-browser, responsive, keyboard, screenshots, visual regression, console/network capture |
| Accessibility | **@axe-core/playwright** | runs axe inside existing Playwright runs — no second stack (QA §6) |
| Performance / vitals | **@lhci/cli** (Lighthouse CI) | reproducible Lighthouse; separate from fast QA (QA §8) |
| Unit/component (logic only) | **Vitest** (+ Testing Library *if* React islands) | test real logic, not static markup (QA §17) |
| Static analysis | **TypeScript (strict)** + **ESLint** + **Prettier** | zero unexplained type/lint errors; no `any`/blanket-ignores to force green (QA §19) |
| Bundle analysis | framework build stats / lightweight analyzer | catch oversized libs (QA §21) |

**Rejected / deferred (documented, QA §18/§17):**
- **Storybook** — deferred. The browser-based `/design-lab` is our component/token environment;
  Storybook would duplicate it. Revisit only if isolated component states become unmanageable.
- **Cypress / WebdriverIO** — rejected; Playwright covers the need with one tool.
- **jest** — rejected in favor of Vitest (better fit for a Vite/Astro toolchain).
- Large testing stacks for static markup — rejected (QA §17).

## Browser & viewport matrix (QA §3)

**Browsers:** Chromium, Firefox (Gecko), WebKit.

| Class | Viewport | Notes |
|-------|----------|-------|
| Desktop | 1440×900 | primary desktop |
| Desktop | 1728×1117 | large laptop |
| Ultra-wide | 1920×1080 | air/margin coherence (doc 08) |
| Tablet | 1024×768 | landscape |
| Tablet | 834×1194 | portrait (iPad Pro 11) |
| Mobile | 430×932 | large phone |
| Mobile | 393×852 | modern Android/iPhone |
| Mobile | 390×844 | common iPhone |
| Mobile | 360×800 | small Android |
| Very narrow | 320×568 | stress floor |

Responsive is **verified**, never assumed from desktop (QA §3/§24).

## Test structure (planned)

```
tests/
├── e2e/
│   ├── design-lab.spec.ts     # core surfaces render & are usable
│   ├── navigation.spec.ts     # routes/anchors, no dead links (QA §16)
│   ├── responsive.spec.ts     # viewport matrix layout sanity (QA §3/§24)
│   ├── accessibility.spec.ts  # axe + landmarks/headings (QA §6)
│   ├── keyboard.spec.ts       # tab/shift-tab/enter/space/esc/arrows, focus, no traps (QA §6)
│   ├── motion.spec.ts         # reduced-motion + animation end-states (QA §7/§13)
│   ├── visual.spec.ts         # deterministic screenshot assertions (QA §4)
│   └── console.spec.ts        # console + network cleanliness (QA §14/§15)
└── visual/
    └── snapshots/             # committed baselines (reviewed, never blind)
```

## Quality gates & commands (QA §28–31)

| Command | Runs | When |
|---------|------|------|
| `npm run qa` | typecheck → lint → unit → build → **critical** Playwright | every meaningful change (fast) |
| `npm run qa:full` | qa + full browser matrix + visual + a11y + Lighthouse + prod build | milestones |
| `npm run test:visual` | start server → render routes → deterministic screenshots → diff | visual milestones |
| `npm run test:a11y` | axe + keyboard critical path + reduced-motion | a11y milestones |
| `npm run test:performance` | Lighthouse CI + build/bundle stats | perf milestones |

Fast `qa` excludes slow audits so development stays fluid; heavy audits live in the `:full`/scoped
commands (QA §28).

## Visual regression discipline (QA §4/§40)

- Baselines are **reviewed by a human/agent looking at pixels**, never accepted blind.
- Animation is disabled or seeked to a known state for deterministic shots.
- On a diff: inspect → explain the cause → decide if it's an improvement → *only then* update the
  baseline. Never weaken an assertion to force green; fix the real cause (QA §40).

## Screenshot review loop & contact sheet (QA §5/§34)

Every major pass renders **desktop | tablet | mobile** and they are actually inspected for the defect
list below. A contact sheet (viewports side-by-side) is generated for milestones so responsive
inconsistencies are impossible to ignore. Mobile screenshots are never buried in artifacts nobody
opens.

**Visual defect checklist (what we hunt for):** awkward empty space · cramped areas · broken
hierarchy · line-length problems · text collisions · poor crops · accidental symmetry · weak
alignment · inconsistent radii · strange vertical rhythm · over/undersized type · poor contrast ·
floating unrelated elements · unbalanced composition · mobile that's just "desktop stacked" ·
generic look · unnecessary decorative effects.

## Motion, scroll & 3D gates

- **Reduced motion** (`prefers-reduced-motion: reduce`) Playwright scenario — page stays usable &
  coherent; no parallax/scroll-hijack/large motion (doc 09, QA §7).
- **Smooth-scroll** (if trialed) must pass the doc 09/QA §12 gate (keyboard, anchors, back/forward,
  find, mobile touch, trackpad, restoration, a11y) or be reverted. No scroll-jacking.
- **WebGL** perf + error gates (doc 11, QA §10/§11): FPS, draw calls, memory, resize, offscreen
  pause (IntersectionObserver), cleanup on unmount, adaptive DPR, graceful fallback (never a blank
  hero), lost-context handling. Verified via Playwright + console checks.

## Console & network cleanliness (QA §14/§15)

Playwright fails/flags unexpected console errors, unhandled exceptions, hydration failures,
framework warnings, missing resources, WebGL errors, and failed requests (404/500, missing
images/fonts). Known-intentional warnings are documented in doc 17; a dirty console is never
normalized. Internal links verified (no dead routes / fake `#` links); external placeholders allowed
only when labeled `CLIENT INPUT REQUIRED` (QA §16).

## Image pipeline (QA §22)

Originals in `public/assets/originals/` are **immutable**. A reproducible derivative workflow outputs
to `public/assets/derived/`, tracking source · dimensions · format · quality · intended use, logged
in `../../public/assets/PROVENANCE.md`. (Tooling: Astro `astro:assets` and/or a `sharp` script —
finalized with the stack.)

## Design tokens (QA §23)

Tokens (spacing, type, line-height, tracking, radii, borders, color, surfaces, shadows, transitions,
easing, z-index, layout widths) are generated **after** Lab validation, each mapping to a real
decision (docs 06/07/08/09). No premature hundreds-of-tokens dump.

## Severity classification (QA §33)

- **P0 — Broken:** unusable page, build failure, JS crash, navigation impossible.
- **P1 — Serious:** a11y blocker, mobile breakage, severe perf regression, incorrect content.
- **P2 — Quality:** weak spacing, poor crop, inconsistent type, awkward animation, alignment defect.
- **P3 — Polish:** minor easing, subtle optical alignment, small spacing refinement.

Resolve **P0/P1 before any aesthetic polish**; resolve meaningful **P2** before a direction is called
mature.

## The autonomous refinement loop (QA §32)

A) Build → B) Static QA (typecheck/lint/test/build) → C) Browser QA (Playwright; fix
interactions/console/network) → D) Visual QA (screenshots; real pixel review) → E) Responsive QA
(mobile/tablet/desktop/ultra-wide) → F) A11y QA (axe/keyboard/reduced-motion) → G) Perf QA
(Lighthouse/bundle/animation/WebGL cost) → H) Design critique (doc 14) → I) Red Team (doc 14) →
J) Refine (justified only) → **repeat from B.** Stop when another iteration yields no meaningful,
high-confidence improvement without an undesirable tradeoff. Each meaningful pass is recorded in
doc 17.

## Test artifacts & CI (QA §38/§39)

Playwright trace/video/screenshots **on failure or retry** (not always-on bloat). Generated artifact
dirs are git-ignored (`test-results/`, `playwright-report/`, `.lighthouseci/`, `blob-report/`).
Architecture authored to drop into GitHub Actions later; **no deployment** in this phase.

## Definition of "Design-Lab ready" (QA §42)

App starts reliably · prod build succeeds · lint & typecheck clean · core Playwright suite passes on
Chromium + WebKit + Firefox · mobile/tablet/desktop/ultra-wide usable & coherent · keyboard works ·
reduced-motion path works · no unexplained console errors or failed requests · axe: no known
serious/critical unresolved violations · visual snapshots exist **and have been reviewed** · client
originals untouched · no fabricated client facts · **no deployment occurred.**
