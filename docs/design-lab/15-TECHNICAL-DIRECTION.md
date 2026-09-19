# 15 — Technical Direction

Visual complexity is never an excuse for poor engineering (doc 04 P9). This document sets the
technical quality bar and the recommended stack. **The framework choice is a recommendation pending
client/owner confirmation** (see "Open decisions" — it anchors the whole toolchain, so it's
confirmed before scaffolding, not assumed).

## Technical quality bar (targets)

- Semantic HTML; WCAG **AA**-conscious interaction; full keyboard access; visible focus; no traps.
- Responsive & *composed* per device (doc 08/13, QA §24), not merely stacked.
- Excellent Lighthouse scores as a *result* of good engineering — never gamed (QA §8).
- Performant images: **AVIF/WebP**, responsive `srcset`/`sizes`, lazy-load below the fold,
  intentional preload only when justified. Originals immutable; derivatives via pipeline (doc 22).
- Minimal layout shift (reserve space via `aspect-ratio`), intentional preloading.
- **Reduced JavaScript** by default; ship JS only where interactivity needs it (islands).
- Progressive enhancement: core content/nav works without JS; motion/3D are enhancements.
- SEO fundamentals; structured metadata; strong mobile behavior.

## Recommended stack (rationale-driven)

The project is **content-driven, image-heavy, performance-first, mostly static with isolated islands
of interactivity** (motion, maybe one 3D moment). That profile points to a static-first framework
with an islands model.

**Recommendation:**
- **Astro** — ships zero JS by default, first-class islands, excellent image pipeline
  (`astro:assets` → AVIF/WebP/`srcset`), MPA-fast, TypeScript-native. Best fit for doc 04 P9 and the
  perf budget below.
- **TypeScript** (strict) across the project.
- **React islands** *only where needed* (interactive Lab controls; a potential R3F 3D island).
  Keeps the door open for React Three Fiber (doc 11) without paying React cost site-wide.
- **Tailwind CSS**, configured **from our tokens** (doc 06/07/08) — utilities map to the real design
  system, not arbitrary values. (Alternative: vanilla CSS + custom properties. Decide in Lab; either
  is token-driven.)
- **npm** as package manager (matches the QA protocol's `npm run …` commands; empty repo, no
  existing lockfile — see Open decisions if pnpm/bun preferred).
- Motion: native/CSS + IntersectionObserver first; **GSAP/Lenis/Motion added only if justified**
  (doc 09) and code-split.
- 3D (if greenlit): **Three.js**, code-split island, R3F/Drei only alongside React (doc 11).

**Why not Next.js:** viable and a fine choice if an app-like, SSR/route-heavy product is wanted, but
it ships a React runtime by default and is heavier than this mostly-static, image-first brand site
needs. Recommend Astro unless the owner wants a React-app architecture — a real fork worth confirming.

## Performance budgets (initial — enforced via doc 16 / QA §9,21)

**Core Web Vitals:** LCP ≤ **2.5s** · CLS ≤ **0.1** · INP ≤ **200ms** (where measurable).

**JavaScript:** initial client JS intentionally small (target island-only; set a concrete KB budget
in the Lab once a baseline exists). Any major library must justify its weight in doc 17.

**Images:** no multi-MB images to small devices; responsive `srcset`; AVIF/WebP; lazy below fold.
Client originals never served raw — derivatives only.

**Fonts:** minimize families/weights (doc 06's 3–4 roles); prefer **variable fonts**; subset when
useful; `font-display: swap`; self-host (no external CDN request in the critical path). Don't load
experimental fonts without logging them (QA §9 fonts).

## Accessibility requirements (doc 07/13)

- Text contrast AA (≥4.5:1 body, ≥3:1 large); verified per pair in the Lab.
- Never convey meaning by color alone; visible focus everywhere; logical tab order.
- Landmarks, one `h1`/logical heading order, labeled controls, honest `alt` text.
- Reduced-motion path fully coherent (doc 09).
- Enforced by `@axe-core/playwright` + keyboard journeys (doc 16).

## Architecture principles

- **Token layer** (`design tokens` → CSS custom properties / Tailwind config) is the single source
  of truth for space, type, color, radii, motion (doc 23 → tokens created after Lab validation).
- **Islands** are self-contained, code-split, lazy where possible; each cleans up (no orphaned
  RAF/listeners — doc 11, QA §11).
- **Design Lab experiments** are clearly labeled and isolated so experimentation doesn't become
  repository entropy (QA §20/§36).
- Progressive enhancement is structural, not bolted on.

## CI-readiness (doc 16 / QA §38)

Test architecture is authored so a future GitHub Actions pipeline can run:
`checkout → install → typecheck → lint → test → build → Playwright → a11y → visual`. Heavy perf
audits (Lighthouse) run separately. **No deployment configured in this phase.**

## Open decisions (confirm before scaffolding)

1. **Framework: Astro (recommended) vs Next.js vs Vite+React.** Anchors the entire toolchain.
2. **Package manager: npm (default) vs pnpm vs bun.**
3. **Styling: Tailwind (token-mapped) vs vanilla CSS + custom properties.**
4. **React islands now vs defer** until an interactive/3D experiment needs them.
