# STANDARDS protocol - how this bank is read, written, and kept clean

Read this BEFORE writing to anything under `STANDARDS/`. Reading standards needs only `INDEX.md`.

## Structure

```
STANDARDS/
  INDEX.md          router: every standard, one line. The only always-on file (hook-loaded)
  PROTOCOL.md       this file
  *.md              LAYER 0 - agnostic standards: true for every project, every stack
  Platform/*.md     LAYER 1 - cloud/vendor substrate: your cloud, CI, registries, DNS
  Web/*.md          LAYER 1 - web property specifics (frontend + its api/ folder)
  Mobile/*.md       LAYER 1 - mobile app specifics
  Mobile/iOS/, Mobile/Android/   LAYER 1.5 split points - a standard goes here ONLY when it is truly single-platform; cross-platform mobile rules stay in Mobile/
  Server/*.md       LAYER 1 - standalone backend service specifics
  <project bibles>  LAYER 2 - live in Claude/<Codename>/, NOT here; project-only facts
```

## The hierarchy law (from the constitution, applied here)

- A LAYER 1 file may only contain rules that are (a) specific to its domain and (b) not derivable from any LAYER 0 file. It may never state a rule that is true across domains - that rule gets written into LAYER 0 instead, by whoever caught it.
- A LAYER 2 bible may only contain project-specific facts and decisions. It may never silently restate or contradict a LAYER 0/1 standard.
- **Overrides are legal but dual-noted (constitution rule 3).** To deviate from a parent rule: write the detailed note in the CHILD file (what deviates, why, since when) AND the one-liner in the PARENT entry's `exceptions:` frontmatter or Exceptions line ("<child>: <half-line reason>"). Both or it does not count.
- An UNDECLARED conflict between layers: the parent is canonical, the child is the bug. Fix the child (or file the TODO).

## Frontmatter schema (required on every .md under STANDARDS/, except INDEX and PROTOCOL)

```yaml
---
name: cron-jobs                  # = file name minus .md
layer: agnostic | platform | web | mobile | server
when_to_read: One sentence; the task pattern that should trigger opening this file
refs: optional; canonical implementations (real project paths)
exceptions: optional; "<Project>: <reason>" entries granted per the hierarchy law
---
```

## Procedures

**Look up a standard.** Grep `INDEX.md` for your topic keywords -> open the routed file -> done. If INDEX has no line for it, grep `STANDARDS/` recursively once; if still nothing, there is no standard (see "Add" below, or proceed with explicit justification per `agent-conduct.md`).

**Update a standard.** Edit the canonical file in place. Keep the entry shape: **Standard** (what we do) / **Reference** (canonical implementation) / **NOT** (what we deliberately avoid) / **Why** (one line). If the one-line gist changed, update the file's INDEX line in the same session. Never fork a copy, never append a contradicting section below the old text.

**Add a standard.** A pattern earns a file once it is locked in 2+ projects (or the workspace owner declares it locked). Steps: (1) pick the layer by the placement rule - most specific folder covering ALL the content, spans -> common parent; (2) create `kebab-case.md` named so "go find X" hits it, with frontmatter; (3) add its one line to `INDEX.md` in the matching section. A standard nobody indexed does not exist.

**Promote a rule.** Found a generality sitting in a LAYER 1/2 file: move the text to the correct parent file, replace the original with nothing (if the parent now fully covers it) or a one-line pointer (if local context matters), update INDEX if gists changed. Log the promotion as a TODO-done note only if it changed meaning; silent moves are fine for verbatim promotions.

**Add a domain folder.** Only when a standard exists that fits no current domain and is not agnostic. Requires: 2+ standards that would live there, TitleCase name matching the existing set, INDEX section added. One orphan standard does not justify a folder - park it at the common parent until a sibling appears.

**Retire / supersede.** Standards are never deleted while any project still follows them. Mark the entry `**Superseded by**: <path>` at the top, keep the NOT/Why for history, update INDEX to route to the successor. Full removal only by the housekeeper role once no live project references it.

## Deep docs vs entry files

Some standards are one tight entry (cron-jobs). Some carry a full playbook (project-bootstrap, deploy-patterns, the lessons files). Both live as ONE file per standard - entry at top, depth below. Do not split a standard across files; retrieval must be one hop from INDEX. The lessons files (`web-lessons`, `mobile-lessons`, `server-lessons`) are append-only numbered logs: add new lessons at the bottom with the next number, never renumber, never rewrite old lessons (append a correction note instead).

## Path discipline

References to project code use the project's CURRENT home per the constitution's resolution table. At each project's cutover, the migration runbook sweeps those refs. References to standards, roles, notes, and todos always use workspace-relative paths.
