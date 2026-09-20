-- After Hourz — uploaded client asset metadata (binary lives in R2, not here).
-- Rows are created at upload time (submission_id NULL), then associated to a submission
-- on final submit by review_session_id.
CREATE TABLE IF NOT EXISTS review_assets (
  asset_id TEXT PRIMARY KEY,          -- server-generated
  review_session_id TEXT NOT NULL,    -- links pre-submission uploads to the eventual submission
  submission_id TEXT,                 -- filled on final submit
  client_slug TEXT NOT NULL,
  category TEXT NOT NULL,             -- completed-build | before-after | process | shop | portrait | logo | reference | vendor-document | other
  original_filename TEXT,
  object_key TEXT NOT NULL,           -- safe server-generated R2 key (never client-provided)
  mime_type TEXT,
  size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'stored',  -- stored | test
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_review_assets_session ON review_assets(review_session_id);
CREATE INDEX IF NOT EXISTS idx_review_assets_submission ON review_assets(submission_id);
