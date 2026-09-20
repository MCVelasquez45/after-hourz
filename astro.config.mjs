// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// After Hourz — Astro config.
// HTML-first, React only for genuine islands (see .ai/decisions/0005).
// Tailwind v4 via the current @tailwindcss/vite plugin (not the deprecated integration).
//
// Output = 'server' with the Cloudflare adapter so the ONE dynamic surface (the review
// submission endpoint) can run on a Worker. EVERY existing page stays static via
// `export const prerender = true` in its frontmatter — only /api/review/* is on-demand
// (reset directive §4: minimum dynamic surface). Design Lab / prototypes remain prerendered.
export default defineConfig({
  site: 'http://localhost:4321',
  output: 'server',
  // Adapter v14 (@cloudflare/vite-plugin) auto-loads local D1/vars/secrets from
  // wrangler.jsonc + .dev.vars during `astro dev` — the old `platformProxy` option
  // was removed upstream, so no adapter options are needed here.
  adapter: cloudflare(),
  // No production homepage yet. Root redirect is a PRERENDERED page (src/pages/index.astro)
  // so it is static-serveable and works identically on the Worker (server-mode config
  // redirects would be runtime-only and invisible to the static QA harness).
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Default sharp service: enables AVIF/WebP + responsive srcset from astro:assets.
    // Client originals are never mutated; derivatives are generated at build time.
    responsiveStyles: true,
  },
});
