---
name: review-gates
layer: agnostic
when_to_read: Defining done for any output type; building or altering a gate or hook; before declaring any work ready for review
---

# Review gates - done is machine-checked, and the human is the final gate

Prose rules ask; gates verify. The recurring agent failure modes are: wrong-layer fixes, over-engineering, ignored stated constraints, silent approach changes, echo-chamber caving, amended pushed commits, leaking exceptions. Those are gate targets, not reminder targets.

**Standard**:

- **Every output type names its gates before the work ships.** A task is done when its gates pass; the FINAL gate is always human review - the machinery's job is to make that review short, never to replace it.
- **Gate doctrine** (matches `context-tiers.md` Tier 2): machine-checkable over prose; SILENT when clean; exact findings (file:line) when not; gate or detect, never re-teach. Gate infrastructure fails loud (`fail-loud.md`), with the one narrow justified quiet-degrade for a broken detector that would otherwise block every edit.
- **The starter inventory** (extend, do not duplicate): the style gate (every edit - your wording and formatting rules), the git gate (repo operations - hard lines like no-amend-pushed and no-force-push), the write-back gate (pre-publish or release - the "did everything that should have been written get committed?" check), the intake nudge (bare continuation prompts - routes to the resume point), CI (build + test on PR and main), your test suite. Add `<YOUR-GATES>` for any output types your project introduces. A new output type with no named gate is an open TODO bullet on sight, not a silent hole.
- **Gap rule**: a new output type with no named gate set is an open TODO bullet on sight, not a silent hole and not a blocker.

**Anti-gaming** (gates that agents cannot pass by performing compliance):

- Gates check OUTCOMES (the build passes, the tests are green, the dash is absent), never self-reports.
- The worker never authors or edits its own pass criteria mid-task - criteria are fixed before the work starts. **Gates watch their own inputs**: edits to tests, CI config, or thresholds during gated work are themselves gate-worthy events (the number-one observed gaming move in the field).
- Deterministic checks over LLM judgment wherever a string or exit code can decide. Where a gate must be an LLM judge, single-shot verdicts are unstable on identical inputs, so aggregate repeated votes or keep the judged criterion coarse.
- **Requester is not approver**: the session that produced an output never certifies it; certification is the human's, another session's, or the machinery's.
- **Gates emit evidence, not just a bit**: where cheap, a gate records what ran, what passed, and against which criteria (the durable conformance record) - that is also the measurement substrate for grading the gates themselves.
- **Gates depreciate**: as models strengthen, yesterday's gate stops discriminating, so gate re-hardening is a scheduled maintenance item, paired with the post-model-release rule audit in `context-tiers.md`.
- Spot-audit the gates themselves periodically: a gate that never fires is either a solved problem or a broken detector, and the difference matters (fire-test with a known-bad input).

**NOT**: no "done" declared with failing or unrun gates; no burying a gate failure in a summary (report it, fix it, or hand it off explicitly); no adding a reminder where a detector is buildable; no gate whose output re-teaches rules the session already loaded.

**Why**: the deliverable bar is fixed - complete, secure, standards-conformant, ready for final human review - and the only scalable way to hold a bar is machinery that never gets tired, plus a human who only reviews work that already passed it.
