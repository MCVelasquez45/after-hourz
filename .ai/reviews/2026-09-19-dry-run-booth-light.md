# Dry-Run Review — validation of the persona library — 2026-09-19

**Purpose (per §28):** verify the reviewer prompts produce *meaningfully different* perspectives, and
disagree when appropriate. If they all said the same thing, the prompts would be too weak.

**Artifact under review (a proposal, not built):**
> Homepage hero = a full-bleed **cinematic-band** using the client's blue-and-white classic Chevrolet
> **side profile (A-003, 1536×535)**, graded to near-black with one electric-blue rim light along the
> body line. Minimal type: wordmark **AFTER HOURZ** + one line ("custom paint · body · restoration").
> Content reveals from black on load. No nav visible until scroll.

Each persona applied its own prompt (`.ai/prompts/*`). Summaries below; note where they diverge.

---

## Creative Director — VERDICT: revise (idea is right, execution risk)
- **One-line thesis of the work:** "the finished line of a hand-built car, revealed out of the dark."
  That *is* Booth Light — on-thesis.
- **Why it belongs to After Hourz:** it centers the actual craft (a real client car, its body line) —
  not a stock hero. Good.
- **Strongest concern:** a single side-profile risks reading as *a car dealer / a car-show flyer*, not
  *a craftsman's finish*. The differentiator (paint depth, hand-built quality) isn't visible at hero
  scale from a side profile. Consider leading with a **macro paint/reflection detail** and letting the
  full profile be the second beat.
- **Remove-it candidate:** "no nav until scroll" — hiding nav is decoration, not story. Cut it.
- **Brand-drift check:** none. (Confirm the blue grade stays true to the real paint — don't stylize it
  cyber-blue.)

## Art Director — VERDICT: multiple P1/P2 blockers (mostly technical/compositional)
- **[P1] Resolution:** A-003 is 1536px wide — **too low for a full-bleed desktop/ultra-wide hero.** It
  will soften/artifact at ≥1440px. Fix: use it as a *narrow* cinematic band (not full-viewport), or
  reshoot at ≥4000px (`docs/10`). This blocks the full-bleed idea as specified.
- **[P1] Busy background:** the show background + "TOGETHER CAR CLUB" banner must be cropped/darkened
  (derivative only) or it reads amateur and implies third-party affiliation.
- **[P2] Crop/ratio:** side profile at 21:9 is strong horizontally but leaves awkward vertical space on
  mobile — needs a *different* mobile crop (front-quarter or a paint macro), not a shrink.
- **[P2] One key light:** ensure the blue rim light implies a single source; don't rim both ends.
- **Working/keep:** near-black grade + single accent + reserved type space is exactly right.

## Product Designer — VERDICT: revise (usability + comprehension gaps)
- **Comprehension:** a beautiful dark car + wordmark may **not tell a first-time visitor what the
  business does** fast enough. The one-line descriptor helps — keep it, make it legible (contrast on
  the dark grade). Don't let the reveal delay it.
- **[P1] Hidden nav:** "no nav until scroll" harms wayfinding and is bad on mobile/keyboard — visitors
  need an obvious path to *see work* and *make contact*. Nav must be reachable immediately.
- **Conversion:** where's the contact/quote path from the hero? A calm, visible entry (not a hard CTA)
  belongs here for a trust-based craftsman brand.
- **Mobile:** confirm the descriptor + a tap target are in the thumb zone; the 21:9 crop can't dominate
  a tall phone screen.
- **Truth:** confirm A-003 is Anthony's work before it anchors the homepage (`CLIENT INPUT REQUIRED`).

## Red Team — RECOMMENDATION: revise → conditional-approve (premises mostly survive, one is unproven)
- **Steelman:** dark cinematic hero of a real car = restrained, on-brand, differentiated from
  template shop sites. Reasonable.
- **Strongest argument against:** "dark hero + one accent + big wordmark" is **not inherently
  distinctive** — it's the current default for premium sites (Linear/Vercel-adjacent). Without the
  *craft detail* visible (paint depth, transformation), a competitor clones this in a day. The
  distinctiveness must come from the imagery being unmistakably *hand-built finish work*, not from the
  dark treatment.
- **Real risk vs taste:** RISK — **low-res source** (measurable: 1536px < 1440–1920 hero need) →
  full-bleed is technically unsupportable now. RISK — hidden nav hurts a11y/usability. TASTE — side vs
  macro is a judgment call.
- **Unverified assumptions (must test):** that A-003 is Anthony's work; that a graded low-res image
  looks acceptable even as a narrow band; that the reveal doesn't delay LCP/comprehension.
- **Conditions to approve:** (1) don't full-bleed A-003 — band or reshoot; (2) nav visible immediately;
  (3) lead-or-pair with a paint/detail macro to make craft visible; (4) verify attribution.

---

## Did the personas diverge? (the validation question)
**Yes — meaningfully:**
- **Creative Director** worried about *story/differentiation* (side profile reads dealer-ish; lead with
  detail) and killed "hidden nav" on **story** grounds.
- **Art Director** raised *technical/compositional* blockers the CD didn't: **resolution**, busy
  background, mobile crop, light direction.
- **Product Designer** raised *comprehension/usability/conversion* issues neither design role led with:
  first-time clarity, **nav reachability for wayfinding/a11y**, contact path, thumb zone.
- **Red Team** attacked the *premise* itself ("dark hero isn't inherently distinctive") and reframed
  everything as **risk vs taste with unverified assumptions** — a different axis again.

They converged only where they *should* (hidden nav is bad; verify attribution; near-black + single
accent is right) and diverged on their own concerns elsewhere. The library passes the §28 check.

## Consolidated action (if this proposal advanced)
1. [P1] Don't full-bleed A-003 — use a narrow band or reshoot ≥4000px (Art Director / Red Team).
2. [P1] Nav visible immediately (Product Designer / Creative Director).
3. [P2] Add/lead with a paint-detail macro so craft is visible (Creative Director / Red Team).
4. [P2] Distinct mobile crop, not a shrink (Art Director / Product Designer).
5. Verify A-003 is Anthony's work before it anchors the homepage (all).
