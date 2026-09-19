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

## Pass 02 — Flagship prototype: "Booth Light" + lab restructure — 2026-09-19

**Context:** Enterprise Design Lab, flagship-first. Restructured the lab into a hub + foundations +
prototypes, and built the first complete, client-review-ready prototype (Direction A — Booth Light):
a full narrative page (hero → statement → work → craft → services → shop → contact → footer),
interactive (sticky header, scroll reveals, hover states), responsive, and truthful (all unknown
business facts marked CLIENT INPUT REQUIRED; no fabricated stats/testimonials/awards).

**Structure now:** `/design-lab` (hub) · `/design-lab/foundations` (moved token studies) ·
`/design-lab/prototypes/booth-light` (flagship). Precision Machine + After Dark are status cards
(not built — pending approval of this bar).

**Observed via rendered pixels (not source):**
- **P1 — visual tests were hitting the leftover `astro dev` daemon (port 4321), not production.** The
  Astro **dev toolbar** appeared in baselines; tests exercised the dev build. Caught only by looking
  at a screenshot. Fixed: dedicated test port 4331, `reuseExistingServer:false`, LHCI on 4333
  (decision 0012).
- **P1 — axe `link-in-text-block` (serious)** on foundations: the inline "← Design Lab" back-link was
  distinguished from surrounding text by colour only. Fixed: underlined it.
- **P2 — test selector clash:** `getByLabel(/vehicle/i)` matched the form field AND the chips'
  `aria-label="Vehicle categories"`. Fixed the test to `getByLabel('Vehicle', {exact:true})`
  (correct specificity, not a weakening).
- **Process note:** I initially `tail`-truncated a Playwright summary and missed a "14 failed" line;
  corrected by always capturing the full summary. The failures above were then found and fixed.

**Validation (actual, full-summary — no truncation):**
```
Static:   astro check 0 errors · eslint 0 · prettier PASS · vitest 3/3 · build PASS (4 pages)
Full matrix (test:e2e, all specs incl. 35 visual, 7 projects): 285 passed, 2 skipped, 0 failed
Accessibility (test:a11y, all projects):                        47 passed, 2 skipped, 0 failed
  axe serious/critical: 0 on / , /design-lab/ , /foundations/ , /prototypes/booth-light/
  (2 skips = documented WebKit Tab-order behavior)
Console + network: 0 errors / 0 failed requests across all 4 routes
Reduced motion: coherent on the prototype (reveals visible; smooth-scroll off)
Visual: 35 baselines generated AND reviewed (booth-light desktop + mobile + hero inspected as pixels)
Lighthouse (desktop, dist, all 4 routes):
  /                         Perf 100 · A11y 100 · BP 96 · SEO 60 · LCP 0.2s · CLS 0
  /design-lab/              Perf 100 · A11y 100 · BP 96 · SEO 60 · LCP 0.2s · CLS 0
  /design-lab/foundations/  Perf 100 · A11y  95 · BP 96 · SEO 63 · LCP 0.3s · CLS 0
  /prototypes/booth-light/  Perf 100 · A11y 100 · BP 96 · SEO 63 · LCP 0.3s · CLS 0
Assets:   CLIENT ORIGINALS MODIFIED: NO (checksums match Pass 00)
Deploy:   NONE
```

**Design review (distinct concerns):**
- **Creative Director:** Booth Light thesis reads clearly; restrained, on-brand, not a template.
  Concern: differentiation ultimately depends on real cinematic photography (placeholders honest but
  a stand-in).
- **Art Director:** strong hero + narrative rhythm; the daylight client photo (bright, grassy show
  bg) slightly fights the nocturnal mood even darkened — real reshoot needed for a true hero.
- **Product Designer:** clear journey + reachable contact; nav collapses correctly on mobile.
- **Red Team:** "dark cinematic" isn't inherently unique — the craft imagery must carry it; and the
  hero right-column is empty (single-column) — acceptable restraint but a candidate asymmetric moment.

**Open / known:**
- Foundations A11y 95 (moderate, non-serious axe items); booth-light + hub + home 100.
- SEO 60/63 = intentional noindex (internal lab).
- Real photography is the top unblock for hero credibility (docs/10) — CLIENT INPUT REQUIRED.
- Prototypes B (Precision Machine) + C (After Dark) not built — pending approval of this bar.

---

## Pass 01 — Design Lab runtime + QA foundation made real — 2026-09-19

**Context:** Phase 02. Scaffolded the actual application (Astro 7 + React islands + pnpm + Tailwind v4)
and turned the QA spec (doc 16) into installed, runnable tooling. Foundation committed first as a
clean Git boundary (`0c66179`) before any framework files.

**Observed (first render — inspected as pixels, not source):**
- **P1 — Lab stylesheet not loaded.** `design-lab.css` was never imported by `global.css`, so
  `.chapter/.swatch/.material/.btn/.study` had no styles: swatches rendered as plain text, material
  tiles/buttons unstyled. **All 145 automated tests passed while this was broken** — proving why
  render-before-judging is mandatory (§5, §30E). Caught only by viewing the screenshot.
- **P1 — axe color-contrast (serious): 11 on /design-lab, 1 on /.** `pewter` (#5B6472) caption/label
  text failed WCAG AA 4.5:1 on the near-black surfaces.
- **P2 — React island hydration test failed.** `QualityStatus` uses `client:visible` (correct lazy
  choice, below the fold); the test asserted hydrated state without scrolling it into view.
- **Cross-browser — WebKit keyboard tests failed (×2).** WebKit/Safari excludes `<a>` from default
  sequential Tab focus (macOS "Full Keyboard Access" off) — a genuine platform difference, not a page
  defect. Chromium + Firefox pass the link-focus journey.

**Changed (fixes, highest severity first):**
- Imported `design-lab.css` in `global.css` (P1). Re-rendered → lab now displays swatches, material
  studies (chrome edge / gloss / graphite / signal), spacing bars, 12-col grid, photography study.
- Raised `pewter` #5B6472 → **#7E8896** to meet AA (docs/07 ladder updated) (P1). Re-ran axe: clean.
- Scrolled the island into view before asserting hydration (P2) — correct test fix, not a weakening.
- Scoped the two Tab-based keyboard tests to Chromium+Firefox with a documented `test.skip` on WebKit
  (known platform behavior) — coverage preserved on 2 engines; reason recorded here (§14/§40).
- Pinned TypeScript to 5.x (astro-check has no API on TS 7 native); added React types; fixed ESLint
  flat-config globals for `.cjs`; replaced Astro 7's daemonizing `preview` with a foreground static
  server for Playwright.

**Validation (actual results):**
```
Static:   typecheck astro-check   PASS (0 errors / 0 warnings / 0 hints)
          eslint                  PASS (0)
          prettier --check        PASS
          vitest                  PASS (3/3)
          astro build             PASS (2 pages, images optimized)
Browser matrix (Playwright):
          chromium-desktop        PASS
          firefox-desktop         PASS
          webkit-desktop          PASS (2 keyboard tests skipped — documented WebKit Tab behavior)
          chromium narrow/mobile/tablet/wide (320/390/834/1920)  PASS
          => 145 passed, 2 skipped
Visual:   21 baselines generated AND reviewed (desktop/mobile inspected as pixels); re-run PASS
Console:  0 errors · 0 pageerrors · 0 failed requests · 0 4xx/5xx  (both routes)
axe:      0 serious / 0 critical  (both routes)
Reduced motion: coherent (reveals visible; smooth-scroll off)  PASS
Lighthouse (desktop, static dist):
          /            Perf 100 · A11y 100 · BestPractices 96 · SEO 60 · LCP 0.2s · CLS 0 · TBT 0ms
          /design-lab/ Perf 100 · A11y 100 · BestPractices 96 · SEO 63 · LCP 0.2s · CLS 0 · TBT 0ms
Bundle:   home ~0 client JS; /design-lab ~222kB (of which ~213kB is the React runtime for the ONE
          island, lazy client:visible, lab-only). AVIF/WebP pipeline working (1139kB→7–90kB).
Assets:   CLIENT ORIGINALS MODIFIED: NO (checksums match Pass 00)
Security: pnpm audit --prod → 0 known vulnerabilities
Deploy:   NONE
```

**Open / known:**
- **SEO 60/63** = intentional `noindex,nofollow` on the internal lab (not the public site). Expected;
  not a defect. Will not apply to production.
- **React runtime cost (~213kB) for one probe** — justified now as proving the island pipeline
  (R3F/3D later), lazy + lab-only, perf still 100. **Open decision:** make the probe vanilla JS for
  production vs. keep React island. Logged in decisions.
- **dist ~12MB** dominated by upscaled PNG fallbacks in `srcset`; AVIF/WebP are tiny. Consider
  dropping oversized PNG fallbacks later (P3).
- Best-Practices 96 (not 100) — minor; above threshold; not chased (§31).
- Named display/body/mono faces not yet self-hosted (fallback stacks active) — docs/06 open item.

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
