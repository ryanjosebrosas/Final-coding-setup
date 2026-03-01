---
description: Execute an implementation plan
---

# Execute: Implement from Plan

## Hard Entry Gate (Non-Skippable)

`/execute` is plan-bound only.

Before any implementation or validation work:

1. Verify `$ARGUMENTS` is provided and points to an existing markdown file under `.agents/features/`.
2. Verify the input is a planning artifact (feature plan / sub-plan / plan overview), not an ad-hoc prompt.
3. If either check fails, stop immediately and report:
   - `Blocked: /execute requires a /planning-generated plan file in .agents/features/{feature}/. Run /planning first.`

Never execute code changes directly from chat intent without a plan artifact.

## Plan to Execute

Read plan file: `$ARGUMENTS`

## Execution Instructions

Lean mode (default):
- Do not create extra documentation files during execution unless explicitly required by the plan.
- Required artifact from execution is the report at `.agents/features/{feature}/report.md`.
- Keep execution focused on code changes, not documentation.

Slice gate (required):
- Execute only the current approved slice plan.
- Do not begin implementation for a new slice while unresolved Critical/Major code-review findings remain for the current slice.

Incremental execution guardrails (required):
- Deliver one concrete outcome per run.
- Keep changes narrowly scoped and avoid mixing unrelated domains in one pass.
- If execution expands beyond a small slice, stop and split remaining work into a follow-up plan.

### 0.5. Detect Plan Type

Read the plan file.

**If file path contains `plan-master.md`**: Extract phase sub-plan paths from the SUB-PLAN INDEX table at the bottom of the master plan. Report: "Detected master plan with N phases." Proceed to Series Mode (Step 2.5).

**If file path is a single phase file (`-phase-{N}.md`)**: Execute as a single sub-plan (normal mode, but note it's part of a larger feature).

**If file contains `<!-- PLAN-SERIES -->`**: Extract sub-plan paths from PLAN INDEX. Report: "Detected plan series with N sub-plans." Proceed to Series Mode (Step 2.5).

**If no marker**: Standard single plan — proceed normally, skip series-specific steps.

### 1. Read and Understand

- Read the ENTIRE plan carefully — all tasks, dependencies, validation commands, testing strategy
- Check `memory.md` for gotchas related to this feature area
- **Derive feature name** from the plan path: extract the feature directory name from `.agents/features/{feature}/`.
    Example: `.agents/features/user-auth/plan.md` → `user-auth`. For plan series: `.agents/features/big-feature/plan-master.md` → `big-feature`.
    Store this — you'll use it for all artifact paths within `.agents/features/{feature}/`.

### 1.5. RAG Knowledge Retrieval (Optional)

If Archon MCP is available:
- `rag_search_knowledge_base(query="...", match_count=5)` — relevant documentation
- `rag_search_code_examples(query="...", match_count=3)` — similar patterns
- Keep queries SHORT (2-5 keywords) for best vector search results
- Use findings to supplement the plan's implementation guidance

If no Archon/RAG available, proceed with the plan as written — plans are designed to be self-contained.

### 1.6. Archon Task Status (if connected)

If Archon MCP is connected and plan has Archon task IDs in metadata:
- Call `manage_task("update", task_id="...", status="doing")` for the first task
- Update status as you progress through tasks

### 2. Execute Tasks in Order

For EACH task in "Step by Step Tasks":

**a.** Read the task and any existing files being modified.

**b.** Implement the task following specifications exactly. Maintain consistency with existing patterns.

**c.** Verify: check syntax, imports, types after each change.

**d.** Track divergences (if implementation differs from plan):
   - Note what changed and why
   - Classify as Good or Bad divergence (see Divergence Classification below)
   - Document in execution report

**e.** If Archon connected: `manage_task("update", task_id="...", status="done")` for completed task.

**f.** Move to the next task.

---

### Divergence Classification (During Execution)

When implementation deviates from the plan, classify immediately:

**Good Divergence (Justified) ✅** — Plan limitations discovered:
- Plan assumed something that didn't exist in the codebase
- Better pattern discovered during implementation
- Performance or security issue required different approach
- Technical constraint not known at planning time

**Bad Divergence (Problematic) ❌** — Execution issues:
- Ignored explicit constraints in plan
- Created new architecture instead of following existing patterns
- Took shortcuts introducing technical debt
- Misunderstood requirements or plan instructions

**Root Cause Categories:**
- `unclear plan` — Plan didn't specify X clearly
- `missing context` — Didn't know about Y during planning
- `missing validation` — No test/check for Z
- `manual step repeated` — Did manually what should be automated

**Track each divergence for the execution report** — don't rely on memory.

### 2.5. Series Mode Execution (if plan series detected)

For each sub-plan in PLAN INDEX order (or SUB-PLAN INDEX for master plans):

1. Read sub-plan file
2. Read shared context from master plan's SHARED CONTEXT REFERENCES section
3. Execute tasks using Step 2 process (a → e)
4. Run sub-plan's validation commands
5. Read HANDOFF NOTES and include them as context for the next sub-plan
6. Report: "Phase {N}/{total} complete."

**If a sub-plan fails**: Stop, report which sub-plan/task failed. Don't continue — failed state propagates.

### 3. Implement Testing Strategy

Create all test files specified in the plan. Implement test cases. Ensure edge case coverage.

### 4. Run Validation Commands

Execute ALL validation commands from the plan in order. Fix failures before continuing.

Validation policy (non-skippable):
- Every execution loop must run full validation depth for the current slice.
- Minimum expected pyramid: syntax/style → type safety → unit tests → integration tests → manual verification.
- Do not treat single checks as sufficient proof of completion.
- Use project-configured commands from `.opencode/config.md` or auto-detected by `/prime`.

### 5. Final Verification

- All tasks completed
- All tests passing
- All validations pass
- Code follows project conventions
- Slice remained focused (single outcome, no mixed-scope spillover)

### 6. Update Plan Checkboxes

Mandatory after successful execution:
- Update the executed plan file in place.
- In `ACCEPTANCE CRITERIA` and `COMPLETION CHECKLIST`, convert completed items from `- [ ]` to `- [x]`.
- Leave unmet items unchecked and append a short blocker note on that line.
- Never mark an item `- [x]` unless validation evidence exists in this run.

### 6.5 Update .agents Index (if present)

If `.agents/INDEX.md` exists, update plan status entry:
- Mark executed plan as done with strike + done tag:
  - `[done] ~~{feature}/plan.md~~`
- Add reference to execution report path: `.agents/features/{feature}/report.md`
- Do not create `.agents/INDEX.md` if it does not exist.

### 6.6. Execution Report

After successful execution, save the execution report using the template:
- **Template**: `.opencode/templates/EXECUTION-REPORT-TEMPLATE.md`
- **Path**: `.agents/features/{feature}/report.md`

**Required sections:**
- Meta Information (plan file, files added/modified, lines changed)
- Completed Tasks (count/total with status)
- Divergences from Plan (with Good/Bad classification + root cause for each)
- Skipped Items (what from plan was not implemented + why)
- Validation Results (L1-L5 pass/fail with output)
- Tests Added (files created, pass/fail status)
- Issues & Notes (challenges, recommendations)
- Ready for Commit (yes/no + blockers)

Completion sweep (required):
- Before finishing `/execute`, rename completed artifacts within `.agents/features/{feature}/`:
  - `plan.md` → `plan.done.md` (plan fully executed)
  - `plan-phase-{N}.md` → `plan-phase-{N}.done.md` (for each completed phase)
  - `plan-master.md` → `plan-master.done.md` (only when ALL phases are done)
  - `review.md` → `review.done.md` (if a review exists and all findings were addressed)
  - `review-{N}.md` → `review-{N}.done.md` (code-loop reviews)
  - `loop-report-{N}.md` → `loop-report-{N}.done.md` (code-loop reports)
- Never leave a completed artifact without the `.done.md` suffix.

## Output Report

Save this report to: `.agents/features/{feature}/report.md`

Use the feature name derived in Step 1. Create the `.agents/features/{feature}/` directory if it doesn't exist.

**IMPORTANT**: Save the report to the file FIRST, then also display it inline for the user. The saved file is consumed by `/system-review`.

---

### Meta Information

- **Plan file**: {path to the plan that guided this implementation}
- **Plan checkboxes updated**: {yes/no}
- **Files added**: {list with full paths, or "None"}
- **Files modified**: {list with full paths}
- **RAG used**: {yes — describe what was looked up / no — plan was self-contained}
- **Archon tasks updated**: {yes — N tasks marked done / no — not connected}
- **Dispatch used**: {yes — list tasks delegated and models used / no — all tasks self-executed}

### Completed Tasks

For each task in the plan:
- Task N: {brief description} — {completed / skipped with reason}

### Divergences from Plan

For each divergence (if any):
- **What**: {what changed from the plan}
- **Planned**: {what the plan specified}
- **Actual**: {what was implemented instead}
- **Reason**: {why the divergence occurred}
- **Classification**: Good ✅ / Bad ❌
- **Root Cause**: {unclear plan | missing context | missing validation | manual step repeated | other}

If no divergences: "None — implementation matched plan exactly."

### Skipped Items

List anything from the plan that was NOT implemented:
- **{Item}**: {what was skipped}
  - **Reason**: {why it was skipped}

If none: "None — all planned items implemented."

### Validation Results

```bash
# Output from each validation command run in Step 4
```

### Tests Added

- {test files created, number of test cases, pass/fail status}
- If no tests: "No tests specified in plan."

### Issues & Notes

- {any issues not addressed in the plan}
- {challenges encountered during implementation}
- {recommendations for plan or process improvements}
- If none: "No issues encountered."

### Ready for Commit

- All changes complete: {yes/no}
- All validations pass: {yes/no}
- Ready for `/commit`: {yes/no — if no, explain what's blocking}
