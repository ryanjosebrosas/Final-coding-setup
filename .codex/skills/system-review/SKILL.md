---
name: system-review
description: Meta-analysis of pipeline quality, divergence judgment, and actionable process improvements.
             Use when the user wants to review how the pipeline ran, not just the code.
             Trigger phrases include: "system review", "review the process", "analyze plan
             adherence", "how did the pipeline perform", "process review", "meta review",
             "review the implementation process", "pipeline quality review".
---

# System Review: Meta-Analysis Methodology

## When to Use This Skill

Use this skill after an implementation cycle to analyze HOW the pipeline ran —
not what was built. System review is process analysis, not code review.

**Code review** asks: "Is this code correct?"
**System review** asks: "Did the process work? Did the plan reflect reality?"

## The Process vs. Code Distinction

The most common system review mistake: spending the analysis on code quality instead
of process quality. Code quality is already captured in the Code Quality component (10%
of the alignment score). System review is primarily about:
- Plan Adherence (40%) — did execution follow the plan?
- Divergence Justification (30%) — when it didn't, was that good or bad?

Don't re-litigate code findings in system review. Focus on the process.

## Scoring Judgment Quality

**Plan Adherence (40%)**: File adherence is mechanical. Pattern compliance requires judgment —
was the referenced pattern actually followed, or just mentioned?

**Plan Quality (20%)**: Score 0 for missing, 5 for present-but-shallow, 10 for complete.
"The section exists" is not the same as "the section is complete and useful."

**Divergence Justification (30%)**: The highest-judgment component.
- Good ✅ = plan limitation (plan didn't know about X when it was written)
- Bad ❌ = execution choice (executor chose differently from plan without constraint)

"The approach seemed cleaner" is a preference, not a plan limitation — that's Bad ❌.
"The function the plan referenced was removed in the last commit" is a plan limitation — Good ✅.

**Code Quality (10%)**: Translate code review findings: `10 - (Critical×2 + Major×1 + Minor×0.5)`

## Memory Suggestion Quality

Memory suggestions are the highest-value output. Standards:

**Good suggestion** — specific, transferable, names the asset to update:
```
### 2026-03-04: Plan must specify file:line for pattern references
Category: gotcha
What: Plans referencing "follow pattern in file X" without line numbers cause executors
  to read the wrong section or a deprecated function
Applied to: .agents/features/*/plan.md — add requirement: all pattern references
  must include file:line range and a 3-5 line code snippet
```

**Bad suggestion** — vague, not transferable, no specific action:
```
### today: Be more careful
What: should have been more careful
Applied to: everything
```

Selectivity rule: 2 specific suggestions > 8 generic ones. Every suggestion added to
memory.md is read in every future session — low-quality suggestions add noise.

## Improvement Action Specificity

Every improvement must name a file and a specific change:

**Too vague**: "Update planning command to include more context"

**Specific**: "Add to .claude/commands/planning.md in Step 2: 'When identifying patterns,
include file:line range AND a 3-5 line code snippet. References without code produce
incomplete execution.'"

Test: can someone apply this improvement without asking a follow-up question?

## Key Rules

1. **System review = process analysis** — code quality is 10% of score
2. **Divergence needs specific evidence** — "cleaner" is not justification
3. **Score honestly** — inflated scores provide no signal
4. **Memory suggestions must be specific and transferable** — not one-off observations
5. **Improvement actions must name a file and change** — not "improve the process"
6. **Be selective** — 2 specific suggestions > 8 generic ones

## Related Commands

- `/system-review` — The meta-analysis workflow this skill supports
- `/code-review` — Feeds the Code Quality component of the alignment score
- `/execute` — Generates the report that system-review analyzes
