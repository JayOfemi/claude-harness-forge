---
name: intent-intake
layer: agnostic
when_to_read: Session start on any nontrivial ask; any vague or underspecified prompt; BEFORE asking the user a clarifying question
---

# Intent intake - reconstruct intent from state, not from the prompt

Prompts will be lazy, vague, and badly worded - that is the design assumption, not a failure case. The layer's job is to make prompt quality irrelevant: **intent is reconstructed from stored state, stated once, then executed**. The pipeline promise this serves: whatever goes in, what comes out is complete, secure, up to the layer's standards, gates passed, ready for final human review.

**The intake steps** (before real work on any nontrivial ask):

1. **Classify the ask**: build / fix / review / research / status / capture. The classification picks the loop, the gates (`review-gates.md`), and the routing (`model-routing.md`).
2. **Enrich from state, in order**: the project's bible -> the roadmap-of-record's resume point -> the log tail (last 1-3 sittings) -> today's TODO -> the memory index. The question "what did they probably mean" is usually answered by "what were we doing" - and the trackers know.
3. **State the reconstructed intent and proceed.** Small ask: one declared line ("Reading this as: <intent>"). Substantial ask: a short EDITABLE echo-back (the reconstructed intent + the planned shape, a few lines) - the shipped-practice winner (Devin interactive planning, Cursor plan mode) - then proceed. Either way it is a declaration, not a question; the user corrects it in five words if wrong. Why silence is worse: when an agent guesses on a vague prompt without declaring its reading, it acts past a boundary the user never set, and the miss surfaces only after the diff lands.
4. **Capture "done when" at intake**: every build/fix ask gets a machine-checkable completion criterion recorded up front (the Codex intent-contract pattern); the gates check against it (`review-gates.md`) and the resume point may not claim complete without it.
5. **Ask only when it matters**: an ambiguity that survives enrichment AND sits on an irreversible or scope-changing call gets a question (the constitution's stop-and-ask). Reversible ambiguity gets the most probable reading, declared. When a question IS asked, write the answer back into the project state that was consulted (bible, roadmap, or spec) - a clarification that lives only in chat gets re-asked next session.

**Pre-emption (the loop's fuel)**: every session ends by writing the next session's first move - the resume-point contract in `tracker-format.md`. Intake reads it at the top of the next session; that is how a two-word prompt ("keep going") lands on exactly the right work.

**NOT**:

- No interrogating the user for what the tracker already records.
- No acting on a reconstructed intent WITHOUT stating it (a silent guess that lands wrong reads as drift; a declared reading that lands wrong is a five-word fix).
- No treating a sloppy prompt as license for a sloppy deliverable - the output bar is fixed regardless of input quality.
- No skipping intake because the prompt LOOKS clear; the two-minute enrichment catches the "clear but contradicts the roadmap" case, which is the expensive one.

**Enforcement wiring**: the always-on kernel lives in the constitution's Session orientation section; a prompt-submit hook ships in the template hook pack that injects a one-line intake route on bare continuation prompts ("continue", "keep going" and kin), silent otherwise.

**Why**: the pipeline's strongest durable value is information and autonomy - the agent that knows the state does not stall, does not invent, and does not ask. Intake is that value applied at the front door.
