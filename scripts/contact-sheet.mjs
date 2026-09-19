#!/usr/bin/env node
/*
  Build a review contact sheet from Playwright visual baselines (prompt §17, §34).
  Groups screenshots by name and lays viewports side-by-side so responsive
  inconsistencies are impossible to ignore. Output: test-results/contact-sheet.html
*/
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const SNAP_DIR = 'tests/e2e/visual.spec.ts-snapshots';
const OUT_DIR = 'test-results';
const OUT = join(OUT_DIR, 'contact-sheet.html');

let files = [];
try {
  files = (await readdir(SNAP_DIR)).filter((f) => f.endsWith('.png'));
} catch {
  console.log(`No snapshots found at ${SNAP_DIR}. Run "pnpm test:visual" first.`);
  process.exit(0);
}

await mkdir(OUT_DIR, { recursive: true });

// Group by logical screen name (strip the trailing "-<project>-<platform>" suffix).
const groups = new Map();
for (const f of files) {
  const key = f.replace(/-(chromium|firefox|webkit)[^.]*\.png$/i, '').replace(/\.png$/, '');
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(f);
}

const rel = (f) => relative(OUT_DIR, join(SNAP_DIR, f));
const cards = [...groups.entries()]
  .map(
    ([name, fs]) => `
    <section>
      <h2>${name}</h2>
      <div class="row">
        ${fs
          .sort()
          .map(
            (f) =>
              `<figure><img loading="lazy" src="${rel(f)}" alt="${f}"><figcaption>${f
                .replace(`${name}-`, '')
                .replace('.png', '')}</figcaption></figure>`,
          )
          .join('')}
      </div>
    </section>`,
  )
  .join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>After Hourz — visual contact sheet</title>
<style>
  body{background:#0A0B0D;color:#C4CBD4;font:14px/1.5 ui-monospace,Menlo,monospace;margin:0;padding:24px}
  h1{color:#E6EAEF;font-size:20px}h2{color:#2E7BFF;font-size:13px;text-transform:uppercase;letter-spacing:.1em;margin-top:32px}
  .row{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px}
  figure{margin:0;flex:0 0 auto;max-width:420px}
  img{max-width:100%;border:1px solid #333945;border-radius:4px;background:#121418}
  figcaption{color:#5B6472;font-size:12px;margin-top:6px}
</style></head><body>
<h1>After Hourz — Visual Contact Sheet</h1>
<p>Generated from ${files.length} baselines across ${groups.size} screens. Review these pixels — do not accept blindly.</p>
${cards}
</body></html>`;

await writeFile(OUT, html);
console.log(`Contact sheet written: ${OUT} (${files.length} images, ${groups.size} screens)`);
