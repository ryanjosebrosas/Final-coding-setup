# Phase 6: Validation + Documentation — Task Brief

## Feature Description

Validate all integrated components through integration tests, ensure the pipeline works end-to-end, and document the new capabilities in README.md and AGENTS.md.

## User Story

As a user, I want confidence that the integrated system works correctly and documentation to understand the new capabilities.

## Problem Statement

After Phases 1-5:
1. **No integration tests** — Components tested in isolation, not together
2. **No end-to-end validation** — Pipeline not tested from `/prime` to `/commit`
3. **Documentation outdated** — README and AGENTS.md don't reflect new capabilities
4. **No usage guide** — Developers don't know how to use new features

## Solution Statement

Write integration tests for agent dispatch, hook execution, category routing, and command flow. Run full pipeline validation from `/prime` through `/commit`. Update README.md with usage guide and AGENTS.md with new agent table.

## Feature Metadata

- **Depth**: standard
- **Dependencies**: Phase 1-5
- **Estimated tasks**: 10
- **Priority**: MUST complete before release

---

## Context References

### Target Files
- `.opencode/tests/integration/` — Integration tests
- `README.md` — Usage guide
- `AGENTS.md` — Agent table update

---

## Key Decisions

1. **Test Scope**: Integration tests, not unit tests (unit tests in each phase)
2. **Pipeline Coverage**: Full `/prime` → `/commit` flow
3. **Documentation Focus**: Usage guide, not internals

---

## Step-by-Step Tasks

### Integration Tests (Tasks 1-6)

#### Task 1: Create Agent Dispatch Integration Test
- **ACTION**: CREATE
- **TARGET**: `.opencode/tests/integration/agent-dispatch.test.ts`
- **IMPLEMENT**: Test full agent dispatch flow with category + skills
- **TESTS**:
  - Dispatch with category routes correctly
  - Dispatch with load_skills injects skill content
  - Dispatch with session_id continues conversation
- **VALIDATE**: `bun test --grep "agent dispatch"` passes

#### Task 2: Create Hook Execution Integration Test
- **ACTION**: CREATE
- **TARGET**: `.opencode/tests/integration/hooks.test.ts`
- **IMPLEMENT**: Test hook execution in correct tier order
- **TESTS**:
  - todo-continuation fires on incomplete todos
  - atlas reads boulder.json correctly
  - session-recovery restores state
- **VALIDATE**: `bun test --grep "hooks"` passes

#### Task 3: Create Category Routing Integration Test
- **ACTION**: CREATE
- **TARGET**: `.opencode/tests/integration/categories.test.ts`
- **IMPLEMENT**: Test category routing and model resolution
- **TESTS**:
  - visual-engineering routes to Gemini 3 Pro
  - quick includes caller warning
  - unspecified-low validates scope
- **VALIDATE**: `bun test --grep "categories"` passes

#### Task 4: Create Command Flow Integration Test
- **ACTION**: CREATE
- **TARGET**: `.opencode/tests/integration/commands.test.ts`
- **IMPLEMENT**: Test command workflow
- **TESTS**:
  - `/prometheus` enters interview mode
  - `/start-work` reads plan and executes
  - `/prime` loads wisdom
- **VALIDATE**: `bun test --grep "commands"` passes

#### Task 5: Create Wisdom Accumulation Integration Test
- **ACTION**: CREATE
- **TARGET**: `.opencode/tests/integration/wisdom.test.ts`
- **IMPLEMENT**: Test wisdom flow across tasks
- **TESTS**:
  - Wisdom extracted after task
  - Wisdom categorized correctly
  - Wisdom injected on next task
- **VALIDATE**: `bun test --grep "wisdom"` passes

#### Task 6: Create Full Pipeline Integration Test
- **ACTION**: CREATE
- **TARGET**: `.opencode/tests/integration/pipeline.test.ts`
- **IMPLEMENT**: Test full pipeline `/prime` → `/commit`
- **TESTS**:
  - Prime loads context correctly
  - Planning creates valid plan
  - Execute runs tasks
  - Commit creates valid commit
- **VALIDATE**: `bun test --grep "pipeline"` passes

---

### Documentation (Tasks 7-10)

#### Task 7: Update README.md
- **ACTION**: UPDATE
- **TARGET**: `README.md`
- **IMPLEMENT**: Add OhMyOpenCode integration section
- **CONTENT**:
  - New capabilities (agents, categories, hooks)
  - Usage examples
  - Command reference
  - Configuration guide
- **VALIDATE**: README renders correctly

#### Task 8: Update AGENTS.md Agent Table
- **ACTION**: UPDATE
- **TARGET**: `AGENTS.md`
- **IMPLEMENT**: Add table of all 11 agents with models and use cases
- **CONTENT**:
  - Agent name, model, temperature, mode, purpose
  - When to use each agent
  - Delegation patterns
- **VALIDATE**: Table renders correctly

#### Task 9: Create INTEGRATION.md
- **ACTION**: CREATE
- **TARGET**: `.opencode/INTEGRATION.md`
- **IMPLEMENT**: Usage guide for integrated features
- **CONTENT**:
  - How to use categories
  - How to load skills
  - How to use new commands
  - How hooks work
  - Wisdom accumulation flow
- **VALIDATE**: Document is clear and complete

#### Task 10: Update CLAUDE.md and .claude/commands
- **ACTION**: UPDATE
- **TARGET**: `CLAUDE.md` and `.claude/commands/`
- **IMPLEMENT**: Mirror updates from `.opencode/` in Claude-compatible format
- **VALIDATE**: Both frameworks updated consistently

---

## Testing Strategy

### Integration Test Commands
```bash
# Run all integration tests
bun test --grep "integration"

# Run specific test suites
bun test --grep "agent dispatch"
bun test --grep "hooks"
bun test --grep "categories"
bun test --grep "commands"
bun test --grep "wisdom"
bun test --grep "pipeline"
```

### Documentation Review
- All links work
- Code examples are correct
- Command reference is complete

---

## Acceptance Criteria

### Implementation
- [ ] All 6 integration test files created
- [ ] All integration tests pass
- [ ] README.md updated with integration section
- [ ] AGENTS.md updated with agent table
- [ ] INTEGRATION.md created
- [ ] CLAUDE.md mirrored updates

### Runtime
- [ ] Full pipeline test passes
- [ ] Documentation is accurate and complete
- [ ] No breaking changes to existing pipeline

---

## Notes

- **Key decision**: Integration tests, not unit tests
- **Risk**: Test flakiness in complex integration
- **Mitigation**: Mock external dependencies, use timeouts
- **Confidence**: 9/10 — Straightforward validation