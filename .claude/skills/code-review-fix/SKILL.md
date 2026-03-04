---
name: code-review-fix
description: Knowledge framework for minimal-change fix discipline, severity ordering, and per-fix verification
license: MIT
compatibility: claude-code
---

# Code Review Fix — Fix Discipline Methodology

This skill provides the quality standards for applying review findings correctly. It
complements the `/code-review-fix` command — the command provides the workflow, this skill
provides the principles behind minimal changes, severity ordering, and verification.

## When This Skill Applies

- `/code-review-fix {review-file} {scope}` is invoked
- Code review findings need to be addressed before a commit
- Inside `/code-loop` when the fix step runs after a review iteration
- A specific severity scope needs to be applied (critical+major, critical only, etc.)

## The Minimal Change Principle

The most important discipline in code review fix: fix the specific issue identified,
and ONLY that issue.

**Why minimal changes matter:**
- Larger changes than necessary introduce new bugs and require new review
- Refactoring surrounding code while fixing a bug mixes unrelated changes in one commit
- Over-fixing makes the review-re-review cycle longer and less focused
- The review report describes the bug, not an opportunity for general improvement

**Minimal change test:**
Before applying a fix, ask: "Is every line I'm changing required to fix the identified issue?"
If a line would change even without the bug, it is out of scope.

**Examples:**

Review finding: `auth.ts:47 — null dereference on user.email`

Bad fix (too broad):
```typescript
// Renamed variable, added comment, restructured condition, THEN fixed the null check
const authenticatedUser = user ?? null;
// Check if user exists before accessing email
if (authenticatedUser && authenticatedUser.email) {
  sendWelcomeEmail(authenticatedUser.email);
}
```

Good fix (minimal):
```typescript
if (user?.email) {
  sendWelcomeEmail(user.email);
}
```

The good fix addresses exactly the null dereference. The bad fix adds renaming and
restructuring that are unrelated to the bug.

## Severity Ordering — Why Critical First

Fixing in Critical → Major → Minor order is not arbitrary:

1. **Critical issues can block all other fixes** — A security vulnerability might require
   changing the architecture of a function, which means Major issues in that function
   become irrelevant (the function changes anyway).

2. **Critical fixes can introduce new issues** — After a security fix, re-verify that
   the fix didn't introduce a regression that overlaps with a Major finding.

3. **Fixing Minor before Critical wastes time** — If a Critical issue requires deleting
   or rewriting a function, Minor fixes applied to that function first are discarded.

**When all Criticals are fixed:**
Re-read the remaining Major and Minor findings before applying them. Some may have
been resolved by the Critical fixes; applying them again could introduce regressions.

## Per-Fix Verification (Not Batch)

The rule: verify EACH fix before moving to the next one.

Why not batch all fixes first:
- A fix that seems correct can introduce a new type error or test failure
- Discovering that fix #3 broke something after applying 8 fixes makes it hard to isolate
- The fix report requires recording what each fix changed and how it was verified

Per-fix verification checklist:
- Syntax check: does the file still parse?
- Type check: does `tsc --noEmit` (or equivalent) still pass?
- Targeted test: is there a test for this specific behavior? Does it pass?

Full validation (all levels) runs AFTER all fixes are applied — per-fix is lighter.

## Scope Discipline

The scope parameter (`all`, `critical+major`, `critical`, `{file-path}`) is a contract:

- If scope is `critical+major`, do NOT fix Minor issues even if they are trivial
- The scope was set for a reason — often to keep a diff small for focused review
- Minor issues deferred by scope should be explicitly noted in the fix report:
  "Minor issue at auth.ts:103 deferred by scope (critical+major)"

**Why scope discipline matters:**
When `/code-loop` runs with scope `critical+major`, the next re-review verifies exactly
those issues. If fixes were applied outside scope, the re-review compares against a
larger diff than expected.

## The Unresolvable Case

Some fixes cannot be applied by `/code-review-fix` — they require architectural changes.
Signs that a fix is unresolvable at this layer:

- Fix requires changes to 5+ files (architectural scope)
- Fix requires adding a new abstraction or interface
- Fix requires changing an API surface that other code depends on
- Fix introduces a new dependency that needs evaluation

When this happens:
1. Stop and report clearly: "This fix requires architectural changes beyond the scope
   of /code-review-fix. Specifically: {what would need to change}."
2. Write the handoff with Status: `blocked`
3. The correct next step is `/planning` → `/execute` for the architectural fix

Do NOT apply a partial fix that partially addresses the issue — partial fixes hide the
true scope of the problem from the next review pass.

## The Fix Report

After all fixes:
```
CODE REVIEW FIX: COMPLETE
=========================
Scope: critical+major
Issues Fixed: 3 (2 Critical, 1 Major)
Files Modified: src/auth.ts, src/api/login.ts

For each fix:
### src/auth.ts:47 — null dereference
Severity: Critical
What was wrong: user.email accessed without null check; crashes on anonymous requests
Fix applied: added optional chaining `user?.email` + early return if falsy
Verification: tsc --noEmit passes; auth unit test suite passes (12/12)

Validation:
- Lint: PASS
- Types: PASS
- Tests: PASS (47/47)
```

## Anti-Patterns

**Over-fixing** — Refactoring code beyond the identified issue. "While I was in there,
I also cleaned up X." The review didn't find X as a problem — adding it to the fix
changes the diff scope and makes re-review harder.

**Batch-then-validate** — Applying all 8 fixes at once, then running validation.
When validation fails, it's unclear which fix caused the failure.

**Scope violation** — Fixing Minor issues when scope is `critical+major`. This adds
noise to the re-review diff.

**Partial architecture fix** — Applying a shallow fix to an architectural problem that
needs a deeper solution. The shallow fix makes the codebase harder to fix properly later.

**Skipping verification explanation** — Writing "verification: done" without stating
what was run and what it returned. Verification must be evidence-based.

## Key Rules

1. **Minimal changes** — Fix the issue and only the issue
2. **Critical first** — Always, because Critical fixes can affect Major findings
3. **Per-fix verification** — Check each fix before moving to the next
4. **Respect scope** — If scope excludes Minor, note the deferred issues explicitly
5. **Unresolvable = stop and report** — Don't apply partial architectural fixes
6. **Fix report is evidence** — Document what was fixed and how it was verified
7. **Re-read remaining findings after Criticals** — Some may be resolved by Critical fixes

## Related Commands

- `/code-review-fix {review-file} {scope}` — The fix workflow this skill supports
- `/code-review` — Produces the review artifact that /code-review-fix consumes
- `/code-loop {feature}` — Automates the review → fix → review cycle
- `/planning {feature}` — Use when a fix requires architectural changes beyond /code-review-fix
