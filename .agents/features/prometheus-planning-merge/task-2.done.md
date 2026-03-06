# Task 2: Enhance Phase 1 with Intent-Specific Interview

## Objective

Replace the current Phase 1 generic discovery conversation with intent-specific interview strategies from Prometheus. Add test infrastructure assessment and clearance check.

## Scope

### Files Touched
- `.opencode/commands/planning.md` — MODIFY (Phase 1 section, ~100 lines changed)

### What's Out of Scope
- Step 0/1 (done in Task 1)
- Phase 2 Oracle changes (Task 3)
- Phase 3 Metis (Task 4)
- Output format (Task 5)
- Self-review/Momus (Task 6)

### Dependencies
- Task 1 complete — Intent classification and draft management exist

---

## Prior Task Context

Task 1 added:
- Step 0: Intent Classification with 8 intent types
- Step 1: Draft Management with `planning-draft.md` pattern
- Phase 1 now has prerequisite note

Now Phase 1 needs to USE the intent classification to determine interview strategy.

---

## Context References

### Current Phase 1 (planning.md lines 33-64)

```markdown
## Phase 1: Understand (Discovery Conversation)

Start by understanding what the user wants to build. This is interactive — a conversation, not automation.

### Starting the conversation:
- Ask: "What are we building? Give me the short version."
- Listen, then ask 2-3 targeted follow-up questions:
  - "What's the most important thing this needs to do?"
  - "What existing code should this integrate with?"
  - "Any constraints or preferences on how to build it?"

If `$ARGUMENTS` is provided:
- Summarize what you understand from the feature name/description
- Ask: "This is about {purpose}. Does this match your thinking? Anything to add or change?"

Read these files for context (if they exist):
- `mvp.md` — product vision
- `PRD.md` (or similar) — product requirements
- `memory.md` — past decisions and gotchas

### Discovery Tools
Use these to explore the codebase during conversation:
- **Glob/Grep/Read** — find and read relevant files
- **Archon RAG** (if available) — search knowledge base for patterns and examples
- **WebFetch** — look up official docs for libraries/APIs in scope

### Checkpoints
After each major discovery, confirm:
- "Here's what I'm seeing — does this match your intent?"
- "I think we should approach it like X because Y. Sound right?"
- Keep confirmations SHORT — one sentence, not paragraphs.
```

### Prometheus Intent-Specific Strategies (prometheus/SKILL.md lines 60-145)

```markdown
### Trivial/Simple — Tiki-Taka (Rapid Back-and-Forth)
- Skip heavy exploration
- Ask smart questions (not "what do you want?")
- Propose, don't plan

### Refactoring — Safety Focus
**Pre-Interview Research:**
- Find all usages via lsp_find_references
- Find test coverage for behavior preservation

**Interview Focus:**
1. What specific behavior must be preserved?
2. What test commands verify current behavior?
3. What's the rollback strategy?
4. Should changes propagate or stay isolated?

### Build from Scratch — Discovery Focus
**Pre-Interview Research:**
- Find 2-3 similar implementations
- Find organizational conventions

**Interview Focus:**
1. Found pattern X. Should new code follow or deviate?
2. What should explicitly NOT be built? (boundaries)
3. Minimum viable version vs full vision?
4. Preferred libraries/approaches?

### Mid-sized Task — Boundary Focus
**Interview Focus:**
1. What are the EXACT outputs? (files, endpoints, UI)
2. What must NOT be included? (explicit exclusions)
3. What are hard boundaries? (no touching X, no changing Y)
4. How do we know it's done? (acceptance criteria)

### Architecture — Strategic Focus
**Research First:** Module boundaries, dependency direction, data flow
**Oracle Consultation:** Required
**Interview Focus:**
1. Expected lifespan of this design?
2. Scale/load to handle?
3. Non-negotiable constraints?
4. Existing systems to integrate?
```

### Prometheus Test Infrastructure (prometheus/SKILL.md lines 148-195)

```markdown
## Step 3: Test Infrastructure Assessment

**MANDATORY for Build and Refactor intents.**

### Step 3a: Detect Test Infrastructure
Ask: "Do you have test infrastructure set up?"
Or search automatically with explore agent.

### Step 3b: Ask the Test Question
**If infrastructure EXISTS:**
"I see test infrastructure ({framework}).
Should this work include automated tests?
- TDD: Tests written first
- Tests-after: Tests added after implementation
- None: No unit/integration tests"

**If infrastructure DOES NOT exist:**
"No test infrastructure detected.
Would you like to set up testing?
- YES: Include test infrastructure setup
- NO: Proceed without unit tests"

### Step 3c: Record Decision
Add to draft: Test Strategy section
```

### Prometheus Clearance Check (prometheus/SKILL.md lines 217-238)

```markdown
## Step 5: Clearance Check

After interview, before plan generation:

## Interview Clearance Check

**Discussed**:
- [x] {topic 1}
- [x] {topic 2}
- [x] Test strategy
- [x] Scope boundaries

**Auto-Resolved** (sensible defaults applied):
- {default 1}
- {default 2}

**Ready for Plan Generation?**
- YES: All requirements clear → proceed to Phase 2
- NEEDS INPUT: {specific question} → wait for answer
```

---

## Patterns to Follow

### Pattern: Intent-Driven Phase 1 Structure

```markdown
## Phase 1: Discovery (Intent-Specific Interview)

> **Prerequisite**: Steps 0-1 complete

### 1a. Intent-Specific Pre-Interview Research

{Launch explore agents based on intent BEFORE asking questions}

### 1b. Intent-Specific Interview

{Different question sets per intent type}

### 1c. Test Infrastructure Assessment

{Detect and ask about testing strategy}

### 1d. Context File Reading

{Read mvp.md, PRD.md, memory.md}

### 1e. Checkpoints

{Confirm understanding}

### 1f. Clearance Check

{Gate before Phase 2}
```

---

## Step-by-Step Tasks

### Step 2.1: Replace Phase 1 Header and Add Sub-Sections

**IMPLEMENT**: Replace current Phase 1 content with new structure

**Current** (lines 33-64):
```markdown
## Phase 1: Understand (Discovery Conversation)

Start by understanding what the user wants to build...
```

**Replace with**:
```markdown
## Phase 1: Discovery (Intent-Specific Interview)

> **Prerequisite**: Steps 0-1 complete (intent classified, draft initialized)

Phase 1 adapts to the classified intent. The interview strategy, pre-research, and questions all change based on intent type.

### 1a. Pre-Interview Research (Intent-Specific)

**Launch research agents BEFORE asking questions.** The intent determines what to search for.

#### Trivial / Simple
No pre-research needed. Proceed directly to interview.

#### Refactoring
```typescript
// Find all usages to understand impact scope
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Map refactoring impact",
  prompt=`Find all usages of the code being refactored via references.
  Map: call sites, return value consumers, type dependencies.
  Identify: dynamic access patterns that won't show in static analysis.
  Return: file paths, usage patterns, risk level per call site.`
)

// Find test coverage
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find test coverage for refactoring",
  prompt=`Find all tests exercising the code being refactored.
  Map: what each test asserts, inputs used, public API vs internals.
  Identify: coverage gaps.
  Return: test file paths, coverage assessment.`
)
```

#### Build from Scratch
```typescript
// Find similar implementations for patterns
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find similar implementations",
  prompt=`Find 2-3 similar implementations in the codebase.
  Look for: directory structure, naming conventions, exports, shared utilities,
  error handling patterns, registration steps.
  Return: file paths with pattern descriptions.`
)

// Find organizational conventions
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find organizational conventions",
  prompt=`Find how similar features are organized.
  Look for: nesting depth, index.ts barrels, types conventions,
  test placement, registration patterns.
  Return: canonical structure recommendation.`
)

// Find external docs if new technology
task(
  subagent_type="librarian",
  run_in_background=true,
  load_skills=[],
  description="Find external documentation",
  prompt=`Find official documentation for {technology}.
  Look for: setup guides, project structure, API reference, pitfalls.
  Skip basic tutorials — need production patterns.
  Return: key documentation excerpts.`
)
```

#### Architecture
```typescript
// Map existing architecture
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Map existing architecture",
  prompt=`Map the current architecture.
  Find: module boundaries, dependency direction, data flow, key abstractions, ADRs.
  Identify: circular dependencies, coupling hotspots.
  Return: architecture overview with dependency graph.`
)

// Find architectural patterns
task(
  subagent_type="librarian",
  run_in_background=true,
  load_skills=[],
  description="Find architectural patterns",
  prompt=`Find proven patterns for {architecture domain}.
  Look for: scalability trade-offs, common failure modes, case studies.
  Skip generic patterns — need domain-specific guidance.
  Return: pattern recommendations with rationale.`
)
```

#### Mid-sized / Collaborative / Research
Standard explore agent for codebase patterns (covered in Phase 2).

---

### 1b. Intent-Specific Interview

**Questions adapt to intent type.** Use research findings to inform questions.

#### Trivial
```
Quick confirm: {summarize the obvious fix}
Anything else to consider, or should I proceed?
```

#### Simple
```
1. Scope boundary: Should this include {adjacent concern} or stay focused on {core}?
2. Integration: Any existing code this needs to work with?
```

#### Refactoring
```
1. Behavior preservation: What specific behavior MUST stay identical?
2. Test verification: What command verifies current behavior works?
3. Rollback strategy: If this goes wrong, how do we revert?
4. Propagation: Should changes stay isolated or propagate to callers?
```

#### Build from Scratch
```
I found pattern {X} in {similar file}. Questions:
1. Should new code follow this pattern or deviate? Why?
2. What should explicitly NOT be built? (scope boundaries)
3. MVP vs full vision: What's the minimum useful version?
4. Any preferred libraries or approaches?
```

#### Mid-sized
```
1. Exact outputs: What files/endpoints/UI will this create?
2. Explicit exclusions: What must NOT be included?
3. Hard boundaries: What existing code must NOT be touched?
4. Done criteria: How will we know this is complete?
```

#### Collaborative
```
Let's explore together. Starting point:
- What's the core problem you're trying to solve?
- What have you already tried or considered?
- What feels unclear right now?
```

#### Architecture
```
1. Lifespan: How long should this design last? (months/years)
2. Scale: What load/scale does this need to handle?
3. Constraints: What's absolutely non-negotiable?
4. Integration: What existing systems must this work with?

Note: Oracle consultation is required in Phase 3 for Architecture intent.
```

#### Research
```
1. Goal: What specific question are we trying to answer?
2. Exit criteria: How will we know we've found the answer?
3. Constraints: Any paths we should NOT explore?
4. Time box: How much time should we spend before deciding?
```

---

### 1c. Test Infrastructure Assessment

**Run for ALL intents.** Testing strategy affects plan output.

#### Detect Test Infrastructure

```typescript
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Detect test infrastructure",
  prompt=`Assess test infrastructure in this project.
  Find: test framework (jest/vitest/pytest/etc), test patterns, coverage config, CI integration.
  Return: YES/NO per capability with examples.`
)
```

#### Ask Test Strategy Question

**If infrastructure EXISTS:**
```
I see test infrastructure ({framework}).

Should this work include automated tests?
- **TDD**: Tests written first, then implementation
- **Tests-after**: Tests added after implementation  
- **None**: No unit/integration tests for this work

Regardless of choice, every task includes agent-executed QA scenarios.
```

**If infrastructure DOES NOT exist:**
```
No test infrastructure detected.

Would you like to set up testing as part of this work?
- **YES**: Include test infrastructure setup in the plan
- **NO**: Proceed without unit tests

Either way, agent-executed QA scenarios verify each deliverable.
```

#### Record Decision

Update draft with test strategy:
```markdown
## Test Strategy
- **Infrastructure**: EXISTS / NOT_FOUND
- **Approach**: TDD / TESTS_AFTER / NONE
- **Framework**: {detected or chosen}
```

---

### 1d. Context File Reading

Read these files for additional context (if they exist):
- `mvp.md` — product vision
- `PRD.md` (or similar) — product requirements  
- `memory.md` — past decisions and gotchas
- `.agents/wisdom/{feature}/` — accumulated wisdom

Share relevant findings: "From memory.md, I see a past decision about {X}..."

---

### 1e. Checkpoints

After each major discovery or decision:
- "Here's what I'm seeing — does this match your intent?"
- "I think we should approach it like X because Y. Sound right?"

Keep confirmations SHORT — one sentence, not paragraphs.

Update draft after each checkpoint.

---

### 1f. Clearance Check

**Gate before Phase 2.** Do not proceed until clearance passes.

```
## Phase 1 Clearance Check

**Discussed:**
- [x] Intent: {classified intent}
- [x] Scope: {what's in/out}
- [x] Test strategy: {TDD/Tests-after/None}
- [x] Key constraints: {boundaries}

**Auto-resolved (sensible defaults):**
- {any assumptions made}

**Ready for Phase 2 (Research)?**
```

If anything is unclear, ask before proceeding.
If user confirms, move to Phase 2.
```

**VALIDATE**: Phase 1 now has 6 sub-sections (1a-1f)

---

## Testing Strategy

### Manual Verification

1. Run `/planning refactor-auth` and verify:
   - Refactoring-specific pre-research launches
   - Refactoring-specific questions asked
   - Test infrastructure detected
   - Clearance check runs

2. Run `/planning build-new-feature` and verify:
   - Build-specific pre-research launches
   - Pattern discovery questions asked

### Syntax Check

```bash
grep -n "### 1a\." .opencode/commands/planning.md
grep -n "### 1b\." .opencode/commands/planning.md
grep -n "### 1c\." .opencode/commands/planning.md
grep -n "### 1d\." .opencode/commands/planning.md
grep -n "### 1e\." .opencode/commands/planning.md
grep -n "### 1f\." .opencode/commands/planning.md
```

---

## Validation Commands

```bash
# Verify Phase 1 restructured
grep -c "### 1[a-f]\." .opencode/commands/planning.md
# Should return 6

# Verify intent-specific content
grep -n "Refactoring" .opencode/commands/planning.md | head -5
grep -n "Build from Scratch" .opencode/commands/planning.md | head -5
```

---

## Acceptance Criteria

### Implementation
- [ ] Phase 1 has 6 sub-sections (1a-1f)
- [ ] Pre-interview research is intent-specific
- [ ] Interview questions are intent-specific
- [ ] Test infrastructure assessment included
- [ ] Context file reading preserved
- [ ] Checkpoints preserved
- [ ] Clearance check gates Phase 2

### Intent Coverage
- [ ] Trivial strategy defined
- [ ] Simple strategy defined
- [ ] Refactoring strategy defined (with pre-research)
- [ ] Build from Scratch strategy defined (with pre-research)
- [ ] Mid-sized strategy defined
- [ ] Collaborative strategy defined
- [ ] Architecture strategy defined (notes Oracle required)
- [ ] Research strategy defined

---

## Handoff Notes

Task 2 makes Phase 1 intent-aware. Key changes:
- Pre-research now launches BEFORE questions
- Questions adapt to intent type
- Test strategy is explicitly captured
- Clearance check gates Phase 2

Task 3 will add Oracle consultation in Phase 2 for Architecture intent.
Task 4 will add Metis consultation in Phase 3.

---

## Completion Checklist

- [ ] Phase 1 has 6 sub-sections
- [ ] All 8 intents have pre-research defined
- [ ] All 8 intents have interview questions defined
- [ ] Test infrastructure assessment included
- [ ] Clearance check included
- [ ] Draft update reminders included
