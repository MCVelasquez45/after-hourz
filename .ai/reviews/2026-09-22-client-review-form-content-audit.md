# Client Review Form — Content & UX Audit — 2026-09-22

**Scope:** the live client-facing questionnaire at `/review/after-hourz` (`src/components/review/`)
— question wording, branching, flow, and whether the data it collects actually reaches the
downstream tooling (`scripts/review/context.mjs`, `brief.mjs`) that turns a submission into a
production brief. Not a security/functional QA pass (upload pipeline, Turnstile, D1 writes are
out of scope here).

---

## P1 — Several fields the brief-generator expects are structurally uncollectable

`src/lib/review/schema.ts` defines the submission contract; `scripts/review/context.mjs` and
`brief.mjs` already know to flag these as **"ask the client"** gaps when absent. But there is no
question anywhere in `src/components/review/steps.tsx` that can ever set them — so they are
**always** absent, and the generated brief will **always** list them as open questions, no matter
what the client actually knows.

| Field | Referenced by | Asked in the form? |
| --- | --- | --- |
| `customerJourney.primaryAction` | `context.mjs:36,99,111,258,287` — driving the site's primary CTA | **No** |
| `customerJourney.actions` | schema only | **No** |
| `customerJourney.photoUploadInterest` | schema only | **No** |
| `customerJourney.intakeRequirements` | `context.mjs:103` | **No** |
| `location.businessHours` | `context.mjs:42,151,319`, `assets-summary.mjs:191` | **No** |
| `location.serviceAreas` | `context.mjs:149` | **No** |
| `location.appointmentRequired` | `context.mjs:150` | **No** |
| `payments.depositInterest` | `context.mjs:218,268,301`, `brief.mjs:119` | **No** (`store-booking-types` asks a *different* field, `booking.paymentAtBooking`) |
| `store.vendors` | schema only (separate from `store.wholesaleVendors`, which *is* asked) | **No** |
| `store.vendorList` (structured name/website/catalogUrl/assetId per vendor) | schema only | **No** — not even modeled in `draft.ts` |
| `references[]` (inspiration links/images) | `summary.tsx` renders a "References" group for it | **No** — `ReferencesGroup` in `summary.tsx:180-208` always computes `total === 0` and returns `null`, since nothing ever pushes into `draft.references`. Dead UI. |

**Why it matters:** `location.businessHours` and `location.appointmentRequired` in particular are
basic facts a shop site needs on day one (hours block, "walk-ins vs. appointment-only" messaging).
Right now the only way to get them is an out-of-band conversation with Anthony — the guided
interview was clearly built to avoid exactly that.

**Fix shape (not applied — flagging for a decision):** either (a) add 3–4 short questions to
`steps.tsx` under the `online` or a new `location` section for `businessHours`,
`appointmentRequired`, `serviceAreas`, and `customerJourney.primaryAction`, and delete the
`references[]` UI stub / `store.vendors` / `store.vendorList` dead fields from the schema, or
(b) if these were deliberately deferred to a follow-up conversation, delete them from the schema
and downstream scripts so the generated brief stops flagging them as gaps every time.

## P2 — `store.vendors` vs `store.wholesaleVendors` — likely schema drift

Two near-identical free-text vendor fields exist (`wholesaleVendors` is asked in
`store-vendors`; `vendors` is not asked and has no visible purpose). Looks like a rename that
didn't get cleaned up. Low risk, but worth resolving alongside the P1 fix so the schema doesn't
carry silently-dead fields.

## P3 — No format validation on phone/email (judgment call, not a bug)

`fields.tsx`'s `TextField` accepts phone/email as free text with no pattern validation, and the
schema (`shortStr` / a bare `z.string().max(200)`) doesn't constrain format either. Given the
form's explicit "forgiving intake, never mangle input" design philosophy (see `draft.ts` comments
on `normalizeLinkOrHandle`), this is plausibly intentional — flagging only in case it wasn't.

## What's working well

- **Branching is clean and correct** — `wantsStore`, `wantsBooking`, `ownsDomain`, `hasGoogle`,
  `hasSomePhotos` predicates in `steps.tsx` all check out against the questions they gate; no
  question asks for information already ruled out by an earlier answer.
- **Progressive disclosure ("Why we're asking" / "Where do I find this?")** is used consistently
  and keeps the plain-language tone the comments call for.
- **Autosave + non-destructive resubmission** (`ReviewApp.tsx`) — a returning visitor lands on a
  Welcome Back hub, not step 1; "Change My Selection" creates a new/amended submission rather than
  mutating the original. Good trust behavior for a non-technical client.
- **The three-looks chooser** is required before anything else (`canLeaveDesign` gate) and always
  reachable again via the Welcome Back hub or summary edit — no dead ends.
- **The summary screen is honest** — every empty field reads as "Not answered," never a fabricated
  default, consistent with the project's "never fabricate client facts" rule (`CLAUDE.md`).
- **Accessibility groundwork is present** — live region announcements on screen change,
  `aria-expanded`/`aria-controls` on disclosures, labeled fields throughout.

## Recommendation

Resolve P1 before the client fills the form again: either wire up the missing questions or trim
the schema to match what's actually asked. Everything else here is minor.
