/*
  After Hourz — the reusable QUESTION pattern for the guided interview.
  One question per screen for a non-technical shop owner. Structure (top to bottom):
    - title (plain language)
    - short explanation (why this matters, one line)
    - optional example (what a good answer looks like)
    - progressive disclosure: "Why we're asking" + "Where do I find this?"
      (collapsed by default; expanded state is announced for screen readers)
    - the input control (passed as children)
    - optional inline upload (passed as `upload`)
    - Back / Continue nav

  Visual system is untouched: plaque card (.ah-plaque .rv-card), .ah-btn plaque buttons.
*/
import { useId, useState } from 'react';

/** A single collapsible help panel. Announces expanded/collapsed to assistive tech. */
function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="rv-disclosure">
      <button
        type="button"
        className="rv-disclosure-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rv-disclosure-caret" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
        {label}
      </button>
      {open && (
        <div className="rv-disclosure-panel" id={panelId} role="region" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  );
}

export interface QuestionProps {
  /** Plain-language question title. */
  title: string;
  /** One short line: why this matters / what we'll do with it. */
  explanation?: React.ReactNode;
  /** A concrete example of a good answer. */
  example?: React.ReactNode;
  /** Progressive disclosure: the fuller "why". */
  why?: React.ReactNode;
  /** Progressive disclosure: where to find the answer (often with new-tab helper links). */
  where?: React.ReactNode;
  /** The input control(s). */
  children?: React.ReactNode;
  /** Optional inline uploader region (rendered under the input). */
  upload?: React.ReactNode;
}

export function Question({
  title,
  explanation,
  example,
  why,
  where,
  children,
  upload,
}: QuestionProps) {
  return (
    <div className="ah-plaque rv-card rv-question">
      <h2 className="rv-q-title">{title}</h2>
      {explanation && <p className="rv-lede rv-q-explain">{explanation}</p>}
      {example && (
        <p className="rv-q-example">
          <span className="rv-q-example-tag">For example</span> {example}
        </p>
      )}

      {(why || where) && (
        <div className="rv-disclosures">
          {why && <Disclosure label="Why we're asking">{why}</Disclosure>}
          {where && <Disclosure label="Where do I find this?">{where}</Disclosure>}
        </div>
      )}

      {children && <div className="rv-q-input">{children}</div>}
      {upload && <div className="rv-q-upload">{upload}</div>}
    </div>
  );
}

/**
 * A helper link that opens in a NEW TAB and never loses the client's progress
 * (target=_blank + rel noopener). Styled as an unobtrusive text/chip link.
 */
export function HelperLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="rv-helper-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="rv-helper-link-ext" aria-hidden="true">
        ↗
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
