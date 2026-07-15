// House rules module for the style gate.
// Replace with your own rules. A full worked example ships at
// examples/house-rules-example.mjs - copy, rename, and point HOUSE_RULES at it.
//
// Shape: export a RULES array; each rule has:
//   pattern: RegExp - matched against each line of introduced content
//   message: string - shown in the gate output when the rule fires
//   severity: "fail" | "warn" - "fail" blocks the edit (exit 2); "warn" is advisory only
//
// The exported scanText(text, filePath) function is the gate's call surface.
// It returns an array of finding objects: { file, line, col, message, context, severity }.

/**
 * @typedef {{ pattern: RegExp, message: string, severity: "fail" | "warn" }} Rule
 * @type {Rule[]}
 */
export const RULES = [
	{
		pattern: /TODO-BEFORE-SHIP/,
		message: "TODO-BEFORE-SHIP marker found - resolve or remove before shipping",
		severity: "fail",
	},
];

/**
 * Scan introduced text against the RULES array.
 * @param {string} text - the content introduced by an edit
 * @param {string} filePath - label for findings (the file being edited)
 * @returns {Array<{file:string, line:number, col:number, message:string, context:string, severity:string}>}
 */
export function scanText(text, filePath) {
	const findings = [];
	const lines = text.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		for (const rule of RULES) {
			const match = rule.pattern.exec(line);
			if (match) {
				findings.push({
					file: filePath,
					line: i + 1,
					col: match.index + 1,
					message: rule.message,
					context: line.trim(),
					severity: rule.severity,
				});
			}
		}
	}
	return findings;
}
