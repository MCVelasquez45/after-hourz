import { defineConfig } from 'vitest/config';

// Unit/logic tests only. E2E (Playwright) lives in tests/e2e and is excluded here.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
