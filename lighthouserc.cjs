/*
  Lighthouse CI (prompt §20-§21). Serves the built dist/ via our foreground static server and
  audits an EXPLICIT url list (so nested routes like the prototype are always covered).
  Assertions are warn-level: Lighthouse is EVIDENCE, not a score to game.
*/
const PORT = 4333;
const base = `http://localhost:${PORT}`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `PORT=${PORT} node scripts/serve-dist.mjs`,
      startServerReadyPattern: 'serve-dist:',
      url: [
        `${base}/design-lab/`,
        `${base}/design-lab/foundations/`,
        `${base}/design-lab/prototypes/chrome-heritage/`,
        `${base}/design-lab/prototypes/booth-light/`,
        `${base}/design-lab/prototypes/after-dark/`,
      ],
      numberOfRuns: 1,
      settings: { preset: 'desktop' },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
