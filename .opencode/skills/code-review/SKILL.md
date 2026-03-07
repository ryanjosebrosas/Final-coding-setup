---
name: code-review
description: Knowledge framework for severity classification, evidence-based findings, and actionable review output
license: MIT
compatibility: opencode
---

# Code Review — Severity Classification and Evidence Standards

This skill provides the quality standards for producing reviews that are specific,
evidence-based, and actionable. It complements the `/code-review` command — the command
provides the workflow, this skill provides the classification criteria and review depth standards.

## When This Skill Applies

- `/code-review` is invoked (pre-commit, last-commit, or specific file)
- Code changes need to be assessed for quality, security, and correctness
- Inside `/code-loop` automated review cycles
- A review needs to be calibrated for severity accuracy

## Severity Classification — Deep Criteria

The three severity levels are a judgment call. These criteria make them consistent:

**Critical (blocks commit) — Must fix before any commit**

A finding is Critical when it either:
1. Introduces a security vulnerability that can be exploited by external actors
2. Contains logic that will produce incorrect results in foreseeable conditions
3. Can cause data loss, corruption, or system unavailability

Classification test: "If this code ships to production as-is, will it cause a security
incident, data corruption, or incorrect results that affect users?"
If yes → Critical.

Examples of what IS Critical:
- SQL query built with string interpolation from user input (SQL injection)
- Hardcoded API key, password, or secret in source code
- Null pointer dereference on a code path that can be reached from user input
- Off-by-one error in a payment calculation
- Race condition on a shared resource without synchronization

Examples of what is NOT Critical (but Major):
- Inefficient but correct algorithm (performance issue, not correctness)
- Missing error handling that causes a silent failure (bad, but not data corruption)
- Unused import that increases bundle size

**Major (fix soon) — Significant problem, fix before merge if possible**

A finding is Major when it:
1. Will degrade performance in ways users will notice
2. Violates architectural boundaries in ways that create maintenance debt
3. Allows silent failures that hide errors from monitoring/logging
4. Tightly couples components that should be independent

Classification test: "This code works, but it creates a problem that will get worse over time
or cause noticeable user impact."

Examples of what IS Major:
- N+1 database query in a loop that scales with user count
- Catching a broad exception and logging nothing (silent failure)
- Directly accessing the database from a UI component (layer breach)
- A function that does 5 unrelated things (single responsibility violation at a noticeable scale)

Examples of what is NOT Major (Minor):
- Variable named `x` when `userCount` would be clearer
- A function that could use a helper that already exists (minor DRY violation)

**Minor (consider fixing) — Quality improvement, not required**

A finding is Minor when it:
1. Makes code harder to read without making it incorrect
2. Represents a missed opportunity to use an existing pattern
3. Is documentation that's incomplete but not dangerously wrong

## Evidence Standards

Every finding must include:
- **File:line reference** — exact location, not just "in the auth module"
- **Why it's a problem** — not just what's wrong, but the specific impact
- **Specific fix** — not "handle this error" but "wrap in try/catch and log to error logger"

**Bad finding (no evidence):**
```
Major: auth.ts — poor error handling
Why: errors not handled
Fix: add error handling
```

**Good finding (specific evidence):**
```
Major: `src/auth.ts:47` — exception caught silently in login flow
Why: if the database is unreachable, login returns undefined instead of an error,
     causing the caller at api/login.ts:23 to assume success and issue a token
Fix: replace `catch {}` with `catch (e) { logger.error('login_db_failure', e); throw e; }`
```

## Review Completeness

A complete review:
1. Reads EACH changed file in its entirety (not just the diff)
   - Diff shows what changed; full file shows whether the change fits the module
2. Checks for issues at all three severity levels (don't stop after finding Criticals)
3. Provides a summary line with counts
4. States a recommendation (PASS / FIX CRITICAL / FIX MAJOR)

An incomplete review:
- Reads only the diff (misses context-dependent issues)
- Stops after finding one Critical without checking for others
- Has findings without file:line references
- Has no summary or recommendation

## What Makes a Review Actionable

A review is actionable when:
- Each finding has a specific fix suggestion (developer doesn't have to figure out HOW to fix)
- Critical findings are prioritized first in the report
- The recommendation is unambiguous (PASS = merge, FIX CRITICAL = block, FIX MAJOR = fix before merge)

A review is decorative when:
- Findings say "consider improving" without stating what the improvement should be
- The severity levels are inconsistent (style nits as Critical, security issues as Minor)
- No recommendation is given (developer has to guess whether to commit)

## The "Full File, Not Just Diff" Rule

This is the most commonly skipped part of code review. Why it matters:

The diff shows what changed. The full file shows:
- Whether the new code is consistent with patterns in the rest of the file
- Whether a function that was changed is called in a way that's now incorrect elsewhere in the file
- Whether existing error handling the new code relies on is actually present
- Whether the change introduces duplication with existing functions in the same file

Example: A diff shows a new `getUser(id)` function added. The full file reveals there's
already a `fetchUser(id)` function 50 lines above. This duplication is invisible in the diff.

## Anti-Patterns

**Severity inflation** — Calling style nits Critical to make the review seem thorough.
This trains developers to ignore Critical findings.

**Severity deflation** — Calling security vulnerabilities Major to avoid blocking a commit.
This ships exploitable code.

**Diff-only review** — Reading only the changed lines misses context-dependent issues
and produces reviews that look thorough but miss real problems.

**Finding without fix** — "This could be better" is not a finding. Every finding needs
a specific improvement suggestion.

**Recommendation avoidance** — Ending with "there are some issues" without stating
PASS / FIX CRITICAL / FIX MAJOR leaves the decision burden with the developer.

## Key Rules

1. **Critical = correctness or security issue** — Performance and architecture are Major
2. **Every finding needs file:line** — No findings without exact location
3. **Every finding needs a specific fix** — Not "improve this" but "change X to Y"
4. **Full file, not just diff** — Context-dependent issues are invisible in diffs
5. **Recommendation is non-optional** — PASS, FIX CRITICAL, or FIX MAJOR
6. **Counts in summary** — X critical, Y major, Z minor before recommendation
7. **Don't stop at first Critical** — Check all severity levels regardless

## Related Commands

- `/code-review` — The review workflow this skill supports
- `/code-review-fix {review-file}` — Applies fixes from the review this skill produces
- `/code-loop {feature}` — Automates the review → fix → review cycle
- `/system-review` — Meta-level analysis that reads code review findings for quality scoring