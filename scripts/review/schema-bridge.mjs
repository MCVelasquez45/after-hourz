/*
  Bridge to the SHARED contract in src/lib/review/schema.ts. That file is the single source of
  truth for directions, option catalogs, phase copy, and parseSubmission(). We import it at
  runtime (Node >=22.6 strips TS types natively). If that is unavailable, we degrade gracefully:
  the tooling still works, it just cannot pretty-print direction display names or re-validate.
*/
const SCHEMA_URL = new URL('../../src/lib/review/schema.ts', import.meta.url);

let mod = null;
let loadError = null;
try {
  mod = await import(SCHEMA_URL.href);
} catch (err) {
  loadError = err;
}

export const schemaLoaded = mod !== null;

if (!schemaLoaded) {
  console.warn(
    `  note: could not import shared schema (${(loadError && loadError.message.split('\n')[0]) || 'unknown'}).\n` +
      '  Falling back to raw payload rendering (Node >=22.6 required for TS import). Continuing.',
  );
}

export const DIRECTIONS = mod?.DIRECTIONS ?? [];
export const PROJECT_PHASES = mod?.PROJECT_PHASES ?? null;
export const REVIEW_CLIENT_SLUG = mod?.REVIEW_CLIENT_SLUG ?? 'after-hourz';
export const SCHEMA_VERSION = mod?.SCHEMA_VERSION ?? null;
export const parseSubmission = mod?.parseSubmission ?? null;

/** Resolve a direction id to its display name + tagline (or a graceful fallback). */
export function directionInfo(id) {
  const d = DIRECTIONS.find((x) => x.id === id);
  if (d) return d;
  return { id: id ?? 'unknown', name: id ?? 'Unknown direction', tagline: '' };
}
