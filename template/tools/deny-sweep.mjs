#!/usr/bin/env node
// The never-publish gate. Scans a target tree for any string from your
// deny list and exits 1 on ANY hit. A hit is a hard stop, not a warning:
// a single match means private content has leaked into a shippable artifact.
//
// Ship this tool in your own template repurposed for your never-publish list
// (people's names, internal project codenames, account IDs, private hostnames,
// employer references, anything that must never appear in a public repo).
// The deny list itself never ships - it is made of the things it protects.
//
//   node tools/deny-sweep.mjs <target-dir> [--list <file>] [--allow <relpath>:<pattern>]...
//
// The list file defaults to ../deny-list.txt relative to this script. Supply
// --list <file> to point at a different path.
//
// List format: one pattern per line, # comments allowed.
//   plain text  - matched case-insensitively as a substring
//   cs:<text>   - matched case-sensitively as a substring
//
// --allow sanctions ONE pattern in ONE file (path relative to the target),
// for content that must legitimately carry it (a LICENSE needs its copyright
// holder). Every allowance is printed, never silent, and the file still gets
// swept for every other pattern.
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const target = args[0];
if (!target) {
	console.error("usage: deny-sweep.mjs <target-dir> [--list <file>] [--allow <relpath>:<pattern>]...");
	process.exit(2);
}
const listIdx = args.indexOf("--list");
const listPath = listIdx >= 0 ? args[listIdx + 1] : join(dirname(fileURLToPath(import.meta.url)), "..", "deny-list.txt");

const allows = [];
for (let i = 1; i < args.length - 1; i++) {
	if (args[i] !== "--allow") {
		continue;
	}
	const spec = args[i + 1];
	const sep = spec.indexOf(":");
	if (sep < 1 || sep === spec.length - 1) {
		console.error(`bad --allow spec: ${spec} (expected <relpath>:<pattern>)`);
		process.exit(2);
	}
	allows.push({ file: spec.slice(0, sep).replace(/\\/g, "/"), p: spec.slice(sep + 1).toLowerCase() });
}

const raw = readFileSync(listPath, "utf8").split(/\r?\n/);
const patterns = [];
for (const line of raw) {
	const t = line.trim();
	if (!t || t.startsWith("#")) {
		continue;
	}
	if (t.startsWith("cs:")) {
		patterns.push({ p: t.slice(3), cs: true });
	} else {
		patterns.push({ p: t.toLowerCase(), cs: false });
	}
}

const SKIP_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".woff", ".woff2", ".ttf", ".lockb"]);
const rootAbs = resolve(target);
let hits = 0;
let files = 0;
(function walk(d) {
	for (const e of readdirSync(d, { withFileTypes: true })) {
		if (e.name === "node_modules" || e.name === ".git") {
			continue;
		}
		const f = join(d, e.name);
		if (e.isDirectory()) {
			walk(f);
			continue;
		}
		if (SKIP_EXT.has(e.name.slice(e.name.lastIndexOf(".")).toLowerCase())) {
			continue;
		}
		files++;
		let text;
		try {
			text = readFileSync(f, "utf8");
		} catch {
			// A never-publish gate fails CLOSED: an unreadable file is a hit,
			// never a skip - the gate cannot certify what it cannot read.
			hits++;
			console.log(`HIT  ${f}  UNREADABLE - the gate cannot verify this file (fail closed)`);
			continue;
		}
		const lower = text.toLowerCase();
		const rel = f.slice(rootAbs.length + 1).replace(/\\/g, "/");
		for (const { p, cs } of patterns) {
			const idx = cs ? text.indexOf(p) : lower.indexOf(p);
			if (idx >= 0) {
				const line = text.slice(0, idx).split("\n").length;
				if (allows.some(a => a.file === rel && a.p === p.toLowerCase())) {
					console.log(`allowed  ${f}:${line}  ${p}  (sanctioned by --allow; the file is still swept for everything else)`);
					continue;
				}
				hits++;
				console.log(`HIT  ${f}:${line}  ${p}`);
			}
		}
	}
})(rootAbs);

console.log(hits === 0 ? `clean: ${files} files, 0 hits` : `${hits} hits across ${files} files - the gate is closed`);
process.exit(hits === 0 ? 0 : 1);
