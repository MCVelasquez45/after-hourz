#!/usr/bin/env node
/*
  review:pull <id> — fetch one submission row from D1 and save its payload JSON to
  .local/review-submissions/<id>.json (gitignored). Usage: pnpm review:pull AH-2026-XXXX [--remote]
*/
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  parseArgs,
  d1Query,
  ReviewCliError,
  fail,
  sqlStr,
  SUBMISSIONS_DIR,
  targetLabel,
  isMain,
} from './lib.mjs';

/**
 * Fetch a single row by id and persist it. Returns the parsed row (with parsed payload).
 * Exported so review:context / review:brief can "pull first if missing".
 */
export async function pullSubmission(id, { remote = false } = {}) {
  const sql =
    'SELECT id, client_slug, status, design_selection, idempotency_key, ' +
    'payload_json, schema_version, created_at, updated_at ' +
    `FROM review_submissions WHERE id = ${sqlStr(id)} LIMIT 1;`;
  const rows = d1Query(sql, { remote });
  if (rows.length === 0) {
    throw new ReviewCliError(
      `no submission with id ${JSON.stringify(id)} found in ${targetLabel(remote)} D1. ` +
        'List available ids with `pnpm review:list' +
        (remote ? ' --remote' : '') +
        '`.',
    );
  }
  const row = rows[0];

  let payload;
  try {
    payload = JSON.parse(row.payload_json);
  } catch {
    throw new ReviewCliError(
      `submission ${id} has an unparseable payload_json column (data corruption?).`,
    );
  }

  // Persist the full row (metadata + parsed payload) for downstream context/brief steps.
  const record = {
    id: row.id,
    clientSlug: row.client_slug,
    status: row.status,
    designSelection: row.design_selection,
    idempotencyKey: row.idempotency_key ?? null,
    schemaVersion: row.schema_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: targetLabel(remote),
    pulledAt: new Date().toISOString(),
    payload,
  };

  await mkdir(SUBMISSIONS_DIR, { recursive: true });
  const outPath = resolve(SUBMISSIONS_DIR, `${id}.json`);
  await writeFile(outPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
  return { record, outPath };
}

async function main() {
  const { remote, positionals } = parseArgs();
  const id = positionals[0];
  if (!id) fail('usage: pnpm review:pull <id> [--remote]');

  const { outPath } = await pullSubmission(id, { remote });
  console.log(`\n  pulled ${id} from ${targetLabel(remote)} D1 -> ${outPath}\n`);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    if (err instanceof ReviewCliError) fail(err.message);
    throw err;
  });
}
