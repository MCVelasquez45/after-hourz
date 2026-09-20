/*
  After Hourz — minimal ambient types for the Cloudflare Worker runtime.

  This project does NOT depend on @cloudflare/workers-types (kept lean per the
  reset directive), so the few Cloudflare surfaces the review endpoint touches are
  declared here by hand: the D1 binding it writes to and the `cloudflare:workers`
  env accessor. These are intentionally minimal — only what /api/review/submit uses.

  Runtime note: @astrojs/cloudflare (Astro 7 / adapter v14) REMOVED
  `Astro.locals.runtime.env` — that getter now throws. The supported way to read
  bindings inside a Worker route is `import { env } from 'cloudflare:workers'`.
*/

/** Minimal D1 prepared-statement surface used by the submit endpoint. */
interface AfterHourzD1PreparedStatement {
  bind(...values: unknown[]): AfterHourzD1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<{
    success: boolean;
    results?: T[];
    meta: Record<string, unknown>;
  }>;
  all<T = Record<string, unknown>>(): Promise<{
    success: boolean;
    results: T[];
    meta: Record<string, unknown>;
  }>;
}

/** Minimal D1 database surface used by the submit endpoint. */
interface AfterHourzD1Database {
  prepare(query: string): AfterHourzD1PreparedStatement;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

/** Minimal R2 bucket surface used by the upload endpoint (put only). */
interface AfterHourzR2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string | null,
    options?: {
      httpMetadata?: { contentType?: string; [k: string]: unknown };
      customMetadata?: Record<string, string>;
      [k: string]: unknown;
    },
  ): Promise<unknown>;
}

/** The bindings + vars + secrets configured in wrangler.jsonc for this Worker. */
interface AfterHourzReviewEnv {
  DB: AfterHourzD1Database;
  ASSETS_BUCKET: AfterHourzR2Bucket;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;
  REVIEW_CLIENT_SLUG: string;
}

declare module 'cloudflare:workers' {
  export const env: AfterHourzReviewEnv;
}
