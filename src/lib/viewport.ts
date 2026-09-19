/**
 * Viewport utilities — shared, testable logic (unit-tested in tests/unit).
 * Bands mirror the recomposition breakpoints in docs/design-lab/08 and the QA matrix (docs/16).
 */

export type Band = 'narrow' | 'mobile' | 'tablet' | 'desktop' | 'desktop-lg' | 'wide';

/** Map a viewport width (px) to a named responsive band. */
export function band(width: number): Band {
  if (width < 390) return 'narrow';
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'desktop';
  if (width < 1728) return 'desktop-lg';
  return 'wide';
}

/** True for touch-first bands, where hover-only affordances must not be relied on (docs/13). */
export function isTouchBand(width: number): boolean {
  const b = band(width);
  return b === 'narrow' || b === 'mobile' || b === 'tablet';
}
