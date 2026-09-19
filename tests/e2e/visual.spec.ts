import { test, expect, type Page } from '@playwright/test';

/*
  Visual regression (prompt §4, §16). Tagged @full so the fast dev run skips it;
  `pnpm test:visual` runs across the project matrix producing per-viewport baselines.
  Determinism: animations disabled via config; reveal elements forced to settled state.
*/

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
  });
  await page.waitForTimeout(150);
}

const fullPages: Array<[string, string]> = [
  ['home-full.png', '/'],
  ['hub-full.png', '/design-lab/'],
  ['foundations-full.png', '/design-lab/foundations/'],
  ['booth-light-full.png', '/design-lab/prototypes/booth-light/'],
];

for (const [name, route] of fullPages) {
  test(`@full ${name}`, async ({ page }) => {
    await page.goto(route);
    await settle(page);
    await expect(page).toHaveScreenshot(name, { fullPage: true });
  });
}

test('@full booth-light hero', async ({ page }) => {
  await page.goto('/design-lab/prototypes/booth-light/');
  await settle(page);
  await expect(page.locator('.bl-hero')).toHaveScreenshot('booth-light-hero.png');
});
