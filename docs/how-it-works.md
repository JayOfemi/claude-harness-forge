# How it works

The quickstart tells you how to set the layer up. This page explains what you are actually running, the parts and the path one ask travels from the moment you type it to the moment the work lands. It is written for a human deciding whether to trust the machine, not for the agent.

This layer is files. There is no server, no background process, no install beyond copying folders and wiring a few hooks into your agent harness. The harness (Claude Code or a compatible agent runner) supplies the intelligence; this layer supplies written law, durable memory, and mechanical checks. Everything described below is a readable file you can open and edit.

## The parts

| Part | Where | What it does |
|---|---|---|
| The constitution | `CLAUDE.md` at your root | Behavior rules every session inherits, including the workspace map, the integrity rules (single source of truth, additive hierarchy, deterministic placement), session orientation, and the headline rule that agents touch only what they were asked to touch |
| The craft globals | `Claude/CLAUDE.md` | Your always-loaded craft law covering style, wording, commit discipline, and hard gates. Ships as a shell you fill; a complete worked example is in `examples/` |
| The standards bank | `STANDARDS/` | The depth. One file per "how we do X", each behind one routing line in `INDEX.md`. Sessions read the index every time and open only the one or two standards the task touches |
| Project trackers | `Claude/<Project>/` | Per-project memory, a bible of facts and rules (what the project is, what is decided) plus a session log where every sitting ends with a resume point |
| The roles | `Agents/AGENT_ROLES.md` | Charters for a council (a chair, a skeptic, a treasurer) and staff (housekeeper, attendant, scout) you can summon by name to stress-test plans or keep the workspace clean |
| The hooks | `hooks/` + your settings file | The enforcement layer, made of a session-start injector for the index, a style gate that lints only newly introduced text, an intake nudge, a write-back gate that reminds a closing session to record itself, a git gate carrying your hard lines, a config tripwire that announces settings changes mid-session, a directory gate that warns when a folder added mid-session is excluded or outside your root, a load audit that confirms a session actually read the constitution, a reply gate that bounces a bloated final reply once with the word count, and a token reporter plus handoff pair that surface what every turn cost |
| The tools | `tools/` + `skills/` + `subagents/` + `commands/` | A one-command setup helper, the onboarding skill that reads a pasted project and drafts its tracker, the never-publish sweep, the workspace composer for multi-repo setups, and the dynamic model-routing seats with the `/model-routing` switch that reports, pins, or frees them |

The routing seats resolve against the session's own model, never above it. Unless you pin a seat, the resolution is:

| Session model | Explore | Plan | Execute | Review |
|---|---|---|---|---|
| Haiku | haiku | haiku | haiku | haiku |
| Sonnet | haiku | sonnet | sonnet | sonnet |
| Opus | haiku | opus | sonnet | opus |
| Your strongest tier | haiku | that tier | sonnet | that tier |

## One ask, end to end

Here is the path a single request travels. The quickstart's verify list checks the same path from the outside.

1. **Session start.** The harness fires the session-start hook, which injects the standards index. The session reads the constitution, the craft globals, and the bible of the project it was opened in. Orientation is by folder, never by guesswork; a session that cannot tell which project it belongs to is required to ask.

2. **Intake.** Before any work, the session reconstructs what you actually want from the written state (the bible, the last resume point, open TODO items), not just the words of the prompt. It states its reading back in a line or two and names a done-when, the condition that will mark the work finished. A vague prompt gets an interpretation you can correct, not a guess you discover later.

3. **Routing.** The session greps the index for the topics the task touches and opens those standards, just those, just in time. The rest of the bank stays on disk. This is the tier model in action (`the-tier-model.md` explains why this is the cheapest and most reliable shape).

4. **The work.** The task gets done under the loaded law. The headline rule binds hardest here. Change scope is sacred. Rules and conventions apply to the lines the session writes, and the lines it was not asked to touch stay untouched, even when they break a rule.

5. **The gates.** Mechanical checks run as the work lands, not after. The style gate flags banned text the moment it is introduced and stays silent on everything clean. The git gate stops commands you declared off-limits until the session acknowledges your hard lines. The reply gate bounces a bloated final reply once, with the exact word count, so answers stay readable; the token reporter prints what the turn cost, and its handoff twin surfaces that number inside the next reply on hosts that hide system output. The done-when from intake is the finish line; "looks done" does not count.

6. **The record.** Before the session closes, it writes down what happened, what was decided, and a resume point saying exactly where things stand. The next session opens cold, reads that record, and continues instead of restarting. This is the difference between forty sessions and one forty-session project.

## Why it is built this way

- **Prose decays, gates do not.** A rule that lives only in an instructions file competes with everything else in the session's attention. The rules that matter most are enforced by hooks that either block or flag, mechanically, whether or not the session remembers them.
- **Hooks fire early and fail safe.** A PreToolUse block lands before the permission system evaluates the call, so a gated command stops even where a broad allow rule would have let it through. Gates that guard dangerous operations fail closed, so when the git gate cannot evaluate a command that mentions git, it blocks by default. Detectors (the style gate, the config tripwire, the directory gate) do the opposite and stay silent on internal error, because a broken detector must never lock you out of your own session.
- **Almost nothing loads by default.** Always-loaded text is the most expensive real estate in an agent session, in money and in rule-following. So the constitution and craft globals stay small, the index is one line per standard, and the depth waits until a task earns it. `the-tier-model.md` covers the evidence.
- **Every fact has one home.** The bible holds project facts, the standards bank holds cross-project law, the logs hold history. Nothing is stated twice, so nothing drifts into two versions of the truth.
- **You stay the owner.** Every ruling a council role produces is advisory. The layer's own files say so. Your word is law, and the machine's job is to make sure your law actually gets followed.

## What it is not

- Not a model, an agent, or a product subscription. It runs on whatever agent harness you already use.
- Not an installer or a daemon. Copying the folders is the install; deleting them is the uninstall. A setup helper ships that can do the copying for you, but it is a convenience that moves files into place, not a runtime; nothing runs in the background.
- Not a style opinion. The mechanisms ship neutral; the opinions live in clearly marked example files you replace with your own (`customize-first.md` is the replacement order).
