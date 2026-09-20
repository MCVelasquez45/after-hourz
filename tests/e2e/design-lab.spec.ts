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
    // Each direction has at least one visible link to its prototype route.
    for (const dir of ['chrome-heritage', 'booth-light', 'after-dark']) {
      await expect(page.locator(`a[href="/design-lab/prototypes/${dir}/"]`).first()).toBeVisible();
    }
    // The three directions are presented in canonical order on the hub.
    const order = await page
      .locator('a[href^="/design-lab/prototypes/"]')
      .evaluateAll((as) =>
        as
          .map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? '')
          .filter((h) => /\/prototypes\/[a-z-]+\/$/.test(h)),
      );
    const firstSeen = ['chrome-heritage', 'booth-light', 'after-dark'].map((d) =>
      order.indexOf(`/design-lab/prototypes/${d}/`),
    );
    expect(
      firstSeen.every((i) => i >= 0),
      'all three prototype links present',
    ).toBe(true);
    expect(firstSeen, 'canonical order').toEqual([...firstSeen].sort((a, b) => a - b));
  });

  test('links to foundations', async ({ page }) => {
    await page.goto('/design-lab/');
    await expect(page.locator('a[href="/design-lab/foundations/"]')).toHaveCount(1);
  });
});
