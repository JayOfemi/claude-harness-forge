---
name: forge-onboard
description: >-
  Onboard a project into this governance layer: scan a repo that was pasted or
  cloned into Projects/, draft its bible from what the code actually shows,
  create its tracker and workspace pointer, register it in the composition
  manifest, and echo the reconstructed setup back for correction. Use this
  whenever the user pastes, clones, moves, or mentions adding a project to the
  workspace, asks to "register" or "set up" or "adopt" a codebase, or a folder
  appears under Projects/ with no CLAUDE.md pointer - even if they do not say
  "onboard".
---

# forge-onboard

Bring an existing project under governance in one pass. The output bar: after this runs, a cold session booted in the project's folder reads the three rule layers, lands on a bible that tells the truth about the codebase, and knows its resume point. The owner corrects a summary instead of writing documentation.

## The one rule above all

**This is a MATURE codebase being governed late.** The constitution's headline rule binds hardest here: you are describing the project, never restyling it. No formatting fixes, no wording sweeps, no "cleanup" of any kind inside the project's repo. The onboarding writes exactly three new surfaces (the bible, the tracker log, the workspace pointer) and touches nothing else.

## Procedure

### 1. Locate and confirm

Identify the project: the folder under `Projects/` the user named, or the one without a `CLAUDE.md` pointer. Inside it, find the repo or repos (dirs with `.git`). If the workspace folder IS the repo (no wrapper), note it - the pointer placement differs (step 5). If nothing under `Projects/` matches, say so and stop; never guess at a path.

### 2. Scan the reality (read-only)

Build the picture from the code, not from assumptions:

- **Stack**: manifest files (`package.json`, `*.csproj`, `pyproject.toml`, `go.mod`, `Cargo.toml`, lockfiles), frameworks in the dependency list, language versions pinned anywhere.
- **Layout**: the source shape (`src/`, `app/`, `lib/`, monorepo workspaces), where tests live, where docs live.
- **Conventions**: `.editorconfig`, linter and formatter configs, the dominant style visible in 2-3 representative source files (indentation, naming) - RECORD it, never judge it.
- **Gates** (`STANDARDS/review-gates.md`): what machine-checkable done-machinery exists - build and test scripts, CI workflows, hooks, coverage config. Name what is MISSING honestly; a gap named is a gap the bible can carry as a TODO.
- **Git state**: remote (or NONE - flag it, that is the loss surface), default branch, whether the tree is dirty.
- **Identity**: README first paragraph, the package description, anything that says what this thing IS.

### 3. Draft the bible - `Claude/<Name>/CLAUDE.md`

Per `STANDARDS/tracker-format.md` (the bible routes; depth stays in the repo's own docs):

- Identity: one honest paragraph on what the project is, from the scan. (Bibles are `CLAUDE.md` meta files and carry no frontmatter; any OTHER knowledge file you create carries the workspace's frontmatter schema per the constitution's rule 5.)
- Repo map: each repo, its remote, its purpose; per-repo files only if multi-repo.
- Startup protocol: the three layers in full (constitution, craft globals, this bible), then the project's own roadmap or README, then the log tail.
- Critical rules: what the scan PROVED (the test command, the build command, deploy mechanics if visible) plus `<FILL: the rules only the owner knows>` markers for what it could not - never invent rules a codebase does not show.
- The Gates line: the detected machinery, with gaps named ("Missing and named: no CI").

### 4. Create the tracker

`Claude/<Name>/Logs/session_logs.md` with Session 1 being this onboarding (what was detected, what was guessed), closing with a resume point: the first thing the owner or the next session should do (usually: correct the echo-back, fill the `<FILL>` markers). Plus `Working/` with a `.gitkeep`.

### 5. Write the workspace pointer

`Projects/<Name>/CLAUDE.md`: the standard three-layer pointer. If another project already has one, copy its shape; in a fresh workspace, use this template verbatim (adjust only the project name):

```
DO NOT SIMPLY ACKNOWLEDGE THIS POINTER AND MOVE ON. AT THE START OF EVERY SESSION AND AFTER EVERY COMPACT, READ ALL CONTENT INSIDE THE FILES THIS POINTER POINTS TO.

Read `../../CLAUDE.md` first (the constitution - agent behavior and workspace structure), then `../../Claude/CLAUDE.md` (the craft globals - wording, coding style, commit rules), then `../../Claude/<Name>/CLAUDE.md` for this project's rules, conventions, and startup protocol. All three layers are binding at all times. Those files are the source of truth - this one is just a pointer. If you cannot find any of them, say so in your response.
```

If the workspace folder is itself the repo, place the pointer INSIDE the repo root instead and note in the bible that the project predates the wrapper convention.

### 6. Register the composition

Run `node tools/forge-worktree.mjs init` from the root - AFTER step 5, because the manifest's glue scan reads the pointer you just wrote. If the manifest reports the project repo has NO remote, surface that in the echo-back - unpushed work is the adopter's loss surface (a missing remote on the ROOT repo just means the adopter has not pushed the workspace itself yet; mention it once, calmly). Commit the updated manifest together with the tracker files as the onboarding commit.

### 7. Echo back (intent intake, applied to onboarding)

End with a short, editable summary - not a question, a declaration the owner can correct in seconds:

```
Onboarded <Name>. Reading the codebase as: <stack>, <layout shape>, tests <state>, CI <state>.
Gates detected: <list>. Gaps named: <list>. Guessed and marked <FILL>: <list>.
Remote: <url or NONE - your loss surface>.
Correct anything above and I will fold it into the bible.
```

### 8. Offer the rest of the kit

If `~/.claude/skills/wording` or `~/.claude/commands/ask-model.md` is missing, close with one line offering the companion toolbox (a wording lint, a pre-publish secrets scan, a model-delegation skill, and the ask-model, screenshot, and startup commands):

`npx @jayofemi/toolbox add wording gatekeeper reroute-task ask-model screenshot startup`

Offer it, never run it unprompted; it writes into the user's `~/.claude`. If they say yes, run exactly that selective command. The catalog also carries generic copies of the routing seats and `/model-routing`, which would overwrite this workspace's wired versions without a backup, so never install those entries.

## Done-when

The pointer resolves to the bible; the bible passes the tracker-format shape; the manifest lists the repo; the session log carries the onboarding entry with its resume point; and the owner has seen the echo-back. Nothing inside the project's repo was modified.
