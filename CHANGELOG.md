# Changelog

Fork-and-forget support surface: adopters diff against this file to see what changed upstream since their copy.

## Unreleased

- Hooks: the git gate moves from an inline settings one-liner to `hooks/git-gate.mjs` and now fails closed; an internal error while a git command is in flight blocks by default instead of passing ungated. Plain non-git commands still pass on error.
- Hooks: `config-tripwire.mjs` added on the ConfigChange event, a detection-only notice whenever any settings source changes mid-session.
- Hooks: `instructions-audit.mjs` added on the InstructionsLoaded event; the write-back gate now also warns at stop when a session under your root never loaded the constitution.
- Settings: the template ships session caps on subagent spawns and web searches (25 and 50; the harness defaults are 200 and 200), an ask rule surfacing premium-tier subagent spawns, and example deny rules for OS credential stores and browser profile data.
- Docs: hook-authoring guidance added (never attach two input-rewriting PreToolUse hooks to the same tool; gates fail closed, detectors fail silent).

## 1.0.1

- Standards: reworded the standards bank to a clean, metrics-free posture; the engineering guidance is unchanged.
- Docs: corrected the quickstart's hook-wiring step to reference the hooks already placed at your root, matching the shipped settings template.

## 1.0.0

- License: the template is MIT licensed; the LICENSE ships in the download.
- Sweep: `deny-sweep.mjs` gains `--allow <relpath>:<pattern>`, a printed, file-and-pattern-scoped sanction for content that must legitimately carry a listed string (a LICENSE needs its copyright holder). Never silent; the file still gets swept for everything else.
- Docs: `how-it-works.md` added, a human-readable overview of the parts and the path one ask travels end to end.
- Bootstrap: repo skeleton, the deny-sweep gate, the classification-driven build begins.
