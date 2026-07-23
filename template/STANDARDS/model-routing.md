---
name: model-routing
layer: agnostic
when_to_read: Choosing a model or effort tier for a session, subagent, or delegated task; deciding whether to escalate; sizing any fan-out
---

# Model routing - which tier does which work

The mechanism ships (the adopted switch below, per-task briefing files with the model named at the top); this is the policy. The principle: **strong models on the bookends, default models in the middle, cheap models on the mechanical** - quality concentrates where judgment lives (framing the work and judging the work), not where the keystrokes happen.

**Stage defaults**:

- **Intake, planning, design, final review** - the session's strong tier (Opus-class or above). This is where a wrong call multiplies.
- **Execution against a clear spec** - the session default (Sonnet-class). Good routing holds most of the strong-model quality at a fraction of the strong-model traffic.
- **Mechanical, well-specified work** (measurements, mirrors, verbatim moves, single-file checks) - cheap tier (Haiku-class), packaged as a self-contained briefing file with the target model named at the top, a read-first list, exact edits, and a done-means criterion.

**The adopted rails (the switch; dynamic-first)**: routing is DELEGATION-BASED and works from whatever model the user picked for the session - the switch reads the session tier, never sets it, and no seat ever runs above it. Stage work goes to four subagents installed at `~/.claude/agents/` from the template's `subagents/` (`Explore`, `Plan`, `Execute`, `Review`), every seat DYNAMIC by default and resolved when a spawn is about to happen: **every seat lands at or below the session's own tier, always; Plan and Review ride the session tier exactly** (the bookends deserve the strongest model the user is already paying for); Explore resolves to the cheap floor tier (falls back one tier up on tool-heavy prompt-too-long failures, never above the session tier); Execute resolves to the default tier capped at the session tier (callers on stronger sessions pass the default tier at spawn; at or below it, Execute rides the session model). A user pin (`/model-routing set <stage> <model>`) overrides the dynamic rule for that seat verbatim, even above the session tier - an explicit choice is the user's to make. `/model-routing status|dynamic|inherit|set <stage> <model|dynamic>` (the template's `commands/model-routing.md`) reports the seats and this session's resolution, resumes routing per the seat memories, turns routing off, or pins and frees a seat (the seat line in each agent file is the memory). **The posture**: a multi-stage task delegates its stages to these agents; small inline work stays inline; a session already running a strong model may keep its bookends inline (the orchestrator's tier is a bookend tier). **Requested vs effective**: allowlists and availability can silently downgrade a resolution, so the four agents self-report the model they actually ran as, and the logs, not the config, are the truth. `CLAUDE_CODE_SUBAGENT_MODEL` is never the router - it flattens every subagent to one model; emergency cost ceiling only.

**Escalation triggers** (any one moves the work up a tier):

- Rung zero, before any tier move: raise EFFORT first - verification depth tracks effort, and missed-verification failures are effort failures, not capability failures. (Co-tune the axes; a cheap model at max effort is not a substitute for the tier the work needs, and a default model at maximum effort can cost more than the strong tier at default.)
- A gate failed twice on the same item.
- The surface is security, money, or data-destroying.
- Ambiguity survives intent intake (`intent-intake.md`).
- Charter, memory, or always-loaded-core surgery (a stale belief planted there compounds).

**Orchestration frugality** (binding):

- Cap verify/judge fan-outs to the few claims a decision actually rests on (about 5, not one-per-finding).
- Scouts self-verify against primary sources; no blanket verification waves behind them.
- Before re-running ANY failed multi-agent work, recover completed agents' outputs (workflow transcripts or resume-from-run-id) - re-running paid work is the most expensive no-op there is.
- Synthesis happens inline in the owning session by default; a subagent's isolation is context hygiene, not a cost saver (each agent re-pays its own load).
- Multi-agent orchestration runs only on the operator's explicit opt-in.

**Use the harness's native rails, then layer on top**: per-subagent model pins and same-name overrides of built-in agents ship in the harness - the switch above is built entirely from them, so adopt it rather than hand-rolling. What the harness does NOT do is capability escalation (its automatic switching is availability- and content-driven only), so the escalation triggers above are your own policy layer. Treat the routing economics as directional and refine them from your own session records (the requested-vs-effective self-reports are the data).

**Tuning**: find the cheapest tier that holds the quality for each kind of work, and record any routing choice that deviates from these defaults, with the reason, in the session log.

**NOT**: no strong-model defaults for mechanical work; no uncapped fan-outs; no re-run-from-scratch when recovery exists; no delegating bookend judgment (framing, final review) to the cheap tier to save money - that is where the money is lost.

**Why**: tokens buy the most where judgment concentrates; everywhere else they buy latency and heat.
