/*
  Shared asset-awareness helpers for review:context / review:brief.

  Two responsibilities:
    1) Render the "## Client Assets Provided" section: counts by category (from D1 review_assets)
       + reference links (from payload.references[]). NO binary embedding — we list counts and
       links only; the actual files are fetched by `review:assets`.
    2) SMART missing-asset checklist: a media/asset need is only listed as missing when NO
       uploaded category satisfies it AND the client did not describe having it. Likewise a
       "still need this fact" item is skipped when the fact (instagram / google / domain) is
       already present.

  GUARDRAILS (render.mjs): counts and links are the client's own data. We never invent an asset
  and never claim one exists that the client did not upload or state.
*/
import { has, val, inline, NOT_PROVIDED } from './render.mjs';
import { assetRowsForSubmission, countAssetsByCategory } from './lib.mjs';

/**
 * Load an asset summary for one submission: { counts, total, unavailable }. Never throws —
 * when the store is unavailable it returns empty counts flagged `unavailable` so context/brief
 * still render with inspiration links only.
 */
export function loadAssetSummary(id, { remote = false } = {}) {
  const rows = assetRowsForSubmission(id, { remote });
  if (rows.unavailable) {
    return { counts: { total: 0 }, total: 0, unavailable: true, reason: rows.unavailable };
  }
  const counts = countAssetsByCategory(rows);
  return { counts, total: counts.total, unavailable: false };
}

/**
 * Human labels for asset categories (kept aligned with ASSET_CATEGORIES). Any unknown category
 * falls back to its raw id, so this never crashes if the catalog grows.
 */
const CATEGORY_LABELS = {
  'completed-build': 'Completed builds',
  'before-after': 'Before / after',
  process: 'In-process / shop work',
  shop: 'Shop / location',
  portrait: 'Owner / team portrait',
  logo: 'Logo / brand mark',
  reference: 'Inspiration references',
  'vendor-document': 'Vendor catalogs / price sheets',
  other: 'Other',
};

function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] ?? cat;
}

/**
 * Which uploaded categories satisfy each portfolio-media need. If any listed category has a
 * count > 0, that need is considered covered and dropped from the missing checklist.
 */
export const MEDIA_NEED_CATEGORIES = {
  'Completed-vehicle photography': ['completed-build'],
  'Before/after pairs': ['before-after'],
  'In-process / shop media': ['process', 'shop'],
};

/** True when at least one of the given categories has an uploaded asset. */
export function coveredByAssets(counts, categories) {
  return categories.some((c) => (counts?.[c] ?? 0) > 0);
}

/**
 * Normalize payload.references[] into printable reference links. Image references (kind === 'image')
 * point at an uploaded asset id — we note that rather than a URL (the binary is fetched by
 * review:assets). Returns [] when none.
 */
export function referenceLinks(references) {
  if (!Array.isArray(references)) return [];
  const out = [];
  for (const ref of references) {
    if (!ref || typeof ref !== 'object') continue;
    const note = has(ref.note) ? inline(ref.note) : '';
    if (ref.kind === 'link' && has(ref.value)) {
      out.push({ label: inline(ref.value), note });
    } else if (ref.kind === 'image' && has(ref.assetId)) {
      out.push({ label: `uploaded image reference (${inline(ref.assetId)})`, note });
    } else if (has(ref.value)) {
      out.push({ label: inline(ref.value), note });
    }
  }
  return out;
}

/**
 * Render the "## Client Assets Provided" section body.
 *
 * @param {{ counts: Record<string, number> & { total: number }, unavailable?: boolean }} assets
 * @param {Array} references  payload.references[]
 */
export function clientAssetsSection(assets, references) {
  const lines = [];
  const counts = assets?.counts ?? { total: 0 };

  if (assets?.unavailable) {
    lines.push(
      '_Uploaded-asset store was unavailable when this brief was generated; ' +
        'counts below reflect inspiration links only. Run `pnpm review:assets <id>` to sync._',
    );
    lines.push('');
  }

  const uploadedEntries = Object.entries(counts).filter(([k, n]) => k !== 'total' && n > 0);
  lines.push('**Uploaded files (by category):**');
  if (uploadedEntries.length === 0) {
    lines.push(
      assets?.unavailable ? `- ${NOT_PROVIDED}` : '- None uploaded through the questionnaire.',
    );
  } else {
    for (const [cat, n] of uploadedEntries) {
      lines.push(`- ${categoryLabel(cat)} (\`${cat}\`): ${n}`);
    }
    lines.push(`- **Total uploaded:** ${counts.total}`);
  }

  lines.push('');
  const refs = referenceLinks(references);
  lines.push('**Inspiration references provided:**');
  if (refs.length === 0) {
    lines.push('- None provided.');
  } else {
    for (const r of refs) {
      lines.push(`- ${r.label}${r.note ? ` — ${r.note}` : ''}`);
    }
  }

  lines.push('');
  lines.push(
    '_No binaries are embedded here. Uploaded files are retrievable with ' +
      '`pnpm review:assets <id>`; the client never sees storage locations._',
  );

  return lines.join('\n');
}

/**
 * SMART missing-media checklist. A media need is listed ONLY when it is neither covered by an
 * uploaded category NOR described in the matching portfolio text field. Returns string[] of
 * still-missing labels.
 *
 * @param {object} payload  submission payload
 * @param {{ [category: string]: number }} counts  asset counts by category
 */
export function smartMissingMedia(payload, counts) {
  const p = payload ?? {};
  const missing = [];

  const need = (label, describedField, categories) => {
    const described = has(describedField);
    const uploaded = coveredByAssets(counts, categories);
    if (!described && !uploaded) missing.push(label);
  };

  need('Completed-vehicle photography', p.portfolio?.completedVehiclePhotos, ['completed-build']);
  need('Before/after pairs', p.portfolio?.beforeAfterPhotos, ['before-after']);
  need('In-process / shop media', p.portfolio?.processMedia, ['process', 'shop']);

  // A priority build to lead with is text-only (no category maps to it).
  if (!has(p.portfolio?.priorityBuilds)) missing.push('A named priority build to lead with');

  // A source for imagery: satisfied by any upload OR a stated media location.
  if (!has(p.portfolio?.mediaLocations) && (counts?.total ?? 0) === 0) {
    missing.push('A source location for any imagery');
  }

  return missing;
}

/**
 * SMART missing-details checklist. Skips any fact the client already gave. `instagram`, Google
 * Business, and domain are treated as "given" the moment any of the equivalent fields is present.
 * Returns string[] of still-missing display-critical facts.
 */
export function smartMissingDetails(payload) {
  const p = payload ?? {};
  const missing = [];
  const need = (present, label) => {
    if (!present) missing.push(label);
  };

  need(has(p.business?.knownFor), 'Positioning ("known for") statement');
  need(has(p.services?.offered), 'Service list');
  need(has(p.customerJourney?.primaryAction), 'Primary CTA');
  need(has(p.contact?.phone) || has(p.contact?.email), 'Public contact method');
  need(has(p.location?.city) || has(p.location?.state), 'Location / service area');
  need(has(p.location?.businessHours), 'Business hours');
  need(has(p.domain?.domain) || has(p.domain?.preferredDomain), 'Launch domain');

  return missing;
}

/** Short one-line label for a category count, e.g. "3 completed-build". Used in summaries. */
export function assetCountSummary(counts) {
  const entries = Object.entries(counts ?? {}).filter(([k, n]) => k !== 'total' && n > 0);
  if (entries.length === 0) return 'no uploaded files';
  return entries.map(([cat, n]) => `${n} ${cat}`).join(', ');
}

/** Convenience: fold the raw display value through inline() for use in derived sentences. */
export function inlineVal(value) {
  return has(value) ? val(value) : NOT_PROVIDED;
}
