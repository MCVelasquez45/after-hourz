import { test, expect } from '@playwright/test';

/*
  Console + network cleanliness (prompt §14, §15). A dirty console is never normalized.
  Known-intentional exceptions must be documented here and in docs/design-lab/17. Currently: none.
*/

const routes = [
  '/design-lab/',
  '/design-lab/foundations/',
  '/design-lab/prototypes/chrome-heritage/',
  '/design-lab/prototypes/booth-light/',
  '/design-lab/prototypes/after-dark/',
];

for (const route of routes) {
  test(`clean console + network @ ${route}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];
    const badResponses: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'failed'}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) badResponses.push(`${res.status()} ${res.url()}`);
    });

    await page.goto(route);
    await page.waitForLoadState('networkidle');

    expect(pageErrors, 'no uncaught page exceptions').toEqual([]);
    expect(consoleErrors, 'no console errors').toEqual([]);
    expect(failedRequests, 'no failed requests').toEqual([]);
    expect(badResponses, 'no 4xx/5xx responses').toEqual([]);
  });
}
