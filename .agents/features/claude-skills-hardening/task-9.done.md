# Task 9: Create System Review Skill

## Objective

Create `.claude/skills/system-review/SKILL.md` — a knowledge framework for meta-analysis
quality: scoring methodology rigor, divergence judgment, memory suggestion selectivity,
and actionable improvement specificity.

## Scope

- **File to create**: `.claude/skills/system-review/SKILL.md`
- **Out of scope**: Do NOT modify `.claude/commands/system-review.md`
- **Dependencies**: None

## Prior Task Context

Tasks 1-8 complete. System review is the meta-level command that analyzes HOW the pipeline
ran, not what was built.

## Context References

### Reference: .claude/commands/system-review.md (key sections)

```markdown
## Purpose
System review is NOT code review. You're looking for bugs in the PROCESS, not the code.
- Analyze plan adherence and divergence patterns
- Classify divergences as justified vs problematic
- Generate process improvements
- Auto-suggest lessons for memory.md

## Scoring
Alignment Score = Plan Adherence (40%) + Plan Quality (20%) + Divergence Justification (30%)
                  + Code Quality (10%)

Plan Adherence = (File Adherence % + Pattern Compliance %) / 2
Plan Quality = section completeness /100 * 10
Divergence Justification = (Good divergences / Total) × 10
Code Quality = 10 - (Critical×2 + Major×1 + Minor×0.5)

## Rules
- Be specific: Don't say "plan was unclear" — say "plan didn't specify X"
- Focus on patterns: Look for repeated problems, not one-offs
- Action-oriented: Every finding should have a concrete asset update suggestion
- Be selective: Only action recommendations that genuinely improve future loops
```

## Step-by-Step Tasks

### IMPLEMENT: Create `.claude/skills/system-review/SKILL.md`

```markdown
---
name: system-review
description: Knowledge framework for meta-analysis of pipeline quality, divergence judgment, and actionable process improvements
license: MIT
compatibility: claude-code
---

# System Review — Meta-Analysis Methodology

This skill provides the quality standards for running effective system reviews. It
complements the `/system-review` command — the command provides the scoring formula,
this skill provides the judgment criteria behind the scores and the standard for
what makes a system improvement recommendation genuinely useful.

## When This Skill Applies

- `/system-review` is invoked after an implementation cycle
- An execution report exists and needs to be analyzed for process quality
- A feature has been implemented and the team wants to improve the next implementation
- Memory.md suggestions are being evaluated before writing

## The Core Distinction: Process vs. Code

System review analyzes the PROCESS, not the code. This distinction matters:

**Code review** asks: "Is this code correct, secure, and maintainable?"
**System review** asks: "Did the process work? Did the plan reflect reality?
Did the executor follow it? Did divergences improve or degrade the outcome?"

Common mistake: using system review to re-litigate code quality. Code quality is
already captured in the Code Quality component of the score (10% weight). System
review is primarily about Plan Adherence (40%) and Divergence Justification (30%).

## Scoring Judgment Quality

The four scoring components require judgment, not just arithmetic:

**Plan Adherence (40%) — File + Pattern Compliance**

File Adherence is mechanical: planned files were either modified or not.
Pattern Compliance requires judgment: was the referenced pattern actually followed,
or was it mentioned but not implemented?

Assessing pattern compliance:
- "Follows pattern from src/services/user.ts:45-62" — check if the implementation
  actually mirrors the structure at those lines, not just whether the file was read
- Pattern compliance = (patterns found in implementation / patterns referenced in plan) × 100

**Plan Quality (20%) — Section Completeness**

Each section scored 0-10. The scoring must reflect genuine completeness, not just presence:
- "Feature Description: Complete" requires that the description is accurate and specific,
  not just that the section exists
- "Patterns to Follow: Partial" is appropriate when patterns are mentioned by name but
  no code snippet was provided

Score 0 for missing, 5 for present-but-shallow, 10 for complete and useful.

**Divergence Justification (30%) — Good vs. Bad**

This is the highest-judgment component. A divergence justified as "Good" must have
a specific, defensible reason:

Good justification: "Plan referenced src/auth.ts:45 but that function was removed in
the last commit — executor found the replacement in src/auth/service.ts:12"
Bad justification: "The approach in the plan seemed less clean" (preference, not constraint)

Apply the same classification criteria as the execute skill:
- Good ✅ = plan limitation (plan didn't know about X)
- Bad ❌ = execution choice (executor decided to do Y instead of plan's X)

**Code Quality (10%) — From Code Review**

This component is secondary in the alignment score. It simply translates the code
review findings: `10 - (Critical×2 + Major×1 + Minor×0.5)`.

If no code review was run, note it and estimate based on execution report issues.

## Memory Suggestion Quality

Memory suggestions are the most high-value output of system review — they improve
every future feature if done well. Standards:

**A good memory suggestion:**
- Addresses a specific, recurring pattern (not a one-time anomaly)
- Names the exact asset to update (which command, which template, which section)
- Has a transferable lesson (applies to more than just this feature)

Example of good suggestion:
```
### 2026-03-04: Plan must specify file:line for pattern references
Category: gotcha
What: When plans reference "follow pattern in file X" without line numbers, executors
  read the wrong section or a deprecated function
Why: Line numbers change — but a specific pattern description + line range is stable
  enough to be actionable
Applied to: .claude/commands/planning.md — add requirement: "all pattern references
  must include file:line range and a 3-5 line code snippet showing the pattern"
```

**A bad memory suggestion:**
```
### today: Be more careful
Category: general
What: should have been more careful
Why: quality
Applied to: everything
```

**Selectivity rule:**
Better to write 2 specific, transferable suggestions than 8 generic observations.
Each suggestion that gets added to memory.md will be read in every future session.
Low-quality suggestions add noise that degrades memory.md's signal-to-noise ratio.

## System Improvement Specificity

System improvement actions must be specific enough to be immediately actionable:

**Too vague:**
"Update planning command to include more context"

**Specific and actionable:**
"Add to .claude/commands/planning.md in Step 2 (Explore): 'When identifying patterns
to follow, include file:line range AND a 3-5 line code snippet from that exact location.
Pattern references without code examples produce incomplete execution.'"

The test: can someone apply this improvement without asking a follow-up question?
If not, it needs more specificity.

**Asset mapping:**
Every system improvement should map to a specific asset:
- `.claude/commands/{command}.md` — add/clarify an instruction
- `.claude/skills/{skill}/SKILL.md` — add/update reasoning framework
- `.agents/features/{feature}/plan.md` — what the plan should have included
- `memory.md` — lesson to carry forward

## Classification Anti-Patterns in System Review

**Calling a preference a Good divergence** — "The executor preferred a cleaner approach"
is not a Good divergence. Preferences are Bad divergences unless the plan approach was
technically impossible.

**Calling a plan gap a Bad divergence** — If the plan said "follow pattern at auth.ts:45"
and that function no longer exists, the divergence is Good (the plan had missing context),
not Bad (the executor improvised).

**Generic improvement actions** — "Improve the planning process" is not an action.
Actions must name a specific instruction to add or change in a specific file.

**Rewarding divergences that should have been planned** — If a feature needed an edge
case that the plan didn't cover, the right memory suggestion is "add edge case analysis
to planning" — not "this Good divergence shows executors can handle the unexpected."

## Anti-Patterns

**Confusing system review with code review** — System review is process analysis,
not quality analysis. Avoid spending review time on code issues.

**Inflating the alignment score** — The score is only useful if it's honest. A 9/10
on a feature that had significant plan divergences and skipped validation is misleading.

**Vague memory suggestions** — "Be more careful with X" is not a lesson. Lessons must
be specific enough to change behavior in the next session.

**Non-actionable improvement actions** — "Think about planning more carefully" is not
an action. Actions name a file and a specific change.

**Retrospective code review** — Adding new code findings in Step 4 that weren't in
the original code review inflates the Code Quality component with post-hoc analysis.

## Key Rules

1. **System review = process analysis, not code review** — Code quality is 10% of score
2. **Divergence justification requires specific evidence** — "Cleaner" is not justification
3. **Plan quality scoring requires genuine assessment** — Not just section presence
4. **Memory suggestions must be specific and transferable** — Not one-off observations
5. **Improvement actions must name a file and a change** — Not "improve the process"
6. **Be selective** — 2 specific suggestions > 8 generic ones
7. **Score honestly** — An inflated score provides no signal for improvement

## Related Commands

- `/system-review` — The meta-analysis workflow this skill supports
- `/code-review` — Feeds the Code Quality component of the alignment score
- `/execute {plan}` — The execution step that generates the report /system-review analyzes
- `memory.md` — Receives the Memory Suggestions output from /system-review
```

### VALIDATE

```bash
grep -c "name: system-review" .claude/skills/system-review/SKILL.md
grep -c "When This Skill Applies" .claude/skills/system-review/SKILL.md
grep -c "Key Rules" .claude/skills/system-review/SKILL.md
grep -c "Anti-Patterns" .claude/skills/system-review/SKILL.md
```

## Validation Commands

```bash
# L1
grep -c "name: system-review" .claude/skills/system-review/SKILL.md
grep -c "compatibility: claude-code" .claude/skills/system-review/SKILL.md
grep -c "When This Skill Applies" .claude/skills/system-review/SKILL.md
grep -c "Key Rules" .claude/skills/system-review/SKILL.md
# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.claude/skills/system-review/SKILL.md` exists
- [ ] Distinguishes system review from code review clearly
- [ ] Covers scoring judgment quality for each component
- [ ] Covers memory suggestion selectivity and specificity
- [ ] Covers improvement action specificity standard
- [ ] Has Anti-Patterns and Key Rules sections

## Handoff Notes

Task 10 creates `.claude/skills/commit/SKILL.md`. Focus: commit type/scope selection,
artifact completion sweep discipline, scoped staging rationale.

## Completion Checklist

- [ ] `.claude/skills/system-review/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-9.md` → `task-9.done.md` rename completed
