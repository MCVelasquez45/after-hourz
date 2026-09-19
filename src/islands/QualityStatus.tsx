import { useEffect, useState } from 'react';
import { band } from '../lib/viewport';

/*
  QualityStatus — the ONE hydrated React island in the scaffold (docs/decisions 0005).
  Justification for hydration: it reports genuinely client-side runtime state
  (viewport, reduced-motion preference, JS) that cannot be known at build time.
  Everything else on /design-lab is static Astro + CSS.
*/

type Probe = {
  width: number;
  height: number;
  reducedMotion: boolean;
  dpr: number;
};

function useProbe(): Probe | null {
  const [probe, setProbe] = useState<Probe | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () =>
      setProbe({
        width: window.innerWidth,
        height: window.innerHeight,
        reducedMotion: mq.matches,
        dpr: window.devicePixelRatio,
      });
    read();
    window.addEventListener('resize', read);
    mq.addEventListener('change', read);
    return () => {
      window.removeEventListener('resize', read);
      mq.removeEventListener('change', read);
    };
  }, []);

  return probe;
}

export default function QualityStatus() {
  const probe = useProbe();

  const rows: Array<[string, string]> = probe
    ? [
        ['viewport', `${probe.width}×${probe.height}`],
        ['band', band(probe.width)],
        ['dpr', probe.dpr.toFixed(2)],
        ['reduced-motion', probe.reducedMotion ? 'ON' : 'off'],
        ['react island', 'hydrated'],
      ]
    : [['status', 'hydrating…']];

  return (
    <dl
      aria-label="Live runtime quality probe"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '0.25rem 1.125rem',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-caption)',
        margin: 0,
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt
            style={{
              color: 'var(--color-pewter)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {k}
          </dt>
          <dd
            style={{
              margin: 0,
              color: v === 'ON' ? 'var(--color-signal)' : 'var(--color-chrome)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
