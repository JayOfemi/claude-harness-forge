# The constitution

Canonical root for all project knowledge in this workspace: standards, agent roles, project trackers, project workspaces. Optimized for agent retrieval, not human browsing. Every agent operating anywhere under this root inherits this file and is bound by it.

**The headline rule, before everything else - change scope is sacred.** Stylistic and craft enforcement (wording rules, formatting, comment limits) binds the lines you write or rewrite; pre-existing violations in untouched lines STAY, even when you are editing all around them in the same file or class. A stylistic sweep buries the real change in review noise, and it bites hardest in mature codebases adopted into this layer late - which is exactly how this workspace started. Whole-surface cleanups happen only as their own explicitly requested task. The one exception: genuinely critical finds (a security hole, data loss) are not styling - surface or fix them per the fail-loud standard.

## The map

| Path | Contains | Go here when |
|---|---|---|
| `STANDARDS/` | Agnostic standards (files at root) + domain-specific in subfolders you add | Any "how do we do X" question. Entry point: `STANDARDS/INDEX.md` |
| `STANDARDS/INDEX.md` | One line per standard: triggers, path, gist | FIRST stop for any standards lookup. Loaded by the SessionStart hook |
| `STANDARDS/PROTOCOL.md` | How to read, update, add, promote standards | BEFORE writing to any standards file |
| `Agents/AGENT_ROLES.md` | Standing role charters | A session opens with "this session is <Role>" |
| `Agents/Notes/` | Dated freeform observations, assessments, research | Capturing non-actionable context worth keeping |
| `Agents/TODO/` | Dated actionable bullets (`YYYY-MM-DD.md`, append) | Capturing a task someone can pick up cold |
| `Claude/` | The tracker hub (its own git repo): per-project dirs (bible, logs, working) + `Claude/CLAUDE.md`, the CRAFT GLOBALS | Project status, history, decisions |
| `Claude/CLAUDE.md` | **Craft globals - your wording, coding style, and commit rules.** Binding on every agent, every session, alongside this constitution | ALWAYS read it: this file = how agents behave; that file = how the work is crafted |
| `Projects/` | Project workspaces (each holds a pointer file + one or more repos) | Working a project's code |
| `tools/` + `forge-manifest.json` | Workspace-structure tooling: the tracked composition manifest + the worktree composer | Materializing, completing, or unwinding a full workspace view (a bare root-repo worktree is an empty shell) |
| `Dump/` | The ONLY sanctioned dump ground; triaged periodically | You have a file with no defined home and no time to decide |

If a workspace must stay out of default reach (a day job, a client's code), give it its own map row that names the exclusion and the entry condition, and add its path to the root `.ignore` excludes - the row IS the rule.

## Core integrity rules (binding on every agent)

1. **Single source of truth.** Every fact has exactly one home. Anywhere else it appears, it appears as a pointer to that home. Never restate, never copy.
2. **Hierarchy is additive-only, parent wins.** Parent levels hold agnostic rules; child levels (domain folders, project bibles) may ONLY add rules for gaps the parent does not cover, and never silently restate or contradict a parent. An undeclared conflict means the parent is right and the child gets fixed.
3. **Overrides exist but are always dual-noted.** A child MAY override a parent rule going forward, but only by writing BOTH: a detailed note in the child file (what deviates, why, since when) AND a one-liner in the parent rule's own entry. An override noted in only one place is drift and gets reverted. Promote generality upward: if a rule you are writing into a child is true beyond that child's scope, it belongs in the parent instead.
4. **Placement is deterministic.** A standard lives in the most specific folder that covers ALL of its content; if it spans domains, it lives at their common parent. Place by the thing being standardized, not by who consumes it.
5. **Frontmatter on every knowledge file.** Schema in `STANDARDS/PROTOCOL.md`. A file without frontmatter is unrouteable and gets fixed on sight.
6. **Names are the retrieval surface.** `CAPS.md` = meta/protocol files (INDEX, PROTOCOL, CLAUDE). `kebab-case.md` = content, named so the file name answers "go find X". No `Legacy`, `Old`, `Final`, `v2`, `Copy` names - ever.
7. **Write targets by type.** Durable cross-project rule -> `STANDARDS/` per PROTOCOL. Project-specific fact -> that project's bible in `Claude/<Name>/`. Live scratch -> that project's `Working/` (deletable at any time). Actionable item -> `Agents/TODO/`. Observation -> `Agents/Notes/`. Anything unclassifiable -> `Dump/`.
8. **Nothing lands outside its home.** No loose files at the root, no scratch next to standards, no docs parked "for now" anywhere except `Dump/`. Unsure where something goes: put it in `Dump/` AND drop a TODO bullet so it gets triaged.
9. **`Dump/` is a holding pen, not storage.** Nothing may reference a `Dump/` path as a durable location. The housekeeper role triages it periodically; anything still there after triage gets routed or deleted.
10. **Read just-in-time.** Start from `STANDARDS/INDEX.md` (the hook supplies it), open the one or two standards the task touches, and stop. Never bulk-load standards or docs you do not need this session. The full loading law: `STANDARDS/context-tiers.md`.
11. **Leave it cleaner.** Any agent that notices drift (duplicate fact, stale pointer, misplaced file, missing frontmatter) fixes it if the fix is one obvious edit, or files a TODO bullet for the housekeeper if it is not. Structural moves (renames, relocations, deletions beyond `Dump/` triage) belong to the housekeeper role alone.

## Session orientation (which project, which memory)

A session loaded into a project working folder - the normal case, anything not booted at the root and not summoned as a named role (`Agents/AGENT_ROLES.md`) - **belongs to the project in that folder.** Assume that project is the work: read its bible and pointers and orient to it, not to a neighbor.

**Memory binds to the folder's project, never to recency.** Do NOT default to the newest or most-recently-touched memory - it may be the leftover of a different project's last session. Load the memory that matches THIS folder's project.

**When it is unclear, stop and ask - never guess.** If you cannot tell which project the session targets, or there is no memory for the project you were booted into, PAUSE and ask the user which memory to load. Never silently adopt an unrelated project's memory.

**Intent intake binds on every nontrivial ask** (kernel; depth in `STANDARDS/intent-intake.md`): reconstruct intent from the tracker state (bible, resume point, log tail, TODO) rather than interrogating the prompt; declare the reading in one line (a short editable echo-back for substantial work) and proceed; capture a machine-checkable done-when; ask only when irreversible or scope-changing ambiguity survives enrichment. Prompt quality never lowers the output bar.

## Root sessions (the orchestrator vantage)

A session booted at the root with no project named is the **orchestrator**: a high-level, read-only lens over every project - for peeking at per-project session logs and trackers, cross-cutting questions, status reports, and captures. Named standing roles (`Agents/AGENT_ROLES.md`) layer on top of these defaults.

1. **Read-only on substance; commit your own legitimate writes.** A root session never makes arbitrary changes to code or projects off the back of analysis or discussion; it analyzes and reports, and the real edit lands later in that project's own session. It never builds, installs, or deploys. The writes a root role legitimately makes (`Agents/TODO/`, `Agents/Notes/`, its charter file), it commits without asking per the commit rule; only the repos your craft globals name as auto-push are ever pushed by an agent.
2. **A capture is a reminder, not the action.** "We should update X's doc" means write the TODO bullet; the real edit happens later in that project's own session. Writing a note never licenses acting on its contents.
3. **Excluded workspaces stay excluded.** Vague or global commands ("status of everything") mean the governed projects ONLY. Engage an excluded workspace solely when the owner names it explicitly, and even then read-only unless the owner says otherwise. When in doubt, leave it out and say so.
4. **Hold the whole portfolio.** Never reason about one project in isolation - the goal at this level is convergence on the standards bank, so "would this diverge from how the rest do it?" is always in scope. Keep the map, not the territory: skim logs (last 1-3 sessions), pull a bible only when a question touches it.
5. **Search must see the whole tree by default.** The root repo gitignores the nested hub and project repos, which silently blinds git-aware search; a root `.ignore` re-includes them for ripgrep and search tools (excluded workspaces stay out by design and need explicit `rg --no-ignore <path>`). `git grep` sees only the root-tracked half - use ripgrep or the search tool. When completeness is load-bearing, re-run or list the directory.

## Pointers

- Standards routing: `STANDARDS/INDEX.md` | maintenance: `STANDARDS/PROTOCOL.md`
- Rebuild-from-nothing runbook + the outside-git wiring of record: `REBUILD.md`
- Roles: `Agents/AGENT_ROLES.md`
- Session startup, workspace shapes, agent conduct: routed from INDEX (`session-protocol`, `workspace-layout`, `agent-conduct`)
