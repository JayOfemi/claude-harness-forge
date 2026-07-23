# The Forge

A governance layer for Claude Code. Blocking enforcement hooks, a routed standards bank, multi-project trackers with resume points, model routing that sends each stage of work to the right tier, and a token counter that reports what every turn cost. Free, MIT.

Download and a full walkthrough live at **[forge.jayofemi.com](https://forge.jayofemi.com)**.

## The problem it solves

`CLAUDE.md` is advisory. The agent reads it, weighs it against everything else in the prompt, and sometimes drops the rule that mattered. It drifts off your conventions, forgets what the last session learned, or restyles code you never asked it to touch.

The Forge moves the load-bearing rules out of advisory text and into mechanical gates. A rule that matters is enforced by a hook that blocks the tool call, whether or not the session remembers it.

## What is in the box

The Forge is files. There is no server, no background process, and no account. Copying the folders is the install; deleting them is the uninstall. Claude Code supplies the intelligence; the Forge supplies written law, durable memory, and mechanical checks.

| Part | Where | What it does |
|---|---|---|
| The constitution | `CLAUDE.md` at your root | Behavior rules every session inherits: the workspace map, the integrity rules, session orientation, and the headline rule that the agent touches only what it was asked to touch |
| The craft globals | `Claude/CLAUDE.md` | Your always-loaded style, wording, and commit law. Ships as a shell you fill in; a complete worked example is in `examples/` |
| The standards bank | `STANDARDS/` | One file per "how we do X", each behind one routing line in `INDEX.md`. Sessions read the index every time and open only the one or two standards the task touches |
| Project trackers | `Claude/<Project>/` | Per-project memory: a bible of facts and decisions, plus a session log where every sitting ends with a resume point |
| The roles | `Agents/AGENT_ROLES.md` | Charters for a council (a chair, a skeptic, a treasurer) and staff you summon by name to stress-test plans or keep the workspace clean |
| The hooks | `hooks/` + your settings file | The enforcement layer: a session-start index injector, a style gate that lints only newly introduced text, an intake nudge, a write-back gate, a git gate carrying your hard lines, a config tripwire, a load audit, a reply gate that bounces bloated answers with the word count, and a token reporter plus handoff pair that surface what every turn cost |
| The routing seats | `subagents/` + `commands/` | Four pinned subagents that send each stage of work to the right model tier (cheap exploration, strong planning and review, default execution), and the `/model-routing` command that flips them between tiered and inherit |
| The tools | `tools/` + `skills/` | The onboarding skill that reads a pasted project and drafts its tracker, the never-publish sweep, and a workspace composer for multi-repo setups |

## Quickstart

From zero to a governed workspace with your first project onboarded, about five minutes of your attention plus one agent session. The full version is in [`docs/quickstart.md`](docs/quickstart.md).

1. **Create your root.** Pick a folder to hold everything, copy the contents of `template/` into it so the constitution `CLAUDE.md` sits at the root, then `git init -b main` and make the first commit.
2. **Wire the harness.** Copy the hook wiring from `.claude-settings-template.json` into your `~/.claude/settings.json` and replace the `<ROOT>` placeholders with your real path. The hooks already sit at your root from step 1, which is where the wiring points; they take effect from your next session.
3. **Fill the two rule surfaces.** The craft globals at `Claude/CLAUDE.md` ship as a shell with `<YOUR-*>` sections. A complete worked example is in `examples/`.
4. **Name your roles.** `Agents/AGENT_ROLES.md` ships with the full council and staff charters; give each a persona name. A named persona binds a session to its charter better than a job title does.
5. **Install the harness pieces.** Copy `skills/forge-onboard/` into `~/.claude/skills/`, the four files in `subagents/` into `~/.claude/agents/`, and `commands/model-routing.md` into `~/.claude/commands/`.
6. **Onboard your first project.** Paste the project into `Projects/<Name>/<repo>/`, open a session at your root, and say "onboard `<Name>`". The skill scans the code read-only, drafts the project's bible from what the code shows, creates the tracker, and ends with an editable summary for you to correct. It will not restyle anything in your code; that is the layer's headline rule.

## How it works

The parts above and the path one request travels through them, end to end, are laid out in [`docs/how-it-works.md`](docs/how-it-works.md). The front page at [forge.jayofemi.com](https://forge.jayofemi.com) animates the same path as an x-ray of the machine.

- [`docs/the-tier-model.md`](docs/the-tier-model.md) explains why almost nothing loads by default, and where any new rule belongs.
- [`docs/customize-first.md`](docs/customize-first.md) is the replacement order for making the layer yours.

## Built for Claude Code

The Forge is built for Claude Code. The enforcement is a Claude Code hook pack wired through `settings.json`, and Claude Code is the runtime it is tested against.

Because the load-bearing rules live in hooks rather than in a persona, the enforcement travels with the files instead of with a prompt. That portability is a property of the design. Although Claude Code is what the Forge supports, it can likely be easily adapted to work with other models.

## Honest limits

The Forge keeps an agent inside your rules. It does not make the agent right. Treat it like a car that drives itself: it steers, you stay awake, and you check the work before it ships. It comes as is, MIT licensed, with no support line behind it.

## License

MIT. See [`LICENSE`](LICENSE). Free to use, fork, and adapt.
