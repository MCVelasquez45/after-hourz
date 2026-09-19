import { test, expect } from '@playwright/test';

test.describe('/design-lab/foundations', () => {
  test('loads and renders all seven chapters', async ({ page }) => {
    const res = await page.goto('/design-lab/foundations/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Foundations — After Hourz/);
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
    await expect(page.locator('section.chapter')).toHaveCount(7);
  });

  test('the React island hydrates and reports live state', async ({ page }) => {
    await page.goto('/design-lab/foundations/');
    const probe = page.getByLabel('Live runtime quality probe');
    await probe.scrollIntoViewIfNeeded();
    await expect(probe).toBeVisible();
    await expect(probe.getByText('viewport')).toBeVisible();
    await expect(probe.getByText('react island')).toBeVisible();
  });

  test('back link returns to the hub', async ({ page }) => {
    await page.goto('/design-lab/foundations/');
    await page
      .getByRole('link', { name: /design lab/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/design-lab\/?$/);
  });
});
