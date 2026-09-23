/*
  After Hourz — client-review submission endpoint (TEMPORARY review workflow; NOT production).

  The ONE dynamic surface of this project (see astro.config.mjs). Runs on a Cloudflare Worker.
  Trust boundary: everything arriving here is untrusted. Order of operations is deliberate —
  cheap rejects first (method, content-type, size), then parse, then schema validation, then
  the Turnstile human check, then a server-authoritative write to D1.

  SECURITY / LOGGING RULES (non-negotiable):
    - NEVER log the payload, contact info, the Turnstile token, or the secret.
    - Safe log fields only: a fixed event name, a coarse result, the server submissionId,
      and an error *class* name. Nothing user-authored.
    - The server is authoritative for id + timestamps. Client-supplied id/time are ignored.

  Bindings/vars/secrets come from `cloudflare:workers` (Astro 7 / @astrojs/cloudflare v14
  removed Astro.locals.runtime.env). See src/lib/review/cloudflare-env.d.ts.
*/
import type { APIContext } from 'astro';
import { env } from 'cloudflare:workers';
import {
  SCHEMA_VERSION,
  REVIEW_CLIENT_SLUG,
  submitRequestSchema,
  parseSubmission,
  makeReceiptId,
  type AfterHourzReviewSubmission,
} from '../../../lib/review/schema';

// This route is dynamic (on-demand). Every other page in the project stays prerendered.
export const prerender = false;

/** Max accepted request body. The full questionnaire is small; 64KB is generous headroom. */
const MAX_BODY_BYTES = 64 * 1024;

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Uniform JSON responder. No caching of a mutating endpoint. */
function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function ok(submissionId: string, submittedAt: string): Response {
  // `id` is the field the client reads; `submissionId` kept for any external tooling.
  return json({ ok: true, id: submissionId, submissionId, submittedAt }, 200);
}

function fail(error: string, status: number): Response {
  return json({ ok: false, error }, status);
}

/**
 * Structured, PII-free log line. Only ever receives a fixed event, a coarse result,
 * an optional server-generated id, and an error class name — never user content.
 */
function safeLog(fields: {
  result: string;
  status: number;
  submissionId?: string;
  errorClass?: string;
}): void {
  try {
    console.log(
      JSON.stringify({
        event: 'review.submit',
        result: fields.result,
        status: fields.status,
        submissionId: fields.submissionId ?? null,
        errorClass: fields.errorClass ?? null,
      }),
    );
  } catch {
    // Logging must never throw into the request path.
  }
}

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

/** Server-side Turnstile verification. Returns true only on an affirmative success. */
async function verifyTurnstile(token: string, remoteip: string | undefined): Promise<boolean> {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (remoteip) form.append('remoteip', remoteip);

  const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
  if (!res.ok) return false;
  const data = (await res.json()) as TurnstileVerifyResponse;
  return data.success === true;
}

/**
 * Insert the submission, deduping on (client_slug, idempotency_key) when a key is present.
 * Returns the authoritative row id — for a retry that hit the unique index, the EXISTING id.
 */
async function persistSubmission(args: {
  candidateId: string;
  submission: AfterHourzReviewSubmission;
  payloadJson: string;
  nowIso: string;
}): Promise<{ id: string }> {
  const { candidateId, submission, payloadJson, nowIso } = args;
  const idempotencyKey = submission.idempotencyKey ?? null;

  if (idempotencyKey !== null) {
    // Idempotent path. The unique index is partial (WHERE idempotency_key IS NOT NULL),
    // so the ON CONFLICT target must repeat that predicate to match the index. On a retry
    // we do a no-op-ish UPDATE (bump updated_at) and RETURN the pre-existing id.
    const stmt = env.DB.prepare(
      `INSERT INTO review_submissions
         (id, client_slug, status, design_selection, idempotency_key, payload_json, schema_version, created_at, updated_at)
       VALUES (?1, ?2, 'submitted', ?3, ?4, ?5, ?6, ?7, ?7)
       ON CONFLICT (client_slug, idempotency_key) WHERE idempotency_key IS NOT NULL
       DO UPDATE SET updated_at = excluded.updated_at
       RETURNING id`,
    ).bind(
      candidateId,
      REVIEW_CLIENT_SLUG,
      submission.design.selection ?? 'unspecified',
      idempotencyKey,
      payloadJson,
      SCHEMA_VERSION,
      nowIso,
    );

    const row = await stmt.first<{ id: string }>();
    if (row?.id) return { id: row.id };
    // Fallback: some D1 builds may not RETURN from a DO UPDATE conflict — read the existing row.
    const existing = await env.DB.prepare(
      `SELECT id FROM review_submissions WHERE client_slug = ?1 AND idempotency_key = ?2 LIMIT 1`,
    )
      .bind(REVIEW_CLIENT_SLUG, idempotencyKey)
      .first<{ id: string }>();
    if (existing?.id) return { id: existing.id };
    return { id: candidateId };
  }

  // No idempotency key: plain insert with a unique server id.
  await env.DB.prepare(
    `INSERT INTO review_submissions
       (id, client_slug, status, design_selection, idempotency_key, payload_json, schema_version, created_at, updated_at)
     VALUES (?1, ?2, 'submitted', ?3, NULL, ?4, ?5, ?6, ?6)`,
  )
    .bind(
      candidateId,
      REVIEW_CLIENT_SLUG,
      submission.design.selection ?? 'unspecified',
      payloadJson,
      SCHEMA_VERSION,
      nowIso,
    )
    .run();

  return { id: candidateId };
}

/**
 * Associate any pre-submission uploads (R2 rows created by /api/review/upload) to this
 * submission. Keyed by (review_session_id, client_slug). Idempotent: re-running on a retry
 * simply re-stamps the same submission_id. Never throws into the request path — a failed
 * association is logged but does not fail an otherwise-successful submit (the asset
 * REFERENCES also live in payload_json). Object keys are never read out or logged.
 */
async function associateAssets(args: {
  reviewSessionId: string | undefined;
  submissionId: string;
}): Promise<void> {
  const { reviewSessionId, submissionId } = args;
  if (!reviewSessionId) return;
  await env.DB.prepare(
    `UPDATE review_assets
        SET submission_id = ?1
      WHERE review_session_id = ?2
        AND client_slug = ?3`,
  )
    .bind(submissionId, reviewSessionId, REVIEW_CLIENT_SLUG)
    .run();
}

export async function POST(context: APIContext): Promise<Response> {
  const { request, clientAddress } = context;

  // (1) Method is enforced by the export name, but guard defensively.
  if (request.method !== 'POST') {
    safeLog({ result: 'rejected_method', status: 405 });
    return fail('Method not allowed.', 405);
  }

  // (2) Require JSON.
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    safeLog({ result: 'rejected_content_type', status: 415 });
    return fail('Content-Type must be application/json.', 415);
  }

  // (3) Enforce a payload size limit — trust Content-Length first, then the actual bytes.
  const declaredLen = Number(request.headers.get('content-length') ?? '');
  if (Number.isFinite(declaredLen) && declaredLen > MAX_BODY_BYTES) {
    safeLog({ result: 'rejected_too_large', status: 413 });
    return fail('Payload too large.', 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    safeLog({ result: 'rejected_body_read', status: 400, errorClass: 'BodyReadError' });
    return fail('Could not read request body.', 400);
  }
  // Guard again on real byte length (Content-Length may be absent or spoofed).
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    safeLog({ result: 'rejected_too_large', status: 413 });
    return fail('Payload too large.', 413);
  }

  // (4) Parse JSON.
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    safeLog({ result: 'rejected_json_parse', status: 400, errorClass: 'SyntaxError' });
    return fail('Invalid JSON.', 400);
  }

  // (5) Validate the envelope, then the inner submission via the shared contract.
  const envelope = submitRequestSchema.safeParse(parsedBody);
  if (!envelope.success) {
    safeLog({ result: 'rejected_schema_envelope', status: 400, errorClass: 'ZodError' });
    return fail('Invalid submission.', 400);
  }
  const submissionParse = parseSubmission(envelope.data.submission);
  if (!submissionParse.success) {
    safeLog({ result: 'rejected_schema_submission', status: 400, errorClass: 'ZodError' });
    return fail('Invalid submission.', 400);
  }
  // (7) Normalized/trimmed data is what the schema returns (all strings .trim()'d).
  const submission = submissionParse.data;
  const turnstileToken = envelope.data.turnstileToken;

  // (6) Verify the Turnstile token SERVER-SIDE. Never trust a client "passed" flag.
  let humanVerified: boolean;
  try {
    humanVerified = await verifyTurnstile(turnstileToken, clientAddress);
  } catch (err) {
    safeLog({
      result: 'error_turnstile',
      status: 500,
      errorClass: err instanceof Error ? err.constructor.name : 'UnknownError',
    });
    return fail('Verification failed. Please try again.', 500);
  }
  if (!humanVerified) {
    safeLog({ result: 'rejected_turnstile', status: 403 });
    return fail('Human verification failed.', 403);
  }

  // (8) Server-authoritative receipt id + ISO timestamps. Client id/time are ignored.
  const now = new Date();
  const candidateId = makeReceiptId(now.getUTCFullYear(), crypto.randomUUID());
  const nowIso = now.toISOString();
  // Persist the validated (normalized) submission, not the raw client bytes.
  const payloadJson = JSON.stringify(submission);

  // (9)+(10) Write to D1 with a prepared statement; dedupe idempotent retries.
  let saved: { id: string };
  try {
    saved = await persistSubmission({ candidateId, submission, payloadJson, nowIso });
  } catch (err) {
    safeLog({
      result: 'error_db',
      status: 500,
      errorClass: err instanceof Error ? err.constructor.name : 'UnknownError',
    });
    return fail('Could not save submission. Please try again.', 500);
  }

  // (11) Associate any pre-submission uploads to this submission. Best-effort and
  // idempotent — a failure here must not fail an otherwise-successful submit, since the
  // asset REFERENCES are also persisted in payload_json.
  try {
    await associateAssets({ reviewSessionId: submission.reviewSessionId, submissionId: saved.id });
  } catch (err) {
    safeLog({
      result: 'warn_asset_association',
      status: 200,
      submissionId: saved.id,
      errorClass: err instanceof Error ? err.constructor.name : 'UnknownError',
    });
  }

  // (12) Minimal success envelope. Object keys are never exposed.
  safeLog({ result: 'ok', status: 200, submissionId: saved.id });
  return ok(saved.id, nowIso);
}

/** Any non-POST verb (GET included) is not allowed on this endpoint. */
export function GET(): Response {
  return fail('Method not allowed.', 405);
}
