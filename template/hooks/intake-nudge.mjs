#!/usr/bin/env node
// UserPromptSubmit intake nudge. Fires ONLY on bare continuation prompts
// (exact matches against the list below), where the prompt carries no intent
// and the tracker state carries all of it. stdout at exit 0 is injected as
// context, so the nudge is one routing line; every other prompt passes in
// silence. Detect-and-route, never re-teach (context-tiers). Infra errors
// degrade to silent pass (the same justified quiet-degrade as the style
// gate: a broken nudge must not block prompts).
import { readFileSync } from "node:fs";

let input = "";
try {
	input = readFileSync(0, "utf8");
} catch {
	process.exit(0);
}
if (input.charCodeAt(0) === 0xfeff) {
	input = input.slice(1);
}

let prompt = "";
try {
	prompt = JSON.parse(input)?.prompt ?? "";
} catch {
	process.exit(0);
}

const CONTINUATIONS = [
	"continue",
	"continue from where you left off",
	"keep going",
	"go on",
	"go",
	"next",
	"carry on",
	"proceed",
	"resume",
	"keep at it",
	"finish it",
	"finish up",
	"do the thing",
	"fix it",
];
const p = prompt.trim().toLowerCase().replace(/[.!]+$/, "");
if (p.length <= 40 && CONTINUATIONS.includes(p)) {
	process.stdout.write(
		"Intake nudge: bare continuation prompt. Reconstruct intent from the tracker state (bible resume point, log tail, TODO), declare your reading in one line, then proceed (STANDARDS/intent-intake.md).\n"
	);
}
process.exit(0);
