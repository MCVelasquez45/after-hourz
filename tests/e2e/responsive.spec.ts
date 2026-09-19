import { test, expect } from '@playwright/test';

/*
  Layout sanity across whatever viewport the current Playwright project defines.
  In the fast run this executes at 1440; in the full matrix it runs at 320/390/834/1920 too.
  The key invariant everywhere: no horizontal overflow (a classic "desktop stacked" / broken-mobile tell).
*/

const routes = ['/', '/design-lab/'];

for (const route of routes) {
  test(`no horizontal overflow @ ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    // Allow 1px for sub-pixel rounding.
    expect(scrollW, `content should not exceed viewport width at ${route}`).toBeLessThanOrEqual(
      clientW + 1,
    );
  });
}

test('design-lab main content fits within the viewport width', async ({ page }) => {
  await page.goto('/design-lab/');
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    let worst = 0;
    document.querySelectorAll<HTMLElement>('main *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1) worst = Math.max(worst, r.right - vw);
    });
    return worst;
  });
  expect(overflow, 'no element should spill past the right edge').toBeLessThanOrEqual(1);
});
