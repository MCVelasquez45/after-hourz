import { test, expect, type Page } from '@playwright/test';

/*
  Visual regression (prompt §4, §16). Tagged @full so the fast dev run skips it;
  `pnpm test:visual` runs across the project matrix producing per-viewport baselines.
  Determinism: animations disabled via config; reveal elements forced to settled state.
*/

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  // Deterministic full-page capture: force reveal state, eager-load every lazy image,
  // scroll the whole page to trigger any IO-based loads, then wait for fonts + decode.
  await page.evaluate(async () => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      (img as HTMLImageElement).loading = 'eager';
    });
    const step = 600;
    const height = document.body.scrollHeight;
    for (let y = 0; y <= height; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 24));
    }
    window.scrollTo(0, 0);
    if (document.fonts) await document.fonts.ready;
    await Promise.all(
      [...document.images].map((img) =>
        img.complete ? Promise.resolve() : img.decode().catch(() => {}),
      ),
    );
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(250);
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
