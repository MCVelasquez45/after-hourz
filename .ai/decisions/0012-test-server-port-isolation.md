# 0012 — Isolate the test server on a dedicated port

DECISION: Playwright's webServer runs on a **dedicated port (4331)** with `reuseExistingServer: false`;
Lighthouse uses its own (4333). Neither uses 4321 (the `astro dev` port).
CONTEXT: A leftover `astro dev` daemon (Astro 7 daemonizes) was running on 4321. Playwright's
`webServer` with `reuseExistingServer: true` + url `localhost:4321` **reused the dev server** instead
of building and serving `dist/`. Result: the **Astro dev toolbar appeared in visual baselines** and
tests were exercising the dev build, not production. Caught by inspecting a screenshot (the toolbar
pill) — not by any assertion.
OPTIONS:
- Dedicated test port + no reuse (chosen) — tests always build + serve real `dist`, fully isolated
  from any running dev server; dev (4321) and tests (4331) coexist.
- Stop the dev daemon before tests (rejected) — fragile; also kills the URL the user is browsing.
WHY: Tests must verify the production build, deterministically, regardless of a dev server running.
TRADEOFFS: Always rebuilds for a test run (no reuse) — a few extra seconds. Worth it for correctness.
STATUS: accepted
DATE: 2026-09-19
