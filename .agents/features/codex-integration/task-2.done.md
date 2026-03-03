# Task 2: Create .codex/skills/execute/SKILL.md

<!--
USAGE: codex "execute task-2 for codex-integration feature"
ONE session = ONE task brief.
-->

---

## OBJECTIVE

Create `.codex/skills/execute/SKILL.md` — a Codex CLI skill that teaches Codex how to read
a task brief from `.agents/features/{feature}/task-N.md`, implement it, run validation,
write a report, mark the brief done, and update the pipeline handoff file.

---

## SCOPE

**Files touched:**
- `.codex/skills/execute/SKILL.md` — CREATE (new directory + new file)

**Out of scope:**
- Do NOT modify `.claude/commands/execute.md`
- Do NOT create a `config.toml` — not needed at project level
- Do NOT create other skills (Tasks 3 and 4)

**Depends on:** Task 1 (AGENTS.md updated — Codex now knows the system)

---

## PRIOR TASK CONTEXT

Task 1 updated `AGENTS.md` to inline all 6 section files. Codex can now read the full system
instructions from a single file. The `.codex/` directory does not exist yet — create it here.

---

## CONTEXT REFERENCES

### Execute Command Reference (`.claude/commands/execute.md` — key sections)

The Codex execute skill must implement these behaviors from the Claude execute command:

**Entry gate:**
```
Verify $ARGUMENTS points to an existing markdown file under .agents/features/
If check fails: "Blocked: requires a /planning-generated plan file."
```

**Plan type detection:**
```
- plan.md + task-N.md files → Task Brief Mode (execute ONE brief per session)
- plan-master.md → Master Plan Mode (execute ONE phase per session)
- plan.md alone → Legacy mode
```

**Task brief execution (the common case):**
```
1. Scan .agents/features/{feature}/ for task-N.done.md files
2. Find lowest N without a .done.md (= next undone brief)
3. If ALL done → report complete, write handoff awaiting-review
4. If next brief exists → execute ONLY that one brief
5. After execution:
   - Run validation commands from brief
   - Write report.md (or append to existing)
   - Rename task-N.md → task-N.done.md
   - Write pipeline handoff to .agents/context/next-command.md
```

**Divergence classification:**
```
Good Divergence ✅ — plan limitation discovered (assumed wrong, better pattern found)
Bad Divergence ❌ — execution issue (ignored constraints, took shortcuts)
```

**Self-review format:**
```
SELF-REVIEW SUMMARY
====================
Tasks:      {completed}/{total} ({skipped} skipped, {diverged} diverged)
Files:      {added} added, {modified} modified ({unplanned} unplanned)
Acceptance: {met}/{total} implementation criteria met ({deferred} deferred to runtime)
Validation: L1 {pass/fail} | L2 {pass/fail} | L3 {pass/fail} | L4 {pass/fail} | L5 {pass/fail}
Gaps:       {list any gaps, or "None"}
Verdict:    {COMPLETE | INCOMPLETE — see gaps above}
```

**Execution report sections (report.md):**
```
- Meta Information (plan file, files added/modified, lines changed)
- Completed Tasks (count/total with status)
- Divergences from Plan (Good/Bad + root cause)
- Skipped Items
- Validation Results (L1-L5 pass/fail)
- Tests Added
- Issues & Notes
- Ready for Commit (yes/no)
```

**Pipeline handoff format:**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /execute (task {N} of {total})
- **Feature**: {feature}
- **Next Command**: /execute .agents/features/{feature}/plan.md
- **Task Progress**: {N}/{total} complete
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: executing-tasks
```

**When all tasks done:**
```markdown
- **Last Command**: /execute (task {total} of {total})
- **Next Command**: /code-loop {feature}
- **Status**: awaiting-review
```

### Codex Skill Format Reference (from openai/codex repo)

```markdown
---
name: babysit-pr
description: Babysit a GitHub pull request after creation by continuously polling CI...
             Use when the user asks Codex to monitor a PR, watch CI, handle review comments.
---

# PR Babysitter

## Objective
...steps...
```

Rules:
- YAML frontmatter block at top: `name` + `description`
- `description` lists multiple trigger phrases — Codex uses this to auto-match intent
- Body is markdown with clear sections (Objective, Inputs, Steps, etc.)
- Can reference scripts: `python3 .codex/skills/{name}/scripts/...`

---

## PATTERNS TO FOLLOW

### Pattern: Skill frontmatter

```yaml
---
name: execute
description: Execute a task brief from .agents/features/. Use when the user asks to
             execute a task brief, implement a plan, run a task, or work on a feature.
             Trigger phrases: "execute task", "implement task brief", "run the plan",
             "execute .agents/features/", "work on the next task".
---
```

### Pattern: Skill structure

```markdown
# Execute: Implement from Task Brief

## When to Use This Skill
[description of when Codex auto-invokes]

## Entry Gate
[validation before starting]

## Execution Steps
[numbered, clear steps]

## Output
[what gets produced]
```

---

## STEP-BY-STEP TASKS

### Step 1: Create the directory

```bash
mkdir -p .codex/skills/execute
```

### Step 2: Write the SKILL.md file

Create `.codex/skills/execute/SKILL.md` with the following exact content:

```markdown
---
name: execute
description: Execute a task brief from .agents/features/ to implement a planned feature.
             Use when the user asks to execute a task brief, implement a plan, run a task,
             work on the next task, or implement a feature. Trigger phrases include:
             "execute task", "implement the plan", "run the task brief",
             "execute .agents/features/", "work on task N", "implement task brief at...".
---

# Execute: Implement from Task Brief

## When to Use This Skill

Use this skill whenever the user asks you to implement something from a plan file in
`.agents/features/`. This is the **execution slot** in the Claude Plans → Codex Executes
pipeline. Claude creates the plan; you execute it.

## Entry Gate (Non-Skippable)

Before any implementation work:

1. Verify a plan file path was provided — it must point to a file under `.agents/features/`
2. Verify the file exists
3. If either check fails, stop and report:
   `Blocked: /execute requires a plan file in .agents/features/{feature}/. Run /planning first.`

Never execute code changes from chat intent alone — a plan artifact is required.

## Step 0: Detect Plan Type

Read the plan file path provided.

**If path ends with `plan.md`** — Task Brief Mode (default):
1. Scan `.agents/features/{feature}/` for `task-{N}.md` files
2. Check which have matching `task-{N}.done.md` files (those are done)
3. Find the lowest N without a `.done.md` (= next task to execute)
4. If ALL tasks are done → report complete + write handoff (Status: awaiting-review,
   Next Command: /code-loop {feature}) → rename plan.md → plan.done.md → STOP
5. If next task exists → report "Task {N}/{total} — executing task-{N}.md" → proceed

**If path ends with `plan-master.md`** — Master Plan Mode:
1. Extract sub-plan paths from the SUB-PLAN INDEX table
2. Scan for `plan-phase-{N}.done.md` files to find next undone phase
3. Execute ONE phase per session (same logic as task brief mode above)

**If path is a single task file (task-N.md directly)** — Single Brief Mode:
Execute that brief directly (skip scan logic).

## Step 1: Read and Understand

Read the ENTIRE task brief — all steps, validation commands, acceptance criteria.
The task brief is self-contained. You do NOT need to re-read plan.md during execution.

Derive the feature name from the path:
`.agents/features/user-auth/task-1.md` → feature = `user-auth`

If Archon MCP is connected:
- `rag_search_knowledge_base(query="...", match_count=5)` — 2-5 keywords only
- `rag_search_code_examples(query="...", match_count=3)`

## Step 2: Execute Tasks in Order

For each task in the brief's STEP-BY-STEP TASKS section:

a. Read the task and any existing files being modified
b. Implement exactly as specified — follow IMPLEMENT, PATTERN, IMPORTS fields
c. After each change: verify syntax, imports, types
d. Track divergences: if implementation differs from plan, classify as:
   - Good Divergence ✅ — plan limitation discovered (assumed wrong, better pattern found)
   - Bad Divergence ❌ — execution issue (ignored constraints, shortcuts)
e. If Archon connected: `manage_task("update", task_id="...", status="done")`

## Step 3: Run Validation Commands

Execute ALL validation commands from the brief's VALIDATION COMMANDS section in order.
Fix failures before continuing. Do not skip validation levels.

Validation pyramid (run all that apply):
- L1: Syntax / Lint
- L2: Type check
- L3: Unit tests
- L4: Integration tests
- L5: Manual verification steps from brief

## Step 4: Self-Review

Before writing the report, cross-check the brief's ACCEPTANCE CRITERIA:

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

If verdict is INCOMPLETE: fix gaps before proceeding. Do NOT write the report yet.

## Step 5: Write Execution Report

**Path**: `.agents/features/{feature}/report.md`

**If this is task 1 of multiple**: create report.md with full header + Task 1 section.
**If task 2+**: read existing report.md, append `## Task {N}: {title}` section.
**If final task**: update top-level summary with cumulative totals.

Required sections:
- Meta Information (plan file, files added/modified, lines changed)
- Completed Tasks (count/total with status per task)
- Divergences from Plan (Good/Bad classification + root cause)
- Skipped Items (what was not implemented + why)
- Validation Results (command output for each level)
- Tests Added (files, pass/fail)
- Issues & Notes
- Ready for Commit (yes/no + blockers if no)

## Step 6: Mark Task Done + Write Handoff

**Completion sweep** (rename in `.agents/features/{feature}/`):
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
- **Last Command**: /execute (task {total} of {total})
- **Feature**: {feature}
- **Next Command**: /code-loop {feature}
- **Task Progress**: {total}/{total} complete
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: awaiting-review
```
Rename `plan.md` → `plan.done.md`.
Report: "All {total} tasks complete. Feature ready for review. Next: /code-loop {feature}."

## Key Rules

- ONE task brief per session — never loop through all briefs in one session
- Never implement without a plan file in `.agents/features/`
- Never mark a task done without running validation
- Never include `Co-Authored-By` in git commits
- Track every divergence from plan — good or bad
```

### Step 3: Verify the file

```bash
test -f .codex/skills/execute/SKILL.md && echo "OK" || echo "MISSING"
grep -c "^---" .codex/skills/execute/SKILL.md  # should be 2 (open + close frontmatter)
grep "name: execute" .codex/skills/execute/SKILL.md  # should match
```

---

## TESTING STRATEGY

**Manual verification:**
1. Open Codex CLI in this project directory
2. Say: "execute the task brief at .agents/features/codex-integration/task-3.md"
3. Verify: Codex loads the execute skill (it mentions the entry gate + plan detection)
4. Verify: Codex reads the brief before implementing

**Edge cases:**
- If no plan file provided: Codex should report the blocked message
- If all tasks done: Codex should not execute anything, just write handoff

---

## VALIDATION COMMANDS

- **L1**: `test -f .codex/skills/execute/SKILL.md && echo OK`
- **L2**: `grep "name: execute" .codex/skills/execute/SKILL.md`
- **L3**: `grep "Entry Gate" .codex/skills/execute/SKILL.md`
- **L4**: `grep "Pipeline Handoff" .codex/skills/execute/SKILL.md`
- **L5 Manual**: Read the skill file — confirm it covers entry gate, plan type detection,
  execution steps, validation, self-review, report writing, and handoff update

---

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `.codex/skills/execute/SKILL.md` exists
- [ ] Frontmatter has `name: execute` and multi-phrase `description`
- [ ] Entry gate section present (blocks execution without plan file)
- [ ] Plan type detection documented (task brief / master plan / single brief)
- [ ] Self-review summary format included
- [ ] Pipeline handoff write instructions present (both mid-series and final)
- [ ] "ONE task brief per session" rule explicitly stated

### Runtime
- [ ] Codex auto-invokes this skill when asked to "execute a task brief"
- [ ] Codex understands the `.done.md` lifecycle
- [ ] Codex knows to STOP after one brief (not loop)

---

## HANDOFF NOTES

**For Task 3**: The `.codex/skills/` directory now exists. Task 3 creates
`.codex/skills/prime/SKILL.md` in the same directory. No dependencies on execute skill content.

---

## COMPLETION CHECKLIST

- [ ] `.codex/skills/execute/` directory created
- [ ] `SKILL.md` written with full content
- [ ] Frontmatter verified (`name: execute`)
- [ ] Entry gate section present
- [ ] Validation commands pass
- [ ] Rename: `task-2.md` → `task-2.done.md`
- [ ] Update `.agents/context/next-command.md` with task 2/4 complete handoff
