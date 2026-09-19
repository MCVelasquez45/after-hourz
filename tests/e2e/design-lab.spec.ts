import { test, expect } from '@playwright/test';

test.describe('/design-lab hub', () => {
  test('loads 200 with expected title + landmarks', async ({ page }) => {
    const res = await page.goto('/design-lab/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Design Lab — After Hourz/);
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('links to all three prototype directions', async ({ page }) => {
    await page.goto('/design-lab/');
    const hrefs = await page
      .locator('a.proto-panel')
      .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')));
    expect(hrefs).toEqual([
      '/design-lab/prototypes/chrome-heritage/',
      '/design-lab/prototypes/booth-light/',
      '/design-lab/prototypes/after-dark/',
    ]);
  });

  test('links to foundations', async ({ page }) => {
    await page.goto('/design-lab/');
    await expect(page.locator('a[href="/design-lab/foundations/"]')).toHaveCount(1);
  });
});
