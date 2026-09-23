# 0013 — Expand the client review app into a full discovery questionnaire (schema v3)

DECISION: `/review/after-hourz` moves from "design review + light intake" to a **complete client
discovery questionnaire** — every fact needed to build the production site should be collectible
through it, with minimal follow-up. Bumped `SCHEMA_VERSION` 2 → 3 (breaking draft shape change).

CONTEXT: A content/UX audit (`.ai/reviews/2026-09-22-client-review-form-content-audit.md`) found
that `scripts/review/context.mjs` and `brief.mjs` already treated several submission fields
(`location.businessHours`, `.serviceAreas`, `.appointmentRequired`, `customerJourney.primaryAction`,
`payments.depositInterest`) as expected client answers — but no question in `steps.tsx` could ever
set them, so the generated brief would *always* list them as open questions regardless of what the
client actually knew. Separately, `store.vendors` (duplicate of `store.wholesaleVendors`),
`store.vendorList` (structured vendor array), and the top-level `references[]` (link/image
inspiration array) existed in the schema/draft but had no UI ever wired to them — genuinely dead
data-model surface.

CHANGES:
- **Added questions** (all optional, same one-question-per-screen pattern): shop hours, service
  area, appointment-required (`online-hours`); primary site CTA (`online-primary-action`); what a
  customer needs to provide for a quote + whether they can attach vehicle photos (`online-intake`);
  secondary site goals, repurposing the previously-dead `customerJourney.actions` field
  (`online-goals`); ideal customers (`about-target-customers`); existing logo / brand colors, with
  a `logo` uploader (`about-branding`); other inspiration sites/pages, replacing the dead
  `references[]` array with a plain-text field, `design.inspirationLinks` (`design-inspiration`);
  shop + owner/team photo uploads (`work-shop-photos`); testimonials/reviews to feature
  (`work-testimonials`); deposit interest, added to the existing `store-payments` question; a final
  catch-all "anything else?" (`project-notes`, → `additionalNotes`, which was in the schema but
  never asked either).
- **Added `VEHICLE_OPTIONS: 'Bicycles / pedal bikes'`** — lowrider bike-club builds are distinct
  from motorcycles and were previously uncollectable as a vehicle type.
- **Removed dead schema/draft surface:** `store.vendors`, `store.vendorList`, `vendorSchema`, the
  top-level `references[]` array, `referenceSchema`, and the `DraftReference` type. `brief.mjs` had
  a fallback (`vendors ?? wholesaleVendors`) that only worked by accident since `vendors` was always
  empty — simplified to just `wholesaleVendors`. `scripts/review/assets-summary.mjs` no longer takes
  a `references` param; `clientAssetsSection(assets)` dropped the always-empty "Inspiration
  references provided" block.
- Summary screen (`summary.tsx`) updated to show every newly-collected answer before submit, and
  the now-pointless `ReferencesGroup` (always rendered `null`) was deleted.

OPTIONS:
- Wire up the missing fields in place (chosen) — the fields were already load-bearing in
  `context.mjs`/`brief.mjs`; asking for them closes the gap those scripts already assumed was
  closed.
- Strip the unused fields from the schema entirely instead of asking for them (rejected for
  `businessHours`/`serviceAreas`/`appointmentRequired`/`primaryAction`/`depositInterest` — these are
  basic facts a shop site needs on day one; rejected only genuinely-dead fields:
  `store.vendors`/`vendorList`/`references[]`).

WHY: The review app's whole purpose is to avoid an out-of-band conversation with Anthony for basic
facts. A brief-generator that already expects an answer but a form that can never produce one is a
silent gap that only shows up after the client has "finished" the questionnaire.

TRADEOFFS: The interview is longer (11 new questions, all optional/skippable, none gated by new
branching). `SCHEMA_VERSION` bump invalidates any in-progress client draft in localStorage — accepted
since no real client submission exists yet against v2.

STATUS: accepted
DATE: 2026-09-22
