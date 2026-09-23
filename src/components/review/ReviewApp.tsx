/*
  After Hourz — client review app (React island): a DYNAMIC GUIDED INTERVIEW.

  A non-technical shop owner answers ONE question per screen. The flow is:
    Welcome → the three looks → (branch-aware questions) → Review → Submit → Thank You hub.

  Progress is shown by SECTION (Design / About / Services / Your Work / Online Presence /
  Store / Project / Review), never "question 18 of 47". Branching skips whole questions based
  on the draft (no store / no booking / no domain / no google / "not yet" photos).

  Uploads persist in the draft (assets[]) across Back/Continue and are included on submit.
  The draft autosaves to localStorage. On a successful submit we keep only a minimal receipt;
  a returning visitor sees a WELCOME BACK hub (View Selected / View All / Review), NOT step 1.
  CHANGE MY SELECTION is an explicit amendment — a new submission, never a silent mutation.

  Contract: POST /api/review/submit { turnstileToken, submission }.
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
import {
  visibleQuestions,
  visibleSections,
  DIRECTIONS,
  PROTOTYPE_BASE,
  type StepId,
  type SectionId,
  type Updater,
} from './steps';
import type { AssetRef } from '../../lib/review/schema';
import { SummaryView } from './summary';
import { Turnstile } from './Turnstile';

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string }
  | { status: 'success'; receipt: StoredReceipt };

const SUBMIT_ENDPOINT = '/api/review/submit';

/**
 * A screen in the guided flow. Questions are `q:<id>`; the rest are fixed screens.
 * `design` is the "three looks" chooser. `summary` + `submit` bookend. `confirmation`
 * (the Thank-You hub) and `designs` (browse all) live after a successful submit.
 */
type Screen =
  | { kind: 'welcome' }
  | { kind: 'design' }
  | { kind: 'question'; id: StepId }
  | { kind: 'summary' }
  | { kind: 'submit' }
  | { kind: 'confirmation' }
  | { kind: 'designs' };

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

function scrollTop() {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function ReviewApp({ siteKey }: { siteKey: string }) {
  const [draft, setDraft] = useState<ReviewDraft>(() => emptyDraft());
  const [hydrated, setHydrated] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });
  const [screen, setScreen] = useState<Screen>({ kind: 'welcome' });
  /** true when the visitor came back after a prior submit and is amending. */
  const [amending, setAmending] = useState(false);
  const liveRef = useRef<HTMLDivElement | null>(null);
  /**
   * Focus target for the new screen's content. Without this, focus stays on whatever button
   * was just clicked (e.g. "Continue") — since nav buttons sit at the same DOM position across
   * screens, React can reuse that node, so the SAME button stays focused after navigating. A
   * stray Space/Enter keystroke (fast typing, a screen reader, switch access) then re-activates
   * it, silently skipping through several questions with nothing recorded. Moving focus to the
   * new screen's content on every navigation closes that hole and matches the "one thing per
   * screen" pattern's usual accessibility practice (e.g. GOV.UK Design System).
   */
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // ---- restore on load (draft + prior receipt) ----
  useEffect(() => {
    const existingReceipt = loadReceipt();
    if (existingReceipt) {
      // Already submitted on this device — land on the Thank-You / Welcome-Back hub.
      setSubmit({ status: 'success', receipt: existingReceipt });
      setDraft(loadDraft()); // keep whatever's around for a possible amendment
      setScreen({ kind: 'confirmation' });
      setHydrated(true);
      return;
    }
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  // ---- autosave (once hydrated; don't rewrite a cleared draft after success) ----
  useEffect(() => {
    if (!hydrated) return;
    if (submit.status === 'success' && !amending) return;
    saveDraft(draft);
  }, [draft, hydrated, submit.status, amending]);

  const update = useCallback<Updater>((section, patch) => {
    setDraft((d) => ({
      ...d,
      [section]: { ...(d[section] as object), ...patch },
    }));
  }, []);

  /** Replace a category's asset refs (used by inline uploaders). */
  const setAssets = useCallback((category: string, assets: AssetRef[]) => {
    setDraft((d) => ({
      ...d,
      assets: [...d.assets.filter((a) => a.category !== category), ...assets],
    }));
  }, []);

  /** Top-level free-text notes field (not section-shaped, so it bypasses `update`). */
  const setAdditionalNotes = useCallback((notes: string) => {
    setDraft((d) => ({ ...d, additionalNotes: notes }));
  }, []);

  // ---- the branch-aware visible flow for the current draft ----
  const questions = useMemo(() => visibleQuestions(draft), [draft]);
  const sections = useMemo(() => visibleSections(draft), [draft]);

  /** Ordered screens that make up ONE pass through the interview (excludes hub/designs). */
  const flow = useMemo<Screen[]>(() => {
    return [
      { kind: 'welcome' },
      { kind: 'design' },
      ...questions.map((q) => ({ kind: 'question', id: q.id }) as Screen),
      { kind: 'summary' },
      { kind: 'submit' },
    ];
  }, [questions]);

  const flowIndex = useMemo(() => {
    if (screen.kind === 'question') {
      return flow.findIndex((s) => s.kind === 'question' && s.id === screen.id);
    }
    return flow.findIndex((s) => s.kind === screen.kind);
  }, [flow, screen]);

  const goToScreen = useCallback((s: Screen) => {
    setScreen(s);
    scrollTop();
  }, []);

  const goToStepId = useCallback((id: StepId) => {
    // edit-jumps from the summary map onto a question screen (or the design chooser)
    if (id === 'design-review') {
      setScreen({ kind: 'design' });
    } else if (id === 'summary') {
      setScreen({ kind: 'summary' });
    } else {
      setScreen({ kind: 'question', id });
    }
    scrollTop();
  }, []);

  const goNext = useCallback(() => {
    if (flowIndex >= 0 && flowIndex < flow.length - 1) {
      goToScreen(flow[flowIndex + 1]);
    }
  }, [flow, flowIndex, goToScreen]);

  const goPrev = useCallback(() => {
    if (flowIndex > 0) goToScreen(flow[flowIndex - 1]);
  }, [flow, flowIndex, goToScreen]);

  // ---- gates ----
  const canLeaveDesign = draft.design.selection !== '';
  const phasesAcknowledged =
    draft.project.phase1Acknowledged &&
    draft.project.phase2Acknowledged &&
    draft.project.thirdPartyCostsAcknowledged;
  const validation = useMemo(() => validateDraft(draft), [draft]);

  // ---- current section (for the progress rail) ----
  const currentSection: SectionId | null = useMemo(() => {
    if (screen.kind === 'design') return 'design';
    if (screen.kind === 'summary' || screen.kind === 'submit') return 'review';
    if (screen.kind === 'question') {
      return questions.find((q) => q.id === screen.id)?.section ?? null;
    }
    return null;
  }, [screen, questions]);

  // ---- submit ----
  const doSubmit = useCallback(async () => {
    const parsed = validateDraft(draft);
    if (!parsed.success) {
      setSubmit({
        status: 'error',
        message: 'A couple of answers still need attention — please check the highlighted steps.',
      });
      return;
    }
    if (!turnstileToken) {
      setSubmit({ status: 'error', message: 'Please complete the quick check below first.' });
      return;
    }
    setSubmit({ status: 'submitting' });
    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ turnstileToken, submission: buildSubmission(draft) }),
      });
      if (!res.ok) throw new Error(`submit failed (${res.status})`);
      const data = (await res.json()) as { id?: string; submittedAt?: string };
      if (!data.id) throw new Error('no receipt id returned');
      const receipt: StoredReceipt = {
        id: data.id,
        submittedAt: data.submittedAt ?? new Date().toISOString(),
        selection: draft.design.selection,
        status: amending ? 'amended' : 'submitted',
      };
      saveReceipt(receipt);
      clearDraft();
      setAmending(false);
      setSubmit({ status: 'success', receipt });
      goToScreen({ kind: 'confirmation' });
    } catch {
      // NEVER clear the draft on failure — responses stay saved for retry.
      setSubmit({
        status: 'error',
        message: "We couldn't send your answers yet. Your responses are still saved — try again.",
      });
    }
  }, [draft, turnstileToken, amending, goToScreen]);

  // ---- announce screen changes for screen readers ----
  useEffect(() => {
    if (!liveRef.current) return;
    const label =
      screen.kind === 'question'
        ? `${currentSection ?? ''} section`
        : screen.kind === 'design'
          ? 'Choose your design'
          : screen.kind === 'summary'
            ? 'Review your answers'
            : screen.kind === 'submit'
              ? 'Send your answers'
              : screen.kind === 'confirmation'
                ? 'Thank you'
                : screen.kind === 'designs'
                  ? 'All three designs'
                  : 'Welcome';
    liveRef.current.textContent = label;
  }, [screen, currentSection]);

  // ---- move focus to the new screen on every navigation (see bodyRef comment above) ----
  useEffect(() => {
    bodyRef.current?.focus();
  }, [screen]);

  if (!hydrated) {
    return (
      <div className="ah-plaque rv-card">
        <p className="rv-lede">Loading your review…</p>
      </div>
    );
  }

  const receipt = submit.status === 'success' ? submit.receipt : null;

  // ------------------------------------------------------------------ HUB (post-submit)
  if (screen.kind === 'confirmation' && receipt) {
    return (
      <>
        <LiveRegion refEl={liveRef} />
        <div ref={bodyRef} tabIndex={-1} className="rv-focus-target">
          <ThankYouHub
            receipt={receipt}
            onViewAll={() => goToScreen({ kind: 'designs' })}
            onReview={() => goToScreen({ kind: 'summary' })}
            onChangeSelection={() => {
              // explicit amendment: reopen the interview at the design chooser. We do NOT
              // mutate the prior submission — a fresh submit creates a new/amended record.
              setAmending(true);
              setSubmit({ status: 'idle' });
              setTurnstileToken('');
              goToScreen({ kind: 'design' });
            }}
          />
        </div>
      </>
    );
  }

  // ------------------------------------------------------------------ BROWSE ALL DESIGNS
  if (screen.kind === 'designs') {
    return (
      <>
        <LiveRegion refEl={liveRef} />
        <div ref={bodyRef} tabIndex={-1} className="ah-plaque rv-card rv-focus-target">
          <h2>All three designs</h2>
          <p className="rv-lede">
            Here are the three looks again — open any of them full-screen to compare.
          </p>
          <div className="rv-previews">
            {DIRECTIONS.map((d) => (
              <DesignCard key={d.id} d={d} selected={draft.design.selection === d.id} />
            ))}
          </div>
        </div>
        <div className="rv-nav rv-nav--end">
          <button
            type="button"
            className="ah-btn ah-btn--ghost"
            onClick={() => goToScreen(receipt ? { kind: 'confirmation' } : { kind: 'design' })}
          >
            Back
          </button>
        </div>
      </>
    );
  }

  // ------------------------------------------------------------------ NORMAL FLOW
  let body: React.ReactNode = null;
  let nextDisabled = false;
  let nextLabel = 'Continue';
  let showNext = true;
  let showBack = flowIndex > 0;

  if (screen.kind === 'welcome') {
    showBack = false;
    showNext = false;
    body = (
      <div className="ah-plaque rv-card rv-welcome">
        <h2>Your After Hourz Website</h2>
        <p className="rv-lede">
          Hey Anthony — welcome. We took your brand, your custom work, and lowrider culture and
          built <strong>three different looks</strong> for the After Hourz website. They&apos;re all
          real, working web pages — same shop, three different feels.
        </p>
        <p className="rv-lede">
          Have a look at all three and pick the one that feels the most like After Hourz. After
          that, we&apos;ll walk through a few easy questions — one at a time — so we can build the
          site around what you actually need.
        </p>
        <p className="rv-hint">
          There are no wrong answers, and you don&apos;t have to know everything. Skip anything
          you&apos;re unsure about. Your place saves automatically on this device, so you can stop
          and come back anytime.
        </p>
        <button
          type="button"
          className="ah-btn ah-btn--candy rv-btn-full rv-welcome-cta"
          onClick={() => goToScreen({ kind: 'design' })}
        >
          View the Designs
        </button>
      </div>
    );
  } else if (screen.kind === 'design') {
    nextDisabled = !canLeaveDesign;
    body = (
      <div className="ah-plaque rv-card">
        <h2>Three looks for After Hourz</h2>
        <p className="rv-lede">
          Tap <strong>View Website</strong> to see the full page, then tap{' '}
          <strong>Choose This Direction</strong> on the one that feels most like the shop. You can
          change your mind later.
        </p>
        <div className="rv-previews">
          {DIRECTIONS.map((d) => (
            <DesignCard
              key={d.id}
              d={d}
              selected={draft.design.selection === d.id}
              onChoose={() => update('design', { selection: d.id })}
            />
          ))}
        </div>
      </div>
    );
  } else if (screen.kind === 'question') {
    const q = questions.find((qq) => qq.id === screen.id);
    if (!q) {
      // A branch removed this question (e.g. answer changed). Recover to the nearest screen.
      body = (
        <div className="ah-plaque rv-card">
          <p className="rv-lede">Let&apos;s keep going.</p>
        </div>
      );
    } else {
      body = q.render({ draft, update, goToStepId, setAssets, setAdditionalNotes });
      if (q.id === 'project-phases') nextDisabled = !phasesAcknowledged;
    }
  } else if (screen.kind === 'summary') {
    nextLabel = 'Continue to send';
    body = (
      <SummaryView
        draft={draft}
        onEdit={goToStepId}
        directions={DIRECTIONS as unknown as { id: string; name: string; no: string }[]}
      />
    );
  } else if (screen.kind === 'submit') {
    showNext = false;
    body = (
      <div className="ah-plaque rv-card">
        <h2>{amending ? 'Send your changes' : 'Send your answers'}</h2>
        <p className="rv-lede">
          One quick check to prove you&apos;re human, then hit send. You can still go back and edit
          anything.
        </p>

        {!validation.success && (
          <div className="rv-alert rv-alert--info">
            A couple of required items are still open (you must pick a design and read the project
            plan). Use Back to finish those.
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
            The quick check didn&apos;t load. Check your connection and reload the page.
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
              : amending
                ? 'Send my changes'
                : 'Send my answers'}
        </button>
      </div>
    );
  }

  return (
    <>
      <LiveRegion refEl={liveRef} />

      {/* SECTION progress rail (not a numeric counter) */}
      {currentSection && <SectionRail sections={sections} currentId={currentSection} />}

      <div ref={bodyRef} tabIndex={-1} className="rv-focus-target">
        {body}
      </div>

      {/* inline gate messages */}
      {screen.kind === 'design' && nextDisabled && (
        <p className="rv-field-error">Choose a direction to continue.</p>
      )}
      {screen.kind === 'question' && screen.id === 'project-phases' && nextDisabled && (
        <p className="rv-field-error">Please check all three boxes to continue.</p>
      )}

      {/* nav */}
      {(showBack || showNext) && (
        <div className={`rv-nav${!showBack ? ' rv-nav--end' : ''}`}>
          {showBack && (
            <button type="button" className="ah-btn ah-btn--ghost" onClick={goPrev}>
              Back
            </button>
          )}
          {showNext && (
            <button
              type="button"
              className="ah-btn ah-btn--candy"
              onClick={goNext}
              disabled={nextDisabled}
            >
              {nextLabel}
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function LiveRegion({ refEl }: { refEl: React.RefObject<HTMLDivElement | null> }) {
  return <div aria-live="polite" className="sr-only" ref={refEl} style={srOnly} />;
}

/** The section progress rail. Shows named sections, highlighting the current one. */
function SectionRail({
  sections,
  currentId,
}: {
  sections: { id: SectionId; label: string }[];
  currentId: SectionId;
}) {
  const idx = sections.findIndex((s) => s.id === currentId);
  const label = sections[idx]?.label ?? '';
  return (
    <nav className="rv-sections" aria-label="Your progress">
      <p className="rv-sections-current">
        <span className="rv-sections-step">
          Step {idx + 1} of {sections.length}
        </span>
        <span className="rv-sections-name">{label}</span>
      </p>
      <ol className="rv-sections-rail">
        {sections.map((s, i) => (
          <li
            key={s.id}
            className={`rv-section-dot${i < idx ? ' is-done' : ''}${
              i === idx ? ' is-current' : ''
            }`}
            aria-current={i === idx ? 'step' : undefined}
          >
            <span className="rv-section-label">{s.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * One website "look" — a scaled live preview (client-review mode via ?review=1), the
 * client-facing name, one plain "feel" sentence, and clear actions. Reused by the design
 * chooser and the browse-all screen. `onChoose` is omitted on browse-all (view-only).
 */
function DesignCard({
  d,
  selected,
  onChoose,
}: {
  d: { id: string; no: string; name: string; tagline: string };
  selected: boolean;
  onChoose?: () => void;
}) {
  const href = `${PROTOTYPE_BASE}/${d.id}/?review=1`;
  return (
    <div className={`rv-preview${selected ? ' is-selected' : ''}`}>
      <a
        className="rv-preview-frame"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open the ${d.name} website in a new tab`}
      >
        <iframe
          className="rv-preview-iframe"
          src={href}
          title={`${d.name} website preview`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
        />
        <span className="rv-preview-open" aria-hidden="true">
          Tap to open
        </span>
      </a>
      <div className="rv-preview-body">
        <div className="rv-preview-head">
          <span className="rv-preview-no">{d.no}</span>
          <span className="rv-preview-name">{d.name}</span>
        </div>
        <p className="rv-preview-tag">{d.tagline}</p>
        <div className="rv-preview-actions">
          <a
            className="ah-btn ah-btn--ghost rv-preview-btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Website
          </a>
          {onChoose && (
            <button
              type="button"
              className={`ah-btn rv-preview-btn ${selected ? 'ah-btn--ghost' : 'ah-btn--candy'}`}
              aria-pressed={selected}
              onClick={onChoose}
            >
              {selected ? '✓ Chosen' : 'Choose This Direction'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Post-submission hub. Never a dead end: view the selected design, view all, or review. */
function ThankYouHub({
  receipt,
  onViewAll,
  onReview,
  onChangeSelection,
}: {
  receipt: StoredReceipt;
  onViewAll: () => void;
  onReview: () => void;
  onChangeSelection: () => void;
}) {
  const selected = DIRECTIONS.find((d) => d.id === receipt.selection) ?? null;
  const returning = receipt.status === 'amended';
  const selectedHref = selected ? `${PROTOTYPE_BASE}/${selected.id}/?review=1` : null;
  return (
    <div className="ah-plaque rv-card rv-confirm">
      <h2>{returning ? 'Welcome back, Anthony' : 'Thank you, Anthony'}</h2>
      <p className="rv-lede">
        {returning
          ? 'Your review is in. Pick up right where you left off — your designs stay here whenever you want them.'
          : 'Your answers came through. We’ll take it from here and follow up on anything that needs a closer look.'}
      </p>

      <div className="rv-receipt" aria-label="Your confirmation number">
        {receipt.id}
      </div>
      <p className="rv-hint">
        Keep this number — it&apos;s your receipt for this review. Submitted{' '}
        {new Date(receipt.submittedAt).toLocaleString()}.
      </p>

      <div className="rv-hub-actions">
        {selectedHref && (
          <a
            className="ah-btn ah-btn--candy rv-btn-full"
            href={selectedHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            View My Selected Design{selected ? ` — ${selected.name}` : ''}
          </a>
        )}
        <button type="button" className="ah-btn ah-btn--ghost rv-btn-full" onClick={onViewAll}>
          View All Three Designs
        </button>
        <button type="button" className="ah-btn ah-btn--ghost rv-btn-full" onClick={onReview}>
          Review My Submission
        </button>
      </div>

      <hr className="ah-pinstripe" style={{ margin: '1.5rem 0' }} />
      <p className="rv-hint" style={{ marginBottom: '0.6rem' }}>
        Changed your mind on the look? You can send us an updated choice — it won&apos;t erase what
        you already sent.
      </p>
      <button
        type="button"
        className="ah-btn ah-btn--chrome rv-btn-full"
        onClick={onChangeSelection}
      >
        Change My Selection
      </button>
    </div>
  );
}
