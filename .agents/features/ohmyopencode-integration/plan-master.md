# OhMyOpenCode Integration — Master Plan

## Overview

Integrate the complete OhMyOpenCode package (https://github.com/code-yeongyu/oh-my-opencode) into the existing `.opencode` framework. This is a **native merge** that will bring 11 specialized agents, 46 lifecycle hooks, 8+ task categories, skills system, and wisdom accumulation into the current architecture.

## Integration Summary

| Category | Source | Target | Count |
|----------|--------|--------|-------|
| **Agents** | `src/agents/` | `.opencode/agents/` | 11 |
| **Hooks** | `src/hooks/` | `.opencode/hooks/` | 46 |
| **Categories** | `src/tools/delegate-task/constants.ts` | `.opencode/config/categories.json` | 8+ |
| **Tools** | `src/tools/` | `.opencode/tools/` | merge |
| **Commands** | `.opencode/command/` + `src/features/builtin-commands/` | `.opencode/commands/` | 4+ |
| **AGENTS.md** | Root + `src/agents/AGENTS.md` | Merge into existing `AGENTS.md` | 1 |
| **Config** | Multi-level JSONC | `.opencode/config/oh-my-opencode.jsonc` | 1 |

---

## Phase Breakdown

### Phase 1: AGENTS.md Behavior Integration (2-3 days)

**Goal**: Adopt Sisyphus orchestration behavior patterns into existing `AGENTS.md`

**Scope**:
- Intent Verbalization pattern (Phase 0 enhancement)
- Enhanced Behavior_Instructions with delegation discipline
- Deep parallel execution discipline (fire 2-5 background agents)
- Session ID continuity (`session_id` parameter tracking)
- Hard blocks and anti-patterns sections
- Non-Claude planner sections (model-specific behavior)

**Deliverables**:
- Updated `AGENTS.md` with Sisyphus Behavior_Instructions
- Intent → Routing Map table
- Delegation Table (when to use which agent)
- Category/Skills Delegation Guide

**Sub-plans**: `plan-phase-1-agents-md.md`

---

### Phase 2: Category + Skill Dispatch System (3-5 days)

**Goal**: Implement category-based model routing with skill loading

**Scope**:
- 8 category definitions with model mappings and prompt appends
- Category selection logic (visual-engineering, ultrabrain, artistry, quick, deep, unspecified-low, unspecified-high, writing)
- `load_skills` parameter integration
- Skill loader infrastructure
- AvailableSkills + AvailableCategories builders

**Categories**:
| Category | Model | Use Case |
|----------|-------|----------|
| `visual-engineering` | Gemini 3 Pro | Frontend, UI/UX, design |
| `ultrabrain` | GPT-5.3 Codex | Deep logic, architecture |
| `artistry` | Gemini 3 Pro (max) | Creative, novel approaches |
| `quick` | Claude Haiku 4.5 | Single-file changes |
| `deep` | GPT-5.3 Codex | Autonomous problem-solving |
| `unspecified-low` | Claude Sonnet 4.6 | General low-effort |
| `unspecified-high` | Claude Opus 4.6 | General high-effort |
| `writing` | Kimi K2.5 | Documentation, prose |

**Deliverables**:
- `.opencode/config/categories.json`
- Updated `.opencode/tools/dispatch.ts` with category routing
- `.opencode/features/skill-loader/` infrastructure
- Category prompt appends in constants

**Sub-plans**: `plan-phase-2-categories.md`

---

### Phase 3: Core Agent Definitions (1 week)

**Goal**: Create all 11 agent definitions as `.opencode/agents/*/SKILL.md`

**Agents**:
| Agent | Type | Model | Purpose |
|-------|------|-------|---------|
| **Sisyphus** | primary/all | Claude Opus 4.6 | Main orchestrator |
| **Hephaestus** | all | GPT-5.3 Codex | Deep autonomous worker |
| **Atlas** | primary | Kimi K2.5 | Todo orchestration |
| **Prometheus** | subagent | Claude Opus 4.6 | Interview-mode planner |
| **Metis** | subagent | Claude Opus 4.6 (temp=0.3) | Gap analyzer |
| **Momus** | subagent | GPT-5.2 | Plan reviewer (rejects vague) |
| **Sisyphus-Junior** | all | Claude Sonnet 4.6 | Category-spawned executor |
| **Oracle** | subagent | GPT-5.2 | Architecture consultant (read-only) |
| **Librarian** | subagent | Kimi K2.5 | External docs search |
| **Explore** | subagent | Grok Code Fast | Codebase grep |
| **Multimodal-Looker** | subagent | Gemini 3 Flash | PDF/image analysis |

**Deliverables**:
- 11 agent SKILL.md files in `.opencode/agents/`
- Agent selection + model resolution logic
- Permission configurations (read-only for Oracle, etc.)
- Temperature + mode settings

**Sub-plans**: `plan-phase-3-agents.md`

---

### Phase 4: Lifecycle Hooks System (1 week)

**Goal**: Implement 46 hooks across hook tiers

**Hook Tiers**:
| Tier | Count | Purpose |
|------|-------|---------|
| **Session** | 23 | Session lifecycle, idle, errors |
| **Tool-Guard** | 10 | Pre-tool validation, file protection |
| **Transform** | 4 | Message/context transformation |
| **Continuation** | 7 | Todo/task continuation enforcement |
| **Skill** | 2 | Skill-specific hooks |

**Priority Hooks** (implement first):
1. `todo-continuation` — Enforce todo completion before response
2. `atlas` — Todo list orchestration
3. `session-recovery` — Resume interrupted sessions
4. `category-skill-reminder` — Remind to use category + skills
5. `background-notification` — Background task completion alerts

**Deliverables**:
- `.opencode/hooks/*/index.ts` for each hook
- Hook composition in `.opencode/plugin/hooks/`
- Hook registration in plugin interface

**Sub-plans**: `plan-phase-4-hooks.md`

---

### Phase 5: Commands + Wisdom System (1 week)

**Goal**: Add slash commands and wisdom accumulation

**Commands**:
| Command | Purpose |
|---------|---------|
| `/prometheus` | Interview-mode planning (asks questions before coding) |
| `/start-work` | Execution trigger (reads plan, switches to Atlas) |
| `/ultrawork` | Keyword trigger for deep autonomous work |
| `/ralph-loop` | Self-referential development loop |

**Wisdom System**:
```
.agents/wisdom/{feature}/
├── learnings.md      # Patterns, conventions, successes
├── decisions.md      # Architectural choices + rationales
├── issues.md         # Blockers, gotchas, problems
├── verification.md   # Test results, validation outcomes
└── problems.md      # Unresolved issues, technical debt
```

**Deliverables**:
- 4 command SKILL.md files
- `.opencode/commands/prometheus/SKILL.md`
- `.opencode/commands/start-work/SKILL.md`
- `.opencode/commands/ultrawork/SKILL.md`
- Wisdom accumulation infrastructure
- Integration with `/execute` command

**Sub-plans**: `plan-phase-5-commands-wisdom.md`

---

### Phase 6: Validation + Documentation (3-5 days)

**Goal**: Ensure everything works, document the integration

**Scope**:
- Integration tests for agent dispatch
- Hook execution verification
- Category routing validation
- End-to-end pipeline test
- Update AGENTS.md with new capabilities
- Update README with usage guide

**Validation Commands**:
```bash
# Verify agent dispatch
bun test src/tools/delegate-task/

# Verify hooks
bun test src/hooks/

# Verify categories
bun test src/config/categories.test.ts

# Full pipeline test
bun test --grep "integration"
```

**Deliverables**:
- `.opencode/tests/` integration tests
- Updated `README.md`
- Updated root `AGENTS.md` with new agent table
- `.opencode/INTEGRATION.md` usage guide

**Sub-plans**: `plan-phase-6-validation.md`

---

## Execution Order

```
Phase 1: AGENTS.md Behavior
    ↓
Phase 2: Categories + Skills
    ↓
Phase 3: Core Agents
    ↓
Phase 4: Lifecycle Hooks
    ↓
Phase 5: Commands + Wisdom
    ↓
Phase 6: Validation + Docs
```

Each phase depends on the previous. Must execute sequentially.

---

## Key Decisions

1. **Native merge** — Direct integration into `.opencode/` structure
2. **Agents first** — Behavior patterns are core value
3. **Categories via extension** — Add to existing dispatch.ts, don't replace
4. **Hooks via composition** — Use plugin hook infrastructure
5. **Wisdom in `.agents/`** — Keep with existing feature artifacts

---

## Risks

| Risk | Mitigation |
|------|-------------|
| Agent conflict with existing | Namespace agents, keep existing definitions |
| Hook performance overhead | Implement priority hooks first, lazy-load others |
| Category model mapping conflicts | Merge with existing taskTypes, add category layer |
| AGENTS.md merge complexity | Careful section-by-section merge with testing |
| Skill loading latency | Cache loaded skills, pre-warm on start |

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|-----------|-------|
| Phase 1: AGENTS.md | 2-3 days | 8-10 |
| Phase 2: Categories | 3-5 days | 12-15 |
| Phase 3: Agents | 5-7 days | 20-25 |
| Phase 4: Hooks | 5-7 days | 15-20 |
| Phase 5: Commands | 5-7 days | 10-15 |
| Phase 6: Validation | 3-5 days | 8-10 |
| **Total** | **3-4 weeks** | **73-95 tasks** |

---

## Success Criteria

- [ ] AGENTS.md has full Sisyphus behavior patterns
- [ ] All 8 categories dispatch to correct models
- [ ] All 11 agents invoke correctly via task()
- [ ] Priority hooks enforce completion guarantees
- [ ] `/prometheus` command runs interview planning
- [ ] Wisdom accumulates across task executions
- [ ] All validation tests pass
- [ ] Documentation updated with new capabilities

---

## Next Steps

1. Create detailed sub-plan for Phase 1: `plan-phase-1-agents-md.md`
2. User approves sub-plan
3. Execute Phase 1
4. Repeat for Phases 2-6

---

## Related Documents

- Source: https://github.com/code-yeongyu/oh-my-opencode
- Key Files:
  - `/tmp/oh-my-opencode/src/agents/sisyphus.ts` — Main orchestrator
  - `/tmp/oh-my-opencode/src/agents/AGENTS.md` — Agent conventions
  - `/tmp/oh-my-opencode/src/agents/dynamic-agent-prompt-builder.ts` — Prompt assembly
  - `/tmp/oh-my-opencode/src/tools/delegate-task/constants.ts` — Category definitions
  - `/tmp/oh-my-opencode/src/hooks/*/index.ts` — Hook implementations