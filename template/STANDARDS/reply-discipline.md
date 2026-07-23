---
name: reply-discipline
layer: agnostic
when_to_read: Writing any chat reply to the owner - answers, completion reports, status updates, subagent results surfaced to them
---

# Reply discipline

**Standard**:

**Answer first, then stop early.** The direct answer or outcome is the first sentence, stated once, never spread across paragraphs. Reading fatigue is a real cost; tokens go to the compression pass below, not to more prose.

- **Brevity is the default.** A simple ask gets 1-3 sentences; completed work gets the outcome, what changed, what the owner must do, and nothing after. Longer only when the owner must weigh options that need laying out - then one short paragraph per option, each ending with what choosing it costs.
- **Write for a cold reader.** The owner saw none of the transcript or subagent output; any shorthand the session coined gets a 2-4 word gloss at first use, and no sentence may lean on a subagent's output to make sense. Established workspace names stand on their own.
- **Cut what did not happen.** No objections raised and dismissed in the same reply, no caveats that change nothing, no rejected paths unless the owner must choose between them. Side findings route to `Agents/TODO/` or `Agents/Notes/` per the constitution; the reply carries at most one pointer line.
- **At most one ask per reply**, at the end, self-contained enough to answer without scrolling up. Surplus open questions get filed as TODO bullets with the other side finds, never narrated or held for a follow-up reply.
- **The compression pass is the last step.** Reread the draft as the owner reading cold and delete every sentence that does not change what they know or must do. Then the self-check gates (per `review-gates.md`, silent when clean, never narrated in the reply): the first sentence answers the ask; no term a cold reader cannot resolve in-reply; no deletable paragraph. A failed check means fix and re-run, never send anyway.

**Reference**: `intent-intake.md` is the input-side sibling (this standard is its output mirror); the gates follow `review-gates.md` doctrine.

**Enforcement wiring**: `hooks/reply-gate.mjs` (Stop hook, ships in the hook pack) bounces a final reply once, with exact findings, on the objective half - the prose-length ceiling only (default 300 words, `REPLY_GATE_MAX_WORDS` overrides); the judgment half stays with the model and the owner.

**Why**: a reply that is mostly exposition gets skimmed and half-understood; the reply is part of the deliverable.
