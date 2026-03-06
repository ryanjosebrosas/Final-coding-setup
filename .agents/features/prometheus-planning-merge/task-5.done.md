# Task 5: Add QA Scenarios and Parallelization to Plan Output

## Objective

Enhance Phase 5 task brief format to include QA scenarios and parallelization information (Wave N, blocks/blocked-by).

## Scope

### Files Touched
- `.opencode/commands/planning.md` — MODIFY (Phase 5 section, ~60 lines added/modified)

### Dependencies
- Tasks 1-4 complete

---

## Prior Task Context

Phase 5 currently defines task brief format with these required sections:
- Objective, Scope, Prior Task Context, Context References, Patterns to Follow
- Step-by-Step Tasks, Testing Strategy, Validation Commands
- Acceptance Criteria, Handoff Notes, Completion Checklist

Need to add:
- QA Scenarios (agent-executed verification)
- Parallelization info (Wave N, blocks, blocked-by)

---

## Step-by-Step Tasks

### Step 5.1: Add QA Scenarios to Task Brief Template

**IMPLEMENT**: In "Required sections per task brief" (around line 469), add QA Scenarios:

```markdown
**Required sections per task brief:**
- Objective (one sentence — the test for "done")
- Scope (files touched, what's out of scope, dependencies)
- Prior Task Context (what was done in task N-1; "None" for task 1)
- Context References (files to read with line ranges AND full content pasted inline)
- Patterns to Follow (complete code snippets from the codebase)
- Step-by-Step Tasks (each step: IMPLEMENT, PATTERN, GOTCHA, VALIDATE)
- Testing Strategy (unit, integration, edge cases)
- **QA Scenarios** (agent-executed verification — NEW)
- Validation Commands (L1–L5, each level filled or explicitly "N/A")
- Acceptance Criteria (Implementation + Runtime checkboxes)
- **Parallelization** (Wave N, blocks, blocked-by — NEW)
- Handoff Notes (what task N+1 needs to know)
- Completion Checklist
```

### Step 5.2: Define QA Scenarios Format

**IMPLEMENT**: Add QA Scenarios section definition after Testing Strategy:

```markdown
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
```

### Step 5.3: Define Parallelization Format

**IMPLEMENT**: Add Parallelization section definition:

```markdown
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
```

### Step 5.4: Update 7-Field Task Format

**IMPLEMENT**: Expand the 7-Field Task Format table to include new fields:

```markdown
## The Task Format

Every task in a plan MUST include these fields:

| Field | Purpose | Example |
|-------|---------|---------|
| **ACTION** | What operation | CREATE / UPDATE / ADD / REMOVE / REFACTOR |
| **TARGET** | Specific file path | `src/services/auth.ts` |
| **IMPLEMENT** | Code-level detail | "Class AuthService with methods: login(), logout()" |
| **PATTERN** | Reference pattern | "Follow pattern in `src/services/user.ts:45-62`" |
| **IMPORTS** | Exact imports | Copy-paste ready import statements |
| **GOTCHA** | Known pitfalls | "Must use async/await — database client is async-only" |
| **VALIDATE** | Verification command | `npm test -- --grep "auth"` |
| **QA** | Agent verification | "Run login flow, verify token returned" |
| **WAVE** | Parallelization | "Wave 2, Blocked By: Task 1" |
```

### Step 5.5: Update Decompose Block in Phase 3d

**IMPLEMENT**: In Phase 3d TASK DECOMPOSITION block, add parallelization:

```markdown
```
TASK DECOMPOSITION
==================
Total tasks: {N}
Split rationale: {why N tasks}

Parallelization Plan:
  Wave 1: Tasks {list} — no dependencies, can start immediately
  Wave 2: Tasks {list} — depends on Wave 1 completing
  Wave 3: Tasks {list} — depends on Wave 2 completing
  Parallel within waves: {which tasks can run simultaneously}

Task 1: {name}
  Target file: {path}
  Why separate: {boundary reasoning}
  Depends on: nothing (first task)
  Blocks: Tasks {N, M}
  Wave: 1
  Scope: {1-2 sentences}

Task 2: {name}
  Target file: {path}
  Why separate: {boundary reasoning}
  Depends on: Task 1 ({specific dependency})
  Blocks: Tasks {N}
  Wave: 2
  Scope: {1-2 sentences}

... (continue for all tasks)

Order rationale: {why this order, referencing dependency graph}
Confidence: {X}/10
```
```

---

## Validation Commands

```bash
# Verify QA Scenarios added
grep -n "QA Scenarios" .opencode/commands/planning.md

# Verify Parallelization added
grep -n "Parallelization" .opencode/commands/planning.md
grep -n "Wave" .opencode/commands/planning.md

# Verify task format updated
grep -n "WAVE" .opencode/commands/planning.md
```

---

## Acceptance Criteria

- [ ] QA Scenarios section defined in task brief requirements
- [ ] QA format specified (Tool, Steps, Expected, Evidence)
- [ ] Parallelization section defined in task brief requirements
- [ ] Parallelization format specified (Wave, Can Parallel, Blocks, Blocked By)
- [ ] Task format table updated with QA and WAVE fields
- [ ] Phase 3d Decompose block includes parallelization plan
- [ ] Evidence directory pattern defined

---

## Completion Checklist

- [ ] QA Scenarios format documented
- [ ] Parallelization format documented
- [ ] Task format table expanded
- [ ] Decompose block updated
- [ ] Evidence collection pattern defined
