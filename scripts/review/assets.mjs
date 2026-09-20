#!/usr/bin/env node
/*
  review:assets <id> [--remote] — list the uploaded client assets associated with submission <id>
  (from D1 review_assets) and download each binary from R2 into
  .local/review-submissions/<id>/assets/<category>/<filename> (gitignored, category-organized,
  safe filenames). Prints a per-file + by-category summary.

  Usage: pnpm review:assets AH-2026-XXXX [--remote]

  GUARDRAILS (CLAUDE.md): the binary lives in R2; object keys are server-generated and never
  shown to the client. Degrades gracefully when wrangler / R2 is unavailable (prints what it can
  from D1 and exits without crashing). Never fabricates.
*/
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  parseArgs,
  ReviewCliError,
  fail,
  SUBMISSIONS_DIR,
  targetLabel,
  isMain,
  assetRowsForSubmission,
  countAssetsByCategory,
  safeFilename,
  r2ObjectGet,
} from './lib.mjs';

/** Build the local destination path for one asset row. */
function destFor(baseDir, row) {
  const category = safeFilename(row.category || 'other', 'other');
  const filename = safeFilename(row.original_filename || `${row.asset_id}`, row.asset_id);
  return { dir: resolve(baseDir, category), path: resolve(baseDir, category, filename), filename };
}

export async function downloadAssets(id, { remote = false } = {}) {
  const rows = assetRowsForSubmission(id, { remote });

  if (rows.unavailable) {
    console.log(
      `\n  assets for ${id}: could not query the asset store (${targetLabel(remote)}).` +
        `\n  reason: ${rows.unavailable}` +
        `\n  (nothing downloaded; this is non-fatal.)\n`,
    );
    return { downloaded: 0, skipped: 0, total: 0, counts: { total: 0 }, unavailable: true };
  }

  const counts = countAssetsByCategory(rows);
  if (rows.length === 0) {
    console.log(`\n  no client assets associated with ${id} in ${targetLabel(remote)} store.\n`);
    return { downloaded: 0, skipped: 0, total: 0, counts };
  }

  const baseDir = resolve(SUBMISSIONS_DIR, id, 'assets');
  await mkdir(baseDir, { recursive: true });

  console.log(`\n  ${rows.length} client asset(s) for ${id} — ${targetLabel(remote)}:\n`);

  let downloaded = 0;
  let skipped = 0;
  for (const row of rows) {
    const { dir, path, filename } = destFor(baseDir, row);
    await mkdir(dir, { recursive: true });
    const res = r2ObjectGet(row.object_key, path, { remote });
    if (res.ok) {
      downloaded += 1;
      console.log(`    [ok]   ${row.category}/${filename}`);
    } else if (res.skipped) {
      skipped += 1;
      console.log(`    [skip] ${row.category}/${filename} — ${res.error}`);
    } else {
      skipped += 1;
      console.log(`    [fail] ${row.category}/${filename} — ${res.error}`);
    }
  }

  console.log('\n  by category:');
  for (const [cat, n] of Object.entries(counts)) {
    if (cat === 'total') continue;
    console.log(`    ${cat}: ${n}`);
  }
  console.log(
    `\n  downloaded ${downloaded}/${rows.length} to ${baseDir}` +
      (skipped ? ` (${skipped} skipped/failed)` : '') +
      '\n',
  );

  return { downloaded, skipped, total: rows.length, counts, baseDir };
}

async function main() {
  const { remote, positionals } = parseArgs();
  const id = positionals[0];
  if (!id) fail('usage: pnpm review:assets <id> [--remote]');
  await downloadAssets(id, { remote });
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    if (err instanceof ReviewCliError) fail(err.message);
    throw err;
  });
}
