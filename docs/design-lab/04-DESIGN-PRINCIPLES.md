# 04 — Design Principles

Ten rules. Every design decision must survive them. The Red Team (doc 14) uses this list as its
checklist. When two principles conflict, the earlier one usually wins.

---

### 1. Craft is the content
The finished work is the hero. UI serves the work; it never competes with it. If a screen has
nothing of the craft in it, ask what it's for.

### 2. Darkness is the canvas, light is the tool
We build depth from near-blacks (never flat `#000`) and reveal with controlled light. Color is a
light source, not decoration. See doc 07.

### 3. Restraint is a feature
Remove until it breaks, then add back one thing. Big quiet space is a deliberate choice, not
emptiness. If we can delete an element and the composition improves, delete it.

### 4. Precision is visible
True alignment, consistent rhythm, tabular numerals, real optical adjustments. Sloppiness reads
as sloppy work — the opposite of the brand. Nothing "roughly aligned."

### 5. Every element earns its place
Type sizes, colors, motions, and 3D must justify their existence against a job to do. "It looks
cool" is not a job. (3D has its own bar — doc 11.)

### 6. Motion communicates, or it's cut
Motion exists to reveal, orient, give feedback, or tell the story of the finish. Decorative
motion is removed. All motion respects `prefers-reduced-motion`. See doc 09.

### 7. It must be premium with the animation turned off
Static-first test: screenshot any screen with zero JS/motion. If it doesn't already read as
premium via composition, type, and material, the animation was hiding a weak design.

### 8. Truth over polish
Never fabricate work, facts, or credentials to make a screen look fuller. Real, modest, and true
beats impressive and false. Unknowns are marked `CLIENT INPUT REQUIRED`, not invented. See doc 01.

### 9. Performance is part of the design
A beautiful screen that janks or loads slowly is a failed screen. 60fps, fast LCP, minimal
layout shift, and accessibility are design requirements, not engineering afterthoughts. See doc 15.

### 10. Distinctive, not trendy
We extract principles from great work; we don't import this year's aesthetic. The test: would
this still look right in five years, and does it look like *After Hourz* specifically — not like a
template or a trend?

---

## The decision test (run before shipping any element)

1. Does it serve the craft/story? (P1) — if no, cut.
2. Can something be removed to improve it? (P3) — if yes, remove.
3. Is it precisely aligned and rhythmic? (P4)
4. Does it hold up with motion off? (P7)
5. Is everything on it true? (P8)
6. Does it stay 60fps / accessible / fast? (P9)
7. Is it distinctive to After Hourz, not a trend? (P10)

If it fails any, it doesn't ship until fixed — regardless of how impressive it is.
