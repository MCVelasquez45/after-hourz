/*
  Shared loader for review:context / review:brief: read the pulled JSON from
  .local/review-submissions/<id>.json; if it is missing, pull it first.
*/
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { SUBMISSIONS_DIR } from './lib.mjs';
import { pullSubmission } from './pull.mjs';

/** Load the persisted record for <id>, pulling from D1 first if not already on disk. */
export async function loadRecord(id, { remote = false } = {}) {
  const path = resolve(SUBMISSIONS_DIR, `${id}.json`);
  try {
    const raw = await readFile(path, 'utf8');
    return { record: JSON.parse(raw), path, pulled: false };
  } catch {
    console.log(`  ${id} not pulled yet — fetching from D1 first...`);
    const { record, outPath } = await pullSubmission(id, { remote });
    return { record, path: outPath, pulled: true };
  }
}
