---
name: execute
description: Execute a task brief from .agents/features/ to implement a planned feature.
             Use when the user asks to execute a task brief, implement a plan, run a task,
             work on the next task, or implement a feature. Trigger phrases include:
             "execute task", "implement the plan", "run the task brief",
             "execute .agents/features/", "work on task N", "implement task brief at...",
             "run the next task", "implement the next task".
---

# Execute: Implement from Task Brief

## When to Use This Skill

Use this skill whenever the user asks you to implement something from a plan file in
`.agents/features/`. This is the **execution slot** in the Claude Plans → Codex Executes
pipeline. Claude creates the plan; you execute it.

## Entry Gate (Non-Skippable)

Before any implementation work:

1. Verify a plan file path was provided — it must point to a file under `.agents/features/`
2. Verify the file exists on disk
3. If either check fails, stop and report:
   `Blocked: /execute requires a plan file in .agents/features/{feature}/. Run /planning first in Claude.`

Never execute code changes from chat intent alone — a plan artifact is required.

## Step 0: Detect Plan Type

Read the plan file path provided.

**If path ends with `plan.md`** — Task Brief Mode (default):
1. Scan `.agents/features/{feature}/` for `task-{N}.md` files
2. Check which have matching `task-{N}.done.md` files (those are complete)
3. Find the lowest N without a `.done.md` (= next task to execute)
4. If ALL tasks are done → report complete + write handoff (Status: awaiting-review,
   Next Command: /code-loop {feature}) → rename plan.md → plan.done.md → STOP
5. If next task exists → report "Task {N}/{total} — executing task-{N}.md" → proceed

**If path ends with `plan-master.md`** — Master Plan Mode:
1. Extract sub-plan paths from the SUB-PLAN INDEX table
2. Scan for `plan-phase-{N}.done.md` files to find next undone phase
3. Execute ONE phase per session (same stop/proceed logic as task brief mode)

**If path is a single task file (task-N.md directly)** — Single Brief Mode:
Execute that brief directly, skip the scan logic.

## Step 1: Read and Understand

Read the ENTIRE task brief — all steps, validation commands, acceptance criteria.
The task brief is self-contained. You do NOT need to re-read plan.md during execution.

Derive the feature name from the path:
- `.agents/features/user-auth/task-1.md` → feature = `user-auth`

If Archon MCP is connected:
- `rag_search_knowledge_base(query="...", match_count=5)` — 2-5 keywords only
- `rag_search_code_examples(query="...", match_count=3)`

## Step 2: Execute Tasks in Order

For each task in the brief's STEP-BY-STEP TASKS section:

a. Read the task and any existing files being modified
b. Implement exactly as specified — follow IMPLEMENT, PATTERN, IMPORTS, GOTCHA fields
c. After each change: verify syntax, imports, types
d. Track divergences — if implementation differs from plan, classify as:
   - Good Divergence ✅ — plan limitation discovered (assumed wrong, better pattern found,
     technical constraint not known at planning time)
   - Bad Divergence ❌ — execution issue (ignored constraints, took shortcuts,
     misunderstood requirements)
e. If Archon connected: `manage_task("update", task_id="...", status="done")`

## Step 3: Run Validation Commands

Execute ALL validation commands from the brief's VALIDATION COMMANDS section in order.
Fix failures before continuing. Do not skip validation levels.

Validation pyramid (run all that apply to this project):
- L1: Syntax / Lint
- L2: Type check
- L3: Unit tests
- L4: Integration tests
- L5: Manual verification steps from brief

If `.claude/config.md` exists, use the validation commands defined there.

## Step 4: Self-Review

Before writing the report, cross-check every item in the brief's ACCEPTANCE CRITERIA:

```
SELF-REVIEW SUMMARY
====================
Tasks:      {completed}/{total} ({skipped} skipped, {diverged} diverged)
Files:      {added} added, {modified} modified ({unplanned} unplanned)
Acceptance: {met}/{total} criteria met ({deferred} deferred to runtime)
Validation: L1 {pass/fail} | L2 {pass/fail} | L3 {pass/fail} | L4 {N/A} | L5 {pass/fail}
Gaps:       {list gaps, or "None"}
Verdict:    COMPLETE | INCOMPLETE
```

If verdict is INCOMPLETE: fix gaps before proceeding. Do NOT write the report until complete.

## Step 5: Write Execution Report

**Path**: `.agents/features/{feature}/report.md`

- **If task 1 of multiple**: create report.md with full header + `## Task 1: {title}` section
- **If task 2+**: read existing report.md, append `## Task {N}: {title}` section
- **If final task**: update top-level summary with cumulative totals

Required sections in report:
- Meta Information (plan file, files added/modified, lines changed)
- Completed Tasks (count/total, status per task)
- Divergences from Plan (Good ✅ / Bad ❌ + root cause for each)
- Skipped Items (what was not implemented + why)
- Validation Results (command output per level)
- Tests Added (files, pass/fail)
- Issues & Notes
- Ready for Commit (yes/no + blockers if no)

## Step 6: Mark Task Done + Write Handoff

**Completion sweep** — rename in `.agents/features/{feature}/`:
- `task-{N}.md` → `task-{N}.done.md`
- Only rename `plan.md` → `plan.done.md` when ALL task briefs are done

**If more tasks remain** — write `.agents/context/next-command.md`:
```
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /execute (task {N} of {total})
- **Feature**: {feature}
- **Next Command**: /execute .agents/features/{feature}/plan.md
- **Task Progress**: {N}/{total} complete
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: executing-tasks
```
Report: "Task {N}/{total} complete. Next: prime → execute plan.md for task {N+1}."
**STOP — do not execute the next task brief. One brief per session.**

**If all tasks done** — write handoff:
```
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /execute (task {total} of {total})
- **Feature**: {feature}
- **Next Command**: /code-loop {feature}
- **Task Progress**: {total}/{total} complete
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: awaiting-review
```
Rename `plan.md` → `plan.done.md`.
Report: "All {total} tasks complete. Feature ready for review. Next: /code-loop {feature} in Claude."

## Key Rules

- ONE task brief per session — never loop through all briefs automatically
- Never implement without a plan file under `.agents/features/`
- Never mark a task done without running validation
- Never include `Co-Authored-By` in git commits
- Track every divergence from the plan — good or bad
- The task brief is self-contained — trust it, don't re-read plan.md during execution
