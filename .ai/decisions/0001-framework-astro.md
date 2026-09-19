# 0001 — Framework: Astro (+ React islands)

DECISION: Build on **Astro** with **React islands** for isolated interactivity.
CONTEXT: Greenfield repo, no framework. Project is content-driven, image-heavy, performance-first,
mostly static with a few interactive/3D moments. Confirmed with the owner.
OPTIONS:
- **Astro + React islands** (chosen) — zero JS by default, islands only where needed, first-class
  image pipeline (AVIF/WebP/srcset), TS-native.
- **Next.js (App Router)** — app-like/SSR-heavy React; ships a React runtime site-wide (heavier default
  than this mostly-static brand site needs).
- **Vite + React SPA** — lightest tooling but weaker SEO/first-paint for the eventual production site.
WHY: Best fit for the HTML-first / JS-by-exception mandate and the perf budget (LCP ≤ 2.5s). React
islands keep the door open for React Three Fiber without paying React cost across the whole site.
TRADEOFFS: Two mental models (Astro components + React islands); some React-ecosystem patterns need
island wrappers. Accepted — the perf/restraint win outweighs it.
STATUS: accepted
DATE: 2026-09-19
