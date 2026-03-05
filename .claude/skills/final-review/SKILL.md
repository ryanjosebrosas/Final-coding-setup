---
name: final-review
description: Knowledge framework for pre-commit approval gates with change summary and acceptance criteria verification
license: MIT
compatibility: claude-code
---

# Final Review — Approval Gate Methodology

This skill provides the quality framework for the final checkpoint before commit. It complements the `/final-review` command — the command provides the workflow, this skill provides the standards for what makes a commit-ready state.

## When This Skill Applies

- User runs `/final-review` before committing
- User wants to verify all changes are intentional and reviewed
- Acceptance criteria from a plan need verification
- Human approval is required before proceeding to `/commit`
- After `/code-loop` or `/code-review` when ready to commit

## Readiness Standards

A commit is ready when ALL of these are true:

**Validation Clean**
- Lint passes with zero errors
- Type check passes with zero errors
- All tests pass (unit + integration)
- No unaddressed Critical or Major review findings

**Change Understanding**
- Every changed file has been reviewed
- Change summary accurately reflects what changed
- No accidental changes (debug code, commented code, stray files)

**Criteria Verification** (if plan provided)
- All Implementation criteria are MET
- Runtime criteria are MET or explicitly DEFERRED with reason
- No criteria are NOT MET without documented justification

## Approval Gate Quality

The approval gate exists because:
- Code review finds issues but doesn't require them to be fixed
- Tests pass but may not cover edge cases
- Lint passes but may miss logical errors
- The human makes the final call on acceptable risk

**What counts as explicit approval:**
- "Yes", "Approved", "Proceed", "Commit it"
- Modification of commit message followed by approval
- Clear affirmative statement

**What does NOT count as approval:**
- Silence or no response
- Vague acknowledgment ("ok", "sure", "go ahead")
- Changing the subject without explicitly approving

## Verdict Standards

**READY TO COMMIT requires:**
1. All Level 1-3 validation passes
2. Zero Critical review findings outstanding
3. Zero Major review findings outstanding
4. All Implementation acceptance criteria MET (if plan provided)
5. Explicit human approval

**NOT READY triggers:**
1. Any validation failure → fix first
2. Critical or Major findings open → address first
3. Implementation criteria not met → complete work first
4. No explicit approval → wait for it

## Anti-Patterns

**Skipping validation** — Running `/final-review` without lint/tests. The validation pyramid exists to catch issues before human review. Skipping it defeats the purpose.

**Rubber-stamp approval** — Asking for approval but accepting vague responses. "Sure, go ahead" is not explicit approval when significant changes are involved.

**Ignoring deferred criteria** — Deferring a Runtime criterion "until later" without a ticket or tracking mechanism. Deferred means tracked, not forgotten.

**Reviewing only the diff** — For new files, the diff is the entire file. For changed files, context matters. Read the full file, not just changed lines.

**Skipping acceptance criteria** — Not providing a plan-path to skip criteria verification. If there's a plan, use it. Criteria are promises made in the plan.

## Key Rules

1. **Validation first, approval second** — Run all validation before asking for approval
2. **Explicit approval required** — Silence is not approval; vague acknowledgment is not approval
3. **No Critical/Major outstanding** — These severities block commit; Minor can be deferred
4. **Acceptance criteria verified** — If a plan exists, its criteria must be checked
5. **Human makes the final call** — All automation passes, but human decides acceptable risk
6. **Read-only gate** — This command never modifies files, only reports and asks

## Related Commands

- `/code-loop` — Runs before final-review to clean up issues
- `/code-review` — Provides the review artifacts final-review summarizes
- `/commit` — Runs after approval to create the commit
- `/pr` — Runs after commit to create the pull request