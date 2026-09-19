import { defineConfig, devices } from '@playwright/test';

/*
  Playwright — cross-browser + responsive matrix (docs/16, prompt §13-§15).
  Server: production build via `astro preview` (accurate console/perf, no dev HMR noise).
  - Fast matrix (dev): chromium-desktop, minus @full-tagged specs.
  - Full matrix (milestone): all browsers + viewport projects.
*/

// Dedicated test port (NOT 4321) so tests never reuse a running `astro dev` daemon —
// they must exercise the real production build served from dist/.
const PORT = 4331;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Astro 7's `astro preview` daemonizes; use a foreground static server for dist/ instead.
    // PORT is fixed to the dedicated test port; never reuse an external server (avoids the dev daemon).
    command: `pnpm build && PORT=${PORT} node scripts/serve-dist.mjs`,
    url: `${BASE_URL}/design-lab/`,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    // ---- Desktop (all three engines) — core cross-browser coverage ----
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    // ---- Responsive viewport projects (Chromium) — full matrix ----
    {
      name: 'chromium-narrow',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 } },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'chromium-tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1194 } },
    },
    {
      name: 'chromium-wide',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
