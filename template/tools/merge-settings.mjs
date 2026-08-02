#!/usr/bin/env node
// Merges the Forge harness wiring into an existing Claude Code settings.json,
// so the setup helpers never clobber a settings file an adopter already has.
//
//   node merge-settings.mjs <yours.json> <forge.json> <out.json>
//   node merge-settings.mjs <target.json> <forge.json> --apply
//
// Additive by design: everything already in <yours.json> survives; Forge
// permission and hook entries are appended, missing env keys added. A true
// conflict (same key, different value) resolves Forge-wins and prints a
// CONFLICT line; every change is printed, nothing merges silently.
//
// --apply merges straight into <target.json> (a missing target is treated as
// empty and created): the current file is backed up to a timestamped folder
// beside it BEFORE anything is replaced, the merged result lands via a temp
// file and rename, and any error exits nonzero with the target untouched.
import {
	readFileSync,
	writeFileSync,
	existsSync,
	lstatSync,
	realpathSync,
	mkdirSync,
	copyFileSync,
	renameSync,
	unlinkSync,
} from "node:fs";
import { dirname, join, basename, resolve } from "node:path";

const rawArgs = process.argv.slice(2);
const apply = rawArgs.includes("--apply");
const paths = rawArgs.filter((a) => a !== "--apply");
const [yoursPath, forgePath, outPath] = paths;
const usable = apply
	? paths.length === 2 && yoursPath && forgePath
	: paths.length === 3 && yoursPath && forgePath && outPath;
if (!usable) {
	console.error(
		"usage: merge-settings.mjs <yours.json> <forge.json> <out.json>\n       merge-settings.mjs <target.json> <forge.json> --apply"
	);
	process.exit(2);
}

function load(path) {
	let text = readFileSync(path, "utf8");
	if (text.charCodeAt(0) === 0xfeff) {
		text = text.slice(1);
	}
	const parsed = JSON.parse(text);
	if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error("not a settings object");
	}
	return parsed;
}

const targetExists = existsSync(yoursPath);
let yours;
let forge;
try {
	// In apply mode a missing target is the fresh-install case, not an error.
	yours = apply && !targetExists ? {} : load(yoursPath);
} catch (err) {
	console.error(`cannot read ${yoursPath}: ${err.message}`);
	process.exit(1);
}
try {
	forge = load(forgePath);
} catch (err) {
	console.error(`cannot read ${forgePath}: ${err.message}`);
	process.exit(1);
}

// Wrong-typed sections would make assignments vanish in serialization, a
// silent no-merge that reports success; refuse them loudly instead.
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
function checkShape(o, label) {
	const fail = (msg) => {
		console.error(`${label}: ${msg}, refusing to merge`);
		process.exit(1);
	};
	if ("permissions" in o) {
		if (!isObj(o.permissions)) {
			fail(`"permissions" must be an object`);
		}
		for (const key of ["allow", "deny", "additionalDirectories"]) {
			if (key in o.permissions && !Array.isArray(o.permissions[key])) {
				fail(`"permissions.${key}" must be an array`);
			}
		}
	}
	if ("env" in o && !isObj(o.env)) {
		fail(`"env" must be an object`);
	}
	if ("hooks" in o) {
		if (!isObj(o.hooks)) {
			fail(`"hooks" must be an object`);
		}
		for (const [event, groups] of Object.entries(o.hooks)) {
			if (!Array.isArray(groups)) {
				fail(`"hooks.${event}" must be an array`);
			}
			for (const group of groups) {
				if (!isObj(group) || ("hooks" in group && !Array.isArray(group.hooks))) {
					fail(`"hooks.${event}" entries must be objects with a hooks array`);
				}
			}
		}
	}
}
checkShape(yours, yoursPath);
checkShape(forge, forgePath);

const merged = JSON.parse(JSON.stringify(yours));
const report = [];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// A hook command's identity is the script it runs (its last file name), so
// the same gate wired from two different roots reads as one hook, not two.
function hookSig(cmd) {
	const files = String(cmd).match(/[\w.-]+\.(?:mjs|cjs|js|md|sh|ps1)/g);
	return files === null ? null : files[files.length - 1];
}

const ARRAY_KEYS = ["allow", "deny", "additionalDirectories"];
if (forge.permissions) {
	merged.permissions = merged.permissions || {};
	for (const key of ARRAY_KEYS) {
		const incoming = forge.permissions[key] || [];
		if (incoming.length === 0) {
			continue;
		}
		const mine = merged.permissions[key] || [];
		for (const entry of incoming) {
			if (!mine.some((e) => eq(e, entry))) {
				mine.push(entry);
				report.push(`added permissions.${key}: ${entry}`);
			}
		}
		merged.permissions[key] = mine;
	}
}

if (forge.env) {
	merged.env = merged.env || {};
	for (const [key, value] of Object.entries(forge.env)) {
		if (!(key in merged.env)) {
			merged.env[key] = value;
			report.push(`added env.${key} = ${value}`);
		} else if (merged.env[key] !== value) {
			report.push(`CONFLICT env.${key}: your value "${merged.env[key]}" is replaced by the Forge value "${value}"`);
			merged.env[key] = value;
		}
	}
}

if (forge.hooks) {
	merged.hooks = merged.hooks || {};
	for (const [event, groups] of Object.entries(forge.hooks)) {
		const mine = merged.hooks[event] || [];
		for (const group of groups) {
			const matcher = group.matcher || "";
			const target = mine.find((g) => (g.matcher || "") === matcher);
			if (!target) {
				mine.push(group);
				report.push(`added hooks.${event}${matcher ? ` (${matcher})` : ""}: ${(group.hooks || []).length} hook(s)`);
				continue;
			}
			target.hooks = target.hooks || [];
			for (const hook of group.hooks || []) {
				if (target.hooks.some((h) => h.command === hook.command)) {
					continue;
				}
				// Same script wired from an older root (a re-run after a move)
				// is a stale duplicate: replace it and say so, never stack it.
				const sig = hookSig(hook.command);
				const stale = sig === null ? -1 : target.hooks.findIndex((h) => hookSig(h.command) === sig);
				if (stale >= 0) {
					report.push(`CONFLICT hooks.${event}: your command "${target.hooks[stale].command}" is replaced by the Forge command "${hook.command}" (same script, different path)`);
					target.hooks[stale] = hook;
				} else {
					target.hooks.push(hook);
					report.push(`added hooks.${event}: ${hook.command}`);
				}
			}
		}
		merged.hooks[event] = mine;
	}
}

// _instructions is setup guidance, not wiring; it never lands in a merge.
const HANDLED = new Set(["permissions", "env", "hooks", "_instructions"]);
for (const [key, value] of Object.entries(forge)) {
	if (HANDLED.has(key)) {
		continue;
	}
	if (!(key in merged)) {
		merged[key] = value;
		report.push(`added ${key}`);
	} else if (!eq(merged[key], value)) {
		report.push(`CONFLICT ${key}: your value is replaced by the Forge value`);
		merged[key] = value;
	}
}

if (apply) {
	if (report.length === 0 && targetExists) {
		console.log("nothing to merge, your settings already carry the Forge wiring");
		process.exit(0);
	}
	let targetAbs = resolve(yoursPath);
	// A literal ~ segment means the shell never expanded the path; creating a
	// "~" folder and reporting success would hide the mis-target (fail loud).
	if (targetAbs.split(/[\\/]/).includes("~")) {
		console.error(`apply refused: ${yoursPath} carries a literal "~" your shell did not expand. Pass the full absolute path to your settings file.`);
		process.exit(1);
	}
	if (targetExists) {
		// Follow a symlinked settings file so the swap lands in the real file
		// instead of silently replacing the link with a plain copy.
		targetAbs = realpathSync(targetAbs);
	} else {
		let lingering = false;
		try {
			lstatSync(targetAbs);
			lingering = true;
		} catch {}
		if (lingering) {
			console.error(`apply refused: ${targetAbs} is a broken link; fix or remove it by hand first.`);
			process.exit(1);
		}
		// The blessed fresh case is a missing settings.json inside an existing
		// folder; a missing folder means a mistyped target, never a fresh install.
		if (!existsSync(dirname(targetAbs))) {
			console.error(`apply refused: the folder ${dirname(targetAbs)} does not exist. Pass the full absolute path to your settings file.`);
			process.exit(1);
		}
	}
	const dir = dirname(targetAbs);
	const tmp = join(dir, ".forge-merge.tmp.json");
	try {
		if (targetExists) {
			const stamp = new Date()
				.toISOString()
				.replace(/[-:]/g, "")
				.replace("T", "-")
				.slice(0, 15);
			const backupDir = join(dir, `forge-setup-backup-${stamp}`);
			mkdirSync(backupDir, { recursive: true });
			copyFileSync(targetAbs, join(backupDir, basename(targetAbs)));
			console.log(`backed up ${targetAbs} to ${backupDir}`);
		}
		writeFileSync(tmp, JSON.stringify(merged, null, 2) + "\n");
		renameSync(tmp, targetAbs);
	} catch (err) {
		try {
			unlinkSync(tmp);
		} catch {}
		console.error(`apply failed, ${targetAbs} is untouched: ${err.message}`);
		process.exit(1);
	}
	for (const line of report) {
		console.log(line);
	}
	console.log(
		targetExists
			? `${report.length} change(s) applied to ${targetAbs}`
			: `wrote ${targetAbs} (you had none)`
	);
} else if (report.length === 0) {
	// Zero changes emit the original bytes verbatim, so a caller comparing the
	// output against the original sees them identical and leaves the file alone.
	writeFileSync(outPath, readFileSync(yoursPath));
	console.log("nothing to merge, your settings already carry the Forge wiring");
} else {
	writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n");
	for (const line of report) {
		console.log(line);
	}
	console.log(`${report.length} change(s) merged`);
}
