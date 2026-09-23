/*
  After Hourz — GUIDED INTERVIEW flow (data-driven questions grouped into sections).

  A non-technical shop owner answers ONE question per screen. Each question uses the reusable
  <Question> pattern (title / explanation / example / "Why we're asking" + "Where do I find
  this?" / input / optional inline upload / Back+Continue). Progress is by SECTION, not
  "question 18 of 47".

  BRANCHING is expressed with a `when(draft)` predicate per question:
    - no store    -> skip store product/vendor/fulfillment questions
    - no booking  -> skip scheduling questions
    - no domain   -> skip the "which domain do you own" question
    - no google   -> skip the Google link question
    - "not yet" photos -> don't nag with follow-up photo questions

  ReviewApp filters QUESTIONS through the predicates for the CURRENT draft, then walks the
  visible list. Special screens (welcome / three-looks / summary / submit / confirmation) are
  rendered by ReviewApp itself; here they are declared so the flow order stays in one place.
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
  GOAL_OPTIONS,
  PROJECT_PHASES,
} from '../../lib/review/schema';
import type { ReviewDraft, YNM } from './draft';
import {
  TextField,
  TextArea,
  ChipGroup,
  HaveItField,
  LinkOrHandle,
  RadioChips,
  looksLikeEmail,
} from './fields';
import { Question, HelperLink } from './Question';
import { Uploader } from './Uploader';

export type Updater = <K extends keyof ReviewDraft>(
  section: K,
  patch: Partial<ReviewDraft[K]>,
) => void;

export interface StepContext {
  draft: ReviewDraft;
  update: Updater;
  goToStepId: (id: StepId) => void;
  /** Replace this category's asset refs (used by inline uploaders). */
  setAssets: (category: string, assets: import('../../lib/review/schema').AssetRef[]) => void;
  /** Set the top-level free-text notes field (not section-shaped, so it bypasses `update`). */
  setAdditionalNotes: (notes: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  SECTIONS — drive the progress rail (NOT a numeric "n of m" counter).      */
/* -------------------------------------------------------------------------- */

export type SectionId =
  'design' | 'about' | 'services' | 'work' | 'online' | 'store' | 'project' | 'review';

export interface SectionDef {
  id: SectionId;
  label: string;
}

export const SECTIONS: SectionDef[] = [
  { id: 'design', label: 'Design' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Your Work' },
  { id: 'online', label: 'Online Presence' },
  { id: 'store', label: 'Store' },
  { id: 'project', label: 'Project' },
  { id: 'review', label: 'Review' },
];

/* -------------------------------------------------------------------------- */
/*  QUESTION FLOW                                                              */
/* -------------------------------------------------------------------------- */

/** ids used for edit-jumps from the summary + special-screen routing. */
export type StepId =
  | 'welcome'
  | 'design-review'
  | 'design-feedback'
  | 'design-inspiration'
  | 'about-description'
  | 'about-known-for'
  | 'about-vehicles'
  | 'about-target-customers'
  | 'about-story'
  | 'about-branding'
  | 'about-credentials'
  | 'services-offered'
  | 'services-featured'
  | 'work-photos'
  | 'work-before-after'
  | 'work-process'
  | 'work-priority'
  | 'work-shop-photos'
  | 'work-testimonials'
  | 'online-social'
  | 'online-google'
  | 'online-google-link'
  | 'online-contact'
  | 'online-hours'
  | 'online-primary-action'
  | 'online-intake'
  | 'online-goals'
  | 'online-domain'
  | 'online-domain-which'
  | 'online-domain-want'
  | 'store-interested'
  | 'store-products'
  | 'store-vendors'
  | 'store-fulfillment'
  | 'store-booking'
  | 'store-booking-types'
  | 'store-payments'
  | 'project-phases'
  | 'project-notes'
  | 'summary'
  | 'submit'
  | 'confirmation';

export interface QuestionDef {
  id: StepId;
  section: SectionId;
  /** counts toward the section rail (welcome/summary/submit/confirmation do not). */
  counted: boolean;
  /** When present and false for the current draft, the question is SKIPPED (branching). */
  when?: (d: ReviewDraft) => boolean;
  /** Rendered body. Special screens return null (ReviewApp renders them). */
  render: (ctx: StepContext) => React.ReactNode;
}

/* ---- branch predicates (reusable, readable) ---- */
const wantsStore = (d: ReviewDraft) =>
  d.store.interested === 'yes' || d.store.interested === 'maybe';
const wantsBooking = (d: ReviewDraft) =>
  d.booking.interested === 'yes' || d.booking.interested === 'maybe';
const ownsDomain = (d: ReviewDraft) => d.domain.ownsDomain === 'yes';
const noDomainYet = (d: ReviewDraft) => d.domain.ownsDomain === 'no';
const hasGoogle = (d: ReviewDraft) => d.social.googleBusiness === 'yes';
const hasSomePhotos = (d: ReviewDraft) =>
  !d.portfolio.mediaLocations.includes('None yet') || d.portfolio.mediaLocations.length > 1;

/** assets in the draft for a given category (thumbnails persist across Back/Continue). */
function assetsFor(d: ReviewDraft, category: string) {
  return d.assets.filter((a) => a.category === category);
}

export const QUESTIONS: QuestionDef[] = [
  /* ------------------------------ DESIGN ------------------------------ */
  {
    id: 'design-feedback',
    section: 'design',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What did you like, and what would you change?"
        explanation="Now that you’ve seen the look you picked, tell us what stood out — and anything you’d tweak."
        example="“Love the colors and the big photos. Maybe less text on the front page.”"
        why="Your reaction tells us which details to keep front and center and what to adjust before we build."
      >
        <ChipGroup
          legend="What did you like? (pick any)"
          options={[
            'The colors',
            'The lettering & fonts',
            'The photos & layout',
            'The overall mood',
            'The chrome & gold details',
            'How the services are shown',
          ]}
          value={draft.design.likes}
          onChange={(v) => update('design', { likes: v })}
          allowOther
          otherPlaceholder="e.g. the way it loads, the sound of the name…"
        />
        <TextArea
          label="Anything you'd change?"
          value={draft.design.changes}
          onChange={(v) => update('design', { changes: v })}
          placeholder="e.g. make it darker, bigger photos, less text on the front page…"
        />
        <TextArea
          label="Anything to borrow from the other two looks?"
          value={draft.design.borrowedIdeas}
          onChange={(v) => update('design', { borrowedIdeas: v })}
          placeholder="e.g. I liked the header from another one…"
        />
      </Question>
    ),
  },
  {
    id: 'design-inspiration',
    section: 'design',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Any other websites or pages whose vibe you like?"
        explanation="Doesn't have to be another shop — any site, page, or account with a look you're drawn to."
        example="“The gallery on [some shop's] site” or “I like how @someaccount lays out their photos.”"
        why="Seeing what you like elsewhere helps us fine-tune the details beyond the three looks."
      >
        <TextArea
          label="Links or descriptions (optional)"
          value={draft.design.inspirationLinks}
          onChange={(v) => update('design', { inspirationLinks: v })}
          placeholder="Paste a link or two, or just describe what caught your eye — one per line is fine"
        />
      </Question>
    ),
  },

  /* ------------------------------ ABOUT ------------------------------ */
  {
    id: 'about-description',
    section: 'about',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="In a sentence or two, what is After Hourz?"
        explanation="This becomes the opening line on your website — in your own words."
        example="“A SoCal shop doing custom paint, body work, and full lowrider builds.”"
        why="The first thing a visitor reads should sound like you, not like a generic ad. We’ll polish it, not replace it."
      >
        <TextArea
          label="What is After Hourz?"
          value={draft.business.description}
          onChange={(v) => update('business', { description: v })}
          placeholder="e.g. A SoCal shop doing custom paint, body work and full lowrider builds…"
        />
      </Question>
    ),
  },
  {
    id: 'about-known-for',
    section: 'about',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What are you known for?"
        explanation="The work people come to you for — the thing you do better than anyone."
        example="“Candy paint and gold-leaf lettering.”"
        why="We’ll feature this prominently so new customers instantly get what you’re about."
      >
        <TextArea
          label="What are you known for?"
          value={draft.business.knownFor}
          onChange={(v) => update('business', { knownFor: v })}
        />
        <TextArea
          label="What sets you apart from other shops? (optional)"
          value={draft.business.differentiators}
          onChange={(v) => update('business', { differentiators: v })}
        />
      </Question>
    ),
  },
  {
    id: 'about-vehicles',
    section: 'about',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What do you build and work on?"
        explanation="Tap everything that applies — this shapes how we organize the site."
        why="It helps us group your work so the right customers find the right thing fast."
      >
        <ChipGroup
          legend="Pick any that apply"
          options={VEHICLE_OPTIONS}
          value={draft.business.vehicles}
          onChange={(v) => update('business', { vehicles: v })}
          allowOther
          otherPlaceholder="e.g. boats, golf carts, ATVs…"
        />
      </Question>
    ),
  },
  {
    id: 'about-target-customers',
    section: 'about',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Who's your ideal customer?"
        explanation="Who you'd most want walking through the door or sending a message."
        example="“Lowrider guys who want it done right” or “Everyday drivers who need honest bodywork after an accident.”"
        why="Knowing who we're talking to shapes the tone, photos, and language on the site."
      >
        <TextArea
          label="Ideal customers (optional)"
          value={draft.business.targetCustomers}
          onChange={(v) => update('business', { targetCustomers: v })}
        />
      </Question>
    ),
  },
  {
    id: 'about-story',
    section: 'about',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What’s the story behind After Hourz?"
        explanation="How it started, the culture and roots you want reflected. Skip anything you’re not sure about."
        example="“Started in the garage after work — named it After Hourz. Lowrider culture, family, the neighborhood.”"
        why="A real story is what makes a shop site feel human. This is optional — share as much or as little as you want."
      >
        <TextArea
          label="The origin story (optional)"
          value={draft.business.originStory}
          onChange={(v) => update('business', { originStory: v })}
        />
        <TextArea
          label="Any culture or roots you want reflected? (optional)"
          value={draft.business.culturalInfluence}
          onChange={(v) => update('business', { culturalInfluence: v })}
          hint="Lowrider culture, family, neighborhood, car clubs — whatever matters to you."
        />
      </Question>
    ),
  },
  {
    id: 'about-branding',
    section: 'about',
    counted: true,
    render: ({ draft, update, setAssets }) => (
      <Question
        title="Do you have an existing logo or brand colors?"
        explanation="If you already have a logo or specific colors you use, share them — we'll build around what you have."
        why="An existing logo or color scheme is the fastest way to keep the site looking unmistakably like After Hourz."
        upload={
          <Uploader
            category="logo"
            reviewSessionId={draft.reviewSessionId}
            value={assetsFor(draft, 'logo')}
            onChange={(a) => setAssets('logo', a)}
            addLabel="Add Logo File"
            hint="Optional — any image file works, even a phone photo of a shirt or sign."
          />
        }
      >
        <HaveItField
          legend="Do you have an existing logo?"
          value={draft.business.hasLogo}
          onChange={(v) => update('business', { hasLogo: v })}
          yesLabel="Yes"
          noLabel="No logo yet"
          maybeLabel="Sort of / it needs work"
        />
        <TextField
          label="Brand colors, if you have any in mind (optional)"
          value={draft.business.brandColors}
          onChange={(v) => update('business', { brandColors: v })}
          placeholder="e.g. cobalt blue and chrome, candy red and gold"
        />
      </Question>
    ),
  },
  {
    id: 'about-credentials',
    section: 'about',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Any licenses, certifications, or credentials to show off?"
        explanation="Things that build trust at a glance — pick any that apply, or skip if none of these fit."
        why="Credentials like these are often the deciding factor for a customer comparing shops."
      >
        <ChipGroup
          legend="Pick any that apply"
          options={[
            'Licensed & bonded',
            'Insured',
            'ASE certified',
            'I-CAR certified',
            'Manufacturer certified',
            'Years in business',
            'None of these',
          ]}
          value={draft.business.credentials}
          onChange={(v) => update('business', { credentials: v })}
          allowOther
          otherPlaceholder="e.g. a specific certification or award"
        />
        <TextArea
          label="Details worth mentioning (optional)"
          value={draft.business.credentialDetails}
          onChange={(v) => update('business', { credentialDetails: v })}
          placeholder="e.g. licensed 15 years, ASE master certified since 2018…"
        />
      </Question>
    ),
  },

  /* ------------------------------ SERVICES ------------------------------ */
  {
    id: 'services-offered',
    section: 'services',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What do you offer?"
        explanation="Tap everything you do. Don’t worry about order — we’ll sort that on the next screen."
        why="This becomes your services list. Pick generously; you can hide anything later."
      >
        <ChipGroup
          legend="Services you offer"
          options={SERVICE_OPTIONS}
          value={draft.services.offered}
          onChange={(v) => update('services', { offered: v })}
          allowOther
          otherPlaceholder="e.g. a service we didn't list"
        />
      </Question>
    ),
  },
  {
    id: 'services-featured',
    section: 'services',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Which of those should customers see first?"
        explanation="Your headline work — the two or three things you most want to be hired for."
        example="Featuring “Custom paint” and “Full restoration” up top."
        why="We put your best money-makers front and center so they’re the first thing visitors notice."
      >
        <ChipGroup
          legend="Feature these up front"
          options={draft.services.offered.length ? draft.services.offered : SERVICE_OPTIONS}
          value={draft.services.featured}
          onChange={(v) => update('services', { featured: v })}
        />
        <ChipGroup
          legend="Keep these off the site for now (optional)"
          options={draft.services.offered.length ? draft.services.offered : SERVICE_OPTIONS}
          value={draft.services.hidden}
          onChange={(v) => update('services', { hidden: v })}
        />
      </Question>
    ),
  },

  /* ------------------------------ YOUR WORK ------------------------------ */
  {
    id: 'work-photos',
    section: 'work',
    counted: true,
    render: ({ draft, update, setAssets }) => (
      <Question
        title="Let’s add some photos of finished builds"
        explanation="Good photos are what make a shop site sell. Add a few now, or tell us you’ll send them later — either is fine."
        example="A handful of your proudest completed cars, trucks, or bikes."
        why="Finished-build photos are the single biggest thing that makes visitors trust the work and reach out."
        where={
          <p>
            Most shops have these on their phone camera roll or on Instagram. On a phone, tap “Add
            Photos” and pick straight from your gallery. No rush — you can always send more later.
          </p>
        }
        upload={
          <Uploader
            category="completed-build"
            reviewSessionId={draft.reviewSessionId}
            value={assetsFor(draft, 'completed-build')}
            onChange={(a) => setAssets('completed-build', a)}
            addLabel="Add Photos"
            hint="Optional — add a few now, or send them later. Big videos? Paste a video link below instead."
          />
        }
      >
        <ChipGroup
          legend="Where do your photos live right now?"
          options={MEDIA_LOCATION_OPTIONS}
          value={draft.portfolio.mediaLocations}
          onChange={(v) => update('portfolio', { mediaLocations: v })}
          hint="Just so we know where to help you gather them."
          allowOther
          otherPlaceholder="e.g. Google Photos, Dropbox…"
        />
        <TextField
          label="Roughly how many finished-build photos do you have? (optional)"
          value={draft.portfolio.completedVehiclePhotos}
          onChange={(v) => update('portfolio', { completedVehiclePhotos: v })}
          placeholder="e.g. a few dozen, hundreds, not sure…"
        />
        <LinkOrHandle
          label="Have a video? Paste a video link instead of uploading (optional)"
          value={draft.portfolio.processMedia}
          onChange={(v) => update('portfolio', { processMedia: v })}
          placeholder="e.g. a YouTube or Instagram video link"
          hint="Big videos are easier to share as a link than to upload."
        />
      </Question>
    ),
  },
  {
    id: 'work-before-after',
    section: 'work',
    counted: true,
    // Don't nag if they've told us they have nothing yet.
    when: (d) => hasSomePhotos(d),
    render: ({ draft, update, setAssets }) => (
      <Question
        title="Any before-and-after shots?"
        explanation="Before/after pairs are powerful — they show the transformation, not just the result."
        why="Nothing sells body and paint work like a rough ‘before’ next to a clean ‘after’. Totally optional."
        upload={
          <Uploader
            category="before-after"
            reviewSessionId={draft.reviewSessionId}
            value={assetsFor(draft, 'before-after')}
            onChange={(a) => setAssets('before-after', a)}
            addLabel="Add Before/After Photos"
            hint="Optional — pairs are great, but even a couple help."
          />
        }
      >
        <TextField
          label="Anything to note about your before/after shots? (optional)"
          value={draft.portfolio.beforeAfterPhotos}
          onChange={(v) => update('portfolio', { beforeAfterPhotos: v })}
          placeholder="e.g. I’ve got a bunch on my phone from the last two builds"
        />
      </Question>
    ),
  },
  {
    id: 'work-priority',
    section: 'work',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Any specific builds you want front and center?"
        explanation="A standout car, a favorite project — anything you’d point to first."
        why="We’ll make sure your proudest work gets the spotlight instead of getting buried."
      >
        <TextArea
          label="Builds to highlight (optional)"
          value={draft.portfolio.priorityBuilds}
          onChange={(v) => update('portfolio', { priorityBuilds: v })}
          placeholder="e.g. The candy-red ’64, the shop truck…"
        />
      </Question>
    ),
  },
  {
    id: 'work-shop-photos',
    section: 'work',
    counted: true,
    render: ({ draft, setAssets }) => (
      <Question
        title="A photo of your shop, and of you or your team?"
        explanation="Helps visitors see the real place and the people behind the work — totally optional."
        why="A real shop photo and a face build more trust than stock imagery ever will."
        upload={
          <>
            <Uploader
              category="shop"
              reviewSessionId={draft.reviewSessionId}
              value={assetsFor(draft, 'shop')}
              onChange={(a) => setAssets('shop', a)}
              addLabel="Add Shop Photos"
              hint="Optional — the outside sign, the bay, whatever shows the place."
            />
            <Uploader
              category="portrait"
              reviewSessionId={draft.reviewSessionId}
              value={assetsFor(draft, 'portrait')}
              onChange={(a) => setAssets('portrait', a)}
              addLabel="Add a Photo of You / the Team"
              hint="Optional — a casual shop photo is perfect, no need for anything formal."
            />
          </>
        }
      />
    ),
  },
  {
    id: 'work-testimonials',
    section: 'work',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Any customer reviews or quotes you'd like featured?"
        explanation="A line from a happy customer, a Google review, a DM you got after a build — whatever you've got."
        why="Real words from real customers do more to build trust than anything we can write."
      >
        <TextArea
          label="Reviews or quotes (optional)"
          value={draft.portfolio.testimonials}
          onChange={(v) => update('portfolio', { testimonials: v })}
          placeholder="e.g. “Best paint job I've ever had, hands down.” — a customer on Instagram"
        />
      </Question>
    ),
  },

  /* ------------------------------ ONLINE PRESENCE ------------------------------ */
  {
    id: 'online-social',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Where are you online today?"
        explanation="Your social accounts — a link or an @username both work."
        example="instagram.com/afterhourz  or just  @afterhourz"
        why="We’ll link your site to your socials so followers and new customers all land in the same place."
        where={
          <p>
            Open your app, go to your profile, and copy the handle at the top (it starts with @) or
            the link. <HelperLink href="https://www.instagram.com">Open Instagram</HelperLink>{' '}
            <HelperLink href="https://www.facebook.com">Open Facebook</HelperLink>
          </p>
        }
      >
        <LinkOrHandle
          label="Instagram (optional)"
          value={draft.social.instagram}
          onChange={(v) => update('social', { instagram: v })}
          placeholder="@afterhourz or a link"
        />
        <LinkOrHandle
          label="Facebook (optional)"
          value={draft.social.facebook}
          onChange={(v) => update('social', { facebook: v })}
        />
        <LinkOrHandle
          label="TikTok (optional)"
          value={draft.social.tiktok}
          onChange={(v) => update('social', { tiktok: v })}
        />
        <LinkOrHandle
          label="YouTube (optional)"
          value={draft.social.youtube}
          onChange={(v) => update('social', { youtube: v })}
        />
      </Question>
    ),
  },
  {
    id: 'online-google',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Are you on Google?"
        explanation="A Google Business listing is the map pin and reviews people see when they search your shop."
        why="If you have one, we’ll link it so your hours, reviews, and directions show up together with your site."
        where={
          <p>
            Not sure? Search your shop name on Google and see if a map card with reviews shows up.{' '}
            <HelperLink href="https://www.google.com/search?q=after+hourz+auto">
              Search Google
            </HelperLink>{' '}
            <HelperLink href="https://www.google.com/maps">Open Google Maps</HelperLink>
          </p>
        }
      >
        <HaveItField
          legend="Do you have a Google Business listing?"
          value={draft.social.googleBusiness as YNM}
          onChange={(v) => update('social', { googleBusiness: v })}
          noLabel="I don’t have one"
          maybeLabel="I’m not sure"
        />
      </Question>
    ),
  },
  {
    id: 'online-google-link',
    section: 'online',
    counted: true,
    when: (d) => hasGoogle(d), // BRANCH: no google -> skip the google link
    render: ({ draft, update }) => (
      <Question
        title="Paste your Google listing link"
        explanation="A link or your shop name both work — whatever’s easiest to grab."
        where={
          <p>
            Open Google Maps, find your shop, tap Share, and copy the link.{' '}
            <HelperLink href="https://www.google.com/maps">Open Google Maps</HelperLink>
          </p>
        }
      >
        <LinkOrHandle
          label="Google Business link or shop name"
          value={draft.social.other}
          onChange={(v) => update('social', { other: v })}
          placeholder="A Google Maps link, or your shop name"
        />
      </Question>
    ),
  },
  {
    id: 'online-contact',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="How should customers reach you?"
        explanation="The ways you already take inquiries are perfect — we’ll match the site to how you work."
        why="We’ll wire the site’s buttons to whatever you actually check, so no lead slips through."
      >
        <ChipGroup
          legend="How do people reach you today?"
          options={CONTACT_METHOD_OPTIONS}
          value={draft.customerJourney.currentContactMethods}
          onChange={(v) => update('customerJourney', { currentContactMethods: v })}
          allowOther
          otherPlaceholder="e.g. WhatsApp, a booking app…"
        />
        <TextField
          label="Best phone number (optional)"
          type="tel"
          value={draft.contact.phone}
          onChange={(v) => update('contact', { phone: v })}
        />
        <TextField
          label="Best email (optional)"
          type="email"
          value={draft.contact.email}
          onChange={(v) => update('contact', { email: v })}
          error={
            looksLikeEmail(draft.contact.email) ? undefined : "That doesn't look like a full email address"
          }
        />
        <TextField
          label="City the shop is in (optional)"
          value={draft.location.city}
          onChange={(v) => update('location', { city: v })}
        />
        <TextField
          label="State (optional)"
          value={draft.location.state}
          onChange={(v) => update('location', { state: v })}
          placeholder="CA"
        />
      </Question>
    ),
  },
  {
    id: 'online-hours',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What are your hours, and do people need an appointment?"
        explanation="This goes right on the site so customers know when to call or stop by."
        example="“Mon–Sat 9–6, closed Sundays” and “Appointment for drop-off, walk-ins OK for quick questions.”"
        why="Hours and whether you take walk-ins are some of the first things a visitor looks for."
      >
        <TextArea
          label="Shop hours (optional)"
          value={draft.location.businessHours}
          onChange={(v) => update('location', { businessHours: v })}
          placeholder="e.g. Mon–Sat 9am–6pm, closed Sundays"
        />
        <HaveItField
          legend="Do customers need an appointment, or can they walk in?"
          value={draft.location.appointmentRequired}
          onChange={(v) => update('location', { appointmentRequired: v })}
          yesLabel="Appointment required"
          noLabel="Walk-ins welcome"
          maybeLabel="Depends / not sure"
        />
        <TextArea
          label="How far do you travel, or which areas do you serve? (optional)"
          value={draft.location.serviceAreas}
          onChange={(v) => update('location', { serviceAreas: v })}
          placeholder="e.g. shop-only, or we travel within 30 miles of the shop"
        />
      </Question>
    ),
  },
  {
    id: 'online-primary-action',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What's the one thing you want a visitor to do?"
        explanation="If a first-time visitor only does ONE thing on your site, what should it be?"
        why="We'll make this the site's main button — the thing every page points toward."
      >
        <RadioChips
          legend="Pick the single best next step"
          options={[
            { value: 'Call the shop', label: 'Call the shop' },
            { value: 'Message on Instagram/Facebook', label: 'Message on Instagram/Facebook' },
            { value: 'Fill out a contact form', label: 'Fill out a contact form' },
            { value: 'Visit in person', label: 'Visit in person' },
          ]}
          value={draft.customerJourney.primaryAction}
          onChange={(v) => update('customerJourney', { primaryAction: v })}
          allowOther
          otherPlaceholder="e.g. book online, get a text quote…"
        />
      </Question>
    ),
  },
  {
    id: 'online-intake',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="If someone reaches out for a quote, what do you need from them?"
        explanation="The info that actually helps you give a real quote — year/make/model, what they want done, etc."
        why="We'll build the contact/quote form around what you actually need to respond, not generic fields."
      >
        <TextArea
          label="What you need to hear from a new customer (optional)"
          value={draft.customerJourney.intakeRequirements}
          onChange={(v) => update('customerJourney', { intakeRequirements: v })}
          placeholder="e.g. year/make/model, what they want done, when they need it back…"
        />
        <HaveItField
          legend="Should they be able to attach photos of their vehicle when they reach out?"
          value={draft.customerJourney.photoUploadInterest}
          onChange={(v) => update('customerJourney', { photoUploadInterest: v })}
          yesLabel="Yes, let them attach photos"
          noLabel="Not needed"
          maybeLabel="Not sure"
        />
      </Question>
    ),
  },
  {
    id: 'online-goals',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="What do you want this website to do for you?"
        explanation="Besides looking good — pick anything else you want it to accomplish."
        why="This tells us what to build toward beyond the homepage, and what to measure once it's live."
      >
        <ChipGroup
          legend="Pick any that apply"
          options={GOAL_OPTIONS}
          value={draft.customerJourney.actions}
          onChange={(v) => update('customerJourney', { actions: v })}
          allowOther
          otherPlaceholder="e.g. something specific you're trying to accomplish"
        />
      </Question>
    ),
  },
  {
    id: 'online-domain',
    section: 'online',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Do you already own a web address?"
        explanation="A web address (a “domain”) is what people type to reach your site — like afterhourz.com."
        why="If you already own one, we’ll connect it. If not, no problem — we’ll help you get one when it’s time."
        where={
          <p>
            If you’ve ever paid for a website name (from GoDaddy, Google, Squarespace, etc.), you
            own a domain. Not sure? Pick “I’m not sure” and we’ll check together.
          </p>
        }
      >
        <HaveItField
          legend="Do you own a web address (domain)?"
          value={draft.domain.ownsDomain}
          onChange={(v) => update('domain', { ownsDomain: v })}
          noLabel="I don’t have one"
          maybeLabel="I’m not sure"
        />
      </Question>
    ),
  },
  {
    id: 'online-domain-which',
    section: 'online',
    counted: true,
    when: (d) => ownsDomain(d), // BRANCH: no domain -> skip "which domain"
    render: ({ draft, update }) => (
      <Question
        title="Which web address do you own?"
        explanation="Just type it as people would say it."
        example="afterhourz.com"
      >
        <TextField
          label="Your domain"
          value={draft.domain.domain}
          onChange={(v) => update('domain', { domain: v })}
          placeholder="afterhourz.com"
        />
      </Question>
    ),
  },
  {
    id: 'online-domain-want',
    section: 'online',
    counted: true,
    when: (d) => noDomainYet(d), // only ask a wished-for name when they don't have one
    render: ({ draft, update }) => (
      <Question
        title="Got a web address in mind?"
        explanation="If there’s a name you’d love, tell us and we’ll see if it’s available. No worries if not."
        example="afterhourzcustoms.com"
      >
        <TextField
          label="Web address you’d want (optional)"
          value={draft.domain.preferredDomain}
          onChange={(v) => update('domain', { preferredDomain: v })}
          placeholder="afterhourzcustoms.com"
        />
      </Question>
    ),
  },

  /* ------------------------------ STORE ------------------------------ */
  {
    id: 'store-interested',
    section: 'store',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Want to sell anything through the site?"
        explanation="Merch, gift cards, parts — totally optional, and it’s part of the optional Phase 2."
        why="No pressure. This just tells us whether to plan for a simple online store now or later."
      >
        <HaveItField
          legend="Do you want an online store?"
          value={draft.store.interested}
          onChange={(v) => update('store', { interested: v })}
          yesLabel="Yes"
          noLabel="Not right now"
          maybeLabel="Maybe later"
        />
      </Question>
    ),
  },
  {
    id: 'store-products',
    section: 'store',
    counted: true,
    when: (d) => wantsStore(d), // BRANCH: no store -> skip everything store
    render: ({ draft, update }) => (
      <Question
        title="What might you sell?"
        explanation="A rough idea is plenty — we’ll scope the store around it."
      >
        <ChipGroup
          legend="What might you sell?"
          options={PRODUCT_TYPE_OPTIONS}
          value={draft.store.productTypes}
          onChange={(v) => update('store', { productTypes: v })}
          allowOther
          otherPlaceholder="e.g. something specific you'd want to sell"
        />
        <TextField
          label="Roughly how many products to start? (optional)"
          value={draft.store.initialCatalogSize}
          onChange={(v) => update('store', { initialCatalogSize: v })}
          placeholder="e.g. a handful, 10–20, not sure yet…"
        />
      </Question>
    ),
  },
  {
    id: 'store-vendors',
    section: 'store',
    counted: true,
    when: (d) => wantsStore(d), // BRANCH: no store -> skip vendors
    render: ({ draft, update, setAssets }) => (
      <Question
        title="Do you buy from any suppliers or vendors?"
        explanation="Only matters if you’ll sell online. Some vendors give you product photos or a catalog we can use."
        why="If your suppliers hand you photos and prices, we can load your store faster instead of starting from scratch."
        upload={
          <Uploader
            category="vendor-document"
            reviewSessionId={draft.reviewSessionId}
            value={assetsFor(draft, 'vendor-document')}
            onChange={(a) => setAssets('vendor-document', a)}
            addLabel="Add a Catalog or Price Sheet"
            hint="Optional — a PDF price sheet or catalog works great here."
          />
        }
      >
        <TextArea
          label="Suppliers or vendors you buy from (optional)"
          value={draft.store.wholesaleVendors}
          onChange={(v) => update('store', { wholesaleVendors: v })}
        />
        <ChipGroup
          legend="What do those vendors give you? (optional)"
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
          allowOther
        />
      </Question>
    ),
  },
  {
    id: 'store-fulfillment',
    section: 'store',
    counted: true,
    when: (d) => wantsStore(d), // BRANCH: no store -> skip fulfillment
    render: ({ draft, update }) => (
      <Question
        title="How would orders get to customers?"
        explanation="Ship them, pickup at the shop, or a mix — whatever fits how you work."
      >
        <TextArea
          label="How would orders get fulfilled / shipped? (optional)"
          value={draft.store.fulfillment}
          onChange={(v) => update('store', { fulfillment: v })}
          placeholder="e.g. ship from the shop, pickup only, not sure yet…"
        />
      </Question>
    ),
  },
  {
    id: 'store-booking',
    section: 'store',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Should customers be able to book appointments online?"
        explanation="Like requesting a quote or a drop-off time through the site. Optional, and part of Phase 2."
        why="If yes, we’ll add a simple request form so people can reach out without playing phone tag."
      >
        <HaveItField
          legend="Do you want online booking?"
          value={draft.booking.interested}
          onChange={(v) => update('booking', { interested: v })}
          yesLabel="Yes"
          noLabel="Not right now"
          maybeLabel="Maybe later"
        />
      </Question>
    ),
  },
  {
    id: 'store-booking-types',
    section: 'store',
    counted: true,
    when: (d) => wantsBooking(d), // BRANCH: no booking -> skip scheduling
    render: ({ draft, update }) => (
      <Question
        title="What should customers be able to book?"
        explanation="Pick the kinds of appointments you’d take through the site."
      >
        <ChipGroup
          legend="What can they book?"
          options={APPOINTMENT_TYPE_OPTIONS}
          value={draft.booking.appointmentTypes}
          onChange={(v) => update('booking', { appointmentTypes: v })}
          allowOther
          otherPlaceholder="e.g. a specific kind of appointment"
        />
        <HaveItField
          legend="Take a deposit or payment at booking?"
          value={draft.booking.paymentAtBooking}
          onChange={(v) => update('booking', { paymentAtBooking: v })}
          yesLabel="Yes"
          noLabel="No"
          maybeLabel="Not sure"
        />
      </Question>
    ),
  },
  {
    id: 'store-payments',
    section: 'store',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="How do you take payment today?"
        explanation="Just how it works now — this helps us plan any online payments later."
      >
        <ChipGroup
          legend="How do you take payment today?"
          options={PAYMENT_METHOD_OPTIONS}
          value={draft.payments.currentMethods}
          onChange={(v) => update('payments', { currentMethods: v })}
          allowOther
        />
        <HaveItField
          legend="Interested in taking payments online later?"
          value={draft.payments.onlinePaymentsInterest}
          onChange={(v) => update('payments', { onlinePaymentsInterest: v })}
          yesLabel="Yes"
          noLabel="Not right now"
          maybeLabel="Maybe later"
        />
        <HaveItField
          legend="Want to require a deposit for quotes or bookings?"
          value={draft.payments.depositInterest}
          onChange={(v) => update('payments', { depositInterest: v })}
          yesLabel="Yes"
          noLabel="Not right now"
          maybeLabel="Maybe later"
        />
      </Question>
    ),
  },

  /* ------------------------------ PROJECT ------------------------------ */
  {
    id: 'project-phases',
    section: 'project',
    counted: true,
    render: ({ draft, update }) => (
      <Question
        title="Here’s the plan — take a quick look"
        explanation="In plain terms, so we’re on the same page. Check each box to say you’ve read it. Nothing here is a contract."
        why="These boxes just confirm you’ve seen how the project is staged and who pays for what. It keeps surprises out of it."
      >
        <div className="ah-plaque rv-phase">
          <div className="rv-phase-title">{PROJECT_PHASES.phase1.title}</div>
          <div className="rv-phase-fee">{PROJECT_PHASES.phase1.fee}</div>
          <div className="rv-phase-blurb">{PROJECT_PHASES.phase1.blurb}</div>
        </div>
        <div className="ah-plaque rv-phase">
          <div className="rv-phase-title">{PROJECT_PHASES.phase2.title}</div>
          <div className="rv-phase-fee">{PROJECT_PHASES.phase2.fee}</div>
          <div className="rv-phase-blurb">
            {PROJECT_PHASES.phase2.blurb} It’s optional — we’ll only build it if you want it, based
            on your answers.
          </div>
        </div>
        <div className="ah-plaque rv-phase">
          <div className="rv-phase-title">A few costs that go to other companies</div>
          <div className="rv-phase-blurb">
            <p style={{ marginBottom: '0.6rem' }}>
              A <strong>web address</strong> (domain) is your site’s name — for example,{' '}
              <strong>afterhourz.com</strong>. You own it and pay for it directly (usually a small
              yearly fee), and we connect it to your site for you.
            </p>
            <p>
              A few other things may bill you directly if you use them: paid hosting only if it
              becomes necessary, payment-processing fees if you take payments online, a business
              email if you want one, and any optional paid services. We’ll always tell you before
              anything like that is set up.
            </p>
          </div>
        </div>

        <div className="rv-ack">
          <input
            type="checkbox"
            id="ack-p1"
            checked={draft.project.phase1Acknowledged}
            onChange={(e) => update('project', { phase1Acknowledged: e.target.checked })}
          />
          <label htmlFor="ack-p1">
            I’ve read about Phase 1 — the website and launch — and its{' '}
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
            I understand Phase 2 — an online store and/or booking — is optional and has its own{' '}
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
          <label htmlFor="ack-3p">
            I understand the web address and any other third-party costs above are paid by me
            directly, and you’ll connect everything for me.
          </label>
        </div>
      </Question>
    ),
  },
  {
    id: 'project-notes',
    section: 'project',
    counted: true,
    render: ({ draft, setAdditionalNotes }) => (
      <Question
        title="Anything else we should know before we start?"
        explanation="Anything that didn't fit above — a deadline, something to avoid, a detail that matters to you."
        why="Last chance to tell us anything that would change how we build the site."
      >
        <TextArea
          label="Anything else (optional)"
          value={draft.additionalNotes}
          onChange={setAdditionalNotes}
        />
      </Question>
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  FLOW HELPERS                                                               */
/* -------------------------------------------------------------------------- */

/** The visible questions for the CURRENT draft (branch predicates applied). */
export function visibleQuestions(draft: ReviewDraft): QuestionDef[] {
  return QUESTIONS.filter((q) => (q.when ? q.when(draft) : true));
}

/** The sections that actually contain at least one visible question, in order. */
export function visibleSections(draft: ReviewDraft): SectionDef[] {
  const present = new Set(visibleQuestions(draft).map((q) => q.section));
  present.add('design'); // design-review (the three looks) always shows
  present.add('review'); // summary/submit always show
  return SECTIONS.filter((s) => present.has(s.id));
}

/** The three website looks, exported for ReviewApp's special design-review screen. */
export { DIRECTIONS };
export const PROTOTYPE_BASE = '/design-lab/prototypes';
