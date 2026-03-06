# Task 11: Update AGENTS.md Agent Table

## Objective

Add a comprehensive 11-agent reference table to AGENTS.md showing model, temperature, mode, permissions, and purpose for each agent.

## Scope

**Files touched**:
- UPDATE: `AGENTS.md` — Add agent reference table

**Out of scope**: Other AGENTS.md sections (leave unchanged)

## Prior Task Context

Tasks 1-10 created integration tests. This task updates documentation with the agent table.

## Context References

### Agent Data (from research)

```markdown
| Agent | Model | Temp | Mode | Permissions | Purpose |
|-------|-------|------|------|-------------|---------|
| sisyphus | claude-opus-4-6 | 0.1 | all | full | Main orchestrator |
| hephaestus | gpt-5.3-codex | 0.1 | all | full | Deep autonomous worker |
| atlas | kimi-k2.5 | 0.1 | primary | full-no-task | Todo conductor |
| prometheus | claude-opus-4-6 | 0.1 | subagent | read-only | Interview planner |
| oracle | gpt-5.2 | 0.1 | subagent | read-only | Architecture consultant |
| metis | claude-opus-4-6 | 0.3 | subagent | read-only | Gap analyzer |
| momus | gpt-5.2 | 0.1 | subagent | read-only | Plan reviewer |
| sisyphus-junior | claude-sonnet-4-6 | 0.1 | all | full-no-task | Category executor |
| librarian | kimi-k2.5 | 0.1 | subagent | read-only | External docs |
| explore | grok-code-fast-1 | 0.1 | subagent | read-only | Internal grep |
| multimodal-looker | gemini-3-flash | 0.1 | subagent | vision-only | PDF/image analysis |
```

### Permission Presets

```markdown
| Level | readFile | writeFile | editFile | bash | grep | task |
|-------|-----------|-----------|----------|------|------|------|
| full | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| full-no-task | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| read-only | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| vision-only | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
```

### Mode Definitions

```markdown
| Mode | Description |
|------|-------------|
| all | Available as primary orchestrator AND as subagent |
| primary | Only available as primary orchestrator (respects UI selection) |
| subagent | Only available as delegated subagent (cannot be primary) |
```

## Step-by-Step Implementation

### Step 1: Read current AGENTS.md

**ACTION**: READ
**TARGET**: `AGENTS.md`

Identify the correct location to insert the agent table (after the agent definitions section).

### Step 2: Add Agent Reference Table

**ACTION**: EDIT
**TARGET**: `AGENTS.md`

Insert after the agent definitions section:

```markdown
## Agent Reference

### Quick Reference Table

| Agent | Display Name | Model | Temp | Mode | Permissions | Category | Purpose |
|-------|--------------|-------|------|------|-------------|----------|---------|
| `sisyphus` | Sisyphus — Main Orchestrator | claude-opus-4-6 | 0.1 | all | full | unspecified-high | Primary orchestrator: workflow management, delegation, session continuity |
| `hephaestus` | Hephaestus — Deep Autonomous Worker | gpt-5.3-codex | 0.1 | all | full | ultrabrain | Autonomous problem-solver for genuinely difficult, logic-heavy tasks |
| `atlas` | Atlas — Todo List Conductor | kimi-k2.5 | 0.1 | primary | full-no-task | writing | Todo management, progress tracking, wisdom accumulation |
| `prometheus` | Prometheus — Strategic Interview Planner | claude-opus-4-6 | 0.1 | subagent | read-only | unspecified-high | Socratic questioning before planning, requirement discovery |
| `oracle` | Oracle — Architecture Consultant | gpt-5.2 | 0.1 | subagent | read-only | ultrabrain | Read-only architecture consultation, debugging help, tradeoffs |
| `metis` | Metis — Pre-Planning Gap Analyzer | claude-opus-4-6 | 0.3 | subagent | read-only | artistry | Identifies hidden ambiguities, AI failure points before planning |
| `momus` | Momus — Plan Reviewer | gpt-5.2 | 0.1 | subagent | read-only | ultrabrain | Ruthless plan completeness verification, rejects vague plans |
| `sisyphus-junior` | Sisyphus-Junior — Category Executor | claude-sonnet-4-6 | 0.1 | all | full-no-task | inherited | Category-dispatched executor with MUST DO/MUST NOT DO constraints |
| `librarian` | Librarian — External Documentation | kimi-k2.5 | 0.1 | subagent | read-only | writing | External documentation search, implementation examples from OSS |
| `explore` | Explore — Internal Codebase Grep | grok-code-fast-1 | 0.1 | subagent | read-only | deep | Fast internal codebase grep, pattern discovery, file location |
| `multimodal-looker` | Multimodal-Looker — PDF/Image Analysis | gemini-3-flash | 0.1 | subagent | vision-only | unspecified-low | PDF/image analysis, diagram interpretation, visual content extraction |

### Permission Levels

| Level | readFile | writeFile | editFile | bash | grep | task | call_omo_agent |
|-------|----------|-----------|----------|------|------|------|-----------------|
| full | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| full-no-task | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| read-only | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| vision-only | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Agent Modes

| Mode | Description |
|------|-------------|
| `all` | Available as primary orchestrator AND as subagent delegate |
| `primary` | Only available as primary orchestrator (respects UI selection) |
| `subagent` | Only available as delegated subagent (cannot be primary) |

### Fallback Chains

| Agent | Primary Model | Fallback 1 | Fallback 2 | Fallback 3 |
|-------|---------------|-------------|------------|------------|
| sisyphus | claude-opus-4-6 | kimi-k2.5 | glm-5 | big-pickle |
| hephaestus | gpt-5.3-codex | gpt-5.2 | — | — |
| oracle | gpt-5.2 | gemini-3.1-pro | claude-opus-4-6 | — |
| librarian | kimi-k2.5 | gemini-3-flash | gpt-5.2 | glm-4.6v |
| explore | grok-code-fast-1 | minimax-m2.5 | claude-haiku-4-5 | gpt-5-nano |
| metis | claude-opus-4-6 | gpt-5.2 | kimi-k2.5 | gemini-3.1-pro |
| momus | gpt-5.2 | claude-opus-4-6 | gemini-3.1-pro | — |
| atlas | kimi-k2.5 | claude-sonnet-4-6 | gpt-5.2 | — |
| prometheus | claude-opus-4-6 | kimi-k2.5 | gpt-5.2 | gemini-3.1-pro |
| multimodal-looker | gemini-3-flash | minimax-m2.5 | big-pickle | — |

### When to Use Each Agent

| Agent | Use When | Don't Use When |
|-------|----------|----------------|
| **sisyphus** | Orchestration, delegation decisions, session management | Deep implementation work (use hephaestus) |
| **hephaestus** | Complex algorithm implementation, architecture refactoring, hard debugging | Trivial changes (use quick), UI work (use visual-engineering) |
| **atlas** | Todo tracking, wisdom accumulation, session continuity | Deep research (use explore), Implementation (use category dispatch) |
| **prometheus** | Requirement discovery, Socratic planning, scope clarification | Clear requirements (skip to planning), Implementation work |
| **oracle** | Architecture decisions, multi-system tradeoffs, debugging strategies | Implementation (read-only), Simple questions |
| **metis** | Pre-planning gap analysis, identifying hidden assumptions | Clear requirements, Implementation work |
| **momus** | Plan completeness review, verification before execution | Implementation, Already-reviewed plans |
| **sisyphus-junior** | Category-spawned execution, constrained task briefs | Multi-agent coordination, Architecture decisions |
| **librarian** | External documentation lookup, OSS implementation examples | Internal codebase search (use explore), Implementation |
| **explore** | Internal codebase patterns, file location, grep operations | External docs (use librarian), Architecture decisions |
| **multimodal-looker** | PDF analysis, image interpretation, visual content extraction | Code implementation, Text-only tasks |
```

**GOTCHA**: Insert in the correct location — after agent definitions but before other sections. Don't duplicate content that already exists.

### Step 3: Validate markdown rendering

**ACTION**: REVIEW
**TARGET**: Visual check that table renders correctly

**VALIDATE**: Markdown is well-formed, table aligns properly, no syntax errors.

## Testing Strategy

- Visual review of AGENTS.md rendering
- Markdown lint (if available)
- Verify links work (if any)

## Acceptance Criteria

- [ ] 11-agent table added with all columns
- [ ] Permission levels table included
- [ ] Mode definitions included
- [ ] Fallback chains documented
- [ ] "When to use" guidance included
- [ ] Markdown renders correctly
- [ ] No duplicate content

## Completion Checklist

- [ ] Table inserted at correct location
- [ ] All 11 agents documented
- [ ] All data accurate (from registry.ts)
- [ ] Markdown clean
- [ ] No existing content removed

## Handoff Notes

Proceed to **Task 12: Create INTEGRATION.md**.