#!/usr/bin/env node
// PreToolUse git gate for Bash|PowerShell. Blocks gated git operations
// (commit, push, tag, merge, rebase, reset --hard, checkout --, --amend,
// --force) until re-issued with the CLAUDE_REVIEWED=1 prefix, and fails
// CLOSED: an internal error while a git command may be in flight blocks by
// default (fail-loud.md - gates guard dangerous operations, so an unevaluable
// gate blocks). Plain non-git commands still pass on error - the gate guards
// git, it must not brick the shell.
//
// REQUIRED CONFIGURATION - replace <YOUR-HARD-LINES> in MESSAGE below with
// the push and commit constraints from your craft globals, verbatim. The
// command detection is regex-based and best-effort - a speed bump, not a
// security boundary; pair it with permission rules for anything that must be
// impossible.
import { readFileSync } from "node:fs";

const GATED = /(git +(commit|push|tag|merge|rebase|reset --hard|checkout --)|--amend|--force)/;
const REVIEWED = "CLAUDE_REVIEWED";
const MESSAGE =
	"Git gate: verify this operation against the ALREADY-LOADED rule layers. The hard lines: <YOUR-HARD-LINES>. Then re-issue with the CLAUDE_REVIEWED=1 prefix (PowerShell: $env:CLAUDE_REVIEWED=1; git ...).\n";

let raw = "";
try {
	raw = readFileSync(0, "utf8");
} catch {
	raw = "";
}
try {
	if (raw.charCodeAt(0) === 0xfeff) {
		raw = raw.slice(1);
	}
	const payload = JSON.parse(raw) ?? {};
	const cmd = String(payload.tool_input?.command ?? "");
	if (!GATED.test(cmd) || cmd.includes(REVIEWED)) {
		process.exit(0);
	}
	process.stderr.write(MESSAGE);
	process.exit(2);
} catch (err) {
	if (raw.includes("git ")) {
		process.stderr.write(
			`Git gate: could not evaluate this command (${err?.message ?? "internal error"}); blocked by default. Verify the operation against the rule layers, then re-issue with the CLAUDE_REVIEWED=1 prefix.\n`
		);
		process.exit(2);
	}
	process.exit(0);
}
