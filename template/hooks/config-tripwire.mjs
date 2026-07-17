#!/usr/bin/env node
// ConfigChange tamper tripwire: detection only, never blocks. Surfaces which
// settings source changed mid-session, because agents edit settings only on
// the operator's explicit instruction - an unexplained firing means tampering
// or drift. Always exits 0: on this event a non-zero exit BLOCKS the config
// change, and a broken tripwire must never lock config (detector, not gate).
import { readFileSync } from "node:fs";

let source = "a settings file";
try {
	let raw = readFileSync(0, "utf8");
	if (raw.charCodeAt(0) === 0xfeff) {
		raw = raw.slice(1);
	}
	source = String(JSON.parse(raw)?.config_source ?? source);
} catch {}
try {
	process.stdout.write(
		JSON.stringify({
			systemMessage: `Config tripwire: ${source} changed mid-session. Agents edit settings only on the operator's explicit instruction; if no session was sanctioned to touch config, review the change before trusting this session further.`,
		})
	);
} catch {}
process.exit(0);
