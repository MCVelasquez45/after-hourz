import { test, expect } from '@playwright/test';

test.describe('navigation + link integrity', () => {
  test('home routes into the design lab', async ({ page }) => {
    await page.goto('/');
    const enter = page.getByRole('link', { name: /enter the design lab/i });
    await expect(enter).toBeVisible();
    await enter.click();
    await expect(page).toHaveURL(/\/design-lab\/?$/);
    await expect(page.locator('main#main')).toBeVisible();
  });

  test('no dead internal links or fake "#" links', async ({ page }) => {
    await page.goto('/design-lab/');
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      // No placeholder anchors pretending to work.
      expect(href).not.toBe('#');
      expect(href.trim()).not.toBe('');
    }
  });

  test('every in-page anchor target exists', async ({ page }) => {
    await page.goto('/design-lab/');
    const anchors = await page
      .locator('a[href^="#"]')
      .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
    for (const href of anchors) {
      const id = href.slice(1);
      if (!id) continue;
      await expect(page.locator(`#${id}`), `anchor target #${id} should exist`).toHaveCount(1);
    }
  });

  test('chapter nav links jump to their sections', async ({ page }) => {
    await page.goto('/design-lab/');
    await page.getByRole('link', { name: /04 \/ Color \+ Material/i }).click();
    await expect(page).toHaveURL(/#material$/);
    await expect(page.locator('#material')).toBeInViewport();
  });
});
