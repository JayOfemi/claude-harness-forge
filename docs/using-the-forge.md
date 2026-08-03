# Using the Forge

The quickstart sets the layer up; this page is how you drive it. Each item is something you say or do in a session, plus what it buys you. The machine handles the rest. Rules load themselves, gates watch the work, and the record writes itself when you let it. Skim the first section today and come back for the other two.

## Your first day

- **Open sessions where the work lives.** For project work, open Claude Code in that project's folder under `Projects/`; the session binds to that project's memory and lands on its resume point. Open a session at the workspace root for cross-project questions ("status of everything"), and expect it to analyze and report rather than edit.
- **Bring every project in with one line.** Paste or clone the project into `Projects/<Name>/<repo>/`, open a session at your root, and say: onboard `<Name>`. The skill scans the code read-only, drafts the project's bible and tracker (the fact file and memory every later session reads), and ends with a summary you correct in a sentence or two. Correcting that summary IS the documentation step.
- **Correct the echo instead of re-briefing.** Sessions state their reading of your ask back in a line before working. If it is right, let it run; if not, fix it in a few words. What you already recorded lives in the trackers, so you never re-explain a project from scratch.
- **Treat a gate block as the system working.** The git gate stops the operations you declared off-limits, both git and the shipping tools listed in `hooks/gated-tools.txt`, until the session verifies them against your rules and re-issues the command with the `CLAUDE_REVIEWED=1` prefix. A second tier never clears that way and comes back to you instead, covering history rewrites, skipped hooks, and pushes that force, delete, or target a tag or an explicit URL. The style gate names the file and line of any banned text the moment it lands. The block message always says what happens next. The quickstart's "Verify it worked" list is a good first-day drill for seeing each gate fire once.

## Your first week

- **Resume with two words.** Open the next session in the project folder and say "keep going". Every sitting ends by writing the next session's first move, the resume point, and the next session reads it before anything else. A stale resume point gets fixed in the tracker, and stays fixed for every later session.
- **Let a closing session write the record.** A session that edited files but recorded nothing is blocked once at stop and asked for the session-log entry and resume point. Let it write them; that record is what makes tomorrow's two-word resume land on the right work.
- **Glance at routing and cost.** Type `/model-routing status` to see which model each stage of work runs on; nothing runs above your session's own tier unless you pin it. The token lines ("Tokens this turn" or "Tokens last turn") show what each turn cost.
- **Summon a role when you want a different posture.** Once the charters in `Agents/AGENT_ROLES.md` carry your persona names, open a root session and say "This session is <YourName>". The skeptic stress-tests a plan, the housekeeper runs a cleanup sitting, the attendant reports status; one sentence loads the whole posture.
- **Say "capture that" for side-ideas.** Anything out of scope mid-session becomes a dated TODO bullet or note, written so a later session can pick it up cold, and is not acted on now. Scope stays sacred and nothing gets lost.

## From then on

- **Sweep before anything goes public.** Keep `deny-list.txt` seeded with the names, employers, and paths that must never ship. Before publishing anything from the workspace, run `node tools/deny-sweep.mjs <folder>`, or say: run the deny sweep on `<folder>` and show me every hit. A hit is a stop, not a warning.
- **Record wiring changes in `REBUILD.md` in the same session.** Settings and hooks are invisible to git, so that file is their only audit trail. Paste the live version in whenever the wiring changes; it is what lets you rebuild everything git cannot see.
- **Promote repeated decisions into standards.** The second time a "how do we do X" answer comes up, say "make this a standard". It becomes a file in `STANDARDS/` with one routing line in the index, and every later session inherits the decision instead of re-debating it.

Depth for each item lives next to its mechanism. The constitution (`CLAUDE.md` at your root) covers session orientation and captures, the `STANDARDS/` bank covers intake, trackers, routing, and gates, `Agents/AGENT_ROLES.md` carries the roles, and each hook file states exactly what its gate checks.
