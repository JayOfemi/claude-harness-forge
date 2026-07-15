---
name: context-tiers
layer: agnostic
when_to_read: Deciding where a rule, doc, or fact should LOAD from (always vs hook vs just-in-time vs archive); writing or trimming any always-loaded file (constitution, craft globals, INDEX, bible, role charter, memory index); any context-tax or token-diet question
---

# Context tiers - what loads when, and what earns the always-on slot

Everything an agent might read sits in exactly one of four load tiers. Placement is deterministic: the tier follows from how the content must reach a session, never from how important it feels. This operationalizes the constitution's read-just-in-time rule and single-source law for the loading mechanism itself.

## The tiers

| Tier | Loads | Survives compaction | What belongs here |
|---|---|---|---|
| **1 Always** | at session start, in full: the root CLAUDE.md chain (constitution, craft globals, bible), memory index, skill descriptions | YES (re-injected from disk) | identity + orientation, integrity rules, high-stakes gates, routing pointers |
| **2 Hook** | mechanically injected: the SessionStart INDEX payload; hook messages | per event | routing tables; messages that GATE or DETECT, never re-teach |
| **3 JIT** | on trigger match: standards routed from INDEX, per-repo files, STRATEGY, memory files, research corpora | NO (dropped; reloads on next read) | depth: procedures, domain detail, per-task knowledge |
| **4 Archival** | never by default: dated Notes, meeting docs, rotated log eras, MIGRATION, superseded blocks | n/a | history: true-but-past status, rationale, provenance |

## Placement algorithm (apply in order, first match wins)

1. **Hard guarantee** (push bans, access boundaries, data-destroying operations)? Tier 1 verbatim, AND enforced mechanically where the harness supports it (hooks, permission rules). Prose is context, not enforcement; a session that reasons badly must still be physically unable to do the forbidden thing.
2. **Must it hold in a session that never opens a related file, including after compaction?** Tier 1, as a KERNEL - the rule in one or two lines - plus a pointer to its Tier 3 depth.
3. **Routing** (helps FIND, not do)? Tier 2 / an index surface. One line per target: triggers + gist + path.
4. **Needed only when the task matches a trigger?** Tier 3, with its trigger line added to the right index. A Tier 3 file must tolerate not being loaded; if it cannot, its kernel belongs in Tier 1.
5. **True but past** (status, history, superseded decisions, rationale)? Tier 4. Live files never carry ledgers: status lives in the roadmap and log, history in the log and archives.

## Budgets (chars/4 estimates; measure, never vibe)

- **Tier 1 core** (constitution + craft globals + INDEX payload + memory index + skill descriptions) targets **<= ~10k tokens combined**. Vendor guidance is under 200 lines per CLAUDE.md file, framed as an adherence cost, not only a token cost (code.claude.com/docs/en/memory, 2026-06).
- **Memory index**: <= 2 lines per entry (vendor precedent: only the first 200 lines / 25KB of an auto-memory index load).
- **Session-log tail**: the last 1-3 `## Session` entries must resolve to ~1-3k tokens (`tracker-format.md`, one header per sitting).
- **Bibles route, never hold**: no version ledgers, no status blocks beyond a routing line (`tracker-format.md`).
- Record measured before/after sizes with any diet; verify against the harness's own accounting (/context, /usage, the InstructionsLoaded hook) when available.

## Mechanics the tiers rest on (harness facts; re-verify at major harness releases)

- **@path imports expand at launch** - zero token savings. Plain paths and backticked paths are the free pointers.
- **Block-level HTML comments are stripped before injection** - maintainer notes ride free inside Tier 1 files.
- **Compaction re-injects only the root chain and unscoped rules.** Nested/subdirectory CLAUDE.md files and path-scoped rules do NOT re-inject; anything demoted out of Tier 1 must tolerate silently dropping out mid-session.
- **Skills**: name + description always load (lean descriptions per `skills-and-commands.md`); bodies load on invoke; front-load SKILL.md content (post-compaction keeps each skill's first ~5k tokens under a ~25k shared budget).
- **Subagents are context hygiene, not cost savings**: they run isolated (the built-in Explore/Plan even skip CLAUDE.md) and only the summary returns, but each agent re-pays its own load (~4x chat tokens per agent, ~15x for multi-agent fan-outs).
- **Cache economics**: reads ~0.1x base input, writes ~1.25-2x. A stable Tier 1/2 prefix is what makes always-on cheap mid-session; do not fragment Tier 1 across many small files (cache minimum ~1k tokens) and do not churn hook output or tool sets mid-session.
- **Path-scoped rules** (`.claude/rules/` with `paths:` globs) load only when a matching file is read - the native Tier 3 channel for domain standards. Candidate mechanism, not yet adopted; evaluate per domain before migrating INDEX-routed standards onto it.

## Why fewer, denser rules

On Claude models, file STRUCTURE (size, ordering, splitting, cross-file contradictions) shows no detectable adherence effect; what decays compliance is session length and many simultaneous constraints, and raw context length degrades output quality even when retrieval is perfect. Consequences: the Tier 1 budget buys FEWER, DENSER rules, not prettier structure; mid-session reinforcement comes from Tier 2 hooks that gate or detect; and long sessions are themselves a drift cost.

## NOT

- No restating a parent rule to "make sure it's seen" - that is what kernels + pointers exist for (constitution rule 1).
- No procedures in Tier 1 - a recurring procedure becomes a skill; deterministic automation becomes a hook.
- No hard guarantee living ONLY in prose when an enforcement surface exists for it.
- No status, history, or provenance riding in Tier 1 or Tier 3 files.
- No hook messages that re-teach rules the session already loaded.
- No structure polish sold as adherence work (evidence above).
- No new tier and no new always-on surface without this file gaining the entry first.

## Maintenance

- **After each major model or harness release**: audit Tier 1 for workaround rules the new model no longer needs, and delete them - instruction files accrete by default and rules written around an old model's limits become pure overhead (vendor org-scale guidance).
- Record your workspace's tier map and the ranked remaining diet moves in your audit record. The goal is to keep the rules that matter loaded at the lowest always-on cost.

**Why**: always-on context is paid by every session whether or not the task needs it, degrades quality as it grows, and burns the caps that gate throughput. A governance layer that tiers its own loading keeps the always-on core small while the depth waits behind the index.
