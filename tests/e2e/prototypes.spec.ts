import { test, expect } from '@playwright/test';

const protos = [
  {
    name: 'Chrome Heritage',
    route: '/design-lab/prototypes/chrome-heritage/',
    title: /Chrome Heritage/,
    sections: ['top', 'services', 'work', 'process', 'story', 'contact'],
    headerSel: '.chp-nav',
  },
  {
    name: 'Booth Light',
    route: '/design-lab/prototypes/booth-light/',
    title: /Booth Light/,
    sections: ['top', 'work', 'process', 'services', 'story', 'contact'],
    headerSel: '.bl-nav',
  },
  {
    name: 'After Dark',
    route: '/design-lab/prototypes/after-dark/',
    title: /After Dark/,
    sections: ['top', 'services', 'work', 'process', 'story', 'contact'],
    headerSel: '.ad-nav',
  },
];

for (const p of protos) {
  test.describe(p.name, () => {
    test('loads 200, single h1, has landmarks', async ({ page }) => {
      const res = await page.goto(p.route);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(p.title);
      await expect(page.locator('h1')).toHaveCount(1);
      const banner = page.getByRole('banner');
      await expect(banner).toBeVisible();
      // Primary navigation must be REACHABLE at every viewport — either shown inline or
      // collapsed behind a labeled menu button. (On small screens the inline nav is
      // display:none, which correctly removes it from the a11y tree, so we assert
      // reachability by visibility, not DOM attachment — breakpoint-agnostic.)
      const navVisible = await page
        .getByRole('navigation', { name: /primary/i })
        .isVisible()
        .catch(() => false);
      const menuVisible = await banner
        .getByRole('button', { name: /menu/i })
        .isVisible()
        .catch(() => false);
      expect(navVisible || menuVisible, 'primary nav reachable (inline or via menu button)').toBe(
        true,
      );
      await expect(page.locator('main#main')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });

    test('all narrative sections exist', async ({ page }) => {
      await page.goto(p.route);
      for (const id of p.sections) {
        await expect(page.locator(`#${id}`)).toBeAttached();
      }
    });

    test('primary nav anchors resolve to real targets', async ({ page }) => {
      await page.goto(p.route);
      const anchors = await page
        .locator('header a[href^="#"]')
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
      expect(anchors.length).toBeGreaterThan(0);
      for (const href of anchors) {
        await expect(page.locator(href)).toHaveCount(1);
      }
    });

    test('truthful: no fabricated metrics / testimonials / awards', async ({ page }) => {
      await page.goto(p.route);
      const body = (await page.locator('body').innerText()).toLowerCase();
      for (const banned of [
        'years of experience',
        '5-star',
        '5 star',
        '★',
        'happy customers',
        'certified',
        'award-winning',
        'reviews',
      ]) {
        expect(body, `should not contain fabricated "${banned}"`).not.toContain(banned);
      }
      // Neutral placeholder copy is used instead of asserting unknown facts:
      // either the legacy "coming soon" or the honest "client input required".
      expect(
        body.includes('coming soon') || body.includes('client input required'),
        'should mark unknown facts with a neutral placeholder, not fabricate them',
      ).toBe(true);
    });

    test('sticky header reflects scroll state', async ({ page }) => {
      await page.goto(p.route);
      const header = page.locator(p.headerSel);
      await expect(header).toHaveAttribute('data-scrolled', 'false');
      await page.evaluate(() => window.scrollTo(0, 500));
      await expect(header).toHaveAttribute('data-scrolled', 'true');
    });
  });
}
