/*
  After Hourz — review questionnaire STEP definitions + renderers.
  One concept per step. Each step reads/writes the shared ReviewDraft via `update`.
  The step list drives the progress indicator and prev/next navigation.
*/
import {
  DIRECTIONS,
  SERVICE_OPTIONS,
  VEHICLE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  MEDIA_LOCATION_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  APPOINTMENT_TYPE_OPTIONS,
  PROJECT_PHASES,
} from '../../lib/review/schema';
import type { ReviewDraft } from './draft';
import { TextField, TextArea, ChipGroup, YnmField } from './fields';

export type Updater = <K extends keyof ReviewDraft>(
  section: K,
  patch: Partial<ReviewDraft[K]>,
) => void;

export interface StepContext {
  draft: ReviewDraft;
  update: Updater;
  goToStepId: (id: StepId) => void;
}

export type StepId =
  | 'welcome'
  | 'design-review'
  | 'design-selection'
  | 'design-feedback'
  | 'business'
  | 'services'
  | 'portfolio'
  | 'store'
  | 'vendors'
  | 'booking'
  | 'payments'
  | 'domain'
  | 'phases'
  | 'summary'
  | 'submit'
  | 'confirmation';

export interface StepDef {
  id: StepId;
  title: string; // short label for progress + summary
  /** counts toward the visible progress track (welcome / confirmation do not). */
  counted: boolean;
  render: (ctx: StepContext) => React.ReactNode;
}

const PROTOTYPE_BASE = '/design-lab/prototypes';

function DirectionCard({ id, name, tagline }: { id: string; name: string; tagline: string }) {
  const href = `${PROTOTYPE_BASE}/${id}/?review=1`;
  return (
    <div className="ah-plaque rv-direction">
      <span className="rv-direction-name">{name}</span>
      <span className="rv-direction-tag">{tagline}</span>
      <div className="rv-direction-actions">
        <a className="ah-btn ah-btn--ghost" href={href} target="_blank" rel="noopener noreferrer">
          Open preview
        </a>
      </div>
    </div>
  );
}

/** Ordered flow. WELCOME and CONFIRMATION bracket the counted steps. */
export const STEPS: StepDef[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    counted: false,
    render: () => (
      <div className="ah-plaque rv-card">
        <h2>Let&apos;s build the After Hourz website</h2>
        <p className="rv-lede">
          Anthony — this is a quick review to lock the look and gather the facts we need. First
          you&apos;ll look at three design directions and pick your favorite, then answer a few
          questions about the shop, your work, and how you want customers to reach you.
        </p>
        <p className="rv-hint">
          There are no wrong answers, and you don&apos;t have to know everything. Skip anything
          you&apos;re unsure about — leave it blank and we&apos;ll follow up. Your progress saves
          automatically on this device, so you can stop and come back.
        </p>
      </div>
    ),
  },
  {
    id: 'design-review',
    title: 'Design review',
    counted: true,
    render: () => (
      <div className="ah-plaque rv-card">
        <h2>Three directions to consider</h2>
        <p className="rv-lede">
          Each of these is a full design direction for After Hourz — same brand, three different
          moods. Open each preview in a new tab and get a feel for them. On the next step
          you&apos;ll pick the one that feels most like the shop.
        </p>
        <div className="rv-directions">
          {DIRECTIONS.map((d) => (
            <DirectionCard key={d.id} id={d.id} name={d.name} tagline={d.tagline} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'design-selection',
    title: 'Your pick',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Which direction is it?</h2>
        <p className="rv-lede">
          Pick the one that feels most like After Hourz. You can change it later.
        </p>
        <div className="rv-directions">
          {DIRECTIONS.map((d) => {
            const selected = draft.design.selection === d.id;
            return (
              <button
                type="button"
                key={d.id}
                className={`ah-plaque rv-direction rv-pick${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => update('design', { selection: d.id })}
                style={{ textAlign: 'left', cursor: 'pointer' }}
              >
                <span className="rv-direction-name">{d.name}</span>
                <span className="rv-direction-tag">{d.tagline}</span>
              </button>
            );
          })}
        </div>
      </div>
    ),
  },
  {
    id: 'design-feedback',
    title: 'Design feedback',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>What worked, what would you change?</h2>
        <p className="rv-lede">
          Tell us what stood out on the direction you picked — and anything from the other two worth
          borrowing.
        </p>
        <ChipGroup
          legend="What did you like? (pick any)"
          options={[
            'The colors',
            'The typography / lettering',
            'The photos & layout',
            'The overall mood',
            'The chrome & gold details',
            'How the services are shown',
          ]}
          value={draft.design.likes}
          onChange={(v) => update('design', { likes: v })}
        />
        <TextArea
          label="Anything you'd change?"
          value={draft.design.changes}
          onChange={(v) => update('design', { changes: v })}
          placeholder="e.g. make it darker, bigger photos, less text on the front page…"
        />
        <TextArea
          label="Anything to borrow from the other directions?"
          value={draft.design.borrowedIdeas}
          onChange={(v) => update('design', { borrowedIdeas: v })}
          placeholder="e.g. I liked the header from After Dark on the Chrome Heritage layout…"
        />
      </div>
    ),
  },
  {
    id: 'business',
    title: 'The shop',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Tell us about the shop</h2>
        <p className="rv-lede">
          In your own words — this becomes the story on the site. Skip anything you&apos;re not sure
          about.
        </p>
        <TextArea
          label="What is After Hourz, in a sentence or two?"
          value={draft.business.description}
          onChange={(v) => update('business', { description: v })}
          placeholder="e.g. A SoCal shop doing custom paint, body work and full lowrider builds…"
        />
        <TextArea
          label="What are you known for?"
          value={draft.business.knownFor}
          onChange={(v) => update('business', { knownFor: v })}
        />
        <ChipGroup
          legend="What do you build / work on?"
          options={VEHICLE_OPTIONS}
          value={draft.business.vehicles}
          onChange={(v) => update('business', { vehicles: v })}
        />
        <TextArea
          label="What sets you apart from other shops?"
          value={draft.business.differentiators}
          onChange={(v) => update('business', { differentiators: v })}
        />
        <TextArea
          label="The origin story — how did After Hourz start?"
          value={draft.business.originStory}
          onChange={(v) => update('business', { originStory: v })}
        />
        <TextArea
          label="Any culture or roots you want reflected?"
          value={draft.business.culturalInfluence}
          onChange={(v) => update('business', { culturalInfluence: v })}
          hint="Lowrider culture, family, neighborhood, car clubs — whatever matters to you."
        />
      </div>
    ),
  },
  {
    id: 'services',
    title: 'Services',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>What do you offer?</h2>
        <p className="rv-lede">
          Pick everything you do, then flag the ones to feature up front and any you&apos;d rather
          keep off the site.
        </p>
        <ChipGroup
          legend="Services offered"
          options={SERVICE_OPTIONS}
          value={draft.services.offered}
          onChange={(v) => update('services', { offered: v })}
        />
        <ChipGroup
          legend="Feature these up front"
          hint="The headline work you want customers to see first."
          options={SERVICE_OPTIONS}
          value={draft.services.featured}
          onChange={(v) => update('services', { featured: v })}
        />
        <ChipGroup
          legend="Keep these off the site (for now)"
          options={SERVICE_OPTIONS}
          value={draft.services.hidden}
          onChange={(v) => update('services', { hidden: v })}
        />
      </div>
    ),
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Your work &amp; photos</h2>
        <p className="rv-lede">
          The site lives on good photos. Just tell us what you have and where it is — we&apos;ll
          help gather it.
        </p>
        <TextField
          label="Roughly how many finished-build photos do you have?"
          value={draft.portfolio.completedVehiclePhotos}
          onChange={(v) => update('portfolio', { completedVehiclePhotos: v })}
          placeholder="e.g. a few dozen, hundreds, not sure…"
        />
        <TextField
          label="Any before / after photos?"
          value={draft.portfolio.beforeAfterPhotos}
          onChange={(v) => update('portfolio', { beforeAfterPhotos: v })}
        />
        <TextField
          label="Any in-progress / process photos or video?"
          value={draft.portfolio.processMedia}
          onChange={(v) => update('portfolio', { processMedia: v })}
        />
        <ChipGroup
          legend="Where do your photos live right now?"
          options={MEDIA_LOCATION_OPTIONS}
          value={draft.portfolio.mediaLocations}
          onChange={(v) => update('portfolio', { mediaLocations: v })}
        />
        <TextArea
          label="Any specific builds you want front and center?"
          value={draft.portfolio.priorityBuilds}
          onChange={(v) => update('portfolio', { priorityBuilds: v })}
        />
      </div>
    ),
  },
  {
    id: 'store',
    title: 'Online store',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Selling online</h2>
        <p className="rv-lede">
          Interested in selling anything through the site? Merch, gift cards, parts — no pressure,
          this is a maybe.
        </p>
        <YnmField
          legend="Do you want an online store?"
          value={draft.store.interested}
          onChange={(v) => update('store', { interested: v })}
        />
        <ChipGroup
          legend="What might you sell?"
          options={PRODUCT_TYPE_OPTIONS}
          value={draft.store.productTypes}
          onChange={(v) => update('store', { productTypes: v })}
        />
        <TextField
          label="Roughly how many products to start?"
          value={draft.store.initialCatalogSize}
          onChange={(v) => update('store', { initialCatalogSize: v })}
          placeholder="e.g. a handful, 10–20, not sure yet…"
        />
        <TextArea
          label="How would orders get fulfilled / shipped?"
          value={draft.store.fulfillment}
          onChange={(v) => update('store', { fulfillment: v })}
        />
      </div>
    ),
  },
  {
    id: 'vendors',
    title: 'Vendors',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Suppliers &amp; vendors</h2>
        <p className="rv-lede">
          Only if you plan to sell online. Who do you buy from, and do they give you product photos
          or catalogs?
        </p>
        <TextArea
          label="Wholesale suppliers or vendors you buy from"
          value={draft.store.wholesaleVendors}
          onChange={(v) => update('store', { wholesaleVendors: v })}
        />
        <TextArea
          label="Any other vendors / brands you carry"
          value={draft.store.vendors}
          onChange={(v) => update('store', { vendors: v })}
        />
        <ChipGroup
          legend="What do vendors give you?"
          options={[
            'Product photos',
            'Descriptions / specs',
            'Pricing sheets',
            'Catalog / feed',
            'Nothing yet',
            'Not sure',
          ]}
          value={draft.store.vendorAssets}
          onChange={(v) => update('store', { vendorAssets: v })}
        />
      </div>
    ),
  },
  {
    id: 'booking',
    title: 'Booking',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Appointments &amp; booking</h2>
        <p className="rv-lede">
          Should customers be able to request appointments through the site?
        </p>
        <YnmField
          legend="Do you want online booking?"
          value={draft.booking.interested}
          onChange={(v) => update('booking', { interested: v })}
        />
        <ChipGroup
          legend="What can they book?"
          options={APPOINTMENT_TYPE_OPTIONS}
          value={draft.booking.appointmentTypes}
          onChange={(v) => update('booking', { appointmentTypes: v })}
        />
        <YnmField
          legend="Take a deposit or payment at booking?"
          value={draft.booking.paymentAtBooking}
          onChange={(v) => update('booking', { paymentAtBooking: v })}
        />
        <ChipGroup
          legend="How should customers reach you?"
          hint="How you take inquiries today is fine — we'll match the site to it."
          options={CONTACT_METHOD_OPTIONS}
          value={draft.customerJourney.currentContactMethods}
          onChange={(v) => update('customerJourney', { currentContactMethods: v })}
        />
        <TextField
          label="Best phone number"
          type="tel"
          value={draft.contact.phone}
          onChange={(v) => update('contact', { phone: v })}
        />
        <TextField
          label="Best email"
          type="email"
          value={draft.contact.email}
          onChange={(v) => update('contact', { email: v })}
        />
      </div>
    ),
  },
  {
    id: 'payments',
    title: 'Payments',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Getting paid</h2>
        <p className="rv-lede">
          How do you take payment now, and are you interested in taking payments online later?
        </p>
        <ChipGroup
          legend="How do you take payment today?"
          options={PAYMENT_METHOD_OPTIONS}
          value={draft.payments.currentMethods}
          onChange={(v) => update('payments', { currentMethods: v })}
        />
        <YnmField
          legend="Interested in online payments?"
          value={draft.payments.onlinePaymentsInterest}
          onChange={(v) => update('payments', { onlinePaymentsInterest: v })}
        />
        <YnmField
          legend="Interested in taking deposits online?"
          value={draft.payments.depositInterest}
          onChange={(v) => update('payments', { depositInterest: v })}
        />
      </div>
    ),
  },
  {
    id: 'domain',
    title: 'Domain',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>Web address</h2>
        <p className="rv-lede">
          The name people type to reach the site — e.g. afterhourz.com. Don&apos;t worry if you
          don&apos;t have one yet.
        </p>
        <YnmField
          legend="Do you already own a domain?"
          value={draft.domain.ownsDomain}
          onChange={(v) => update('domain', { ownsDomain: v })}
        />
        <TextField
          label="Domain you own (if any)"
          value={draft.domain.domain}
          onChange={(v) => update('domain', { domain: v })}
          placeholder="afterhourz.com"
        />
        <TextField
          label="Domain you'd want (if not)"
          value={draft.domain.preferredDomain}
          onChange={(v) => update('domain', { preferredDomain: v })}
          placeholder="afterhourzcustoms.com"
        />
        <TextField
          label="City the shop is in"
          value={draft.location.city}
          onChange={(v) => update('location', { city: v })}
        />
        <TextField
          label="State"
          value={draft.location.state}
          onChange={(v) => update('location', { state: v })}
          placeholder="CA"
        />
        <ChipGroup
          legend="Social accounts you post on"
          options={['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Google Business', 'None yet']}
          value={socialToChips(draft)}
          onChange={(v) => update('social', chipsToSocialPatch(v))}
          hint="Just flag which ones exist — we'll grab the handles when we build."
        />
      </div>
    ),
  },
  {
    id: 'phases',
    title: 'Project phases',
    counted: true,
    render: ({ draft, update }) => (
      <div className="ah-plaque rv-card">
        <h2>How the project works</h2>
        <p className="rv-lede">
          A quick heads-up on how we&apos;ll build this and what it involves. Please check each box
          to show you&apos;ve read it.
        </p>

        <div className="ah-plaque rv-phase">
          <div className="rv-phase-title">{PROJECT_PHASES.phase1.title}</div>
          <div className="rv-phase-fee">{PROJECT_PHASES.phase1.fee}</div>
          <div className="rv-phase-blurb">{PROJECT_PHASES.phase1.blurb}</div>
        </div>
        <div className="ah-plaque rv-phase">
          <div className="rv-phase-title">{PROJECT_PHASES.phase2.title}</div>
          <div className="rv-phase-fee">{PROJECT_PHASES.phase2.fee}</div>
          <div className="rv-phase-blurb">{PROJECT_PHASES.phase2.blurb}</div>
        </div>

        <div className="rv-ack">
          <input
            type="checkbox"
            id="ack-p1"
            checked={draft.project.phase1Acknowledged}
            onChange={(e) => update('project', { phase1Acknowledged: e.target.checked })}
          />
          <label htmlFor="ack-p1">
            I&apos;ve read Phase 1 — the core website and launch, with its{' '}
            {PROJECT_PHASES.phase1.fee.toLowerCase()}.
          </label>
        </div>
        <div className="rv-ack">
          <input
            type="checkbox"
            id="ack-p2"
            checked={draft.project.phase2Acknowledged}
            onChange={(e) => update('project', { phase2Acknowledged: e.target.checked })}
          />
          <label htmlFor="ack-p2">
            I understand Phase 2 — online store and/or booking — is optional and has its own{' '}
            {PROJECT_PHASES.phase2.fee.toLowerCase()}.
          </label>
        </div>
        <div className="rv-ack">
          <input
            type="checkbox"
            id="ack-3p"
            checked={draft.project.thirdPartyCostsAcknowledged}
            onChange={(e) => update('project', { thirdPartyCostsAcknowledged: e.target.checked })}
          />
          <label htmlFor="ack-3p">{PROJECT_PHASES.thirdParty}</label>
        </div>
      </div>
    ),
  },
  {
    id: 'summary',
    title: 'Review',
    counted: true,
    render: () => null, // rendered specially in ReviewApp (needs edit-jump wiring)
  },
  {
    id: 'submit',
    title: 'Submit',
    counted: true,
    render: () => null, // rendered specially in ReviewApp (Turnstile + submit)
  },
  {
    id: 'confirmation',
    title: 'Done',
    counted: false,
    render: () => null, // rendered specially in ReviewApp (receipt)
  },
];

/* ---- social <-> chip helpers (the social object has no yes/no flags, so we encode presence) ---- */
function socialToChips(draft: ReviewDraft): string[] {
  const out: string[] = [];
  if (draft.social.instagram) out.push('Instagram');
  if (draft.social.facebook) out.push('Facebook');
  if (draft.social.tiktok) out.push('TikTok');
  if (draft.social.youtube) out.push('YouTube');
  if (draft.social.googleBusiness) out.push('Google Business');
  return out;
}
function chipsToSocialPatch(chips: string[]): Partial<ReviewDraft['social']> {
  // store a light marker ("yes") for presence; real handles are collected during build.
  const mark = (present: boolean, cur: string) => (present ? cur || 'yes' : '');
  return {
    instagram: mark(chips.includes('Instagram'), ''),
    facebook: mark(chips.includes('Facebook'), ''),
    tiktok: mark(chips.includes('TikTok'), ''),
    youtube: mark(chips.includes('YouTube'), ''),
    googleBusiness: mark(chips.includes('Google Business'), ''),
  };
}

export const COUNTED_STEPS = STEPS.filter((s) => s.counted);
