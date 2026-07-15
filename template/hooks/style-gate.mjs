#!/usr/bin/env node
// PostToolUse detect-only style gate for Edit|Write|MultiEdit.
// Scans ONLY the content the tool call INTRODUCED (new_string / content /
// edits[].new_string), never the whole file: pre-existing violations in
// untouched lines are out of scope by the change-scope rule (a stylistic
// sweep of unrelated lines is itself the defect). Silent (exit 0) when
// the introduced text is clean; exit 2 with findings when it carries a
// fail-severity violation. Rules are loaded from the module at the path
// given by the HOUSE_RULES env var, falling back to the sibling
// house-rules.mjs. Infra errors degrade to silent pass on purpose: a
// broken detector must not tax or block every edit (the one narrow
// quiet-degrade fail-loud allows).
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_RULES = join(dirname(fileURLToPath(import.meta.url)), "house-rules.mjs");
const RULES_PATH = process.env.HOUSE_RULES || DEFAULT_RULES;

let input = "";
try {
	input = readFileSync(0, "utf8");
} catch {
	process.exit(0);
}
// BOM strip: PowerShell 5.1 BOM-prefixes piped stdin on Windows.
if (input.charCodeAt(0) === 0xfeff) {
	input = input.slice(1);
}

let ti = null;
let filePath = "";
try {
	const payload = JSON.parse(input) ?? {};
	ti = payload.tool_input ?? {};
	filePath = ti.file_path ?? "(edited file)";
} catch {
	process.exit(0);
}

// Collect only the text THIS tool call introduced.
const introduced = [];
if (typeof ti.new_string === "string") {
	introduced.push(ti.new_string);
}
if (typeof ti.content === "string") {
	introduced.push(ti.content);
}
if (Array.isArray(ti.edits)) {
	for (const e of ti.edits) {
		if (typeof e?.new_string === "string") {
			introduced.push(e.new_string);
		}
	}
}
if (introduced.length === 0) {
	process.exit(0);
}

let scanText;
try {
	({ scanText } = await import(pathToFileURL(RULES_PATH).href));
} catch {
	// Quiet degrade: a missing or broken rules module must not block every edit.
	process.exit(0);
}

const fails = introduced
	.flatMap((t) => scanText(t, filePath))
	.filter((f) => f.severity === "fail");
if (fails.length === 0) {
	process.exit(0);
}
const lines = fails.slice(0, 5).map((f) => `${f.file}:${f.line}:${f.col} ${f.message}\n    ${f.context}`);
process.stderr.write(`Style gate: rule violation in the text this edit INTRODUCED. Fix them (pre-existing violations in untouched lines stay).\n${lines.join("\n")}\n`);
process.exit(2);
