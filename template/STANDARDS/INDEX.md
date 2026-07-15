# Cross-Project Standards - INDEX

Canonical standards bank: `<YOUR-ROOT>/STANDARDS/`. This index is the ONLY standards content loaded every session - grep it for your topic, open the one or two routed files just-in-time, stop there. Paths below are relative to `STANDARDS/`. Rule layers, captures, and structure live in the constitution (`CLAUDE.md`) + `session-protocol.md`; writing to the bank starts at `PROTOCOL.md`. **When in doubt, do what you have done before** - new approaches need explicit justification BEFORE they ship (`stack-policy.md`).

Each line format: trigger keywords -> `file.md` - one-line gist. Keep it grep-fast; depth lives in the files.

## Agnostic (every project, every stack)

- context tax / token budget / always-loaded / load tiers / what loads when / context diet -> `context-tiers.md` - four load tiers (always/hook/JIT/archival); placement algorithm; Tier-1 kernels + pointers; budgets measured not vibed
- which model / route / escalate / delegate / subagent tier / fan-out size -> `model-routing.md` - strong on the bookends (plan+review), default in the middle, cheap on mechanical; escalation triggers; fan-out caps + recovery-before-rerun
- vague prompt / what does the user want / intent / clarify or proceed / intake -> `intent-intake.md` - reconstruct intent from tracker state, declare it in one line, proceed; ask only on irreversible ambiguity; resume-point pre-emption
- definition of done / gates / ready for review / done criteria / anti-gaming -> `review-gates.md` - every output type names machine-checkable gates; silent-when-clean, exact findings; human review is the final gate
- error handling / silent failure / swallowed errors / empty catch / fail open vs closed / default-on-missing -> `fail-loud.md` - fail loud not silent (closed for security/data); no empty catch, no default-on-missing-required, no success-on-failure; one narrow logged+justified exception
- session start / startup reads / which project / which memory / after compaction -> `session-protocol.md` - what to read in full vs skim, in order; bind to your folder's project + its memory, ask if unclear
- where does X go / folder layout / tracking dirs / Working temp / private docs -> `workspace-layout.md` - the canonical project + tracker shape; placement rules; Private/ in tracker; banned names
- commits / branches / semver / version bump / release tags -> `source-control.md` - commit rules live at the craft-globals master; your branch scheme; annotated release tags, owner-gated
- agent rules / builds / push / deploy / terminal / platform traps -> `agent-conduct.md` - hard gates live at the craft-globals master; metered automation manual by default; single-line owner commands; your shell's encoding traps
- vendors / frameworks / new library / stack defaults -> `stack-policy.md` - no new vendors unless the toolkit can't; the two acceptable answers; toolkit defined per workspace
- new project / scaffold / bootstrap / locked decisions -> `project-bootstrap.md` - the pipeline entry; full scaffold procedure + templates
- repo visibility / private / public / OSS / open source -> `repo-visibility.md` - private by default; OSS only when the owner names it AND a pre-publish gate passes
- tracker shape / bible format / per-repo files / strategy docs / session logs -> `tracker-format.md` - the exact allowed tracker root set; bible routes, depth in per-repo files; one `## Session` header per sitting
- claude skill / slash command / SKILL.md / agent tooling / skill vs command -> `skills-and-commands.md` - skill (auto-invoked, standing context cost) vs command (user-typed, free); lean descriptions; zero-build scripts; de-personalize for public
- lists / paging / infinite scroll / admin tables / feeds -> `pagination.md` - offset limit+offset server, FlatList + three guards client

## Platform (cloud/vendor substrate)

seeded by your first cloud or CI standard; see `examples/stack-standards/` for the shape

## Web

seeded by your first web-property standard; see `examples/stack-standards/` for the shape

## Mobile

seeded by your first mobile-app standard; see `examples/stack-standards/` for the shape

## Server

seeded by your first standalone-backend standard; see `examples/stack-standards/` for the shape

---

A pattern locks in across 2+ projects -> it gets a file and a line here, per `PROTOCOL.md`. This index carries triggers + one-line gists ONLY; depth lives in the files.
