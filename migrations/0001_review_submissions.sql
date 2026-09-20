-- After Hourz — client review submissions (temporary review workflow, D1).
-- One row per completed intake. The normalized payload_json is the source object;
-- top-level columns are extracted for listing/indexing only.
CREATE TABLE IF NOT EXISTS review_submissions (
  id TEXT PRIMARY KEY,               -- server-generated receipt id e.g. AH-2026-XXXX
  client_slug TEXT NOT NULL,         -- e.g. after-hourz
  status TEXT NOT NULL DEFAULT 'submitted',  -- submitted | test
  design_selection TEXT,             -- chrome-heritage | booth-light | after-dark
  idempotency_key TEXT,              -- client draft key, dedupes retries
  payload_json TEXT NOT NULL,        -- full AfterHourzReviewSubmission JSON
  schema_version INTEGER NOT NULL,
  created_at TEXT NOT NULL,          -- server ISO timestamp
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_review_submissions_client ON review_submissions(client_slug);
CREATE INDEX IF NOT EXISTS idx_review_submissions_created ON review_submissions(created_at);
-- retry idempotency: at most one row per (client, idempotency_key)
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_submissions_idem
  ON review_submissions(client_slug, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
