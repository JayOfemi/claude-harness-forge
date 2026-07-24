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
| The routing seats | `subagents/` + `commands/` | Four subagents, dynamic by default: nothing runs above your session's own tier, planning and review ride it exactly, exploration stays on the cheap floor, execution runs capped at it. The `/model-routing` command reports the seats, pins any of them to a fixed model, or frees them back to dynamic |
| The tools | `tools/` + `skills/` | A one-command setup helper, the onboarding skill that reads a pasted project and drafts its tracker, the never-publish sweep, and a workspace composer for multi-repo setups |

## Get set up

From zero to a governed workspace with your first project onboarded in about five minutes. Three ways to do it, from least effort to most control. The full walkthrough, including what each path leaves for you to decide, is in [`docs/quickstart.md`](docs/quickstart.md).

You need Claude Code, git, and Node.js on your PATH (the enforcement hooks are small Node scripts).

**Let your agent do it.** Open a Claude Code session in the folder you cloned or unzipped and say:

> Read `docs/quickstart.md` and set up the Forge for me. My workspace root is `C:/Workspace`.

It copies the template into your root, initializes git, installs the `~/.claude` pieces, and drafts your settings for you to apply. No command line.

**Or run one command.** A setup helper does the same mechanical steps and prints what is left.

Windows (PowerShell), and if it is blocked, prefix with `powershell -ExecutionPolicy Bypass -File`:

```powershell
.\template\tools\setup.ps1 -Root C:/Workspace
```

macOS or Linux:

```bash
bash template/tools/setup.sh --root ~/workspace
```

**Or do it by hand.** The step-by-step version, with the JSON path traps defused, is in [`docs/quickstart.md`](docs/quickstart.md).

Whichever you pick, you finish by filling in the parts only you decide (your craft rules, your git-gate hard lines, your never-publish list), then onboard your first project with one line: open a session at your root and say "onboard `<Name>`". The skill scans the code read-only, drafts the project's bible from what the code shows, and ends with an editable summary. It will not restyle anything in your code; that is the layer's headline rule.

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
