---
name: final-review
description: Pre-commit approval gate that verifies all acceptance criteria before commit.
             Use when the user wants a final review before committing or merging.
             Trigger phrases include: "final review", "pre-commit review", "review before
             commit", "approval gate", "verify before committing", "check everything before
             commit", "final check", "ready to commit check".
---

# Final Review: Pre-Commit Approval Gate

## When to Use This Skill

Use this skill as the last gate before committing implementation work. Final review
verifies that everything in the task brief or plan was completed and that validation
passes before the commit happens.

Final review is NOT code review — code review looks for bugs. Final review asks:
"Did we build what we said we'd build, and does it pass?"

## Gate Discipline — No Auto-Commit

The most critical rule: final review NEVER commits automatically.

The purpose of final review is to get explicit human approval before committing.
The sequence is:
1. Run final review → present findings
2. Wait for user to say "looks good" or "commit" explicitly
3. Only then proceed to `/commit`

If the review surfaces gaps, fix them first — then re-run final review.

Auto-committing after a "passing" review bypasses the human approval that final
review exists to provide.

## Criteria Verification Standards

For each acceptance criterion in the task brief or plan:

**Mechanical criteria** (file exists, function exists, endpoint added):
Verify by actually checking — read the file, grep for the function. Don't assume.

**Behavioral criteria** (function returns X, endpoint responds with Y):
Verify by running validation commands — don't assume tests pass without running them.

**Quality criteria** (no console.logs, types are correct, error handling present):
Verify by reading the implementation — don't assume quality is present.

Evidence format for each criterion:
```
✓ .claude/skills/pr/SKILL.md exists — verified: ls shows file, 180 lines
✓ Frontmatter has name: pr — verified: grep -c "name: pr" returns 1
✗ Key Rules section present — MISSING: grep returns 0
```

## Verdict Quality

**PASS** — every criterion verified with evidence, all validation levels pass.

**FAIL** — any criterion unmet, or any validation level fails. List specifically what failed.

**PARTIAL** — most criteria met, with specific gaps noted. Appropriate when the gap is
minor and the user should decide whether to fix before committing.

Never issue a PASS verdict without evidence for each criterion.

## Summary Report Format

```
FINAL REVIEW: {feature}
=======================
Criteria: {N}/{total} met
Validation: L1 {pass/fail} | L2 {pass/fail} | L3 {pass/fail} | L4 {N/A} | L5 {pass/fail}
Gaps: {list, or "None"}
Verdict: PASS | FAIL | PARTIAL

{If PASS}: Ready to commit. Run /commit when ready.
{If FAIL}: Fix {specific gap} before committing.
{If PARTIAL}: {gap description} — commit now or fix first?
```

## Key Rules

1. **Never auto-commit** — final review presents findings; human approves commit
2. **Verify mechanically** — don't assume criteria are met; check each one
3. **Evidence for every criterion** — "verified: {how}" for each checkmark
4. **Honest verdict** — PASS only when all criteria have evidence; FAIL when any don't
5. **Fix gaps before PASS** — if gaps exist, fix them and re-run final review

## Related Commands

- `/final-review` — The pre-commit gate workflow this skill supports
- `/commit` — Runs after final review issues a PASS verdict
- `/code-loop` — Runs before final review; addresses code quality issues
- `/execute` — Implementation step whose output final review verifies
