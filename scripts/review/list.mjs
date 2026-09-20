#!/usr/bin/env node
/*
  review:list — list review submissions from D1 as a table.
  Usage: pnpm review:list [--remote]
  Columns: id, created_at, client, design_selection, status.
*/
import { parseArgs, d1Query, ReviewCliError, fail, targetLabel, isMain } from './lib.mjs';
import { directionInfo } from './schema-bridge.mjs';

function pad(str, width) {
  const s = String(str ?? '');
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

function printTable(rows) {
  if (rows.length === 0) {
    console.log('\n  (no submissions found)\n');
    return;
  }
  const headers = ['ID', 'CREATED_AT', 'CLIENT', 'DESIGN', 'STATUS'];
  const data = rows.map((r) => [
    r.id ?? '',
    r.created_at ?? '',
    r.client_slug ?? '',
    directionInfo(r.design_selection).name,
    r.status ?? '',
  ]);
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...data.map((row) => String(row[i] ?? '').length)),
  );
  const line = (cols) => cols.map((c, i) => pad(c, widths[i])).join('  ');
  console.log('');
  console.log('  ' + line(headers));
  console.log('  ' + widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of data) console.log('  ' + line(row));
  console.log(`\n  ${rows.length} submission(s) — ${targetLabel(rows._remote)}\n`);
}

async function main() {
  const { remote } = parseArgs();
  const sql =
    'SELECT id, created_at, client_slug, design_selection, status ' +
    'FROM review_submissions ORDER BY created_at DESC;';
  const rows = d1Query(sql, { remote });
  rows._remote = remote;
  printTable(rows);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    if (err instanceof ReviewCliError) fail(err.message);
    throw err;
  });
}
