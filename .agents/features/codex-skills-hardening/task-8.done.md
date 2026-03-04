# Task 8: Create Final-Review Skill (Codex)

## Objective

Create `.codex/skills/final-review/SKILL.md` — a Codex CLI skill for the pre-commit approval
gate that adds reasoning depth: read-only discipline, validation pyramid requirements,
verdict standards, the "ask don't auto-commit" rule, and outstanding issues handling.

## Scope

- **File to create**: `.codex/skills/final-review/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/final-review.md`
- **Dependencies**: None

## Prior Task Context

Task 7 created `.codex/skills/pr/SKILL.md` — a git workflow skill. Final review is the
checkpoint BEFORE commit. Same frontmatter pattern but the body focuses on final-review's
unique role: it's the last human approval gate, not a fix session.

## Context References

### Reference: Source Command — `.opencode/commands/final-review.md` (key sections)

```markdown
---
description: Final review gate — summarize all changes, verify acceptance criteria, get human approval before commit
---

# Final Review: Pre-Commit Approval Gate

## Purpose
Final checkpoint between /code-loop (or /code-review) and /commit. Aggregates all review
findings, shows what changed, verifies acceptance criteria from the plan, and asks for
explicit human approval before committing.

Workflow position:
/execute → /code-loop → /final-review → /commit

This command does NOT fix code. It summarizes, verifies, and asks.

## Step 6: Final Verdict

FINAL REVIEW SUMMARY
====================
Changes:     X files changed, +Y/-Z lines
Tests:       A passed, B failed
Lint/Types:  CLEAN / X issues remaining
Reviews:     N iterations, M issues fixed, P outstanding
Criteria:    X/Y met (Z deferred)

VERDICT: READY TO COMMIT / NOT READY

READY TO COMMIT when:
- All validation levels pass (lint, types, tests)
- No Critical or Major review findings outstanding
- All Implementation acceptance criteria met (if plan provided)

NOT READY when:
- Any validation level fails
- Critical or Major review findings still open
- Implementation acceptance criteria not met

## Step 7: Ask for Approval

If READY TO COMMIT:
Ask the user:
  Ready to commit. Suggested message:
    {type}({scope}): {description}
  Proceed with /commit? (yes / modify message / abort)

Wait for explicit user response. Do NOT auto-commit.

## Notes
- This command is read-only: it does NOT modify files, stage changes, or create commits.
- Keep the summary concise — the user has already been through /code-loop and wants a
  quick final check, not a deep re-review.
```

### Reference: Codex skill frontmatter pattern

```yaml
---
name: system-review
description: Analyze implementation quality against the plan — divergence patterns, plan
             adherence, and process improvement suggestions. Use when the user wants to
             review how well an implementation followed its plan, assess process quality,
             generate memory suggestions, or get an alignment score. Trigger phrases include:
             "system review", "review the implementation", "how well did we follow the plan",
             "check plan adherence", "process review", "generate memory suggestions",
             "alignment score", "system-review".
---
```

## Patterns to Follow

### Pattern: Read-only discipline

The command explicitly states: "This command does NOT fix code. It summarizes, verifies,
and asks."

The skill must explain WHY read-only matters. Final review that fixes things silently
undermines the point: the human is supposed to approve knowing exactly what's in the commit.
If the final review modifies files, the diff the human approved is no longer the diff that
gets committed.

### Pattern: Verdict standards — explicit criteria

"NOT READY" has concrete criteria:
- Any validation level fails (lint, types, tests)
- Critical or Major review findings still open
- Implementation acceptance criteria not met

The skill must explain WHY these are the bars, not just restate them. A "NOT READY" verdict
with Critical findings outstanding means: there's a known bug in the commit. No amount of
"let's just ship it" changes the fact that you're knowingly committing broken code.

### Pattern: Ask, don't auto-commit

This is the key human-in-the-loop principle. The reason final review exists is to give the
human a chance to say "no." Auto-committing defeats the purpose.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/final-review/SKILL.md`

```markdown
---
name: final-review
description: Final pre-commit gate — aggregate all review findings, run validation pyramid,
             verify acceptance criteria, and ask for explicit human approval. Use when the
             user wants a final check before committing, wants to see a change summary,
             wants to verify acceptance criteria, or is ready to commit after code-loop.
             Trigger phrases include: "final review", "pre-commit check", "ready to commit",
             "review before commit", "show what changed", "final check", "final-review".
---

# Final Review: Pre-Commit Approval Gate

## When to Use This Skill

Use this skill when:
- `/final-review [plan-path]` is invoked
- The user is at the end of a code-loop and wants a final check before committing
- Acceptance criteria need to be verified against the plan
- Human approval is needed before a commit is created

**Workflow position:**
```
/execute → /code-loop → /final-review → /commit
```

## Read-Only Discipline (Critical)

**Final review does NOT fix code. It summarizes, verifies, and asks.**

This is the most important constraint. Do NOT:
- Modify any source files
- Stage any changes
- Create commits
- Apply review fixes
- Update documentation

**Why read-only matters:**
The human approves the diff at final review time. If final review modifies files, the diff
the human saw and approved is no longer the diff that gets committed. The approval becomes
meaningless — the human approved a snapshot that no longer exists.

Final review is a trust boundary. The implementation is locked. The question is only:
"Is what's locked good enough to commit?"

**If you discover a problem during final review:**
Do NOT fix it inline. Report it in the verdict as "NOT READY" with the blocking issue.
The user will then re-run `/code-loop` or `/code-review-fix`, then retry `/final-review`.

## Validation Pyramid Requirements

Run the full validation stack before issuing a verdict:

```
L1 (Syntax & Style): {configured lint command}
L2 (Type Safety):    {configured typecheck command}
L3 (Unit Tests):     {configured test command}
```

**Validation results drive the verdict:**
- Any L1-L3 failure → NOT READY, full stop
- All L1-L3 pass → proceed to review findings check

**Why all three levels:**
Lint catches style/formatting issues that will fail CI. Types catch contract violations that
will fail at runtime. Tests catch behavioral regressions. A commit that passes all three
has a high baseline of correctness. A commit that skips any level has an unknown quality
baseline — and "unknown" is not acceptable for a commit gate.

## Verdict Standards

**READY TO COMMIT** requires ALL of:
- L1 (lint) passes
- L2 (types) passes
- L3 (tests) pass
- No Critical or Major review findings outstanding
- All Implementation acceptance criteria met (if plan provided)

**NOT READY** if ANY of:
- Any validation level fails
- Critical or Major review findings still open
- Implementation acceptance criteria not met

**Why Critical/Major findings block commit:**
A Critical finding is a known bug. Committing with a known Critical finding means
intentionally committing broken code. This will fail review, fail QA, or fail in production.
There is no acceptable reason to commit a Critical-finding code.

A Major finding is a significant correctness or architecture issue. Unlike Critical, it
won't necessarily cause immediate failure, but it will cause maintenance problems and
likely need to be fixed soon anyway. Committing Major findings is a debt decision — only
acceptable if the user explicitly acknowledges the tradeoff.

**Minor findings don't block commit** — they are quality improvements that can be addressed
in a follow-up PR. Blocking commits on Minor findings would cause analysis paralysis.

## Ask, Don't Auto-Commit

When verdict is READY TO COMMIT, present the summary and ask:

```
FINAL REVIEW SUMMARY
====================
Changes:     X files changed, +Y/-Z lines
Tests:       A passed, B failed
Lint/Types:  CLEAN
Reviews:     N iterations, M issues fixed, P outstanding
Criteria:    X/Y met (Z deferred to runtime)

VERDICT: READY TO COMMIT

Suggested commit message:
  feat(auth): add session null check and expiry handling

Proceed with /commit? (yes / modify message / abort)
```

Wait for explicit user response. Do NOT auto-commit.

**Why explicit approval matters:**
Final review is a human-in-the-loop checkpoint by design. The user may want to:
- Modify the commit message before committing
- Add more context to the message
- Decide this isn't the right time to commit (waiting for another change)
- Abort entirely (e.g., requirements changed)

Auto-committing removes the human from their own approval gate.

## Outstanding Issues Handling

If there are Minor findings that were not fixed (scope was `critical+major`), list them:

```
Outstanding Issues (not blocking):
- Minor: auth.ts:88 — variable name `x` should be more descriptive
  Status: Deferred (scope was critical+major)
  Action: Fix in follow-up PR or next code-loop
```

These are informational — they don't block READY TO COMMIT, but the user should know
they exist so they can decide whether to fix them now or defer.

## Key Rules

1. **Read-only** — no file modifications, staging, or commits in final review
2. **Full validation pyramid** — run L1-L3 before issuing verdict
3. **Critical/Major findings block commit** — no exceptions
4. **Minor findings don't block** — they inform but don't block
5. **Explicit human approval required** — ask with suggested message, wait for response
6. **Verdict must have specific evidence** — "NOT READY" needs to name the blocking issue
7. **Keep summary concise** — user already went through code-loop; this is a quick gate
```

### VALIDATE

```bash
grep -c "name: final-review" .codex/skills/final-review/SKILL.md
grep -c "When to Use This Skill" .codex/skills/final-review/SKILL.md
grep -c "Key Rules" .codex/skills/final-review/SKILL.md
grep -c "Trigger phrases" .codex/skills/final-review/SKILL.md
grep -c "Read-Only" .codex/skills/final-review/SKILL.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that skill covers read-only discipline
(WHY), validation pyramid requirements, verdict standards with rationale for Critical/Major
blocking, and explicit approval rule with WHY.

## Validation Commands

```bash
# L1
grep -c "name: final-review" .codex/skills/final-review/SKILL.md
grep -c "When to Use This Skill" .codex/skills/final-review/SKILL.md
grep -c "Key Rules" .codex/skills/final-review/SKILL.md
grep -c "Trigger phrases" .codex/skills/final-review/SKILL.md
grep -c "Read-Only" .codex/skills/final-review/SKILL.md

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/final-review/SKILL.md` exists
- [ ] Frontmatter has `name: final-review` and trigger phrases
- [ ] Has `## When to Use This Skill` section
- [ ] Has read-only discipline section with WHY explanation
- [ ] Has validation pyramid requirements
- [ ] Has verdict standards with rationale for Critical/Major blocking
- [ ] Has "ask, don't auto-commit" section with WHY
- [ ] Has `## Key Rules` section

### Runtime
- [ ] Codex matches this skill when user says "final review" or "ready to commit"

## Handoff Notes

Task 9 creates `.codex/agents/plan-writer.md`. Shift from skills to agents. Agents are
subprocesses — they have their own context window and are dispatched by the main agent.
Codex agent format: no `tools:` field, but otherwise mirrors `.claude/agents/` structure.
Focus: one-artifact-per-invocation discipline, self-validation before reporting complete.

## Completion Checklist

- [ ] `.codex/skills/final-review/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-8.md` → `task-8.done.md` rename completed
