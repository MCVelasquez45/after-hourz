// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// After Hourz — Astro config.
// HTML-first, React only for genuine islands (see .ai/decisions/0005).
// Tailwind v4 via the current @tailwindcss/vite plugin (not the deprecated integration).
export default defineConfig({
  site: 'http://localhost:4321',
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
