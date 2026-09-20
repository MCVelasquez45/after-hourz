# After Hourz

Digital design work for **After Hourz by Anthony Montoya** — Southern California custom auto
body, paint, restoration, and lowrider craftsmanship.

This repo is currently a **Design Lab + client-review package**, not the production website. It
holds three fully-built design directions and a private client-review app used to pick a
direction and gather intake. The production site has **not** been built yet.

## Stack

- **Astro 7** (`output: 'server'`) — HTML-first; every page is prerendered (`export const
  prerender = true`) except the review API endpoints.
- **React** islands only where genuinely interactive (the review questionnaire).
- **Tailwind v4** via `@tailwindcss/vite`, mapped to design tokens in `src/styles/tokens.css`
  (+ `lowrider.css`, `fonts.css`, self-hosted fonts in `public/fonts/`).
- **Cloudflare** adapter (`@astrojs/cloudflare`) — the client-review app deploys to a Worker
  with **D1** (submissions), **R2** (optional uploads), and **Turnstile** (spam protection).

## Routes

| Route | What it is |
| --- | --- |
| `/design-lab/` | Internal hub — the three directions + boards + foundations (local only) |
| `/design-lab/prototypes/{chrome-heritage,booth-light,after-dark}/` | The three full prototype websites |
| `/design-lab/directions/*`, `/design-lab/foundations/` | Art-direction boards + design system (internal) |
| `/review/after-hourz/` | Client review app — pick a direction + guided intake questionnaire |
| `/api/review/submit`, `/api/review/upload` | Worker endpoints (D1 + R2 + Turnstile) |

### The three directions (client-facing names)

- **Chrome Heritage** — showroom heritage: candy, chrome & gold-leaf.
- **Candy Cobalt** — clean candy finish read under one light.
- **Midnight Boulevard** — cinematic lowrider night cruise.

All three share **one locked brand** (the real chrome "After Hourz" lettering + a black /
chrome / cobalt-blue palette sampled from the client poster). They are distinct editions, not
three brands.

## Run it locally

```bash
pnpm install
pnpm dev            # http://localhost:4321  — full internal Design Lab
```

- Open **http://localhost:4321/design-lab/** for the internal lab.
- Add `?review=1` to any prototype to preview it in **client mode** (internal chrome hidden),
  e.g. `…/prototypes/after-dark/?review=1`.
- The client review app is at **/review/after-hourz/**.

### Client vs internal mode

The deployed client-review environment builds with `PUBLIC_CLIENT_MODE=1`, which hides all
internal labels and (via `public/_redirects`) sends `/` and `/design-lab/*` to the review app —
so the client only ever sees the review + the three designs. Locally (`pnpm dev`) the full
internal lab stays available; `_redirects` is ignored by the dev/static servers.

## Quality

```bash
pnpm qa             # fast: typecheck + lint + unit + build + chromium e2e
pnpm qa:full        # milestone: + format, full browser matrix, a11y, Lighthouse (visual is non-blocking)
```

Tests (`tests/e2e/`, Playwright) serve the production build on port **4331** — never the dev
server. `scripts/shoot.mjs` renders any route across the viewport matrix for pixel review.

## Client-review tooling

Retrieve and turn a client submission into a build brief (queries D1 locally by default,
`--remote` for the deployed database):

```bash
pnpm review:list                 # list submissions
pnpm review:pull <id>            # save the submission JSON to .local/ (git-ignored)
pnpm review:assets <id>          # download uploaded R2 files to .local/<id>/assets/
pnpm review:context <id>         # generate a Markdown intake brief (fact vs derived vs open)
pnpm review:brief <id>           # generate an internal production brief
pnpm review:backup               # export all submissions locally
```

Cloudflare config lives in `wrangler.jsonc`; D1 schema in `migrations/`. Secrets
(`.dev.vars`, Turnstile secret) and client data (`.local/`) are git-ignored — never committed.

## Deploy

The **temporary client-review Worker** deploys from the local build via Wrangler:

```bash
PUBLIC_CLIENT_MODE=1 pnpm build && pnpm exec wrangler deploy
```

**Not authorized without explicit approval:** GitHub push, production deployment, production DNS.
Only the temporary Cloudflare client-review deployment is authorized. R2 uploads require R2 to be
enabled on the Cloudflare account.

## Ground rules

- Client originals in `public/assets/originals/` are **immutable** (`pnpm verify:assets`).
  Everything under `public/assets/prototype/` is licensed **stock reference** — documented in
  `docs/design-lab/ASSET-SOURCES.md`, never presented as Anthony's completed work.
- **Southern California** brand — no NorCal / QUINCY / Northern-California references.
- Unknown business facts are marked `CLIENT INPUT REQUIRED`, never fabricated.

## Where to read more

- **Authoritative brand / art-direction / QA docs:** `docs/design-lab/` (files 00–17) +
  `BRAND-SYSTEM.md`.
- **How the AI agents work / reviewer roles / procedures:** `.ai/` (`README.md`, `prompts/`,
  `skills/`, `workflows/`, `decisions/`).
- **Project routing + non-negotiables:** `CLAUDE.md`.
