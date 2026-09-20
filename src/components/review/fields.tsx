/*
  After Hourz — accessible field primitives for the review questionnaire.
  Plain, controlled, label-associated inputs. No external UI deps.
*/
import { useId } from 'react';
import type { YNM } from './draft';

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

/** Multi-select chip group (checkbox semantics). */
export function ChipGroup(props: {
  legend: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  const toggle = (opt: string) => {
    props.onChange(
      props.value.includes(opt) ? props.value.filter((v) => v !== opt) : [...props.value, opt],
    );
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
          const on = props.value.includes(opt);
          return (
            <label key={opt} className={`rv-chip${on ? ' is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => toggle(opt)} />
              <span className="rv-chip-label">{opt}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Single-select chip group (radio semantics), used for Yes/No/Maybe etc. */
export function RadioChips(props: {
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const name = useId();
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
          const on = props.value === opt.value;
          return (
            <label key={opt.value} className={`rv-chip${on ? ' is-on' : ''}`}>
              <input
                type="radio"
                name={name}
                checked={on}
                onChange={() => props.onChange(opt.value)}
              />
              <span className="rv-chip-label">{opt.label}</span>
            </label>
          );
        })}
      </div>
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
