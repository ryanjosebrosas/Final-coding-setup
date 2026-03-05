---
name: validation/code-review-fix
description: Knowledge framework for minimal-change fix discipline with severity ordering and per-fix verification
license: MIT
compatibility: claude-code
---

# Validation: Code Review Fix — Minimal Change Discipline

This skill provides the quality framework for fixing code review findings. It complements the `/validation/code-review-fix` command — the command provides the workflow, this skill provides the fix discipline.

## When This Skill Applies

- User runs `/validation/code-review-fix` after a code review
- Review findings need to be addressed
- User wants structured fix discipline
- Fixes should be minimal and verified

## Fix Discipline

**Minimal Change Principle** — Each fix should be the smallest possible change that addresses the finding. No refactoring, no "while I'm here" improvements.

**Why minimal:**
- Smaller changes are easier to review
- Less risk of introducing new bugs
- Clearer git history
- Faster to revert if needed

**What minimal means:**
- Fix ONLY the reported issue
- No style improvements in the same change
- No refactoring adjacent code
- No adding "nice to have" features
- No updating comments unless the finding is about comments

## Severity Ordering

Always fix in severity order:

1. **CRITICAL** — Fix first, verify, commit
2. **HIGH** — Fix second, verify, commit
3. **MEDIUM** — Fix third (or defer with documentation)
4. **LOW** — Defer to backlog (fix when convenient)

**Why order matters:**
- Critical issues may invalidate the fix approach for lower severity
- Fixing low-severity first creates noise in git history
- Higher severity = higher risk = more careful review needed

## Per-Fix Verification

After EACH fix:

1. **Run the affected test** — Does the fix work?
2. **Run the linter** — Is the fix syntactically correct?
3. **Run the type checker** — Is the fix type-safe?
4. **Re-read the finding** — Did it address the specific issue?

**Only then move to the next fix.**

Do NOT:
- Fix multiple findings in one change
- Skip verification because "it's simple"
- Move on without confirming the fix worked

## Fix Quality Standards

**A good fix:**
- Addresses the specific finding
- Is minimal (no extra changes)
- Passes all tests
- Passes lint and type check
- Doesn't introduce new issues
- Has clear commit message referencing the finding

**A bad fix:**
- Addresses the finding BUT also refactors nearby code
- Passes tests but fails type check
- Changes behavior beyond what the finding required
- Mixes multiple findings in one change

## Anti-Patterns

**Kitchen sink fixing** — Fixing a bug AND refactoring AND updating comments in one change. Each fix should be atomic.

**Skip-the-verification** — Making the fix and moving on without running tests/lint/types. This is how regressions happen.

**Severity skipping** — Fixing LOW issues while CRITICAL issues remain. This wastes time and creates noise.

**Finding expansion** — "While I'm here, I'll also fix..." No. Fix what was found, nothing more.

**Defer without tracking** — Marking MEDIUM issues as "deferred" without creating a ticket or tracking mechanism. Deferred means tracked.

## Key Rules

1. **One finding, one fix** — Never bundle multiple findings in one change
2. **Critical first** — Always fix in severity order
3. **Minimal change** — The fix is exactly what addresses the finding, nothing more
4. **Verify after each fix** — Run tests, lint, types after EVERY fix
5. **Reference the finding** — Commit messages should mention what was fixed
6. **Defer responsibly** — Deferred issues are tracked, not forgotten

## Related Commands

- `/validation/code-review` — Produces the findings this command fixes
- `/code-review-fix` — Main pipeline fix command (different from validation variant)
- `/final-review` — Verifies all fixes before commit