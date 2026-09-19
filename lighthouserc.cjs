/*
  Lighthouse CI (prompt §20-§21). Serves the built dist/ statically and audits both routes.
  Assertions are warn-level: Lighthouse is EVIDENCE, not a score to game. Real regressions
  surface as warnings in the report; we investigate rather than delete design to inflate a number.
*/
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      // Both built routes (index.html files are auto-discovered under staticDistDir).
      numberOfRuns: 1,
      settings: {
        // Desktop-class baseline; mobile throttling explored separately later.
        preset: 'desktop',
      },
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
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
