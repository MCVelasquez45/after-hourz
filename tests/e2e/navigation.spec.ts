import { test, expect } from '@playwright/test';

test.describe('navigation + link integrity', () => {
  test('home routes into the design lab hub', async ({ page }) => {
    await page.goto('/');
    const enter = page.getByRole('link', { name: /enter the design lab/i });
    await expect(enter).toBeVisible();
    await enter.click();
    await expect(page).toHaveURL(/\/design-lab\/?$/);
    await expect(page.locator('main#main')).toBeVisible();
  });

  test('hub → booth-light prototype', async ({ page }) => {
    await page.goto('/design-lab/');
    await page.getByRole('link', { name: /open prototype/i }).click();
    await expect(page).toHaveURL(/\/design-lab\/prototypes\/booth-light\/?$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('no dead internal links or fake "#" links across key routes', async ({ page }) => {
    for (const route of [
      '/design-lab/',
      '/design-lab/foundations/',
      '/design-lab/prototypes/booth-light/',
    ]) {
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

  test('every in-page anchor target exists on the prototype', async ({ page }) => {
    await page.goto('/design-lab/prototypes/booth-light/');
    const anchors = await page
      .locator('a[href^="#"]')
      .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
    for (const href of anchors) {
      const id = href.slice(1);
      if (!id) continue;
      await expect(page.locator(`#${id}`), `anchor target #${id} should exist`).toHaveCount(1);
    }
  });

  test('foundations chapter nav jumps to its section', async ({ page }) => {
    await page.goto('/design-lab/foundations/');
    await page.getByRole('link', { name: /04 \/ Color \+ Material/i }).click();
    await expect(page).toHaveURL(/#material$/);
    await expect(page.locator('#material')).toBeInViewport();
  });
});
