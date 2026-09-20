#!/usr/bin/env node
/*
  Non-destructive After Hourz brand-derivation (reset directive §1, §10-§12).
  Reads the immutable client poster and produces web-safe LOGO DERIVATIVES (crops of the
  REAL chrome lettering — never a redraw) + samples the REAL brand palette. The NorCal badge
  and QUINCY mural sit lower in the poster and are excluded by the top-band crops.

  Output: public/assets/derived/brand/*  and prints sampled palette hexes.
  Source poster is opened read-only; it is never modified.
*/
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'public/assets/originals/brand/after-hourz-legacy-promo-poster.png';
const OUT = 'public/assets/derived/brand';
await mkdir(OUT, { recursive: true });

const meta = await sharp(SRC).metadata();
console.log(`poster: ${meta.width}x${meta.height}`);

// ---- Logo crops (in poster px, 1070x1536) ----
// Full lockup: AFTER HOURZ + flourishes + "BY ANTHONY MONTOYA" (excludes "WELCOME TO" + bars).
const lockup = { left: 44, top: 86, width: 982, height: 246 };
// Wordmark only: the big chrome AFTER HOURZ letters (nav / compact use).
const wordmark = { left: 90, top: 80, width: 900, height: 176 };

async function emit(name, region, { mono = false, width } = {}) {
  const base = sharp(SRC).extract(region);
  let png = base.clone();
  if (mono) png = png.grayscale();
  if (width) png = png.resize({ width });
  await png.clone().png().toFile(`${OUT}/${name}.png`);
  await png.clone().webp({ quality: 92 }).toFile(`${OUT}/${name}.webp`);
  const m = await sharp(`${OUT}/${name}.png`).metadata();
  console.log(`  ${name}: ${m.width}x${m.height} (png+webp)`);
}

console.log('deriving logo assets:');
await emit('after-hourz-lockup', lockup);
await emit('after-hourz-lockup-sm', lockup, { width: 640 });
await emit('after-hourz-wordmark', wordmark);
await emit('after-hourz-wordmark-sm', wordmark, { width: 420 });
await emit('after-hourz-wordmark-mono', wordmark, { mono: true });

// ---- Palette sampling: average a region down to 1px = its mean colour ----
const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

async function sampleRegion(label, region) {
  const [r, g, b] = await sharp(SRC).extract(region).resize(1, 1, { fit: 'fill' }).raw().toBuffer();
  console.log(`  ${label.padEnd(22)} ${toHex({ r, g, b })}  rgb(${r},${g},${b})`);
}

console.log('sampled palette regions:');
await sampleRegion('poster-border-black', { left: 8, top: 8, width: 40, height: 40 });
await sampleRegion('shop-graphite', { left: 470, top: 610, width: 90, height: 60 });
await sampleRegion('impala-cobalt-body', { left: 360, top: 820, width: 180, height: 90 });
await sampleRegion('truck-cobalt-body', { left: 150, top: 700, width: 120, height: 60 });
await sampleRegion('garage-door-blue', { left: 600, top: 495, width: 60, height: 18 });
await sampleRegion('rim-light-blue', { left: 690, top: 690, width: 30, height: 30 });
await sampleRegion('chrome-highlight', { left: 470, top: 120, width: 24, height: 14 });
await sampleRegion('chrome-mid', { left: 300, top: 150, width: 30, height: 20 });
await sampleRegion('pullup-plaque-blue', { left: 150, top: 1180, width: 60, height: 20 });
await sampleRegion('contact-label-blue', { left: 250, top: 1310, width: 60, height: 20 });

const stats = await sharp(SRC).stats();
console.log(`  dominant (overall)   ${toHex(stats.dominant)}`);
