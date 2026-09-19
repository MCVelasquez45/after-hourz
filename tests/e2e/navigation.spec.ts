import { test, expect } from '@playwright/test';

const keyRoutes = [
  '/design-lab/',
  '/design-lab/foundations/',
  '/design-lab/prototypes/chrome-heritage/',
  '/design-lab/prototypes/booth-light/',
  '/design-lab/prototypes/after-dark/',
];

test.describe('navigation + link integrity', () => {
  test('root redirects into the design lab (no production homepage yet)', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/design-lab\/?$/, { timeout: 10_000 });
    await expect(page.locator('main#main')).toBeVisible();
  });

  test('hub opens the first prototype', async ({ page }) => {
    await page.goto('/design-lab/');
    await page.locator('a.proto-panel').first().click();
    await expect(page).toHaveURL(/chrome-heritage\/?$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('no dead / placeholder links across key routes', async ({ page }) => {
    for (const route of keyRoutes) {
      await page.goto(route);
      const hrefs = await page
        .locator('a[href]')
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
      for (const href of hrefs) {
        expect(href, `bad href on ${route}`).not.toBe('#');
        expect(href.trim(), `empty href on ${route}`).not.toBe('');
      }
    }
  });

  test('in-page anchors resolve on every prototype', async ({ page }) => {
    for (const route of keyRoutes.filter((r) => r.includes('/prototypes/'))) {
      await page.goto(route);
      const anchors = await page
        .locator('a[href^="#"]')
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
      for (const href of anchors) {
        const id = href.slice(1);
        if (!id) continue;
        await expect(page.locator(`#${id}`), `#${id} missing on ${route}`).toHaveCount(1);
      }
    }
  });

  test('foundations chapter nav jumps to its section', async ({ page }) => {
    await page.goto('/design-lab/foundations/');
    await page.getByRole('link', { name: /04 \/ Color \+ Material/i }).click();
    await expect(page).toHaveURL(/#material$/);
    await expect(page.locator('#material')).toBeInViewport();
  });
});
