# Task Brief 1 - fix-rules-file

## Objective
Update `.opencode/rules` so all path references align with the active `.agents/features/{feature}/...` and `.agents/context/...` pipeline structure, with no unrelated policy edits.

## Scope
- **In scope**: edit `.opencode/rules` path bullets and state-management lines that currently reference stale locations.
- **Out of scope**: edits to command files, AGENTS guidance, hook source code, or any runtime behavior.
- **Dependencies**: this brief depends only on existing repo docs as source-of-truth references.

## Prior Task Context
- None (single-task feature).

## Context References
### Reference A: current `.opencode/rules` (full)
```markdown

## Global Rules for AI Agents

### Golden Rule: Validate Before Every Commit

Run the project's configured validation pyramid before every commit:
1. Lint check (L1)
2. Type check (L2)
3. Test suite (L3)

Exit 0 = safe to commit. Any failure = fix and re-run.

### Commit Hygiene

- Use conventional commit format: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore, perf, style, plan
- Keep commits atomic — one logical change per commit
- Never commit secrets, API keys, or credentials
- Never use `git add -A` — scope to relevant files

### Plan-Before-Execute

- Never implement code changes without a plan artifact in `.agents/plans/`
- Plans must be 700-1000 lines (hard requirement)
- Plans must include copy-pasteable code samples, not pseudocode
- Plans must include validation commands for every task

### Review-Before-Commit

- Every code change must pass through `/code-review` or the `/build` review pipeline
- Critical findings block commit — no exceptions
- Security-critical code always gets highest-tier review available

### State Management

- `.agents/specs/build-state.json` is the cross-session state bridge — always read it at session start
- `memory.md` captures lessons and gotchas — update it after significant work
- `.agents/specs/BUILD_ORDER.md` checkboxes are the source of truth for spec completion
- `.agents/specs/PILLARS.md` gates enforce sequential pillar completion

### File Organization

- Plans go in `.agents/plans/`
- Reviews go in `.agents/reviews/`
- Reports go in `.agents/reports/`
- Build specs go in `.agents/specs/`
- Completed artifacts get `.done.md` suffix
- `memory.md` stays at project root

### Bug Scanning (if UBS available)

If UBS (Ultimate Bug Scanner) is installed:
```bash
ubs <changed-files>    # Before every commit
ubs --ci .             # Before PR
```

Parse output: `file:line:col` → location | Fix suggestion → how to fix | Exit 0/1 → pass/fail

### Anti-Patterns

- Do not skip steps in the build pipeline — every step exists for a reason
- Do not fix symptoms — fix root causes
- Do not ignore validation failures — classify and resolve
- Do not scope-creep during execution — stay within the plan's slice
- Do not guess file paths or import statements — verify by reading the codebase
```

### Reference B: canonical project structure excerpt (`AGENTS.md`)
```markdown
## Project Structure

### Dynamic Content (`.agents/`)
All generated/dynamic content lives at project root:
- `.agents/features/{name}/` — All artifacts for one feature (plan, report, review, loop reports)
  - `plan.md` / `plan.done.md` — Feature plan overview + task index (marked done when all task briefs done)
  - `task-{N}.md` / `task-{N}.done.md` — Task briefs (one per `/execute` session, default mode)
  - `plan-master.md` — Master plan for very large multi-phase features (escape hatch)
  - `plan-phase-{N}.md` — Sub-plans for each phase (executed one per session, not sequentially)
  - `report.md` / `report.done.md` — Execution report (marked done after commit)
  - `review.md` / `review.done.md` — Code review (marked done when addressed)
  - `review-{N}.md` — Numbered reviews from `/code-loop` iterations
  - `loop-report-{N}.md` — Loop iteration reports
  - `checkpoint-{N}.md` — Loop checkpoints
  - `fixes-{N}.md` — Fix plans from `/code-loop`
- `.agents/context/` — Session context
  - `next-command.md` — Pipeline handoff file (auto-updated by every pipeline command, read by `/prime`)

#### `.done.md` Lifecycle

| Artifact | Created by | Marked `.done.md` by | Trigger |
|----------|-----------|---------------------|---------|
| `plan.md` | `/planning` | `/execute` | All task briefs done (or legacy single plan executed) |
| `task-{N}.md` | `/planning` | `/execute` | Task brief fully executed in one session |
| `plan-master.md` | `/planning` | `/execute` | All phases completed |
| `plan-phase-{N}.md` | `/planning` | `/execute` | Phase fully executed |
| `report.md` | `/execute` | `/commit` | Changes committed to git |
| `review.md` | `/code-review` | `/commit` or `/code-loop` | All findings addressed |
| `review-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
| `loop-report-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
| `fixes-{N}.md` | `/code-loop` | `/code-loop` | Fixes fully applied |

#### Pipeline Handoff File

`.agents/context/next-command.md` is a **singleton** file overwritten by every pipeline command on completion. It tracks the current pipeline position so that `/prime` can surface "what to do next" when starting a new session.

| Field | Purpose |
|-------|---------|
| **Last Command** | Which command just completed |
| **Feature** | Active feature name |
| **Next Command** | Exact command to run next |
| **Master Plan** | Path to master plan (if multi-phase) |
| **Phase Progress** | N/M complete (if multi-phase) |
| **Task Progress** | N/M complete (if task brief mode) |
| **Timestamp** | When handoff was written |
| **Status** | Pipeline state (awaiting-execution, executing-tasks, executing-series, awaiting-review, awaiting-fixes, awaiting-re-review, ready-to-commit, ready-for-pr, pr-open, blocked) |

The handoff file is NOT a log — it only contains the latest state. History lives in git commits and `.done.md` artifacts.

#### Feature Name Propagation

The **Feature** field in the handoff file is the canonical source for feature names. All pipeline commands must:
1. **Read** the Feature field from `.agents/context/next-command.md` first
2. **Fall back** to derivation (commit scope, report path, directory name) only if the handoff is missing or stale
3. **Write** the same Feature value to the handoff when completing

This ensures consistent feature names across sessions. If a command derives a feature name from a fallback source, it must match the handoff value. If they conflict, the handoff value wins.

#### Session Model (One Command Per Context Window)

Each session is one model context window. The autonomous flow is:

```
Session:  /prime → [one command] → END
```

**Task brief feature (default):**
```
Session 1:  /prime → /planning {feature}                         → END (plan.md + task-N.md files written)
Session 2:  /prime → /execute .agents/features/{f}/plan.md       → END (task 1 only — auto-detected)
Session 3:  /prime → /execute .agents/features/{f}/plan.md       → END (task 2 — auto-detected)
Session N+1:/prime → /execute .agents/features/{f}/plan.md       → END (task N — auto-detected)
Session N+2:/prime → /code-loop {feature}                        → END
Session N+3:/prime → /commit → /pr                               → END (both in same session)
```

**Master plan feature (multi-phase, escape hatch for 10+ task features):**
```
Session 1:  /prime → /planning {feature}                         → END (master + sub-plans written)
Session 2:  /prime → /execute .../plan-master.md                 → END (phase 1 only)
Session 3:  /prime → /execute .../plan-master.md                 → END (phase 2 — auto-detected)
Session 4:  /prime → /execute .../plan-master.md                 → END (phase N — auto-detected)
Session 5:  /prime → /code-loop {feature}                        → END
Session 6:  /prime → /commit → /pr                               → END (both in same session)
```

**Key rules:**
- `/execute` with task briefs executes ONE brief per session, never loops through all briefs
- `/execute` with a master plan executes ONE phase per session, never loops through all phases
- The handoff file tells the next session exactly what to run — the user just runs `/prime`
- Task brief detection is automatic: `/execute plan.md` scans for `task-{N}.done.md` files and picks the next undone brief
- Phase detection is automatic: `/execute plan-master.md` scans for `.done.md` files and picks the next undone phase
- If a session crashes, the brief/phase wasn't marked `.done.md`, so the next session retries it
- `/commit → /pr` runs in the same session when they are the final pipeline step. `/commit` writes a `ready-for-pr` handoff, but `/pr` runs immediately after (not in a separate session). If `/pr` fails, its failure handoff persists for the next `/prime` session.

```

### Reference C: planning output path excerpt (`.opencode/commands/planning.md`)
```markdown
## Phase 5: Write Plan

### Auto-Detect Complexity

After Phases 1-4 (discovery/design), assess complexity and select the output mode:

- **Task Brief Mode** (DEFAULT — use for all standard features): Produces `plan.md` (overview + task index) + one `task-N.md` brief per task. Each brief is a self-contained execution document for one `codex /execute` session. Use this for the vast majority of features — there is no task count upper boundary for this mode.
- **Master + Sub-Plan Mode** (EXCEPTION — escape hatch for genuinely complex features): Use ONLY when the feature has multiple distinct phases with heavy cross-phase dependencies that make a single plan unwieldy. The trigger is architectural complexity, not task count. A feature with 12 straightforward tasks fits comfortably in task brief mode. A feature with 8 tasks across truly independent phases with separate validation gates may warrant master plan mode.

Announce the mode transparently:
- Task Brief: "This has ~6 tasks — I'll write `plan.md` + 6 task briefs. Each brief runs in one `/execute` session."
- Master Plan: "This has {N} tasks across {M} distinct phases with independent validation gates — the cross-phase dependencies make a single plan unwieldy. I'll use the master + sub-plan approach."

---

### Task Brief Mode (Default)

#### 5a. Write plan artifacts directly

**Step 1: Write `plan.md` (overview + task index)**

Every `plan.md` is 700-1000 lines. It is the source of truth and human-readable overview. It contains:

- Feature Description, User Story, Problem Statement, Solution Statement
- Feature Metadata with Slice Guardrails
- Pillar Context (if available): pillar N — name, scope, research findings, PRD requirements
- Context References (codebase files with line numbers, related memories, relevant docs)
- Patterns to Follow (with actual code snippets from the project)
- Implementation Plan (overview of phases/groupings)
- Step-by-Step Tasks (summary level — 3-4 lines per task with ACTION, TARGET, scope description)
- Testing Strategy (overview)
- Validation Commands (all levels of the validation pyramid)
- Acceptance Criteria (Implementation + Runtime, with checkboxes)
- Completion Checklist
- Notes (key decisions, risks, confidence score)
- **TASK INDEX** table at the bottom listing all task briefs with scope and status

**TASK INDEX table format:**
```markdown
## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | {one-line scope description} | pending | {N created, M modified} |
| 2 | `task-2.md` | {one-line scope description} | pending | {N created, M modified} |
...
```

**Hard requirement:** If `plan.md` is under 700 lines, it is REJECTED. Expand code samples, add more context references, add more pattern detail. Code samples must be copy-pasteable, not summaries.

**Step 2: Write task briefs (`task-N.md`) — one per target file**

Using the task brief structure below as the structural reference, write one task brief for each task:

- Save to `.agents/features/{feature}/task-{N}.md`
- Each brief is **self-contained** — `codex /execute` can run it without reading `plan.md` or any other file
- Each brief targets **700-1000 lines** — this is achieved by pasting all context inline, not by padding
- No advisory sections (no Feature Description, User Story, Problem Statement, Confidence Score — those live in `plan.md`)
- Every line must be operationally useful: steps, exact code, validation commands, acceptance criteria

**Task splitting heuristic**: One task brief = one target file. This is the default granularity. A brief that modifies `planning.md` is one task; a brief that modifies `TASK-BRIEF-TEMPLATE.md` is a separate task. Multi-file briefs are the exception — only when edits are tightly coupled (e.g., renaming in file A requires updating the import in file B). If a brief covers 3+ files, split it unless you can justify why the files can't be changed independently.

**How briefs reach 700 lines — inline content, not padding:**
- **Context References**: Paste the full current content of every section being modified in code blocks (50-150 lines)
- **Patterns to Follow**: Paste complete reference patterns from other files with analysis (30-80 lines)
- **Current/Replace blocks**: Paste the EXACT current content and COMPLETE replacement content — every line, preserving indentation (50-200 lines per step)
- **All sections filled**: Every section from OBJECTIVE through COMPLETION CHECKLIST must be present and substantive. No empty sections, no "N/A" without explanation.

**Hard requirement:** If a task brief is under 700 lines, it is REJECTED. Expand inline content — paste more of the target file's current content, add more pattern snippets, add more validation steps, add more acceptance criteria. If a brief genuinely can't reach 700 lines for a single file, the task is too small — merge it with an adjacent task or add depth (more edge cases, more validation, more context).

**Required sections per task brief:**
- Objective (one sentence — the test for "done")
- Scope (files touched, what's out of scope, dependencies)
- Prior Task Context (what was done in task N-1; "None" for task 1)
- Context References (files to read with line ranges AND full content pasted inline in code blocks)
- Patterns to Follow (complete code snippets from the codebase — NOT optional, NOT summaries)
- Step-by-Step Tasks (each step: IMPLEMENT with exact Current/Replace-with blocks, PATTERN, GOTCHA, VALIDATE)
- Testing Strategy (unit, integration, edge cases)
- **QA Scenarios** (agent-executed verification steps)
- Validation Commands (L1–L5, each level filled or explicitly "N/A" with reason)
- Acceptance Criteria (Implementation + Runtime checkboxes)
- **Parallelization** (Wave N, blocks, blocked-by)
- Handoff Notes (what task N+1 needs to know; omit for last task)
- Completion Checklist

#### QA Scenarios

Every task brief includes agent-executed QA scenarios. These are NOT unit tests — they are verification steps the executing agent performs.

**Format:**
```markdown
## QA Scenarios

### Scenario 1: {Happy Path Name}
**Tool**: Bash / Playwright / Read
**Steps**:
1. {exact command or action}
2. {exact command or action}
**Expected**: {concrete, verifiable result}
**Evidence**: `.agents/features/{feature}/evidence/task-{N}-{slug}.{ext}`

### Scenario 2: {Error Path Name}
**Tool**: Bash
**Steps**:
1. {trigger error condition}
**Expected**: {specific error message or behavior}
**Evidence**: `.agents/features/{feature}/evidence/task-{N}-{slug}.{ext}`
```

**Rules:**
- Every task has at least 2 QA scenarios (happy path + error path)
- Scenarios use specific tools (Bash, Playwright, Read), not vague "verify"
- Expected results are concrete, not "it works"
- Evidence is saved to `.agents/features/{feature}/evidence/`

#### Parallelization

Every task brief specifies parallelization constraints.

**Format:**
```markdown
## Parallelization

- **Wave**: {N} — Tasks in the same wave can run in parallel
- **Can Parallel**: YES / NO
- **Blocks**: {task numbers this task blocks, e.g., "Tasks 4, 5"}
- **Blocked By**: {task numbers this task depends on, e.g., "Task 1"}
```

**Rules:**
- Wave 1 tasks have no dependencies (can start immediately)
- Higher wave numbers depend on lower waves completing
- "Blocks" lists downstream tasks that wait for this one
- "Blocked By" lists upstream tasks this one waits for
- Tasks in the same wave with `Can Parallel: YES` can run simultaneously

**Example:**
```
Task 1: Create base types     — Wave 1, Blocks: 2, 3, 4
Task 2: Implement service     — Wave 2, Blocked By: 1, Blocks: 4
Task 3: Implement handler     — Wave 2, Blocked By: 1, Blocks: 4
Task 4: Integration tests     — Wave 3, Blocked By: 2, 3
```

**Rejection criteria** — a task brief is REJECTED if it:
- Is under 700 lines
- Uses "see lines X-Y" or "read file Z" instead of pasting content inline
- Skips any required section (every section above must be present)
- Has Current/Replace blocks that abbreviate, summarize, or use "..." to skip lines
- Covers 3+ files without explicit justification

---

### Master + Sub-Plan Mode (Escape Hatch)

For genuinely complex features with multiple distinct phases and heavy cross-phase dependencies:

**Step 1: Write Master Plan**
- ~400-600 lines
- Save to `.agents/features/{feature}/plan-master.md`
- Contains: overview, phases, dependencies, cross-phase decisions, risk register
- Includes SUB-PLAN INDEX table

**Step 2: Write Sub-Plans (sequential)**
- 700-1000 lines each
- Save to `.agents/features/{feature}/plan-phase-{N}.md`
- Phase count heuristic: 1 phase per 3-5 tasks, 2-4 phases typical
- Each sub-plan references handoff notes from prior phases
- Later sub-plans include "Handoff Received" section with context from earlier phases

**Phase naming:**
- Phase 1: Foundation/Setup tasks
- Phase 2: Core implementation
- Phase 3: Integration/Testing
- (Adjust based on actual feature structure)

---

## Output

Create the feature directory if it doesn't exist: `.agents/features/{feature}/`

**Task Brief Mode (Default):**
```
.agents/features/{feature}/plan.md         ← overview + task index
.agents/features/{feature}/task-1.md       ← task brief 1
.agents/features/{feature}/task-2.md       ← task brief 2
...
.agents/features/{feature}/task-{N}.md     ← task brief N
```

**Master + Sub-Plan Mode (Escape Hatch):**
```
.agents/features/{feature}/plan-master.md
.agents/features/{feature}/plan-phase-1.md
.agents/features/{feature}/plan-phase-2.md
...
```

### Archon Task Sync (if connected) → `librarian` agent

After writing the plan, invoke the librarian agent to sync tasks with Archon:

```typescript
task(
  subagent_type="librarian",
  run_in_background=false,  // Wait for result
  load_skills=[],
  description="Sync tasks to Archon for {feature}",
  prompt=`
    [CONTEXT]: Plan written for {feature} with {N} task briefs
    [GOAL]: Create Archon tasks for tracking
    [REQUEST]:
    1. Find or create Archon project for this feature
    2. Create one Archon task per task brief
    3. Return task IDs to store in plan metadata
  `
)
```

The librarian agent uses Archon MCP tools when connected.

### Pipeline Handoff Write (required)

After writing the plan (and Archon sync if applicable), overwrite `.agents/context/next-command.md`:

**Task Brief Mode (Default):**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /planning
- **Feature**: {feature}
- **Next Command**: codex /execute .agents/features/{feature}/plan.md
- **Task Progress**: 0/{N} complete
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: awaiting-execution
```

**Master + Sub-Plan Mode:**
```markdown
# Pipeline Handoff
<!-- Auto-updated by pipeline commands. Read by /prime. Do not edit manually. -->

- **Last Command**: /planning
- **Feature**: {feature}
- **Next Command**: codex /execute .agents/features/{feature}/plan-master.md
- **Master Plan**: .agents/features/{feature}/plan-master.md
- **Phase Progress**: 0/{M} complete
- **Timestamp**: {ISO 8601 timestamp}
- **Status**: awaiting-execution
```
```

### Reference D: execution gate excerpt (`.opencode/commands/execute.md`)
```markdown
Implements planned tasks. Reads plan from `.agents/features/{feature}/plan.md`. Outputs modified files.

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

**If file path contains `plan-master.md`**: This is a multi-phase feature. Execute ONE phase per session:
1. Extract phase sub-plan paths from the SUB-PLAN INDEX table at the bottom of the master plan
2. Scan `.agents/features/{feature}/` for `plan-phase-{N}.done.md` files to determine which phases are complete
3. Identify the next undone phase (lowest N without a matching `.done.md`)
4. **If ALL phases are done** → report "All {total} phases complete. Feature ready for `/code-loop {feature}`." Write handoff with **Status** `awaiting-review` and **Next Command** `/code-loop {feature}`. Rename `plan-master.md` → `plan-master.done.md`. **Stop — do not execute anything.**
5. **If a next phase exists** → report "Master plan: phase {N}/{total}. Executing plan-phase-{N}.md in this session."
   - Read SHARED CONTEXT REFERENCES from the master plan
   - If a previous phase exists (`plan-phase-{N-1}.done.md`), read its HANDOFF NOTES section for continuity context
   - Proceed to execute ONLY `plan-phase-{N}.md` as a single sub-plan (Step 1 onward). After execution completes, proceed to Step 2.5 for phase completion.

**If file path is a single phase file (`-phase-{N}.md`)**: Execute as a single sub-plan (normal mode, but note it's part of a larger feature). If `plan-master.md` exists in the same directory, read its SHARED CONTEXT REFERENCES for additional context. After execution completes, proceed to Step 2.5 for phase completion.

**If file contains `<!-- PLAN-SERIES -->`**: Treat as master plan — extract sub-plan paths from PLAN INDEX and apply the same one-phase-per-session logic above.

**If file path ends with `plan.md` (task brief mode — default)**: Check for task brief files:
1. Scan `.agents/features/{feature}/` for `task-{N}.md` files (any N)
2. **If `task-{N}.md` files exist** → Task Brief Mode. Execute ONE brief per session:
   a. Scan for `task-{N}.done.md` files to determine which briefs are complete
   b. Identify the next undone brief (lowest N without a matching `.done.md`)
   c. **If ALL briefs are done** → report "All {total} task briefs complete. Feature ready for `/code-loop {feature}`." Write handoff with **Status** `awaiting-review` and **Next Command** `/code-loop {feature}`. Rename `plan.md` → `plan.done.md`. **Stop — do not execute anything.**
   d. **If a next brief exists** → report "Task brief mode: task {N}/{total}. Executing task-{N}.md in this session."
      - Read the PRIOR TASK CONTEXT section from `task-{N}.md` (if task N > 1, it contains context from task N-1)
      - Proceed to execute ONLY `task-{N}.md` as the plan (Step 1 onward, treating the brief as the plan). After execution completes, proceed to Step 2.6 for task completion.
3. **If NO `task-{N}.md` files exist** → Legacy single plan mode. Proceed normally (the entire `plan.md` is the execution guide). Skip Steps 2.5 and 2.6.

**If no marker and not plan.md**: Standard single plan — proceed normally, skip Steps 2.5 and 2.6.
```

### Reference E: pending-work location excerpt (`.opencode/commands/prime.md`)
```markdown

Scan for in-progress pipeline state. Two sources, merged:

### Source 1: Handoff file

Read `.agents/context/next-command.md` if it exists. Extract:
- **Last Command**: the command that last ran
- **Feature**: the active feature name
- **Next Command**: what should run next
- **Status**: pipeline state
- **Master Plan** and **Phase Progress** (if present): multi-phase tracking
- **Task Progress** (if present): `N/M complete` — task brief mode tracking

Recognized status values:
- `awaiting-execution` — plan written, no execution started
- `executing-tasks` — task brief mode in progress (some briefs done)
- `executing-series` — master plan phase mode in progress
- `awaiting-review` — all execution done, awaiting `/code-loop`
- `awaiting-fixes` — code review found issues, awaiting `/code-review-fix`
- `awaiting-re-review` — fixes applied, awaiting re-review via `/code-review`
- `ready-to-commit` — review complete, awaiting `/commit`
- `ready-for-pr` — committed, awaiting `/pr`
- `pr-open` — PR created, pipeline complete (informational)
- `blocked` — manual intervention required

If the file does not exist or is empty, skip to Source 2.

### Source 2: Artifact scan (fallback + cross-check)

Scan `.agents/features/*/` for non-`.done.md` artifacts. For each feature directory:

1. If `plan.md` exists AND `plan.done.md` does NOT exist:
   - If `task-{N}.md` files exist (any N) → check which `task-{N}.done.md` exist → **task brief mode in progress (task X/Y)**
   - If NO `task-{N}.md` files exist → **legacy plan awaiting execution**
2. If `plan-master.md` exists AND `plan-master.done.md` does NOT exist → check which `plan-phase-{N}.done.md` files exist to determine current phase → **master plan in progress (phase X/Y)**
3. If `report.md` exists AND `report.done.md` does NOT exist → **report awaiting commit**
4. If `review.md` exists AND `review.done.md` does NOT exist → **review with open findings**
5. If `review-{N}.md` exists (any N) without matching `.done.md` → **code-loop review in progress**

### Merge logic

- If the handoff file exists AND artifact scan confirms the same state → use handoff (more specific, has exact next command)
- If the handoff file exists BUT artifact scan contradicts it (e.g., handoff says "awaiting-execution" but `plan.done.md` exists) → the handoff is stale. Use artifact scan state and note "Handoff stale — overridden by artifact state"
- If no handoff file exists → use artifact scan only
- If neither source finds pending work → no pending work section shown

```

### Reference F: current handoff file (`.agents/context/next-command.md`)
```markdown
# Pipeline Handoff

## Current State

| Field | Value |
|-------|-------|
| **Last Command** | `/code-loop` |
| **Feature** | prometheus-planning-merge |
| **Status** | ready-to-commit |
| **Next Command** | `/commit` |
| **Task Progress** | 6/6 complete |
| **Review Status** | ✅ CLEAN (0 Critical, 0 Major, 0 Minor) |
| **Timestamp** | 2026-03-06T12:45:00Z |

## Code Review Summary

Review passed with no findings. All verifications complete:
- ✅ All 8 Prometheus features migrated
- ✅ 16 agent invocations use correct `task(subagent_type=...)` syntax
- ✅ No legacy patterns
- ✅ Draft uses `planning-draft.md` (not prometheus-draft.md)
- ✅ Code blocks balanced (51 pairs)
- ✅ Cross-references accurate

## Result

- `.opencode/commands/planning.md` — 1448 lines (up from 663)
- Merged Prometheus interview methodology into unified /planning command
- All specialized agents integrated: explore, librarian, oracle, metis, momus

## Artifacts

- Plan: `.agents/features/prometheus-planning-merge/plan.done.md`
- Tasks: `task-1.done.md` through `task-6.done.md`
- Review: `.agents/features/prometheus-planning-merge/review.done.md`

## Prior Feature (also ready)

- **agent-system-consolidation** — 5/5 tasks complete, also ready to commit

## Next Session

Run `/prime` then `/commit` to finalize changes.
```

## Patterns to Follow
- Path references in rules should mirror command docs exactly (same directory prefixes and placeholders).
- Feature-scoped artifacts must use `.agents/features/{feature}/...` pattern.
- Global session state should reference `.agents/context/next-command.md` when describing pipeline bridge behavior.
- Keep markdown/rules writing concise and imperative, matching existing bullet style.

## Step-by-Step Tasks
### Step 1 - Enumerate stale references
- **IMPLEMENT**: identify every line in `.opencode/rules` containing `.agents/plans`, `.agents/reviews`, `.agents/specs`, or legacy spec-state file names.
- **PATTERN**: keep line-level mapping table before edit.
- **GOTCHA**: include both prose bullets and inline code references.
- **VALIDATE**: grep result contains only intended stale tokens.

### Step 2 - Replace plan/review/spec path bullets
- **IMPLEMENT**: update file-organization section to canonical `.agents/features/{feature}/...` model.
- **PATTERN**: follow wording style used in existing rules bullets (short imperative statements).
- **GOTCHA**: preserve `reports` bullet if still valid, unless evidence says otherwise.
- **VALIDATE**: read updated section and compare against command docs.

### Step 3 - Replace state-management stale references
- **IMPLEMENT**: replace spec-state bridge lines with active handoff/memory guidance based on real files.
- **PATTERN**: align with `.opencode/commands/prime.md` pending-work model.
- **GOTCHA**: do not invent nonexistent files as replacements.
- **VALIDATE**: every referenced path exists or is a documented `{feature}` template path.

### Step 4 - Final quality pass
- **IMPLEMENT**: check for unintended wording drift outside stale-path scope.
- **PATTERN**: non-path sections should remain semantically unchanged.
- **GOTCHA**: avoid accidental list renumbering issues in markdown.
- **VALIDATE**: diagnostics clean + stale-token grep returns no matches.

## Current/Replace Guidance (authoritative edit intent)
### Mapping 1
- **Current**: `.agents/plans/`
- **Replace with**: `.agents/features/{feature}/ (plan artifacts: plan.md, task-{N}.md)`
- **Why**: replacement matches active command documentation and current repository tree.

### Mapping 2
- **Current**: `.agents/reviews/`
- **Replace with**: `.agents/features/{feature}/review.md (and review-{N}.md)`
- **Why**: replacement matches active command documentation and current repository tree.

### Mapping 3
- **Current**: `.agents/specs/`
- **Replace with**: `.agents/features/{feature}/ and `.agents/context/` depending on artifact type`
- **Why**: replacement matches active command documentation and current repository tree.

### Mapping 4
- **Current**: `.agents/specs/build-state.json`
- **Replace with**: `.agents/context/next-command.md`
- **Why**: replacement matches active command documentation and current repository tree.

### Mapping 5
- **Current**: `.agents/specs/BUILD_ORDER.md`
- **Replace with**: `.agents/features/{feature}/plan.md task index and `.done.md` lifecycle`
- **Why**: replacement matches active command documentation and current repository tree.

### Mapping 6
- **Current**: `.agents/specs/PILLARS.md`
- **Replace with**: `No direct `.agents/specs/` replacement in rules; remove stale mention unless a real file is introduced`
- **Why**: replacement matches active command documentation and current repository tree.

## Testing Strategy
- Unit tests: N/A (text-only rules artifact).
- Integration checks: compare resulting references against AGENTS and command docs.
- Edge cases: verify placeholder `{feature}` is retained where expected; ensure no stale `.agents/specs` remains.

## QA Scenarios
### Scenario 1: Happy path - all references canonical
- **Tool**: Read + Grep
- **Steps**:
  1. Read `.opencode/rules` after edit.
  2. Search for stale tokens (`.agents/plans`, `.agents/reviews`, `.agents/specs`).
  3. Compare resulting references with command docs (`planning.md`, `execute.md`, `prime.md`).
- **Expected**: no stale tokens remain; every path statement aligns with documented pipeline.
- **Evidence**: `.agents/features/fix-rules-file/evidence/task-1-happy-path.txt`

### Scenario 2: Error path - stale token regression check
- **Tool**: Grep
- **Steps**:
  1. Run stale-token grep over `.opencode/rules`.
  2. If any hit appears, classify as blocker and return to Step 2/3 edits.
- **Expected**: zero matches. Any match fails task completion.
- **Evidence**: `.agents/features/fix-rules-file/evidence/task-1-stale-token-check.txt`

## Validation Commands
```bash
# L1 diagnostics (changed file)
lsp_diagnostics .opencode/rules

# L2 stale-token scan
grep -n "\.agents/plans|\.agents/reviews|\.agents/specs|build-state\.json|BUILD_ORDER\.md|PILLARS\.md" .opencode/rules

# L3 structural cross-check
read .agents
read .agents/context
read .agents/features

# L4/L5
# N/A for runtime code execution in this task
```

## Acceptance Criteria
- [ ] All stale plan path references replaced with `.agents/features/{feature}/...` equivalents.
- [ ] All stale review path references replaced with `.agents/features/{feature}/review*.md` equivalents.
- [ ] All stale `.agents/specs/*` references removed or remapped to active files.
- [ ] State-management bullets in `.opencode/rules` reference real files only.
- [ ] No non-path policy changes are introduced.
- [ ] Task brief generated and points to exact edit instructions.
- [ ] Plan and task artifact paths are under `.agents/features/fix-rules-file/`.
- [ ] Diagnostics report zero errors for modified markdown/rules artifacts.

## Parallelization
- **Wave**: 1
- **Can Parallel**: NO
- **Blocks**: none (single-task feature)
- **Blocked By**: none

## Handoff Notes
- This is the final task for the feature; next pipeline command after execution should be `/code-loop fix-rules-file`.
- Preserve plan and report lifecycle (`task-1.done.md`, `plan.done.md`, `report.md`).

## Completion Checklist
- [ ] Intent classified as Simple and recorded.
- [ ] Draft management path established.
- [ ] Discovery evidence captured from rules + command docs + AGENTS.
- [ ] Research confirms actual `.agents/` structure.
- [ ] Design decision and guardrails documented.
- [ ] Preview assembled with clear IN/OUT boundaries.
- [ ] Plan artifact written to target feature folder.
- [ ] Task brief written to target feature folder.
- [ ] Self-review checklist passed with no critical gaps.
- [ ] Final summary ready for execution handoff.

## Execution Trace Grid
Use this checklist during execution to avoid missing stale references. Each item should be marked complete only when both edit and validation are done.
- ET-001: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-002: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-003: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-004: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-005: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-006: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-007: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-008: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-009: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-010: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-011: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-012: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-013: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-014: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-015: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-016: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-017: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-018: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-019: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-020: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-021: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-022: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-023: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-024: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-025: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-026: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-027: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-028: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-029: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-030: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-031: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-032: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-033: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-034: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-035: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-036: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-037: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-038: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-039: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-040: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-041: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-042: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-043: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-044: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-045: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-046: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-047: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-048: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-049: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-050: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-051: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-052: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-053: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-054: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-055: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-056: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-057: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-058: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-059: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-060: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-061: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-062: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-063: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-064: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-065: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-066: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-067: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-068: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-069: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-070: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-071: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-072: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-073: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-074: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-075: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-076: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-077: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-078: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-079: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-080: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-081: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-082: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-083: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-084: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-085: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-086: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-087: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-088: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-089: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-090: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-091: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-092: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-093: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-094: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-095: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-096: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-097: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-098: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-099: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-100: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-101: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-102: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-103: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-104: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-105: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-106: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-107: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-108: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-109: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-110: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-111: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-112: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-113: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-114: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-115: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-116: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-117: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-118: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-119: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-120: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-121: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-122: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-123: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-124: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-125: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-126: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-127: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-128: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-129: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-130: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-131: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-132: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-133: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-134: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-135: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-136: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-137: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-138: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-139: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-140: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-141: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-142: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-143: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-144: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-145: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-146: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-147: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-148: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-149: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-150: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-151: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-152: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-153: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-154: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-155: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-156: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-157: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-158: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-159: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-160: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-161: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-162: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-163: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-164: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-165: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-166: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-167: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-168: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-169: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-170: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-171: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-172: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-173: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-174: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-175: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-176: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-177: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-178: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-179: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-180: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-181: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-182: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-183: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-184: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-185: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-186: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-187: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-188: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-189: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-190: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-191: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-192: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-193: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-194: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-195: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-196: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-197: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-198: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-199: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-200: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-201: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-202: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-203: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-204: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-205: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-206: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-207: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-208: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-209: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-210: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-211: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-212: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-213: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-214: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-215: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-216: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-217: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-218: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-219: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-220: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-221: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-222: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-223: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-224: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-225: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-226: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-227: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-228: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-229: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-230: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-231: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-232: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-233: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-234: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-235: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-236: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-237: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-238: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-239: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-240: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-241: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-242: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-243: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-244: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-245: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-246: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-247: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-248: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-249: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-250: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-251: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-252: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-253: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-254: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-255: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-256: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-257: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-258: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-259: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-260: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-261: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-262: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-263: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-264: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-265: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-266: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-267: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-268: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-269: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-270: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-271: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-272: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-273: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-274: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-275: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-276: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-277: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-278: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-279: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-280: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-281: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-282: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-283: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-284: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-285: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-286: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-287: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-288: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-289: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-290: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-291: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-292: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-293: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-294: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-295: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-296: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-297: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-298: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-299: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-300: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-301: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-302: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-303: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-304: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-305: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-306: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-307: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-308: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-309: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-310: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-311: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-312: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-313: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-314: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-315: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-316: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-317: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-318: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-319: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-320: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-321: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-322: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-323: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-324: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-325: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-326: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-327: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-328: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-329: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-330: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-331: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-332: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-333: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-334: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-335: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-336: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-337: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-338: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-339: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-340: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-341: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-342: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-343: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-344: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-345: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-346: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-347: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-348: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-349: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-350: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-351: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-352: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-353: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-354: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-355: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-356: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-357: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-358: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-359: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-360: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-361: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-362: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-363: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-364: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-365: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-366: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-367: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-368: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-369: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-370: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-371: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-372: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-373: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-374: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-375: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-376: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-377: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-378: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-379: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-380: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-381: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-382: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-383: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-384: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-385: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-386: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-387: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-388: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-389: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-390: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-391: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-392: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-393: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-394: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-395: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-396: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-397: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-398: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-399: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-400: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-401: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-402: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-403: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-404: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-405: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-406: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-407: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-408: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-409: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-410: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-411: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-412: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-413: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-414: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-415: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-416: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-417: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-418: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-419: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
- ET-420: Verify one stale-reference vector, apply or confirm no-op, then re-validate related line context.
