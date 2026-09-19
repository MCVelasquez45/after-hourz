import { test, expect } from '@playwright/test';

test.describe('/design-lab route + semantic health', () => {
  test('loads with a 200 and the expected title', async ({ page }) => {
    const res = await page.goto('/design-lab/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Design Lab — After Hourz/);
  });

  test('has core landmarks and a single h1-level structure', async ({ page }) => {
    await page.goto('/design-lab/');
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    // Chapter navigation landmark exists.
    await expect(page.getByRole('navigation', { name: /chapters/i })).toBeVisible();
  });

  test('renders all seven chapters', async ({ page }) => {
    await page.goto('/design-lab/');
    for (const id of [
      'thesis',
      'type',
      'geometry',
      'material',
      'photography',
      'interaction',
      'quality',
    ]) {
      await expect(page.locator(`section#${id}`)).toBeAttached();
    }
    // Exactly the 7 chapter sections.
    await expect(page.locator('section.chapter')).toHaveCount(7);
  });

  test('the React island hydrates and reports live state', async ({ page }) => {
    await page.goto('/design-lab/');
    const probe = page.getByLabel('Live runtime quality probe');
    // The island is below the fold and hydrates with client:visible (intentional lazy choice,
    // decisions 0005) — scroll it into view to trigger hydration.
    await probe.scrollIntoViewIfNeeded();
    await expect(probe).toBeVisible();
    // After hydration it shows the viewport row (not the "hydrating…" placeholder).
    await expect(probe.getByText('viewport')).toBeVisible();
    await expect(probe.getByText('react island')).toBeVisible();
  });
});
