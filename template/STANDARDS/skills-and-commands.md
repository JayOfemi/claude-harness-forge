---
name: skills-and-commands
layer: agnostic
when_to_read: Authoring a Claude Code skill or slash command (SKILL.md, commands/*.md), or deciding which of the two to build
refs: your private tooling repo (skills/, commands/) for versioned tooling; your public release repo if you publish tools; the skill-creator tool for the SKILL.md format and its description-optimization loop
---

# Authoring Claude skills and commands

**Standard**: how to build a Claude Code skill or command, and which to pick.

## Skill or command (the first decision)

A **skill** is invoked by the model on its own when a task matches its description, and can also be typed by name. A **command** runs only when the user types `/name`.

- Build a **skill** when it should fire automatically even if the user forgets (a wording linter catches bad text whether or not you ask).
- Build a **command** when the user initiates it deliberately (startup, screenshot, version-tag).
- A skill's `description` loads into context every session (a standing token cost); a command's `description` frontmatter appears to load as well in at least some harness surfaces (~26 tokens observed per command description in a subagent harness -- UNVERIFIED in a plain interactive session; verify with `/context` or `/usage` in a live session to check whether command descriptions occupy the listing budget). Default user-initiated rituals to commands; they are at worst a smaller standing cost than a full skill description, and zero on invocation.

## Where they live and install

Claude Code discovers `~/.claude/skills/<name>/SKILL.md` and `~/.claude/commands/<name>.md` (user level, every project), or the same under `<project>/.claude/`. Author and version private tooling in your private tooling repo (`skills/<name>/`, `commands/<name>.md`) and install with a copy step; public tools go through your public release repo, de-personalized and gatekeeper-gated first (see your `repo-visibility.md` and `public-release-pipeline.md` standards). De-personalization covers the commit message, not just the code. A commit that lands in the public repo carries no internal codename, no mention of the private upstream, and no internal process details.

## SKILL.md

Frontmatter `name` + `description`; the body is the procedure. The `description` is both the trigger surface and an always-in-context cost, so make it **lean but specific**: name the trigger categories, drop the "use it whenever / trigger even when" padding. Use a folded scalar (`>-`) when it contains colons or quotes. Scaffold and tune with the skill-creator tool; its description-optimization loop measures trigger rate.

## Command .md

Frontmatter `description`, `argument-hint`, `allowed-tools`. `$ARGUMENTS` or `$1` for args; `` !`cmd` `` injects live shell output (for example `` !`date` `` so the agent stops guessing the date); `@file` inlines a file. A command is a saved prompt the user fires.

## Bundled scripts

Zero-dependency Node ESM (`.mjs`), no build step, so it runs straight from `node` or `npx`. Export the core functions and guard the CLI entry (`import.meta.url === pathToFileURL(process.argv[1]).href`) so tests import them. Detect-only where you can; let the caller apply fixes.

## Source hygiene (learned the hard way)

- A tool whose own source must hold banned or loaded characters (a dash detector's regex, a secret scanner's patterns, dash or secret test fixtures) writes them as `\u` escapes or builds them at runtime by concatenation, so the source stays clean under your wording standard and a scanner does not flag its own patterns.
- If you parse SKILL.md frontmatter yourself, fold YAML block scalars (`>-`, `|`); a naive line parser prints the `>-` marker.
- Run the wording skill on every SKILL.md and command before shipping. Tests are `node:test` with runtime-built fixtures, and the user runs them (agents do not run tests or builds per `agent-conduct.md`).

**NOT**: a skill for something you always invoke deliberately (use a command, no standing cost); pushy multi-sentence descriptions (they cost context every session); a TypeScript-plus-build script for a small harness tool (zero-build `.mjs` runs from npx); literal banned characters (em dashes, secrets) in a detector's own source or fixtures (escape them or build them at runtime); a public skill that references a private standard or carries personal phrasing (inline the rules, use generic examples, gatekeeper-gate it); a public commit message that names an internal codename, the private upstream, or the internal release process.

**Why**: skills and commands are a recurring artifact; one authoring standard keeps the skill-vs-command call, the format, and the gotchas (lean descriptions, escaped source, folded YAML, de-personalization) consistent instead of relearned per tool.
