/*
  After Hourz — client review draft model + versioned localStorage persistence.
  The draft is a plain, always-serializable shape the UI edits freely. buildSubmission()
  projects it onto the SHARED contract (reviewSubmissionSchema) right before validate/submit.
  Unknown facts stay empty strings / empty arrays — we NEVER fabricate business facts.
*/
import {
  SCHEMA_VERSION,
  REVIEW_CLIENT_SLUG,
  reviewSubmissionSchema,
  type AfterHourzReviewSubmission,
  type AssetRef,
} from '../../lib/review/schema';

/** localStorage key is versioned so a schema bump never resurrects an incompatible draft. */
export const DRAFT_KEY = `ah-review-draft:${REVIEW_CLIENT_SLUG}:v${SCHEMA_VERSION}`;
export const RECEIPT_KEY = `ah-review-receipt:${REVIEW_CLIENT_SLUG}:v${SCHEMA_VERSION}`;

/** Yes/No/Maybe values used by several fields; '' means "no answer yet". */
export type YNM = '' | 'yes' | 'no' | 'maybe';

/**
 * An inspiration/reference the client added: a pasted link (or @handle) and/or an uploaded
 * image. Mirrors referenceSchema but always fully-serializable for the draft.
 */
export interface DraftReference {
  kind: 'link' | 'image';
  value?: string; // the link/handle (forgiving)
  assetId?: string; // when kind==='image'
  filename?: string; // display name for an uploaded image (UI only)
  note?: string;
}

/** Flat, fully-serializable editing model. Strings default '', multi-selects default []. */
export interface ReviewDraft {
  idempotencyKey: string;
  /** Stable id linking pre-submission uploads (R2) to this submission. */
  reviewSessionId: string;

  design: {
    selection: string; // '' until picked
    likes: string[];
    changes: string;
    borrowedIdeas: string;
  };
  business: {
    description: string;
    knownFor: string;
    vehicles: string[];
    differentiators: string;
    originStory: string;
    culturalInfluence: string;
  };
  services: {
    offered: string[];
    featured: string[];
    hidden: string[];
  };
  customerJourney: {
    primaryAction: string;
    actions: string[];
    currentContactMethods: string[];
    photoUploadInterest: YNM;
    intakeRequirements: string;
  };
  portfolio: {
    completedVehiclePhotos: string;
    beforeAfterPhotos: string;
    processMedia: string;
    mediaLocations: string[];
    priorityBuilds: string;
  };
  location: {
    city: string;
    state: string;
    serviceAreas: string;
    appointmentRequired: YNM;
    businessHours: string;
  };
  contact: {
    phone: string;
    email: string;
    preferredMethod: string;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    googleBusiness: string;
    other: string;
  };
  domain: {
    ownsDomain: YNM;
    domain: string;
    preferredDomain: string;
  };
  store: {
    interested: YNM;
    productTypes: string[];
    wholesaleVendors: string;
    vendors: string;
    vendorAssets: string[];
    fulfillment: string;
    initialCatalogSize: string;
  };
  booking: {
    interested: YNM;
    appointmentTypes: string[];
    paymentAtBooking: YNM;
  };
  payments: {
    currentMethods: string[];
    onlinePaymentsInterest: YNM;
    depositInterest: YNM;
  };
  project: {
    phase1Acknowledged: boolean;
    phase2Acknowledged: boolean;
    thirdPartyCostsAcknowledged: boolean;
  };
  /** Uploaded asset REFERENCES (binary lives in R2). Persist across Back/Continue. */
  assets: AssetRef[];
  /** Inspiration references — pasted links and/or uploaded images. */
  references: DraftReference[];
  additionalNotes: string;
}

/** Stable-ish random key (crypto when available) used for idempotent retries. */
function randomKey(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function emptyDraft(): ReviewDraft {
  return {
    idempotencyKey: randomKey(),
    reviewSessionId: randomKey(),
    design: { selection: '', likes: [], changes: '', borrowedIdeas: '' },
    business: {
      description: '',
      knownFor: '',
      vehicles: [],
      differentiators: '',
      originStory: '',
      culturalInfluence: '',
    },
    services: { offered: [], featured: [], hidden: [] },
    customerJourney: {
      primaryAction: '',
      actions: [],
      currentContactMethods: [],
      photoUploadInterest: '',
      intakeRequirements: '',
    },
    portfolio: {
      completedVehiclePhotos: '',
      beforeAfterPhotos: '',
      processMedia: '',
      mediaLocations: [],
      priorityBuilds: '',
    },
    location: { city: '', state: '', serviceAreas: '', appointmentRequired: '', businessHours: '' },
    contact: { phone: '', email: '', preferredMethod: '' },
    social: { instagram: '', facebook: '', tiktok: '', youtube: '', googleBusiness: '', other: '' },
    domain: { ownsDomain: '', domain: '', preferredDomain: '' },
    store: {
      interested: '',
      productTypes: [],
      wholesaleVendors: '',
      vendors: '',
      vendorAssets: [],
      fulfillment: '',
      initialCatalogSize: '',
    },
    booking: { interested: '', appointmentTypes: [], paymentAtBooking: '' },
    payments: { currentMethods: [], onlinePaymentsInterest: '', depositInterest: '' },
    project: {
      phase1Acknowledged: false,
      phase2Acknowledged: false,
      thirdPartyCostsAcknowledged: false,
    },
    assets: [],
    references: [],
    additionalNotes: '',
  };
}

/** Deep-merge a persisted draft over the empty template so new fields always exist. */
export function reviveDraft(raw: unknown): ReviewDraft {
  const base = emptyDraft();
  if (!raw || typeof raw !== 'object') return base;
  const stored = raw as Record<string, unknown>;
  // preserve a persisted idempotencyKey so retries stay stable across reloads
  if (typeof stored.idempotencyKey === 'string' && stored.idempotencyKey.length >= 6) {
    base.idempotencyKey = stored.idempotencyKey;
  }
  // preserve the stable reviewSessionId so uploads made earlier still associate on submit
  if (typeof stored.reviewSessionId === 'string' && stored.reviewSessionId.length >= 6) {
    base.reviewSessionId = stored.reviewSessionId;
  }
  // top-level arrays (uploaded assets + inspiration references) — replace wholesale if valid
  if (Array.isArray(stored.assets)) {
    base.assets = (stored.assets as unknown[]).filter(
      (a): a is AssetRef =>
        !!a && typeof a === 'object' && typeof (a as AssetRef).assetId === 'string',
    );
  }
  if (Array.isArray(stored.references)) {
    base.references = (stored.references as unknown[]).filter(
      (r): r is DraftReference =>
        !!r &&
        typeof r === 'object' &&
        ((r as DraftReference).kind === 'link' || (r as DraftReference).kind === 'image'),
    );
  }
  const SKIP = new Set(['idempotencyKey', 'reviewSessionId', 'assets', 'references']);
  for (const key of Object.keys(base) as (keyof ReviewDraft)[]) {
    if (SKIP.has(key)) continue;
    const section = stored[key];
    if (section && typeof section === 'object' && !Array.isArray(section)) {
      Object.assign(base[key] as object, section);
    }
  }
  return base;
}

export function loadDraft(): ReviewDraft {
  if (typeof localStorage === 'undefined') return emptyDraft();
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    return reviveDraft(JSON.parse(raw));
  } catch {
    return emptyDraft();
  }
}

export function saveDraft(draft: ReviewDraft): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private mode — non-fatal, UI keeps working from memory */
  }
}

export function clearDraft(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** Minimal receipt kept after a successful submit (NOT the questionnaire body). */
export interface StoredReceipt {
  id: string;
  submittedAt: string;
  selection: string;
  /** 'submitted' on first send; 'amended' after an explicit change-my-selection resend. */
  status: 'submitted' | 'amended';
}

export function loadReceipt(): StoredReceipt | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RECEIPT_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as StoredReceipt;
    if (r && typeof r.id === 'string') return r;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveReceipt(r: StoredReceipt): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(RECEIPT_KEY, JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

/** Drop empty strings so optional fields stay truly absent (schema treats them as optional). */
function s(v: string): string | undefined {
  const t = v.trim();
  return t.length ? t : undefined;
}
function ynm(v: YNM): 'yes' | 'no' | 'maybe' | undefined {
  return v === '' ? undefined : v;
}

/**
 * Project the flat editing draft onto the shared submission contract.
 * Returns an object shaped for reviewSubmissionSchema (validated separately).
 */
export function buildSubmission(draft: ReviewDraft): AfterHourzReviewSubmission {
  return {
    schemaVersion: SCHEMA_VERSION,
    clientSlug: REVIEW_CLIENT_SLUG,
    idempotencyKey: draft.idempotencyKey,
    reviewSessionId: draft.reviewSessionId,
    design: {
      selection: draft.design.selection,
      likes: draft.design.likes,
      changes: s(draft.design.changes),
      borrowedIdeas: s(draft.design.borrowedIdeas),
    },
    business: {
      description: s(draft.business.description),
      knownFor: s(draft.business.knownFor),
      vehicles: draft.business.vehicles,
      differentiators: s(draft.business.differentiators),
      originStory: s(draft.business.originStory),
      culturalInfluence: s(draft.business.culturalInfluence),
    },
    services: {
      offered: draft.services.offered,
      featured: draft.services.featured,
      hidden: draft.services.hidden,
    },
    customerJourney: {
      primaryAction: s(draft.customerJourney.primaryAction),
      actions: draft.customerJourney.actions,
      currentContactMethods: draft.customerJourney.currentContactMethods,
      photoUploadInterest: ynm(draft.customerJourney.photoUploadInterest),
      intakeRequirements: s(draft.customerJourney.intakeRequirements),
    },
    portfolio: {
      completedVehiclePhotos: s(draft.portfolio.completedVehiclePhotos),
      beforeAfterPhotos: s(draft.portfolio.beforeAfterPhotos),
      processMedia: s(draft.portfolio.processMedia),
      mediaLocations: draft.portfolio.mediaLocations,
      priorityBuilds: s(draft.portfolio.priorityBuilds),
    },
    location: {
      city: s(draft.location.city),
      state: s(draft.location.state),
      serviceAreas: s(draft.location.serviceAreas),
      appointmentRequired: ynm(draft.location.appointmentRequired),
      businessHours: s(draft.location.businessHours),
    },
    contact: {
      phone: s(draft.contact.phone),
      email: s(draft.contact.email),
      preferredMethod: s(draft.contact.preferredMethod),
    },
    social: {
      instagram: s(draft.social.instagram),
      facebook: s(draft.social.facebook),
      tiktok: s(draft.social.tiktok),
      youtube: s(draft.social.youtube),
      googleBusiness: s(draft.social.googleBusiness),
      other: s(draft.social.other),
    },
    domain: {
      ownsDomain: ynm(draft.domain.ownsDomain),
      domain: s(draft.domain.domain),
      preferredDomain: s(draft.domain.preferredDomain),
    },
    store: {
      interested: ynm(draft.store.interested),
      productTypes: draft.store.productTypes,
      wholesaleVendors: s(draft.store.wholesaleVendors),
      vendors: s(draft.store.vendors),
      vendorAssets: draft.store.vendorAssets,
      fulfillment: s(draft.store.fulfillment),
      initialCatalogSize: s(draft.store.initialCatalogSize),
    },
    booking: {
      interested: ynm(draft.booking.interested),
      appointmentTypes: draft.booking.appointmentTypes,
      paymentAtBooking: ynm(draft.booking.paymentAtBooking),
    },
    payments: {
      currentMethods: draft.payments.currentMethods,
      onlinePaymentsInterest: ynm(draft.payments.onlinePaymentsInterest),
      depositInterest: ynm(draft.payments.depositInterest),
    },
    project: {
      phase1Acknowledged: draft.project.phase1Acknowledged,
      phase2Acknowledged: draft.project.phase2Acknowledged,
      thirdPartyCostsAcknowledged: draft.project.thirdPartyCostsAcknowledged,
    },
    references: draft.references.map((r) => ({
      kind: r.kind,
      value: s(r.value ?? ''),
      assetId: r.assetId && r.assetId.trim() ? r.assetId.trim() : undefined,
      note: s(r.note ?? ''),
    })),
    assets: draft.assets.map((a) => ({
      assetId: a.assetId,
      category: a.category,
      filename: a.filename,
    })),
    additionalNotes: s(draft.additionalNotes),
  } as AfterHourzReviewSubmission;
}

/**
 * Gently normalize a link OR @username. We do NOT rewrite when the intent is ambiguous —
 * the original is preserved so nothing is silently mangled. Returns the normalized string
 * (or the original when we can't confidently improve it).
 */
export function normalizeLinkOrHandle(input: string): string {
  const raw = input.trim();
  if (!raw) return '';
  // Already a URL — leave it, only add a scheme when it clearly looks like a bare domain.
  if (/^https?:\/\//i.test(raw)) return raw;
  // A bare @handle — keep as-is (preserve original; platform is resolved during build).
  if (/^@[\w.]+$/.test(raw)) return raw;
  // Looks like a bare domain (contains a dot, no spaces) — add https:// but keep the rest.
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(raw) && !raw.includes(' ')) {
    return `https://${raw}`;
  }
  // Ambiguous (free text, a plain username without @, etc.) — preserve exactly.
  return raw;
}

/** Validate the projected submission with the SHARED schema (client-side gate). */
export function validateDraft(draft: ReviewDraft) {
  return reviewSubmissionSchema.safeParse(buildSubmission(draft));
}
