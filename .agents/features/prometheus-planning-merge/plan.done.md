# Prometheus-Planning Merge

## Feature Description

Merge the Prometheus interview-mode planning methodology into `/planning`, creating a single unified planning command that leverages the full orchestrator capabilities. The merged command will use all specialized agents (prometheus interview strategies, explore, librarian, metis, momus, oracle) while preserving /planning's rigorous output format (700-1000 line plans, task briefs, master/sub-plan modes).

## User Story

As a developer using this AI coding system, I want a single `/planning` command that:
- Classifies my intent and adapts interview strategy accordingly
- Persists drafts across sessions so I don't lose context
- Detects test infrastructure and asks about test strategy
- Uses Metis to catch blind spots before finalizing
- Optionally uses Momus for high-accuracy review
- Produces detailed, self-contained task briefs

## Problem Statement

Currently two parallel planning systems exist:
- `/planning` — Has rigorous Phase 3 design process and detailed output format, but lacks intent classification, draft persistence, Metis/Momus integration
- `/prometheus` — Has sophisticated 11-step interview workflow with agent orchestration, but different output format and no master/sub-plan support

Users must choose between them. The system's orchestration capabilities are underutilized.

## Solution Statement

Merge Prometheus capabilities INTO /planning:
1. Add intent classification (Step 0) to determine interview strategy
2. Add draft management for session persistence
3. Enhance Phase 1 with intent-specific interview strategies
4. Add test infrastructure assessment to Phase 1
5. Add clearance check before Phase 2
6. Add Metis consultation to Phase 3 (after decompose)
7. Keep Phase 3 structured blocks (SYNTHESIS, ANALYSIS, APPROACH, DECOMPOSITION)
8. Keep Phase 4 preview format
9. Keep Phase 5 output format (700-1000 line plans, task briefs, master/sub-plan)
10. Add QA scenarios to task brief template
11. Add parallelization info (Wave N, blocks/blocked-by) to task format
12. Add Phase 6: Self-review with gap classification
13. Add Phase 7: Present summary + optional Momus review
14. Deprecate `/prometheus` command

---

## Feature Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | prometheus-planning-merge |
| **Complexity** | High — merging two 500+ line command files |
| **Estimated Tasks** | 6 |
| **Mode** | Task Briefs |
| **Risk Level** | Medium — must preserve both systems' strengths |

---

## Context References

### Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `.opencode/commands/planning.md` | 663 | Current planning command — MODIFY |
| `.opencode/commands/prometheus/SKILL.md` | 552 | Prometheus workflow — SOURCE for merge |
| `.opencode/agents/prometheus/SKILL.md` | 166 | Prometheus agent skill — KEEP |
| `.opencode/agents/metis/SKILL.md` | — | Metis agent — REFERENCE |
| `.opencode/agents/momus/SKILL.md` | — | Momus agent — REFERENCE |

### Key Patterns

#### Intent Classification (from Prometheus Step 0)

```markdown
| Intent | Signal | Interview Strategy |
|--------|--------|-------------------|
| **Trivial** | Single file, <10 lines, obvious fix | Quick confirm |
| **Simple** | 1-2 files, clear scope, <30 min | 1-2 questions |
| **Refactoring** | "refactor", "restructure" | Safety focus: tests, rollback |
| **Build from Scratch** | New feature, greenfield | Discovery focus: patterns first |
| **Mid-sized** | Scoped feature, clear boundaries | Boundary focus: deliverables, exclusions |
| **Collaborative** | "let's figure out", "help me plan" | Dialogue focus |
| **Architecture** | System design, infrastructure | Strategic focus: Oracle required |
| **Research** | Goal exists, path unclear | Investigation focus |
```

#### Draft Management (from Prometheus Steps 1, 4)

```markdown
Draft file: `.agents/features/{feature}/planning-draft.md`

If exists:
  - Read draft to restore context
  - Present: "Continuing from our previous discussion..."
  - Ask: "Ready to continue, or start fresh?"

If not exists:
  - Create directory and draft
  - Begin discovery

After every meaningful exchange:
  - Update draft with new information
```

#### Test Infrastructure Assessment (from Prometheus Step 3)

```markdown
1. Detect test infrastructure:
   task(subagent_type="explore", prompt="Find test framework, patterns, coverage config...")

2. Ask test strategy question:
   - If infrastructure exists: "TDD / Tests-after / None?"
   - If not exists: "Set up testing? YES / NO"

3. Record decision in draft
```

#### Metis Consultation (from Prometheus Step 6)

```typescript
task(
  subagent_type="metis",
  load_skills=[],
  prompt=`Review this planning session before I generate the work plan:
  
  **User's Goal**: {summarize}
  **What We Discussed**: {key points}
  **My Understanding**: {interpretation}
  **Research Findings**: {discoveries}
  
  Identify:
  1. Questions I should have asked but didn't
  2. Guardrails that need to be explicitly set
  3. Potential scope creep areas
  4. Assumptions needing validation
  5. Missing acceptance criteria
  6. Edge cases not addressed`,
  run_in_background=false
)
```

#### Self-Review (from Prometheus Step 8)

```markdown
| Gap Type | Action |
|----------|--------|
| CRITICAL | Ask user immediately |
| MINOR | Fix silently, note in summary |
| AMBIGUOUS | Apply default, disclose in summary |

Checklist:
□ All TODOs have acceptance criteria?
□ All file references exist?
□ No assumptions without evidence?
□ Guardrails from Metis incorporated?
□ Scope boundaries clearly defined?
□ Every task has QA scenarios?
```

#### Momus Review (from Prometheus Step 10)

```typescript
task(
  subagent_type="momus",
  load_skills=[],
  prompt=`Review this plan for clarity, verifiability, and completeness:
  
  **Plan**: .agents/features/{name}/plan.md
  
  Check:
  1. Every TODO has clear acceptance criteria
  2. Every "Must Have" is verifiable
  3. Every QA scenario is specific
  4. No gaps in dependencies
  5. Scope is bounded
  
  Reject if:
  - Acceptance criteria requires human judgment
  - QA scenarios use vague language
  - Dependencies are implicit
  - Guardrails are missing`,
  run_in_background=false
)
```

---

## The Merged Structure

```
/planning {feature}
    │
    ├─► Step 0: Intent Classification
    │       └─► Classify: Trivial|Simple|Refactoring|Build|Mid-sized|Collaborative|Architecture|Research
    │       └─► Announce classification to user
    │
    ├─► Step 1: Draft Management  
    │       └─► Check/create .agents/features/{feature}/planning-draft.md
    │       └─► Restore context if continuing
    │
    ├─► Phase 1: Discovery (Intent-Specific Interview)
    │       ├─► 1a. Intent-specific questions (safety/discovery/boundary/strategic focus)
    │       ├─► 1b. Test infrastructure assessment
    │       ├─► 1c. Read context files (mvp.md, PRD.md, memory.md)
    │       ├─► 1d. Checkpoints with user
    │       └─► 1e. Clearance check before proceeding
    │
    ├─► Phase 2: Research (Parallel Agent Delegation)
    │       ├─► 2a. explore agent — codebase patterns (intent-specific prompt)
    │       ├─► 2b. librarian agent — Archon knowledge base
    │       ├─► 2c. librarian agent — external docs
    │       ├─► 2d. explore agent — past plans
    │       ├─► 2e. oracle agent — if Architecture intent (REQUIRED)
    │       └─► 2f. Synthesize findings
    │
    ├─► Phase 3: Design (Structured Reasoning)
    │       ├─► 3a. Synthesize — SYNTHESIS block
    │       ├─► 3b. Analyze — ANALYSIS block (dependency graph, risks, failure modes)
    │       ├─► 3c. Decide — APPROACH DECISION block
    │       ├─► 3d. Decompose — TASK DECOMPOSITION block (with parallelization: Wave N, blocks/blocked-by)
    │       └─► 3e. Metis Consultation — gap analysis before preview
    │
    ├─► Phase 4: Preview (Approval Gate)
    │       └─► 1-page preview with Metis findings incorporated
    │       └─► User approval required
    │
    ├─► Phase 5: Write Plan
    │       ├─► 5a. Write plan.md (700-1000 lines) with QA scenarios
    │       ├─► 5b. Write task-N.md briefs (700-1000 lines each) with QA scenarios
    │       ├─► OR Master + Sub-Plan mode for complex features
    │       └─► 5c. Archon sync if connected
    │
    ├─► Phase 6: Self-Review
    │       ├─► Gap classification: CRITICAL | MINOR | AMBIGUOUS
    │       ├─► Self-review checklist
    │       └─► Fix MINOR/AMBIGUOUS, ask user about CRITICAL
    │
    ├─► Phase 7: Present + Optional Momus Review
    │       ├─► Present summary with key decisions, scope, guardrails, auto-resolved items
    │       ├─► Offer: "High Accuracy Review? Have Momus verify every detail."
    │       └─► If yes: Momus review, iterate until APPROVE
    │
    └─► Cleanup + Pipeline Handoff
            ├─► Delete planning-draft.md
            └─► Write next-command.md
```

---

## Implementation Plan

### Task 1: Add Intent Classification and Draft Management

**Scope**: Add Step 0 (Intent Classification) and Step 1 (Draft Management) to planning.md

**Files**: `.opencode/commands/planning.md`

**What to add**:
- New "Step 0: Intent Classification" section with 8 intent types
- New "Step 1: Draft Management" section with draft file pattern
- Intent announcement to user

### Task 2: Enhance Phase 1 with Intent-Specific Interview

**Scope**: Replace current Phase 1 with intent-specific interview strategies

**Files**: `.opencode/commands/planning.md`

**What to change**:
- Add intent-specific question strategies (8 strategies from Prometheus)
- Add test infrastructure assessment (Step 3 from Prometheus)
- Add clearance check at end of Phase 1

### Task 3: Enhance Phase 2 with Oracle for Architecture

**Scope**: Add mandatory Oracle consultation for Architecture intent

**Files**: `.opencode/commands/planning.md`

**What to add**:
- New "2e. Oracle consultation" for Architecture intent
- Mark as REQUIRED when intent = Architecture

### Task 4: Add Metis Consultation to Phase 3

**Scope**: Add Phase 3e Metis consultation after Decompose

**Files**: `.opencode/commands/planning.md`

**What to add**:
- New "3e. Metis Consultation" section
- Task invocation template
- Integration with Phase 4 preview (show Metis findings)

### Task 5: Add QA Scenarios and Parallelization to Plan Output

**Scope**: Enhance Phase 5 task brief format

**Files**: `.opencode/commands/planning.md`

**What to add**:
- QA Scenarios section in task brief template
- Parallelization fields (Wave N, blocks, blocked-by)
- Evidence collection pattern

### Task 6: Add Self-Review and Momus Review Phases

**Scope**: Add Phase 6 (Self-Review) and Phase 7 (Present + Momus)

**Files**: `.opencode/commands/planning.md`

**What to add**:
- New "Phase 6: Self-Review" section with gap classification
- New "Phase 7: Present + Optional Momus Review" section
- Cleanup step (delete draft)
- Update pipeline handoff

---

## Testing Strategy

### Manual Verification

1. Run `/planning test-feature` and verify:
   - Intent classification appears
   - Draft file created
   - Intent-specific questions asked
   - Test infrastructure detected
   - Clearance check before Phase 2
   - Metis consulted in Phase 3
   - Self-review runs
   - Momus offered

2. Test each intent type:
   - Trivial: "fix typo in login.tsx"
   - Refactoring: "refactor the auth module"
   - Architecture: "design the event system"
   - etc.

3. Test draft persistence:
   - Start planning, interrupt mid-session
   - Resume with same feature name
   - Verify context restored

### Acceptance Criteria

- [ ] Intent classification runs on every /planning invocation
- [ ] Draft file created at `.agents/features/{feature}/planning-draft.md`
- [ ] Intent-specific interview strategy used
- [ ] Test infrastructure assessment runs
- [ ] Clearance check gates Phase 2
- [ ] Oracle consulted for Architecture intent
- [ ] Metis consulted after Phase 3d
- [ ] Plan output includes QA scenarios
- [ ] Task decomposition includes parallelization info
- [ ] Self-review runs after plan write
- [ ] Momus review offered
- [ ] Draft cleaned up after completion
- [ ] /prometheus command marked deprecated (or deleted)

---

## Validation Commands

```bash
# Verify planning.md updated
wc -l .opencode/commands/planning.md
# Should be ~900-1000 lines (up from 663)

# Verify new sections exist
grep -n "Intent Classification" .opencode/commands/planning.md
grep -n "Draft Management" .opencode/commands/planning.md
grep -n "Metis Consultation" .opencode/commands/planning.md
grep -n "Self-Review" .opencode/commands/planning.md
grep -n "Momus Review" .opencode/commands/planning.md

# Verify agent invocations
grep -n "subagent_type=\"metis\"" .opencode/commands/planning.md
grep -n "subagent_type=\"momus\"" .opencode/commands/planning.md
grep -n "subagent_type=\"oracle\"" .opencode/commands/planning.md
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Merged file too complex | Medium | Medium | Clear section headers, progressive disclosure |
| Agent orchestration slow | Low | Medium | Parallel execution where possible |
| Breaking existing plans | Low | High | Keep output format identical |
| User overwhelmed by phases | Medium | Low | Clear progress indicators |

---

## Notes

- The merged /planning will be ~900-1000 lines — this is acceptable for a command that does this much
- Draft file uses `planning-draft.md` (not `prometheus-draft.md`) for clean naming
- All features get full process — no fast-pathing for simple tasks
- /prometheus command should be deprecated or deleted after merge

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Add Intent Classification + Draft Management | pending | 1 modified |
| 2 | `task-2.md` | Enhance Phase 1 with intent-specific interview | pending | 1 modified |
| 3 | `task-3.md` | Add Oracle consultation for Architecture intent | pending | 1 modified |
| 4 | `task-4.md` | Add Metis consultation to Phase 3 | pending | 1 modified |
| 5 | `task-5.md` | Add QA scenarios + parallelization to output | pending | 1 modified |
| 6 | `task-6.md` | Add Self-Review + Momus Review phases | pending | 1 modified |
