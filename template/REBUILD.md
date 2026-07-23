# REBUILD - reconstructing this workspace from nothing

The runbook for restoring the whole operation on a fresh machine, or auditing what the operation actually consists of. Everything tracked in git is POINTED at, never restated; everything that lives outside git (the harness wiring under `~/.claude`, machine-specific state) is carried here VERBATIM, because this file is its only durable home. Loads never (Tier 4, `STANDARDS/context-tiers.md`); read it when rebuilding or when changing the wiring it records.

**The maintenance rule that makes this file worth having:** any change to the wiring recorded here (hooks, gate scripts, plugin set, search `.ignore` semantics, the repo set) updates this file IN THE SAME SESSION, or it drifts - the wiring is invisible to git, so this file is its only audit trail.

## 1. Survival inventory

**Survives offsite (remote repos):** list each repo and what it carries. `<YOUR-REPOS>` - at minimum: the root repo (constitution, standards, agents, this file), the tracker hub, and every project repo with its remote and push state. The composition manifest (`forge-manifest.json`) is the machine-readable version; regenerate it with `node tools/forge-worktree.mjs init`, which also reports any repo with NO remote - that is your loss surface, keep it at zero.

**Does NOT survive, by decision:** name what you have deliberately chosen not to preserve (chat history? local caches? memory banks?) and the one-line rationale, so a future you does not mistake the choice for an oversight.

**Does not survive and is why this file exists:** the `~/.claude` wiring in section 4.

## 2. Day-0 sequence (fresh machine)

1. Install git, Node, ripgrep; install your agent harness and log in.
2. Recreate the shape: clone the root repo, clone the hub INTO it at `Claude/` (a nested repo the root gitignores), clone project repos into `Projects/<Name>/<repo>/` per each tracker's bible. Or: clone the root repo and drive the rest from the manifest.
3. Recreate `~/.claude/settings.json` from section 4; the hook scripts come back with the root repo clone at `<ROOT>/hooks/` (section 5).
4. Restore skills and commands from their source mirrors (name where yours live).
5. Machine-specific state, per project bible: `<YOUR-MACHINE-STATE>` (drive mappings, tool installs, git identities).
6. Run the verification checklist (section 6).

## 3. The governance stack (map only - each item is canonical elsewhere)

| Layer | Canonical home | What it does |
|---|---|---|
| Constitution | root `CLAUDE.md` | behavior + structure, binding on every agent |
| Craft globals | `Claude/CLAUDE.md` | wording, coding style, commit rules |
| Standards bank | `STANDARDS/` via `INDEX.md` (hook-loaded router) | the locked answers, read just-in-time |
| Load tiers | `STANDARDS/context-tiers.md` | what loads when; the placement algorithm |
| Project bibles + trackers | `Claude/<Name>/` | per-project rules, logs, roadmaps |
| Roles | `Agents/AGENT_ROLES.md` | council + staff charters for named root sessions |
| Search wiring | root `.ignore` (tracked) | search sees the whole tree; exclusions by design |
| Enforcement | the hook pack (section 4-5) | gates and detectors, not prose |
| Composition | `forge-manifest.json` + `tools/forge-worktree.mjs` | the declared multi-repo shape + its one blessed materializer |

## 4. `~/.claude/settings.json` (verbatim wiring of record)

`<RECORD-YOURS-HERE>` - start from `.claude-settings-template.json` at your root (the full wiring: the SessionStart INDEX loader; the pre-tool git gate; the post-edit style gate; the prompt-submit intake nudge and token handoff; the Stop write-back gate, reply gate, and token reporter; the config tripwire; the instructions audit). Once adapted and deployed, paste the LIVE version here verbatim and keep it current per the maintenance rule.

## 5. Hook scripts (verbatim copies of record)

`<RECORD-YOURS-HERE>` - the hook scripts ship at `<ROOT>/hooks/`, tracked in your root repo, so a clone restores them and no verbatim copy is needed here. Record a hook verbatim only if you move its canonical source outside a tracked repo.

## 6. Verification checklist (the rebuild worked when...)

1. A session booted at the root receives the STANDARDS INDEX via the SessionStart hook.
2. Search from the root finds content inside `Claude/` and `Projects/` and does NOT surface your excluded workspaces.
3. An edit that introduces a banned pattern gets blocked with a `file:line` finding; a clean edit passes silently.
4. A gated git operation is blocked BEFORE running; the acknowledged re-issue proceeds.
5. Only the repos your craft globals name as auto-push are pushable by an agent.
6. A project session boots via its workspace pointer, reads the three layers, and lands on the bible's resume point.
7. A final reply over the prose ceiling is blocked once with the word count; after a costed turn the next reply carries the `Tokens last turn:` line (or your host renders the `Tokens this turn:` system line directly).
