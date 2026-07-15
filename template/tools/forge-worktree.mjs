#!/usr/bin/env node
// The workspace worktree composer.
// The workspace is independent repos composed in one tree (root + hub +
// projects); git-aware tools see only the root half, so worktrees of the
// root repo are empty shells. This tool declares the composition
// (forge-manifest.json) and materializes or unwinds a COMPLETE workspace
// view via per-repo worktrees.
//
//   node tools/forge-worktree.mjs init
//       Scan the live workspace and (re)write forge-manifest.json at the root.
//   node tools/forge-worktree.mjs compose <target-dir> [--projects a,b] [--all-projects]
//       Create or complete a full view at target: root worktree (created if
//       absent, reused if target already IS a root worktree, e.g. a chip
//       shell), hub worktree at target/Claude, project worktrees, glue files.
//   node tools/forge-worktree.mjs remove <target-dir>
//       Unwind every worktree recorded in the target's marker. Dirty
//       worktrees and unmerged branches are REPORTED and left, never forced.
//
// Worktree caveat, by design: each materialized repo sits on a fresh
// wt/<name> branch (main stays checked out in the real tree). Commits made
// in a view land on those branches and need a merge back to main; the
// auto-push flow applies only after that merge. For plain tracker work on
// disjoint files, the real tree remains the cheaper seat.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, unlinkSync, rmdirSync } from "node:fs";
import { join, resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ROOT derives from this script's location (tools/ lives one level inside the
// workspace root), so no hardcoded absolute paths are needed.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "forge-manifest.json");
const MARKER = ".forge-worktree.json";

// Names of workspace subdirectories to skip during init (excluded workspaces,
// day jobs, client code, etc.). Add yours here.
const SKIP_DIRS = new Set([
	// "ClientWork", // example: add names of subdirs that must stay excluded
]);

function git(repo, args) {
	return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
}
function tryGit(repo, args) {
	try {
		return git(repo, args);
	} catch (e) {
		return null;
	}
}
function isRepo(p) {
	return existsSync(join(p, ".git"));
}

function cmdInit() {
	const repos = [
		{ path: ".", kind: "core", remote: tryGit(ROOT, ["remote", "get-url", "origin"]) },
	];
	// The hub registers only once it IS its own repo; on the recommended
	// single-repo start it is a plain directory, and scanning it would emit
	// alarming no-remote noise for a split the adopter has not made yet.
	if (isRepo(join(ROOT, "Claude"))) {
		repos.push({ path: "Claude", kind: "hub", remote: tryGit(join(ROOT, "Claude"), ["remote", "get-url", "origin"]) });
	}
	const glue = [];
	const projectsDir = join(ROOT, "Projects");
	for (const ws of readdirSync(projectsDir, { withFileTypes: true })) {
		if (!ws.isDirectory() || SKIP_DIRS.has(ws.name)) {
			continue;
		}
		const wsPath = join(projectsDir, ws.name);
		if (existsSync(join(wsPath, "CLAUDE.md"))) {
			glue.push(`Projects/${ws.name}/CLAUDE.md`);
		}
		for (const child of readdirSync(wsPath, { withFileTypes: true })) {
			if (child.isDirectory() && isRepo(join(wsPath, child.name))) {
				repos.push({
					path: `Projects/${ws.name}/${child.name}`,
					kind: "project",
					remote: tryGit(join(wsPath, child.name), ["remote", "get-url", "origin"]),
				});
			}
		}
	}
	const manifest = { generated: new Date().toISOString().slice(0, 10), repos, glue };
	writeFileSync(MANIFEST, JSON.stringify(manifest, null, "\t") + "\n");
	const noRemote = repos.filter((r) => !r.remote).map((r) => r.path);
	console.log(`manifest written: ${repos.length} repos, ${glue.length} glue files`);
	if (noRemote.length) {
		console.log("repos with NO remote (loss surface, fail-loud): " + noRemote.join(", "));
	}
}

function loadManifest() {
	if (!existsSync(MANIFEST)) {
		console.error("forge-manifest.json missing - run: node tools/forge-worktree.mjs init");
		process.exit(1);
	}
	return JSON.parse(readFileSync(MANIFEST, "utf8"));
}

function addWorktree(repoAbs, targetAbs, branch) {
	git(repoAbs, ["worktree", "add", targetAbs, "-b", branch]);
}

function cmdCompose(target, opts) {
	const manifest = loadManifest();
	const targetAbs = resolve(target);
	const name = basename(targetAbs).replace(/[^\w-]/g, "-");
	const branch = `wt/${name}`;
	const created = [];

	// Root: reuse an existing root worktree (a chip shell), else create one.
	if (existsSync(join(targetAbs, ".git"))) {
		console.log("root: target is already a worktree/repo, reusing as-is");
	} else {
		addWorktree(ROOT, targetAbs, branch);
		created.push({ repo: ".", path: targetAbs, branch });
		console.log(`root: worktree created on ${branch}`);
	}

	const wanted = manifest.repos.filter((r) => {
		if (r.kind === "hub") {
			return true;
		}
		if (r.kind !== "project") {
			return false;
		}
		if (opts.all) {
			return true;
		}
		return opts.projects.some((p) => r.path.toLowerCase().includes(`/${p.toLowerCase()}/`) || r.path.toLowerCase().includes(`/${p.toLowerCase()}`));
	});
	for (const r of wanted) {
		const repoAbs = join(ROOT, r.path);
		const dest = join(targetAbs, r.path);
		if (existsSync(dest)) {
			console.log(`skip (exists): ${r.path}`);
			continue;
		}
		mkdirSync(dirname(dest), { recursive: true });
		try {
			addWorktree(repoAbs, dest, branch);
			created.push({ repo: r.path, path: dest, branch });
			console.log(`worktree: ${r.path} on ${branch}`);
		} catch (e) {
			console.log(`FAILED ${r.path}: ${String(e.message).split("\n")[0]}`);
		}
	}

	const glued = [];
	for (const g of manifest.glue) {
		const src = join(ROOT, g);
		const dest = join(targetAbs, g);
		if (existsSync(src) && !existsSync(dest)) {
			mkdirSync(dirname(dest), { recursive: true });
			copyFileSync(src, dest);
			glued.push(dest);
		}
	}
	writeFileSync(join(targetAbs, MARKER), JSON.stringify({ branch, created, glued }, null, "\t"));

	// Verification checklist - adapt these paths to your workspace layout.
	const checks = [
		["constitution", existsSync(join(targetAbs, "CLAUDE.md"))],
		["standards INDEX", existsSync(join(targetAbs, "STANDARDS", "INDEX.md"))],
		["hub craft globals", existsSync(join(targetAbs, "Claude", "CLAUDE.md"))],
	];
	for (const [label, ok] of checks) {
		console.log((ok ? "OK   " : "FAIL ") + label);
	}
	console.log(`glue copied: ${glued.length}. Marker written. Commits in this view land on ${branch} per repo; merge back to main before the auto-push flow applies.`);
	if (checks.some((c) => !c[1])) {
		process.exit(1);
	}
}

function cmdRemove(target) {
	const targetAbs = resolve(target);
	const markerPath = join(targetAbs, MARKER);
	if (!existsSync(markerPath)) {
		console.error("no " + MARKER + " in target - refusing to guess (fail loud)");
		process.exit(1);
	}
	const marker = JSON.parse(readFileSync(markerPath, "utf8"));
	// Clean our own artifacts (glue + marker) first, so a root worktree we
	// created can be removed without --force; empty glue dirs go too.
	for (const g of marker.glued ?? []) {
		try {
			unlinkSync(g);
			rmdirSync(dirname(g));
		} catch {}
	}
	try {
		unlinkSync(markerPath);
	} catch {}
	// Remove in reverse order so the root worktree (if we created it) goes last.
	for (const c of [...marker.created].reverse()) {
		const repoAbs = c.repo === "." ? ROOT : join(ROOT, c.repo);
		try {
			git(repoAbs, ["worktree", "remove", c.path]);
			console.log(`removed: ${c.repo}`);
		} catch (e) {
			console.log(`LEFT (dirty or locked): ${c.repo} - ${String(e.message).split("\n")[0]}`);
			continue;
		}
		const merged = tryGit(repoAbs, ["branch", "-d", c.branch]);
		console.log(merged !== null ? `branch deleted: ${c.branch} (${c.repo})` : `branch LEFT (unmerged, review it): ${c.branch} (${c.repo})`);
	}
	console.log("done; anything LEFT above needs a human look.");
}

const [cmd, target, ...rest] = process.argv.slice(2);
const opts = {
	all: rest.includes("--all-projects"),
	projects: (rest.find((a) => a.startsWith("--projects")) ?? "").split("=")[1]?.split(",") ?? [],
};
const projFlagIdx = rest.indexOf("--projects");
if (projFlagIdx >= 0 && rest[projFlagIdx + 1] && !rest[projFlagIdx + 1].startsWith("--")) {
	opts.projects = rest[projFlagIdx + 1].split(",");
}
if (cmd === "init") {
	cmdInit();
} else if (cmd === "compose" && target) {
	cmdCompose(target, opts);
} else if (cmd === "remove" && target) {
	cmdRemove(target);
} else {
	console.error("usage: forge-worktree.mjs init | compose <target> [--projects a,b | --all-projects] | remove <target>");
	process.exit(2);
}
