---
name: model-routing
layer: agnostic
when_to_read: Choosing a model or effort tier for a session, subagent, or delegated task; deciding whether to escalate; sizing any fan-out
---

# Model routing - which tier does which work

The mechanism exists (model-override subagents, per-task briefing files with the model named at the top); this is the policy. The principle: **strong models on the bookends, default models in the middle, cheap models on the mechanical** - quality concentrates where judgment lives (framing the work and judging the work), not where the keystrokes happen.

**Stage defaults**:

- **Intake, planning, design, final review** - the session's strong tier (Opus-class or above). This is where a wrong call multiplies.
- **Execution against a clear spec** - the session default (Sonnet-class). Good routing holds most of the strong-model quality at a fraction of the strong-model traffic.
- **Mechanical, well-specified work** (measurements, mirrors, verbatim moves, single-file checks) - cheap tier (Haiku-class), packaged as a self-contained briefing file with the target model named at the top, a read-first list, exact edits, and a done-means criterion.

**Escalation triggers** (any one moves the work up a tier):

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

**Use the harness's native rails, then layer on top**: the plan-strong/execute-default split ships in the harness (per-subagent model pins) - adopt those rather than hand-rolling. What the harness does NOT do is capability escalation (its automatic switching is availability-driven only), so the escalation triggers above are your own policy layer; a calibrated model-confidence signal, where the harness exposes one, is a stronger escalation trigger than hand-set heuristics. Treat the routing economics as directional and refine them from your own session records.

**Tuning**: find the cheapest tier that holds the quality for each kind of work, and record any routing choice that deviates from these defaults, with the reason, in the session log.

**NOT**: no strong-model defaults for mechanical work; no uncapped fan-outs; no re-run-from-scratch when recovery exists; no delegating bookend judgment (framing, final review) to the cheap tier to save money - that is where the money is lost.

**Why**: tokens buy the most where judgment concentrates; everywhere else they buy latency and heat.
