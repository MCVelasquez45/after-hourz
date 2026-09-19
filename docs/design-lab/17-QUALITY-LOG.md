# 17 — Quality Log

A running, evidence-based record of meaningful review milestones. **No confidence language, no
manufactured scores** (doc 16, QA §37) — only what was observed, what changed, and how it was
validated. Newest at top.

Format per pass:
```
## Pass NN — <title> — <date>
Observed: …
Changed: …
Validation: …  (actual PASS/FAIL/OPEN with evidence)
Open: …
```

---

## Pass 00 — Documentation & QA-system foundation — 2026-09-19

**Context:** Kickoff. Repo was empty (README + initial commit only). Established the design-lab
documentation foundation and the QA system *spec* (this precedes any application code).

**Observed:**
- No framework, no `package.json`, no tooling, no CI — greenfield (verified via repo audit).
- Three client-supplied images; one (A-001 legacy poster) carries out-of-scope NorCal branding and
  is AI-generated (not real work); two are genuine but low/med-res vehicle photos (doc 02).
- No application exists yet → **the QA harness (Playwright/axe/Lighthouse) has nothing to render.**
  It cannot be run or claimed as passing at this point. This is stated plainly, not hidden.

**Changed / created:**
- Asset provenance system; originals preserved **read-only** with SHA-256 checksums
  (`public/assets/PROVENANCE.md`).
- Design-lab docs `00`–`15` (brand, art direction, principles, visual language, type, color/material/
  light, spacing/geometry, motion, photography, 3D, references, experience, critique).
- QA system spec (`16`) and this log (`17`).

**Validation:**
- Asset integrity — **PASS**: `shasum -a 256` recorded for all three originals; files `chmod 444`.
- Repo audit — **PASS**: greenfield confirmed.
- Automated browser/a11y/perf suites — **N/A (no app yet)**. Deferred to Pass 01+ (post-scaffold).
- Deployment — **NONE.** `DEPLOYED: NO`.

**Open / blocking next step:**
- **Stack decision required** (doc 15 Open decisions) before scaffolding the app + wiring the QA
  toolchain: framework (Astro recommended / Next / Vite+React), package manager (npm default),
  styling (Tailwind token-mapped / vanilla CSS). This anchors everything downstream.
- Highest-leverage asset gap: real cinematic photography (doc 10) — `CLIENT INPUT REQUIRED`.
- All business facts remain `CLIENT INPUT REQUIRED` (doc 01) — none fabricated.

---

_(Pass 01 will be logged after the Design Lab app is scaffolded and the baseline suite actually
runs — with real, per-browser, per-viewport evidence.)_
