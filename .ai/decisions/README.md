# Decision Log (ADR-lite)

Lightweight records of meaningful design/technical decisions. **Avoid bureaucracy for trivial
decisions** — this is for choices with real tradeoffs or long-lived consequences.

## Record format
```
# NNNN — <title>
DECISION: <what was decided>
CONTEXT: <why this came up>
OPTIONS: <the real alternatives considered>
WHY: <reasoning>
TRADEOFFS: <what we give up / risks>
STATUS: accepted | proposed | open | superseded(by NNNN)
DATE: YYYY-MM-DD
```

## Index
| # | Decision | Status |
|---|----------|--------|
| 0001 | Framework: **Astro** (+ React islands) | accepted |
| 0002 | Package manager: **pnpm** | accepted |
| 0003 | Styling: **Tailwind**, token-mapped | accepted |
| 0004 | QA toolchain: Playwright + axe + Lighthouse + Vitest | accepted (not yet installed) |
| 0005 | React island boundaries (HTML-first hydration) | accepted (principle) |
| 0006 | Prompt-library provenance (f/prompts.chat) | accepted |
| 0007 | AI layer: `.ai/` + `CLAUDE.md` vs `.claude/` native | accepted |

## Open decisions (to resolve in the Design Lab with evidence)
| Topic | Where | Status |
|-------|-------|--------|
| Smooth-scroll (Lenis) adoption | docs/09 + skill/motion | **open** — trial-and-gate only |
| Three.js hero adoption | docs/11 + workflow/webgl-audit | **open** — needs real assets + perf proof |
| Final display typeface (Space Grotesk vs Archivo Expanded) | docs/06 | **open** — A/B in Lab |
| Warm-black vs neutral-black darks | docs/07 | **open** — test against imagery |
| Image strategy specifics (reshoot plan) | docs/10 | **open** — CLIENT INPUT REQUIRED |
| Competing direction A (industrial) vs B (cinematic) | docs/14 | **open** — build side-by-side |
