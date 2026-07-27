#!/usr/bin/env node
// DirectoryAdded hook (the event ships in Claude Code 2.1.219). Session
// orientation and your excluded-workspace rules are session-start shaped, so
// a directory registered mid-session by /add-dir or the SDK bypasses them.
// This warns loudly when the added path is one of your excluded workspaces,
// and otherwise restates where the added root orients from. Never blocks: a
// non-zero exit on a lifecycle event would wedge the session, so this DETECTS.
import { readFileSync } from "node:fs";

// Workspaces agents must never enter uninvited (your constitution's excluded
// map rows). One regex per excluded path; an empty list means none yet.
const EXCLUDED = [
	// /old-employer/i,
];
// Your workspace root's folder name; the outside-root notice keys on it.
// The default matches the setup helper's default root (a Forge folder).
const ROOT_NAME = /[\\/]forge(?:[\\/]|$)/i;

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
	const added = String(payload.directory ?? payload.path ?? payload.directory_path ?? payload.dir ?? "");
	if (!added) {
		process.exit(0);
	}
	if (EXCLUDED.some(re => re.test(added))) {
		process.stderr.write(
			`Excluded workspace warning: ${added} is excluded by your constitution's map. Do not read, search, or edit anything under it unless the owner named this path in this session, and say so plainly if you believe they did.\n`
		);
		process.exit(0);
	}
	if (!ROOT_NAME.test(added)) {
		process.stderr.write(
			`Directory added outside your workspace root: ${added}. The rule layers still bind (constitution, craft globals, standards via the INDEX). Nothing here carries a project bible, so do not assume a tracker exists for it, and place any durable output back inside your root per the constitution's write-targets rule.\n`
		);
	}
	process.exit(0);
} catch {
	process.exit(0);
}
