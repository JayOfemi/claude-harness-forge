# Start here

This folder is The Forge, a governance layer for Claude Code. It gives every session written rules it must follow, per-project memory with resume points, and enforcement hooks that block instead of remind. It is files; copying them is the install, deleting them is the uninstall.

**You are in the right place if this folder shows `template/`, `docs/`, and `examples/` side by side.** Unzipping often adds a wrapper folder, so if you see a single folder alone, open it first.

**Before setup you need [Claude Code](https://claude.com/claude-code), [git](https://git-scm.com/downloads), and [Node.js](https://nodejs.org) installed.** Setup stops before touching anything if Node.js is missing, and warns if git is; Claude Code you install yourself.

## The easiest path

1. Open a Claude Code session in THIS folder. In the Claude Code app or the VS Code extension, open this folder there. From a terminal instead: on Windows, right-click inside this folder in your file explorer and choose "Open in Terminal"; on a Mac, open Terminal, type `cd ` with a trailing space, drag this folder into the window, and press return. Then run `claude`.
2. Paste this and press enter:

> Read `docs/quickstart.md` and set up the Forge for me.

The agent confirms where the workspace will be created (a `Forge` folder in your home folder unless you name another), does the mechanical steps, asks before touching your settings, and closes by listing the best ways to use your new workspace.

Prefer a script (on Windows, double-click `template\tools\setup.cmd`) or full manual control? Both paths live in [`docs/quickstart.md`](docs/quickstart.md), along with exactly what setup writes and where.
