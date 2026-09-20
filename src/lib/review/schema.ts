/*
  After Hourz — client-review submission CONTRACT (single source of truth).
  Imported by the questionnaire UI, the /api/review/submit Worker endpoint, and the local
  review:* tooling. Validation runs BOTH client-side (UX) and server-side (trust boundary).
*/
import { z } from 'zod';

export const SCHEMA_VERSION = 2;
export const REVIEW_CLIENT_SLUG = 'after-hourz';

/** Upload categories (kept in sync with the upload endpoint + tooling). */
export const ASSET_CATEGORIES = [
  'completed-build',
  'before-after',
  'process',
  'shop',
  'portrait',
  'logo',
  'reference',
  'vendor-document',
  'other',
] as const;

/*
  The three website directions Anthony chooses between. `id` is the stable route slug
  (unchanged); `name` is the CLIENT-FACING name used everywhere (cards, selection,
  questionnaire, confirmation, context brief). `tagline` is a plain-language "feel"
  sentence — no design-industry jargon.
*/
export const DIRECTIONS = [
  {
    id: 'chrome-heritage',
    no: '01',
    name: 'Chrome Heritage',
    tagline: 'Bold and classic — chrome, candy paint, and gold-leaf lettering.',
  },
  {
    id: 'booth-light',
    no: '02',
    name: 'Candy Cobalt',
    tagline: 'Clean and modern — deep candy-blue paint under bright light.',
  },
  {
    id: 'after-dark',
    no: '03',
    name: 'Midnight Boulevard',
    tagline: 'Cinematic night — cruising, chrome wire wheels, and city lights.',
  },
] as const;
export const DIRECTION_IDS = DIRECTIONS.map((d) => d.id);

/** Option catalogs shared with the UI (checkbox/select groups). */
export const SERVICE_OPTIONS = [
  'Custom paint',
  'Candy & metalflake',
  'Gold-leaf & pinstripe',
  'Body work & collision',
  'Rust repair & fabrication',
  'Full restoration',
  'Frame-off builds',
  'Hydraulics & suspension',
  'Chrome & wire wheels',
  'Detail, cut & buff',
  'Motorcycle / bike work',
  'Truck work',
] as const;

export const VEHICLE_OPTIONS = [
  'Cars',
  'Lowriders',
  'Trucks',
  'Motorcycles',
  'Classics',
  'Customs',
] as const;
export const CONTACT_METHOD_OPTIONS = [
  'Phone call',
  'Text',
  'Email',
  'Instagram DM',
  'Facebook',
  'Walk-in',
] as const;
export const MEDIA_LOCATION_OPTIONS = [
  'Instagram',
  'Facebook',
  'Phone camera roll',
  'Google Business',
  'On paper / prints',
  'None yet',
] as const;
export const PAYMENT_METHOD_OPTIONS = [
  'Cash',
  'Card in person',
  'Zelle / Venmo / CashApp',
  'Check',
  'Financing',
  'None yet',
] as const;
export const PRODUCT_TYPE_OPTIONS = [
  'Apparel / merch',
  'Stickers & banners',
  'Parts & accessories',
  'Gift cards',
  'Prints / posters',
  'Not sure yet',
] as const;
export const APPOINTMENT_TYPE_OPTIONS = [
  'Quote / estimate',
  'Drop-off consult',
  'Detail booking',
  'Build consult',
  'Not sure yet',
] as const;
export const YESNO_MAYBE = ['yes', 'no', 'maybe'] as const;

const shortStr = z.string().trim().max(400);
const longStr = z.string().trim().max(4000);
const strArr = z.array(z.string().trim().max(200)).max(40);

/** An uploaded asset REFERENCE stored in the submission (binary lives in R2, not here). */
export const assetRefSchema = z.object({
  assetId: z.string().trim().min(1).max(80),
  category: z.enum(ASSET_CATEGORIES as unknown as [string, ...string[]]),
  filename: shortStr,
});
export type AssetRef = z.infer<typeof assetRefSchema>;

/** An inspiration reference: a pasted link and/or an uploaded image. */
export const referenceSchema = z.object({
  kind: z.enum(['link', 'image']),
  value: shortStr.optional(), // the link (forgiving: url or @handle)
  assetId: z.string().trim().max(80).optional(), // when kind==='image'
  note: shortStr.optional(),
});

/** A vendor Anthony buys from (repeatable). */
export const vendorSchema = z.object({
  name: shortStr.optional(),
  website: shortStr.optional(),
  catalogUrl: shortStr.optional(),
  assetId: z.string().trim().max(80).optional(), // uploaded catalog/price sheet
});

/** The full, versioned submission object. Optional everywhere the client may not know a fact. */
export const reviewSubmissionSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  clientSlug: z.literal(REVIEW_CLIENT_SLUG).default(REVIEW_CLIENT_SLUG),
  // client-supplied draft key for idempotent retries (server still authoritative on id/time)
  idempotencyKey: z.string().trim().min(6).max(80).optional(),
  // stable id linking pre-submission uploads (R2) to this submission
  reviewSessionId: z.string().trim().min(6).max(80).optional(),

  design: z.object({
    selection: z.enum(DIRECTION_IDS as unknown as [string, ...string[]]),
    likes: strArr.default([]),
    changes: longStr.optional(),
    borrowedIdeas: longStr.optional(),
  }),

  business: z.object({
    description: longStr.optional(),
    knownFor: longStr.optional(),
    vehicles: strArr.default([]),
    differentiators: longStr.optional(),
    originStory: longStr.optional(),
    culturalInfluence: longStr.optional(),
  }),

  services: z.object({
    offered: strArr.default([]),
    featured: strArr.default([]),
    hidden: strArr.default([]),
  }),

  customerJourney: z.object({
    primaryAction: shortStr.optional(),
    actions: strArr.default([]),
    currentContactMethods: strArr.default([]),
    photoUploadInterest: z.enum(YESNO_MAYBE).optional(),
    intakeRequirements: longStr.optional(),
  }),

  portfolio: z.object({
    completedVehiclePhotos: shortStr.optional(),
    beforeAfterPhotos: shortStr.optional(),
    processMedia: shortStr.optional(),
    mediaLocations: strArr.default([]),
    priorityBuilds: longStr.optional(),
  }),

  location: z.object({
    city: shortStr.optional(),
    state: shortStr.optional(),
    serviceAreas: longStr.optional(),
    appointmentRequired: z.enum(YESNO_MAYBE).optional(),
    businessHours: longStr.optional(),
  }),

  contact: z.object({
    phone: shortStr.optional(),
    email: z.string().trim().max(200).optional(),
    preferredMethod: shortStr.optional(),
  }),

  social: z.object({
    instagram: shortStr.optional(),
    facebook: shortStr.optional(),
    tiktok: shortStr.optional(),
    youtube: shortStr.optional(),
    googleBusiness: shortStr.optional(),
    other: shortStr.optional(),
  }),

  domain: z.object({
    ownsDomain: z.enum(YESNO_MAYBE).optional(),
    domain: shortStr.optional(),
    preferredDomain: shortStr.optional(),
  }),

  store: z.object({
    interested: z.enum(YESNO_MAYBE).optional(),
    productTypes: strArr.default([]),
    wholesaleVendors: longStr.optional(),
    vendors: longStr.optional(),
    vendorList: z.array(vendorSchema).max(20).default([]),
    vendorAssets: strArr.default([]),
    fulfillment: longStr.optional(),
    initialCatalogSize: shortStr.optional(),
  }),

  booking: z.object({
    interested: z.enum(YESNO_MAYBE).optional(),
    appointmentTypes: strArr.default([]),
    paymentAtBooking: z.enum(YESNO_MAYBE).optional(),
  }),

  payments: z.object({
    currentMethods: strArr.default([]),
    onlinePaymentsInterest: z.enum(YESNO_MAYBE).optional(),
    depositInterest: z.enum(YESNO_MAYBE).optional(),
  }),

  project: z.object({
    phase1Acknowledged: z.boolean(),
    phase2Acknowledged: z.boolean(),
    thirdPartyCostsAcknowledged: z.boolean(),
  }),

  // Inspiration references (optional links and/or uploaded images).
  references: z.array(referenceSchema).max(30).default([]),
  // Uploaded asset REFERENCES (binary in R2). Full metadata lives in D1 review_assets.
  assets: z.array(assetRefSchema).max(60).default([]),

  additionalNotes: longStr.optional(),
});

export type AfterHourzReviewSubmission = z.infer<typeof reviewSubmissionSchema>;

/** The minimal envelope the browser POSTs: the submission + a Turnstile token. */
export const submitRequestSchema = z.object({
  turnstileToken: z.string().min(1).max(4000),
  submission: reviewSubmissionSchema,
});
export type SubmitRequest = z.infer<typeof submitRequestSchema>;

/** Parse/validate untrusted input (server + client). */
export function parseSubmission(input: unknown) {
  return reviewSubmissionSchema.safeParse(input);
}

/** Server-authoritative receipt id, e.g. AH-2026-7F3K. Not sequential (no DB internals leaked). */
export function makeReceiptId(year: number, rand: string): string {
  const suffix = rand
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X');
  return `AH-${year}-${suffix}`;
}

/** Project phase copy (client-facing; not a legal contract — acknowledgement language). */
export const PROJECT_PHASES = {
  phase1: {
    title: 'Phase 1 — Core website + launch',
    fee: '$500 development fee',
    blurb: 'A polished one-page After Hourz website in the approved direction, plus launch.',
  },
  phase2: {
    title: 'Phase 2 — Online sales / booking',
    fee: '$500 additional development fee',
    blurb: 'Initial online store and/or booking, scoped to your answers below.',
  },
  thirdParty:
    'You cover applicable third-party costs directly: domain registration, paid hosting if it becomes necessary, payment-processing fees, optional paid services, and business email if selected.',
} as const;
