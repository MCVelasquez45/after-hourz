import { test, expect } from '@playwright/test';

/*
  Geometry audit (prompt §21, §22): programmatic layout verification, not eyeballing.
  Runs on every prototype at whatever viewport the current project defines.
*/

const routes = [
  '/design-lab/prototypes/chrome-heritage/',
  '/design-lab/prototypes/booth-light/',
  '/design-lab/prototypes/after-dark/',
];

for (const route of routes) {
  test.describe(`geometry @ ${route}`, () => {
    test('no horizontal overflow', async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      expect(sw, 'document must not scroll horizontally').toBeLessThanOrEqual(cw + 1);
    });

    test('no main element spills past the right edge', async ({ page }) => {
      await page.goto(route);
      const worst = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        // Elements inside a horizontal-scroll container legitimately extend beyond the edge.
        const inScroller = (el: Element) => {
          let n: Element | null = el.parentElement;
          while (n && n !== document.body) {
            const ox = getComputedStyle(n).overflowX;
            if (ox === 'auto' || ox === 'scroll') return true;
            n = n.parentElement;
          }
          return false;
        };
        let w = 0;
        document.querySelectorAll<HTMLElement>('main *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.right > vw + 1 && !inScroller(el)) w = Math.max(w, r.right - vw);
        });
        return Math.round(w);
      });
      expect(worst, 'no element may overflow the viewport right edge').toBeLessThanOrEqual(1);
    });

    test('the hero headline stays within its own box (no clipping)', async ({ page }) => {
      await page.goto(route);
      const clip = await page.evaluate(() => {
        const h1 = document.querySelector('main h1') as HTMLElement | null;
        if (!h1) return 0;
        return h1.scrollWidth - h1.clientWidth;
      });
      expect(clip, 'h1 should not be horizontally clipped').toBeLessThanOrEqual(1);
    });

    test('visible header nav links do not overlap', async ({ page }) => {
      await page.goto(route);
      const boxes = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('header nav a')) as HTMLElement[];
        return links
          .filter((a) => a.offsetParent !== null) // visible only
          .map((a) => {
            const r = a.getBoundingClientRect();
            return { l: r.left, r: r.right, t: r.top, b: r.bottom };
          });
      });
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const overlap = a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
          expect(overlap, `nav links ${i} and ${j} overlap`).toBe(false);
        }
      }
    });

    test('primary call-to-action has a usable target height', async ({ page }) => {
      await page.goto(route);
      const h = await page.evaluate(() => {
        const cta = document.querySelector('main a[href="#contact"]') as HTMLElement | null;
        return cta ? Math.round(cta.getBoundingClientRect().height) : 0;
      });
      expect(h, 'primary CTA should be at least 36px tall').toBeGreaterThanOrEqual(36);
    });
  });
}
