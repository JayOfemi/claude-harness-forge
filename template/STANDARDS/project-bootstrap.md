---
name: project-bootstrap
layer: agnostic
when_to_read: Starting any new project - the pipeline entry: locked decisions, scaffold steps, naming
---

# Project Bootstrap

> ## Singular goal of `STANDARDS/`
>
> **Shortest path from "let's build this" to "MVP done", as short as quality-preservation allows.**
>
> Every decision in this template (stack picks, deploy pipeline, UI patterns) is locked in advance so individual project sessions can focus on the *build*, not the *bikeshed*. New projects inherit a stable foundation and spend their session budget on what is unique to the app, not on re-deciding what the default structure should be.
>
> Deviations from locked decisions are allowed, but each deviation costs MVP velocity and must be justified in a one-paragraph note in the project's `CLAUDE.md`. If a deviation gets adopted twice, promote it into the template.

Procedure for setting up a new project's tracking dir + code workspace + initial repo from scratch. Triggered by user requests like "go setup project 'Adam'."

The bootstrap creates the **scaffolding** (folders, config files, skeleton CLAUDE.md / README / RoadMap) and makes an **initial commit**. It does NOT fill in detailed roadmap content or scaffold the actual app shell - those happen in subsequent sessions after the user provides direction.

---

## Locked decisions (don't re-debate per project)

Replace the rows below with your workspace's actual locked choices. Two neutral illustration rows are included to show the expected shape. Once you lock a decision here, individual project sessions treat it as settled.

| Decision | Lock | Reference |
|---|---|---|
| <YOUR-LOCKS> | | |
| <YOUR-LOCKS> | | |

Illustration (two example rows - replace with yours):

| Decision | Lock | Reference |
|---|---|---|
| Cloud provider | Single cloud for all infra | `Platform/cloud-provider.md` once added |
| Architecture default | Client-heavy, server only when required | `architecture.md` once added |

If a locked decision needs revisiting (new tech matures, a service gets superseded), update this table first, then the next bootstrapped project picks up the new default.

---

## Inputs needed

Before bootstrapping, confirm with the user:

1. **Codename** in PascalCase: e.g. `Atlas`, `NorthStar`. The repo subfolder uses the lowercase form (`atlas`, `northstar`).
2. **Type**: `web` or `mobile` (or another type you define for your workspace).
3. **One-line description**: what the app does in plain language for a non-technical reader. One sentence.

If any input is missing, ask the user before proceeding. Do NOT guess.

---

## Pre-flight checks

1. Confirm `Claude/{{Codename}}/` does not already exist. If it does, stop and ask the user.
2. Confirm `Projects/{{Codename}}/` does not already exist. If it does, stop and ask the user.
3. Confirm git identity is set (`git config user.name` and `git config user.email`).

---

## Procedure

Throughout, replace `{{Codename}}` with the PascalCase codename, `{{codename}}` with the lowercase form, `{{description}}` with the one-line description, and `{{date}}` with today's date in `YYYY-MM-DD`.

### Step 1: Create directories

```sh
mkdir -p <YOUR-ROOT>/Claude/{{Codename}}/Logs
mkdir -p <YOUR-ROOT>/Claude/{{Codename}}/Working
mkdir -p <YOUR-ROOT>/Projects/{{Codename}}/{{codename}}/docs
```

### Step 2: Write tracking dir files

`Claude/{{Codename}}/CLAUDE.md` - use the **CLAUDE.md (web)** template or **CLAUDE.md (mobile)** template below, depending on type.

`Claude/{{Codename}}/Logs/session_logs.md`:

```markdown
# {{Codename}} Session Logs

Per-session record of {{Codename}} work. Latest session at the bottom.

---

## Session 1 - {{date}}: Project bootstrap

First session. Tracking dir, code workspace, and initial repo created via the bootstrap procedure at `STANDARDS/project-bootstrap.md`.

Skeleton files only. Roadmap and README are placeholders awaiting user direction.

### What got built

- `Claude/{{Codename}}/` tracking dir: `CLAUDE.md`, `Logs/session_logs.md` (this file), `Working/.gitkeep`.
- `Projects/{{Codename}}/` code workspace: workspace `CLAUDE.md` pointer + `{{codename}}/` repo subfolder.
- `{{codename}}/` repo: `.editorconfig`, `.gitignore`, `.nvmrc`, `README.md` (skeleton), `docs/RoadMap.md` (skeleton).
- `git init -b main` + initial commit.

### Next session pickup

- Fill in `docs/RoadMap.md` based on user direction.
- Fill in `README.md` based on user direction.
- Decide on any open architectural questions.
- Stand up the actual app scaffold once roadmap is locked.
```

`Claude/{{Codename}}/Working/.gitkeep` - empty file.

### Step 3: Write workspace pointer

`Projects/{{Codename}}/CLAUDE.md`:

```markdown
Read `../../Claude/{{Codename}}/CLAUDE.md` for the project's rules, conventions, and startup protocol. That file is the source of truth - this one is just a pointer. If you cannot find this file, say so in your response.
```

### Step 4: Write repo skeleton

The repo lives at `Projects/{{Codename}}/{{codename}}/`. Write these files:

- `.editorconfig` - see template below.
- `.gitignore` - see **`.gitignore` (web)** or **`.gitignore` (mobile)** template below.
- `.nvmrc` - just `20` (or your current Node target).
- `README.md` - placeholder. See template below.
- `docs/RoadMap.md` - placeholder. See template below.

### Step 5: git init + initial commit

```sh
cd <YOUR-ROOT>/Projects/{{Codename}}/{{codename}}
git init -b main
git add .editorconfig .gitignore .nvmrc README.md docs/RoadMap.md
git commit -m "Initial repo scaffold: docs and config only"
```

This initial commit is part of the standard bootstrap and is implicitly authorized by the user invoking it. Do NOT push to a remote - the user creates the GitHub remote on their own.

### Step 6: Report back

Confirm what was created. Do NOT proceed with the actual app scaffold or fill in the roadmap until the user gives direction. Typical next message: "Bootstrap complete. Ready for direction on the roadmap and app shell."

---

## Build-phase commit cadence

After the bootstrap commit, when a multi-file build phase lands, commit in **batches as logical chunks complete** rather than waiting until the end of the session and shipping one mega-commit.

Why:

- A failed build is easier to bisect when commits are scoped to one concern.
- `git log` reads as a story of what landed, not as a single dump.
- If something gets cut short mid-session, partial work is already preserved.
- Future sessions can revert / reference specific batches without unwinding unrelated work.

Reasonable batch boundaries for a typical web build (each one is a `git add` + `git commit`):

1. **Build + entry**: package.json, tsconfig, bundler config, entry HTML, public assets, CI workflows, app entry file, global styles.
2. **Lib + seed data**: helper modules (Logger, Constants, ApiClient, custom hooks), seed data files.
3. **Shared components**: layout, navigation, footer, and shared UI components.
4. **Public pages**: top-level route pages (home, list views, detail pages, about, contact, forms, 404).
5. **Admin pages + routing**: admin-only routes and the final routing wire-up.
6. **Docs**: README.md and `docs/RoadMap.md` updates to reflect the current state.

Don't treat these as rigid boundaries. If two batches are tiny, fold them. If one grew large mid-build, split it. The point is multiple logical commits, not exactly six.

The same cadence applies to later phases. Each phase shipping in a single mega-commit is a smell.

Same multi-repo rule applies: each batch in the code repo, plus a commit in the Claude tracking dir at the end of the session for `Logs/session_logs.md` and `Working/*` updates. The tracking dir typically gets one commit per session even when the code repo gets several, since most tracking changes are the session log written at the wrap.

---

## File templates

### CLAUDE.md (web)

```markdown
# {{Codename}}

{{description}}

Internal codename: **{{Codename}}** (PascalCase). Repo and folder use lowercase **{{codename}}**.

Workspace at `<YOUR-ROOT>/Projects/{{Codename}}/`. Site repo at `{{Codename}}/{{codename}}/`.

## Purpose and positioning

(Fill in after user direction. Likely fields: portfolio piece vs standalone product, audience, public-facing name, monetization angle if any.)

## Where context lives

This file holds the rules and preferences. Source-of-truth elsewhere:

- `../Claude/{{Codename}}/Logs/session_logs.md` - session-by-session record.
- `../Claude/{{Codename}}/Working/` - live progress trackers and in-flight working docs.
- `{{Codename}}/{{codename}}/README.md` - repo-level dev quickstart.
- `{{Codename}}/{{codename}}/docs/RoadMap.md` - in-repo work tracker, stack notes, pre-deploy checklist.

When something here conflicts with one of the above, the above wins - update this file.

## Stack (LOCKED for web)

Same toolkit as <YOUR-REFERENCE-PROJECT>. No new vendors. (Fill in your locked web stack here per `STANDARDS/stack-policy.md`.)

## Architecture principle

**Client-heavy. Server only when required.** (Adjust if your workspace standard differs.)

## Startup protocol

- Read this file plus `../Claude/{{Codename}}/Logs/session_logs.md` and summarize the latest session. If the log exceeds context, summarize the last three headings and ask which to expand. If missing, say so.
- Read live working docs in `../Claude/{{Codename}}/Working/`.
- Read `{{Codename}}/{{codename}}/docs/RoadMap.md` for in-repo work tracker.
- Put research / progress / tracking artifacts in `../Claude/{{Codename}}/Working`. If missing, say so - don't auto-create.
- Confirm once read and ready.

## Critical rules

Craft and conduct come from the three rule layers; nothing is restated here. {{Codename}}-specific:

- **No new vendors / frameworks** unless the existing toolkit can't do it. If a gap exists, name it before proposing an addition.
- **Commits + pushes: per the craft globals.** Commit your own completed work in sensible chunks without asking (stage only your changes; never blanket-commit a dirty tree).
- **Multi-repo commits.** When you commit, check the site repo plus `../Claude/{{Codename}}/` and commit in each that has changes.
- **Claude repo commit prefix.** Commits to `../Claude/{{Codename}}/` get a `{{Codename}}:` title prefix.
```

### CLAUDE.md (mobile)

```markdown
# {{Codename}}

{{description}}

Internal codename: **{{Codename}}** (PascalCase). Repo and folder use lowercase **{{codename}}**.

Workspace at `<YOUR-ROOT>/Projects/{{Codename}}/`. App repo at `{{Codename}}/{{codename}}/`.

## Purpose and positioning

(Fill in after user direction. Likely fields: portfolio piece vs standalone product, audience, public-facing name, IAP / monetization angle, store positioning.)

## Where context lives

This file holds the rules and preferences. Source-of-truth elsewhere:

- `../Claude/{{Codename}}/Logs/session_logs.md` - session-by-session record.
- `../Claude/{{Codename}}/Working/` - live progress trackers and in-flight working docs.
- `{{Codename}}/{{codename}}/README.md` - repo-level dev quickstart.
- `{{Codename}}/{{codename}}/docs/RoadMap.md` - in-repo work tracker, stack notes, store-submission checklist.

When something here conflicts with one of the above, the above wins - update this file.

## Stack (LOCKED for mobile)

Same toolkit family across every mobile project. No new vendors. (Fill in your locked mobile stack here per `STANDARDS/stack-policy.md`.)

## Architecture principle

**Client-heavy. Server only when required.** Server-side is for things like receipt validation, AI proxy with hidden API keys, and multi-user shared state.

## Minimize platform-specific code paths

`Platform.OS` branches are sometimes unavoidable (native blur, navigation gestures, picker behavior, permission dialogs) but **default to one cross-platform implementation** and only fork when a specific surface visibly breaks on one platform. Reasoning:

- Two implementations doubles the maintenance surface for a single component.
- Most "other platform looks wrong" bugs are styling defaults you can solve generically without a platform check.
- Forks bit-rot: one branch evolves, the other goes stale, and the next dev only tests one.

When a fork is genuinely needed, write it with a comment that names the SPECIFIC issue (not "iOS only" or "Android quirk") so the next dev can re-test and collapse the fork when upstream fixes the bug. Keep both branches reading "this is the same component, slightly different paint."

## Startup protocol

- Read this file plus `../Claude/{{Codename}}/Logs/session_logs.md` and summarize the latest session. If the log exceeds context, summarize the last three headings and ask which to expand. If missing, say so.
- Read live working docs in `../Claude/{{Codename}}/Working/`.
- Read `{{Codename}}/{{codename}}/docs/RoadMap.md` for in-repo work tracker.
- Put research / progress / tracking artifacts in `../Claude/{{Codename}}/Working`. If missing, say so - don't auto-create.
- Confirm once read and ready.

## Critical rules

Craft and conduct come from the three rule layers; nothing is restated here. {{Codename}}-specific:

- **No new vendors / frameworks** unless the existing toolkit can't do it. If a gap exists, name it before proposing an addition.
- **Commits + pushes: per the craft globals.** Commit your own completed work in sensible chunks without asking (stage only your changes; never blanket-commit a dirty tree).
- **Multi-repo commits.** When you commit, check the app repo (and any sibling server repo) plus `../Claude/{{Codename}}/` and commit in each that has changes.
- **Claude repo commit prefix.** Commits to `../Claude/{{Codename}}/` get a `{{Codename}}:` title prefix.
```

### `.editorconfig` (both types)

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = tab
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_style = space
indent_size = 2
```

### `.gitignore` (web)

```
# Node
node_modules/
dist/
*.log
npm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Bundler
*.local

# Build artifacts
*.tsbuildinfo
```

### `.gitignore` (mobile)

```
# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# OS
.DS_Store
*.pem

# Local env files
.env*.local

# TypeScript
*.tsbuildinfo

# Generated native folders
/ios
/android

# IDE
.idea/
.vscode/
```

### README.md (placeholder, both types)

```markdown
# {{codename}}

{{description}}

## Status

Bootstrap complete. Roadmap and detailed README content pending user direction. See [`docs/RoadMap.md`](docs/RoadMap.md) for placeholders.

## Project tracking

Conventions, rules, session logs live at `../../../Claude/{{Codename}}/`. The workspace `CLAUDE.md` (one level up from this repo) points there.
```

### docs/RoadMap.md (placeholder, both types)

```markdown
# {{Codename}} Roadmap

Work tracker and stack notes for {{codename}}.

## Now

- **Bootstrap session.** Tracking dir at `../../../Claude/{{Codename}}/` and code workspace at `Projects/{{Codename}}/` created. Repo seeded with config and skeleton docs.
- Repo: local at `Projects/{{Codename}}/{{codename}}/`. No remote yet.

## Next

(Pending user direction. Typical first step: stand up the app scaffold and resolve any open architectural decisions.)

## Later

(To be filled in.)

---

## Stack notes

(Placeholder. Fill in after the scaffold session.)

## Before first deploy / submission

(Placeholder. To be filled in once the app scaffold is in place.)

## Things to watch for

(Placeholder. Lessons carried from prior projects get added here as they surface.)
```

---

## Notes

- The bootstrap is intentionally light. It creates the **structure** so the user can hand off context-rich direction next without re-explaining how files should be laid out.
- Detailed roadmap content (Phase 1 / 2 / 3, schemas, endpoints, deploy checklist) is filled in **after** the bootstrap, in the same or next session, based on user input.
- The Claude tracking dir (`Claude/{{Codename}}/`) is committed with the bootstrap scaffold per the commit rule (it is your own completed work).
- When in doubt about a per-project detail (mobile or web, codename casing, storage shape), ASK the user. Do not guess.
