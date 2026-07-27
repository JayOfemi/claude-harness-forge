> One operator's craft globals, kept as a worked example of the layer. The MECHANISM is this file's position (always loaded, parent-wins, the master for style rules); the CHOICES below are one person's - replace them with yours.

# Craft globals

> **Two global layers, both binding, always.** The workspace constitution (`CLAUDE.md`) + standards bank (`STANDARDS/`, start at `INDEX.md`) govern agent BEHAVIOR and workspace STRUCTURE. THIS file governs the CRAFT: wording, coding style, commit rules. Every agent, every session, is aware of both plus its project's rules - no task type is exempt. The two files cross-reference; neither replaces the other.

These rules bind every project in the hub, parent-wins per the constitution's integrity rules: project files only ADD rules for gaps; overrides are legal only dual-noted (a detailed note in the project file AND a one-liner exception on the rule here); an undeclared conflict means this file is right and the project file gets fixed.

---

## Startup reading is mandatory

Every session start and after every compaction: read this file, the constitution, and the project's CLAUDE.md **in full** - plus every pointer the project file references and the entire SessionStart hook payload. Skim only session logs (last 1-3 `## Session` entries) and `Working/` trackers. The ordered checklist and mechanics: `STANDARDS/session-protocol.md`. Rules and hooks encode what a fresh model cannot infer from source; a skimmed startup ships drift. If you catch yourself thinking "I'll come back to this if needed," stop. Read them.

---

## Working directories are temp

`Working/` under any tracking dir is **scratch / temp space**; the user may mass-delete its contents at any time. Anything project-important lives in the repo's `docs/` (ships with the project; public if OSS) or the tracker's `Private/` (durable, synced, never secrets) - default new important docs there, never `Working/`. Full placement rules: `STANDARDS/workspace-layout.md`.

---

## Follow existing standards

Precedent wins. The acceptable answers to "why this approach?" are exactly two: **"it's the standard"** (name the precedent or the `STANDARDS/INDEX.md` line), or **"there's no standard / this beats it, and here's why"** - justified BEFORE shipping, not after the user catches you. Name the standard you follow, or the deviation, in the plan you present. Not knowing a precedent existed is a research failure, not a pass to invent; grep the hook-loaded INDEX first (`STANDARDS/stack-policy.md`).

---

## Coding conventions

- **K&R braces, tabs for indent.** Both C# and TS / JS stacks. `.editorconfig` enforces.
- **NEVER remove unrelated comments.** Only modify comments directly related to the code being changed. If a comment becomes incorrect due to a change, update it. Comments NEAR your change but unrelated to it stay untouched.
- **Minimize comments and logging.** XML summaries on KEY methods only (not every property). Inline comments only on non-obvious lines. Log at Info for important events / significant state changes; Debug for diagnostics; always log errors.
- **2-line hard limit on inline comments.** If a comment draft runs 3+ lines, reword until it fits in 2 or move the detail to the commit message / a design doc. Code that needs more than 2 lines of inline explanation either has a bigger problem (refactor) or the detail belongs elsewhere. No exceptions.
- **No inline magic strings or numbers.** Use a centralized Constants module.
- **Singleton helper classes** PascalCase. Async methods `Async`-suffixed where the language convention applies.
- **Fail loud, never silent; fail CLOSED for anything touching security, money, or data.** No empty catch, no default-on-missing-required, no success-on-failure; the one allowed quiet degrade is a genuinely inconsequential path, logged with a one-line why - when in doubt, loud. Binds code AND agent work: hit a blocker, report it, never paper over it. Full standard: `STANDARDS/fail-loud.md`.

## Behavior rules

- **Change scope is sacred: never sweep pre-existing style violations in lines you are not otherwise changing.** Craft enforcement (wording, dashes, comment limits, formatting) binds the lines you write or rewrite - never re-introduce a violation there - but existing violations in untouched lines STAY, even when you are editing all around them in the same file or class: a stylistic sweep buries the real change in review noise. Binds hardest in mature codebases governed late. Whole-surface cleanups happen only as their own explicitly requested task. Exception: genuinely critical finds (an exploit, data loss) are not styling - surface or fix per fail-loud.

- **Browser-control tools run only on an explicit, per-use instruction.** One grant covers exactly one use and expires the moment the tool is used; never infer follow-on actions from an approved use or generalize one approval to anything else. Any doubt means stop and ask.
- **Decide who runs builds, tests, and dev servers, and write the decision here.** This operator has agents leave them to the owner (a project may grant standing build permission in its own bible; scope the exception there, not here). Many teams prefer agents verifying their own work; either way, an explicit rule stops agents from guessing.
- **Commit your own completed work without asking, in sensible chunks.** (This operator's trust posture; start ask-first if agent commits are new to you.) When you finish a coherent piece of work, commit it; no more gating every commit on a request. The discipline that replaces the gate: (1) **stage only your own changes by explicit path, never blanket-commit a dirty tree;** if unrelated changes are mixed in and you cannot cleanly separate yours, do NOT commit, leave it dirty and say so. (2) **Make each commit worth it:** the seven small steps of one task are usually one commit, not seven, while a genuinely involved step, or a fully isolated one-liner, can stand alone; keep the tree legible, not cluttered. Committing is never pushing (see the push rule). The project-bootstrap initial-scaffold commit still applies.
- **Two repos auto-push; never push anything else; never deploy.** After you commit to the tracking hub (`Claude/`) or the workspace root repo, push it immediately, no asking; these two are the only repos an agent ever pushes. Every project / code repo is committed but NEVER pushed or deployed by an agent, under any circumstance; the user handles those. Now that committing is loose, this is the hard stop: a commit is never a reason to push a project repo. Always scope a push as `git -C <repo> push` so a bare push from the wrong cwd cannot hit a repo you must not push. Create deploy tags only when the user explicitly asks - locally, and NEVER push them; never deploy. Don't tag on your own initiative.
- **Give the owner commands for the owner's shell.** This operator's terminal is Windows PowerShell, where Unix pipes like `curl ... | grep ...` fail outright (`grep` is not on the PATH and bare `curl` is an alias that returns objects). Name your own terminal here, and never propose commands the owner's shell cannot run.
- **When a deploy is broken, FIRST step is to reproduce the build locally** (e.g. `npm run build`). A CI log can show green while the build step actually errored, so run the build, capture the error, and fix it before curling the deployed output or scrolling pipeline logs. The "Do NOT run builds" rule above is about the normal dev flow; diagnostic build runs when the owner is blocked on a stuck deploy are explicitly fine.

## Commit rules

- **Multi-repo commits.** When you commit, check every code repo for the project PLUS the tracking dir at `Claude/<ProjectName>/` and commit in each that has changes.
- **Concise commit messages.** Single-sentence title for small changes. Bulleted body for bigger ones. Each bullet one tight point, never wrapped paragraphs behind one hyphen. Use hyphens (`-`) for bullets.
- **Never em dashes.** Use hyphens, commas, periods, semicolons, parens, or rewrite. Holds in commit messages, code, comments, AND any user-visible string (see "Audience and text" below). This operator's signature hard line; the style gate enforces whichever hard lines you write in its place.
- **No "Generated with Claude Code" footers or emoji signatures.** Also no `Co-Authored-By: Claude <noreply@anthropic.com>` or any variant including a model version. Strip the line before committing.
- **Write commits for outside readers.** Team members reading `git log` have no context on internal tracking docs (`Working/*`), chat sessions, or audit numbering. Never reference item numbers like "#21" or "audit #N" in commit messages. Never use session-referential phrases like "this session", "we just did", "follow-up on the last change". Describe what changed and why in terms a dev reading the commit cold can understand. Professional and direct, not chatty.
- **Tracker repo commit prefix.** Commits to `Claude/<ProjectName>/` get a `<ProjectName>:` title prefix.

## Deploy tagging

Version bumps and `deploy-X.Y.Z` tags follow `STANDARDS/source-control.md`. The binding kernel: an agent tags only on the user's explicit ask, never pushes a tag, never deploys; cadence is per-push or per-feature (bundle commits into one bump); docs-only pushes (nothing that affects the build output) skip the bump and tag entirely.

## Stack defaults

- **No new vendors / frameworks unless the existing toolkit can't do it**: Azure cloud, Node / .NET server, React + TypeScript + Tailwind web, Expo + React Native + Redux Toolkit mobile (this operator's toolkit; name yours). Name any gap and propose an in-toolkit fix before suggesting an addition (`STANDARDS/stack-policy.md`).

## Audience and text

- **Audience is non-technical** for any public-facing surface (customer-facing apps, marketing sites, customer emails). No jargon visible to visitors. Wording describes what the app DOES, not how it's built. This covers internal concerns beyond tech jargon, the funding model especially: a build constraint you were handed (for example "free, a tip jar at most") shapes what you build, not what the page says. Wording that explains how the project is paid for reads as begging, and a tip jar belongs as a quiet optional button, never a sentence in the description. Holds for visible wording, alt text, meta descriptions, public README, App Store / Play Store listings.
- **No em or en dashes in any user-visible string.** This is a hard rule, not a preference. Applies to UI strings, marketing wording, emails, error messages, meta tags, AND any draft wording you show the user that could be lifted into the site. Default to hyphen, comma, period, semicolon, parens, or rewrite. Scan drafts for U+2014 / U+2013 before showing.
- **No colon standing in for an em dash.** A colon that introduces an elaboration or a bare list which should just be a direct sentence is an AI tell, banned the same way the em dash is. Restructure it direct, even if slightly less formal. For example, "production software: web apps, mobile apps, and automations" becomes "production software including web apps, mobile apps, and automations". A colon stays fine in its ordinary roles like clock times, ratios, code or config, a label genuinely followed by its value, or a genuine list introduced by a word like "include" or "as follows".
- **Avoid the word "copy" for marketing text.** This operator reads "copy" as a duplicate, not as website text. Use "wording" / "site text" / "the words on the site" instead.
- **No AI-tell constructions in anything that ships.** These are the giveaways that a human did not write the text, all banned:
  - The dramatic reversal: "It is not X. It is Y.", "You get X, not Y" used as rhetoric.
  - The "No X, just Y" punch: "No run arounds, just results", "No lectures. Just fixes."
  - The dismissive close: "It does X. That's the whole product.", "that's the whole pitch / point / idea". Reads as dismissive on any shipped surface.
  - The trailing "thinking out loud" hedge: a bound or self-qualifier tacked onto the end of a finished claim, the way a person revises mid-speech, like "Setup takes a minute, if that." or "a digital handshake, if you will." Cut the walk-back and state the point once ("Setup takes under a minute."). A genuine numeric bound that carries real information ("a 2 second delay at most") is fine.
  - The announced structure: a sentence that previews the shape of the answer or restates the prompt instead of just giving it ("I've worked with X from both sides.", "I have also worked the Y side.", "let me break this down", "at a high level"). Lead with the substance; a clause opener like "On the server side," is fine, the standalone announcer is the tell.
  - The gluey transition: a vague connective bolted onto the next clause as filler ("Around that", "On top of that", "Beyond that", "That said", "At the end of the day"). Cut it and state the point.
  - The over-qualified noun: stacked appositives or "which ... and which ..." clauses padding a noun. Keep the essential detail and drop the rest.

  Humans, even in highly professional settings, write a bit more casual and direct. State the thing plainly and lead with what is true; skip the theater. Contrast is allowed only when the contrast itself is information, stated flatly ("fixed prices, not open ended hourly" clarifies a pricing model); never as drama. No word salads. Calibration example: "explaining technical problems to people who are not technical is a core skill I developed very early and still use every day" (human) vs "is not a courtesy I added later, it is where I come from" (AI-tell). Holds in marketing wording, in-app strings, store listings, marketplace listings, emails, screenshot scripts, and any draft shown to the user that could be lifted into a shipped surface.

## Startup protocol

The ordered checklist (rule layers, hook payload incl. spilled files, logs skim, Working, RoadMap, cross-user check, confirm) is single-sourced at `STANDARDS/session-protocol.md`. Each project's bible names its own paths.

## Repo / workspace layout

**Canonical layout: `STANDARDS/workspace-layout.md`.**

## Scope and maintenance

Project-specific facts (stack versions, branding, audience, domains, naming, architecture variances) live in that project's own CLAUDE.md, never here. A rule duplicated across 3+ project files gets proposed for promotion here; a rule here that stops applying to a project gets a dual-noted exception in that project file rather than a rewrite of this one.
