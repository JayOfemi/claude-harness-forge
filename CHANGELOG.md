# Changelog

Fork-and-forget support surface: adopters diff against this file to see what changed upstream since their copy.

## Unreleased

- Docs: `using-the-forge.md` added, the best ways to use the layer after setup (where to open sessions, the one-line onboard, the two-word resume, what a gate block means, roles, captures, the publish-time sweep, promoting standards), sorted by when each habit starts paying off. The quickstart's agent path now ends setup by presenting that list, both helpers' closing print points at the doc, and the quickstart links it first among the next reads.
- Setup: the agent setup path now applies your settings itself, after showing its plan and getting an explicit yes in chat, via the merge tool's new apply mode. `tools/merge-settings.mjs --apply` merges straight into `~/.claude/settings.json` with the same printed changes and CONFLICT lines, backs the current file up to a timestamped folder first, and on any error exits with the file untouched.
- Hooks: the git gate's hard lines move out of the script into `hooks/hard-lines.txt`, plain text the gate reads on every check and quotes in its block message. An unfilled, missing, or unreadable file keeps the gate blocking gated operations and saying what to fix, so configuring the gate no longer means editing code, and a typo can no longer break the hook.
- Skills: `forge-rules` added and installed beside the onboarding skill, a rules interview that asks for your hard lines, never-publish list, role personas, and craft rules in plain words, writes each answer to its file, and echoes back every write. The quickstart's Fill your rules section, the agent setup procedure, and both helpers' closing print route to it.
- Download: `START-HERE.md` now ships at the top of the download, saying what this is, the three prerequisites, how to open a Claude Code session in the unzipped folder (with the wrapper-folder check), and the one sentence to paste. The quickstart carries the same session-opening help and wrapper check.
- Setup: `setup.cmd` added for Windows, a double-click way to run the helper (per-run policy bypass, the window stays open); the quickstart and README lead with it, and the documented terminal command is now the bypass form that works on a stock machine.
- Setup: a missing Node.js now stops both helpers up front, before anything is touched, instead of warning and continuing into a half-wired install; re-running after installing Node is safe.
- Onboarding: the skill now guards its one possible in-repo write. An existing `CLAUDE.md` in a repo that is its own workspace folder is never overwritten (the skill stops and asks), a brand-new pointer there is announced and consented, and a pasted folder with no git history gets a consent-gated `git init` offer instead of a dead stop.
- Docs: the quickstart now recommends a default path (let the agent do it) and orders the three paths to match the README.
- Settings: the deny examples now cover macOS and Linux credential stores and browser profiles alongside the Windows set (keychains and keyrings, SSH, cloud CLIs, npm and netrc, GPG, Docker, GitHub CLI, browser profile folders); entries for platforms you are not on match nothing and are safe to keep or trim.

## 1.4.0

- Setup: the workspace root now defaults to a `Forge` folder in your home folder; passing a path (`-Root` on Windows, `--root` on macOS or Linux) is optional and only needed to put it somewhere else. The quickstart, README, and by-hand commands follow the same default.
- Hooks: `dir-added-gate.mjs` added on the DirectoryAdded event (ships in Claude Code 2.1.219). Session orientation happens at session start, so a folder added mid-session (`/add-dir`) bypasses it; the gate warns when the added path matches one of your excluded workspaces (list them in the hook) and restates the rule layers when it is outside your root. Detection-only, never blocks.
- Settings: the template's deny examples now cover the common credential surfaces beyond browser data (SSH keys, cloud CLI configs, npm and netrc tokens, GPG, Docker and GitHub CLI credentials, the harness's own credentials file); the env block adds two more runaway caps (concurrent subagents 10, spawn depth 1); the allow examples include the `CLAUDE_REVIEWED=1` forms so a git command re-issued through the git gate does not re-prompt.
- Kit: the quickstart, the onboarding skill, and both setup helpers now offer the author's free companion toolbox on npm as the rest of the kit, via a selective one-command install (the wording lint, the pre-publish secrets scan, the model-delegation skill, and the ask-model, screenshot, and startup commands) that leaves the template's routing seats and `/model-routing` in place.
- Examples: the worked operator layer is trimmed to what transfers. Rules that pointed at standards the template does not ship (a vendor-specific web deploy workflow, a personal mobile dev target, a vendor email rule, an architecture default) are gone; the terminal, browser-tool, and broken-deploy rules are compressed to their transferable lesson; the server-logging example keeps the .NET worked pattern and drops the vendor-specific serverless half.
- Setup: both helpers now announce their plan before touching anything (what will happen and where) and close with a "where everything went" block that names your workspace root and the `~/.claude` folder by full path; the final next-step line names your workspace path instead of saying "your root".
- Docs: the quickstart states where setup writes before any command appears (the workspace root you choose plus Claude Code's `~/.claude` folder), and each path's commands are introduced with what they are about to do, written for a reader who did not build the template.

## 1.3.0

- Setup: `tools/setup.ps1` (Windows) and `tools/setup.sh` (macOS/Linux) added, a one-command helper that copies the template into your root, initializes git, installs the `~/.claude` pieces, and writes a settings file with your paths already filled in (forward slashes, so the JSON stays valid). Safe around an existing `~/.claude` and re-runnable: identical files are skipped, anything replaced is backed up first to a timestamped folder, and an existing `settings.json` is merged via the new `tools/merge-settings.mjs` (your settings kept, Forge entries added, every change printed; a true conflict resolves to the Forge value and is surfaced as a CONFLICT line).
- Docs: the quickstart is reorganized around three setup paths (let the agent do it, run one command, or by hand). It gains an agent-facing setup procedure for the first path and a path-safety note for the last (use forward slashes in the JSON settings, quote paths with spaces), so hand-setup stops breaking on Windows.
- Docs: how-it-works notes the setup helper is a convenience that moves files into place, not a runtime.

## 1.2.0

- Hooks: `reply-gate.mjs` added on Stop - a prose-length ceiling on each turn's final reply (default 300 words, `REPLY_GATE_MAX_WORDS` overrides; fenced and inline code stripped first). Blocks once with exact findings, then always passes the revision; quiet-degrades on infra errors. Its standard ships as `STANDARDS/reply-discipline.md`.
- Hooks: `token-report.mjs` added on Stop - each turn's full token spend (subagents and workflows included) as one systemMessage line, plus a daily JSONL spend ledger under `~/.claude/token-ledger/`. `token-handoff.mjs` added on UserPromptSubmit - surfaces the previous turn's cost inside the next reply, for hosts that do not render Stop-hook systemMessage output; consume-once, so a zero-cost turn never re-injects a stale count. Reporters, never gates.
- Model routing: the delegation switch ships, dynamic by default - four subagent seats (`subagents/`, installed to `~/.claude/agents/`) resolve when a spawn happens: nothing ever runs above the session's own tier, planning and review ride the session tier exactly, exploration stays on the cheap floor, and execution runs default-tier capped at the session. The `/model-routing` command (`commands/`) reports the seats, pins any of them to a fixed model (a pin is honored verbatim), frees them back to dynamic, or turns routing off; each seat self-reports the model it actually ran as. `STANDARDS/model-routing.md` gains the adopted-rails posture and an effort-before-tier escalation rung.
- Standards: `source-control.md` now carries the generic commit depth natively (outside-reader commits, stage-only-your-own-changes, the multi-repo check); `agent-conduct.md` routes commit depth there; `context-tiers.md` resolves the path-scoped-rules question (not adopted as the bank channel, with reasons; project-native use stays legal). The craft-globals shell gains a Reply discipline kernel and sheds startup coaching prose - the kernel-plus-pointer diet the tier model prescribes, applied to the layer itself.
- Settings: the `Agent(model:opus)` ask example removed - premium spawns are bounded by the env caps and each seat's self-report line; add your own ask rule per premium tier if you want the prompt back. The new hooks are wired in the settings template's Stop and UserPromptSubmit blocks.
- Docs: quickstart covers installing the routing seats and command, and its verify list gains the reply-gate, token-line, and routing-status checks; how-it-works' hook and tool rows and its gates walkthrough cover the new pieces; the constitution map gains the harness-install-sources row (`skills/` + `subagents/` + `commands/`); REBUILD's settings record and verification checklist cover the full wiring.

## 1.1.0

- Hooks: the git gate moves from an inline settings one-liner to `hooks/git-gate.mjs` and now fails closed; an internal error while a git command is in flight blocks by default instead of passing ungated. Plain non-git commands still pass on error.
- Hooks: `config-tripwire.mjs` added on the ConfigChange event, a detection-only notice whenever any settings source changes mid-session.
- Hooks: `instructions-audit.mjs` added on the InstructionsLoaded event; the write-back gate now also warns at stop when a session under your root never loaded the constitution.
- Settings: the template ships session caps on subagent spawns and web searches (25 and 50; the harness defaults are 200 and 200), an ask rule surfacing premium-tier subagent spawns, and example deny rules for OS credential stores and browser profile data.
- Docs: hook-authoring guidance added (never attach two input-rewriting PreToolUse hooks to the same tool; gates fail closed, detectors fail silent).
- Standards: the bootstrap standard's workspace-pointer step now writes the same three-layer pointer the onboarding skill writes; the style gate message grammar corrected.

## 1.0.1

- Standards: reworded the standards bank to a clean, metrics-free posture; the engineering guidance is unchanged.
- Docs: corrected the quickstart's hook-wiring step to reference the hooks already placed at your root, matching the shipped settings template.

## 1.0.0

- License: the template is MIT licensed; the LICENSE ships in the download.
- Sweep: `deny-sweep.mjs` gains `--allow <relpath>:<pattern>`, a printed, file-and-pattern-scoped sanction for content that must legitimately carry a listed string (a LICENSE needs its copyright holder). Never silent; the file still gets swept for everything else.
- Docs: `how-it-works.md` added, a human-readable overview of the parts and the path one ask travels end to end.
- Bootstrap: repo skeleton, the deny-sweep gate, the classification-driven build begins.
