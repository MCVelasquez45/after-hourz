# 0006 — Prompt-library provenance (f/prompts.chat)

DECISION: Treat the open-source `f/prompts.chat` ecosystem as a **reference for prompt structure and
technique**, adapt useful patterns into project-specific prompts, and keep our repository authoritative.
CONTEXT: We are building a reusable prompt/persona library. External libraries can inform structure
without dictating content.
OPTIONS:
- Adapt patterns, author locally (chosen).
- Import prompts wholesale (rejected — irrelevant bloat, external dependency for core knowledge,
  risk of third-party prompts overriding After Hourz rules).
WHY: We want a *small number of excellent, project-specific* capabilities (§26), not hundreds of
generic prompts. External libraries supplement; they do not define our system.
PATTERNS ADAPTED (not copied): expert-role framing ("you are the X, you own Y"); adversarial critique
(Design Critic / Red Team); structured analysis with explicit output schemas; "does this earn its
place?" review gating. These are common conventions, made specific to After Hourz's brand and docs.
TRADEOFFS: We forgo the breadth of a large external library in exchange for focus and authority.
Accepted.
RULE: No third-party prompt may override the guardrails in `CLAUDE.md` / `.ai/context/`.
STATUS: accepted
DATE: 2026-09-19
