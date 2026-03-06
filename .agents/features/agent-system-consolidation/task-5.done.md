# Task 5: Update AGENTS.md Agent Reference

## Objective

Update the `AGENTS.md` file to accurately reflect the consolidated agent system. Ensure the Agent Reference Table matches the TypeScript registry exactly, and remove any references to deleted legacy markdown agents.

## Scope

### Files Touched
- `AGENTS.md` — UPDATE (Agent Reference section)
- `.opencode/agents/README.md` — UPDATE (if it references deleted files)

### What's Out of Scope
- Registry changes (already complete)
- Command changes (already complete in tasks 2-3)
- Skill file changes

### Dependencies
- Task 1 complete — Registry verified
- Task 2-3 complete — Commands updated
- Task 4 complete — Legacy files deleted

## Prior Task Context

Tasks 1-4 have:
1. Verified registry has 11 properly configured agents
2. Updated `/planning` to use `task(subagent_type="...")` syntax
3. Updated `/code-review` similarly
4. Deleted 5 legacy markdown agent files

Now AGENTS.md needs to reflect this consolidated state.

---

## Context References

### Current Registry Agents (from registry.ts)

The authoritative list of agents:

| Agent | Display Name | Model | Mode | Category |
|-------|--------------|-------|------|----------|
| `sisyphus` | Sisyphus — Main Orchestrator | claude-opus-4-5 | all | unspecified-high |
| `hephaestus` | Hephaestus — Deep Autonomous Worker | gpt-5.3-codex | all | ultrabrain |
| `atlas` | Atlas — Todo List Conductor | claude-sonnet-4-5 | primary | writing |
| `prometheus` | Prometheus — Strategic Interview Planner | claude-opus-4-5 | subagent | unspecified-high |
| `oracle` | Oracle — Architecture Consultant | claude-sonnet-4-5 | subagent | ultrabrain |
| `metis` | Metis — Pre-Planning Gap Analyzer | claude-opus-4-5 | subagent | artistry |
| `momus` | Momus — Plan Reviewer | claude-sonnet-4-5 | subagent | ultrabrain |
| `sisyphus-junior` | Sisyphus-Junior — Category Executor | claude-sonnet-4-5 | all | (inherited) |
| `librarian` | Librarian — External Documentation | kimi-k2.5 | subagent | writing |
| `explore` | Explore — Internal Codebase Grep | deepseek-v3.2 | subagent | deep |
| `multimodal-looker` | Multimodal-Looker — PDF/Image Analysis | gemini-3-flash-preview | subagent | unspecified-low |

### AGENTS.md — Agent Reference Section

The section that needs updating is the "Agent Reference" section, which should match the registry.

---

## Patterns to Follow

### Pattern: Agent Reference Table Format

The table in AGENTS.md should use this format:

```markdown
## Agent Reference

### Quick Reference Table

| Agent | Display Name | Model | Temp | Mode | Permissions | Category | Purpose |
|-------|--------------|-------|------|------|-------------|----------|---------|
| `sisyphus` | Sisyphus — Main Orchestrator | claude-opus-4-5 | 0.1 | all | full | unspecified-high | Primary orchestrator: workflow management, delegation, session continuity |
| `hephaestus` | Hephaestus — Deep Autonomous Worker | gpt-5.3-codex | 0.1 | all | full | ultrabrain | Autonomous problem-solver for genuinely difficult, logic-heavy tasks |
...

### Permission Levels

| Level | readFile | writeFile | editFile | bash | grep | task |
|-------|----------|-----------|----------|------|------|------|
| `full` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `full-no-task` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `read-only` | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `vision-only` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Agent Modes

| Mode | Description |
|------|-------------|
| `all` | Available as primary orchestrator AND as subagent delegate |
| `primary` | Only available as primary orchestrator (respects UI selection) |
| `subagent` | Only available as delegated subagent (cannot be primary) |

### Fallback Chains

| Agent | Primary Model | Fallback 1 | Fallback 2 | Fallback 3 |
|-------|---------------|-------------|------------|------------|
| sisyphus | claude-opus-4-5 | kimi-k2.5 | glm-5 | big-pickle |
...

### When to Use Each Agent

| Agent | Use When | Don't Use When |
|-------|----------|----------------|
| **sisyphus** | Orchestration, delegation decisions, session management | Deep implementation work (use hephaestus) |
...
```

---

## Step-by-Step Tasks

### Step 5.1: Find Agent Reference Section in AGENTS.md

**IMPLEMENT**: Locate the current "Agent Reference" section

```bash
grep -n "## Agent" AGENTS.md
grep -n "Agent Reference" AGENTS.md
```

**VALIDATE**: Found the section to update

### Step 5.2: Update Quick Reference Table

**IMPLEMENT**: Replace the current agent table with one that matches registry.ts exactly

**Current registry agents** (from registry.ts):
1. sisyphus — Main Orchestrator
2. hephaestus — Deep Autonomous Worker
3. atlas — Todo List Conductor
4. prometheus — Strategic Interview Planner
5. oracle — Architecture Consultant
6. metis — Pre-Planning Gap Analyzer
7. momus — Plan Reviewer
8. sisyphus-junior — Category Executor
9. librarian — External Documentation
10. explore — Internal Codebase Grep
11. multimodal-looker — PDF/Image Analysis

**Replace with** the table format shown in Patterns section.

**VALIDATE**: Table has exactly 11 rows matching registry

### Step 5.3: Remove References to Deleted Agents

**IMPLEMENT**: Search for and remove any references to:
- `research-codebase`
- `research-external`
- `planning-research`
- `plan-writer`
- Legacy `code-review` agent (not the skill)

```bash
grep -n "research-codebase\|research-external\|planning-research\|plan-writer" AGENTS.md
```

**VALIDATE**: No references to deleted agents remain

### Step 5.4: Update .opencode/agents/README.md

**IMPLEMENT**: Check if README.md in agents/ references deleted files

```bash
grep -n "research-codebase\|research-external\|planning-research\|plan-writer\|code-review.md" .opencode/agents/README.md
```

If found, update to reflect the new system:
- Reference registry.ts as the source of truth
- Explain how to invoke agents via `task(subagent_type="...")`
- Remove references to deleted files

**VALIDATE**: README.md is accurate

### Step 5.5: Verify Consistency

**IMPLEMENT**: Cross-check AGENTS.md agent list against registry.ts

```bash
# Extract agent names from registry.ts
grep "name:" .opencode/agents/registry.ts

# Compare with AGENTS.md table
grep -E "^\| \`[a-z-]+\` \|" AGENTS.md
```

**VALIDATE**: Both lists match exactly

---

## Testing Strategy

### Manual Verification
- Read AGENTS.md Agent Reference section
- Compare each row with registry.ts
- Confirm no legacy agent references remain

### Automated Check
```bash
# Count agents in registry
grep -c "name:" .opencode/agents/registry.ts
# Should be 11

# Count agents in AGENTS.md table (adjust regex as needed)
grep -c "^\| \`" AGENTS.md  # in the Agent Reference table
# Should be 11 (plus header row)
```

---

## Validation Commands

```bash
# Check for legacy references
grep -n "research-codebase\|research-external\|planning-research\|plan-writer" AGENTS.md
# Should return 0 results

# Check agents/README.md
grep -n "research-codebase\|research-external\|planning-research\|plan-writer" .opencode/agents/README.md
# Should return 0 results
```

---

## Acceptance Criteria

### Implementation
- [ ] AGENTS.md Agent Reference table has exactly 11 agents
- [ ] All agents match registry.ts configurations
- [ ] No references to deleted legacy agents
- [ ] .opencode/agents/README.md updated (if needed)

### Runtime
- [ ] AGENTS.md is accurate documentation of the system
- [ ] New developers can understand agent system from AGENTS.md

---

## Handoff Notes

Task 5 is the final task. After completion:
- Agent system is fully consolidated
- Registry is the single source of truth
- Commands use `task()` with registry agents
- AGENTS.md accurately documents the system
- Legacy markdown agents are deleted

The feature is complete and ready for `/code-loop agent-system-consolidation`.

---

## Completion Checklist

- [ ] Located Agent Reference section in AGENTS.md
- [ ] Updated Quick Reference Table (11 agents)
- [ ] Removed all legacy agent references
- [ ] Updated .opencode/agents/README.md
- [ ] Verified consistency with registry.ts
- [ ] All validation commands pass
