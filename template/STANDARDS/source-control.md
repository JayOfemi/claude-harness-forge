---
name: source-control
layer: agnostic
when_to_read: Branching, versioning, release tagging, or anything about repo mechanics beyond the commit rules themselves
---

# Source control - branches, versions, tags

> **Master for commit wording + rules: the craft globals** (`Claude/CLAUDE.md`, "Commit rules"). Those rules are NOT restated here. Branch naming and the version and release-tag mechanics are native HERE.

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
