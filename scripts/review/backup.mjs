#!/usr/bin/env node
/*
  review:backup — export ALL review_submissions rows to
  .local/review-backups/<timestamp>.json (gitignored). Usage: pnpm review:backup [--remote]
*/
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  parseArgs,
  d1Query,
  ReviewCliError,
  fail,
  BACKUPS_DIR,
  targetLabel,
  isMain,
} from './lib.mjs';

async function main() {
  const { remote } = parseArgs();
  const sql =
    'SELECT id, client_slug, status, design_selection, idempotency_key, ' +
    'payload_json, schema_version, created_at, updated_at ' +
    'FROM review_submissions ORDER BY created_at DESC;';
  const rows = d1Query(sql, { remote });

  // Parse payload_json so the backup is a clean structured document, not double-encoded strings.
  const submissions = rows.map((r) => {
    let payload;
    try {
      payload = JSON.parse(r.payload_json);
    } catch {
      payload = { __parseError: true, raw: r.payload_json };
    }
    return {
      id: r.id,
      clientSlug: r.client_slug,
      status: r.status,
      designSelection: r.design_selection,
      idempotencyKey: r.idempotency_key ?? null,
      schemaVersion: r.schema_version,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      payload,
    };
  });

  const doc = {
    exportedAt: new Date().toISOString(),
    source: targetLabel(remote),
    database: 'after-hourz-review',
    count: submissions.length,
    submissions,
  };

  await mkdir(BACKUPS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = resolve(BACKUPS_DIR, `${stamp}.json`);
  await writeFile(outPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(
    `\n  exported ${submissions.length} submission(s) from ${targetLabel(remote)} D1 -> ${outPath}\n`,
  );
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    if (err instanceof ReviewCliError) fail(err.message);
    throw err;
  });
}
