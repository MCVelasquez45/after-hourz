/*
  Markdown rendering helpers for review:context / review:brief.

  CRITICAL GUARDRAIL (CLAUDE.md): NEVER invent services, prices, locations, claims, awards, or
  history. Every value rendered here comes verbatim from the client's own submission payload.
  Where the client left a field blank we say so explicitly ("_not provided_") — we never fill it
  in. Downstream Markdown clearly separates:
    - CLIENT-STATED FACT            — the client typed / selected it
    - DERIVED IMPLEMENTATION REQUIREMENT — an engineering task implied by a stated fact
    - OPEN QUESTION                 — something the client did NOT answer and we must ask
*/

export const NOT_PROVIDED = '_not provided_';

/** True if a value is meaningfully present (non-empty string / non-empty array). */
export function has(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Render a scalar client value or the explicit "not provided" marker. Never fabricates. */
export function val(value) {
  if (!has(value)) return NOT_PROVIDED;
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).join(', ');
  return String(value).trim();
}

/** Render a bullet list of client-provided values, or a single "not provided" bullet. */
export function bullets(arr) {
  if (!has(arr)) return `- ${NOT_PROVIDED}`;
  return arr.map((v) => `- ${String(v).trim()}`).join('\n');
}

/** Escape a value for safe inline Markdown (collapse newlines; leave text intact). */
export function inline(value) {
  if (!has(value)) return NOT_PROVIDED;
  return String(value)
    .replace(/\r?\n+/g, ' ')
    .trim();
}

/** Render a multi-line free-text field as a blockquote, or the not-provided marker. */
export function quote(value) {
  if (!has(value)) return NOT_PROVIDED;
  return String(value)
    .split(/\r?\n/)
    .map((l) => `> ${l}`)
    .join('\n');
}

/** yes/no/maybe -> human sentence, or not-provided. */
export function yesNo(value) {
  if (!has(value)) return NOT_PROVIDED;
  const map = { yes: 'Yes', no: 'No', maybe: 'Maybe / undecided' };
  return map[value] ?? String(value);
}

/** Header block shared by context + brief documents. */
export function docHeader(kind, record, directionInfo) {
  const dir = directionInfo(record.designSelection);
  return [
    `# After Hourz — ${kind}`,
    '',
    `- **Submission id:** ${record.id}`,
    `- **Client:** ${record.clientSlug}`,
    `- **Selected direction:** ${dir.name} (\`${dir.id}\`)${dir.tagline ? ` — ${dir.tagline}` : ''}`,
    `- **Status:** ${record.status}`,
    `- **Submitted:** ${record.createdAt}`,
    `- **Source:** ${record.source} D1`,
    `- **Generated:** ${new Date().toISOString()}`,
    '',
    '> GUARDRAILS: Every value below is taken verbatim from the client submission. Blank fields are',
    '> marked _not provided_ and are NOT filled in. No services, prices, locations, awards, or history',
    '> have been invented. SoCal lowrider brand — no NorCal/QUINCY references.',
    '',
  ].join('\n');
}
