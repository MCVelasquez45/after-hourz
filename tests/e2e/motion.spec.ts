import { test, expect } from '@playwright/test';

const RICH = '/design-lab/prototypes/booth-light/';

// Booth Light uses its own [data-bl-reveal] exposure hook (scoped so it never
// collides with the shared [data-reveal] fade). Match both so the spec is robust
// to whichever hook a prototype uses.
const REVEAL_SEL = '[data-reveal], [data-bl-reveal]';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('content is fully visible under reduce (no stuck opacity:0)', async ({ page }) => {
    await page.goto(RICH);
    const reveals = page.locator(REVEAL_SEL);
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
    const first = page.locator(REVEAL_SEL).first();
    await expect(first).toHaveClass(/is-revealed/);
    await expect(first).toHaveCSS('opacity', '1');
  });
});
