---
name: source-control
layer: agnostic
when_to_read: Committing, branching, versioning, release tagging, or any repo-mechanics question; operator commit specifics stay at the craft globals
---

# Source control - commits, branches, versions, tags

> Commit-rule kernels and your operator specifics (message style, banned content) live at the craft globals (`Claude/CLAUDE.md`, "Commit rules"); the generic commit depth, branch naming, and the version and release-tag mechanics are native HERE.

## Commits

**Standard**:

- **Write commits for outside readers.** A dev reading `git log` cold has no context on internal tracking docs, chat sessions, or audit numbering - never reference those. No session-referential phrases ("this session", "follow-up on the last change"). Describe what changed and why. Professional and direct, not chatty.
- **Commit your own completed work in sensible chunks; stage only your own changes by explicit path, never blanket-commit a dirty tree.** The seven small steps of one task are usually one commit, not seven; a genuinely involved step, or a fully isolated one-liner, can stand alone. If unrelated changes are mixed into the tree and you cannot cleanly separate yours, do NOT commit - leave it dirty and say so.
- **Multi-repo check**: on commit, check every code repo the project spans PLUS its tracker dir, and commit in each that has changes; a tracker-prefix convention (for example `<Name>:` on tracker commits) keeps the hub log readable.

## Branches

**Standard**: `<YOUR-BRANCH-SCHEME>` - pick one shape and hold it everywhere. A shape that works: typed prefixes (`feature/`, `bug/`, `improve/`) plus a short kebab-case description; main stays releasable. Record your choice here once and stop re-deciding it per project.

## Versions and release tags

**Standard**:

- Semver. Patch for tweaks, minor for new features, major for breaking shifts. First public release ships at `1.0.0`.
- Meaningful releases get an ANNOTATED tag on the version-bump commit (pick one convention, for example `release-X.Y.Z`, and keep it uniform).
- Cadence is per-release or per-feature, never per-commit: bundle commits into one bump.
- Docs-only changes (nothing that affects the build output) skip the bump and tag entirely.
- **Agents tag only on the owner's explicit ask and never push a tag**; the tag stays local until the owner pushes it. If a project earns a standing exception (agent-created milestone tags), dual-note it per the constitution's override rule.
- Tag a milestone AFTER a live run confirms it works, not before - a tag on unverified work is a bookmark to a regression.

**Why**: branches and tags are the navigation surface of history; one uniform scheme means any agent can read any repo's state cold.
