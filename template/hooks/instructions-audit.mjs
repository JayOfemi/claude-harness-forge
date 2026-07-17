#!/usr/bin/env node
// InstructionsLoaded audit: appends each loaded instruction-file path to a
// per-session temp marker so the Stop-hook write-back gate can verify that a
// session under your workspace root actually loaded the constitution. Side
// effects only - the event ignores exit codes and output - and errors degrade
// silent: a broken audit must not distort an event the harness cannot act on
// anyway.
import { readFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

try {
	let raw = readFileSync(0, "utf8");
	if (raw.charCodeAt(0) === 0xfeff) {
		raw = raw.slice(1);
	}
	const payload = JSON.parse(raw) ?? {};
	const sessionId = String(payload.session_id ?? "unknown").replace(/[^\w-]/g, "");
	const filePath = String(payload.file_path ?? "");
	if (filePath) {
		appendFileSync(join(tmpdir(), `instructions-audit-${sessionId}`), filePath + "\n");
	}
} catch {}
process.exit(0);
