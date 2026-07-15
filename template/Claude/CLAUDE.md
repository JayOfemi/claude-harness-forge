# Global CLAUDE.md - the craft globals

> **Two global layers, both binding, always.** The constitution (the root `CLAUDE.md`) plus the standards bank (`STANDARDS/`, start at `INDEX.md`) govern agent BEHAVIOR and workspace STRUCTURE. THIS file governs the CRAFT: your wording, coding style, and commit rules. Every agent, every session, is aware of both plus its project's rules - no task type is exempt. The two files cross-reference; neither replaces the other.

These rules bind every project in the hub, parent-wins per the constitution's integrity rules: project files only ADD rules for gaps; overrides are legal only dual-noted; an undeclared conflict means this file is right and the project file gets fixed.

**This file ships as a SHELL.** It is the always-loaded master for your craft rules - the single most expensive file in your context budget (`STANDARDS/context-tiers.md`), so every line must earn its slot. A complete worked example of a filled-in version lives at `examples/craft-globals-example.md` in the template repo: one operator's real rules, kept to show the shape. Steal the shape; replace the choices.

## Startup reading is mandatory

Every session start and after every compaction: read this file, the constitution, and the project's CLAUDE.md **in full** - plus every pointer the project file references and the entire SessionStart hook payload, including any spilled hook output file (the inline preview is not enough). Skim only session logs (last 1-3 `## Session` entries) and `Working/` trackers. The ordered checklist and mechanics: `STANDARDS/session-protocol.md`. Rules and hooks encode what a fresh model cannot infer from source; a skimmed startup ships drift. If you catch yourself thinking "I'll come back to this if needed," stop. Read them.

## Behavior rules

- **Change scope is sacred** (the constitution's headline rule): stylistic enforcement binds the lines you write or rewrite, never untouched lines around them.
- `<YOUR-HARD-GATES>` - the operations an agent must never do on its own initiative, verbatim, one bullet each. Typical shape: which repos an agent may push (name them; everything else is commit-only), whether agents run builds and tests or the owner does, any tool that requires an explicit per-use grant. Write these as the non-negotiables they are; the git gate in the hook pack should name the same lines.
- `<YOUR-COMMIT-DISCIPLINE>` - when agents commit, how they scope staging, what a commit is worth. A shape that works: commit your own completed work without asking, stage only your own changes by explicit path, never blanket-commit a dirty tree, keep the tree legible.
- `<YOUR-TERMINAL-AND-PLATFORM-RULES>` - the facts about your machine agents must not guess at (shell dialect, path conventions, encoding traps). Depth belongs in `STANDARDS/agent-conduct` when you write one.

## Coding conventions

`<YOUR-CONVENTIONS>` - braces, indentation, comment discipline, naming, constants. Keep each as a one-line kernel; when the depth outgrows one line, promote it into a `STANDARDS/coding-conventions.md` you create per PROTOCOL. Two rules worth stealing outright from the example: never remove unrelated comments, and fail loud, never silent (`STANDARDS/fail-loud.md` ships ready).

## Commit rules

`<YOUR-COMMIT-RULES>` - message style, what never appears in a commit (the example bans AI-attribution footers), how multi-repo projects commit, any tracker prefix convention.

## Audience and text

`<YOUR-WORDING-RULES>` - who reads your shipped text and what never appears in it. This section is the natural home of your style bans; wire the same rules into the style gate's rules file (`hooks/house-rules.mjs`) so the machinery enforces what the prose declares. The example file carries a full, battle-tested set.

## Stack defaults

`<YOUR-STACK>` - your locked toolkit, one line per layer, with the no-new-vendors principle (`STANDARDS/stack-policy.md`) doing the enforcement.

## Scope and maintenance

Project-specific facts (stack versions, branding, audience, domains, naming) live in that project's own CLAUDE.md, never here. A rule duplicated across 3+ project files gets proposed for promotion here; a rule here that stops applying to a project gets a dual-noted exception in that project file rather than a rewrite of this one.
