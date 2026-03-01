# Task 2 of 3: Update Build.md Planning Dispatch

> **Feature**: `dispatch-sequential-pipeline`
> **Brief Path**: `.agents/features/dispatch-sequential-pipeline/task-2.md`
> **Plan Overview**: `.agents/features/dispatch-sequential-pipeline/plan.md`

---

## OBJECTIVE

Update build.md Step 2 to use sequential dispatch (two dispatch calls with shared sessionId)
instead of the broken single-agent-prompt pattern, and include full spec context in the
`/planning` command arguments for plan quality.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/commands/build.md` | UPDATE | Replace Step 2 dispatch code block (lines 215-224) with sequential dispatch pattern using sessionId |

**Out of Scope:**
- dispatch.ts changes — completed in Task 1
- model-strategy.md — handled by Task 3
- Steps 3-11 of build.md — unchanged
- Master + Sub-Plan Mode dispatch (line 246) — same pattern applies but is less critical (rare path)

**Dependencies:**
- Task 1 must complete first — the `sessionId` arg on the dispatch tool must exist

---

## PRIOR TASK CONTEXT

**Files Changed in Task 1:**
- `.opencode/tools/dispatch.ts` — Added `sessionId` optional arg to the dispatch tool,
  added `resolveCascadeToModel()` function, fixed T0 cascade (gpt-5.3-codex first),
  added cascade+sessionId resolution branch, updated tool description and output format.

**State Carried Forward:**
- The dispatch tool now accepts `sessionId` to reuse an existing session
- The output now includes `**Session ID**: \`{id}\`` for parseable extraction
- T0 cascade is: gpt-5.3-codex → qwen3-max → qwen3.5-plus → claude-opus-4-5

**Known Issues or Deferred Items:**
- None from Task 1

---

## CONTEXT REFERENCES

### Files to Read

- `.opencode/commands/build.md` (lines 186-251) — Why: This is Step 2 where the planning dispatch happens. Must see the full context to know exactly what to replace.
- `.opencode/tools/dispatch.ts` (lines 636-655) — Why: The new `sessionId` arg definition (from Task 1) that build.md will reference.
- `.agents/specs/BUILD_ORDER.md` (all 18 lines) — Why: Understand the spec format that gets passed as context.

### Current Content: Step 2 Dispatch Block (Lines 211-238)

```markdown
#### Task Brief Mode (Default)

4. **Write or dispatch plan:**

   **If dispatch available:**
   ```
   dispatch({
     mode: "agent",
     prompt: "Run /prime first. Then run /planning {spec-id} {spec-name} --auto-approve ...",
     taskType: "planning",
   })
   ```
   The `--auto-approve` flag skips the interactive approval gate in `/planning` Phase 4 — the spec was already approved via BUILD_ORDER.
   Use a T1 thinking model for best results (reasoning produces better plans and task briefs).

   **If dispatch unavailable:**
   Write the plan directly using the `/planning` methodology. The primary model gathers context, runs discovery, and produces the structured plan inline.

   **If dispatch fails:**
   - Fall back to the "If dispatch unavailable" path (write the plan inline).
   - Log: "Dispatch failed for planning {spec-name} — falling back to inline planning."

   - `plan.md` MUST be 700-1000 lines — this is a hard requirement
   - Each `task-{N}.md` brief MUST be self-contained and executable without reading `plan.md`
   - Plans MUST include actual code samples (copy-pasteable), not summaries
   - Plans MUST include exact file paths, line references, import statements
   - Plans MUST include validation commands for every task
   - Save to: `.agents/features/{spec-name}/plan.md` + `.agents/features/{spec-name}/task-{N}.md`
```

**Analysis**: The current dispatch block has three problems:
1. It uses `mode: "agent"` with a multi-instruction prompt ("Run /prime first. Then run /planning...") — this is unreliable
2. It doesn't include spec context in the prompt — the model has to discover it
3. It doesn't mention sequential dispatch or sessionId

The replacement needs to:
1. Use two sequential dispatch calls with `mode: "command"` — first `/prime`, then `/planning`
2. Pass the sessionId from the first call to the second
3. Include full spec context (description, acceptance criteria, files touched, patterns) in the `/planning` args

### Current Content: Build State Context (Lines 192-199)

```markdown
1. **Gather context:**
   - Read the spec entry from `.agents/specs/BUILD_ORDER.md` (description, depends, touches, acceptance)
   - Read `.agents/specs/PILLARS.md` for pillar context and gate criteria
   - Read `PRD.md` for product requirements context
   - Read `memory.md` for gotchas and lessons learned
   - Read `.agents/specs/build-state.json` for context from prior specs (if exists)
   - Read relevant codebase files listed in the spec's `touches` field
   - Read patterns from recently completed specs in the same pillar
```

**Analysis**: Step 1 (Gather context) remains unchanged — the build command's executing model still gathers all this context. The change is in how it passes that context to the planning dispatch. Previously, the context was assumed to be available in the session. Now, it must be explicitly included in the `/planning` command args.

### Current Content: Spec Format from BUILD_ORDER.md

```markdown
- [ ] `P1-01` **string-reverse** (light) — Create reverse() function that reverses a string
  - depends: none
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: reverse("hello") returns "olleh", reverse("") returns ""
```

**Analysis**: This is the format of spec entries. The planning dispatch should include ALL of this information inline so the `/planning` model has it without needing to read BUILD_ORDER itself.

### Current Content: Master + Sub-Plan Dispatch (Lines 244-250)

```markdown
#### Master + Sub-Plan Mode (Exception)

4. **Write or dispatch master plan:**
   Same as above but in master mode. The master plan defines phases, task groupings, phase gates.
   - Master plan MUST be ~400-600 lines
   - Each sub-plan MUST be 700-1000 lines
   - Save to: `.agents/features/{spec-name}/plan-master.md` + `.agents/features/{spec-name}/plan-phase-{N}.md`
```

**Analysis**: The master mode dispatch says "Same as above" — so it inherits whatever pattern Task Brief Mode uses. If we update Task Brief Mode, master mode automatically follows. No separate edit needed.

### Patterns to Follow

**Existing dispatch code block pattern** (from `build.md:216-222`):
```
dispatch({
  mode: "agent",
  prompt: "Run /prime first. Then run /planning {spec-id} {spec-name} --auto-approve ...",
  taskType: "planning",
})
```
- Why this pattern: Shows the expected format for dispatch calls in build.md
- How to apply: Replace with two sequential dispatch calls using the same code block style
- Common gotchas: The code blocks in build.md are documentation (not executable code). They show the PATTERN the executing model should follow, not literal function calls.

---

## STEP-BY-STEP TASKS

---

### Step 1: UPDATE `.opencode/commands/build.md` — Replace Step 2 Dispatch Block

**What**: Replace the single-agent dispatch with a sequential two-call pattern using `sessionId` for session reuse, including full spec context.

**IMPLEMENT**:

Current (lines 213-224 of `.opencode/commands/build.md`):
```markdown
4. **Write or dispatch plan:**

   **If dispatch available:**
   ```
   dispatch({
     mode: "agent",
     prompt: "Run /prime first. Then run /planning {spec-id} {spec-name} --auto-approve ...",
     taskType: "planning",
   })
   ```
   The `--auto-approve` flag skips the interactive approval gate in `/planning` Phase 4 — the spec was already approved via BUILD_ORDER.
   Use a T1 thinking model for best results (reasoning produces better plans and task briefs).
```

Replace with:
```markdown
4. **Write or dispatch plan:**

   **If dispatch available — use sequential dispatch (two calls, same session):**

   First, gather the spec context to pass inline:
   ```
   specContext = "Spec: {spec-id} {spec-name} ({depth})\n" +
     "Description: {spec description from BUILD_ORDER}\n" +
     "Depends: {depends field}\n" +
     "Touches: {touches field}\n" +
     "Acceptance: {acceptance criteria}\n" +
     "Patterns from prior specs: {patterns from build-state.json}\n" +
     "Pillar: {pillar name and gate criteria from PILLARS.md}"
   ```

   Then dispatch sequentially — `/prime` first to load context, then `/planning` with full spec details:

   **Call 1: Prime the session**
   ```
   result1 = dispatch({
     mode: "command",
     command: "prime",
     prompt: "",
     taskType: "planning",
     description: "Prime for {spec-name}",
   })
   // Extract session ID from result1 output: **Session ID**: `{id}`
   sessionId = extractSessionId(result1)
   ```

   **Call 2: Run planning in the SAME session**
   ```
   result2 = dispatch({
     mode: "command",
     command: "planning",
     prompt: "{spec-name} --auto-approve\n\nSpec Context:\n{specContext}",
     taskType: "planning",
     sessionId: sessionId,
     description: "Plan {spec-name}",
   })
   ```

   The `--auto-approve` flag skips the interactive approval gate in `/planning` Phase 4 — the spec was already approved via BUILD_ORDER.

   **Why sequential dispatch**: A single prompt with "Run /prime first, then /planning..." is unreliable — models skip steps or truncate. Two explicit command dispatches with shared sessionId ensures both commands run in order with accumulated context.

   **Why spec context inline**: Prior testing showed plan quality drops when the `/planning` model must discover spec details itself. Passing acceptance criteria, files touched, and patterns inline ensures 700+ line plans.
```

**PATTERN**: The existing dispatch code block style in build.md — pseudo-code in fenced code blocks showing the dispatch call parameters.

**IMPORTS**: N/A

**GOTCHA**: 
- The `specContext` is assembled by the executing model from the files it read in step 1 (Gather context). It's not a literal string — it's a pattern showing what to include.
- The `extractSessionId(result1)` is pseudo-code — the executing model parses the markdown output for the `**Session ID**: \`...\`` line.
- Both calls use `taskType: "planning"` for proper routing through the T0 cascade.
- Call 2 uses `mode: "command"` (not "agent") because `/planning` is a slash command.

**VALIDATE**:
```bash
# Verify the sequential dispatch pattern exists
grep -A 3 "sequential dispatch" .opencode/commands/build.md
# Should show "two calls, same session" pattern
grep "sessionId" .opencode/commands/build.md
# Should show sessionId being passed in Call 2
```

---

### Step 2: UPDATE `.opencode/commands/build.md` — Update Dispatch Failure Fallback

**What**: Update the dispatch failure section to account for sequential dispatch failures (either call can fail).

**IMPLEMENT**:

Current (lines 226-231 of `.opencode/commands/build.md`):
```markdown
   **If dispatch unavailable:**
   Write the plan directly using the `/planning` methodology. The primary model gathers context, runs discovery, and produces the structured plan inline.

   **If dispatch fails:**
   - Fall back to the "If dispatch unavailable" path (write the plan inline).
   - Log: "Dispatch failed for planning {spec-name} — falling back to inline planning."
```

Replace with:
```markdown
   **If dispatch unavailable:**
   Write the plan directly using the `/planning` methodology. The primary model gathers context, runs discovery, and produces the structured plan inline.

   **If dispatch fails (either call):**
   - If Call 1 (`/prime`) fails: Fall back to inline planning — the session can't be primed.
   - If Call 2 (`/planning`) fails: Retry once with a new session (Call 1 + Call 2). If retry also fails, fall back to inline planning.
   - Log: "Dispatch failed for planning {spec-name} — falling back to inline planning."
   - Inline planning uses the same spec context gathered in step 1 — nothing is lost.
```

**PATTERN**: Existing fallback pattern at lines 226-231

**IMPORTS**: N/A

**GOTCHA**: The retry logic is simple — create a new session and try both calls again. Don't retry individual calls because a failed `/planning` call on a session that has `/prime` context might have partially consumed the context window.

**VALIDATE**:
```bash
# Verify the updated failure handling
grep -A 5 "dispatch fails" .opencode/commands/build.md
# Should show the per-call failure handling
```

---

### Step 3: UPDATE `.opencode/commands/build.md` — Update Tier Reference

**What**: Update the "Use a T1 thinking model" note to reflect that the T0 cascade now starts with Codex.

**IMPLEMENT**:

The old text (line 224) said:
```markdown
   Use a T1 thinking model for best results (reasoning produces better plans and task briefs).
```

This is now replaced by the sequential dispatch explanation in Step 1, which doesn't have this line. However, verify that no other references to "T1 thinking model" exist in Step 2 that need updating.

The Model Tier Reference table at lines 33-44 is a general reference and doesn't need changes — it maps tiers to generic descriptions, not specific models.

**PATTERN**: N/A — this is a verification step

**IMPORTS**: N/A

**GOTCHA**: Don't change the Model Tier Reference table (lines 33-44) — it's intentionally generic. The specific model routing is in dispatch.ts and model-strategy.md.

**VALIDATE**:
```bash
# Verify no stale "T1 thinking model" references in Step 2
grep -n "T1 thinking" .opencode/commands/build.md
# Should return 0 matches (the old line was replaced in Step 1)
```

---

### Step 4: UPDATE `.opencode/commands/build.md` — Update Master Plan Dispatch Reference

**What**: Ensure the Master + Sub-Plan Mode section (lines 244-250) correctly references the updated dispatch pattern.

**IMPLEMENT**:

Current (lines 244-250 of `.opencode/commands/build.md`):
```markdown
#### Master + Sub-Plan Mode (Exception)

4. **Write or dispatch master plan:**
   Same as above but in master mode. The master plan defines phases, task groupings, phase gates.
   - Master plan MUST be ~400-600 lines
   - Each sub-plan MUST be 700-1000 lines
   - Save to: `.agents/features/{spec-name}/plan-master.md` + `.agents/features/{spec-name}/plan-phase-{N}.md`
```

Replace with:
```markdown
#### Master + Sub-Plan Mode (Exception)

4. **Write or dispatch master plan:**
   Same sequential dispatch pattern as Task Brief Mode above, but pass `--master` flag:
   ```
   prompt: "{spec-name} --auto-approve --master\n\nSpec Context:\n{specContext}"
   ```
   The master plan defines phases, task groupings, phase gates.
   - Master plan MUST be ~400-600 lines
   - Each sub-plan MUST be 700-1000 lines
   - Save to: `.agents/features/{spec-name}/plan-master.md` + `.agents/features/{spec-name}/plan-phase-{N}.md`
```

**PATTERN**: The updated Task Brief Mode dispatch from Step 1

**IMPORTS**: N/A

**GOTCHA**: The `--master` flag tells `/planning` to produce a master plan instead of task briefs. This flag may or may not exist in the current `/planning` command — check before adding. If it doesn't exist, use the existing phrasing and just clarify "Same sequential dispatch pattern as above."

**VALIDATE**:
```bash
# Verify the master plan section references sequential dispatch
grep -A 5 "Master + Sub-Plan Mode" .opencode/commands/build.md
# Should mention "sequential dispatch pattern"
```

---

## TESTING STRATEGY

### Unit Tests

No unit tests — this task modifies `.opencode/commands/build.md` which is a markdown command
file. Covered by manual testing in Level 5.

### Integration Tests

N/A — integration testing requires running `/build` end-to-end. Covered by Level 5 manual review.

### Edge Cases

- **Spec with no depends field**: The `specContext` template handles this — the field is just "Depends: none"
- **Spec with many touches files**: Include all files in the touches field — no truncation
- **build-state.json doesn't exist (first spec)**: The patterns field is empty — specContext includes "Patterns from prior specs: none (first spec)"
- **sessionId extraction fails**: The executing model can't parse the Session ID from dispatch output. The retry/fallback logic handles this — fall back to inline planning.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# File exists and is readable
wc -l .opencode/commands/build.md
# Should be ~930-950 lines (original 926 + ~20 net new lines)
```

### Level 2: Type Safety
```bash
# N/A — markdown file, no type checking
```

### Level 3: Unit Tests
```bash
# N/A — no unit tests for markdown files
```

### Level 4: Integration Tests
```bash
# N/A — covered by Level 5
```

### Level 5: Manual Validation

1. Open `.opencode/commands/build.md` and navigate to Step 2 (search for "### Step 2: Plan")
2. Verify the sequential dispatch pattern shows two calls (Call 1: /prime, Call 2: /planning)
3. Verify Call 2 includes `sessionId: sessionId` referencing Call 1's output
4. Verify Call 2's prompt includes `{specContext}` with all spec fields
5. Verify the `--auto-approve` flag is still documented
6. Verify the failure fallback mentions per-call failure handling
7. Verify the Master + Sub-Plan section references the sequential pattern
8. Read the full Step 2 section end-to-end and verify it flows logically

### Level 6: Cross-Check

- The `sessionId` arg name must match what Task 1 added to dispatch.ts
- The `mode: "command"` + `command: "planning"` pattern must match dispatch.ts command mode
- The `taskType: "planning"` must route to the T0 cascade updated in Task 1

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [ ] Step 2 dispatch uses two sequential calls (Call 1: /prime, Call 2: /planning)
- [ ] Call 2 passes `sessionId` from Call 1's output
- [ ] Call 2 includes full spec context (description, depends, touches, acceptance, patterns, pillar)
- [ ] `--auto-approve` flag still documented
- [ ] Sequential dispatch rationale explained ("Why sequential dispatch" block)
- [ ] Spec context rationale explained ("Why spec context inline" block)
- [ ] Failure fallback updated for per-call failure handling
- [ ] Master + Sub-Plan section references sequential dispatch pattern
- [ ] No stale references to single-agent-prompt pattern

### Runtime (verify after testing/deployment)

- [ ] `/build next` with dispatch available correctly runs sequential /prime → /planning
- [ ] Plan artifacts are created with 700+ line plans
- [ ] Fallback to inline planning works when dispatch fails

---

## HANDOFF NOTES

> Written AFTER execution completes.

### Files Created/Modified

- `.opencode/commands/build.md` — {to be filled after execution}

### Patterns Established

- Sequential dispatch pattern documented in build.md for other commands to follow
- Spec context template for planning dispatch

### State to Carry Forward

- Task 3 must update model-strategy.md to match the T0 cascade and mention sequential dispatch
- The sequential dispatch pattern can be adopted by other build.md steps that dispatch commands

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
- [ ] Brief marked done: rename `task-2.md` → `task-2.done.md`

---

## NOTES

### Key Design Decisions (This Task)

- **Pseudo-code style in build.md**: The dispatch calls are shown as pseudo-code patterns, not literal function calls. The executing model interprets these as instructions for what dispatch tool calls to make. This is consistent with the existing build.md style.
- **specContext as template**: The spec context is assembled at runtime from the files the build command already reads (BUILD_ORDER, PILLARS, build-state.json). The template shows WHAT to include, not literal values.
- **One retry then fallback**: If sequential dispatch fails, retry once with a fresh session. If still fails, fall back to inline planning. This avoids infinite loops while giving a fair second chance.

### Implementation Notes

- The `extractSessionId` pseudo-function parses markdown output. The executing model will use string matching or regex to find `**Session ID**: \`ses_...\`` in the dispatch result.
- The specContext template is intentionally flexible — the executing model fills in actual values from the gathered context. It's not a rigid format.

---

> **Reminder**: Mark this brief done after execution:
> Rename `task-2.md` → `task-2.done.md`
> This signals to `/execute` (via artifact scan) that this task is complete.
