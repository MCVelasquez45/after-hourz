/*
  After Hourz — editable review summary. Shows EVERYTHING that will be sent, grouped by
  section, each with an Edit button that jumps back to the matching question. Includes the
  Your Work / photos group (count + thumbnails) and Store & Booking. Empty facts read as
  "Not answered" — we never invent them.
*/
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
      draft.social.googleBusiness === 'yes' && 'Google Business',
    ].filter(Boolean) as string[],
  );

  return [
    {
      step: 'design-inspiration',
      title: 'Inspiration',
      rows: [{ key: 'Sites / looks you like', val: draft.design.inspirationLinks }],
    },
    {
      step: 'about-description',
      title: 'About',
      rows: [
        { key: 'What it is', val: draft.business.description },
        { key: 'Known for', val: draft.business.knownFor },
        { key: 'What sets it apart', val: draft.business.differentiators },
        { key: 'Works on', val: list(draft.business.vehicles) },
        { key: 'Ideal customers', val: draft.business.targetCustomers },
        { key: 'Origin story', val: draft.business.originStory },
        { key: 'Culture / roots', val: draft.business.culturalInfluence },
        { key: 'Has a logo', val: ynm(draft.business.hasLogo) },
        { key: 'Brand colors', val: draft.business.brandColors },
        { key: 'Credentials', val: list(draft.business.credentials) },
        { key: 'Credential details', val: draft.business.credentialDetails },
      ],
    },
    {
      step: 'services-offered',
      title: 'Services',
      rows: [
        { key: 'Offered', val: list(draft.services.offered) },
        { key: 'Featured', val: list(draft.services.featured) },
        { key: 'Hidden', val: list(draft.services.hidden) },
      ],
    },
    {
      step: 'online-social',
      title: 'Online Presence',
      rows: [
        { key: 'Social', val: socialList },
        { key: 'Instagram', val: draft.social.instagram },
        { key: 'Facebook', val: draft.social.facebook },
        { key: 'Google listing', val: ynm(draft.social.googleBusiness) },
        { key: 'Contact methods', val: list(draft.customerJourney.currentContactMethods) },
        { key: 'Phone', val: draft.contact.phone },
        { key: 'Email', val: draft.contact.email },
        { key: 'City', val: draft.location.city },
        { key: 'State', val: draft.location.state },
        { key: 'Hours', val: draft.location.businessHours },
        { key: 'Appointment needed', val: ynm(draft.location.appointmentRequired) },
        { key: 'Service area', val: draft.location.serviceAreas },
        { key: 'Primary action', val: draft.customerJourney.primaryAction },
        { key: 'Other site goals', val: list(draft.customerJourney.actions) },
        { key: 'Needed to give a quote', val: draft.customerJourney.intakeRequirements },
        {
          key: 'Let customers attach photos',
          val: ynm(draft.customerJourney.photoUploadInterest),
        },
        { key: 'Owns web address', val: ynm(draft.domain.ownsDomain) },
        { key: 'Domain owned', val: draft.domain.domain },
        { key: 'Domain wanted', val: draft.domain.preferredDomain },
      ],
    },
    {
      step: 'store-interested',
      title: 'Store & Booking',
      rows: [
        { key: 'Wants a store', val: ynm(draft.store.interested) },
        { key: 'Might sell', val: list(draft.store.productTypes) },
        { key: 'Catalog size', val: draft.store.initialCatalogSize },
        { key: 'Suppliers', val: draft.store.wholesaleVendors },
        { key: 'Fulfillment', val: draft.store.fulfillment },
        { key: 'Wants booking', val: ynm(draft.booking.interested) },
        { key: 'Bookable', val: list(draft.booking.appointmentTypes) },
        { key: 'Deposit at booking', val: ynm(draft.booking.paymentAtBooking) },
        { key: 'Takes payment via', val: list(draft.payments.currentMethods) },
        { key: 'Online payments', val: ynm(draft.payments.onlinePaymentsInterest) },
        { key: 'Wants deposits', val: ynm(draft.payments.depositInterest) },
      ],
    },
    {
      step: 'project-phases',
      title: 'Project',
      rows: [
        { key: 'Phase 1 read', val: draft.project.phase1Acknowledged ? 'Acknowledged' : '' },
        { key: 'Phase 2 read', val: draft.project.phase2Acknowledged ? 'Acknowledged' : '' },
        {
          key: 'Third-party costs',
          val: draft.project.thirdPartyCostsAcknowledged ? 'Acknowledged' : '',
        },
        { key: 'Anything else', val: draft.additionalNotes },
      ],
    },
  ];
}

/** Uploaded photos/files grouped for the summary (count + small thumbnails). */
function WorkGroup({ draft, onEdit }: { draft: ReviewDraft; onEdit: (s: StepId) => void }) {
  const built = draft.assets.filter((a) => a.category === 'completed-build');
  const beforeAfter = draft.assets.filter((a) => a.category === 'before-after');
  const total = draft.assets.length;
  return (
    <section className="rv-summary-group" aria-label="Your Work">
      <div className="rv-summary-head">
        <h3>Your Work</h3>
        <button type="button" className="rv-edit" onClick={() => onEdit('work-photos')}>
          Edit
        </button>
      </div>
      <div className="rv-summary-row">
        <span className="rv-summary-key">Photos &amp; files</span>
        <span className={`rv-summary-val${total ? '' : ' rv-summary-val--empty'}`}>
          {total
            ? `${total} added (${built.length} finished-build, ${beforeAfter.length} before/after)`
            : 'None added yet — you can send them later'}
        </span>
      </div>
      {total > 0 && (
        <ul className="rv-summary-thumbs" aria-hidden="true">
          {draft.assets.slice(0, 8).map((a) => (
            <li key={a.assetId} className="rv-summary-thumb" title={a.filename}>
              <span className="rv-summary-thumb-name">{a.filename}</span>
            </li>
          ))}
          {total > 8 && <li className="rv-summary-thumb rv-summary-thumb--more">+{total - 8}</li>}
        </ul>
      )}
      {draft.portfolio.priorityBuilds && (
        <div className="rv-summary-row">
          <span className="rv-summary-key">Priority builds</span>
          <span className="rv-summary-val">{draft.portfolio.priorityBuilds}</span>
        </div>
      )}
      {draft.portfolio.processMedia && (
        <div className="rv-summary-row">
          <span className="rv-summary-key">Video link</span>
          <span className="rv-summary-val">{draft.portfolio.processMedia}</span>
        </div>
      )}
      {draft.portfolio.testimonials && (
        <div className="rv-summary-row">
          <span className="rv-summary-key">Testimonials</span>
          <span className="rv-summary-val">{draft.portfolio.testimonials}</span>
        </div>
      )}
    </section>
  );
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
        is sent until you send it on the next step.
      </p>
      {groups.slice(0, 3).map((g) => (
        <SummaryGroup key={g.step} group={g} onEdit={onEdit} />
      ))}
      {/* Your Work sits with the content group it relates to */}
      <WorkGroup draft={draft} onEdit={onEdit} />
      {groups.slice(3).map((g) => (
        <SummaryGroup key={g.step} group={g} onEdit={onEdit} />
      ))}
    </div>
  );
}

function SummaryGroup({ group, onEdit }: { group: Group; onEdit: (s: StepId) => void }) {
  return (
    <section className="rv-summary-group" aria-label={group.title}>
      <div className="rv-summary-head">
        <h3>{group.title}</h3>
        <button type="button" className="rv-edit" onClick={() => onEdit(group.step)}>
          Edit
        </button>
      </div>
      {group.rows.map((r) => (
        <div className="rv-summary-row" key={r.key}>
          <span className="rv-summary-key">{r.key}</span>
          <span className={`rv-summary-val${r.val ? '' : ' rv-summary-val--empty'}`}>
            {r.val || 'Not answered'}
          </span>
        </div>
      ))}
    </section>
  );
}
