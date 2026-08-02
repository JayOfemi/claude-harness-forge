# Quickstart

From zero to a governed workspace with your first project onboarded. Most of the setup is mechanical, so you can let one command or your agent do it, and spend your five minutes on the parts only you can decide.

## What you are setting up

A file-based governance layer for agent sessions. One root folder holds a constitution (behavior rules every agent inherits), a standards bank behind a grep-fast index (read just-in-time, not preloaded), per-project trackers (a bible of facts, a session log with resume points), named agent roles, and a small pack of enforcement hooks that gate and detect instead of reminding. The layer's job: whatever the prompt quality, sessions land on the right work, follow your rules, and leave a written trail.

Everything below assumes you have downloaded and unzipped the template (or cloned the repo), so you are sitting in a folder that contains `template/`, `docs/`, and `examples/`.

**Before you start**, you need Claude Code, git, and Node.js on your PATH. The enforcement hooks are small Node scripts, so without Node they will not run.

## Pick your path

Whichever path you pick, setup writes to exactly two places on your machine:

- **Your workspace root**: one new folder that the whole template is copied into. The constitution, the standards bank, the trackers, the hooks, and later your projects all live inside it. This guide calls it your root. By default it is a `Forge` folder in your home folder (`C:/Users/<you>/Forge` on Windows, `~/Forge` on macOS or Linux); every path below also lets you choose somewhere else.
- **Claude Code's `~/.claude` folder** in your user profile: the onboarding skill, the four model-routing seats, the `/model-routing` command, and your settings land there, because that is where Claude Code looks for them.

Three ways to set up, all reaching the same place. Skim them and pick one.

- **Run one command.** A helper does the mechanical steps and tells you what is left. Jump to [One command](#one-command).
- **Let the agent do it.** The no-terminal path. You open one session and it does the work. Jump to [Let the agent set it up](#let-the-agent-set-it-up).
- **Do every step by hand.** Full control, nothing hidden. Jump to [By hand, step by step](#by-hand-step-by-step).

Whichever you pick, you finish with the same short list of your-call decisions in [Fill your rules](#fill-your-rules), then onboard your first project.

## One command

A setup helper ships in the template. Run it with no arguments and it creates your root at the default, `Forge` in your home folder, then does the rest of the mechanical setup, announcing its plan before it touches anything and printing each step as it runs:

- Creates your root (the default, or the path you pass with `-Root` on Windows, `--root` on macOS or Linux) and copies the template into it, so the constitution `CLAUDE.md` sits at the top.
- Runs `git init -b main` there and makes the first commit.
- Installs the harness pieces into `~/.claude` (the onboarding skill, the four model-routing seats, the `/model-routing` command).
- Writes a `settings.generated.json` into your root with your paths and user already filled in, using forward slashes so the JSON is valid. If you have no `~/.claude/settings.json` yet, it writes one there too. If you already have one, it MERGES the Forge wiring into it: everything of yours stays, new entries are added, and where a value truly conflicts the Forge value wins and the script prints exactly what changed.

It is safe around an existing `~/.claude`: identical files are skipped, and anything it replaces (including your settings file before a merge) is backed up first to a timestamped folder it names in its output. Re-running it is safe.

Run it from the folder you unzipped into.

Windows (PowerShell):

```powershell
.\template\tools\setup.ps1
```

If PowerShell blocks the script, run it this way instead:

```powershell
powershell -ExecutionPolicy Bypass -File .\template\tools\setup.ps1
```

macOS or Linux:

```bash
bash template/tools/setup.sh
```

To put the workspace somewhere other than the default, add the path: `-Root D:/Forge` on Windows, `--root ~/somewhere/forge` on macOS or Linux.

It finishes by printing where everything landed and your remaining steps, which are the same ones in [Fill your rules](#fill-your-rules).

## Let the agent set it up

If you would rather not touch the command line, let the agent do the mechanical work. Open a Claude Code session in the folder you unzipped into and paste this:

> Read `docs/quickstart.md` and set up the Forge for me.

Add a line naming your root (for example "My workspace root is `D:/Forge`") only if you want it somewhere other than the default `Forge` folder in your home folder.

The agent follows the procedure below: it confirms the root with you before touching anything, does everything it can automatically, and hands back only the parts that need your input, chiefly your `settings.json` and your own rules.

### Agent setup procedure

This section is written for the agent running that request. If you are a person, it is also a plain description of what the agent is about to do.

1. **Confirm the root.** Restate the target root back to the user in one line before touching anything. If they did not give one, use the default, a `Forge` folder in their home folder, and name that path in the restatement.
2. **Copy the template.** Copy the contents of `template/` into the root so `CLAUDE.md` lands at the root. Do not restyle or "improve" any template file while copying; this layer's headline rule is that you touch only what you were asked to touch.
3. **Initialize git.** Run `git init -b main` in the root and make the first commit. If git is missing or the commit fails for lack of an identity, say so and move on; it is not a blocker.
4. **Install the harness pieces.** Copy `skills/forge-onboard/` into `~/.claude/skills/`, the `subagents/*.md` files into `~/.claude/agents/`, and `commands/*.md` into `~/.claude/commands/`.
5. **Draft the settings, then defer.** Read `.claude-settings-template.json` at the root. Produce the filled version by replacing `<ROOT>` with the root path in forward slashes (so the JSON stays valid), `<YOUR-TRACKER-HUB-PATH>` with `<root>/Claude`, and `<YOUR-USER>` with the OS user. Present the filled content to the user and ask them to save it as `~/.claude/settings.json` (or merge it into the one they have). Do not silently overwrite their global settings. Note that hooks take effect from their next session.
6. **Offer the rule surfaces.** Offer to fill `Claude/CLAUDE.md` from `examples/craft-globals-example.md` if they want a starting set, and to write their named roles into `Agents/AGENT_ROLES.md` and seed `deny-list.txt` from anything they give you. Leave `<YOUR-HARD-LINES>` in `hooks/git-gate.mjs` for them to state, since only they know their hard lines.
7. **Echo back, then hand over the keys.** Close with a short, editable summary of what was copied and installed, what you drafted and deferred (the settings), and the exact next action (apply the settings, then open a new session and onboard a project). End that same final message with the recommended ways of working from [`using-the-forge.md`](using-the-forge.md), one line per item (the action and what it buys), so the user finishes setup knowing how to drive the layer.

## By hand, step by step

Prefer to do it yourself. These are the same mechanical steps the helper runs.

1. **Create your root.** Pick a folder to hold everything; the commands below use the same default as the helpers, a `Forge` folder in your home folder (swap in another path if you want it elsewhere). It becomes your root, where the whole layer and later your projects live. Copy the contents of `template/` into it, so the constitution `CLAUDE.md` sits at the root. Run these from the folder you unzipped into.

   Windows (PowerShell), quoting the paths so spaces never bite:

   ```powershell
   New-Item -ItemType Directory -Force -Path "$HOME/Forge" | Out-Null
   Copy-Item -Path "template/*" -Destination "$HOME/Forge" -Recurse -Force
   ```

   macOS or Linux:

   ```bash
   mkdir -p ~/Forge && cp -R template/. ~/Forge/
   ```

   Then start the repo from your root. Swap `<your-root>` for the folder you just made. `-b main` needs git 2.28 or newer; on an older git, run `git init` then `git branch -M main` instead.

   ```bash
   git -C "<your-root>" init -b main && git -C "<your-root>" add -A && git -C "<your-root>" commit -m "Initial Forge workspace"
   ```

   One repo is the right start; the multi-repo split (tracker hub and projects as their own repos) is a later upgrade the composition manifest supports.

2. **Wire the harness.** Open `.claude-settings-template.json` at your new root and copy its hook wiring into your `~/.claude/settings.json`. Replace every `<ROOT>` with your root path, `<YOUR-TRACKER-HUB-PATH>` with `<ROOT>/Claude`, and `<YOUR-USER>` with your OS user name. Filling this file configures everything, including the write-back gate's paths, which ride as env vars on its command line.

   **Path safety, which is where hand-setup usually breaks.** This file is JSON, so a Windows path like `C:\Workspace` is not safe to paste, because the `\W` reads as a broken escape and the file will not load. Use forward slashes everywhere in this file instead, like `C:/Workspace`; they work the same in the hook commands. Keep the quotes around any path that has a space in it. So `<ROOT>` becomes `C:/Workspace` and `<YOUR-TRACKER-HUB-PATH>` becomes `C:/Workspace/Claude`. Your hooks already sit at `<ROOT>/hooks/` from step 1, which is where this wiring points. Hooks load at session start, so they take effect from your next session.

3. **Install the harness pieces.** From your new root, copy `skills/forge-onboard/` into `~/.claude/skills/` (the front door for every project you bring in), the four files in `subagents/` into `~/.claude/agents/` (the model-routing seats, dynamic by default: nothing runs above your session's tier, planning and review ride it exactly, sweeps stay cheap), and `commands/model-routing.md` into `~/.claude/commands/` (the switch that reports, pins, or frees those seats). The copies at your root stay as the source mirrors.

## Fill your rules

The mechanical setup is done. These are the parts no helper and no agent can invent, because they are your calls.

- **Your hard lines.** Open `hooks/git-gate.mjs` at your root and replace `<YOUR-HARD-LINES>` with the git operations an agent must never do alone (which repos it may push, whether it deploys, anything money-touching).
- **Your craft rules.** The craft globals at `Claude/CLAUDE.md` ship as a shell with `<YOUR-*>` sections; fill them with your style, commit, and gate rules. A complete worked example lives in the `examples/` folder from the download (`examples/craft-globals-example.md`), and its rule-pack for the style gate (`examples/house-rules-example.mjs`) drops into `hooks/house-rules.mjs` at your root if you want a battle-tested starting set. The constitution itself needs no editing to start.
- **Your roles** (optional now, worth doing soon). `Agents/AGENT_ROLES.md` ships with the full council and staff charters; give each a persona name from fiction you love. A named persona binds a session to its charter better than a job title does.
- **Your never-publish list.** Seed `deny-list.txt` next to `tools/deny-sweep.mjs` with your name, employer, internal project names, domains, and paths, so the sweep can catch them before anything goes public.

The full replacement order, and what not to customize early, is in [`customize-first.md`](customize-first.md).

## Onboard your first project

Paste or clone the project into `Projects/<Name>/<repo>/` inside your root. Open an agent session at your root and say: "onboard `<Name>`". The skill scans the code read-only, drafts the project's bible from what the code actually shows, creates the tracker and the workspace pointer, registers the repo in the composition manifest, and ends with an editable summary for you to correct. It will not restyle or "clean up" anything in your code; that is the layer's headline rule.

**Expected first-run output, so nothing alarms you:** the onboarding's manifest step prints a "NO remote" line for any repo without a configured remote. For your project repos that warning is real (unpushed work is your loss surface); for the root repo it just means you have not pushed the workspace itself yet.

With the first project in, the day-to-day habits that pay off from here (the two-word resume, letting the record write itself, the publish-time sweep) are in [`using-the-forge.md`](using-the-forge.md).

## Round out the kit

The template installs the governance pieces (the onboarding skill, the four routing seats, the `/model-routing` switch). The rest of the kit this layer was built alongside ships separately as a free companion toolbox on npm. It adds a wording lint for anything about to ship, a pre-publish secrets scan, a skill that delegates a task to a cheaper model, and commands for asking another model a question, capturing exchanges verbatim, and session startup. Add exactly those pieces with one command:

```bash
npx @jayofemi/toolbox add wording gatekeeper reroute-task ask-model screenshot startup
```

Run `npx @jayofemi/toolbox list` to see the catalog, or run it bare for an interactive picker. One caution if you pick by hand. The catalog also carries its own generic copies of the routing seats and `/model-routing`; the template's copies are the ones wired to your standards bank, and the toolbox overwrites without a backup, so leave those entries to the template.

## Verify it worked

- A new session at your root receives the standards INDEX automatically at start.
- An edit that introduces the demo marker `TODO-BEFORE-SHIP` gets blocked with a file-and-line finding; a clean edit passes silently.
- A `git commit` from an agent is stopped by the gate until it acknowledges your hard lines.
- A session opened in your project's folder reads the three rule layers and lands on the bible's resume point.
- A long-winded final reply (over 300 words of prose) is blocked once at stop with the word count; the compressed resend passes.
- After a turn that cost tokens, either a `Tokens this turn:` system line appears (hosts that render it) or the next reply ends with a `Tokens last turn:` line (the handoff hook covering hosts that do not).
- `/model-routing status` reports four dynamic seats once the agents are installed: cheap exploration, planning and review riding your session's own model, execution capped at it.
- Adding an unrelated folder mid-session (`/add-dir`) draws a notice that it sits outside your root; a path listed as excluded in `hooks/dir-added-gate.mjs` draws a louder warning.

## Where to go next

- [`using-the-forge.md`](using-the-forge.md) - the best ways to use the layer after setup, what you say day to day, and what each gate means when it fires.
- [`how-it-works.md`](how-it-works.md) - the parts of the machine and the path one ask travels through them, end to end.
- [`the-tier-model.md`](the-tier-model.md) - why this layer loads almost nothing by default, and where any new rule belongs.
- [`customize-first.md`](customize-first.md) - the replacement order for making the layer yours.
- `REBUILD.md` at your root - record your live wiring there as you change it; it is the only audit trail for what git cannot see.
