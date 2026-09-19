# Islands

React islands live here. **Hydrate only for genuine client-side interactivity** (decisions 0005;
`.ai/prompts/frontend-architect.md`). Preference order: static Astro → CSS → native JS → React island
→ WebGL.

Rules:

- Each island must justify its hydration in a top-of-file comment.
- Prefer `client:visible` / `client:idle` over `client:load`.
- Clean up listeners/observers/rAF on unmount (no leaks).
- Keep them small and code-split.

Current islands:

- `QualityStatus.tsx` — live runtime probe (viewport, DPR, reduced-motion, hydration). Justified
  because it reports state unknowable at build time. Used on `/design-lab` chapter 07.
