# 0007 — AI layer: `.ai/` + `CLAUDE.md` vs `.claude/` native

DECISION: Encode the design intelligence in a human/agent-readable **`.ai/`** layer, and use the
native **`CLAUDE.md`** project-instruction file as the routing entry point. Do **not** duplicate the
same content into `.claude/skills/` at this time.
CONTEXT: The environment (Claude Code) has a native mechanism — `CLAUDE.md` for project instructions
and `.claude/skills/<name>/SKILL.md` for invocable skills. The task specified an `.ai/` structure and
warned against duplicating systems (§0, §26).
OPTIONS:
- **`.ai/` as source of truth + `CLAUDE.md` router** (chosen).
- Put everything in `.claude/skills/` (rejected now — the `.ai/` prompts/skills are project design
  *documentation and procedures*, read by any agent/human, not general-purpose slash-command tools;
  forcing them into skill-invocation frontmatter would distort them).
- Maintain both in parallel (rejected — duplication → drift → entropy, exactly what §20/§26 warn about).
WHY: `CLAUDE.md` is the native, always-loaded routing layer and points agents into `.ai/` and
`docs/design-lab/`. This satisfies "integrate with the native mechanism rather than compete" while
keeping the specified `.ai/` structure and a single source of truth.
FUTURE: If we later want *invocable* slash-command skills (e.g. `/visual-qa`), promote specific
procedures into `.claude/skills/` as thin wrappers that reference the `.ai/skills/` files — wrappers,
not copies.
TRADEOFFS: `.ai/` procedures are not auto-invocable as slash commands yet; agents discover them via
`CLAUDE.md` routing instead. Acceptable for a documentation/intelligence layer.
STATUS: accepted
DATE: 2026-09-19
