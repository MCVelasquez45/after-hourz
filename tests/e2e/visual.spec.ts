import { test, expect } from '@playwright/test';

/*
  Visual regression (prompt §4, §16). Tagged @full so the fast dev run skips it;
  `pnpm test:visual` runs this file across the whole project matrix, producing
  per-browser / per-viewport baselines (the responsive "contact sheet").

  Determinism: animations are disabled via config; we also force all reveal
  elements into their settled state so below-the-fold sections aren't blank.
*/

async function settle(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
  });
  // Let layout settle after forcing reveal.
  await page.waitForTimeout(150);
}

test('@full design-lab full page', async ({ page }) => {
  await page.goto('/design-lab/');
  await settle(page);
  await expect(page).toHaveScreenshot('design-lab-full.png', { fullPage: true });
});

test('@full home full page', async ({ page }) => {
  await page.goto('/');
  await settle(page);
  await expect(page).toHaveScreenshot('home-full.png', { fullPage: true });
});

test('@full design-lab material chapter', async ({ page }) => {
  await page.goto('/design-lab/#material');
  await settle(page);
  await expect(page.locator('#material')).toHaveScreenshot('chapter-material.png');
});
