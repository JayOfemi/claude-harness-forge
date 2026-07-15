---
name: tracker-format
layer: agnostic
when_to_read: Creating, porting, or tidying any project's tracking dir; deciding what file a project doc becomes; writing a bible or session log
---

# Tracker format - what lives in Claude/<Codename>/ and what shape it takes

Compiled from best practice across a multi-project workspace (per-repo files and tracker roadmaps from mature projects, Private/ for sensitive docs, logs/Working from the family baseline). Every project conforms to this shape at port time; no project invents its own surrounding-docs format.

## The allowed tracker root - exactly this set, nothing else

| File / dir | Required? | What it is |
|---|---|---|
| `CLAUDE.md` | required | The bible (LAYER 2). Project facts, decisions, repo map, startup protocol, critical rules |
| `<repo>.md` | required for multi-repo projects, one per repo | Per-repo deep file: that repo's detail, roadmap-of-record pointers, release flow. Single-repo projects may inline this in the bible instead |
| `<repo>-roadmap.md` | OSS repos only | Roadmap for a public repo - internal planning never lives in an OSS repo (`repo-visibility.md`); PRIVATE repos keep `docs/RoadMap.md` in-repo instead |
| `STRATEGY.md` | optional, at most ONE | The project-level strategy file: philosophy, vision, market thinking, locked plans - all of it, as sections of this one file. PHILOSOPHY/VISION/market-map variants get folded into it at port (content verbatim, originals archived) |
| `Logs/session_logs.md` | required | Append-only session record. `## Session` headers (greppable). **One `## Session` header per sitting** - a new working session starts a new header, never appends under an old one; headers are the skim unit ("last 1-3 entries", `session-protocol.md`) and must resolve to ~1-3k tokens, not an era. Continuation within one sitting uses `###` subsections. **Every sitting's entry ends with a resume point** - the next session's first move, written before the session closes, carrying the open item's done-when where one exists (the pre-emption contract, `intent-intake.md`). A log whose tail outgrows the skim unit gets its old eras rotated to an archive file. History is never rewritten - stale paths in old entries stay as written |
| `Working/` | required | Scratch. TEMP, mass-deletable, never load-bearing (`workspace-layout.md`) |
| `Private/` | as needed | Durable for-operator's-eyes-only docs; syncs in the private tracking repo; never secrets (`workspace-layout.md`) |

Anything else found at a tracker root is drift: fold it into one of the above or archive it, at port time or on sight.

## Bible format (light requirements - voice is the project's own)

A bible must carry, in whatever structure suits the project: (1) project facts - codename, workspace path, repo list; (2) a **repo map** pointing at each `<repo>.md` (or inlining for single-repo); (3) a pointer to `STRATEGY.md` when one exists; (4) a **startup protocol** that names the three rule layers (constitution, craft globals, this bible) plus logs-skim and Working; (5) the project's critical rules. Per-repo depth belongs in the per-repo file, strategy in STRATEGY.md - the bible routes, it does not hold everything (same index-over-inline principle as the standards bank).

## Conformance path

- **At port (light touch):** fix paths and relative depths, add missing per-repo file pointers, ensure the startup protocol names the three layers, fold loose strategy docs into STRATEGY.md, archive nonconforming files. Do NOT rewrite a working bible's voice or section order.
- **Full re-template** (to the bootstrap bible templates in `project-bootstrap.md`): a later dedicated pass per project, with the operator - never bundled into the port session.

**Why**: one tracker shape means an agent cold-booting any project knows exactly which file answers which question - bible for rules, `<repo>.md` for repo depth, STRATEGY.md for why, Logs for history, Working for scratch, Private for operator-only.
