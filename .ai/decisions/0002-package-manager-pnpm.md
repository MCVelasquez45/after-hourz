# 0002 — Package manager: pnpm

DECISION: Use **pnpm** as the package manager.
CONTEXT: Greenfield repo, no lockfile. Owner selected pnpm (superseding an earlier npm default). QA
protocol examples were written as `npm run …`; those map 1:1 to `pnpm …`.
OPTIONS:
- **pnpm** (chosen) — fast, disk-efficient (content-addressed store), strict/non-flat `node_modules`
  that catches phantom dependencies.
- **npm** — universal, zero extra install, matched the protocol's example commands verbatim.
- **bun** — fastest install + built-in test runner, but newer with some tooling edge cases.
WHY: Owner preference; pnpm's strictness suits a project that wants dependency discipline (each dep
must justify its bytes — see performance skill). Command names in docs are pnpm-equivalent.
TRADEOFFS: Requires pnpm installed in dev/CI; strict resolution occasionally needs `public-hoist`
tweaks for tools expecting flat `node_modules`. Minor.
STATUS: accepted
DATE: 2026-09-19
