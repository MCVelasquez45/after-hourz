import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Verification for CLIENT-REVIEW MODE (?review=1). Not part of the standing suite
// intent, but written to the e2e dir so it runs against the built dist on 4331.

type Proto = {
  name: string;
  route: string;
  // Selectors that are internal chrome — must be VISIBLE normally, GONE in review.
  chrome: string[];
  // Selectors that must remain present in BOTH modes (real content / form).
  keep: string[];
};

const protos: Proto[] = [
  {
    name: 'chrome-heritage',
    route: '/design-lab/prototypes/chrome-heritage/',
    chrome: [
      '.chp-topline',
      '.chp-ref',
      '.chp-gallery__prov',
      '.chp-work__note',
      '.chp-footer__prov',
      '.chp-contact__channels',
    ],
    keep: ['#chp-quote', 'main#main', '.chp-nav', '#work', '#contact', '.chp-footer'],
  },
  {
    name: 'booth-light',
    route: '/design-lab/prototypes/booth-light/',
    chrome: [
      '.bl-labstrip',
      '.bl-stamp',
      '.bl-provline',
      '.bl-story__p--cir',
      '.bl-footer__prov',
      '.bl-footer__cir',
    ],
    keep: ['[data-quote-form]', 'main#main', '.bl-nav', '#work', '#contact', '.bl-footer'],
  },
  {
    name: 'after-dark',
    route: '/design-lab/prototypes/after-dark/',
    chrome: [
      '.ad-lab',
      '.ad-refbadge',
      '.ad-hero__prov',
      '.ad-prov',
      '.ad-provclause',
      '.ad-story__figcap',
      '.ad-story__note',
      '.ad-footer__prov',
      '.ad-footer__cir',
    ],
    keep: ['#ad-form', 'main#main', '.ad-nav', '#work', '#contact', '.ad-footer'],
  },
];

const widths = [320, 768, 1920];

for (const p of protos) {
  test(`${p.name}: NORMAL mode shows chrome + no overflow + one h1`, async ({ page }) => {
    await page.goto(p.route);
    await page.waitForLoadState('networkidle');

    // data-review must NOT be set
    expect(await page.evaluate(() => document.documentElement.dataset.review)).toBeUndefined();

    for (const sel of p.chrome) {
      expect(await page.locator(sel).first().count(), `chrome present: ${sel}`).toBeGreaterThan(0);
      await expect(page.locator(sel).first(), `chrome visible: ${sel}`).toBeVisible();
    }
    for (const sel of p.keep) {
      await expect(page.locator(sel).first(), `content kept: ${sel}`).toBeVisible();
    }
    expect(await page.locator('h1').count(), 'exactly one h1').toBe(1);

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `no horizontal overflow @ ${w}px (normal)`).toBeLessThanOrEqual(0);
    }
  });

  test(`${p.name}: REVIEW mode hides chrome, keeps content + form, no overflow, one h1`, async ({
    page,
  }) => {
    await page.goto(`${p.route}?review=1`);
    await page.waitForLoadState('networkidle');

    expect(await page.evaluate(() => document.documentElement.dataset.review)).toBe('1');

    for (const sel of p.chrome) {
      await expect(page.locator(sel).first(), `chrome hidden in review: ${sel}`).toBeHidden();
    }
    for (const sel of p.keep) {
      await expect(page.locator(sel).first(), `content kept in review: ${sel}`).toBeVisible();
    }
    expect(await page.locator('h1').count(), 'exactly one h1 in review').toBe(1);

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `no horizontal overflow @ ${w}px (review)`).toBeLessThanOrEqual(0);
    }
  });

  test(`${p.name}: axe clean in BOTH modes`, async ({ page }) => {
    for (const url of [p.route, `${p.route}?review=1`]) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const bad = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(
        bad.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}`),
        `serious/critical axe @ ${url}`,
      ).toEqual([]);
    }
  });
}
