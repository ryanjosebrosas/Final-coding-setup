# Task 5: Create Code-Review-Fix Skill (Codex)

## Objective

Create `.codex/skills/code-review-fix/SKILL.md` — a Codex CLI skill for fixing code review
findings that adds reasoning depth: hard entry gate discipline, severity ordering rationale,
minimal-change principle, per-fix verification, and scope discipline.

## Scope

- **File to create**: `.codex/skills/code-review-fix/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/code-review-fix.md`
- **Dependencies**: None

## Prior Task Context

Tasks 1-4 created skills for mvp, prd, planning, council. Those are discovery/artifact skills.
Code-review-fix is different — it's an implementation/fix skill. Same frontmatter pattern but
the body focuses on what makes a fix session safe vs. reckless.

## Context References

### Reference: Source Command — `.opencode/commands/code-review-fix.md`

```markdown
---
description: Process to fix bugs found in manual/AI code review
model: claude-sonnet-4-6
---

# Code Review Fix: Fix Issues from Review

## Usage
/code-review-fix [review-file] [scope]

Arguments:
- review-file (required): Path to code review report
- scope (optional): all | critical+major | critical | file-path

## Hard Entry Gate (Non-Skippable)

Before any fix work:
1. Verify $ARGUMENTS includes a review file path
2. Verify the review file exists and contains findings
3. If either check fails:
   Blocked: /code-review-fix requires a review file. Run /code-review first.

Never run fixes without a review artifact.

## Step 3: Fix Issues by Severity

Process findings in priority order:
Critical First → Major Second → Minor Last

For each finding:
1. Explain what was wrong
2. Show the fix with minimal changes
3. Verify the fix resolves the issue

## Important Rules
- Fix in severity order: Critical → Major → Minor
- Minimal changes: Fix the issue, don't refactor surrounding code
- Verify each fix: Don't batch all fixes before validating
- Respect scope: Don't fix Minor issues if scope is critical+major
- Report unresolvable: If a fix introduces new problems, stop and report
```

### Reference: Codex skill frontmatter pattern

```yaml
---
name: council
description: Run a multi-perspective council discussion on the given topic, presenting
             genuinely distinct viewpoints then synthesizing them. Use when the user wants
             multiple perspectives on a decision, needs to explore tradeoffs from different
             angles, or wants to pressure-test an approach. Trigger phrases include:
             "council", "multiple perspectives", "what would different people think",
             "debate this", "pros and cons from different angles", "get a council on".
---
```

## Patterns to Follow

### Pattern: Hard entry gate — skill explains WHY

Command says: "Verify the review file exists and contains findings."
Skill explains: WHY running without a review file is dangerous — you can make changes with no
objective basis, introduce regressions, and have no way to verify you fixed what mattered.

### Pattern: Minimal change principle

Bad fix: Finding says "add null check at line 45" → developer rewrites the entire function
for clarity while they're in there.
Good fix: Finding says "add null check at line 45" → developer adds exactly the null check,
nothing else.

Why: Co-mingling fixes with refactoring makes the re-review harder (what changed was the fix
or the refactor?), introduces scope creep, and makes it impossible to verify the fix in
isolation.

### Pattern: Per-fix verification vs. batch verification

Bad: Apply all 8 fixes, then run tests once.
Good: Apply fix 1, run L1-L3 validation, proceed to fix 2.

Why: If tests fail after batch fixes, you don't know which fix caused the regression.
Per-fix verification means failures are always attributable to the most recent change.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/code-review-fix/SKILL.md`

```markdown
---
name: code-review-fix
description: Fix issues identified in a code review report, processing findings by severity
             and applying fixes systematically. Use when the user wants to fix code review
             findings, address review issues, process a review report, or fix bugs from a
             review. Trigger phrases include: "fix review findings", "address the review",
             "code review fix", "fix the issues from review", "process review findings",
             "fix critical issues", "code-review-fix".
---

# Code Review Fix: Fix Issues from Review

## When to Use This Skill

Use this skill when:
- `/code-review-fix [review-file]` is invoked
- The user wants to address findings from a code review
- A review artifact exists at `.agents/features/{feature}/review.md` (or similar)
- The pipeline is at the `/code-review → /code-review-fix` stage

## Hard Entry Gate (Non-Skippable)

Before any fix work:
1. Verify a review file path was provided
2. Verify the review file exists on disk
3. Verify the review file contains actual findings (not just "no issues found")

**If any check fails:**
```
Blocked: /code-review-fix requires a review file. Run /code-review first.
```

**Why this gate matters:** Running fixes without a review artifact means:
- No objective basis for what to change (you're guessing)
- No way to verify you fixed what was actually flagged
- Risk of introducing regressions with no record
- The next re-review has nothing to compare against

A review file is the contract between "what was wrong" and "what was fixed."

## Severity Ordering Rationale

Process findings in this exact order: **Critical → Major → Minor**

**Why Critical first:**
Critical issues block the commit. If you fix Minor issues first and then a Critical fix
introduces a regression, you've broken code that was previously working — and you now
have more to unwind. Critical first minimizes blast radius.

**Why not fix everything at once:**
Each severity tier has different risk tolerance. Critical fixes are surgical and necessary.
Major fixes improve correctness. Minor fixes improve quality. These are different conversations
with different review standards. Processing them separately keeps each category clean.

**Scope parameter behavior:**
- `all` — fix all findings (default)
- `critical+major` — skip Minor findings (deadline pressure, acceptable)
- `critical` — fix only blockers (emergency deploy, revisit rest later)
- `file-path` — scope to specific files (partial review, others in progress)

When using `critical+major`, do NOT fix Minor issues you notice while implementing Major fixes.
The scope parameter is a commitment, not a suggestion.

## Minimal Change Principle

Fix the issue. Nothing else.

**What this means:**
- Finding says "add null check at line 45" → add the null check at line 45
- Do NOT rewrite the function for clarity while you're there
- Do NOT rename variables that aren't part of the finding
- Do NOT restructure surrounding code "to make the fix cleaner"

**Why minimal changes matter:**
1. The re-review compares current state against what was found. Extra changes make it
   impossible to verify the fix didn't introduce new problems.
2. Co-mingling fixes and refactors obscures the commit history.
3. Scope creep in fix sessions delays re-review and creates merge conflicts.

**Bad fix (violates minimal change):**
Finding: `auth.ts:45 — missing null check on user.session`
Fix applied: Rewrote auth validation function, added null check, extracted helper,
renamed `checkAuth` to `validateUserSession`, added JSDoc.

**Good fix (minimal change):**
Finding: `auth.ts:45 — missing null check on user.session`
Fix applied: Added `if (!user.session) return null;` at line 45. Nothing else.

## Per-Fix Verification

After each fix, run validation before moving to the next finding.

**Validation sequence per fix:**
```
L1 (lint): {project lint command}
L2 (types): {project typecheck command}
L3 (tests): {project test command} — run affected test file(s)
```

**Why per-fix, not batch:**
If you apply 8 fixes then run tests and 3 fail, you don't know which fix caused which
failure. Per-fix verification means every regression is immediately attributable to
the most recent change — and you can revert only that change.

**When validation fails after a fix:**
1. Stop immediately — do NOT proceed to the next finding
2. Diagnose: is the failure caused by the fix, or was it pre-existing?
3. If caused by the fix: revert, rethink the approach, fix differently
4. If pre-existing: document as "pre-existing failure, not caused by this fix"
5. Report to user if unresolvable — never silently skip

## Scope Discipline

**Do not fix things not in the review:**
If you notice an issue while implementing a fix, resist the urge to fix it inline.
Instead: note it in the fix report as "observed but out of scope" so it can be tracked
for the next review cycle.

**Why:** The review file is the scope boundary for this session. Expanding scope mid-session
means the re-review now covers changes that were never reviewed — defeating the purpose
of the review-fix cycle.

**Exception:** If fixing a Critical issue requires modifying adjacent code for correctness
(e.g., the null check must also update the calling function), document this as "required
scope expansion" with explicit reasoning.

## Key Rules

1. **Hard entry gate** — no review file, no fixes; stop and report
2. **Severity order is non-negotiable** — Critical → Major → Minor, always
3. **Minimal changes only** — fix the finding, not the neighborhood
4. **Per-fix verification** — validate after each fix, not after all fixes
5. **Respect scope parameter** — `critical+major` means skip Minor, even obvious ones
6. **Report unresolvable** — if a fix introduces new problems, stop and surface to user
7. **Scope discipline** — out-of-scope observations go in report, not inline fixes
```

### VALIDATE

```bash
grep -c "name: code-review-fix" .codex/skills/code-review-fix/SKILL.md
grep -c "When to Use This Skill" .codex/skills/code-review-fix/SKILL.md
grep -c "Key Rules" .codex/skills/code-review-fix/SKILL.md
grep -c "Trigger phrases" .codex/skills/code-review-fix/SKILL.md
grep -c "Hard Entry Gate" .codex/skills/code-review-fix/SKILL.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that skill covers hard entry gate with WHY,
minimal change principle with good/bad examples, per-fix verification rationale, scope
discipline.

## Validation Commands

```bash
# L1
grep -c "name: code-review-fix" .codex/skills/code-review-fix/SKILL.md
grep -c "When to Use This Skill" .codex/skills/code-review-fix/SKILL.md
grep -c "Key Rules" .codex/skills/code-review-fix/SKILL.md
grep -c "Trigger phrases" .codex/skills/code-review-fix/SKILL.md
grep -c "Hard Entry Gate" .codex/skills/code-review-fix/SKILL.md

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/code-review-fix/SKILL.md` exists
- [ ] Frontmatter has `name: code-review-fix` and trigger phrases
- [ ] Has `## When to Use This Skill` section
- [ ] Has Hard Entry Gate section with explanation of WHY it matters
- [ ] Has severity ordering rationale (not just the order, but why)
- [ ] Has minimal change principle with good/bad examples
- [ ] Has per-fix verification with rationale
- [ ] Has `## Key Rules` section

### Runtime
- [ ] Codex matches this skill when user says "fix review findings" or "code-review-fix"

## Handoff Notes

Task 6 creates `.codex/skills/system-review/SKILL.md`. System review is NOT code review —
it's a meta-level analysis of process quality. Focus: plan vs. reality analysis, divergence
classification, memory suggestions, alignment scoring.

## Completion Checklist

- [ ] `.codex/skills/code-review-fix/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-5.md` → `task-5.done.md` rename completed
