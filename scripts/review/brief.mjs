#!/usr/bin/env node
/*
  review:brief <id> — generate an INTERNAL production brief from the pulled submission (pull first
  if missing): approved design, IA, sections, CTA, gallery, store, booking, missing media, missing
  details, and the Phase 1 / Phase 2 boundary. Usage: pnpm review:brief AH-2026-XXXX [--remote]

  Writes .local/review-submissions/<id>-brief.md. NEVER invents facts (see render.mjs guardrail).
*/
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs, ReviewCliError, fail, SUBMISSIONS_DIR, isMain } from './lib.mjs';
import { loadRecord } from './load.mjs';
import { directionInfo, PROJECT_PHASES } from './schema-bridge.mjs';
import { has, val, bullets, inline, yesNo, docHeader, NOT_PROVIDED } from './render.mjs';

function section(title, body) {
  return `## ${title}\n\n${body}\n`;
}

function buildMarkdown(record) {
  const p = record.payload ?? {};
  const dir = directionInfo(record.designSelection);
  const parts = [];
  parts.push(docHeader('Internal Production Brief', record, directionInfo));

  parts.push(
    section(
      'Approved Design Direction',
      [
        `**${dir.name}** (\`${dir.id}\`)${dir.tagline ? ` — ${dir.tagline}` : ''}`,
        `- Client-noted likes: ${val(p.design?.likes)}`,
        `- Client-requested changes: ${inline(p.design?.changes)}`,
      ].join('\n'),
    ),
  );

  // Information architecture — a proposed single-page section order, gated on stated facts.
  // Sections are only listed when the client actually gave content for them (no invented sections).
  const ia = ['1. Hero — direction + primary CTA'];
  if (has(p.services?.offered) || has(p.services?.featured)) ia.push(`${ia.length + 1}. Services`);
  if (has(p.portfolio?.mediaLocations) || has(p.portfolio?.priorityBuilds))
    ia.push(`${ia.length + 1}. Gallery / portfolio`);
  if (has(p.business?.knownFor) || has(p.business?.description))
    ia.push(`${ia.length + 1}. About / positioning`);
  if (has(p.contact?.phone) || has(p.contact?.email) || has(p.location?.city))
    ia.push(`${ia.length + 1}. Contact / location`);
  ia.push(`${ia.length + 1}. Footer (social, hours)`);
  parts.push(section('Proposed Information Architecture', ia.join('\n')));

  parts.push(
    section(
      'Sections & Content Sources',
      [
        `- **Services:** ${val(p.services?.offered) === NOT_PROVIDED ? NOT_PROVIDED : val(p.services?.offered)}`,
        `- **Featured (lead) services:** ${val(p.services?.featured)}`,
        `- **Hidden / de-emphasized:** ${val(p.services?.hidden)}`,
        `- **About source:** ${has(p.business?.knownFor) ? 'client "known for" statement' : NOT_PROVIDED}`,
        `- **Vehicles served:** ${val(p.business?.vehicles)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Primary CTA',
      has(p.customerJourney?.primaryAction)
        ? `Primary CTA: **${inline(p.customerJourney.primaryAction)}** (client-selected).` +
            (has(p.customerJourney?.actions)
              ? `\nSecondary: ${val(p.customerJourney.actions)}.`
              : '')
        : `${NOT_PROVIDED} — CLIENT INPUT REQUIRED before build.`,
    ),
  );

  parts.push(
    section(
      'Gallery',
      [
        `- **Source(s):** ${val(p.portfolio?.mediaLocations)}`,
        `- **Completed-vehicle photos:** ${val(p.portfolio?.completedVehiclePhotos)}`,
        `- **Before/after:** ${val(p.portfolio?.beforeAfterPhotos)}`,
        `- **Process media:** ${val(p.portfolio?.processMedia)}`,
        `- **Lead build(s):** ${inline(p.portfolio?.priorityBuilds)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Store (Phase 2)',
      [
        `- **Interested:** ${yesNo(p.store?.interested)}`,
        `- **Product types:** ${val(p.store?.productTypes)}`,
        `- **Initial catalog size:** ${val(p.store?.initialCatalogSize)}`,
        `- **Vendors:** ${inline(p.store?.vendors) === NOT_PROVIDED ? inline(p.store?.wholesaleVendors) : inline(p.store?.vendors)}`,
        `- **Fulfillment:** ${inline(p.store?.fulfillment)}`,
      ].join('\n'),
    ),
  );

  parts.push(
    section(
      'Booking (Phase 2)',
      [
        `- **Interested:** ${yesNo(p.booking?.interested)}`,
        `- **Appointment types:** ${val(p.booking?.appointmentTypes)}`,
        `- **Payment at booking:** ${yesNo(p.booking?.paymentAtBooking)}`,
        `- **Online payments interest:** ${yesNo(p.payments?.onlinePaymentsInterest)}`,
        `- **Deposit interest:** ${yesNo(p.payments?.depositInterest)}`,
      ].join('\n'),
    ),
  );

  // Missing media — derived strictly from blank portfolio fields.
  const missingMedia = [];
  if (!has(p.portfolio?.completedVehiclePhotos)) missingMedia.push('Completed-vehicle photography');
  if (!has(p.portfolio?.beforeAfterPhotos)) missingMedia.push('Before/after pairs');
  if (!has(p.portfolio?.processMedia)) missingMedia.push('In-process / shop media');
  if (!has(p.portfolio?.mediaLocations)) missingMedia.push('A source location for any imagery');
  parts.push(
    section(
      'Missing Media',
      missingMedia.length
        ? missingMedia.map((m) => `- ${m} — CLIENT INPUT REQUIRED`).join('\n')
        : '- None flagged.',
    ),
  );

  // Missing details — blank display-critical scalar fields.
  const missingDetails = [];
  const need = (cond, label) => {
    if (!cond) missingDetails.push(label);
  };
  need(has(p.business?.knownFor), 'Positioning ("known for") statement');
  need(has(p.services?.offered), 'Service list');
  need(has(p.customerJourney?.primaryAction), 'Primary CTA');
  need(has(p.contact?.phone) || has(p.contact?.email), 'Public contact method');
  need(has(p.location?.city) || has(p.location?.state), 'Location / service area');
  need(has(p.location?.businessHours), 'Business hours');
  need(has(p.domain?.domain) || has(p.domain?.preferredDomain), 'Launch domain');
  parts.push(
    section(
      'Missing Details',
      missingDetails.length
        ? missingDetails.map((m) => `- ${m} — CLIENT INPUT REQUIRED`).join('\n')
        : '- None outstanding.',
    ),
  );

  parts.push(
    section(
      'Phase 1 / Phase 2 Boundary',
      [
        PROJECT_PHASES
          ? `**${PROJECT_PHASES.phase1.title}** (${PROJECT_PHASES.phase1.fee})`
          : '**Phase 1 — Core website + launch**',
        PROJECT_PHASES ? `>\n> ${PROJECT_PHASES.phase1.blurb}` : '',
        '',
        '- In scope: approved single-page site, services, gallery, contact, launch.',
        '',
        PROJECT_PHASES
          ? `**${PROJECT_PHASES.phase2.title}** (${PROJECT_PHASES.phase2.fee})`
          : '**Phase 2 — Online sales / booking**',
        PROJECT_PHASES ? `> ${PROJECT_PHASES.phase2.blurb}` : '',
        `- Store: ${yesNo(p.store?.interested)}. Booking: ${yesNo(p.booking?.interested)}. ` +
          `Online payments: ${yesNo(p.payments?.onlinePaymentsInterest)}.`,
        '',
        `- Phase 1 acknowledged: ${p.project?.phase1Acknowledged ? 'Yes' : 'No'}; ` +
          `Phase 2 acknowledged: ${p.project?.phase2Acknowledged ? 'Yes' : 'No'}; ` +
          `Third-party costs acknowledged: ${p.project?.thirdPartyCostsAcknowledged ? 'Yes' : 'No'}.`,
        PROJECT_PHASES ? `\n_${PROJECT_PHASES.thirdParty}_` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  );

  if (has(p.additionalNotes)) {
    parts.push(section('Additional Client Notes', bullets([inline(p.additionalNotes)])));
  }

  return parts.join('\n') + '\n';
}

async function main() {
  const { remote, positionals } = parseArgs();
  const id = positionals[0];
  if (!id) fail('usage: pnpm review:brief <id> [--remote]');

  const { record } = await loadRecord(id, { remote });
  const md = buildMarkdown(record);
  const outPath = resolve(SUBMISSIONS_DIR, `${id}-brief.md`);
  await writeFile(outPath, md, 'utf8');
  console.log(`\n  wrote production brief -> ${outPath}\n`);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    if (err instanceof ReviewCliError) fail(err.message);
    throw err;
  });
}
