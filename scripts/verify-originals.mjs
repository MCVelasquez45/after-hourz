#!/usr/bin/env node
/*
  Verify client originals are byte-for-byte unchanged since Pass 00 (prompt §35).
  Immutable source of truth: public/assets/originals/. Expected SHA-256 from PROVENANCE.md.
  Exit non-zero if any checksum differs — a mismatch is a serious issue, never normalized.
*/
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const EXPECTED = {
  'public/assets/originals/brand/after-hourz-legacy-promo-poster.png':
    '9f0ce18b6bb90d294d8da047731fda7b1bae52a0efcdf4652c0c42e8d885ff84',
  'public/assets/originals/vehicles/classic-chevy-blue-white-front-quarter.png':
    'c3c3f800edf6431fb48eb90e995d498f5472c24b69f314a0811ab2a9c1409bd3',
  'public/assets/originals/vehicles/classic-chevy-blue-white-side-profile.png':
    'cd50b805bea1fb45590bd9be5a5882f7c95e67be6e8a8b337be02fff08799cd8',
};

let ok = true;
for (const [path, expected] of Object.entries(EXPECTED)) {
  try {
    const buf = await readFile(path);
    const actual = createHash('sha256').update(buf).digest('hex');
    const match = actual === expected;
    ok &&= match;
    console.log(`${match ? 'OK  ' : 'FAIL'}  ${path}`);
    if (!match) console.log(`      expected ${expected}\n      actual   ${actual}`);
  } catch (err) {
    ok = false;
    console.log(`FAIL  ${path} — ${err.message}`);
  }
}

console.log(
  ok
    ? '\nCLIENT ORIGINALS MODIFIED: NO'
    : '\nCLIENT ORIGINALS MODIFIED: YES — STOP AND INVESTIGATE',
);
process.exit(ok ? 0 : 1);
