---
name: fail-loud
layer: agnostic
when_to_read: Writing or reviewing any error handling, fallback, catch block, missing-input/required-config path, or anywhere you are tempted to swallow, ignore, or default-away a failure
---

# Fail loud, never silent

**Standard.** When an operation cannot do what it was asked, surface the failure loudly - throw, return an explicit error, or log at Error/Warn so a human or a monitor sees it. The default posture is fail-loud, and for anything touching security, money, or data, fail-closed. Silent degradation is a defect, not a convenience.

**Reference.** A common pattern: a function throws when a required environment variable (e.g., an API signing secret) is unset, rather than silently falling back to an empty string that appears to work but breaks correctness. The same code may show the legitimate, narrow fail-open cases (e.g., an optional spam heuristic that logs and continues) that meet the exception bar below - they log, and they are not security controls.

**NOT.** Empty catch (`catch {}`, `catch (e) {}`, `.catch(() => {})`); silent fallback on a REQUIRED value (`process.env.X ?? ''`, `config["X"] ?? default`, optional chaining that masks a missing required input); success-on-failure (returning ok / 200 / true when the work did not happen); a real failure logged only at Debug (invisible in practice); "fail open" on anything security / auth / validation / money / data without an explicit justified comment.

**Why.** Silent failure turns a visible bug into an invisible one - the system looks healthy while it is wrong. Loud failure is cheaper: it is caught in dev or by a monitor instead of in production or a breach.

---

## The rule in detail

- **Catch means handle or rethrow.** A catch block either recovers meaningfully AND logs why, or it rethrows. It never just disappears the error.
- **Required input missing = error, not default.** If a value is required (an env var, a config key, an argument the logic depends on), its absence throws or returns an explicit error. Do not paper over it with `?? default`, `||`, or optional chaining.
- **Never report success you did not achieve.** Do not swallow a non-2xx, a failed write, or a skipped step and return success. The result must reflect what actually happened.
- **Log at the honest level.** Errors at Error; recoverable-but-notable at Warn. A failure logged at Debug is silent in every environment that filters Debug, which is all of them in production.
- **Surface to whoever needs it.** An error that only matters to the user must reach the user (toast, response body, non-zero exit), not just a log line nobody reads.

## The narrow exception (and even here, lean loud)

A genuinely inconsequential operation MAY degrade quietly ONLY when ALL of these hold:

1. The failure cannot affect correctness, security, money, data integrity, or user trust.
2. It is still logged at least at Warn, so it is not invisible.
3. A one-line comment states WHY silence is acceptable here.

"Fail open so we do not block X" is a real decision that must be justified in a comment, and is NEVER acceptable for a security control (auth, authorization, rate limiting, input validation, secrets, encryption). When in doubt, fail loud and closed.

## For agents (this binds agent work, not just code)

When you hit a blocker - a tool errors, a precondition is missing, a command fails - STOP and report it plainly ("X failed because Y"). Do not silently skip the step, fabricate a success, retry in a loop hoping it passes, or pick a default that hides the problem. Reporting the failure IS the loud path; papering over it is the silent failure this standard forbids.

## Reviewing for it

Grep targets when reviewing a change: `catch {`, a `catch (...)` with an empty or return-only body, `?? ''`, `?? null`, `?? []`, `.catch(`, `catch (Exception` with no log or rethrow, and `on error` / `fail open` / `swallow` / `ignore` comments. Treat each as guilty until shown to meet the narrow exception above.
