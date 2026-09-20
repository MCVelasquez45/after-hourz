/*
  After Hourz — Cloudflare Turnstile widget (React wrapper).
  Loads the Turnstile script once, renders an explicit widget, and reports the token up.
  Site key is passed from the server (env TURNSTILE_SITE_KEY); the test key
  1x00000000000000000000AA always passes and is the safe default for local review.
*/
import { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
      theme?: 'auto' | 'light' | 'dark';
    },
  ) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('turnstile load failed')));
      if (window.turnstile) resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('turnstile load failed'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function Turnstile(props: {
  siteKey: string;
  onToken: (token: string) => void;
  onError?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  // keep latest callbacks without forcing re-render/re-mount of the widget
  const onToken = useRef(props.onToken);
  const onError = useRef(props.onError);
  onToken.current = props.onToken;
  onError.current = props.onError;

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) return; // already rendered
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: props.siteKey,
          theme: 'dark',
          callback: (token) => onToken.current(token),
          'error-callback': () => onError.current?.(),
          'expired-callback': () => onToken.current(''),
        });
      })
      .catch(() => {
        if (!cancelled) onError.current?.();
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.siteKey]);

  return <div className="rv-turnstile" ref={containerRef} data-testid="turnstile" />;
}
