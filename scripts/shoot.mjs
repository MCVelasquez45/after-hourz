#!/usr/bin/env node
/*
  Reusable design-review screenshotter (reset §16-§18, §33).
  Renders arbitrary Design-Lab routes across a viewport matrix to full-page PNGs so
  humans + review personas judge PIXELS, not source. Used for art-direction boards,
  composition proofs, prototype review, and contact sheets.

  Usage:
    node scripts/shoot.mjs <manifest.json>

  Manifest shape:
    {
      "base": "http://localhost:4331",          // default 4331 (the test/preview port)
      "outDir": "test-results/review/boards",    // created if missing
      "reducedMotion": false,                     // set true to capture the reduced-motion path
      "settleMs": 500,                            // extra wait after load for lazy imgs / fonts
      "fullPage": true,                           // default true
      "viewports": [ {"w":390,"h":844,"label":"mobile"}, {"w":1440,"h":900,"label":"desktop"} ],
      "shots": [ {"route":"/design-lab/directions/chrome-heritage","name":"board-chrome-heritage"} ]
    }
  Per-shot "viewports"/"fullPage" override the top-level defaults.
  Emits one PNG per (shot × viewport): <outDir>/<name>__<label>.png and prints a JSON summary.
*/
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('usage: node scripts/shoot.mjs <manifest.json>');
  process.exit(1);
}

const m = JSON.parse(await readFile(manifestPath, 'utf8'));
const base = (m.base ?? 'http://localhost:4331').replace(/\/$/, '');
const outDir = m.outDir ?? 'test-results/review';
const reducedMotion = m.reducedMotion ? 'reduce' : 'no-preference';
const settleMs = m.settleMs ?? 500;
const defViewports = m.viewports ?? [
  { w: 390, h: 844, label: 'mobile' },
  { w: 834, h: 1194, label: 'tablet' },
  { w: 1440, h: 900, label: 'desktop' },
  { w: 1920, h: 1080, label: 'wide' },
];
const defFull = m.fullPage !== false;

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];
let failures = 0;

for (const shot of m.shots) {
  const viewports = shot.viewports ?? defViewports;
  const fullPage = shot.fullPage ?? defFull;
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 2,
      reducedMotion,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const failedRequests = [];
    page.on('requestfailed', (req) => failedRequests.push(`${req.url()} — ${req.failure()?.errorText ?? '?'}`));

    const url = base + shot.route;
    const file = join(outDir, `${shot.name}__${vp.label}.png`);
    let ok = true;
    let err = null;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      if (!resp || !resp.ok()) throw new Error(`HTTP ${resp ? resp.status() : 'no-response'}`);
      // Trigger lazy content + let fonts/images settle.
      await page.evaluate(async () => {
        await (document.fonts ? document.fonts.ready : Promise.resolve());
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(settleMs);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(150);
      // Detect horizontal overflow (a common responsive failure).
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      await page.screenshot({ path: file, fullPage });
      results.push({
        name: shot.name,
        route: shot.route,
        viewport: vp.label,
        size: `${vp.w}x${vp.h}`,
        file,
        horizontalOverflowPx: overflow,
        consoleErrors: consoleErrors.length,
        failedRequests: failedRequests.length,
        consoleErrorSamples: consoleErrors.slice(0, 3),
        failedRequestSamples: failedRequests.slice(0, 3),
      });
      if (overflow > 1 || consoleErrors.length || failedRequests.length) failures++;
    } catch (e) {
      ok = false;
      err = String(e.message ?? e);
      failures++;
      results.push({ name: shot.name, route: shot.route, viewport: vp.label, file, error: err });
    }
    await context.close();
    console.log(`${ok ? 'shot' : 'FAIL'}: ${shot.name} @ ${vp.label} -> ${file}${err ? ' :: ' + err : ''}`);
  }
}

await browser.close();
const summaryPath = join(outDir, 'summary.json');
await writeFile(summaryPath, JSON.stringify({ base, outDir, count: results.length, failures, results }, null, 2));
console.log(`\nshoot complete: ${results.length} images, ${failures} shots with issues. Summary: ${summaryPath}`);
