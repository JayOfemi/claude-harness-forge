# Quickstart

From zero to a governed workspace with your first project onboarded. Budget: about five minutes of your attention plus one agent session.

## What you are setting up

A file-based governance layer for agent sessions. One root folder holds a constitution (behavior rules every agent inherits), a standards bank behind a grep-fast index (read just-in-time, not preloaded), per-project trackers (a bible of facts, a session log with resume points), named agent roles, and a small pack of enforcement hooks that gate and detect instead of reminding. The layer's job: whatever the prompt quality, sessions land on the right work, follow your rules, and leave a written trail.

## Steps

1. **Create your root.** Pick a folder that will hold everything (for example `C:\Workspace` or `~/workspace`). Copy the CONTENTS of `template/` into it, so the constitution `CLAUDE.md` sits at the root. Run `git init -b main` there and make the first commit. One repo is the right start; the multi-repo split (tracker hub and projects as their own repos) is a later upgrade the composition manifest supports.

2. **Wire the harness.** Open `.claude-settings-template.json` at your new root. Copy its hook wiring into your `~/.claude/settings.json`, replacing every `<ROOT>` with your real root path, `<YOUR-TRACKER-HUB-PATH>` with `<ROOT>/Claude` (until you ever split the hub into its own repo), and writing your own hard lines into the git gate's message (the operations an agent must never do alone; the `_instructions` key explains each placeholder, remove it when done). Filling the settings file configures everything, including the write-back gate's paths, which ride as env vars on its command line. Your hooks already sit at `<ROOT>/hooks/` from step 1, which is where this wiring points. Hooks load at session start, so they take effect from your NEXT session.

3. **Fill the two rule surfaces.** The craft globals at `Claude/CLAUDE.md` ship as a shell with `<YOUR-*>` sections: fill them with your own style, commit, and gate rules (a complete worked example lives in the template repo at `examples/craft-globals-example.md`, and its rule-pack for the style gate at `examples/house-rules-example.mjs` drops into `hooks/house-rules.mjs` if you want a battle-tested starting set). The constitution needs no editing to start.

4. **Name your roles** (optional now, worth doing soon). `Agents/AGENT_ROLES.md` ships with the full council and staff charters; give each a persona name from fiction you love. A named persona binds a session to its charter better than a job title does.

5. **Install the onboarding skill.** Copy `skills/forge-onboard/` into `~/.claude/skills/`. This is the front door for every project you bring in.

6. **Onboard your first project.** Paste or clone the project into `Projects/<Name>/<repo>/`. Open an agent session at your root and say: "onboard `<Name>`". The skill scans the code read-only, drafts the project's bible from what the code actually shows, creates the tracker and the workspace pointer, registers the repo in the composition manifest, and ends with an editable summary for you to correct. It will not restyle or "clean up" anything in your code; that is the layer's headline rule.

**Expected first-run output, so nothing alarms you:** the onboarding's manifest step prints a "NO remote" line for any repo without a configured remote. For your project repos that warning is real (unpushed work is your loss surface); for the root repo it just means you have not pushed the workspace itself yet.

## Verify it worked

- A new session at your root receives the standards INDEX automatically at start.
- An edit that introduces the demo marker `TODO-BEFORE-SHIP` gets blocked with a file-and-line finding; a clean edit passes silently.
- A `git commit` from an agent is stopped by the gate until it acknowledges your hard lines.
- A session opened in your project's folder reads the three rule layers and lands on the bible's resume point.

## Where to go next

- `docs/how-it-works.md` - the parts of the machine and the path one ask travels through them, end to end.
- `docs/the-tier-model.md` - why this layer loads almost nothing by default, and where any new rule belongs.
- `docs/customize-first.md` - the replacement order for making the layer yours.
- `REBUILD.md` at your root - record your live wiring there as you change it; it is the only audit trail for what git cannot see.
