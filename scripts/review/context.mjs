#!/usr/bin/env node
/*
  review:context <id> — read the pulled submission JSON (pull first if missing) and generate
  .local/review-submissions/<id>-context.md: a Markdown brief using the EXACT section headers
  from the directive. Usage: pnpm review:context AH-2026-XXXX [--remote]

  CRITICAL: never invents facts. Client-stated facts, derived implementation requirements, and
  open questions are kept strictly separate (see render.mjs guardrail note).
*/
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs, ReviewCliError, fail, SUBMISSIONS_DIR, isMain } from './lib.mjs';
import { loadRecord } from './load.mjs';
import { directionInfo, PROJECT_PHASES } from './schema-bridge.mjs';
import { has, val, bullets, inline, quote, yesNo, docHeader, NOT_PROVIDED } from './render.mjs';
import { clientAssetsSection, smartMissingMedia, loadAssetSummary } from './assets-summary.mjs';

function section(title, body) {
  return `## ${title}\n\n${body}\n`;
}

/**
 * Collect fields the client left blank -> phrased as open questions (never invented answers).
 * SMART: a question is skipped the moment the client has given the fact (including social /
 * Google Business), or an uploaded asset already answers it (e.g. finished-build photos).
 */
function openQuestions(p, counts) {
  const q = [];
  const ask = (cond, question) => {
    if (!cond) q.push(question);
  };
  ask(has(p.business?.knownFor), 'What does Anthony most want After Hourz known for?');
  ask(has(p.business?.description), 'A short business description / positioning statement.');
  ask(has(p.services?.offered), 'Confirmed list of services offered.');
  ask(has(p.services?.featured), 'Which services to feature most prominently.');
  ask(has(p.customerJourney?.primaryAction), 'The single primary call-to-action for the site.');
  ask(
    has(p.contact?.phone) || has(p.contact?.email),
    'A public contact method (phone and/or email) to display.',
  );
  ask(has(p.location?.city) || has(p.location?.state), 'City / service area to display.');
  ask(has(p.location?.businessHours), 'Business hours.');
  ask(
    has(p.portfolio?.completedVehiclePhotos) ||
      has(p.portfolio?.mediaLocations) ||
      (counts?.['completed-build'] ?? 0) > 0,
    'Where finished-build photography lives / can be sourced.',
  );
  ask(
    has(p.social?.instagram) || has(p.social?.googleBusiness) || has(p.social?.facebook),
    'A social / Google Business presence to link.',
  );
  ask(has(p.domain?.domain) || has(p.domain?.preferredDomain), 'Domain to launch on.');
  return q;
}

function buildMarkdown(record, assets) {
  const p = record.payload ?? {};
  const counts = assets?.counts ?? { total: 0 };
  const parts = [];
  parts.push(docHeader('Client Context Brief', record, directionInfo));

  // --- Client Assets Provided (counts only; NO binaries) ---
  parts.push(section('Client Assets Provided', clientAssetsSection(assets)));

  // --- Selected Direction ---
  const dir = directionInfo(record.designSelection);
  parts.push(
    section(
      'Selected Direction',
      [
        `**${dir.name}** (\`${dir.id}\`)${dir.tagline ? ` — ${dir.tagline}` : ''}`,
        '',
        `- **What they like:** ${val(p.design?.likes)}`,
        `- **Requested changes:** ${inline(p.design?.changes)}`,
        `- **Ideas borrowed from the other looks:** ${inline(p.design?.borrowedIdeas)}`,
        `- **Other inspiration:** ${inline(p.design?.inspirationLinks)}`,
      ]
        .filter((l) => l !== '')
        .join('\n'),
    ),
  );

  parts.push(
    section(
      'What Anthony Wants After Hourz Known For',
      has(p.business?.knownFor)
        ? quote(p.business.knownFor)
        : `${NOT_PROVIDED} — see Open Questions.`,
    ),
  );

  parts.push(
    section(
      'Target Customers',
      has(p.business?.targetCustomers) ? quote(p.business.targetCustomers) : NOT_PROVIDED,
    ),
  );

  parts.push(
    section(
      'Branding',
      [
        `- **Has an existing logo:** ${yesNo(p.business?.hasLogo)}`,
        `- **Brand colors:** ${inline(p.business?.brandColors)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Credentials',
      [
        `- **Selected:** ${val(p.business?.credentials)}`,
        `- **Details:** ${inline(p.business?.credentialDetails)}`,
      ].join('\n'),
    ),
  );

  parts.push(section('Primary Services', bullets(p.services?.offered)));
  parts.push(section('Featured Services', bullets(p.services?.featured)));

  parts.push(
    section(
      'Customer Journey',
      [
        `- **Primary action:** ${val(p.customerJourney?.primaryAction)}`,
        `- **Secondary goals for the site:** ${val(p.customerJourney?.actions)}`,
        `- **Current contact methods:** ${val(p.customerJourney?.currentContactMethods)}`,
        `- **Let customers attach photos when requesting a quote:** ${yesNo(p.customerJourney?.photoUploadInterest)}`,
        `- **What's needed from a customer to quote:** ${inline(p.customerJourney?.intakeRequirements)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Primary CTA',
      `Primary action selected by client: **${val(p.customerJourney?.primaryAction)}**`,
    ),
  );

  parts.push(
    section(
      'Portfolio / Assets Available',
      [
        `- **Completed-vehicle photos:** ${val(p.portfolio?.completedVehiclePhotos)}`,
        `- **Before/after photos:** ${val(p.portfolio?.beforeAfterPhotos)}`,
        `- **Process media:** ${val(p.portfolio?.processMedia)}`,
        `- **Where media lives:** ${val(p.portfolio?.mediaLocations)}`,
        `- **Priority builds to feature:** ${inline(p.portfolio?.priorityBuilds)}`,
        `- **Testimonials / reviews to feature:** ${inline(p.portfolio?.testimonials)}`,
      ].join('\n'),
    ),
  );

  // Missing Assets — SMART: a need is dropped when an uploaded category covers it OR the client
  // described having it. Never invented; only what is genuinely still absent is flagged.
  const missingAssets = smartMissingMedia(p, counts);
  parts.push(
    section(
      'Missing Assets',
      missingAssets.length
        ? missingAssets.map((m) => `- ${m} — CLIENT INPUT REQUIRED`).join('\n')
        : '- None outstanding — uploads and/or intake answers cover the needed assets.',
    ),
  );

  parts.push(
    section(
      'Contact / Location',
      [
        `- **Phone:** ${val(p.contact?.phone)}`,
        `- **Email:** ${val(p.contact?.email)}`,
        `- **Preferred contact method:** ${val(p.contact?.preferredMethod)}`,
        `- **City:** ${val(p.location?.city)}`,
        `- **State:** ${val(p.location?.state)}`,
        `- **Service areas:** ${inline(p.location?.serviceAreas)}`,
        `- **Appointment required:** ${yesNo(p.location?.appointmentRequired)}`,
        `- **Business hours:** ${inline(p.location?.businessHours)}`,
        '',
        '_Social:_',
        `- Instagram: ${val(p.social?.instagram)}`,
        `- Facebook: ${val(p.social?.facebook)}`,
        `- TikTok: ${val(p.social?.tiktok)}`,
        `- YouTube: ${val(p.social?.youtube)}`,
        `- Google Business: ${val(p.social?.googleBusiness)}`,
        `- Other: ${val(p.social?.other)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Domain',
      [
        `- **Owns a domain:** ${yesNo(p.domain?.ownsDomain)}`,
        `- **Current domain:** ${val(p.domain?.domain)}`,
        `- **Preferred domain:** ${val(p.domain?.preferredDomain)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Online Store',
      [
        `- **Interested:** ${yesNo(p.store?.interested)}`,
        `- **Product types:** ${val(p.store?.productTypes)}`,
        `- **Initial catalog size:** ${val(p.store?.initialCatalogSize)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Vendors',
      [
        `- **Wholesale vendors:** ${inline(p.store?.wholesaleVendors)}`,
        `- **Vendor assets available:** ${val(p.store?.vendorAssets)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section('Fulfillment', has(p.store?.fulfillment) ? quote(p.store.fulfillment) : NOT_PROVIDED),
  );

  parts.push(
    section(
      'Booking',
      [
        `- **Interested:** ${yesNo(p.booking?.interested)}`,
        `- **Appointment types:** ${val(p.booking?.appointmentTypes)}`,
        `- **Payment at booking:** ${yesNo(p.booking?.paymentAtBooking)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Payments',
      [
        `- **Current methods:** ${val(p.payments?.currentMethods)}`,
        `- **Wants online payments:** ${yesNo(p.payments?.onlinePaymentsInterest)}`,
        `- **Wants deposits:** ${yesNo(p.payments?.depositInterest)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Phase Acknowledgments',
      [
        `- **Phase 1 acknowledged:** ${p.project?.phase1Acknowledged ? 'Yes' : 'No'}`,
        `- **Phase 2 acknowledged:** ${p.project?.phase2Acknowledged ? 'Yes' : 'No'}`,
        `- **Third-party costs acknowledged:** ${p.project?.thirdPartyCostsAcknowledged ? 'Yes' : 'No'}`,
        PROJECT_PHASES
          ? `\n_${PROJECT_PHASES.phase1.title} (${PROJECT_PHASES.phase1.fee}); ` +
            `${PROJECT_PHASES.phase2.title} (${PROJECT_PHASES.phase2.fee})._`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  );

  const oq = openQuestions(p, counts);
  parts.push(
    section(
      'Open Questions',
      oq.length
        ? oq.map((q) => `- ${q} — CLIENT INPUT REQUIRED`).join('\n')
        : '- None — all key fields answered by the client.',
    ),
  );

  // --- Production Requirements Derived From Intake ---
  // Each item is a DERIVED IMPLEMENTATION REQUIREMENT: an engineering task implied by a
  // CLIENT-STATED FACT. We never derive a requirement from a fact the client did not state.
  const derived = [];
  if (has(p.services?.featured))
    derived.push(
      `Feature these services prominently in the services section: ${val(p.services.featured)}.`,
    );
  if (has(p.customerJourney?.primaryAction))
    derived.push(`Make "${inline(p.customerJourney.primaryAction)}" the site's primary CTA.`);
  if (p.customerJourney?.photoUploadInterest === 'yes')
    derived.push('Intake flow should allow the customer to attach vehicle photos.');
  if (has(p.portfolio?.priorityBuilds))
    derived.push(`Lead the gallery with the client-named priority build(s).`);
  if (p.store?.interested === 'yes')
    derived.push('Phase 2: scope an online store for the selected product types.');
  if (p.booking?.interested === 'yes')
    derived.push('Phase 2: scope online booking for the selected appointment types.');
  if (p.payments?.onlinePaymentsInterest === 'yes' || p.payments?.depositInterest === 'yes')
    derived.push('Phase 2: scope online payments / deposits (third-party processing fees apply).');
  parts.push(
    section(
      'Production Requirements Derived From Intake',
      derived.length
        ? derived.map((d) => `- DERIVED: ${d}`).join('\n')
        : '- No implementation requirements can be derived until more fields are answered.',
    ),
  );

  // --- Phase 1 / Phase 2 scope inputs ---
  parts.push(
    section(
      'Phase 1 Scope Inputs',
      [
        `- Direction: ${dir.name}`,
        `- Services to list: ${val(p.services?.offered)}`,
        `- Featured services: ${val(p.services?.featured)}`,
        `- Primary CTA: ${val(p.customerJourney?.primaryAction)}`,
        `- Contact to display: phone ${val(p.contact?.phone)}, email ${val(p.contact?.email)}`,
        `- Location to display: ${val(p.location?.city)}, ${val(p.location?.state)}`,
        `- Gallery source: ${val(p.portfolio?.mediaLocations)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Phase 2 Scope Inputs',
      [
        `- Online store interest: ${yesNo(p.store?.interested)} (${val(p.store?.productTypes)})`,
        `- Booking interest: ${yesNo(p.booking?.interested)} (${val(p.booking?.appointmentTypes)})`,
        `- Online payments: ${yesNo(p.payments?.onlinePaymentsInterest)}; deposits: ${yesNo(p.payments?.depositInterest)}`,
        `- Fulfillment notes: ${inline(p.store?.fulfillment)}`,
      ].join('\n'),
    ),
  );

  // --- Client-supplied facts safe to use ---
  const facts = [];
  const factIf = (cond, label, value) => {
    if (cond) facts.push(`- ${label}: ${value}`);
  };
  factIf(has(p.business?.knownFor), 'Known for', inline(p.business.knownFor));
  factIf(has(p.services?.offered), 'Services offered', val(p.services.offered));
  factIf(has(p.services?.featured), 'Featured services', val(p.services.featured));
  factIf(has(p.contact?.phone), 'Phone', val(p.contact.phone));
  factIf(has(p.contact?.email), 'Email', val(p.contact.email));
  factIf(has(p.location?.city), 'City', val(p.location.city));
  factIf(has(p.location?.state), 'State', val(p.location.state));
  factIf(has(p.location?.businessHours), 'Hours', inline(p.location.businessHours));
  factIf(has(p.social?.instagram), 'Instagram', val(p.social.instagram));
  factIf(has(p.domain?.domain), 'Domain owned', val(p.domain.domain));
  parts.push(
    section(
      'Client-Supplied Facts — Safe To Use In Production',
      facts.length
        ? facts.join('\n')
        : '- None yet — no display-ready facts were supplied. Do not fabricate; ask the client.',
    ),
  );

  parts.push(
    section(
      'Items That Still Require Confirmation',
      oq.length
        ? oq.map((q) => `- ${q} — CLIENT INPUT REQUIRED`).join('\n')
        : '- None outstanding.',
    ),
  );

  return parts.join('\n') + '\n';
}

async function main() {
  const { remote, positionals } = parseArgs();
  const id = positionals[0];
  if (!id) fail('usage: pnpm review:context <id> [--remote]');

  const { record } = await loadRecord(id, { remote });
  const assets = loadAssetSummary(id, { remote });
  const md = buildMarkdown(record, assets);
  const outPath = resolve(SUBMISSIONS_DIR, `${id}-context.md`);
  await writeFile(outPath, md, 'utf8');
  console.log(`\n  wrote context brief -> ${outPath}\n`);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    if (err instanceof ReviewCliError) fail(err.message);
    throw err;
  });
}
