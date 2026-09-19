import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      '.lighthouseci/',
      'coverage/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // React island files: enable JSX a11y linting (accessibility designed-in, docs/13).
  {
    files: ['**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  // Browser-facing TS.
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { globals: { ...globals.browser } },
  },
  // Node scripts + ESM config files.
  {
    files: ['scripts/**/*.mjs', '*.config.{js,mjs,ts}', '*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  // CommonJS config files (Lighthouse).
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
);
