#!/usr/bin/env node
// Stop-hook write-back detector (the tracker-format resume-point contract).
// Fires AT MOST ONCE per session, and only when the session did real edit
// work but no tracker write-back is visible (no session-log/tracker change
// pending or recently committed in the hub, and no Agents/ capture pending or
// recent in the root for root sessions). On detection: exit 2, which blocks
// the stop once and feeds the reminder back; the per-session marker plus the
// stop_hook_active check make a loop impossible. Everything else: silent
// exit 0. Infra errors degrade to silent pass (the justified quiet-degrade:
// a broken detector must not trap every session at stop).
//
// REQUIRED CONFIGURATION - edit the two lines below before deploying:
//   WRITEBACK_HUB  absolute path to your tracker hub repo (the one that holds
//                  session logs and craft globals)
//   WRITEBACK_ROOT absolute path to your workspace root repo
//
// Both can be overridden at runtime by the same-named env vars (useful for
// automated tests). WRITEBACK_SINCE controls how far back "recent" looks.

// --- edit these two defaults to match your layout ---
const HUB = process.env.WRITEBACK_HUB || "<YOUR-TRACKER-HUB-PATH>";
const ROOT = process.env.WRITEBACK_ROOT || "<YOUR-WORKSPACE-ROOT-PATH>";
// --- end of required configuration ---

const SINCE = process.env.WRITEBACK_SINCE || "8 hours ago";

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

let input = "";
try {
	input = readFileSync(0, "utf8");
} catch {
	process.exit(0);
}
if (input.charCodeAt(0) === 0xfeff) {
	input = input.slice(1);
}

let payload = {};
try {
	payload = JSON.parse(input) ?? {};
} catch {
	process.exit(0);
}
if (payload.stop_hook_active) {
	process.exit(0);
}

const sessionId = String(payload.session_id ?? "unknown").replace(/[^\w-]/g, "");
const marker = join(tmpdir(), `writeback-gate-${sessionId}`);
if (existsSync(marker)) {
	process.exit(0);
}
try {
	writeFileSync(marker, "1");
} catch {
	process.exit(0);
}

// Did this session actually edit anything? The transcript is the signal.
const transcriptPath = payload.transcript_path ?? "";
let didWork = false;
try {
	const t = readFileSync(transcriptPath, "utf8");
	didWork = /"name":\s*"(Edit|Write|MultiEdit)"/.test(t);
} catch {
	process.exit(0);
}
if (!didWork) {
	process.exit(0);
}

function git(repo, args) {
	try {
		return execSync(`git -C "${repo}" ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
	} catch {
		return null;
	}
}

// If the hub/root paths are still placeholders, degrade silently rather than
// throwing a confusing error.
if (HUB.startsWith("<") || ROOT.startsWith("<")) {
	process.exit(0);
}

// Write-back evidence, either pending in the working tree or committed recently.
const hubStatus = git(HUB, "status --porcelain");
const rootStatus = git(ROOT, "status --porcelain");
if (hubStatus === null || rootStatus === null) {
	process.exit(0);
}

// Adapt the patterns below to match the file paths that signal a proper
// write-back in your tracker layout (session log files, roadmap files,
// capture directories, etc.).
const pending = /session_logs\.md|CLAUDE\.md|RoadMap|roadmap/i.test(hubStatus) || /Agents[\\/]/.test(rootStatus);
const hubRecent = git(HUB, `log --since="${SINCE}" --name-only --pretty=format:`) ?? "";
const rootRecent = git(ROOT, `log --since="${SINCE}" --name-only --pretty=format:`) ?? "";
const committed = /Logs\/session_logs\.md/.test(hubRecent) || /Agents\//.test(rootRecent);
if (pending || committed) {
	process.exit(0);
}

process.stderr.write(
	"Write-back check: this session edited files but no tracker write-back is visible (no session-log or capture change, pending or recent). Per the resume-point contract (tracker-format.md), record the sitting and its resume point with a done-when, or state why no write-back applies.\n"
);
process.exit(2);
