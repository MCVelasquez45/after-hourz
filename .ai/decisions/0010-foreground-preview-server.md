# 0010 — Foreground static server for Playwright (not `astro preview`)

DECISION: Playwright's `webServer` runs `pnpm build && node scripts/serve-dist.mjs` — a tiny
zero-dependency foreground static server for `dist/` — instead of `astro preview`.
CONTEXT: Astro 7's `astro preview` **daemonizes** (returns immediately: "preview server already
running", with `astro preview stop/status/logs`). Playwright reads the early exit as
"webServer exited early" and aborts, even though the server is actually serving 200s.
OPTIONS:
- Foreground `scripts/serve-dist.mjs` (chosen) — stays in foreground, cross-platform, zero deps,
  serves the production build (accurate console/perf, no dev HMR noise).
- `astro dev` (rejected) — foreground but injects HMR client → console noise + non-production JS.
- Manage the astro preview daemon around tests (rejected) — fragile lifecycle, port/pid handling.
WHY: Reproducible, foreground, production-accurate test server (prompt §13).
TRADEOFFS: A small custom server to maintain (~50 lines). Acceptable and dependency-free.
STATUS: accepted
DATE: 2026-09-19
