#!/usr/bin/env bash
# One-command setup for this governance layer on macOS or Linux.
#
# Does the mechanical parts of the quickstart so you do not have to copy paths
# by hand. It copies the template into your root, initializes git, installs the
# ~/.claude pieces, and writes a settings.json with your paths already filled
# in. It changes nothing that only you decide, so your craft rules, your
# git-gate hard lines, and applying the generated settings stay yours.
# It is re-runnable and never overwrites an existing ~/.claude/settings.json.
#
#   bash template/tools/setup.sh --root ~/workspace [--force]
set -euo pipefail

say()  { printf '%s\n' "$1"; }
step() { printf '  %s\n' "$1"; }
warn() { printf 'WARNING: %s\n' "$1" >&2; }
die()  { printf 'STOPPED: %s\n' "$1" >&2; exit 1; }

ROOT=""
FORCE=0
while [ $# -gt 0 ]; do
	case "$1" in
		--root)   [ $# -ge 2 ] || die "--root needs a value (for example --root ~/workspace)"; ROOT="$2"; shift 2 ;;
		--root=*) ROOT="${1#*=}"; shift ;;
		--force)  FORCE=1; shift ;;
		-h|--help) say "usage: setup.sh --root <path> [--force]"; exit 0 ;;
		*) die "unknown argument: $1" ;;
	esac
done
[ -n "$ROOT" ] || die "--root <path> is required (for example --root ~/workspace)"
# The --root=~/x form is not tilde-expanded by the shell, so expand a leading ~ here.
case "$ROOT" in "~") ROOT="$HOME" ;; "~/"*) ROOT="$HOME/${ROOT#\~/}" ;; esac

# 1. Resolve the template dir (the parent of this tools/ folder).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
[ -f "$TEMPLATE_DIR/CLAUDE.md" ] || die "cannot find the template next to this script (expected $TEMPLATE_DIR/CLAUDE.md). Run this from where you extracted the download."

say "Forge setup"
say "  template: $TEMPLATE_DIR"

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
say "  root:     $ROOT_ABS"
say ""

# 3. Copy the template contents into the root (constitution lands at the root).
if [ "$ALREADY_FORGE" -eq 1 ]; then
	step "root is already a Forge, refreshing the harness pieces and settings without re-copying (your filled-in files stay)"
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
#    seats, and the switch). Source mirrors stay at your root.
install_dir() { # <src-rel> <dest-sub> <label>
	local src="$ROOT_ABS/$1" dest="$CLAUDE_DIR/$2"
	if [ ! -e "$src" ]; then warn "expected $src but it is missing, skipping $3"; return; fi
	mkdir -p "$dest"
	cp -R "$src" "$dest/"
	step "installed $3 to $dest"
}
install_md() { # <src-dir-rel> <dest-sub> <label>
	local srcdir="$ROOT_ABS/$1" dest="$CLAUDE_DIR/$2" f
	if [ ! -d "$srcdir" ]; then warn "expected $srcdir but it is missing, skipping $3"; return; fi
	mkdir -p "$dest"
	shopt -s nullglob
	for f in "$srcdir"/*.md; do cp "$f" "$dest/"; done
	shopt -u nullglob
	step "installed $3 to $dest"
}
say ""
say "Installing the harness pieces into $CLAUDE_DIR"
install_dir "skills/forge-onboard" "skills"   "the onboarding skill"
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
	content="${content//<ROOT>/$ROOT_ABS}"
	content="${content//<YOUR-TRACKER-HUB-PATH>/$ROOT_ABS/Claude}"
	content="${content//<YOUR-USER>/$USER_NAME}"
	GEN="$ROOT_ABS/settings.generated.json"
	printf '%s\n' "$content" > "$GEN"
	step "wrote $GEN (paths and user filled in)"
	GLOBAL="$CLAUDE_DIR/settings.json"
	if [ -f "$GLOBAL" ]; then
		step "you already have $GLOBAL, leaving it untouched (merge the hooks, permissions, and env blocks from the generated file into it)"
	else
		mkdir -p "$CLAUDE_DIR"
		printf '%s\n' "$content" > "$GLOBAL"
		step "wrote $GLOBAL (you had none). Review it, then it takes effect from your next session"
	fi
fi

# 7. Print what only you can finish.
say ""
say "Done with the mechanical parts. What is left for you:"
say "  1. Settings: review settings.generated.json in your root. If you already had"
say "     a ~/.claude/settings.json, merge its hooks, permissions, and env blocks in."
say "     You can delete the _instructions key once you have read it."
say "  2. Hard lines: open hooks/git-gate.mjs at your root and replace <YOUR-HARD-LINES>"
say "     with the git operations an agent must never do alone."
say "  3. Craft rules: fill the <YOUR-*> sections in Claude/CLAUDE.md. A worked"
say "     example lives in the examples/ folder from the download (beside template/)."
say "  4. Roles: name the personas in Agents/AGENT_ROLES.md (optional now)."
say "  5. Never-publish list: seed deny-list.txt with your names, employer, and paths."
say ""
say "Then open a NEW session at your root and say: onboard <YourProject>"
say "Hooks load at session start, so the wiring takes effect from your next session, not this shell."
