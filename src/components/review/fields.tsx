/*
  After Hourz — accessible field primitives for the review questionnaire.
  Plain, controlled, label-associated inputs. No external UI deps.
*/
import { useId, useState } from 'react';
import { normalizeLinkOrHandle, type YNM } from './draft';

/**
 * Loose email shape check — a gentle nudge, not a hard gate (the field stays optional and the
 * schema doesn't enforce format either). A false negative is worse than a false positive here,
 * so this only flags input that's clearly not an email at all.
 */
export function looksLikeEmail(v: string): boolean {
  const t = v.trim();
  return t.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  error?: string;
}) {
  const id = useId();
  const hintId = props.hint ? `${id}-hint` : undefined;
  const errId = props.error ? `${id}-err` : undefined;
  return (
    <div className="rv-field">
      <label className="rv-label" htmlFor={id}>
        {props.label}
      </label>
      <input
        id={id}
        className="rv-input"
        type={props.type ?? 'text'}
        value={props.value}
        placeholder={props.placeholder}
        aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
        aria-invalid={props.error ? true : undefined}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.hint && (
        <p className="rv-hint" id={hintId}>
          {props.hint}
        </p>
      )}
      {props.error && (
        <p className="rv-field-error" id={errId}>
          {props.error}
        </p>
      )}
    </div>
  );
}

/**
 * A forgiving field that accepts a full link OR an @username. On blur we GENTLY normalize
 * (add https:// to a bare domain, keep an @handle as-is) but never mangle ambiguous input —
 * the original is preserved. Nothing is required.
 */
export function LinkOrHandle(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: React.ReactNode;
  placeholder?: string;
}) {
  const id = useId();
  const hintId = props.hint ? `${id}-hint` : undefined;
  return (
    <div className="rv-field">
      <label className="rv-label" htmlFor={id}>
        {props.label}
      </label>
      <input
        id={id}
        className="rv-input"
        type="text"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={props.value}
        placeholder={props.placeholder ?? 'Paste a link or type @username'}
        aria-describedby={hintId}
        onChange={(e) => props.onChange(e.target.value)}
        onBlur={(e) => {
          const normalized = normalizeLinkOrHandle(e.target.value);
          if (normalized !== e.target.value) props.onChange(normalized);
        }}
      />
      <p className="rv-hint" id={hintId}>
        {props.hint ?? 'A link or an @username both work — whatever’s easiest.'}
      </p>
    </div>
  );
}

export function TextArea(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const id = useId();
  const hintId = props.hint ? `${id}-hint` : undefined;
  return (
    <div className="rv-field">
      <label className="rv-label" htmlFor={id}>
        {props.label}
      </label>
      <textarea
        id={id}
        className="rv-textarea"
        value={props.value}
        placeholder={props.placeholder}
        aria-describedby={hintId}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.hint && (
        <p className="rv-hint" id={hintId}>
          {props.hint}
        </p>
      )}
    </div>
  );
}

/**
 * Multi-select chip group (checkbox semantics). With `allowOther`, an extra "Other" chip
 * reveals a free-text field on selection — its text is appended into `value` alongside the
 * standard picks, so nothing new is needed in the data model: any value not in `options` IS
 * the client's own custom entry. Never traps the client inside the predefined list.
 */
export function ChipGroup(props: {
  legend: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  allowOther?: boolean;
  otherPlaceholder?: string;
}) {
  const standard = props.value.filter((v) => props.options.includes(v));
  const custom = props.value.find((v) => !props.options.includes(v)) ?? '';
  const [otherOpen, setOtherOpen] = useState(custom.length > 0);
  const otherId = useId();

  const toggle = (opt: string) => {
    const next = standard.includes(opt) ? standard.filter((v) => v !== opt) : [...standard, opt];
    props.onChange(custom ? [...next, custom] : next);
  };

  const toggleOther = () => {
    if (otherOpen) {
      setOtherOpen(false);
      props.onChange(standard); // drop the custom text when "Other" is unchecked
    } else {
      setOtherOpen(true);
    }
  };

  const onCustomChange = (text: string) => {
    props.onChange(text.trim() ? [...standard, text] : standard);
  };

  return (
    <fieldset className="rv-field" style={{ border: 0, margin: 0, padding: 0 }}>
      <legend className="rv-label">{props.legend}</legend>
      {props.hint && (
        <p className="rv-hint" style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          {props.hint}
        </p>
      )}
      <div className="rv-options">
        {props.options.map((opt) => {
          const on = standard.includes(opt);
          return (
            <label key={opt} className={`rv-chip${on ? ' is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => toggle(opt)} />
              <span className="rv-chip-label">{opt}</span>
            </label>
          );
        })}
        {props.allowOther && (
          <label className={`rv-chip${otherOpen ? ' is-on' : ''}`}>
            <input
              type="checkbox"
              checked={otherOpen}
              aria-expanded={otherOpen}
              aria-controls={otherId}
              onChange={toggleOther}
            />
            <span className="rv-chip-label">Other +</span>
          </label>
        )}
      </div>
      {props.allowOther && otherOpen && (
        <input
          id={otherId}
          className="rv-input rv-input--other"
          type="text"
          value={custom}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={props.otherPlaceholder ?? 'Tell us what we missed…'}
          aria-label={`${props.legend} — other, please specify`}
        />
      )}
    </fieldset>
  );
}

/**
 * Single-select chip group (radio semantics), used for Yes/No/Maybe etc. With `allowOther`, an
 * extra "Other" chip reveals a free-text field — whatever the client types becomes `value`
 * directly (no data-model change needed; a value outside `options` IS the custom answer).
 */
export function RadioChips(props: {
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  allowOther?: boolean;
  otherPlaceholder?: string;
}) {
  const name = useId();
  const otherId = useId();
  const optionValues = props.options.map((o) => o.value);
  const isCustom = props.value !== '' && !optionValues.includes(props.value);
  const [otherOpen, setOtherOpen] = useState(isCustom);

  const chooseOther = () => {
    setOtherOpen(true);
    if (!isCustom) props.onChange('');
  };

  return (
    <fieldset className="rv-field" style={{ border: 0, margin: 0, padding: 0 }}>
      <legend className="rv-label">{props.legend}</legend>
      {props.hint && (
        <p className="rv-hint" style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          {props.hint}
        </p>
      )}
      <div className="rv-seg">
        {props.options.map((opt) => {
          const on = !otherOpen && props.value === opt.value;
          return (
            <label key={opt.value} className={`rv-chip${on ? ' is-on' : ''}`}>
              <input
                type="radio"
                name={name}
                checked={on}
                onChange={() => {
                  setOtherOpen(false);
                  props.onChange(opt.value);
                }}
              />
              <span className="rv-chip-label">{opt.label}</span>
            </label>
          );
        })}
        {props.allowOther && (
          <label className={`rv-chip${otherOpen ? ' is-on' : ''}`}>
            <input
              type="radio"
              name={name}
              checked={otherOpen}
              aria-controls={otherId}
              onChange={chooseOther}
            />
            <span className="rv-chip-label">Other +</span>
          </label>
        )}
      </div>
      {props.allowOther && otherOpen && (
        <input
          id={otherId}
          className="rv-input rv-input--other"
          type="text"
          value={isCustom ? props.value : ''}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.otherPlaceholder ?? 'Tell us what we missed…'}
          aria-label={`${props.legend} — other, please specify`}
        />
      )}
    </fieldset>
  );
}

export const YNM_OPTIONS: { value: YNM; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe' },
];

export function YnmField(props: {
  legend: string;
  value: YNM;
  onChange: (v: YNM) => void;
  hint?: string;
}) {
  return (
    <RadioChips
      legend={props.legend}
      hint={props.hint}
      options={YNM_OPTIONS}
      value={props.value}
      onChange={(v) => props.onChange(v as YNM)}
    />
  );
}

/**
 * A "do you have X?" question that is ALWAYS forgiving: Yes / I don't have one / I'm not sure.
 * Encoded onto the same YNM values (yes / no / maybe) so branching + schema stay unchanged.
 */
export function HaveItField(props: {
  legend: string;
  value: YNM;
  onChange: (v: YNM) => void;
  yesLabel?: string;
  noLabel?: string;
  maybeLabel?: string;
  hint?: string;
}) {
  const options: { value: YNM; label: string }[] = [
    { value: 'yes', label: props.yesLabel ?? 'Yes' },
    { value: 'no', label: props.noLabel ?? "I don't have one" },
    { value: 'maybe', label: props.maybeLabel ?? "I'm not sure" },
  ];
  return (
    <RadioChips
      legend={props.legend}
      hint={props.hint}
      options={options}
      value={props.value}
      onChange={(v) => props.onChange(v as YNM)}
    />
  );
}
