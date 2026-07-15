---
name: repo-visibility
layer: agnostic
when_to_read: Creating any repo, changing a repo's visibility, or considering open-sourcing anything
---

# Repo visibility - private by default

**Standard**: Every repo is PRIVATE unless the workspace owner explicitly names it public or open-source. Going public requires BOTH, in order:

1. **Explicitly named by the owner.** No agent ever proposes-and-flips visibility; public or OSS status is granted by name, per repo, and recorded in this file's `exceptions:` frontmatter plus the project's bible.
2. **Pre-publish gate before anything public.** The repo passes a gatekeeper scan (automated or manual review: no secrets, no internal notes, no personally identifying material in committed history) BEFORE the first publish and before every release thereafter.

Once a repo is public, harden its platform settings (branch protection, code scanning, dependency alerts, secret scanning, Actions lockdown) per your `Platform/` standards.

Consequences of private-by-default:

- Repo `docs/` folders are readable by anyone with repo access - in a public repo that means everyone, so internal ops notes, roadmap rationale, pricing, and release process docs NEVER live in a public repo (they live in the tracker per `workspace-layout.md`).
- Owner's-eyes-only material lives in the tracker's `Private/` directory, never in any project repo of either visibility.
- Secrets live in env vars / CI secrets only - never in any repo, private or public.

**NOT**: flipping a repo public to "share a link"; public-by-default for tools and libraries; publishing from a repo that has not passed the pre-publish gate; treating a private repo as a safe place for secrets.

**Why**: private is the safe default for a portfolio with internal notes near code; the two-gate path (named + gatekeeper) makes going public a deliberate, audited act instead of a checkbox.
