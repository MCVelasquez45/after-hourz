import { test, expect } from '@playwright/test';

test.describe('/design-lab hub', () => {
  test('loads with a 200 and the expected title', async ({ page }) => {
    const res = await page.goto('/design-lab/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Design Lab — After Hourz/);
  });

  test('has core landmarks', async ({ page }) => {
    await page.goto('/design-lab/');
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('links to foundations and the ready prototype; pending ones are not links', async ({
    page,
  }) => {
    await page.goto('/design-lab/');
    await expect(page.getByRole('link', { name: /open foundations/i })).toHaveAttribute(
      'href',
      '/design-lab/foundations/',
    );
    await expect(page.getByRole('link', { name: /open prototype/i })).toHaveAttribute(
      'href',
      '/design-lab/prototypes/booth-light/',
    );
    // Pending directions are shown but not linked (no dead links).
    await expect(page.getByText('Precision Machine')).toBeVisible();
    await expect(page.getByText('After Dark')).toBeVisible();
    await expect(page.getByRole('link', { name: /precision machine/i })).toHaveCount(0);
  });
});
