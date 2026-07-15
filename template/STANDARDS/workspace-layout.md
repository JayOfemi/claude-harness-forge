---
name: workspace-layout
layer: agnostic
when_to_read: Creating any file or folder outside a repo's src tree; scaffolding a project; deciding where a doc lives; any "where does X go" question
---

# Workspace layout - where every kind of thing lives

**Standard**: the root map (constitution `<ROOT>/CLAUDE.md`) is the top level. Below it, each project follows ONE shape:

```
<ROOT>/
  Projects/<Name>/                workspace (NOT a repo itself; holds repos only, plus the pointer)
    CLAUDE.md                     three-layer pointer (constitution, craft globals, bible)
    <codename>/                   the actual repo (private by default - repo-visibility.md)
      docs/                       project-important docs safe for anyone with repo access
      src/ ...
    <codename>-server/            optional sibling repo
  Claude/<Codename>/              tracking dir (the "bible" home; syncs in the private tracking repo)
    CLAUDE.md                     the bible: project-specific facts, decisions, pointers (LAYER 2)
    <repo>.md, STRATEGY.md, ...   the full allowed root set + bible format: tracker-format.md
    Logs/session_logs.md          append-only session log
    Working/                      scratch - TEMP, mass-deletable at any time
    Private/                      durable for-operator's-eyes-only docs (playbooks, drafts, audits) - NEVER in a project repo, NEVER temp
```

**One tracking dir per project**, even multi-repo projects (a project with four repos shares one `Claude/<Codename>/` with per-repo files per `tracker-format.md`). Never a second tracking dir for a sub-repo.

**Placement rules:**

- **`Working/` is temp.** Anything important to the project's long-term lifecycle does NOT live there - it lives in the repo's `docs/` or the tracker's `Private/`. `Working/` holds live progress trackers, research scratchpads, intermediate notes - the stuff that is fine to lose.
- **Repo-safe project docs** -> the repo's `docs/` folder, committed alongside source (assume anyone with repo access reads them; for OSS repos that means the public - `repo-visibility.md`).
- **Private-to-operator docs that must NOT ship** -> the tracker's `Private/` (`Claude/<Codename>/Private/`), durable and synced in the private tracking repo. Reference Working/ scratch from there as siblings (`../Working/<file>`). NEVER put secrets or credentials in `Private/` - it syncs; secrets live in env vars / CI secrets only.
- **Cross-project knowledge** -> `STANDARDS/` per its PROTOCOL. Never into a bible, never into a repo.
- **Role artifacts** -> `Agents/Notes/` (observations) and `Agents/TODO/` (actionables), dated per the constitution's map.
- **Everything else** -> `Dump/`, plus a TODO bullet so it gets triaged.

**Naming**: `CAPS.md` for meta/protocol files, `kebab-case.md` for content files, `YYYY-MM-DD` prefixes for dated captures, TitleCase for project dirs matching their existing names. Banned name fragments anywhere: `Legacy`, `Old`, `Final`, `v2`, `Copy`, `New`, `Junk`.

**Reference**: if you adopt this shape over an existing collection of projects, keep a port record (which project moved, when, what changed) as a CAPS meta file in the hub - it is the audit trail for every path that changed homes.

**NOT**: docs parked next to code "temporarily"; a `notes.md` at a repo root; tracking dirs inside workspaces; strategy docs loose at tracking-dir root (they go in the bible or get dated into `Working/` if scratch).

**Why**: deterministic placement means an agent can GUESS the path from the question and be right - retrieval becomes one hop instead of a search.
