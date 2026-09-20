/*
  After Hourz — shared helpers for the local review:* tooling.

  Queries the D1 database `after-hourz-review` through Wrangler.
    - LOCAL (default):  wrangler d1 execute after-hourz-review --local  --json --command "..."
    - REMOTE (--remote): wrangler d1 execute after-hourz-review --remote --json --command "..."
                         (remote requires Cloudflare auth — handled gracefully)

  GUARDRAILS (see CLAUDE.md): never fabricate business facts; never log secrets or full
  questionnaire bodies to stdout; all output is for the operator running these scripts locally.
*/
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { argv } from 'node:process';

/**
 * True when the given module is the process entry point (i.e. run directly, not imported).
 * Guards each command's main() so importing a script (e.g. pull.mjs from load.mjs) does not
 * execute its CLI side effects.
 */
export function isMain(importMetaUrl) {
  return argv[1] !== undefined && fileURLToPath(importMetaUrl) === resolve(argv[1]);
}

export const D1_DATABASE = 'after-hourz-review';

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Repo root (scripts/review/ -> ../../). */
export const REPO_ROOT = resolve(__dirname, '..', '..');
export const LOCAL_DIR = resolve(REPO_ROOT, '.local');
export const SUBMISSIONS_DIR = resolve(LOCAL_DIR, 'review-submissions');
export const BACKUPS_DIR = resolve(LOCAL_DIR, 'review-backups');

/**
 * Parse argv into { remote, positionals } (plus any --key=value / --key value flags).
 * Only `--remote` is meaningful today; extra flags are captured for forward-compat.
 */
export function parseArgs(argv = process.argv.slice(2)) {
  const positionals = [];
  const flags = {};
  let remote = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--remote') {
      remote = true;
    } else if (arg === '--local') {
      remote = false;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const eq = key.indexOf('=');
      if (eq >= 0) {
        flags[key.slice(0, eq)] = key.slice(eq + 1);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        flags[key] = argv[i + 1];
        i += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positionals.push(arg);
    }
  }
  return { remote, positionals, flags };
}

/** A CLI failure we can print cleanly and exit non-zero on (no stack spam). */
export class ReviewCliError extends Error {}

/** Print a clean error and exit non-zero. */
export function fail(message) {
  console.error(`\n  error: ${message}\n`);
  process.exit(1);
}

/** Detect the classic "not authenticated" / "not logged in" Wrangler failures. */
function looksLikeAuthFailure(text) {
  const t = (text || '').toLowerCase();
  return (
    t.includes('not logged in') ||
    t.includes('not authenticated') ||
    t.includes('authentication error') ||
    t.includes('please run `wrangler login`') ||
    t.includes('please run wrangler login') ||
    t.includes('you are not authenticated') ||
    t.includes('run `wrangler login`') ||
    t.includes('[code: 10000]') // Cloudflare "Authentication error"
  );
}

/**
 * Run `wrangler d1 execute` with the given SQL and return parsed JSON result rows.
 * Throws ReviewCliError with a clear, operator-friendly message on any failure.
 *
 * @param {string} sql   The SQL command to run (single statement).
 * @param {{ remote?: boolean }} opts
 * @returns {any[]} rows from the first result set
 */
export function d1Query(sql, { remote = false } = {}) {
  const target = remote ? '--remote' : '--local';
  const args = [
    'exec',
    'wrangler',
    'd1',
    'execute',
    D1_DATABASE,
    target,
    '--json',
    '--command',
    sql,
  ];

  let res;
  try {
    res = spawnSync('pnpm', args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    throw new ReviewCliError(
      `could not launch wrangler (via pnpm): ${err.message}. Is pnpm installed and are deps in place (\`pnpm install\`)?`,
    );
  }

  if (res.error) {
    if (res.error.code === 'ENOENT') {
      throw new ReviewCliError('pnpm not found on PATH — cannot invoke wrangler.');
    }
    throw new ReviewCliError(`failed to run wrangler: ${res.error.message}`);
  }

  const stdout = res.stdout ?? '';
  const stderr = res.stderr ?? '';

  if (res.status !== 0) {
    const combined = `${stdout}\n${stderr}`;
    if (remote && looksLikeAuthFailure(combined)) {
      throw new ReviewCliError(
        'Cloudflare auth required for --remote. Run `pnpm exec wrangler login` (or set ' +
          'CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID), then retry. ' +
          'Local queries (omit --remote) do not need auth.',
      );
    }
    // Local D1 not yet created (no migrations applied) surfaces as a wrangler error too.
    const hint =
      !remote && /no such table|not found|does not exist/i.test(combined)
        ? ' The local D1 may be empty — apply migrations: ' +
          '`pnpm exec wrangler d1 migrations apply after-hourz-review --local`.'
        : '';
    throw new ReviewCliError(
      `wrangler d1 execute failed (exit ${res.status}).${hint}\n${stderr.trim() || stdout.trim()}`,
    );
  }

  // wrangler --json prints a JSON array of result objects: [{ results: [...], success, meta }]
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new ReviewCliError(
      `could not parse wrangler JSON output. Raw output:\n${stdout.trim().slice(0, 2000)}`,
    );
  }

  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  const rows = first && Array.isArray(first.results) ? first.results : [];
  return rows;
}

/** SQL string literal escaping (single quotes doubled). Values here are ids/slugs, not free text. */
export function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Human-readable target label for messages. */
export function targetLabel(remote) {
  return remote ? 'remote (Cloudflare)' : 'local';
}
