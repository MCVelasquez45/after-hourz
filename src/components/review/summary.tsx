/*
  After Hourz — editable review summary. Shows what will be sent, grouped by step,
  with an "Edit" button that jumps back to the relevant step. Empty facts read as
  "Not answered" (we never invent them).
*/
import { DIRECTIONS } from '../../lib/review/schema';
import type { ReviewDraft } from './draft';
import type { StepId } from './steps';

function list(v: string[]): string {
  return v.length ? v.join(', ') : '';
}
function ynm(v: string): string {
  if (v === 'yes') return 'Yes';
  if (v === 'no') return 'No';
  if (v === 'maybe') return 'Maybe';
  return '';
}
function directionName(id: string): string {
  return DIRECTIONS.find((d) => d.id === id)?.name ?? '';
}

interface Row {
  key: string;
  val: string;
}
interface Group {
  step: StepId;
  title: string;
  rows: Row[];
}

export function buildSummary(draft: ReviewDraft): Group[] {
  const socialList = list(
    [
      draft.social.instagram && 'Instagram',
      draft.social.facebook && 'Facebook',
      draft.social.tiktok && 'TikTok',
      draft.social.youtube && 'YouTube',
      draft.social.googleBusiness && 'Google Business',
    ].filter(Boolean) as string[],
  );

  return [
    {
      step: 'design-selection',
      title: 'Design',
      rows: [
        { key: 'Chosen direction', val: directionName(draft.design.selection) },
        { key: 'Liked', val: list(draft.design.likes) },
        { key: 'Changes', val: draft.design.changes },
        { key: 'Borrow from others', val: draft.design.borrowedIdeas },
      ],
    },
    {
      step: 'business',
      title: 'The shop',
      rows: [
        { key: 'Description', val: draft.business.description },
        { key: 'Known for', val: draft.business.knownFor },
        { key: 'Works on', val: list(draft.business.vehicles) },
        { key: 'What sets it apart', val: draft.business.differentiators },
        { key: 'Origin story', val: draft.business.originStory },
        { key: 'Culture / roots', val: draft.business.culturalInfluence },
      ],
    },
    {
      step: 'services',
      title: 'Services',
      rows: [
        { key: 'Offered', val: list(draft.services.offered) },
        { key: 'Featured', val: list(draft.services.featured) },
        { key: 'Hidden', val: list(draft.services.hidden) },
      ],
    },
    {
      step: 'portfolio',
      title: 'Portfolio',
      rows: [
        { key: 'Finished photos', val: draft.portfolio.completedVehiclePhotos },
        { key: 'Before / after', val: draft.portfolio.beforeAfterPhotos },
        { key: 'Process media', val: draft.portfolio.processMedia },
        { key: 'Photos live on', val: list(draft.portfolio.mediaLocations) },
        { key: 'Priority builds', val: draft.portfolio.priorityBuilds },
      ],
    },
    {
      step: 'store',
      title: 'Online store',
      rows: [
        { key: 'Wants a store', val: ynm(draft.store.interested) },
        { key: 'Might sell', val: list(draft.store.productTypes) },
        { key: 'Catalog size', val: draft.store.initialCatalogSize },
        { key: 'Fulfillment', val: draft.store.fulfillment },
      ],
    },
    {
      step: 'vendors',
      title: 'Vendors',
      rows: [
        { key: 'Wholesale', val: draft.store.wholesaleVendors },
        { key: 'Other vendors', val: draft.store.vendors },
        { key: 'Vendor assets', val: list(draft.store.vendorAssets) },
      ],
    },
    {
      step: 'booking',
      title: 'Booking',
      rows: [
        { key: 'Wants booking', val: ynm(draft.booking.interested) },
        { key: 'Bookable', val: list(draft.booking.appointmentTypes) },
        { key: 'Deposit at booking', val: ynm(draft.booking.paymentAtBooking) },
        { key: 'Contact methods', val: list(draft.customerJourney.currentContactMethods) },
        { key: 'Phone', val: draft.contact.phone },
        { key: 'Email', val: draft.contact.email },
      ],
    },
    {
      step: 'payments',
      title: 'Payments',
      rows: [
        { key: 'Takes payment via', val: list(draft.payments.currentMethods) },
        { key: 'Online payments', val: ynm(draft.payments.onlinePaymentsInterest) },
        { key: 'Deposits online', val: ynm(draft.payments.depositInterest) },
      ],
    },
    {
      step: 'domain',
      title: 'Domain & location',
      rows: [
        { key: 'Owns a domain', val: ynm(draft.domain.ownsDomain) },
        { key: 'Domain owned', val: draft.domain.domain },
        { key: 'Domain wanted', val: draft.domain.preferredDomain },
        { key: 'City', val: draft.location.city },
        { key: 'State', val: draft.location.state },
        { key: 'Social', val: socialList },
      ],
    },
    {
      step: 'phases',
      title: 'Project phases',
      rows: [
        { key: 'Phase 1 read', val: draft.project.phase1Acknowledged ? 'Acknowledged' : '' },
        { key: 'Phase 2 read', val: draft.project.phase2Acknowledged ? 'Acknowledged' : '' },
        {
          key: 'Third-party costs',
          val: draft.project.thirdPartyCostsAcknowledged ? 'Acknowledged' : '',
        },
      ],
    },
  ];
}

export function SummaryView({
  draft,
  onEdit,
}: {
  draft: ReviewDraft;
  onEdit: (step: StepId) => void;
}) {
  const groups = buildSummary(draft);
  return (
    <div className="ah-plaque rv-card">
      <h2>Review your answers</h2>
      <p className="rv-lede">
        Here&apos;s everything you&apos;ve told us. Use Edit on any section to change it — nothing
        is sent until you submit on the next step.
      </p>
      {groups.map((g) => (
        <section className="rv-summary-group" key={g.step} aria-label={g.title}>
          <div className="rv-summary-head">
            <h3>{g.title}</h3>
            <button type="button" className="rv-edit" onClick={() => onEdit(g.step)}>
              Edit
            </button>
          </div>
          {g.rows.map((r) => (
            <div className="rv-summary-row" key={r.key}>
              <span className="rv-summary-key">{r.key}</span>
              <span className={`rv-summary-val${r.val ? '' : ' rv-summary-val--empty'}`}>
                {r.val || 'Not answered'}
              </span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
