---
name: agent-conduct
layer: agnostic
when_to_read: Every session start (routed from session-protocol); before any build, commit, push, deploy, or terminal command proposal
---

# Agent conduct - what agents do and never do

> **Master for the high-stakes gates: the craft globals** (`Claude/CLAUDE.md`, "Behavior rules" + "Commit rules"). NOT restated here - read them at the master: which repos agents push, whether agents run builds, the commit discipline, and every hard line your git gate names. This file carries only what is native to terminal-and-platform conduct.

**Standard** (native rules; adjust the placeholders to your machine and keep the shapes):

- **Paid or metered automation defaults to MANUAL dispatch** (cloud builds, store uploads, deploys, paid API jobs) unless the owner explicitly enables auto. One eager agent on an auto trigger is how real money burns unattended.
- **Every command proposed for the OWNER to run is a single line in its own code block.** No line continuations (backslash, backtick, caret); long is fine, multi-line is not - continuations mangle when pasted across terminals. Sequential commands go as separate single-line blocks, labeled in order.
- `<YOUR-TERMINAL-RULES>` - the facts about your shell and platform an agent must not guess at: the shell dialect and its traps, path conventions, and any encoding hazards. Worked illustration from one operator's Windows setup: PowerShell 5.1 misreads UTF-8 as legacy codepages when files round-trip through `Get-Content | Set-Content` (mojibake plus a BOM) and BOM-prefixes text piped to native processes - so files are edited with proper tools or BOM-safe APIs, never shell round-trips. Whatever your platform's equivalent trap is, write it here the first time it bites.

**Why**: the human-gated lines (push, deploy, spend) are where one eager agent burns real money or ships drift; the gates are cheaper than the cleanup.
