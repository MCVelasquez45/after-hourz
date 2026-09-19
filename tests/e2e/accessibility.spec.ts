import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/design-lab/'];

for (const route of routes) {
  test(`axe: no serious/critical violations @ ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    // Surface details on failure.
    const summary = seriousOrCritical.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}`);
    expect(summary, `serious/critical axe violations @ ${route}`).toEqual([]);
  });
}

test.describe('keyboard', () => {
  test('skip link is the first focusable and targets main', async ({ page, browserName }) => {
    // Documented platform difference: WebKit/Safari excludes links from sequential Tab focus by
    // default (macOS "Full Keyboard Access" off). Link-focus journey is validated on Chromium+Firefox;
    // the skip link itself is correct markup. (docs/17 Pass 01 — known intentional exception.)
    test.skip(browserName === 'webkit', 'WebKit excludes <a> from default Tab order');
    await page.goto('/design-lab/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveClass(/skip-link/);
    await expect(focused).toHaveAttribute('href', '#main');
  });

  test('interactive controls are reachable by keyboard and take focus', async ({ page }) => {
    await page.goto('/design-lab/#interaction');
    const primary = page.getByRole('button', { name: /primary action/i });
    await primary.focus();
    await expect(primary).toBeFocused();
    // A focused control must have a visible focus indicator (box-shadow ring or outline).
    const hasIndicator = await primary.evaluate((el) => {
      const s = getComputedStyle(el);
      return (s.boxShadow !== 'none' && s.boxShadow !== '') || s.outlineStyle !== 'none';
    });
    expect(hasIndicator, 'focused control should show a visible focus indicator').toBe(true);
  });

  test('no keyboard trap across the first several stops', async ({ page, browserName }) => {
    // See note above: WebKit's default Tab order excludes links, so the distinct-stops count is not
    // meaningful there. No-trap behavior is proven on Chromium+Firefox. (docs/17 Pass 01.)
    test.skip(browserName === 'webkit', 'WebKit excludes <a> from default Tab order');
    await page.goto('/design-lab/');
    const seen = new Set<string>();
    let repeats = 0;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return 'none';
        return `${el.tagName}:${el.getAttribute('href') ?? el.textContent?.slice(0, 12) ?? ''}`;
      });
      if (seen.has(id)) repeats++;
      seen.add(id);
    }
    // Focus should advance through many distinct elements, not stick on one (trap).
    expect(seen.size, 'focus should move through multiple distinct elements').toBeGreaterThan(5);
    expect(repeats, 'focus should not be trapped repeating a single element').toBeLessThan(8);
  });
});
