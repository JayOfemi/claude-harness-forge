---
name: session-protocol
layer: agnostic
when_to_read: Session start in any project, and after every compaction
---

# Session protocol - startup reading and ordering

**Standard - read in FULL, every session start and after every compaction. Every agent is ALWAYS aware of all three rule layers: the constitution (behavior + structure), the craft globals (wording + coding style), and its project's rules.**

1. The constitution (`<ROOT>/CLAUDE.md`) - auto-loaded for sessions rooted under the workspace root.
2. The craft globals (`<ROOT>/Claude/CLAUDE.md`) - wording, coding style, commit rules. Binding regardless of task type.
3. The project's bible (`<ROOT>/Claude/<Codename>/CLAUDE.md`) and **every pointer it references**, each in full.
4. Any SessionStart hook payload, including spilled-to-file output (`hook-*.txt` under the profile's projects directory for the current project). The inline preview is NOT enough.
5. `agent-conduct.md` (routed from INDEX) if the session will touch code, commits, or terminals.
6. Confirm once read and ready.
7. On the first nontrivial ask, run intent intake (`intent-intake.md`): enrich from state, declare the reading, capture the done-when.

**Skim is allowed for:**

- **Session logs** (`Claude/<Codename>/Logs/session_logs.md`): last 1-3 entries unless the task needs older context. Navigate with `Grep` on `^## Session` headers. If the log is missing, say so.
- Live trackers in `Claude/<Codename>/Working/` (temp space - see `workspace-layout.md`).
- For shipping projects: the in-repo `docs/RoadMap.md` or equivalent.

**Then**: standards pull just-in-time from `STANDARDS/INDEX.md` as the task touches them. Never bulk-read the standards bank.

**Project + memory binding**: a session belongs to its folder's project and loads THAT project's memory - never just the newest; ask if unclear. Full rule: the constitution's "Session orientation" section (named roles excepted).

**Cross-user check**: if the machine has multiple OS users who run agent sessions, memory and transcripts are scoped to the OS user profile that owns them. If running as a different OS user than recent sessions, list the same path under the other profile and mirror any newer memory files before continuing.

**NOT**: skimming the bible or constitution to "get going" - rules and hooks encode the answers a fresh model cannot infer from source code (vendor choices, wording style, family conventions). A skimmed startup ships drift; a recent session that looked correct anyway was luck.

**Why**: the startup read is the price of acting like the 12th session on the project instead of the 1st.
