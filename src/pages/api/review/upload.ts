/*
  After Hourz — client-review ASSET UPLOAD endpoint (TEMPORARY review workflow; NOT production).

  Second (and last) dynamic surface of this project alongside /api/review/submit. Runs on a
  Cloudflare Worker. Trust boundary: everything arriving here is untrusted. Order of operations
  is deliberate — cheap rejects first (method, content-type, declared size), then parse the
  form, then validate the fields (category, session id), then the file (MIME + extension
  allowlist, per-kind size), then R2 put, then the D1 insert.

  UPLOAD CONTRACT (endpoint + UI must agree):
    POST /api/review/upload  multipart/form-data
      file             — the binary (image or small document)
      category         — one of ASSET_CATEGORIES
      reviewSessionId  — stable client session id (links pre-submission uploads to the submission)
    200 -> { ok:true, assetId, category, filename, status:"stored" }
    err -> { ok:false, error } with 400 / 413 / 415 / 500

  The browser NEVER sees the R2 object key. We generate a safe server-side key and store the
  binary in R2 (env.ASSETS_BUCKET) plus a metadata row in D1 (review_assets) with submission_id
  NULL. On final submit, rows are associated to the submission by review_session_id.

  SECURITY / LOGGING RULES (non-negotiable):
    - NEVER log file bytes, the object key, the original filename, or any secret. Safe fields
      only: a fixed event name, a coarse result, the server assetId, the category, the size in
      bytes, and an error *class* name.
*/
import type { APIContext } from 'astro';
import { env } from 'cloudflare:workers';
import { ASSET_CATEGORIES, REVIEW_CLIENT_SLUG } from '../../../lib/review/schema';

// Dynamic (on-demand) like the submit route; every page stays prerendered.
export const prerender = false;

/** Per-kind byte ceilings. Images are capped lower than documents. */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // ~15 MB
const MAX_DOC_BYTES = 25 * 1024 * 1024; // ~25 MB

/**
 * EXACT allowlist. Both the reported MIME type AND the filename extension must appear here
 * (and agree) for a file to be accepted — anything else is a 415. `kind` selects the ceiling
 * and `ext` is the canonical, server-chosen extension that goes into the object key.
 */
const ALLOWED: ReadonlyArray<{
  mime: string;
  exts: readonly string[];
  ext: string; // canonical extension used to build the key (never client-derived)
  kind: 'image' | 'doc';
}> = [
  { mime: 'image/jpeg', exts: ['jpg', 'jpeg'], ext: 'jpg', kind: 'image' },
  { mime: 'image/png', exts: ['png'], ext: 'png', kind: 'image' },
  { mime: 'image/webp', exts: ['webp'], ext: 'webp', kind: 'image' },
  { mime: 'image/heic', exts: ['heic'], ext: 'heic', kind: 'image' },
  { mime: 'image/heif', exts: ['heif'], ext: 'heif', kind: 'image' },
  { mime: 'application/pdf', exts: ['pdf'], ext: 'pdf', kind: 'doc' },
  { mime: 'text/csv', exts: ['csv'], ext: 'csv', kind: 'doc' },
  {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    exts: ['xlsx'],
    ext: 'xlsx',
    kind: 'doc',
  },
];

const isCategory = (v: string): boolean => (ASSET_CATEGORIES as readonly string[]).includes(v);

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
function fail(error: string, status: number): Response {
  return json({ ok: false, error }, status);
}

/**
 * Structured, PII-free log line. Only ever receives a fixed event, a coarse result, an
 * optional server assetId + category + size, and an error class name — never file bytes,
 * the object key, the original filename, or secrets.
 */
function safeLog(fields: {
  result: string;
  status: number;
  assetId?: string;
  category?: string;
  size?: number;
  errorClass?: string;
}): void {
  try {
    console.log(
      JSON.stringify({
        event: 'review.upload',
        result: fields.result,
        status: fields.status,
        assetId: fields.assetId ?? null,
        category: fields.category ?? null,
        size: typeof fields.size === 'number' ? fields.size : null,
        errorClass: fields.errorClass ?? null,
      }),
    );
  } catch {
    /* logging must never throw into the request path */
  }
}

/** Safe, server-generated id — never derived from the client-provided filename. */
function makeAssetId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `AHA-${rand.slice(0, 20)}`;
}

/** Keep only a friendly, bounded display filename (for metadata only; never used as a key). */
function safeDisplayName(name: string): string {
  const trimmed = (name || 'upload').trim().slice(0, 120);
  // Strip path separators and any control chars (defense in depth; this is display-only).
  // The u flag lets \p{Cc} match control chars without embedding literal ones in source.
  return trimmed.replace(/[/\\]+|\p{Cc}+/gu, '_') || 'upload';
}

/** Lowercased final extension of a filename, or '' when there is none. */
function extOf(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) return '';
  return name
    .slice(dot + 1)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export async function POST(context: APIContext): Promise<Response> {
  const { request } = context;

  // (1) Method — enforced by the export name, but guard defensively.
  if (request.method !== 'POST') {
    safeLog({ result: 'rejected_method', status: 405 });
    return fail('Method not allowed.', 405);
  }

  // (2) Require multipart/form-data.
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    safeLog({ result: 'rejected_content_type', status: 415 });
    return fail('Upload must be sent as a file form.', 415);
  }

  // (3) Cheap reject on declared size before reading the whole body (biggest ceiling + slack).
  const declaredLen = Number(request.headers.get('content-length') ?? '');
  if (Number.isFinite(declaredLen) && declaredLen > MAX_DOC_BYTES + 64 * 1024) {
    safeLog({ result: 'rejected_too_large', status: 413 });
    return fail(
      'That file is too large. Please choose a smaller one or paste a link instead.',
      413,
    );
  }

  // (4) Parse the form.
  let form: FormData;
  try {
    form = await request.formData();
  } catch (err) {
    safeLog({
      result: 'rejected_body_read',
      status: 400,
      errorClass: err instanceof Error ? err.constructor.name : 'BodyReadError',
    });
    return fail('Could not read the uploaded file.', 400);
  }

  // (5) Required fields: category + reviewSessionId.
  const category = String(form.get('category') ?? '').trim();
  const reviewSessionId = String(form.get('reviewSessionId') ?? '').trim();
  const fileEntry = form.get('file');

  if (!isCategory(category)) {
    safeLog({ result: 'rejected_category', status: 400 });
    return fail('Please choose a valid category for this file.', 400);
  }
  if (reviewSessionId.length < 6 || reviewSessionId.length > 80) {
    safeLog({ result: 'rejected_session', status: 400, category });
    return fail('Missing or invalid upload session.', 400);
  }
  if (!(fileEntry instanceof File)) {
    safeLog({ result: 'rejected_no_file', status: 400, category });
    return fail('No file was included.', 400);
  }

  const file = fileEntry;
  const originalFilename = safeDisplayName(file.name);
  const reportedMime = (file.type || '').toLowerCase().split(';')[0].trim();
  const ext = extOf(file.name || '');

  // (6) Allowlist: MIME must be known AND the extension must match that MIME.
  const rule = ALLOWED.find((r) => r.mime === reportedMime);
  if (!rule || !rule.exts.includes(ext)) {
    safeLog({ result: 'rejected_type', status: 415, category });
    return fail(
      'That file type is not accepted. Please upload a photo (JPG, PNG, WEBP, HEIC), a PDF, or a spreadsheet (CSV, XLSX).',
      415,
    );
  }

  // (7) Size limit by kind. A zero/absent size is also a reject.
  const limit = rule.kind === 'image' ? MAX_IMAGE_BYTES : MAX_DOC_BYTES;
  const limitMb = Math.floor(limit / (1024 * 1024));
  if (!Number.isFinite(file.size) || file.size <= 0) {
    safeLog({ result: 'rejected_empty', status: 400, category });
    return fail('That file appears to be empty.', 400);
  }
  if (file.size > limit) {
    safeLog({ result: 'rejected_too_large', status: 413, category, size: file.size });
    return fail(
      rule.kind === 'image'
        ? `That photo is too large. Please keep photos under ${limitMb} MB.`
        : `That file is too large. Please keep files under ${limitMb} MB.`,
      413,
    );
  }

  // (8) Read the bytes once, then re-check the ACTUAL byte length (File.size can lie).
  let bytes: ArrayBuffer;
  try {
    bytes = await file.arrayBuffer();
  } catch (err) {
    safeLog({
      result: 'rejected_body_read',
      status: 400,
      category,
      errorClass: err instanceof Error ? err.constructor.name : 'BodyReadError',
    });
    return fail('Could not read the uploaded file.', 400);
  }
  const size = bytes.byteLength;
  if (size <= 0) {
    safeLog({ result: 'rejected_empty', status: 400, category });
    return fail('That file appears to be empty.', 400);
  }
  if (size > limit) {
    safeLog({ result: 'rejected_too_large', status: 413, category, size });
    return fail(
      rule.kind === 'image'
        ? `That photo is too large. Please keep photos under ${limitMb} MB.`
        : `That file is too large. Please keep files under ${limitMb} MB.`,
      413,
    );
  }

  // (9) Server-owned identity. The client filename is NEVER used in the key or path.
  const assetId = makeAssetId();
  const safeSession = reviewSessionId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'session';
  const objectKey = `review-assets/${safeSession}/${assetId}-${rule.ext}`;
  const nowIso = new Date().toISOString();

  // (10) Store the binary in R2 with the correct content type. Opaque to the browser.
  try {
    await env.ASSETS_BUCKET.put(objectKey, bytes, {
      httpMetadata: { contentType: rule.mime },
      customMetadata: {
        category,
        reviewSessionId,
        clientSlug: REVIEW_CLIENT_SLUG,
      },
    });
  } catch (err) {
    safeLog({
      result: 'error_r2',
      status: 500,
      category,
      size,
      errorClass: err instanceof Error ? err.constructor.name : 'UnknownError',
    });
    return fail('We could not save that file. Please try again.', 500);
  }

  // (11) Record the metadata row (submission_id NULL until final submit associates it).
  try {
    await env.DB.prepare(
      `INSERT INTO review_assets
         (asset_id, review_session_id, submission_id, client_slug, category,
          original_filename, object_key, mime_type, size_bytes, status, created_at)
       VALUES (?1, ?2, NULL, ?3, ?4, ?5, ?6, ?7, ?8, 'stored', ?9)`,
    )
      .bind(
        assetId,
        reviewSessionId,
        REVIEW_CLIENT_SLUG,
        category,
        originalFilename,
        objectKey,
        rule.mime,
        size,
        nowIso,
      )
      .run();
  } catch (err) {
    safeLog({
      result: 'error_db',
      status: 500,
      assetId,
      category,
      size,
      errorClass: err instanceof Error ? err.constructor.name : 'UnknownError',
    });
    return fail('We could not save that file. Please try again.', 500);
  }

  // (12) Minimal success envelope — the object key never leaves the server.
  safeLog({ result: 'ok', status: 200, assetId, category, size });
  return json({ ok: true, assetId, category, filename: originalFilename, status: 'stored' }, 200);
}

/** Any non-POST verb (GET included) is not allowed on this endpoint. */
export function GET(): Response {
  return fail('Method not allowed.', 405);
}
