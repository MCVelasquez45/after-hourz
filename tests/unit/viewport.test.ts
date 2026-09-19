import { describe, it, expect } from 'vitest';
import { band, isTouchBand } from '../../src/lib/viewport';

describe('band()', () => {
  it('maps boundary widths to the correct responsive band', () => {
    expect(band(320)).toBe('narrow');
    expect(band(389)).toBe('narrow');
    expect(band(390)).toBe('mobile');
    expect(band(767)).toBe('mobile');
    expect(band(768)).toBe('tablet');
    expect(band(1023)).toBe('tablet');
    expect(band(1024)).toBe('desktop');
    expect(band(1439)).toBe('desktop');
    expect(band(1440)).toBe('desktop-lg');
    expect(band(1727)).toBe('desktop-lg');
    expect(band(1728)).toBe('wide');
    expect(band(1920)).toBe('wide');
  });
});

describe('isTouchBand()', () => {
  it('treats narrow/mobile/tablet as touch-first', () => {
    expect(isTouchBand(360)).toBe(true);
    expect(isTouchBand(430)).toBe(true);
    expect(isTouchBand(834)).toBe(true);
  });
  it('treats desktop and wider as non-touch', () => {
    expect(isTouchBand(1440)).toBe(false);
    expect(isTouchBand(1920)).toBe(false);
  });
});
