# 0011 — React island bundle cost (QualityStatus)

DECISION (interim): Keep the single `QualityStatus` React island in the Lab, hydrated
`client:visible`, accepting the ~213kB React runtime it pulls onto `/design-lab`.
CONTEXT: The one hydrated island ships React + ReactDOM (~213kB) plus a ~1.7kB island chunk. The home
page ships ~0 client JS. Lighthouse performance is still 100 (lazy, deferred, otherwise-static page).
OPTIONS:
- Keep the React island (chosen, interim) — proves and tests the React-island toolchain that later
  work (React Three Fiber / 3D, doc 11) will need; lazy + lab-only.
- Rewrite the probe in vanilla JS (deferred) — would drop React from the shipped bundle entirely
  (~213kB saved) since nothing else currently needs it.
WHY: We deliberately chose React islands as the interactive architecture (0001/0005); wiring + QA-ing
that pipeline now has value. The cost is isolated to one lazy lab route.
TRADEOFFS: 213kB for a tiny probe is a poor standalone trade — flagged honestly by the Performance
Reviewer / Front-End Architect. Not shipped on any production page (none exist).
STATUS: **open** — for production, decide: vanilla-JS probe vs. keep React once a real island (3D)
justifies the runtime. Do not let React hydrate elsewhere without justification (0005).
DATE: 2026-09-19
