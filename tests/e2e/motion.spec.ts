import { test, expect } from '@playwright/test';

const RICH = '/design-lab/prototypes/booth-light/';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('content is fully visible under reduce (no stuck opacity:0)', async ({ page }) => {
    await page.goto(RICH);
    const reveals = page.locator('[data-reveal]');
    const count = await reveals.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const opacity = await reveals.nth(i).evaluate((el) => getComputedStyle(el).opacity);
      expect(
        Number(opacity),
        'reveal element should be visible under reduced motion',
      ).toBeGreaterThan(0.99);
    }
  });

  test('smooth scroll is disabled under reduce', async ({ page }) => {
    await page.goto(RICH);
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe('auto');
  });
});

test.describe('motion enabled', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('reveal elements settle to visible after entering view', async ({ page }) => {
    await page.goto(RICH);
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
    });
    const first = page.locator('[data-reveal]').first();
    await expect(first).toHaveClass(/is-revealed/);
    await expect(first).toHaveCSS('opacity', '1');
  });
});
