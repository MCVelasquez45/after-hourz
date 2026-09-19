# 0009 — Pin TypeScript to 5.x

DECISION: Pin **TypeScript to ^5** (currently 5.9.3), not the latest 7.x native compiler.
CONTEXT: `pnpm add -D typescript` resolved to TypeScript **7.0.2** (the new Go-based "native" compiler).
`astro check` failed: TS 7 does not yet expose the programmatic language-service API that
`@astrojs/check` / the Astro language server rely on. `typescript-eslint` 8.x also targets ≤5.x.
OPTIONS:
- Pin to 5.x (chosen) — stable, full API, works with astro-check + typescript-eslint today.
- Stay on 7.x (rejected) — breaks `pnpm typecheck` and lint type-awareness now.
WHY: Type-checking is a required QA gate (§11); it must actually run. 5.x is the supported line.
TRADEOFFS: Not on the newest/fastest compiler yet. Revisit when Astro tooling + typescript-eslint
support TS 7's native API (withastro roadmap #1321).
STATUS: accepted (revisit when ecosystem supports TS 7)
DATE: 2026-09-19
