# Task 2 of 2: Update planning.md — Enforce 1-Task-Per-File + Rejection Criteria

> **Feature**: `enforce-comprehensive-task-briefs`
> **Brief Path**: `.agents/features/enforce-comprehensive-task-briefs/task-2.md`
> **Plan Overview**: `.agents/features/enforce-comprehensive-task-briefs/plan.md`

---

## OBJECTIVE

Update the task brief generation instructions in `planning.md` (lines 252-274) so that `/planning` produces comprehensive 700-line briefs by defaulting to 1 task per file, requiring inline content, and rejecting thin briefs.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/commands/planning.md` | UPDATE | Lines 252-274 — task brief generation instructions |

**Out of Scope:**
- Phase 1-4 (Discovery, Explore, Design, Preview) — unchanged
- Phase 5 Step 1 (plan.md generation) — unchanged, including the 700-line hard requirement at line 250
- Master + Sub-Plan Mode section (lines 278-300) — unchanged
- Output section (lines 302-360) — unchanged
- Required sections list content (lines 262-272) — section names stay the same, only the instructions around them change
- The 7-Field Task Format section (lines 399-414) — unchanged
- Template file changes — already done in Task 1

**Dependencies:**
- Task 1 must complete first — the template now has the 1-task-per-file rule, inline content rule, and rejection criteria. This task's instructions in planning.md must use the same language.

---

## PRIOR TASK CONTEXT

**Files Changed in Task 1:**
- `.opencode/templates/TASK-BRIEF-TEMPLATE.md` — Header guidance rewritten to add 5 rules: When to use, Target Length, Self-containment, Granularity (1 task = 1 file), Inline content (paste, don't reference), Rejection criteria (5-point checklist)

**State Carried Forward:**
- The template now uses the language "One task brief = one target file" — planning.md must echo this
- The template now has a "Rejection criteria" block — planning.md must add generation-time enforcement that matches
- The template says "700-1000 lines" — planning.md must keep this target but explain HOW to achieve it

**Known Issues or Deferred Items:**
- None from Task 1

---

## CONTEXT REFERENCES

> IMPORTANT: All relevant content is pasted inline below. Read before implementing.

### Files to Read

- `.opencode/commands/planning.md` (lines 248-276) — The exact section being modified
- `.opencode/templates/TASK-BRIEF-TEMPLATE.md` (lines 1-31) — The updated header from Task 1 (must be consistent)

### Current Content: planning.md Task Brief Generation Instructions (Lines 248-276)

This is the exact current content that will be partially replaced:

```markdown
```

**Hard requirement:** If `plan.md` is under 700 lines, it is REJECTED. Expand code samples, add more context references, add more pattern detail. Code samples must be copy-pasteable, not summaries.

**Step 2: Write task briefs (`task-N.md`) — one per task**

Using `.opencode/templates/TASK-BRIEF-TEMPLATE.md` as the structural reference, write one task brief for each task:

- Save to `.agents/features/{feature}/task-{N}.md`
- Each brief is **self-contained** — `/execute` can run it without reading `plan.md`
- Each brief targets **700-1000 lines** when filled with actual code, steps, and validation
- No advisory sections (no Feature Description, User Story, Problem Statement, Confidence Score — those live in `plan.md`)
- Every line must be operationally useful: steps, exact code, validation commands, acceptance criteria

**Required sections per task brief:**
- Objective (one sentence — the test for "done")
- Scope (files touched, what's out of scope, dependencies)
- Prior Task Context (what was done in task N-1; "None" for task 1)
- Context References (files to read, patterns to follow — with actual code snippets)
- Step-by-Step Tasks (each step: IMPLEMENT with Current/Replace-with blocks, PATTERN, GOTCHA, VALIDATE)
- Testing Strategy (unit, integration, edge cases)
- Validation Commands (L1–L5)
- Acceptance Criteria (Implementation + Runtime checkboxes)
- Handoff Notes (what task N+1 needs to know; omit for last task)
- Completion Checklist

**Task splitting heuristic**: One task brief = one coherent unit of work shippable in a single session. Split when a task touches more than 3-4 files OR requires a conceptual phase boundary. Do NOT force 700 lines for a genuinely simple 1-file change — be proportionate.

---
```

**Problems with current instructions:**

1. **Line 258**: "Each brief targets 700-1000 lines" — states the target but doesn't explain HOW (inline content, 1 file per brief)
2. **Line 266**: "Context References (files to read, patterns to follow — with actual code snippets)" — says "with actual code snippets" but doesn't say "paste inline, not reference"
3. **Line 274**: "Do NOT force 700 lines for a genuinely simple 1-file change — be proportionate" — directly CONTRADICTS line 258. This escape clause is why briefs come out at 116 lines instead of 700. If a 1-file change is "too simple" for 700 lines, the solution is more depth and inline content, not fewer lines.
4. **No splitting heuristic for 1-task-per-file** — current heuristic says "split at 3-4 files" which is too late. By the time a brief covers 3 files, each file gets shallow treatment.
5. **No rejection criteria** — the plan.md has a "REJECTED" rule at line 250, but task briefs have no equivalent enforcement.

### Updated Template Header (From Task 1)

After Task 1, the template header now reads (paraphrased key rules):
- "One task brief = one target file" — default granularity
- "700-1000 lines when filled" — target preserved
- "All context pasted inline in code blocks" — inline content rule
- "Rejection criteria" — 5-point checklist including "under 700 lines", "uses 'see lines X-Y'", "skips sections", "abbreviates Current/Replace blocks", "covers 3+ files without justification"

planning.md instructions must align with these rules.

### Patterns to Follow

**plan.md rejection pattern** (from `planning.md:250`):
```markdown
**Hard requirement:** If `plan.md` is under 700 lines, it is REJECTED. Expand code samples, add more context references, add more pattern detail. Code samples must be copy-pasteable, not summaries.
```
- Why this pattern: The plan.md rejection rule works — it's clear, actionable, and tells the model what to do to fix it. Task briefs need the same enforcement.
- How to apply: Add a matching "Hard requirement" block for task briefs, with the same "REJECTED" language and the same remediation guidance.

---

## STEP-BY-STEP TASKS

---

### Step 1: UPDATE `.opencode/commands/planning.md` — Replace Lines 252-274

**What**: Replace the task brief generation instructions with comprehensive rules that enforce 1-task-per-file, inline content, and rejection criteria.

**IMPLEMENT**:

Current (lines 252-274 of `.opencode/commands/planning.md`):
```markdown
**Step 2: Write task briefs (`task-N.md`) — one per task**

Using `.opencode/templates/TASK-BRIEF-TEMPLATE.md` as the structural reference, write one task brief for each task:

- Save to `.agents/features/{feature}/task-{N}.md`
- Each brief is **self-contained** — `/execute` can run it without reading `plan.md`
- Each brief targets **700-1000 lines** when filled with actual code, steps, and validation
- No advisory sections (no Feature Description, User Story, Problem Statement, Confidence Score — those live in `plan.md`)
- Every line must be operationally useful: steps, exact code, validation commands, acceptance criteria

**Required sections per task brief:**
- Objective (one sentence — the test for "done")
- Scope (files touched, what's out of scope, dependencies)
- Prior Task Context (what was done in task N-1; "None" for task 1)
- Context References (files to read, patterns to follow — with actual code snippets)
- Step-by-Step Tasks (each step: IMPLEMENT with Current/Replace-with blocks, PATTERN, GOTCHA, VALIDATE)
- Testing Strategy (unit, integration, edge cases)
- Validation Commands (L1–L5)
- Acceptance Criteria (Implementation + Runtime checkboxes)
- Handoff Notes (what task N+1 needs to know; omit for last task)
- Completion Checklist

**Task splitting heuristic**: One task brief = one coherent unit of work shippable in a single session. Split when a task touches more than 3-4 files OR requires a conceptual phase boundary. Do NOT force 700 lines for a genuinely simple 1-file change — be proportionate.
```

Replace with:
```markdown
**Step 2: Write task briefs (`task-N.md`) — one per target file**

Using `.opencode/templates/TASK-BRIEF-TEMPLATE.md` as the structural reference, write one task brief for each task:

- Save to `.agents/features/{feature}/task-{N}.md`
- Each brief is **self-contained** — `/execute` can run it without reading `plan.md` or any other file
- Each brief targets **700-1000 lines** — this is achieved by pasting all context inline, not by padding
- No advisory sections (no Feature Description, User Story, Problem Statement, Confidence Score — those live in `plan.md`)
- Every line must be operationally useful: steps, exact code, validation commands, acceptance criteria

**Task splitting heuristic**: One task brief = one target file. This is the default granularity. A brief that modifies `planning.md` is one task; a brief that modifies `TASK-BRIEF-TEMPLATE.md` is a separate task. Multi-file briefs are the exception — only when edits are tightly coupled (e.g., renaming in file A requires updating the import in file B). If a brief covers 3+ files, split it unless you can justify why the files can't be changed independently.

**How briefs reach 700 lines — inline content, not padding:**
- **Context References**: Paste the full current content of every section being modified in code blocks (50-150 lines)
- **Patterns to Follow**: Paste complete reference patterns from other files with analysis (30-80 lines)
- **Current/Replace blocks**: Paste the EXACT current content and COMPLETE replacement content — every line, preserving indentation (50-200 lines per step)
- **All sections filled**: Every section from OBJECTIVE through COMPLETION CHECKLIST must be present and substantive. No empty sections, no "N/A" without explanation.

**Hard requirement:** If a task brief is under 700 lines, it is REJECTED. Expand inline content — paste more of the target file's current content, add more pattern snippets, add more validation steps, add more acceptance criteria. If a brief genuinely can't reach 700 lines for a single file, the task is too small — merge it with an adjacent task or add depth (more edge cases, more validation, more context).

**Required sections per task brief:**
- Objective (one sentence — the test for "done")
- Scope (files touched, what's out of scope, dependencies)
- Prior Task Context (what was done in task N-1; "None" for task 1)
- Context References (files to read with line ranges AND full content pasted inline in code blocks)
- Patterns to Follow (complete code snippets from the codebase — NOT optional, NOT summaries)
- Step-by-Step Tasks (each step: IMPLEMENT with exact Current/Replace-with blocks, PATTERN, GOTCHA, VALIDATE)
- Testing Strategy (unit, integration, edge cases)
- Validation Commands (L1–L5, each level filled or explicitly "N/A" with reason)
- Acceptance Criteria (Implementation + Runtime checkboxes)
- Handoff Notes (what task N+1 needs to know; omit for last task)
- Completion Checklist

**Rejection criteria** — a task brief is REJECTED if it:
- Is under 700 lines
- Uses "see lines X-Y" or "read file Z" instead of pasting content inline
- Skips any required section (every section above must be present)
- Has Current/Replace blocks that abbreviate, summarize, or use "..." to skip lines
- Covers 3+ files without explicit justification
```

**PATTERN**: `planning.md:250` — plan.md rejection rule. Same "REJECTED" language, same actionable remediation.

**IMPORTS**: N/A

**GOTCHA**: This replacement changes lines 252-274 (23 lines) to a longer block (~42 lines). The `---` separator on line 276 and everything below it (Master + Sub-Plan Mode section) must remain unchanged. Match the replacement EXACTLY from `**Step 2: Write task briefs** ...` through the end of the `**Rejection criteria**` block (ending with `- Covers 3+ files without explicit justification`).

Critical: Do NOT modify line 250 (plan.md hard requirement). Do NOT modify lines 262-272 content (the required sections list stays — it's being rewritten with the same sections but stronger language for Context References and Patterns to Follow). The key structural change is: the old "Task splitting heuristic" single line becomes a full section, the "How briefs reach 700 lines" section is new, the "Hard requirement" block is new, and the "Rejection criteria" block is new.

**VALIDATE**:
```bash
# Read planning.md lines 248-300 and verify:
# 1. Line 250 (plan.md hard requirement) is UNCHANGED
# 2. "one per target file" appears in Step 2 heading
# 3. "Task splitting heuristic: One task brief = one target file" appears
# 4. "How briefs reach 700 lines" section exists with 4 bullet points
# 5. "Hard requirement: If a task brief is under 700 lines, it is REJECTED" appears
# 6. "Rejection criteria" block exists with 5 bullet points
# 7. Required sections list is present with all 11 sections
# 8. The "---" separator after the block leads into "### Master + Sub-Plan Mode"
# 9. Master + Sub-Plan Mode section (line 278+) is UNCHANGED
```

---

## TESTING STRATEGY

### Unit Tests
No unit tests — this task modifies a markdown command file. Covered by manual testing in Level 5.

### Integration Tests
N/A — planning command changes are validated when `/planning` next runs on a real feature.

### Edge Cases
- **Single-file features**: A feature with 1 task and 1 file should still produce a 700-line brief. The inline content requirement handles this — paste the full file context, patterns, and validation.
- **Genuinely coupled multi-file edits**: A rename across 2 files is OK as one brief. The rule says "default" not "always." The justification requirement catches abuse.
- **Very large features (15+ tasks)**: Each file still gets its own brief. More files = more briefs, each 700+ lines. This is correct — the master plan system handles phasing, task briefs handle execution depth.
- **Code files vs markdown files**: The inline content rule works for both. For code files: paste the function/class being modified. For markdown: paste the section being modified. Both naturally fill 700 lines when done comprehensively.
- **Backward compatibility**: Existing plans with thin briefs won't retroactively fail. The rules only apply to new `/planning` runs. Old briefs in `.done.md` state are already executed.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# Open planning.md and verify it is valid markdown
# Check that --- separators are in the right places
# Verify no broken formatting in the replaced section
```

### Level 2: Type Safety
N/A — no type-checked code modified.

### Level 3: Unit Tests
N/A — no unit tests for this task (see Testing Strategy).

### Level 4: Integration Tests
N/A — covered by Level 5 manual validation.

### Level 5: Manual Validation

1. Read planning.md lines 248-300 to verify the replacement is correct
2. Verify line 250 (plan.md hard requirement) is UNCHANGED — exact text: `**Hard requirement:** If `plan.md` is under 700 lines, it is REJECTED.`
3. Verify Step 2 heading says "one per target file"
4. Verify "Task splitting heuristic" says "One task brief = one target file"
5. Verify "How briefs reach 700 lines" section has 4 bullets (Context References, Patterns, Current/Replace, All sections)
6. Verify "Hard requirement" block exists for task briefs (separate from plan.md requirement)
7. Verify "Rejection criteria" has exactly 5 bullets matching the template's 5 bullets
8. Verify Required sections list has all 11 sections with strengthened language for Context References and Patterns
9. Verify Master + Sub-Plan Mode section (line 278+) is completely unchanged
10. Verify Output section, Pipeline Handoff section, and After Writing section are unchanged
11. **Success**: All 10 checks pass — the brief generation instructions are comprehensive and consistent with the template
12. **Failure**: If Master + Sub-Plan or any section below changed, revert — only lines 252-274 should change

### Level 6: Cross-Check

Verify consistency between Task 1 (template) and Task 2 (planning command):
- Both use "One task brief = one target file" language
- Both have matching rejection criteria (5 bullet points, same items)
- Both require inline content with "paste, not reference" language
- Both preserve "700-1000 lines" as the target range
- The template defines the structure; planning.md defines the generation rules — they complement, not duplicate

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [ ] Lines 252-274 replaced with expanded instructions
- [ ] Line 250 (plan.md hard requirement) UNCHANGED
- [ ] "one per target file" in Step 2 heading
- [ ] "Task splitting heuristic: One task brief = one target file" present
- [ ] "How briefs reach 700 lines" section with 4 bullets (Context, Patterns, Current/Replace, All sections)
- [ ] "Hard requirement" block for task briefs with "REJECTED" language
- [ ] "Rejection criteria" block with 5 matching bullets
- [ ] Required sections list with all 11 sections
- [ ] Contradictory "be proportionate" line (old line 274) removed
- [ ] Master + Sub-Plan Mode section (line 278+) unchanged
- [ ] Output, Pipeline Handoff, and After Writing sections unchanged
- [ ] Language consistent with updated TASK-BRIEF-TEMPLATE.md from Task 1

### Runtime (verify after testing/deployment)

- [ ] Next `/planning` run produces 700+ line task briefs with inline content
- [ ] Briefs default to 1 file per task
- [ ] Thin briefs (like dispatch-wiring task-1.md at 116 lines) would be rejected under new rules
- [ ] Multi-file briefs still possible when justified

---

## HANDOFF NOTES

> This is the final task. No handoff to a subsequent task.

### Files Created/Modified

- `.opencode/commands/planning.md` — Task brief generation instructions (lines 252-274) replaced with comprehensive rules: 1-task-per-file default, inline content requirement, "How briefs reach 700 lines" section, hard requirement with REJECTED language, rejection criteria block

### Patterns Established

- **Task brief hard requirement**: Mirrors the existing plan.md hard requirement at line 250. Same language, same enforcement pattern.
- **Inline content as the mechanism for 700 lines**: The target is the same, but now the instructions explain HOW to reach it — not by padding, but by depth.

### State to Carry Forward

- After both tasks complete, the next step is `/code-loop enforce-comprehensive-task-briefs` or `/commit`
- Pipeline handoff should point to the appropriate next command
- The first real `/planning` run after these changes is the true validation — it should produce 700+ line briefs naturally

### Known Issues or Deferred Items

- **Runtime validation deferred**: We won't know if `/planning` produces compliant briefs until the next feature is planned. The changes are prescriptive (tell the model what to do) not programmatic (no automated enforcement).
- **Existing thin briefs**: The dispatch-wiring-completion briefs (116-221 lines) are already generated. They won't be retroactively rejected. If we execute that feature, the briefs work — they're just thinner than the new standard.

---

## COMPLETION CHECKLIST

- [ ] Step 1 completed (lines 252-274 replaced)
- [ ] Step 1 VALIDATE checks all passed
- [ ] All validation levels run (L1, L5 manual, L6 cross-check)
- [ ] Manual testing confirms all rules are present and clear
- [ ] Implementation acceptance criteria all checked
- [ ] No regressions in any section outside lines 252-274
- [ ] Handoff notes written (final task — no successor)
- [ ] Brief marked done: rename `task-2.md` → `task-2.done.md`

---

## NOTES

### Key Design Decisions (This Task)

- **Removed the "be proportionate" escape clause entirely**: The old line 274 said "Do NOT force 700 lines for a genuinely simple 1-file change — be proportionate." This is the primary reason briefs come out thin. If a task genuinely can't fill 700 lines, the answer is "merge it with an adjacent task or add more depth" — not "let it be 116 lines."
- **Added "How briefs reach 700 lines" as explicit guidance**: Models follow instructions literally. Telling them "target 700 lines" without saying HOW leads to padding or giving up. The 4-bullet explanation (Context, Patterns, Current/Replace, All sections) gives a concrete mechanism.
- **Mirrored plan.md rejection pattern**: Using the same "REJECTED" language and remediation guidance as the plan.md hard requirement (line 250) creates a consistent enforcement pattern across both artifacts.

### Implementation Notes

- The replacement block is ~42 lines replacing 23 lines. Lines below 274 shift down by ~19 lines. The Master + Sub-Plan Mode section heading was at line 278 — it will now be at ~297. This is fine — `/execute` finds sections by heading, not line number.
- The "Required sections" list is repeated from the old version with two changes: Context References now says "AND full content pasted inline" and Patterns now says "NOT optional, NOT summaries." All other section names are identical.
- The rejection criteria block has exactly 5 bullets matching the template's 5 bullets. If the template is updated in the future, planning.md should be updated to match.
