# Task 6: Add Self-Review and Momus Review Phases

## Objective

Add Phase 6 (Self-Review) and Phase 7 (Present + Optional Momus Review) after Phase 5, completing the merged planning workflow.

## Scope

### Files Touched
- `.opencode/commands/planning.md` — MODIFY (~100 lines added at end)

### Dependencies
- Tasks 1-5 complete

---

## Prior Task Context

Tasks 1-5 have added:
- Step 0: Intent Classification
- Step 1: Draft Management
- Phase 1: Intent-specific interview with clearance check
- Phase 2: Research with Oracle for Architecture
- Phase 3: Design with Metis consultation
- Phase 4: Preview with Metis findings
- Phase 5: Plan output with QA scenarios and parallelization

Now need:
- Phase 6: Self-Review (gap classification)
- Phase 7: Present + Optional Momus Review
- Cleanup step

---

## Step-by-Step Tasks

### Step 6.1: Add Phase 6 (Self-Review)

**IMPLEMENT**: After Phase 5 "After Writing" section, add:

```markdown
---

## Phase 6: Self-Review

Before presenting to user, perform self-review with gap classification.

### Gap Classification

| Gap Type | Definition | Action |
|----------|------------|--------|
| **CRITICAL** | Blocks execution, user input required | Ask user immediately, do not proceed |
| **MINOR** | Small issue, sensible default exists | Fix silently, note in summary |
| **AMBIGUOUS** | Multiple valid interpretations | Apply default, disclose in summary |

### Self-Review Checklist

Run through this checklist after writing plan artifacts:

```
## Self-Review: {feature}

### Completeness
- [ ] All TODOs have acceptance criteria?
- [ ] All file references exist in codebase?
- [ ] No assumptions without evidence?
- [ ] Guardrails from Metis incorporated?
- [ ] Scope boundaries clearly defined?

### QA Coverage
- [ ] Every task has QA scenarios?
- [ ] QA scenarios include happy path?
- [ ] QA scenarios include error path?
- [ ] Evidence collection paths defined?

### Parallelization
- [ ] Wave assignments are valid?
- [ ] Dependencies correctly mapped?
- [ ] No circular dependencies?

### Gaps Found
- CRITICAL: {list or "None"}
- MINOR: {list or "None"} — {how resolved}
- AMBIGUOUS: {list or "None"} — {default applied}
```

### Gap Resolution

**CRITICAL gaps:**
1. Stop self-review
2. Ask user the blocking question
3. Update draft with answer
4. Re-run self-review

**MINOR gaps:**
1. Fix in place (edit plan.md or task briefs)
2. Note in summary: "Auto-resolved: {gap} → {fix}"

**AMBIGUOUS gaps:**
1. Apply sensible default
2. Note in summary: "Assumption: {assumption}. Override if needed."

---
```

### Step 6.2: Add Phase 7 (Present + Optional Momus Review)

**IMPLEMENT**: After Phase 6, add:

```markdown
---

## Phase 7: Present Summary + Optional Momus Review

After self-review passes (no CRITICAL gaps), present summary and offer high-accuracy review.

### Summary Presentation

```
## Plan Complete: {feature}

**Plan artifacts:**
- `.agents/features/{feature}/plan.md` (overview + task index)
- `.agents/features/{feature}/task-1.md` through `task-{N}.md`

**Key Decisions:**
- {decision 1}: {rationale}
- {decision 2}: {rationale}

**Scope:**
- IN: {what's included}
- OUT: {what's explicitly excluded}

**Guardrails Applied:**
- {guardrail from Metis}
- {guardrail from Metis}

**Auto-Resolved (minor gaps):**
- {gap}: {how resolved}

**Assumptions (validate if needed):**
- {assumption 1}
- {assumption 2}

**Test Strategy:** {TDD / Tests-after / None}
**Confidence:** {X}/10
**Estimated effort:** {N} tasks across {M} waves

---

**Ready to proceed?**
1. **Execute** → `/execute .agents/features/{feature}/plan.md`
2. **High Accuracy Review** → Have Momus rigorously verify every detail first
```

### Momus Review (If Requested)

If user chooses "High Accuracy Review":

```typescript
task(
  subagent_type="momus",
  run_in_background=false,
  load_skills=[],
  description="Plan review for {feature}",
  prompt=`
    Rigorously review this plan for clarity, verifiability, and completeness.
    
    **Plan location:** .agents/features/{feature}/plan.md
    **Task briefs:** .agents/features/{feature}/task-{1..N}.md
    
    **Review Criteria:**
    
    1. **Acceptance Criteria Quality**
       - Every TODO has clear, testable acceptance criteria?
       - Criteria are objective (not "verify it works")?
       - Success/failure is unambiguous?
    
    2. **QA Scenario Quality**
       - Every task has QA scenarios?
       - Scenarios use specific tools (Bash/Playwright/Read)?
       - Expected results are concrete?
       - Evidence paths are defined?
    
    3. **Dependency Integrity**
       - All dependencies explicitly listed?
       - No implicit assumptions between tasks?
       - Wave assignments are valid?
       - No circular dependencies?
    
    4. **Scope Boundedness**
       - Scope is clearly defined?
       - Exclusions are explicit?
       - No open-ended tasks?
       - Guardrails prevent scope creep?
    
    5. **Execution Readiness**
       - Each task is self-contained?
       - Context references are complete?
       - Patterns to follow are specific?
       - Validation commands are provided?
    
    **Verdict:** APPROVE or REJECT
    
    If REJECT, list specific issues to fix:
    - Task {N}: {issue} → {required fix}
  `
)
```

### Momus Iteration

If Momus rejects:
1. Fix the specific issues listed
2. Re-run Momus review
3. Repeat until APPROVE

If Momus approves:
```
Momus review: **APPROVED**

Plan is verified for clarity, verifiability, and completeness.

Ready to execute: `/execute .agents/features/{feature}/plan.md`
```

---
```

### Step 6.3: Add Cleanup Section

**IMPLEMENT**: After Phase 7, add cleanup:

```markdown
---

## Cleanup

After user confirms ready to execute:

1. **Delete draft file:**
   ```
   rm .agents/features/{feature}/planning-draft.md
   ```

2. **Keep plan artifacts:**
   - `plan.md` — overview and task index
   - `task-{N}.md` — individual task briefs
   - (or `plan-master.md` + `plan-phase-{N}.md` for complex features)

3. **Write pipeline handoff** (already defined in Phase 5)

4. **Present next step:**
   ```
   Planning complete. Ready to execute.
   
   Next: /execute .agents/features/{feature}/plan.md
   ```

---
```

### Step 6.4: Update Pipeline Handoff

**IMPLEMENT**: Update the pipeline handoff section to reflect new phases:

In the existing Pipeline Handoff Write section, ensure it notes that Phases 6-7 completed:

```markdown
### Pipeline Handoff Write (required)

After Phases 6-7 complete (self-review passed, user confirmed), overwrite `.agents/context/next-command.md`:
```

---

## Validation Commands

```bash
# Verify Phase 6 added
grep -n "## Phase 6: Self-Review" .opencode/commands/planning.md

# Verify Phase 7 added  
grep -n "## Phase 7:" .opencode/commands/planning.md

# Verify Momus invocation
grep -n "subagent_type=\"momus\"" .opencode/commands/planning.md

# Verify Cleanup section
grep -n "## Cleanup" .opencode/commands/planning.md

# Verify total phases
grep -n "## Phase" .opencode/commands/planning.md
grep -n "## Step" .opencode/commands/planning.md
```

---

## Acceptance Criteria

- [ ] Phase 6 (Self-Review) added
- [ ] Gap classification table included (CRITICAL/MINOR/AMBIGUOUS)
- [ ] Self-review checklist included
- [ ] Gap resolution actions documented
- [ ] Phase 7 (Present + Momus) added
- [ ] Summary presentation format defined
- [ ] Momus invocation template included
- [ ] Momus iteration loop documented
- [ ] Cleanup section added
- [ ] Draft deletion documented
- [ ] Pipeline handoff updated

---

## Completion Checklist

- [ ] Phase 6 Self-Review complete
- [ ] Phase 7 Present + Momus complete
- [ ] Cleanup section complete
- [ ] All agent invocations use correct syntax
- [ ] Pipeline handoff references new phases
