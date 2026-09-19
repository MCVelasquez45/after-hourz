import { test, expect } from '@playwright/test';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('page remains fully usable and content is visible under reduce', async ({ page }) => {
    await page.goto('/design-lab/');
    // Reveal targets must be fully visible (no stuck opacity:0) when motion is reduced.
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
    await page.goto('/design-lab/');
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe('auto');
  });
});

test.describe('motion enabled', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('reveal elements end in a settled, visible state after entering view', async ({ page }) => {
    await page.goto('/design-lab/');
    // Scroll through so IntersectionObserver reveals everything.
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
    });
    const first = page.locator('[data-reveal]').first();
    await expect(first).toHaveClass(/is-revealed/);
    await expect(first).toHaveCSS('opacity', '1');
  });
});
