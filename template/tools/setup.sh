#!/usr/bin/env bash
# One-command setup for this governance layer on macOS or Linux.
#
# Does the mechanical parts of the quickstart so you do not have to copy paths
# by hand. It copies the template into your root, initializes git, installs the
# ~/.claude pieces, and writes a settings.json with your paths already filled
# in. It changes nothing that only you decide, so your craft rules and your
# git-gate hard lines stay yours. Re-runnable and careful with an existing
# ~/.claude: anything it replaces is backed up first to a timestamped folder,
# and an existing settings.json is MERGED (your settings kept, Forge entries
# added, every change printed; where a value truly conflicts the Forge value
# wins and says so).
#
#   bash template/tools/setup.sh [--root <path>] [--force]
# The root defaults to a Forge folder in your home folder (~/Forge).
set -euo pipefail
# bash 5.2+ expands & in unquoted ${var//pat/rep} replacements; a root path
# containing & would corrupt every generated settings value without this.
shopt -u patsub_replacement 2>/dev/null || true

say()  { printf '%s\n' "$1"; }
step() { printf '  %s\n' "$1"; }
warn() { printf 'WARNING: %s\n' "$1" >&2; }
die()  { printf 'STOPPED: %s\n' "$1" >&2; exit 1; }

ROOT=""
FORCE=0
while [ $# -gt 0 ]; do
	case "$1" in
		--root)   [ $# -ge 2 ] || die "--root needs a value (for example --root ~/my-forge)"; ROOT="$2"; shift 2 ;;
		--root=*) ROOT="${1#*=}"; shift ;;
		--force)  FORCE=1; shift ;;
		-h|--help) say "usage: setup.sh [--root <path>] [--force]  (root defaults to ~/Forge)"; exit 0 ;;
		*) die "unknown argument: $1" ;;
	esac
done
[ -n "$ROOT" ] || ROOT="$HOME/Forge"
# The --root=~/x form is not tilde-expanded by the shell, so expand a leading ~ here.
case "$ROOT" in "~") ROOT="$HOME" ;; "~/"*) ROOT="$HOME/${ROOT#\~/}" ;; esac

# 1. Resolve the template dir (the parent of this tools/ folder).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
[ -f "$TEMPLATE_DIR/CLAUDE.md" ] || die "cannot find the template next to this script (expected $TEMPLATE_DIR/CLAUDE.md). Run this from where you extracted the download."

say "Forge setup"
say "  template source: $TEMPLATE_DIR"

# 2. Guard the root. An existing Forge root is fine (we re-install and refresh
#    settings); a non-empty non-Forge folder needs --force so nothing is buried.
# A real Forge root carries several markers, not just any CLAUDE.md, so an
# unrelated project that happens to have a CLAUDE.md is not mistaken for one.
ALREADY_FORGE=0
if [ -f "$ROOT/CLAUDE.md" ] && [ -f "$ROOT/STANDARDS/INDEX.md" ] && [ -f "$ROOT/.claude-settings-template.json" ]; then ALREADY_FORGE=1; fi
if [ -d "$ROOT" ] && [ "$ALREADY_FORGE" -eq 0 ]; then
	if [ -n "$(ls -A "$ROOT" 2>/dev/null)" ] && [ "$FORCE" -eq 0 ]; then
		die "$ROOT is not empty and has no Forge constitution. Re-run with --force to set up here anyway, or pick an empty folder."
	fi
fi
mkdir -p "$ROOT"
ROOT_ABS="$(cd "$ROOT" && pwd)"
CLAUDE_DIR="$HOME/.claude"
USER_NAME="$(id -un 2>/dev/null || echo "${USER:-user}")"
say "  workspace root:  $ROOT_ABS"
say ""
say "About to (anything already in place is kept as is):"
say "  1. copy the template into $ROOT_ABS, which becomes your workspace root"
say "  2. start a git repo there and make the first commit"
say "  3. install the harness pieces into $CLAUDE_DIR (the onboarding and rules-interview skills, the routing seats, the /model-routing command)"
say "  4. fill in your settings (an existing settings.json is merged, never overwritten; anything replaced is backed up first)"
say ""

# 3. Copy the template contents into the root (constitution lands at the root).
if [ "$ALREADY_FORGE" -eq 1 ]; then
	step "root is already a Forge, refreshing the harness pieces and settings without re-copying (your filled-in files stay)"
	# New-in-a-later-release template files an older root lacks: add them when
	# absent (a filled-in copy is never touched), so the closing steps stay true.
	for rel in "hooks/hard-lines.txt" "skills/forge-rules"; do
		if [ -e "$TEMPLATE_DIR/$rel" ] && [ ! -e "$ROOT_ABS/$rel" ]; then
			mkdir -p "$(dirname "$ROOT_ABS/$rel")"
			cp -R "$TEMPLATE_DIR/$rel" "$ROOT_ABS/$rel"
			step "added $rel (new since this root was set up)"
		fi
	done
	# An older gate still carrying the inline placeholder holds nothing of the
	# adopter's, so it is safe to swap for the version that reads the data file.
	if [ -f "$ROOT_ABS/hooks/git-gate.mjs" ] && grep -qF "The hard lines: <YOUR-HARD-LINES>" "$ROOT_ABS/hooks/git-gate.mjs"; then
		cp "$TEMPLATE_DIR/hooks/git-gate.mjs" "$ROOT_ABS/hooks/git-gate.mjs"
		step "updated hooks/git-gate.mjs (it was unconfigured; hard lines now live in hooks/hard-lines.txt)"
	fi
else
	step "copying the template into the root"
	cp -R "$TEMPLATE_DIR/." "$ROOT_ABS/"
fi

# 4. Initialize git and make the first commit (best effort; a missing git or an
#    unset identity is a warning, never a stop).
if ! command -v git >/dev/null 2>&1; then
	warn "git was not found, skipping repo init. Install git, then run 'git init -b main' in your root."
elif [ -d "$ROOT_ABS/.git" ]; then
	step "git repo already present, leaving it as is"
else
	step "initializing the git repo"
	git -C "$ROOT_ABS" init -b main >/dev/null 2>&1 || { git -C "$ROOT_ABS" init >/dev/null 2>&1 || true; git -C "$ROOT_ABS" branch -M main >/dev/null 2>&1 || true; }
	git -C "$ROOT_ABS" add -A >/dev/null 2>&1 || true
	if ! git -C "$ROOT_ABS" commit -m "Initial Forge workspace" >/dev/null 2>&1; then
		warn "could not create the first commit (is your git user.name and user.email set?). Commit yourself later with: git -C \"$ROOT_ABS\" commit -m \"Initial Forge workspace\""
	fi
fi

# The enforcement hooks are Node scripts, so warn now if Node is missing rather
# than let every gate silently no-op at session time.
if ! command -v node >/dev/null 2>&1; then
	warn "Node.js was not found on your PATH. The enforcement hooks are small Node scripts, so install Node.js (nodejs.org) before your next session or they will not run."
fi

# 5. Install the harness pieces into ~/.claude (the front door, the routing
#    seats, and the switch). Source mirrors stay at your root. Never blind:
#    identical files are skipped, and anything replaced is backed up first.
BACKUP_DIR="$CLAUDE_DIR/forge-setup-backup-$(date +%Y%m%d-%H%M%S)"
backup_target() { # <path> <rel>
	local dest="$BACKUP_DIR/$2"
	mkdir -p "$(dirname "$dest")"
	cp -R "$1" "$dest"
}
install_dir() { # <src-rel> <dest-sub> <label>
	local src="$ROOT_ABS/$1" dest="$CLAUDE_DIR/$2" name target
	if [ ! -e "$src" ]; then warn "expected $src but it is missing, skipping $3"; return; fi
	mkdir -p "$dest"
	name="$(basename "$src")"
	target="$dest/$name"
	if [ -e "$target" ]; then
		if diff -rq "$src" "$target" >/dev/null 2>&1; then
			step "$3 already current"
			return
		fi
		backup_target "$target" "$2/$name"
		rm -rf "$target"
		cp -R "$src" "$dest/"
		step "replaced $3 (your version is backed up)"
		return
	fi
	cp -R "$src" "$dest/"
	step "installed $3 to $dest"
}
install_md() { # <src-dir-rel> <dest-sub> <label>
	local srcdir="$ROOT_ABS/$1" dest="$CLAUDE_DIR/$2" f base new=0 cur=0 rep=0
	if [ ! -d "$srcdir" ]; then warn "expected $srcdir but it is missing, skipping $3"; return; fi
	mkdir -p "$dest"
	shopt -s nullglob
	for f in "$srcdir"/*.md; do
		base="$(basename "$f")"
		if [ -f "$dest/$base" ]; then
			if cmp -s "$f" "$dest/$base"; then
				cur=$((cur+1))
				continue
			fi
			backup_target "$dest/$base" "$2/$base"
			cp "$f" "$dest/$base"
			step "replaced $base in $dest (your version is backed up)"
			rep=$((rep+1))
			continue
		fi
		cp "$f" "$dest/"
		new=$((new+1))
	done
	shopt -u nullglob
	step "$3 to $dest: $new installed, $cur already current, $rep replaced"
}
say ""
say "Installing the harness pieces into $CLAUDE_DIR"
install_dir "skills/forge-onboard" "skills"   "the onboarding skill"
install_dir "skills/forge-rules"   "skills"   "the rules-interview skill"
install_md  "subagents"            "agents"   "the model-routing seats"
install_md  "commands"             "commands" "the /model-routing command"

# 6. Pre-fill the settings file with your paths and your OS user. Written to the
#    root as settings.generated.json; also written to ~/.claude/settings.json
#    only if you do not have one yet.
say ""
say "Preparing your settings"
TPL="$ROOT_ABS/.claude-settings-template.json"
if [ ! -f "$TPL" ]; then
	warn "settings template missing at $TPL, skipping the settings step"
else
	content="$(cat "$TPL")"
	content="${content//<ROOT>/"$ROOT_ABS"}"
	content="${content//<YOUR-TRACKER-HUB-PATH>/"$ROOT_ABS/Claude"}"
	content="${content//<YOUR-USER>/"$USER_NAME"}"
	GEN="$ROOT_ABS/settings.generated.json"
	printf '%s\n' "$content" > "$GEN"
	step "wrote $GEN (paths and user filled in)"
	GLOBAL="$CLAUDE_DIR/settings.json"
	if [ -f "$GLOBAL" ]; then
		# Merge, never clobber: your settings survive, Forge entries are added,
		# and a real conflict resolves Forge-wins with a printed CONFLICT line.
		if ! command -v node >/dev/null 2>&1; then
			warn "node is missing, so the settings merge was skipped. Merge the hooks, permissions, and env blocks from $GEN into $GLOBAL by hand."
		else
			TMP="$ROOT_ABS/settings.merged.tmp.json"
			if MERGE_OUT="$(node "$ROOT_ABS/tools/merge-settings.mjs" "$GLOBAL" "$GEN" "$TMP" 2>&1)"; then
				printf '%s\n' "$MERGE_OUT" | while IFS= read -r line; do
					case "$line" in
						CONFLICT*) warn "$line" ;;
						*) step "$line" ;;
					esac
				done
				if cmp -s "$TMP" "$GLOBAL"; then
					rm -f "$TMP"
				else
					backup_target "$GLOBAL" "settings.json"
					mv "$TMP" "$GLOBAL"
					step "merged the Forge wiring into $GLOBAL (your original is backed up)"
				fi
			else
				rm -f "$TMP"
				warn "settings merge failed ($MERGE_OUT). $GLOBAL is left untouched; merge the hooks, permissions, and env blocks from $GEN by hand."
			fi
		fi
	else
		mkdir -p "$CLAUDE_DIR"
		# Fresh writes route through the merge tool too, so _instructions
		# (setup guidance, not wiring) never lands in a deployed settings file.
		wrote=0
		if command -v node >/dev/null 2>&1; then
			EMPTY="$ROOT_ABS/settings.empty.tmp.json"
			TMP="$ROOT_ABS/settings.merged.tmp.json"
			printf '%s\n' "{}" > "$EMPTY"
			if node "$ROOT_ABS/tools/merge-settings.mjs" "$EMPTY" "$GEN" "$TMP" >/dev/null 2>&1; then
				mv "$TMP" "$GLOBAL"
				wrote=1
			else
				rm -f "$TMP"
			fi
			rm -f "$EMPTY"
		fi
		if [ "$wrote" -eq 0 ]; then
			printf '%s\n' "$content" > "$GLOBAL"
			warn "wrote the settings as-is; delete the _instructions key from it after reading"
		fi
		step "wrote $GLOBAL (you had none). Review it, then it takes effect from your next session"
	fi
fi

# 7. Print where everything went and what only you can finish.
say ""
say "Done with the mechanical parts. Where everything went:"
say "  your workspace root: $ROOT_ABS (the whole layer lives here; open agent sessions here)"
say "  for Claude Code:     $CLAUDE_DIR (the skills, the seats, the command, your settings)"
say ""
say "What is left for you (paths are inside your workspace root):"
say "  1. Settings: review ~/.claude/settings.json (written or merged above; any"
say "     CONFLICT lines show where a Forge value replaced yours). The Forge-only"
say "     reference copy is settings.generated.json in your root."
say "  2. Hard lines: put the git operations an agent must never do alone into"
say "     hooks/hard-lines.txt (or say 'fill my rules' in your first session and the interview writes them)."
say "  3. Craft rules: fill the <YOUR-*> sections in Claude/CLAUDE.md. A worked"
say "     example lives in the examples/ folder from the download (beside template/)."
say "  4. Roles: name the personas in Agents/AGENT_ROLES.md (optional now)."
say "  5. Never-publish list: seed deny-list.txt with your names, employer, and paths."
say "  6. Optional, the rest of the kit: npx @jayofemi/toolbox add wording gatekeeper reroute-task ask-model screenshot startup"
say "     (companion skills and commands; the seats and /model-routing installed above stay the template's)"
if [ -d "$BACKUP_DIR" ]; then
	say ""
	say "Everything replaced was backed up first: $BACKUP_DIR"
fi
say ""
say "Then open a NEW session in $ROOT_ABS and say: onboard <YourProject>"
say "The best ways to use it from there: docs/using-the-forge.md in this download (beside template/)."
say "Hooks load at session start, so the wiring takes effect from your next session, not this shell."
