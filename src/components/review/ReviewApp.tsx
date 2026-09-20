/*
  After Hourz — client review app (React island).
  Multi-step questionnaire with progress indicator, versioned localStorage autosave,
  editable summary, Turnstile, and idempotent submit + retry. HTML-first shell renders
  server-side; this island hydrates over the no-JS fallback. Mounted with client:load.

  Contract: POST /api/review/submit with { turnstileToken, submission } where `submission`
  validates against reviewSubmissionSchema (validated client-side before send).
*/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadDraft,
  saveDraft,
  emptyDraft,
  loadReceipt,
  saveReceipt,
  clearDraft,
  buildSubmission,
  validateDraft,
  type ReviewDraft,
  type StoredReceipt,
} from './draft';
import { STEPS, COUNTED_STEPS, type StepId, type StepDef, type Updater } from './steps';
import { SummaryView } from './summary';
import { Turnstile } from './Turnstile';

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string }
  | { status: 'success'; receipt: StoredReceipt };

const SUBMIT_ENDPOINT = '/api/review/submit';

export default function ReviewApp({ siteKey }: { siteKey: string }) {
  const [draft, setDraft] = useState<ReviewDraft>(() => emptyDraft());
  const [stepIndex, setStepIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });
  const liveRef = useRef<HTMLDivElement | null>(null);

  // ---- restore on load (draft + prior receipt) ----
  useEffect(() => {
    const existingReceipt = loadReceipt();
    if (existingReceipt) {
      // already submitted on this device — jump straight to confirmation
      setSubmit({ status: 'success', receipt: existingReceipt });
      setStepIndex(STEPS.findIndex((s) => s.id === 'confirmation'));
      setHydrated(true);
      return;
    }
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  // ---- autosave every change (once hydrated; never overwrite with the seed) ----
  useEffect(() => {
    if (!hydrated) return;
    if (submit.status === 'success') return; // don't rewrite a cleared draft
    saveDraft(draft);
  }, [draft, hydrated, submit.status]);

  const update = useCallback<Updater>((section, patch) => {
    setDraft((d) => ({
      ...d,
      [section]: { ...(d[section] as object), ...patch },
    }));
  }, []);

  const step: StepDef = STEPS[stepIndex];

  const goToStepId = useCallback((id: StepId) => {
    const idx = STEPS.findIndex((s) => s.id === id);
    if (idx >= 0) {
      setStepIndex(idx);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const goPrev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---- gates (soft-nudge the two structurally-required steps) ----
  const canLeaveSelection = draft.design.selection !== '';
  const phasesAcknowledged =
    draft.project.phase1Acknowledged &&
    draft.project.phase2Acknowledged &&
    draft.project.thirdPartyCostsAcknowledged;

  const validation = useMemo(() => validateDraft(draft), [draft]);

  // ---- progress (counted steps only) ----
  const countedIndex = useMemo(() => {
    const countedIds = COUNTED_STEPS.map((s) => s.id);
    const pos = countedIds.indexOf(step.id);
    return pos; // -1 for welcome/confirmation
  }, [step.id]);
  const progressPct =
    countedIndex < 0
      ? step.id === 'confirmation'
        ? 100
        : 0
      : ((countedIndex + 1) / COUNTED_STEPS.length) * 100;

  // ---- submit ----
  const doSubmit = useCallback(async () => {
    const parsed = validateDraft(draft);
    if (!parsed.success) {
      setSubmit({
        status: 'error',
        message: 'Some answers still need attention. Please check the highlighted steps.',
      });
      return;
    }
    if (!turnstileToken) {
      setSubmit({ status: 'error', message: 'Please complete the verification below first.' });
      return;
    }
    setSubmit({ status: 'submitting' });
    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ turnstileToken, submission: buildSubmission(draft) }),
      });
      if (!res.ok) {
        throw new Error(`submit failed (${res.status})`);
      }
      const data = (await res.json()) as { id?: string; submittedAt?: string };
      if (!data.id) throw new Error('no receipt id returned');
      const receipt: StoredReceipt = {
        id: data.id,
        submittedAt: data.submittedAt ?? new Date().toISOString(),
        selection: draft.design.selection,
      };
      // success: keep ONLY a minimal receipt; drop the full questionnaire body
      saveReceipt(receipt);
      clearDraft();
      setSubmit({ status: 'success', receipt });
      goToStepId('confirmation');
    } catch {
      // NEVER clear the draft on failure — responses stay saved for retry
      setSubmit({
        status: 'error',
        message: "We couldn't send your answers yet. Your responses are still saved.",
      });
    }
  }, [draft, turnstileToken, goToStepId]);

  // announce step changes for screen readers
  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = `Step: ${step.title}`;
  }, [step.title]);

  if (!hydrated) {
    return (
      <div className="ah-plaque rv-card">
        <p className="rv-lede">Loading your review…</p>
      </div>
    );
  }

  // ---------- CONFIRMATION ----------
  if (step.id === 'confirmation' && submit.status === 'success') {
    const r = submit.receipt;
    return (
      <div className="ah-plaque rv-card rv-confirm">
        <h2>Got it — thank you, Anthony</h2>
        <p className="rv-lede">
          Your answers came through. We&apos;ll take it from here and follow up on anything that
          needs a closer look.
        </p>
        <div className="rv-receipt" aria-label="Your confirmation number">
          {r.id}
        </div>
        <p className="rv-hint">
          Keep this number. It&apos;s your receipt for this review — if you need to reach us about
          it, just mention it. Submitted {new Date(r.submittedAt).toLocaleString()}.
        </p>
      </div>
    );
  }

  // ---------- render current step ----------
  let body: React.ReactNode;
  let nextDisabled = false;
  let nextLabel = 'Next';
  let onNext: () => void = goNext;

  if (step.id === 'summary') {
    body = <SummaryView draft={draft} onEdit={goToStepId} />;
  } else if (step.id === 'submit') {
    body = (
      <div className="ah-plaque rv-card">
        <h2>Send your answers</h2>
        <p className="rv-lede">
          One quick check to prove you&apos;re human, then hit submit. You can still go back and
          edit anything.
        </p>

        {!validation.success && (
          <div className="rv-alert rv-alert--info">
            A couple of required items are still open (you must pick a design and read the project
            phases). Use Back to finish those.
          </div>
        )}

        <Turnstile
          siteKey={siteKey}
          onToken={(t) => {
            setTurnstileToken(t);
            setTurnstileFailed(false);
          }}
          onError={() => setTurnstileFailed(true)}
        />
        {turnstileFailed && (
          <div className="rv-alert rv-alert--error">
            The verification widget didn&apos;t load. Check your connection and reload the page.
          </div>
        )}

        {submit.status === 'error' && (
          <div className="rv-alert rv-alert--error" role="alert">
            {submit.message}
          </div>
        )}

        <button
          type="button"
          className="ah-btn ah-btn--candy rv-btn-full"
          onClick={doSubmit}
          disabled={submit.status === 'submitting'}
        >
          {submit.status === 'submitting'
            ? 'Sending…'
            : submit.status === 'error'
              ? 'Try again'
              : 'Submit review'}
        </button>
      </div>
    );
    // hide default next on submit step (submit button is the action)
    nextLabel = '';
  } else {
    body = step.render({ draft, update, goToStepId });
  }

  // gate transitions off selection / phases with a gentle inline message
  if (step.id === 'design-selection') {
    nextDisabled = !canLeaveSelection;
  }
  if (step.id === 'phases') {
    nextDisabled = !phasesAcknowledged;
  }
  if (step.id === 'summary') {
    nextLabel = 'Continue to submit';
  }

  const isFirst = stepIndex === 0;
  const showNext = step.id !== 'submit';

  return (
    <>
      <div aria-live="polite" className="sr-only" ref={liveRef} style={srOnly} />

      {/* progress */}
      <div className="rv-progress" aria-hidden={countedIndex < 0 ? 'true' : undefined}>
        {countedIndex >= 0 && (
          <>
            <div className="rv-progress-head">
              <span>Progress</span>
              <span className="rv-progress-step">
                Step {countedIndex + 1} of {COUNTED_STEPS.length}
              </span>
            </div>
            <div
              className="rv-progress-track"
              role="progressbar"
              aria-valuenow={countedIndex + 1}
              aria-valuemin={1}
              aria-valuemax={COUNTED_STEPS.length}
              aria-label="Review progress"
            >
              <div className="rv-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="rv-progress-title">{step.title}</div>
          </>
        )}
      </div>

      {body}

      {/* inline gate messages */}
      {step.id === 'design-selection' && nextDisabled && (
        <p className="rv-field-error">Pick a direction to continue.</p>
      )}
      {step.id === 'phases' && nextDisabled && (
        <p className="rv-field-error">Please check all three boxes to continue.</p>
      )}

      {/* nav */}
      <div className={`rv-nav${isFirst ? ' rv-nav--end' : ''}`}>
        {!isFirst && (
          <button type="button" className="ah-btn ah-btn--ghost" onClick={goPrev}>
            Back
          </button>
        )}
        {showNext && (
          <button
            type="button"
            className="ah-btn ah-btn--candy"
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextLabel || 'Next'}
          </button>
        )}
      </div>
    </>
  );
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
