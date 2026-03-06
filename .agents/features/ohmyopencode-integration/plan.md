# OhMyOpenCode Integration — Implementation Plan

**Created**: 2026-03-06  
**Feature**: ohmyopencode-integration  
**Depth**: heavy  
**Estimated Duration**: 3-4 weeks (19-28 days)

---

## Executive Summary

This plan integrates the complete OhMyOpenCode package (11 agents, 46 hooks, 8 categories, skills system, wisdom accumulation) into the existing `.opencode` framework through a 6-phase implementation.

**Key Deliverables**:
- Enhanced AGENTS.md with Sisyphus behavior patterns
- Category + Skill dispatch system
- 11 specialized agent definitions
- 46 lifecycle hooks for completion guarantees
- Planning commands (`/prometheus`, `/start-work`, `/ultrawork`)
- Wisdom accumulation system

---

## Phases Overview

| Phase | Name | Duration | Tasks | Dependencies |
|-------|------|----------|-------|--------------|
| **1** | AGENTS.md Behavior | 2-3 days | 10 | None |
| **2** | Category + Skill Dispatch | 3-5 days | 15 | Phase 1 |
| **3** | Core Agent Definitions | 5-7 days | 25 | Phase 1, 2 |
| **4** | Lifecycle Hooks | 5-7 days | 20 | Phase 1-3 |
| **5** | Commands + Wisdom | 5-7 days | 15 | Phase 1-4 |
| **6** | Validation + Docs | 3-5 days | 10 | Phase 1-5 |
| **Total** | | **3-4 weeks** | **95** | |

---

## Phase Documents

Each phase has a detailed task brief:

- **Phase 1**: `.agents/features/ohmyopencode-integration/plan-phase-1-agents-md.md`
- **Phase 2**: `.agents/features/ohmyopencode-integration/plan-phase-2-categories.md`
- **Phase 3**: `.agents/features/ohmyopencode-integration/plan-phase-3-agents.md`
- **Phase 4**: `.agents/features/ohmyopencode-integration/plan-phase-4-hooks.md`
- **Phase 5**: `.agents/features/ohmyopencode-integration/plan-phase-5-commands-wisdom.md`
- **Phase 6**: `.agents/features/ohmyopencode-integration/plan-phase-6-validation.md`

---

## Integration Summary

### What We're Integrating

| Category | Source | Target | Count |
|----------|--------|--------|-------|
| **Agents** | `src/agents/` | `.opencode/agents/` | 11 |
| **Hooks** | `src/hooks/` | `.opencode/hooks/` | 46 |
| **Categories** | `src/tools/delegate-task/constants.ts` | `.opencode/config/categories.json` | 8+ |
| **Commands** | `.opencode/command/` + `src/features/builtin-commands/` | `.opencode/commands/` | 4+ |
| **Wisdom** | `.sisyphus/notepads/` | `.agents/wisdom/` | - |

### Agent Catalog

| Agent | Type | Model | Purpose |
|-------|------|-------|---------|
| **Sisyphus** | primary/all | Claude Opus 4.6 | Main orchestrator |
| **Hephaestus** | all | GPT-5.3 Codex | Deep autonomous worker |
| **Atlas** | primary | Kimi K2.5 | Todo orchestration |
| **Prometheus** | subagent | Claude Opus 4.6 | Interview-mode planner |
| **Oracle** | subagent | GPT-5.2 | Architecture consultant |
| **Metis** | subagent | Claude Opus 4.6 (temp=0.3) | Gap analyzer |
| **Momus** | subagent | GPT-5.2 | Plan reviewer |
| **Sisyphus-Junior** | all | Claude Sonnet 4.6 | Category executor |
| **Librarian** | subagent | Kimi K2.5 | External docs search |
| **Explore** | subagent | Grok Code Fast | Codebase grep |
| **Multimodal-Looker** | subagent | Gemini 3 Flash | PDF/image analysis |

### Category Catalog

| Category | Model | Use Case |
|----------|-------|----------|
| `visual-engineering` | Gemini 3 Pro | Frontend, UI/UX, design |
| `ultrabrain` | GPT-5.3 Codex | Deep logic, architecture |
| `artistry` | Gemini 3 Pro (max) | Creative, unconventional |
| `quick` | Claude Haiku 4.5 | Trivial, single-file |
| `deep` | GPT-5.3 Codex | Autonomous problem-solving |
| `unspecified-low` | Claude Sonnet 4.6 | Low effort, unclassifiable |
| `unspecified-high` | Claude Opus 4.6 | High effort, unclassifiable |
| `writing` | Kimi K2.5 | Documentation, prose |

---

## Execution Order

**Phases must execute sequentially** — each depends on the previous.

```
Phase 1: AGENTS.md Behavior
         ↓
Phase 2: Category + Skill Dispatch (depends on 1)
         ↓
Phase 3: Core Agents (depends on 1, 2)
         ↓
Phase 4: Lifecycle Hooks (depends on 1-3)
         ↓
Phase 5: Commands + Wisdom (depends on 1-4)
         ↓
Phase 6: Validation + Docs (depends on 1-5)
```

---

## Task Briefs

### Phase 1: AGENTS.md Behavior Integration
**File**: `plan-phase-1-agents-md.md`  
**Tasks**: 10  
**Duration**: 2-3 days

**Key Tasks**:
1. Add Intent Verbalization section (Step 0)
2. Enhance Deep Parallel Execution pattern
3. Add Delegation Table with agent use cases
4. Add Category/Skills Delegation Guide
5. Add Session Continuity pattern
6. Merge Hard Blocks (7 blocks)
7. Merge Anti-Patterns
8. Add Model-Specific Overlays (Gemini, GPT)

**Deliverable**: Enhanced AGENTS.md with Sisyphus behavior patterns

---

### Phase 2: Category + Skill Dispatch System
**File**: `plan-phase-2-categories.md`  
**Tasks**: 15  
**Duration**: 3-5 days

**Key Tasks**:
1. Create category definitions (8 categories)
2. Create category schema (Zod v4)
3. Add category routes to dispatch.ts
4. Implement category prompt appends
5. Add category selection logic with gates
6. Create skill loader infrastructure
7. Implement skill injection into prompts
8. Add available skills discovery
9. Create category skills delegation guide
10. Update agent definitions for categories
11. Write unit tests
12. Write integration tests

**Deliverable**: Category-based model routing with skill loading

---

### Phase 3: Core Agent Definitions
**File**: `plan-phase-3-agents.md`  
**Tasks**: 25  
**Duration**: 5-7 days

**Key Tasks**:
1. Create 11 agent SKILL.md files (Sisyphus through Multimodal-Looker)
2. Create agent registry
3. Create agent resolution logic
4. Create dynamic prompt builder
5. Create agent overlays (Gemini, GPT)
6. Add permission configuration
7. Update agent templates
8. Create agent builder factory
9. Add environment context
10. Write agent tests
11. Test permission enforcement
12. Test model resolution
13. Integration tests

**Deliverable**: All 11 agents defined and ready for dispatch

---

### Phase 4: Lifecycle Hooks System
**File**: `plan-phase-4-hooks.md`  
**Tasks**: 20  
**Duration**: 5-7 days

**Key Tasks**:
1. Create hook base infrastructure
2. Implement priority hooks (todo-continuation, atlas, session-recovery)
3. Implement session hooks (10 hooks)
4. Implement tool-guard hooks (5 hooks)
5. Implement transform hooks (3 hooks)
6. Implement continuation hooks (1 hook)
7. Create hook composition
8. Register all hooks
9. Write hook tests

**Deliverable**: 46 hooks across 5 tiers

---

### Phase 5: Commands + Wisdom System
**File**: `plan-phase-5-commands-wisdom.md`  
**Tasks**: 15  
**Duration**: 5-7 days

**Key Tasks**:
1. Create `/prometheus` command (interview-mode)
2. Create `/start-work` command (execution trigger)
3. Create `/ultrawork` command (deep work)
4. Create `/ralph-loop` command (improvement loop)
5. Register all commands
6. Create wisdom directory structure
7. Create wisdom extractor
8. Create wisdom categorizer
9. Create wisdom injector
10. Integrate with `/execute`
11. Integrate with `/prime`

**Deliverable**: Planning commands and wisdom accumulation

---

### Phase 6: Validation + Documentation
**File**: `plan-phase-6-validation.md`  
**Tasks**: 10  
**Duration**: 3-5 days

**Key Tasks**:
1. Create agent dispatch integration test
2. Create hook execution integration test
3. Create category routing integration test
4. Create command flow integration test
5. Create wisdom accumulation integration test
6. Create full pipeline integration test
7. Update README.md
8. Update AGENTS.md agent table
9. Create INTEGRATION.md usage guide
10. Mirror updates to CLAUDE.md

**Deliverable**: Validated integration and complete documentation

---

## Validation Commands

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

---

## Success Criteria

- [ ] AGENTS.md has full Sisyphus behavior patterns
- [ ] All 8 categories dispatch to correct models
- [ ] All 11 agents invoke correctly via task()
- [ ] Priority hooks enforce completion guarantees
- [ ] `/prometheus` command runs interview planning
- [ ] Wisdom accumulates across task executions
- [ ] All integration tests pass
- [ ] Documentation complete and accurate

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing pipeline | Phase-by-phase integration with rollback points |
| Agent conflict with existing | Namespace agents, preserve existing definitions |
| Hook performance overhead | Implement priority hooks first, lazy-load others |
| Category routing failures | Fallback to existing taskType system |
| Wisdom accumulation overhead | Lazy load wisdom, selective injection |
| Test flakiness | Mock external dependencies, use timeouts |

---

## Next Steps

1. **User approval** — Confirm plan structure and timeline
2. **Execute Phase 1** — Run `/execute .agents/features/ohmyopencode-integration/plan-phase-1-agents-md.md`
3. **Continue sequentially** — Phases 2-6 after each phase completes

---

## Related Documents

- **Master Plan**: `.agents/features/ohmyopencode-integration/plan-master.md`
- **Source Repository**: https://github.com/code-yeongyu/oh-my-opencode
- **Local Source**: `/tmp/oh-my-opencode/`