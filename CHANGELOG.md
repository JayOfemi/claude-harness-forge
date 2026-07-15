# Changelog

Fork-and-forget support surface: adopters diff against this file to see what changed upstream since their copy.

## 1.0.1

- Standards: reworded the standards bank to a clean, metrics-free posture; the engineering guidance is unchanged.
- Docs: corrected the quickstart's hook-wiring step to reference the hooks already placed at your root, matching the shipped settings template.

## 1.0.0

- License: the template is MIT licensed; the LICENSE ships in the download.
- Sweep: `deny-sweep.mjs` gains `--allow <relpath>:<pattern>`, a printed, file-and-pattern-scoped sanction for content that must legitimately carry a listed string (a LICENSE needs its copyright holder). Never silent; the file still gets swept for everything else.
- Docs: `how-it-works.md` added, a human-readable overview of the parts and the path one ask travels end to end.
- Bootstrap: repo skeleton, the deny-sweep gate, the classification-driven build begins.
