---
name: code-review-fix
description: Apply code review findings with minimal-change discipline and per-fix verification.
             Use when the user wants to fix issues found in a code review.
             Trigger phrases include: "fix review issues", "apply code review fixes",
             "fix issues from review", "address review findings", "fix the critical issues",
             "apply the fixes", "fix what the review found".
---

# Code Review Fix: Applying Review Findings

## When to Use This Skill

Use this skill when a code review artifact exists and findings need to be applied.

**Hard entry gate**: Never fix without a review artifact. If no `review.md` (or `review-N.md`)
exists, stop and run code review first. Fixing from memory or chat description produces
incomplete or wrong fixes.

## The Minimal Change Principle

Fix the specific issue identified. Nothing more.

**Minimal change test**: "Is every line I'm changing required to fix the identified issue?"
If a line would change even without the bug, it's out of scope.

Bad fix (too broad):
```typescript
// Renamed variable, restructured condition, THEN fixed the null check
const authenticatedUser = user ?? null;
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
restructuring unrelated to the bug.

## Severity Ordering — Critical First

Fix in this order: Critical → Major → Minor.

Why Critical first:
1. Critical fixes can change the structure of a function, making Major findings in that function irrelevant
2. Critical fixes can introduce new issues — re-verify Majors after Criticals are done
3. Fixing Minor before Critical wastes time if Critical requires deleting that code

After all Criticals are fixed: re-read remaining Majors before applying them. Some may
have been resolved by Critical fixes.

## Per-Fix Verification (Not Batch)

Verify EACH fix before moving to the next:
- Syntax: does the file still parse?
- Types: does the type checker still pass?
- Targeted test: is there a test for this behavior? Does it pass?

Full validation runs AFTER all fixes are applied. Per-fix is lighter but required.

Why not batch: if fix #3 breaks something, it's hard to isolate after applying 8 fixes.

## Scope Discipline

If scope is `critical+major`, do NOT fix Minor issues.
Note deferred Minor issues explicitly: "Minor at auth.ts:103 deferred by scope."

## The Unresolvable Case

Stop and escalate if a fix requires:
- Changes to 5+ files
- A new abstraction or interface
- Changing an API surface other code depends on

Report: "This fix requires architectural changes. Specifically: {what would need to change}."
Write handoff with Status: blocked. Do NOT apply a partial fix.

## Key Rules

1. **Hard entry gate** — review artifact must exist before fixing
2. **Minimal changes** — fix the issue and only the issue
3. **Critical first** — always, because Critical fixes affect Major findings
4. **Per-fix verification** — check each fix before the next
5. **Respect scope** — note deferred issues explicitly
6. **Unresolvable = stop and report** — don't apply partial architectural fixes

## Related Commands

- `/code-review-fix` — The fix workflow this skill supports
- `/code-review` — Produces the review artifact that this skill consumes
- `/code-loop` — Automates the review → fix → review cycle
