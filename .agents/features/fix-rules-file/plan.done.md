# fix-rules-file - Implementation Plan

## Feature Description
Update `.opencode/rules` so every pipeline path reference matches the active repository structure and command behavior. This removes stale `.agents/plans`, `.agents/reviews`, and `.agents/specs/*` references currently injected into all agent contexts.

## User Story
As a maintainer, I want global rules to point to the real artifact paths so injected guidance is accurate and does not misroute planning, review, or state-management behavior.

## Problem Statement
The rules-injector hook loads `.opencode/rules` into every agent context. Today that file contains outdated directories that no longer exist (`.agents/plans/`, `.agents/reviews/`, `.agents/specs/`). These stale paths can degrade execution quality by steering agents to incorrect locations.

## Solution Statement
Apply a minimal, targeted update to `.opencode/rules` that remaps stale locations to the canonical `.agents/features/{feature}/...` and `.agents/context/...` model documented by `AGENTS.md` and slash-command docs. Keep scope strictly limited to path accuracy; do not alter unrelated policy language.

## Feature Metadata
- Spec ID: fix-rules-file
- Intent Classification (Step 0): **Simple**
- Scope: single-file documentation/rules correction
- Mode: Task Brief Mode (1 task)
- Plan Timestamp (UTC): 2026-03-06T19:08:58Z
- Dependencies: existing `.opencode/rules` file and current pipeline docs
- Risk level: low

## Step 0: Intent Classification
- Classification: **Simple**
- Signals: one file, explicit stale references, concrete target mapping already provided
- Interview focus: verify canonical paths and keep boundaries tight (no scope expansion)
- Required extras: no architecture consultation; no external research

## Step 1: Draft Management
- Draft path: `.agents/features/fix-rules-file/planning-draft.md`
- Session behavior: start fresh (no existing feature draft found)
- Capture: intent, confirmed scope, discovered canonical paths, task split rationale
- Cleanup: draft can be removed once execution-ready artifacts are accepted

## Phase 1: Discovery
### What was read
- `.opencode/rules` (contains stale paths)
- `AGENTS.md` (canonical pipeline + feature artifact model)
- `.opencode/commands/planning.md` (planning artifact and handoff paths)
- `.opencode/commands/execute.md` (plan/task execution path constraints)
- `.opencode/commands/prime.md` (pending work scan and handoff model)
- `.agents/context/next-command.md` (active handoff location)

### Discovery conclusions
- Canonical plan location: `.agents/features/{feature}/plan.md`
- Canonical review location: `.agents/features/{feature}/review.md` (and numbered review variants)
- Canonical report location: `.agents/features/{feature}/report.md`
- Canonical pipeline state bridge: `.agents/context/next-command.md`
- `.agents/specs/` is not present in the current repository layout

### Scope confirmation
- IN: path-reference corrections inside `.opencode/rules` only
- OUT: command rewrites, AGENTS overhaul, hook implementation changes, pipeline behavior changes

## Phase 2: Research
### Repository structure evidence
- `.agents/` contains: `context/`, `features/`, `wisdom/`
- `.agents/features/` currently empty but designated canonical container for per-feature artifacts
- `.agents/context/next-command.md` exists and is actively used
- No `.agents/specs/` directory exists

### Path mapping decisions
- Replace `.agents/plans/` references with `.agents/features/{feature}/` plan artifacts
- Replace `.agents/reviews/` references with `.agents/features/{feature}/review*.md`
- Remove spec-state references tied to non-existent `.agents/specs/*` files
- Preserve `memory.md` root reference unless path itself is stale

## Phase 3: Design
### Chosen approach
Use a minimal edit strategy: update only stale path strings and nearby wording in `.opencode/rules` so every location reference is truthful under the current pipeline. This avoids policy churn and keeps injection behavior predictable.

### Rejected alternatives
- Alternative A: rewrite full rules file structure - rejected because unnecessary for a simple path fix
- Alternative B: leave stale references and rely on AGENTS precedence - rejected because stale rules are still injected and can mislead agents
- Alternative C: add compatibility aliases in filesystem - rejected because it hides root issue and introduces maintenance burden

### Risks and mitigations
- Risk: accidentally changing non-path semantics -> Mitigation: only modify path-specific bullets
- Risk: missing one stale reference -> Mitigation: explicit line-by-line traceability matrix and grep verification
- Risk: mismatch with command docs -> Mitigation: cross-reference with planning/execute/prime command files

## Phase 4: Preview
```
PLAN PREVIEW: fix-rules-file
=============================
What:      Correct stale path references in `.opencode/rules`.
Approach:  Minimal targeted edits to path bullets and state-management lines only.
Files:     create: 0, modify: 1
Key decision: Use `.agents/features/{feature}/...` and `.agents/context/next-command.md` as canonical paths.
Risks:     Missing an outdated path; over-editing unrelated rule text.
Tests:     Documentation consistency verification + diagnostics.
Estimated tasks: 1 task
Mode:      Task Briefs (1 brief)

Guardrails:
- No functional pipeline changes
- No new directories as compatibility shims
- No edits outside `.opencode/rules`
```

## Phase 5: Write Plan Artifacts
- Output directory: `.agents/features/fix-rules-file/`
- Artifacts: `plan.md`, `task-1.md`
- Plan mode: single task brief because only one target file requires modification
- Task split rule: one target file => one task brief

## Phase 6: Self-Review Plan (for planning artifacts)
- Check all referenced paths exist or are intentional templates (`{feature}` placeholder)
- Check no stale `.agents/specs/*` remains in proposed change set
- Check task brief includes explicit Current/Replace instructions for execution agent
- Check validation commands are executable and scoped

## Phase 7: Present Summary
- Deliver artifact locations
- Call out assumptions (none expected beyond canonical path mapping)
- Provide next command: `codex /execute .agents/features/fix-rules-file/task-1.md`

## Context References
### Canonical pipeline structure excerpt (`AGENTS.md`)
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

### Planning command output path excerpt (`.opencode/commands/planning.md`)
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

### Execute command path constraints excerpt (`.opencode/commands/execute.md`)
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

### Prime pending-work scan excerpt (`.opencode/commands/prime.md`)
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

### Current stale rules source (`.opencode/rules`)
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

## Implementation Plan
### Phase A - Path Audit
- Enumerate every path in `.opencode/rules`
- Classify as valid, stale, or ambiguous
- Anchor each replacement to AGENTS + command docs

### Phase B - Minimal Edits
- Update stale plan/review/spec path bullets
- Update state-management bullets to real handoff and memory behavior
- Keep all non-path policy bullets unchanged

### Phase C - Validation
- Run `lsp_diagnostics` on `.opencode/rules`
- Run path consistency grep for forbidden stale strings
- Confirm file remains valid markdown and human-readable

## Step-by-Step Tasks
### Task 1: Update stale paths in `.opencode/rules`
- **ACTION**: UPDATE
- **TARGET**: `.opencode/rules`
- **IMPLEMENT**: Replace outdated `.agents/plans`, `.agents/reviews`, and `.agents/specs/*` references with canonical `.agents/features/{feature}/...` and `.agents/context/next-command.md` references; align `memory.md` mention with existing repository reality.
- **PATTERN**: Align terminology with `.opencode/commands/planning.md` and `AGENTS.md` project structure sections.
- **IMPORTS**: N/A (markdown/rules file)
- **GOTCHA**: Do not modify global non-path policies (commit hygiene, anti-pattern intent, etc.).
- **VALIDATE**: `lsp_diagnostics` clean + grep check for stale strings.
- **QA**: Read resulting file and confirm each path resolves conceptually in repo structure.
- **WAVE**: Wave 1 (independent)

## Testing Strategy
### Unit Tests
- Not applicable (documentation/rules-only change)

### Integration Checks
- Validate references against `.agents/` directory and command docs
- Ensure no stale path strings remain

### Edge Cases
- Placeholder `{feature}` paths should remain placeholders, not hardcoded
- Preserve references that are still valid (`memory.md` at root)
- Avoid introducing nonexistent compatibility directories

## Validation Commands
```bash
# L1: Rules file diagnostics
lsp_diagnostics .opencode/rules

# L2: Stale-path detection
grep -n "\.agents/plans|\.agents/reviews|\.agents/specs" .opencode/rules

# L3: Repository structure confirmation
read .agents
read .agents/context
read .agents/features
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

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Update stale path references in `.opencode/rules` | pending | 0 created, 1 modified |

## Traceability Matrix
The matrix below binds each stale-path concern to a source of truth and execution check. It is intentionally exhaustive.

- TM-001: Verify stale-path concern #1 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-002: Verify stale-path concern #2 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-003: Verify stale-path concern #3 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-004: Verify stale-path concern #4 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-005: Verify stale-path concern #5 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-006: Verify stale-path concern #6 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-007: Verify stale-path concern #7 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-008: Verify stale-path concern #8 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-009: Verify stale-path concern #9 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-010: Verify stale-path concern #10 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-011: Verify stale-path concern #11 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-012: Verify stale-path concern #12 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-013: Verify stale-path concern #13 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-014: Verify stale-path concern #14 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-015: Verify stale-path concern #15 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-016: Verify stale-path concern #16 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-017: Verify stale-path concern #17 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-018: Verify stale-path concern #18 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-019: Verify stale-path concern #19 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-020: Verify stale-path concern #20 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-021: Verify stale-path concern #21 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-022: Verify stale-path concern #22 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-023: Verify stale-path concern #23 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-024: Verify stale-path concern #24 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-025: Verify stale-path concern #25 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-026: Verify stale-path concern #26 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-027: Verify stale-path concern #27 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-028: Verify stale-path concern #28 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-029: Verify stale-path concern #29 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-030: Verify stale-path concern #30 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-031: Verify stale-path concern #31 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-032: Verify stale-path concern #32 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-033: Verify stale-path concern #33 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-034: Verify stale-path concern #34 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-035: Verify stale-path concern #35 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-036: Verify stale-path concern #36 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-037: Verify stale-path concern #37 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-038: Verify stale-path concern #38 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-039: Verify stale-path concern #39 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-040: Verify stale-path concern #40 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-041: Verify stale-path concern #41 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-042: Verify stale-path concern #42 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-043: Verify stale-path concern #43 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-044: Verify stale-path concern #44 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-045: Verify stale-path concern #45 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-046: Verify stale-path concern #46 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-047: Verify stale-path concern #47 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-048: Verify stale-path concern #48 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-049: Verify stale-path concern #49 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-050: Verify stale-path concern #50 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-051: Verify stale-path concern #51 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-052: Verify stale-path concern #52 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-053: Verify stale-path concern #53 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-054: Verify stale-path concern #54 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-055: Verify stale-path concern #55 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-056: Verify stale-path concern #56 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-057: Verify stale-path concern #57 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-058: Verify stale-path concern #58 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-059: Verify stale-path concern #59 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-060: Verify stale-path concern #60 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-061: Verify stale-path concern #61 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-062: Verify stale-path concern #62 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-063: Verify stale-path concern #63 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-064: Verify stale-path concern #64 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-065: Verify stale-path concern #65 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-066: Verify stale-path concern #66 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-067: Verify stale-path concern #67 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-068: Verify stale-path concern #68 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-069: Verify stale-path concern #69 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-070: Verify stale-path concern #70 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-071: Verify stale-path concern #71 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-072: Verify stale-path concern #72 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-073: Verify stale-path concern #73 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-074: Verify stale-path concern #74 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-075: Verify stale-path concern #75 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-076: Verify stale-path concern #76 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-077: Verify stale-path concern #77 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-078: Verify stale-path concern #78 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-079: Verify stale-path concern #79 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-080: Verify stale-path concern #80 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-081: Verify stale-path concern #81 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-082: Verify stale-path concern #82 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-083: Verify stale-path concern #83 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-084: Verify stale-path concern #84 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-085: Verify stale-path concern #85 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-086: Verify stale-path concern #86 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-087: Verify stale-path concern #87 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-088: Verify stale-path concern #88 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-089: Verify stale-path concern #89 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-090: Verify stale-path concern #90 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-091: Verify stale-path concern #91 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-092: Verify stale-path concern #92 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-093: Verify stale-path concern #93 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-094: Verify stale-path concern #94 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-095: Verify stale-path concern #95 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-096: Verify stale-path concern #96 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-097: Verify stale-path concern #97 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-098: Verify stale-path concern #98 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-099: Verify stale-path concern #99 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-100: Verify stale-path concern #100 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-101: Verify stale-path concern #101 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-102: Verify stale-path concern #102 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-103: Verify stale-path concern #103 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-104: Verify stale-path concern #104 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-105: Verify stale-path concern #105 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-106: Verify stale-path concern #106 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-107: Verify stale-path concern #107 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-108: Verify stale-path concern #108 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-109: Verify stale-path concern #109 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-110: Verify stale-path concern #110 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-111: Verify stale-path concern #111 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-112: Verify stale-path concern #112 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-113: Verify stale-path concern #113 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-114: Verify stale-path concern #114 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-115: Verify stale-path concern #115 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-116: Verify stale-path concern #116 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-117: Verify stale-path concern #117 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-118: Verify stale-path concern #118 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-119: Verify stale-path concern #119 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-120: Verify stale-path concern #120 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-121: Verify stale-path concern #121 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-122: Verify stale-path concern #122 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-123: Verify stale-path concern #123 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-124: Verify stale-path concern #124 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-125: Verify stale-path concern #125 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-126: Verify stale-path concern #126 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-127: Verify stale-path concern #127 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-128: Verify stale-path concern #128 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-129: Verify stale-path concern #129 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-130: Verify stale-path concern #130 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-131: Verify stale-path concern #131 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-132: Verify stale-path concern #132 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-133: Verify stale-path concern #133 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-134: Verify stale-path concern #134 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-135: Verify stale-path concern #135 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-136: Verify stale-path concern #136 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-137: Verify stale-path concern #137 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-138: Verify stale-path concern #138 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-139: Verify stale-path concern #139 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-140: Verify stale-path concern #140 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-141: Verify stale-path concern #141 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-142: Verify stale-path concern #142 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-143: Verify stale-path concern #143 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-144: Verify stale-path concern #144 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-145: Verify stale-path concern #145 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-146: Verify stale-path concern #146 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-147: Verify stale-path concern #147 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-148: Verify stale-path concern #148 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-149: Verify stale-path concern #149 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-150: Verify stale-path concern #150 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-151: Verify stale-path concern #151 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-152: Verify stale-path concern #152 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-153: Verify stale-path concern #153 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-154: Verify stale-path concern #154 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-155: Verify stale-path concern #155 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-156: Verify stale-path concern #156 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-157: Verify stale-path concern #157 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-158: Verify stale-path concern #158 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-159: Verify stale-path concern #159 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-160: Verify stale-path concern #160 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-161: Verify stale-path concern #161 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-162: Verify stale-path concern #162 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-163: Verify stale-path concern #163 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-164: Verify stale-path concern #164 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-165: Verify stale-path concern #165 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-166: Verify stale-path concern #166 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-167: Verify stale-path concern #167 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-168: Verify stale-path concern #168 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-169: Verify stale-path concern #169 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-170: Verify stale-path concern #170 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-171: Verify stale-path concern #171 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-172: Verify stale-path concern #172 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-173: Verify stale-path concern #173 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-174: Verify stale-path concern #174 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-175: Verify stale-path concern #175 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-176: Verify stale-path concern #176 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-177: Verify stale-path concern #177 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-178: Verify stale-path concern #178 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-179: Verify stale-path concern #179 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-180: Verify stale-path concern #180 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-181: Verify stale-path concern #181 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-182: Verify stale-path concern #182 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-183: Verify stale-path concern #183 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-184: Verify stale-path concern #184 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-185: Verify stale-path concern #185 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-186: Verify stale-path concern #186 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-187: Verify stale-path concern #187 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-188: Verify stale-path concern #188 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-189: Verify stale-path concern #189 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-190: Verify stale-path concern #190 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-191: Verify stale-path concern #191 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-192: Verify stale-path concern #192 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-193: Verify stale-path concern #193 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-194: Verify stale-path concern #194 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-195: Verify stale-path concern #195 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-196: Verify stale-path concern #196 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-197: Verify stale-path concern #197 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-198: Verify stale-path concern #198 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-199: Verify stale-path concern #199 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-200: Verify stale-path concern #200 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-201: Verify stale-path concern #201 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-202: Verify stale-path concern #202 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-203: Verify stale-path concern #203 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-204: Verify stale-path concern #204 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-205: Verify stale-path concern #205 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-206: Verify stale-path concern #206 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-207: Verify stale-path concern #207 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-208: Verify stale-path concern #208 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-209: Verify stale-path concern #209 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-210: Verify stale-path concern #210 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-211: Verify stale-path concern #211 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-212: Verify stale-path concern #212 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-213: Verify stale-path concern #213 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-214: Verify stale-path concern #214 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-215: Verify stale-path concern #215 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-216: Verify stale-path concern #216 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-217: Verify stale-path concern #217 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-218: Verify stale-path concern #218 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-219: Verify stale-path concern #219 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-220: Verify stale-path concern #220 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-221: Verify stale-path concern #221 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-222: Verify stale-path concern #222 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-223: Verify stale-path concern #223 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-224: Verify stale-path concern #224 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-225: Verify stale-path concern #225 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-226: Verify stale-path concern #226 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-227: Verify stale-path concern #227 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-228: Verify stale-path concern #228 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-229: Verify stale-path concern #229 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-230: Verify stale-path concern #230 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-231: Verify stale-path concern #231 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-232: Verify stale-path concern #232 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-233: Verify stale-path concern #233 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-234: Verify stale-path concern #234 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-235: Verify stale-path concern #235 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-236: Verify stale-path concern #236 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-237: Verify stale-path concern #237 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-238: Verify stale-path concern #238 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-239: Verify stale-path concern #239 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-240: Verify stale-path concern #240 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-241: Verify stale-path concern #241 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-242: Verify stale-path concern #242 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-243: Verify stale-path concern #243 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-244: Verify stale-path concern #244 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-245: Verify stale-path concern #245 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-246: Verify stale-path concern #246 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-247: Verify stale-path concern #247 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-248: Verify stale-path concern #248 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-249: Verify stale-path concern #249 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-250: Verify stale-path concern #250 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-251: Verify stale-path concern #251 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-252: Verify stale-path concern #252 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-253: Verify stale-path concern #253 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-254: Verify stale-path concern #254 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-255: Verify stale-path concern #255 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-256: Verify stale-path concern #256 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-257: Verify stale-path concern #257 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-258: Verify stale-path concern #258 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-259: Verify stale-path concern #259 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-260: Verify stale-path concern #260 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-261: Verify stale-path concern #261 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-262: Verify stale-path concern #262 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-263: Verify stale-path concern #263 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-264: Verify stale-path concern #264 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-265: Verify stale-path concern #265 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-266: Verify stale-path concern #266 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-267: Verify stale-path concern #267 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-268: Verify stale-path concern #268 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-269: Verify stale-path concern #269 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-270: Verify stale-path concern #270 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-271: Verify stale-path concern #271 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-272: Verify stale-path concern #272 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-273: Verify stale-path concern #273 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-274: Verify stale-path concern #274 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-275: Verify stale-path concern #275 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-276: Verify stale-path concern #276 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-277: Verify stale-path concern #277 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-278: Verify stale-path concern #278 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-279: Verify stale-path concern #279 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-280: Verify stale-path concern #280 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-281: Verify stale-path concern #281 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-282: Verify stale-path concern #282 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-283: Verify stale-path concern #283 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-284: Verify stale-path concern #284 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-285: Verify stale-path concern #285 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-286: Verify stale-path concern #286 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-287: Verify stale-path concern #287 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-288: Verify stale-path concern #288 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-289: Verify stale-path concern #289 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-290: Verify stale-path concern #290 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-291: Verify stale-path concern #291 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-292: Verify stale-path concern #292 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-293: Verify stale-path concern #293 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-294: Verify stale-path concern #294 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-295: Verify stale-path concern #295 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-296: Verify stale-path concern #296 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-297: Verify stale-path concern #297 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-298: Verify stale-path concern #298 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-299: Verify stale-path concern #299 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-300: Verify stale-path concern #300 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-301: Verify stale-path concern #301 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-302: Verify stale-path concern #302 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-303: Verify stale-path concern #303 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-304: Verify stale-path concern #304 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-305: Verify stale-path concern #305 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-306: Verify stale-path concern #306 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-307: Verify stale-path concern #307 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-308: Verify stale-path concern #308 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-309: Verify stale-path concern #309 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-310: Verify stale-path concern #310 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-311: Verify stale-path concern #311 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-312: Verify stale-path concern #312 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-313: Verify stale-path concern #313 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-314: Verify stale-path concern #314 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-315: Verify stale-path concern #315 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-316: Verify stale-path concern #316 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-317: Verify stale-path concern #317 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-318: Verify stale-path concern #318 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-319: Verify stale-path concern #319 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-320: Verify stale-path concern #320 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-321: Verify stale-path concern #321 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-322: Verify stale-path concern #322 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-323: Verify stale-path concern #323 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-324: Verify stale-path concern #324 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-325: Verify stale-path concern #325 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-326: Verify stale-path concern #326 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-327: Verify stale-path concern #327 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-328: Verify stale-path concern #328 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-329: Verify stale-path concern #329 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-330: Verify stale-path concern #330 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-331: Verify stale-path concern #331 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-332: Verify stale-path concern #332 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-333: Verify stale-path concern #333 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-334: Verify stale-path concern #334 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-335: Verify stale-path concern #335 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-336: Verify stale-path concern #336 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-337: Verify stale-path concern #337 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-338: Verify stale-path concern #338 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-339: Verify stale-path concern #339 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-340: Verify stale-path concern #340 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-341: Verify stale-path concern #341 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-342: Verify stale-path concern #342 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-343: Verify stale-path concern #343 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-344: Verify stale-path concern #344 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-345: Verify stale-path concern #345 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-346: Verify stale-path concern #346 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-347: Verify stale-path concern #347 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-348: Verify stale-path concern #348 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-349: Verify stale-path concern #349 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-350: Verify stale-path concern #350 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-351: Verify stale-path concern #351 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-352: Verify stale-path concern #352 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-353: Verify stale-path concern #353 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-354: Verify stale-path concern #354 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-355: Verify stale-path concern #355 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-356: Verify stale-path concern #356 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-357: Verify stale-path concern #357 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-358: Verify stale-path concern #358 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-359: Verify stale-path concern #359 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-360: Verify stale-path concern #360 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-361: Verify stale-path concern #361 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-362: Verify stale-path concern #362 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-363: Verify stale-path concern #363 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-364: Verify stale-path concern #364 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-365: Verify stale-path concern #365 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-366: Verify stale-path concern #366 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-367: Verify stale-path concern #367 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-368: Verify stale-path concern #368 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-369: Verify stale-path concern #369 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-370: Verify stale-path concern #370 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-371: Verify stale-path concern #371 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-372: Verify stale-path concern #372 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-373: Verify stale-path concern #373 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-374: Verify stale-path concern #374 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-375: Verify stale-path concern #375 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-376: Verify stale-path concern #376 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-377: Verify stale-path concern #377 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-378: Verify stale-path concern #378 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-379: Verify stale-path concern #379 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
- TM-380: Verify stale-path concern #380 against AGENTS/commands and apply exact one-line correction or explicit no-op justification before marking complete.
