import { test, expect } from '@playwright/test';

const ROUTE = '/design-lab/prototypes/booth-light/';

test.describe('Prototype A — Booth Light', () => {
  test('loads with a 200 and a single h1', async ({ page }) => {
    const res = await page.goto(ROUTE);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Booth Light \(prototype\)/);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('has landmarks and all narrative sections', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: /primary/i })).toBeVisible();
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    for (const id of ['top', 'work', 'craft', 'services', 'about', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('primary nav anchors resolve to real targets', async ({ page }) => {
    await page.goto(ROUTE);
    const anchors = await page
      .locator('.bl-nav a[href^="#"]')
      .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
    expect(anchors.length).toBeGreaterThan(0);
    for (const href of anchors) {
      await expect(page.locator(href)).toHaveCount(1);
    }
  });

  test('is truthful: unknown facts are marked CLIENT INPUT REQUIRED, no fake stats/testimonials', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await expect(page.getByText('CLIENT INPUT REQUIRED').first()).toBeVisible();
    // Guard against fabricated credibility content sneaking in.
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('years of experience');
    expect(body).not.toContain('5-star');
    expect(body).not.toContain('★');
  });

  test('the prototype enquiry form is labeled and keyboard-usable', async ({ page }) => {
    await page.goto(ROUTE);
    const name = page.getByLabel(/your name/i);
    await name.focus();
    await expect(name).toBeFocused();
    // exact:true so it targets the form field, not the chips' aria-label "Vehicle categories".
    await expect(page.getByLabel('Vehicle', { exact: true })).toBeVisible();
    await expect(page.getByLabel(/what do you want done/i)).toBeVisible();
  });

  test('sticky header reflects scroll state', async ({ page }) => {
    await page.goto(ROUTE);
    const header = page.locator('.bl-header');
    await expect(header).toHaveAttribute('data-scrolled', 'false');
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveAttribute('data-scrolled', 'true');
  });
});
