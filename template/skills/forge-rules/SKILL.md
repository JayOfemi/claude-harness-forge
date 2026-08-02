---
name: forge-rules
description: >-
  Fill this workspace's your-call rule surfaces from a conversation: the git
  gate's hard lines, the never-publish deny list, role persona names, and the
  craft globals. Use this when the user says "fill my rules", asks to set up,
  change, or finish their rules, hard lines, deny list, roles, or craft
  globals, or when setup just finished and the rule files still carry
  placeholders - even if they do not name the skill.
---

# forge-rules

Turn the rule surfaces only the owner can decide into a short interview. You hold the pen; the owner supplies every rule. The output bar: each surface the owner chose to fill carries exactly what they stated, read back to them, and nothing else in the workspace changed.

## Ground rules

- **Anchor at the workspace root first.** Every file below lives at the root, the folder whose `CLAUDE.md` is the constitution (it also holds `hooks/`, `STANDARDS/`, and `tools/`). If the session is open elsewhere (a project folder), resolve every path against that root and say so. If you cannot find the root, stop and ask for it; never create these files anywhere else.
- **Never invent a rule.** Every line written comes from the owner's own words in this conversation (tightened for clarity is fine; read the tightened form back).
- **One surface at a time**, one short plain-words question each. Skipping any surface is fine; the interview is re-runnable and picks up from whatever the files already hold.
- **Echo every write.** After writing a file, show what it now says in a line or two.
- Touch ONLY the files named below. Project repos are never touched.

## The surfaces, in paying-off order

### 1. Hard lines -> `hooks/hard-lines.txt`

Ask: which git operations must an agent never do on its own? Think pushes (which repos, if any), deploys, tags, history rewrites, anything money-touching. Replace the file's ENTIRE content with the answer, stated as short verbatim lines. The git gate quotes this file in every block message; until it is filled, the gate blocks gated operations and says it is waiting.

### 2. Never-publish list -> `deny-list.txt` at the root

Ask: which names must never appear in anything published from this workspace? Their name and employer, internal project names, private domains, personal paths. Create the file if it is missing (one entry per line); append if it exists, never dropping an existing entry. Note once that the sweep (`tools/deny-sweep.mjs`) checks against this list before anything goes public, and that the list itself is private data.

### 3. Role names -> `Agents/AGENT_ROLES.md`

Offer: name the roles now, one persona from fiction they love per charter, listing the charters by function (chair, skeptic, treasurer, housekeeper, attendant, scout). Replace each `<YOUR-NAME>` slot with the given persona and change nothing else in the charters. Fully optional; skip on any hesitation.

### 4. Craft globals -> `Claude/CLAUDE.md`

Ask: any style, wording, or commit rules every session must follow? Write their answers into the `<YOUR-*>` sections only. If they want a battle-tested starting set instead, the worked example ships in the download's `examples/` folder (beside `template/`); ask where they unzipped, read `examples/craft-globals-example.md` from there, and adopt it ONLY on an explicit yes, as a base they then edit. Never adopt it silently.

### 5. Optional: excluded workspaces -> `hooks/dir-added-gate.mjs`

If they name folders agents must stay out of (a day job, a client's code), add matching entries to the `EXCLUDED` list in the hook. This one is a code file, so after editing it, run `node --check hooks/dir-added-gate.mjs` and fix anything it reports before closing.

## Close

End with a short summary, one line per surface, filled or skipped, saying what each now holds. Remind once that the git gate proves itself on the next gated git command, and that any of this can be changed later by saying "fill my rules" again.
