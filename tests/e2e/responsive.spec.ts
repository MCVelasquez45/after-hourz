import { test, expect } from '@playwright/test';

/*
  Layout sanity across whatever viewport the current Playwright project defines.
  Fast run = 1440; full matrix also runs 320/390/834/1920. Invariant everywhere: no horizontal overflow.
*/

const routes = [
  '/',
  '/design-lab/',
  '/design-lab/foundations/',
  '/design-lab/prototypes/booth-light/',
];

for (const route of routes) {
  test(`no horizontal overflow @ ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(scrollW, `content should not exceed viewport width at ${route}`).toBeLessThanOrEqual(
      clientW + 1,
    );
  });
}

test('booth-light main content fits within the viewport width', async ({ page }) => {
  await page.goto('/design-lab/prototypes/booth-light/');
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
