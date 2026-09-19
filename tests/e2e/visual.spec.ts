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
  ['hub-full.png', '/design-lab/'],
  ['foundations-full.png', '/design-lab/foundations/'],
  ['chrome-heritage-full.png', '/design-lab/prototypes/chrome-heritage/'],
  ['booth-light-full.png', '/design-lab/prototypes/booth-light/'],
  ['after-dark-full.png', '/design-lab/prototypes/after-dark/'],
];

for (const [name, route] of fullPages) {
  test(`@full ${name}`, async ({ page }) => {
    await page.goto(route);
    await settle(page);
    await expect(page).toHaveScreenshot(name, { fullPage: true });
  });
}
