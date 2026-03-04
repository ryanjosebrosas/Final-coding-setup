# Task 6: Create System-Review Skill (Codex)

## Objective

Create `.codex/skills/system-review/SKILL.md` — a Codex CLI skill for meta-level process
analysis that adds reasoning depth: system review vs. code review distinction, divergence
classification framework, alignment scoring rationale, and memory suggestion discipline.

## Scope

- **File to create**: `.codex/skills/system-review/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/system-review.md`
- **Dependencies**: None

## Prior Task Context

Task 5 created `.codex/skills/code-review-fix/SKILL.md` — an implementation/fix skill.
System review is in a different category entirely: it's a meta-level analysis tool.
Same frontmatter pattern but the body must make the "process bugs, not code bugs" distinction
crystal clear.

## Context References

### Reference: Source Command — `.opencode/commands/system-review.md` (key sections)

```markdown
---
description: Analyze implementation against plan with auto-diff, code-review integration, and memory suggestions
---

# System Review (Enhanced)

## Purpose

System review is NOT code review. You're looking for bugs in the process, not the code.

Your job:
- Analyze plan adherence and divergence patterns
- Classify divergences as justified vs. problematic
- Generate process improvements for project assets
- Auto-suggest lessons for memory.md

Philosophy:
- Good divergence → plan limitations → improve planning
- Bad divergence → unclear requirements → improve communication
- Repeated issues → missing automation → create commands

## Step 1: Auto-Diff (Plan vs. Reality)
- File Adherence % (planned files that were modified)
- Pattern Compliance % (referenced patterns appear in diff)
- Scope Creep (+N files not in plan)
- Missed Files (N files in plan but not modified)

## Step 3: Read Execution Report
Classify each divergence:
Good Divergence (Justified):
- Plan assumed something that didn't exist
- Better pattern discovered during implementation
- Performance/security issue required different approach

Bad Divergence (Problematic):
- Ignored explicit constraints
- Created new architecture vs. following patterns
- Shortcuts introducing tech debt
- Misunderstood requirements

## Step 6: Memory Suggestions
Extract from execution report:
1. Divergences → lessons about planning gaps
2. Challenges → gotchas for future features
3. Workarounds → patterns to replicate
4. "Wish we knew" → decisions to document

Categories: gotcha | pattern | decision | anti-pattern

## Scoring
Alignment Score = (
  Plan Adherence × 0.40 +
  Plan Quality × 0.20 +
  Divergence Justification × 0.30 +
  Code Quality × 0.10
)

9-10: Excellent — process working well
7-8: Good — minor improvements needed
5-6: Fair — significant gaps identified
<5: Poor — process breakdown, needs attention
```

### Reference: Codex skill frontmatter pattern

```yaml
---
name: planning
description: Interactive discovery session to explore ideas with the user, then produce a
             structured implementation plan with task briefs. Use when a feature needs to be
             planned before implementation, a complex task needs to be broken down, or the
             user wants to create a structured plan. Trigger phrases include: "plan a feature",
             "create an implementation plan", "break down this feature", "let's plan",
             "I need a plan for", "planning", "how do we implement".
---
```

## Patterns to Follow

### Pattern: System review is about process, not code

The most important job of this skill is enforcing the distinction:
- Code review → finds bugs IN the code
- System review → finds bugs IN the process that produced the code

Someone running system review and writing "missing null check in auth.ts" has confused the
two. The system review finding would be: "Three null check bugs were found — the plan's
Patterns to Follow section didn't include null safety patterns from the codebase, causing
the execution agent to miss the convention. Fix: add null safety pattern to plan template."

### Pattern: Divergence classification drives value

A divergence report that says "implementation differed from plan" is useless.
A divergence report that says:
- "Plan assumed AuthService existed — it didn't (missing context)"
- "Implementation used Promise.all instead of sequential — better pattern discovered (good)"
- "Skipped error handling — shortcuts introducing tech debt (bad — root cause: unclear plan)"

...is actionable. The classification tells you WHERE to improve the system.

### Pattern: Memory suggestions must be selective

Bad memory suggestion: "Remember to add null checks"
Good memory suggestion: "When working with user session objects, always check session.token
before session.user — the token expires independently. Applied to auth patterns."

The test: could this memory entry help a different agent in a different session make a
better decision? If yes, it's a good memory. If it's just a general truism ("write good
code"), skip it.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/system-review/SKILL.md`

```markdown
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

# System Review: Process Quality Analysis

## When to Use This Skill

Use this skill when:
- `/system-review` is invoked after `/execute`
- The user wants to assess how well the implementation followed the plan
- Memory suggestions need to be generated from an execution
- An alignment score is needed for process retrospective

## System Review ≠ Code Review

This is the most important distinction to internalize.

**Code review** asks: "Is the code correct?"
- Finds null pointer bugs, type errors, security vulnerabilities
- Output: list of code findings with file:line references
- Actor: code reviewer

**System review** asks: "Did the process work correctly?"
- Finds planning gaps, execution discipline failures, missing patterns
- Output: alignment score, divergence classification, memory suggestions
- Actor: process analyst

**Wrong system review finding:**
"auth.ts:45 — missing null check on user.session"
(This is a code review finding, not a system review finding.)

**Right system review finding:**
"Three null-check bugs found in auth.ts during code review. Root cause: the plan's
Patterns to Follow section had no null safety examples from the codebase. The execute
agent had no reference to follow. Fix: add null safety pattern to the plan template
and extract it from existing auth code in future planning sessions."

## Divergence Classification Framework

Every divergence between plan and implementation must be classified:

**Good Divergence ✅ — plan limitation discovered:**
- Plan assumed X existed in the codebase → X didn't exist
- Better pattern found during implementation → approach improved
- Technical constraint discovered during execution → approach adapted
- Performance/security issue required different approach

Good divergences tell you the PLAN was wrong. Response: improve planning.

**Bad Divergence ❌ — execution discipline failure:**
- Ignored explicit constraints in the plan
- Created new architecture instead of following established patterns
- Took shortcuts introducing technical debt
- Misunderstood requirements

Bad divergences tell you EXECUTION was wrong. Response: improve communication or templates.

**Root cause categories (assign to every divergence):**
- `unclear plan` — plan didn't specify X clearly enough
- `missing context` — didn't know about Y during planning
- `missing validation` — no test/check caught Z
- `manual step repeated` — something was done manually that should be automated
- `other` — describe specifically

**Why classification matters:**
A divergence report without classification tells you WHAT changed.
A classified report tells you HOW TO IMPROVE the system.
Unclassified divergences have no action — they're noise.

## Alignment Scoring Rationale

The alignment score measures process health on a 0-10 scale:

```
Alignment Score = (
  Plan Adherence × 0.40 +    ← did the implementation touch the right files?
  Plan Quality × 0.20 +      ← was the plan detailed enough to execute?
  Divergence Justification × 0.30 +  ← were deviations justified?
  Code Quality × 0.10        ← did the code pass review?
)
```

**Why these weights:**
- Plan Adherence (40%) — the primary measure. If the implementation touched different files
  than planned, the plan was wrong OR execution was undisciplined. Both need fixing.
- Divergence Justification (30%) — the second largest weight because it tells you whether
  deviations are signals of plan quality (good divergence) or execution problems (bad).
- Plan Quality (20%) — a plan assessment that feeds forward: a poor-quality plan is the
  root cause of many downstream problems.
- Code Quality (10%) — included because process quality ultimately shows up in code, but
  weighted low because code bugs are a code review concern, not primarily a system concern.

**Score interpretation:**
- 9-10: Excellent — process working well, minor adjustments only
- 7-8: Good — minor improvements needed, log lessons but don't overhaul
- 5-6: Fair — significant gaps identified, improve planning or execution templates
- <5: Poor — process breakdown, requires explicit attention before next feature

## Memory Suggestion Discipline

System review generates memory suggestions — candidate lessons for `memory.md`.

**The test for a good memory suggestion:**
Could this entry help a different agent in a different session make a better decision?

**Good memory suggestion:**
"When the plan references AuthService, verify it exists first — this service was missing
in three separate executions because the plan assumed it from a PRD reference, not actual
codebase scan. Applied to: planning checklist, execute step 1."

**Bad memory suggestion:**
"Remember to write good tests" — general truism, not actionable
"Check that imports work" — too vague, applies to everything

**Categories for memory suggestions:**
- `gotcha` — pitfall or edge case that surprised execution
- `pattern` — successful approach to replicate in future features
- `decision` — architecture or technology choice with rationale to remember
- `anti-pattern` — what not to do (with root cause explanation)

**Memory suggestions must be selective:** 2-4 per execution is typical. If generating 10+,
the quality bar is too low — only keep the ones where "a future agent would have avoided
a real problem by knowing this."

## Key Rules

1. **System review ≠ code review** — focus on process bugs, not code bugs
2. **Every divergence must be classified** — Good/Bad + root cause category
3. **Alignment score is weighted** — know why each component has its weight
4. **Memory suggestions must pass the "different agent" test** — actionable, not general
5. **Action orientation** — every finding should have a concrete asset to improve
6. **Be specific** — not "plan was unclear" but "plan didn't specify the service interface
   for AuthService, causing execution agent to create a new pattern instead of following
   the existing UserService pattern in src/services/user.ts:45-62"
```

### VALIDATE

```bash
grep -c "name: system-review" .codex/skills/system-review/SKILL.md
grep -c "When to Use This Skill" .codex/skills/system-review/SKILL.md
grep -c "Key Rules" .codex/skills/system-review/SKILL.md
grep -c "Trigger phrases" .codex/skills/system-review/SKILL.md
grep -c "Code Review" .codex/skills/system-review/SKILL.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that the skill clearly distinguishes
system review from code review, has divergence classification with root cause categories,
and has memory suggestion quality criteria.

## Validation Commands

```bash
# L1
grep -c "name: system-review" .codex/skills/system-review/SKILL.md
grep -c "When to Use This Skill" .codex/skills/system-review/SKILL.md
grep -c "Key Rules" .codex/skills/system-review/SKILL.md
grep -c "Trigger phrases" .codex/skills/system-review/SKILL.md
grep -c "Alignment" .codex/skills/system-review/SKILL.md

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/system-review/SKILL.md` exists
- [ ] Frontmatter has `name: system-review` and trigger phrases
- [ ] Has `## When to Use This Skill` section
- [ ] Has explicit system review ≠ code review distinction with examples
- [ ] Has divergence classification framework (Good/Bad + root cause categories)
- [ ] Has alignment scoring with rationale for each weight
- [ ] Has memory suggestion quality criteria
- [ ] Has `## Key Rules` section

### Runtime
- [ ] Codex matches this skill when user says "system review" or "check plan adherence"

## Handoff Notes

Task 7 creates `.codex/skills/pr/SKILL.md`. PR skill focuses on: branch isolation guarantee
(why branch from remote main, not local HEAD), scope verification (cherry-pick only
feature commits), and PR body quality criteria.

## Completion Checklist

- [ ] `.codex/skills/system-review/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-6.md` → `task-6.done.md` rename completed
