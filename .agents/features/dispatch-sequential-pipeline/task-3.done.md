# Task 3 of 3: Update model-strategy.md Documentation

> **Feature**: `dispatch-sequential-pipeline`
> **Brief Path**: `.agents/features/dispatch-sequential-pipeline/task-3.md`
> **Plan Overview**: `.agents/features/dispatch-sequential-pipeline/plan.md`

---

## OBJECTIVE

Update model-strategy.md to fix the false "agent mode works with ALL providers" claim,
update the T0 cascade definition to match the dispatch.ts changes, and add documentation
for the sequential dispatch pattern with sessionId.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/reference/model-strategy.md` | UPDATE | Fix 5 locations: T0 overview row (line 13), planning cascade description (line 21), T0 routing table row (line 38), agent mode claim (line 106), dispatch modes table (line 112) |

**Out of Scope:**
- dispatch.ts — completed in Task 1
- build.md — completed in Task 2
- Council models section (lines 65-78) — unchanged
- Batch dispatch patterns (lines 134-150) — unchanged
- Smart escalation section (lines 151-182) — unchanged

**Dependencies:**
- Task 1 must complete first — the T0 cascade in dispatch.ts defines the source of truth
- Task 2 should be complete for consistency but is not strictly required

---

## PRIOR TASK CONTEXT

**Files Changed in Task 1:**
- `.opencode/tools/dispatch.ts` — T0 cascade updated to: gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5. Added `sessionId` arg for sequential dispatch. Added `resolveCascadeToModel()`.

**Files Changed in Task 2:**
- `.opencode/commands/build.md` — Step 2 now uses sequential dispatch with two calls and sessionId. Includes spec context in /planning args.

**State Carried Forward:**
- T0 cascade: gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5
- Agent mode does NOT work with ALL providers (ollama-cloud models fail)
- Sequential dispatch is now a documented pattern

**Known Issues or Deferred Items:**
- None from prior tasks

---

## CONTEXT REFERENCES

### Files to Read

- `.opencode/reference/model-strategy.md` (all 199 lines) — Why: This is the target file. Must understand every section to update the 5 locations consistently.
- `.opencode/tools/dispatch.ts` (lines 103-118) — Why: The T0 cascade definition is the source of truth.

### Current Content: Full model-strategy.md (Lines 1-199)

```markdown
# Model Strategy — 5-Tier Cost-Optimized Cascade

Maximize free/cheap models. Anthropic is last resort only.

**Read this when**: dispatching to models, configuring `/council`, debugging model routing, or reviewing the tier system.

---

## 5-Tier Overview

| Tier | Role | Provider/Model | Cost | Used By |
|------|------|----------------|------|---------|
| T0 | Planning (thinking) | `ollama-cloud/kimi-k2-thinking` → `cogito-2.1:671b` → `qwen3-max` → `claude-opus-4-5` | FREE→PAID | `/planning` dispatch |
| T1 | Implementation | `bailian-coding-plan-test/qwen3.5-plus` (+ coder-next, coder-plus) | FREE | `/execute` dispatch |
| T2 | First Validation | `zai-coding-plan/glm-5` | FREE | `/code-review`, `/code-loop` |
| T3 | Second Validation | `ollama-cloud/deepseek-v3.2` | FREE | `/code-loop` second opinion |
| T4 | Code Review gate | `openai/gpt-5.3-codex` | PAID (cheap) | `/code-loop` near-final |
| T5 | Final Review | `anthropic/claude-sonnet-4-6` | PAID (expensive) | `/final-review` last resort |

**Orchestrator**: Claude Opus handles ONLY exploration, planning, orchestration, strategy.
**Planning cascade**: `kimi-k2-thinking` (FREE) → `cogito-2.1:671b` (FREE) → `qwen3-max` (FREE) → `claude-opus-4-5` (PAID). Thinking models produce significantly better 700-1000 line plans.
**Fallback**: If `bailian-coding-plan-test` 404s, use `zai-coding-plan/glm-4.7`.
**Push cadence**: Push after every spec commit — do not batch to `/ship`.
```

**Analysis**: Three locations need updating in this section:
1. Line 13: T0 overview row — replace the cascade chain
2. Line 21: Planning cascade description — replace models and update rationale
3. These changes must be consistent with each other and with dispatch.ts

### Current Content: Agent Mode Claims (Lines 104-123)

```markdown
**Agent mode permissions**: read, edit, bash, glob, grep, list, todoread, todowrite. Denies: task (no recursive dispatch), external_directory, webfetch, websearch.

**Agent mode works with ALL providers.** OpenCode's native infrastructure gives all providers (free and paid) the same capabilities: file read/write, grep, glob, bash, Archon MCP access. No fallback required.

**Two dispatch modes:**
| Mode | Tool Access | Providers | Use For |
|------|------------|-----------|---------|
| `text` (default) | None | All | Reviews, opinions, analysis |
| `agent` | Full (native agent infrastructure) | All (free and paid via OpenCode native tools) | Implementation tasks for all providers |

**Agent mode example (any provider):**
```
dispatch({ provider: "bailian-coding-plan-test", model: "qwen3.5-plus", mode: "agent", prompt: "Implement X. Read existing code first. Run ruff/mypy after." })
```

**Text mode example (reviews):**
```
dispatch({ taskType: "thinking-review", prompt: "Review this code for bugs: ..." })
```
```

**Analysis**: Two locations need updating:
1. Line 106: "Agent mode works with ALL providers" — empirically false for ollama-cloud models
2. Line 112: "All (free and paid via OpenCode native tools)" in the providers column — needs caveat

### Current Content: Task Type Routing Table T0 Row (Line 38)

```markdown
| T0 (thinking/planning) | planning | kimi-k2-thinking → cogito-2.1:671b → qwen3-max → claude-opus-4-5 | FREE→PAID |
```

**Analysis**: Must update to match the new cascade: gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5. The cost column changes from FREE→PAID to PAID→FREE→PAID (codex is first).

### Patterns to Follow

**Existing table row pattern** (from `model-strategy.md:13`):
```markdown
| T0 | Planning (thinking) | `ollama-cloud/kimi-k2-thinking` → `cogito-2.1:671b` → `qwen3-max` → `claude-opus-4-5` | FREE→PAID | `/planning` dispatch |
```
- Why this pattern: Consistent table format with backtick-quoted provider/model, arrow-separated cascade, cost column
- How to apply: Replace models but keep the same formatting
- Common gotchas: Backticks around provider/model, arrows between cascade steps, cost reflects the order

---

## STEP-BY-STEP TASKS

---

### Step 1: UPDATE `.opencode/reference/model-strategy.md` — Fix T0 Overview Row

**What**: Update the T0 row in the 5-Tier Overview table to reflect the new cascade.

**IMPLEMENT**:

Current (line 13 of `.opencode/reference/model-strategy.md`):
```markdown
| T0 | Planning (thinking) | `ollama-cloud/kimi-k2-thinking` → `cogito-2.1:671b` → `qwen3-max` → `claude-opus-4-5` | FREE→PAID | `/planning` dispatch |
```

Replace with:
```markdown
| T0 | Planning (codex-first) | `openai/gpt-5.3-codex` → `qwen3-max` → `qwen3.5-plus` → `claude-opus-4-5` | PAID→FREE→PAID | `/planning` dispatch |
```

**PATTERN**: Adjacent rows in the same table (lines 14-18)

**IMPORTS**: N/A

**GOTCHA**: The role column changes from "Planning (thinking)" to "Planning (codex-first)" to reflect the new strategy. The cost column changes from "FREE→PAID" to "PAID→FREE→PAID" because codex is first (paid), then two free models, then opus (paid).

**VALIDATE**:
```bash
grep "T0" .opencode/reference/model-strategy.md | head -3
# Should show the updated cascade with gpt-5.3-codex first
```

---

### Step 2: UPDATE `.opencode/reference/model-strategy.md` — Fix Planning Cascade Description

**What**: Update the planning cascade description line to match the new models and explain the rationale.

**IMPLEMENT**:

Current (line 21 of `.opencode/reference/model-strategy.md`):
```markdown
**Planning cascade**: `kimi-k2-thinking` (FREE) → `cogito-2.1:671b` (FREE) → `qwen3-max` (FREE) → `claude-opus-4-5` (PAID). Thinking models produce significantly better 700-1000 line plans.
```

Replace with:
```markdown
**Planning cascade**: `gpt-5.3-codex` (PAID) → `qwen3-max` (FREE) → `qwen3.5-plus` (FREE) → `claude-opus-4-5` (PAID). Codex-first per user policy — produces best quality 700-1000 line plans. ollama-cloud thinking models (kimi-k2-thinking, cogito-2.1) removed — they cannot make tool calls in agent mode.
```

**PATTERN**: Same line format as the original

**IMPORTS**: N/A

**GOTCHA**: The explanation of WHY ollama-cloud models were removed is important for future maintainers. Don't just change the models — explain the reason.

**VALIDATE**:
```bash
grep "Planning cascade" .opencode/reference/model-strategy.md
# Should show gpt-5.3-codex first with the rationale
```

---

### Step 3: UPDATE `.opencode/reference/model-strategy.md` — Fix T0 Routing Table Row

**What**: Update the T0 row in the Task Type Routing table.

**IMPLEMENT**:

Current (line 38 of `.opencode/reference/model-strategy.md`):
```markdown
| T0 (thinking/planning) | planning | kimi-k2-thinking → cogito-2.1:671b → qwen3-max → claude-opus-4-5 | FREE→PAID |
```

Replace with:
```markdown
| T0 (codex-first planning) | planning | gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5 | PAID→FREE→PAID |
```

**PATTERN**: Adjacent rows in the same table (lines 33-61)

**IMPORTS**: N/A

**GOTCHA**: The label changes from "thinking/planning" to "codex-first planning" for consistency with the overview table.

**VALIDATE**:
```bash
grep "T0" .opencode/reference/model-strategy.md
# Should show consistent cascade in both tables
```

---

### Step 4: UPDATE `.opencode/reference/model-strategy.md` — Fix Agent Mode Claim

**What**: Replace the false "Agent mode works with ALL providers" claim with an accurate statement.

**IMPLEMENT**:

Current (line 106 of `.opencode/reference/model-strategy.md`):
```markdown
**Agent mode works with ALL providers.** OpenCode's native infrastructure gives all providers (free and paid) the same capabilities: file read/write, grep, glob, bash, Archon MCP access. No fallback required.
```

Replace with:
```markdown
**Agent mode works with most providers.** OpenCode's native infrastructure gives providers the same capabilities: file read/write, grep, glob, bash, Archon MCP access. **Exception**: Some `ollama-cloud` models (kimi-k2-thinking, cogito-2.1) output raw tool call tokens as literal text instead of making actual tool calls — they CANNOT be used in agent or command mode. Confirmed working in agent mode: all `bailian-coding-plan-test` models, all `zai-coding-plan` models, `anthropic`, `openai`.
```

**PATTERN**: Same bold-text-first format as the original

**IMPORTS**: N/A

**GOTCHA**: Be specific about WHICH models fail (not all ollama-cloud — just the ones tested). Be specific about which providers are confirmed working. This is operational documentation that other commands rely on.

**VALIDATE**:
```bash
grep "Agent mode works" .opencode/reference/model-strategy.md
# Should say "most providers" not "ALL providers"
```

---

### Step 5: UPDATE `.opencode/reference/model-strategy.md` — Fix Dispatch Modes Table

**What**: Update the agent mode row in the dispatch modes table to note the provider caveat.

**IMPLEMENT**:

Current (lines 108-112 of `.opencode/reference/model-strategy.md`):
```markdown
**Two dispatch modes:**
| Mode | Tool Access | Providers | Use For |
|------|------------|-----------|---------|
| `text` (default) | None | All | Reviews, opinions, analysis |
| `agent` | Full (native agent infrastructure) | All (free and paid via OpenCode native tools) | Implementation tasks for all providers |
```

Replace with:
```markdown
**Three dispatch modes:**
| Mode | Tool Access | Providers | Use For |
|------|------------|-----------|---------|
| `text` (default) | None | All | Reviews, opinions, analysis |
| `agent` | Full (native agent infrastructure) | Most (except some ollama-cloud thinking models) | Implementation tasks, codebase navigation |
| `command` | Full (slash command execution) | Most (except some ollama-cloud thinking models) | Running /planning, /execute, /code-review, /commit |
```

**PATTERN**: Same table format

**IMPORTS**: N/A

**GOTCHA**: 
- Changed from "Two" to "Three" dispatch modes — command mode was always a mode but wasn't documented in this table.
- The provider caveat is short ("except some ollama-cloud thinking models") to keep the table readable. The detailed explanation is in the paragraph above.

**VALIDATE**:
```bash
grep "dispatch modes" .opencode/reference/model-strategy.md
# Should say "Three dispatch modes"
grep "command" .opencode/reference/model-strategy.md | grep "slash"
# Should show the command mode row
```

---

### Step 6: UPDATE `.opencode/reference/model-strategy.md` — Add Sequential Dispatch Note

**What**: Add a note about sequential dispatch with sessionId in the dispatch modes section.

**IMPLEMENT**:

After the dispatch modes table (after the agent mode example blocks around line 123), add:

Current (lines 119-123 of `.opencode/reference/model-strategy.md`):
```markdown
**Text mode example (reviews):**
```
dispatch({ taskType: "thinking-review", prompt: "Review this code for bugs: ..." })
```
```

After this block, add:
```markdown

**Sequential dispatch (same session):**
For multi-step workflows (e.g., `/prime` then `/planning`), use the `sessionId` parameter
to send subsequent dispatches to an existing session:
```
// Step 1: Prime the session
result1 = dispatch({ mode: "command", command: "prime", prompt: "", taskType: "planning" })
// Step 2: Planning in same session (extract sessionId from result1)
result2 = dispatch({ mode: "command", command: "planning", prompt: "{spec} --auto-approve", taskType: "planning", sessionId: "{id from result1}" })
```
The session accumulates context across calls. The T0 cascade resolves once on the first call.
```

**PATTERN**: The existing example blocks above (agent mode example, text mode example)

**IMPORTS**: N/A

**GOTCHA**: Keep the example concise — the detailed pattern is in build.md. This is just a reference note for people reading model-strategy.md.

**VALIDATE**:
```bash
grep "Sequential dispatch" .opencode/reference/model-strategy.md
# Should show the sequential dispatch section header
grep "sessionId" .opencode/reference/model-strategy.md
# Should show the sessionId parameter mention
```

---

## TESTING STRATEGY

### Unit Tests

No unit tests — this task modifies `.opencode/reference/model-strategy.md` which is a
reference document. Covered by manual testing in Level 5.

### Integration Tests

N/A — documentation file. Covered by Level 5 manual review.

### Edge Cases

- **Reader assumes ALL providers work in agent mode**: The corrected text clearly states which providers are confirmed working and which fail. This prevents other commands from dispatching to broken providers.
- **Inconsistent cascade across tables**: All three T0 references (overview table, description, routing table) must show the same 4 models in the same order.
- **Stale examples**: The agent mode example still uses qwen3.5-plus which is correct — it's a confirmed working model.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# File exists and is readable
wc -l .opencode/reference/model-strategy.md
# Should be approximately 210-220 lines (original 199 + ~15 new lines)
```

### Level 2: Type Safety
```bash
# N/A — markdown file
```

### Level 3: Unit Tests
```bash
# N/A — documentation file
```

### Level 4: Integration Tests
```bash
# N/A — documentation file
```

### Level 5: Manual Validation

1. Open `.opencode/reference/model-strategy.md`
2. **T0 consistency check**: Search for "T0" — verify ALL references show gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5
3. **Agent mode claim**: Search for "Agent mode works" — verify it says "most providers" with the exception explained
4. **Dispatch modes table**: Verify it says "Three dispatch modes" and includes command mode
5. **Sequential dispatch**: Verify the example shows sessionId usage
6. **No stale references**: Search for "kimi-k2-thinking" — should only appear in the exception explanation, NOT in any cascade definition
7. **No stale references**: Search for "cogito-2.1" — should only appear in the exception explanation
8. Read the full file end-to-end for coherence

### Level 6: Cross-Check

- T0 cascade in model-strategy.md must match dispatch.ts lines 104-118
- Agent mode caveat must be consistent with the testing findings (kimi-k2-thinking and cogito-2.1 fail)
- Sequential dispatch example must reference the same `sessionId` arg added in Task 1

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [ ] T0 overview row updated (line 13): gpt-5.3-codex first, cost PAID→FREE→PAID
- [ ] Planning cascade description updated (line 21): new models + rationale
- [ ] T0 routing table row updated (line 38): consistent with overview
- [ ] Agent mode claim fixed (line 106): "most providers" with exception list
- [ ] Dispatch modes table updated (lines 108-112): three modes, provider caveats
- [ ] Sequential dispatch note added after examples
- [ ] No stale ollama-cloud models in cascade definitions
- [ ] All three T0 references are consistent
- [ ] File reads coherently end-to-end

### Runtime (verify after testing/deployment)

- [ ] Developers reading model-strategy.md get correct cascade order
- [ ] No one dispatches to kimi-k2-thinking or cogito-2.1 in agent/command mode based on this doc

---

## HANDOFF NOTES

> Written AFTER execution completes.

### Files Created/Modified

- `.opencode/reference/model-strategy.md` — {to be filled after execution}

### Patterns Established

- Provider compatibility documentation pattern (confirmed working + known failures)
- Sequential dispatch documentation pattern

### State to Carry Forward

- All three tasks complete — feature ready for code review and commit
- End-to-end testing should verify: start OpenCode server → sequential dispatch /prime + /planning → verify plan artifacts

### Known Issues or Deferred Items

- {to be filled after execution}

---

## COMPLETION CHECKLIST

- [ ] All steps completed in order
- [ ] Each step's VALIDATE command executed and passed
- [ ] All validation levels run (or explicitly N/A with reason)
- [ ] Manual testing confirms expected behavior
- [ ] Implementation acceptance criteria all checked
- [ ] No regressions in adjacent files
- [ ] Handoff notes written (if task N < M)
- [ ] Brief marked done: rename `task-3.md` → `task-3.done.md`

---

## NOTES

### Key Design Decisions (This Task)

- **Specific provider compatibility list**: Rather than a vague "most providers work", we list exactly which providers are confirmed and which fail. This is operational documentation — vagueness causes bugs.
- **Keep ollama-cloud model names in exception text**: Future maintainers need to know exactly which models fail and why. Don't sanitize the failure — document it.
- **Three dispatch modes (not two)**: Command mode was always a mode in dispatch.ts but wasn't documented in this table. Adding it now prevents confusion.

### Implementation Notes

- The T0 cost column "PAID→FREE→PAID" reflects the actual cascade order: codex (paid) → qwen3-max (free) → qwen3.5-plus (free) → opus (paid). This is unusual — most cascades go free→paid. The user's Codex-first policy makes this deliberate.
- The sequential dispatch example is intentionally brief. The full pattern is in build.md Step 2. model-strategy.md is a reference, not a tutorial.

---

> **Reminder**: Mark this brief done after execution:
> Rename `task-3.md` → `task-3.done.md`
> This signals to `/execute` (via artifact scan) that this task is complete.
