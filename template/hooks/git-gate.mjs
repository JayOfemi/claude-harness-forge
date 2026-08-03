#!/usr/bin/env node
// PreToolUse gate for Bash|PowerShell. Splits the command line into shell
// segments, resolves each segment's executable (wrappers unwrapped, git's
// global options walked past), and gates by parsed subcommand, so option
// forms are caught with the plain spelling and a mere mention of a gated
// word inside an argument or a quoted message is not. Gated operations
// block until re-issued with the CLAUDE_REVIEWED=1 prefix; a second tier
// (published-history rewrites, hook skips, pushes to explicit URLs, tag
// pushes) is never agent-clearable. Fails CLOSED per the fail-loud
// standard: an internal error while a gated command may be in flight
// blocks by default; plain unrelated commands still pass on error - the
// gate guards shipping surfaces, it must not brick the shell.
//
// CONFIGURATION - no code to edit. Your hard lines live in
// hooks/hard-lines.txt (quoted in every block message; until it is filled
// the gate still blocks and says what is missing). The non-git tools the
// gate covers (deploy CLIs, package publishes, cloud mutations) live in
// hooks/gated-tools.txt, shipped with generic defaults - trim or extend it
// for your stack; an empty or deleted file means git-only gating. Detection
// is best-effort parsing - a speed bump, not a security boundary; pair it
// with permission rules for anything that must be impossible.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const REVIEWED = "CLAUDE_REVIEWED";
const PLACEHOLDER = "<YOUR-HARD-LINES>";
// The workspace root is this hook's own parent, so the re-issue advice can
// name the -C form the shipped allow rules are scoped to.
const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]+$/, "");
const REISSUE =
	`Then re-issue with the CLAUDE_REVIEWED=1 prefix, keeping the repo scope the permission rules expect, for example: CLAUDE_REVIEWED=1 git -C "${ROOT}" <command> (PowerShell: $env:CLAUDE_REVIEWED=1; git -C "${ROOT}" <command>).\n`;
const HARD_MESSAGE =
	"Git gate: this operation is not agent-clearable. It either rewrites published history, skips the repo's own hooks, pushes to an explicit URL, or pushes tags, and CLAUDE_REVIEWED does not clear it. Report what you need and let the owner run it.\n";

const GIT_GATED = new Set([
	"push", "commit", "merge", "rebase", "am", "cherry-pick", "revert",
	"restore", "clean", "filter-branch", "filter-repo", "send-email", "bundle",
	"update-ref", "prune", "fetch-pack", "push-all",
]);
// Flags that gate whatever git verb carries them. Tested ONLY against a git
// invocation's own tokens; run against the whole command line, a bare -f
// would block ordinary shell work (rm -f, tail -f) with a git message.
const GATED_FLAGS = /^(--amend|--force(-with-lease)?(=.*)?|-f)$/;
const TAG_READONLY = new Set(["-l", "--list", "-n", "--contains", "--no-contains", "--sort", "--points-at", "--merged", "--no-merged", "--format", "-i", "--ignore-case"]);
// Subcommands destructive only in certain forms; value tests the argument list.
const GIT_CONDITIONAL = {
	reset:    a => a.some(t => t === "--hard" || t === "--merge" || t === "--keep"),
	checkout: a => a.includes("--") || a.includes("-f") || a.includes("--force"),
	switch:   a => a.some(t => t === "-f" || t === "--force" || t === "--discard-changes"),
	stash:    a => a.some(t => t === "drop" || t === "clear" || t === "pop"),
	branch:   a => a.some(t => t === "-D" || t === "-d" || t === "--delete"),
	reflog:   a => a.includes("expire"),
	rm:       a => !a.includes("--cached"),
	tag:      a => a.length > 0 && !a.some(t => TAG_READONLY.has(t.split("=")[0])),
	gc:       a => a.some(t => t.startsWith("--prune")),
	worktree: a => a.some(t => ["add", "remove", "move", "prune"].includes(t)),
	remote:   a => a.some(t => ["add", "remove", "rename", "set-url", "prune"].includes(t)),
	config:   a => !a.some(t => t === "--get" || t === "--get-all" || t === "--get-regexp" || t === "--list" || t === "-l"),
	submodule: a => a.some(t => ["add", "deinit", "update"].includes(t)),
};
const SHELL_WRAPPERS = new Set(["sh", "bash", "zsh", "dash", "cmd", "powershell", "pwsh"]);
const CMD_WRAPPERS = new Set(["env", "nohup", "xargs", "start", "sudo", "doas", "stdbuf", "winpty", "command", "time", "timeout"]);
// The flag whose VALUE is the command to run. Kept apart from the wrapper's
// other options: treating any known flag as the introducer let a leading
// -NoProfile make "-Command" read as the executable, which skipped the gate.
const WRAPPER_INTRODUCERS = new Set(["-c", "/c", "/k", "-command", "-encodedcommand", "-file"]);
// Bundled short options ending in c (bash -lc, sh -euc) introduce a command too.
const BUNDLED_INTRODUCER = /^-[a-z]*c$/i;
// Options these wrappers consume a following value for, so the value is never
// mistaken for the wrapped command.
const CMD_WRAPPER_VALUE_OPTS = {
	sudo: new Set(["-u", "--user", "-g", "--group", "-p", "--prompt", "-C", "--close-from", "-h", "--host", "-R", "--chroot", "-D", "--chdir"]),
	doas: new Set(["-u", "-C"]),
	xargs: new Set(["-n", "--max-args", "-I", "--replace", "-P", "--max-procs", "-d", "--delimiter", "-E", "-L", "-s", "--max-chars", "-a", "--arg-file"]),
	stdbuf: new Set(["-i", "--input", "-o", "--output", "-e", "--error"]),
	env: new Set(["-u", "--unset", "-C", "--chdir", "-S", "--split-string"]),
	timeout: new Set(["-s", "--signal", "-k", "--kill-after"]),
};
// Wrappers taking a positional of their own before the command they run.
const CMD_WRAPPER_POSITIONAL = { timeout: /^\d+(\.\d+)?[smhd]?$/i };

// The non-git inventory is data, not code; hooks/gated-tools.txt carries
// always-gated CLIs and "cli: word ..." verb-conditional entries.
function toolRules() {
	const rules = { always: new Set(), verbs: new Map() };
	try {
		let text = readFileSync(new URL("gated-tools.txt", import.meta.url), "utf8");
		if (text.charCodeAt(0) === 0xfeff) {
			text = text.slice(1);
		}
		for (const line of text.split(/\r?\n/)) {
			const entry = line.replace(/#.*$/, "").trim();
			if (!entry) {
				continue;
			}
			const colon = entry.indexOf(":");
			if (colon === -1) {
				rules.always.add(entry.toLowerCase());
				continue;
			}
			const name = entry.slice(0, colon).trim().toLowerCase();
			const words = entry.slice(colon + 1).toLowerCase().split(/\s+/).filter(Boolean);
			if (!name) {
				continue;
			}
			// A trailing colon with no words would silently drop the tool, so
			// treat it as the always-gated form rather than as no coverage.
			if (words.length) {
				rules.verbs.set(name, words);
			} else {
				rules.always.add(name);
			}
		}
	} catch {
		// Missing or unreadable file is the documented git-only mode.
	}
	return rules;
}
const TOOLS = toolRules();

// Quote-aware tokenizer; unquoted ; | & ( ) and newlines become segment
// separators and an unquoted # starts a comment, so a gated word inside a
// comment is inert and a parenthesized subshell is still seen.
function tokenize(src) {
	const out = [];
	let cur = "";
	let quoted = false;
	let has = false;
	const push = () => {
		if (has) {
			out.push({ text: cur, quoted });
		}
		cur = "";
		quoted = false;
		has = false;
	};
	for (let i = 0; i < src.length; i++) {
		const c = src[i];
		if (c === "'" || c === '"' || c === "`") {
			const end = src.indexOf(c, i + 1);
			const body = end === -1 ? src.slice(i + 1) : src.slice(i + 1, end);
			cur += body;
			quoted = true;
			has = true;
			i = end === -1 ? src.length : end;
			continue;
		}
		if (c === "#" && !has) {
			const nl = src.indexOf("\n", i);
			i = nl === -1 ? src.length : nl;
			continue;
		}
		if (c === ";" || c === "\n" || c === "|" || c === "&" || c === "(" || c === ")") {
			push();
			if ((c === "|" || c === "&") && src[i + 1] === c) {
				i++;
			}
			out.push({ op: true });
			continue;
		}
		if (c === " " || c === "\t" || c === "\r") {
			push();
			continue;
		}
		cur += c;
		has = true;
	}
	push();
	return out;
}

function segments(src) {
	const segs = [];
	let cur = [];
	for (const t of tokenize(src)) {
		if (t.op) {
			if (cur.length) {
				segs.push(cur);
			}
			cur = [];
		} else {
			cur.push(t);
		}
	}
	if (cur.length) {
		segs.push(cur);
	}
	return segs;
}

function baseName(p) {
	const tail = p.split(/[\\/]/).pop() ?? p;
	return tail.replace(/\.(exe|cmd|bat|ps1)$/i, "").toLowerCase();
}

// Strips git's global options so the token after them is the real subcommand.
function gitSubcommand(args) {
	const valueOpts = new Set(["-C", "-c", "--namespace", "--exec-path", "--git-dir", "--work-tree", "--config-env"]);
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (valueOpts.has(a)) {
			i++;
			continue;
		}
		if (a.startsWith("-")) {
			continue;
		}
		return { name: a.toLowerCase(), rest: args.slice(i + 1) };
	}
	return { name: "", rest: [] };
}

// A shell wrapper runs what follows its introducer, so the LAST introducer wins
// and the wrapper's own options can never shadow it. With no introducer, only
// leading options are skipped, so the wrapped command keeps its own flags.
function shellWrapperBody(tokens, start) {
	const after = tokens.slice(start);
	let flagAt = -1;
	for (let k = 0; k < after.length; k++) {
		const low = after[k].text.toLowerCase();
		if (!after[k].quoted && (WRAPPER_INTRODUCERS.has(low) || BUNDLED_INTRODUCER.test(low))) {
			flagAt = k;
		}
	}
	let body = flagAt === -1 ? after : after.slice(flagAt + 1);
	let b = 0;
	while (b < body.length && /^[-/]/.test(body[b].text)) {
		b++;
	}
	body = body.slice(b);
	return body.map(t => t.text).join(" ");
}

// Skips only the wrapper's OWN options (consuming a value where the option
// takes one) and hands the rest through untouched. Filtering every flag here
// stripped --force and --no-verify off the inner command before it was judged.
function cmdWrapperBody(exe, tokens, start) {
	const valueOpts = CMD_WRAPPER_VALUE_OPTS[exe] ?? new Set();
	let k = start;
	while (k < tokens.length) {
		const text = tokens[k].text;
		if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(text)) {
			k++;
			continue;
		}
		if (!/^[-/]/.test(text)) {
			break;
		}
		k++;
		if (valueOpts.has(text)) {
			k++;
		}
	}
	const positional = CMD_WRAPPER_POSITIONAL[exe];
	if (positional && k < tokens.length && positional.test(tokens[k].text)) {
		k++;
	}
	return tokens.slice(k);
}

function gatedSegment(tokens, depth) {
	const words = tokens.map(t => t.text);
	let i = 0;
	while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) {
		i++;
	}
	const exeToken = tokens[i];
	if (!exeToken) {
		return false;
	}
	const exe = baseName(exeToken.text);
	const args = words.slice(i + 1);
	if (depth < 3 && SHELL_WRAPPERS.has(exe)) {
		const target = shellWrapperBody(tokens, i + 1);
		return target ? segments(target).some(s => gatedSegment(s, depth + 1)) : false;
	}
	if (depth < 3 && CMD_WRAPPERS.has(exe)) {
		const body = cmdWrapperBody(exe, tokens, i + 1);
		return body.length ? gatedSegment(body, depth + 1) : false;
	}
	if (exe === "git") {
		if (args.some(a => GATED_FLAGS.test(a))) {
			return true;
		}
		// An inline alias hides its verb behind a name, so gate the invocation.
		if (args.some((a, k) => a === "-c" && /^alias\./i.test(args[k + 1] ?? ""))) {
			return true;
		}
		const { name, rest } = gitSubcommand(args);
		if (GIT_GATED.has(name)) {
			return true;
		}
		const cond = GIT_CONDITIONAL[name];
		return cond ? cond(rest) : false;
	}
	if (TOOLS.always.has(exe)) {
		return true;
	}
	const verbs = TOOLS.verbs.get(exe);
	if (verbs) {
		return args.some(a => verbs.includes(a.toLowerCase()));
	}
	return false;
}

// Published-history rewrites, hook skips, pushes to an explicit URL, and tag
// pushes all end at the owner; CLAUDE_REVIEWED must not clear them.
function hardSegment(tokens, depth) {
	const words = tokens.map(t => t.text);
	let i = 0;
	while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) {
		i++;
	}
	const exeToken = tokens[i];
	if (!exeToken) {
		return false;
	}
	const exe = baseName(exeToken.text);
	const args = words.slice(i + 1);
	if (depth < 3 && SHELL_WRAPPERS.has(exe)) {
		const target = shellWrapperBody(tokens, i + 1);
		return target ? segments(target).some(s => hardSegment(s, depth + 1)) : false;
	}
	if (depth < 3 && CMD_WRAPPERS.has(exe)) {
		const body = cmdWrapperBody(exe, tokens, i + 1);
		return body.length ? hardSegment(body, depth + 1) : false;
	}
	if (exe !== "git") {
		return false;
	}
	if (args.includes("--no-verify") || args.includes("--no-gpg-sign")) {
		return true;
	}
	// Pointing hooksPath away is the same hook skip as --no-verify.
	if (args.some((a, k) => a === "-c" && /^core\.hookspath=/i.test(args[k + 1] ?? ""))) {
		return true;
	}
	const { name, rest } = gitSubcommand(args);
	if (name === "filter-branch" || name === "filter-repo") {
		return true;
	}
	if (name === "reflog" && rest.includes("expire")) {
		return true;
	}
	if (name === "gc" && rest.some(t => t.startsWith("--prune"))) {
		return true;
	}
	if (name !== "push") {
		return false;
	}
	return rest.some(t =>
		t === "--force" || t === "-f" || t.startsWith("--force-with-lease") || t === "--mirror" ||
		t === "--tags" || t === "--follow-tags" || t === "--delete" ||
		t.includes("://") || /^[\w.-]+@[\w.-]+:/.test(t) || t.startsWith("+refs/") ||
		// A tag refspec on either side of src:dst, and the colon form of a
		// remote delete, are the same operations as --tags and --delete.
		/(^|:)\+?refs\/tags\//.test(t) || /^\+?:./.test(t)
	);
}

// The review prefix counts only at the head of the command line (its first
// segment), so the token quoted in a commit message, buried mid-line, or
// appended after a gated command cannot wave anything through.
function isReviewed(src) {
	const seg = segments(src)[0];
	if (!seg) {
		return false;
	}
	// Joined so the spaced PowerShell spelling ($env:NAME = 1), which the
	// tokenizer splits into three tokens, clears like the unspaced one.
	const head = seg.slice(0, 4).map(t => t.text).join(" ");
	const assign = "\\s*=\\s*['\"]?1['\"]?(\\s|$)";
	if (new RegExp("^\\$env:" + REVIEWED + assign, "i").test(head)) {
		return true;
	}
	if (new RegExp("^" + REVIEWED + assign).test(head)) {
		return true;
	}
	return new RegExp("^set\\s+" + REVIEWED + assign, "i").test(head);
}

// Unreadable, empty, or still the placeholder all read as "not configured";
// the gate blocks either way (fail closed), the message says what to fix.
function hardLines() {
	try {
		let text = readFileSync(new URL("hard-lines.txt", import.meta.url), "utf8");
		if (text.charCodeAt(0) === 0xfeff) {
			text = text.slice(1);
		}
		text = text.trim();
		return text === "" || text.includes(PLACEHOLDER) ? null : text;
	} catch {
		return null;
	}
}

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
	const rawCmd = payload.tool_input?.command ?? "";
	const cmd = Array.isArray(rawCmd) ? rawCmd.join(" ") : String(rawCmd);
	const segs = segments(cmd);
	if (segs.some(s => hardSegment(s, 0))) {
		process.stderr.write(HARD_MESSAGE);
		process.exit(2);
	}
	if (isReviewed(cmd) || !segs.some(s => gatedSegment(s, 0))) {
		process.exit(0);
	}
	const lines = hardLines();
	process.stderr.write(
		lines === null
			? `Git gate: hooks/hard-lines.txt is not filled in yet, so verify this operation against the ALREADY-LOADED rule layers yourself. Ask the user to state their hard lines and write them to that file (or offer the rules interview). ${REISSUE}`
			: `Git gate: verify this operation against the ALREADY-LOADED rule layers.\nThe hard lines: ${lines}\n${REISSUE}`
	);
	process.exit(2);
} catch (err) {
	const names = ["git", ...TOOLS.always, ...TOOLS.verbs.keys()]
		.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	if (new RegExp("\\b(" + names.join("|") + ")\\b", "i").test(raw)) {
		process.stderr.write(
			`Git gate: could not evaluate this command (${err?.message ?? "internal error"}); blocked by default. Verify the operation against the rule layers, then re-issue with the CLAUDE_REVIEWED=1 prefix.\n`
		);
		process.exit(2);
	}
	process.exit(0);
}
