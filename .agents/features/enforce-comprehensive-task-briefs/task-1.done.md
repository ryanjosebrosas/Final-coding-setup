# Task 1 of 2: Update TASK-BRIEF-TEMPLATE.md — Enforce 1-Task-Per-File + Inline Content

> **Feature**: `enforce-comprehensive-task-briefs`
> **Brief Path**: `.agents/features/enforce-comprehensive-task-briefs/task-1.md`
> **Plan Overview**: `.agents/features/enforce-comprehensive-task-briefs/plan.md`

---

## OBJECTIVE

Update the TASK-BRIEF-TEMPLATE.md header guidance and section instructions so that task briefs default to 1 target file per brief and require all context to be pasted inline — making the 700-line minimum naturally achievable without padding.

---

## SCOPE

**Files This Task Touches:**

| File | Action | What Changes |
|------|--------|-------------|
| `.opencode/templates/TASK-BRIEF-TEMPLATE.md` | UPDATE | Header guidance (lines 1-19), Context References instructions (lines 87-97), Patterns to Follow instructions (lines 99-115), Step-by-Step instructions (lines 127-128) |

**Out of Scope:**
- Template section structure (same sections, same order — no additions or removals)
- Step placeholder content (Steps 1-7 placeholder blocks stay as-is)
- Testing Strategy, Validation Commands, Acceptance Criteria, Handoff Notes, Completion Checklist, Notes sections — all stay as-is
- plan.md line count requirements — handled in Task 2's file (planning.md)

**Dependencies:**
- None — this is the first task

---

## PRIOR TASK CONTEXT

This is the first task — no prior work. Start fresh from the codebase state.

---

## CONTEXT REFERENCES

> IMPORTANT: Read ALL content below before implementing. The full current content of every section being modified is pasted inline.

### Files to Read

- `.opencode/templates/TASK-BRIEF-TEMPLATE.md` (all 482 lines) — The file being modified. Full content of sections being changed is pasted below.
- `.agents/features/dispatch-wiring-completion/task-1.md` (all 116 lines) — Example of a thin brief that violates the rules we're adding. Use as the "bad example" reference.

### Current Content: TASK-BRIEF-TEMPLATE.md Header Guidance (Lines 1-19)

This is the exact current content of the header block that will be replaced:

```markdown
# Task Brief Template

> Use this for each individual task brief in a feature.
> Save to `.agents/features/{feature}/task-{N}.md` and fill in every section.
>
> **When to use**: One task brief per discrete unit of work. Task briefs are the
> default execution format — produced by `/planning` alongside `plan.md`.
>
> **Target Length**: Each task brief should be **700-1000 lines** when filled.
> Each brief is self-contained — an execution agent can run it without reading
> `plan.md` (the objective and scope sections provide all needed context).
>
> **Self-containment rule**: Every line must be operationally useful.
> No advisory sections (User Story, Problem Statement, Risks, Confidence Score).
> Only: steps, code, validation, and acceptance criteria.
>
> **Scope rule**: One task brief = one coherent unit of work that can be
> shipped in a single `/execute` session. If a task touches more than 3-4 files
> or requires a phase boundary, split into separate briefs.
```

**Problems with current header:**
1. "One task brief per discrete unit of work" — too vague, allows 4-file briefs that are shallow
2. "700-1000 lines when filled" — states the target but gives no mechanism to achieve it
3. "Scope rule" says split at 3-4 files — the default should be 1 file, not 3-4
4. No mention of inline content requirement
5. No mention that "see lines X-Y" references defeat self-containment

### Current Content: Context References Section Instructions (Lines 87-97)

```markdown
## CONTEXT REFERENCES

> IMPORTANT: Read ALL files listed here before implementing. They are not optional.

### Files to Read

> Precise file references with line ranges. Read these before touching anything.

- `path/to/file1` (lines X-Y) — Why: {why this range is critical to understand}
- `path/to/file2` (all {N} lines) — Why: {what to look for / understand}
- `path/to/file3` (lines X-Y) — Why: {specific section relevant to this task}
```

**Problem**: Only asks for file references with line ranges. Doesn't require pasting the actual content inline. An executing model reading this section gets a reading list, not the content itself.

### Current Content: Patterns to Follow Section Instructions (Lines 99-115)

```markdown
### Patterns to Follow

> Include actual code snippets from the codebase — copy-pasteable, not summaries.

**{Pattern Name}** (from `path/to/file:lines`):
```
{actual code snippet from the project — not pseudocode}
```
- Why this pattern: {why to follow it}
- Common gotchas: {what to watch out for}

**{Pattern Name 2}** (from `path/to/file:lines`):
```
{actual code snippet from the project}
```
- Why this pattern: {explanation}
- Common gotchas: {warnings}
```

**Assessment**: This section is actually good — it already says "copy-pasteable, not summaries" and "actual code snippet." The problem is enforcement. Briefs like dispatch-wiring task-1 skip this section entirely. Need to add: this section is NOT optional.

### Current Content: Step-by-Step Section Instructions (Lines 119-128)

```markdown
## STEP-BY-STEP TASKS

> Execute every step in order. Each step is atomic and independently verifiable.
>
> **Action keywords**: CREATE (new files), UPDATE (modify existing), ADD (insert
> new functionality to an existing section), REMOVE (delete deprecated code),
> REFACTOR (restructure without behavior change)
>
> **For text/config/command changes**: Use explicit Current / Replace with blocks.
> This eliminates ambiguity and achieves higher fidelity than prose descriptions.
```

**Problem**: Says "use explicit Current / Replace with blocks" but doesn't require that Current blocks paste the EXACT content from the file. A brief can satisfy this with abbreviated content. Need to add: Current blocks must contain the exact, complete content being replaced — every line, preserving indentation.

### Patterns to Follow

**Comprehensive brief pattern** — This task brief itself demonstrates the target format. Notice:
- Header metadata (Feature, Brief Path, Plan Overview)
- Full inline content of every section being modified (pasted in code blocks)
- Analysis of what's wrong with each section (guiding the replacement)
- Explicit Current/Replace blocks with exact content
- All template sections filled

**Thin brief anti-pattern** — `dispatch-wiring-completion/task-1.md` (116 lines):
```markdown
# Task 1: Wire `/code-review` Step 4 with Concrete Dispatch Calls

## Objective
Replace the prose table in `/code-review` Step 4 (lines 130-142) with concrete...

## File to Modify
`.opencode/commands/code-review.md`

## Current State (lines 130-142)
{pasted content — good}

## Target State
{prose description of design decisions — good}

## Exact Replacement Content
{pasted replacement — good}

## Validation
{5-line list — too thin}

## Notes
{3 lines}
```

What's missing from this brief:
- No header metadata (Feature, Brief Path, Plan Overview)
- No SCOPE section (out of scope, dependencies)
- No PRIOR TASK CONTEXT
- No CONTEXT REFERENCES — doesn't paste the `/build` 7a pattern it references
- No PATTERN/IMPORTS/GOTCHA/VALIDATE per step
- No TESTING STRATEGY
- No structured VALIDATION COMMANDS (L1-L5)
- No ACCEPTANCE CRITERIA checkboxes
- No HANDOFF NOTES
- No COMPLETION CHECKLIST

Result: 116 lines instead of 700+. The executing model gets the replacement content but no context, no validation depth, and no completion gate.

---

## STEP-BY-STEP TASKS

---

### Step 1: UPDATE `.opencode/templates/TASK-BRIEF-TEMPLATE.md` — Header Guidance (Lines 1-19)

**What**: Replace the header guidance block with new rules: 1-task-per-file default, inline content requirement, and explicit rejection criteria.

**IMPLEMENT**:

Current (lines 1-19 of `.opencode/templates/TASK-BRIEF-TEMPLATE.md`):
```markdown
# Task Brief Template

> Use this for each individual task brief in a feature.
> Save to `.agents/features/{feature}/task-{N}.md` and fill in every section.
>
> **When to use**: One task brief per discrete unit of work. Task briefs are the
> default execution format — produced by `/planning` alongside `plan.md`.
>
> **Target Length**: Each task brief should be **700-1000 lines** when filled.
> Each brief is self-contained — an execution agent can run it without reading
> `plan.md` (the objective and scope sections provide all needed context).
>
> **Self-containment rule**: Every line must be operationally useful.
> No advisory sections (User Story, Problem Statement, Risks, Confidence Score).
> Only: steps, code, validation, and acceptance criteria.
>
> **Scope rule**: One task brief = one coherent unit of work that can be
> shipped in a single `/execute` session. If a task touches more than 3-4 files
> or requires a phase boundary, split into separate briefs.
```

Replace with:
```markdown
# Task Brief Template

> Use this for each individual task brief in a feature.
> Save to `.agents/features/{feature}/task-{N}.md` and fill in every section.
>
> **When to use**: One task brief per target file. Task briefs are the
> default execution format — produced by `/planning` alongside `plan.md`.
>
> **Target Length**: Each task brief should be **700-1000 lines** when filled.
> Each brief is self-contained — an execution agent can run it without reading
> `plan.md` or any other file. All context is pasted inline.
>
> **Self-containment rule**: Every line must be operationally useful.
> No advisory sections (User Story, Problem Statement, Risks, Confidence Score).
> Only: steps, code, validation, and acceptance criteria.
>
> **Granularity rule**: One task brief = one target file. This is the default
> because depth on one file naturally fills 700 lines when you paste full context
> inline, include complete Current/Replace blocks, and fill every section below.
> Multi-file briefs are the exception — only when edits are tightly coupled
> (e.g., renaming something in file A requires updating the import in file B).
>
> **Inline content rule**: All context must be pasted directly into the brief
> in code blocks. Never write "see lines X-Y" or "read file Z" as a substitute
> for pasting the content. The executing model works from the brief alone.
> Line-range references in the "Files to Read" section tell the model what to
> verify — but the brief itself must contain the content needed to implement.
>
> **Rejection criteria** — a brief is REJECTED if it:
> - Is under 700 lines
> - Uses "see lines X-Y" instead of pasting content inline
> - Skips any section below (every section from OBJECTIVE through COMPLETION CHECKLIST is required)
> - Has Current/Replace blocks that abbreviate or summarize instead of pasting exact content
> - Covers 3+ files without explicit justification for why they can't be separate briefs
```

**PATTERN**: This task brief's own header (lines 1-7 above) — demonstrates the comprehensive format.

**IMPORTS**: N/A

**GOTCHA**: The replacement is longer than the original (31 lines vs 19 lines). Make sure to replace EXACTLY lines 1-19 (from `# Task Brief Template` through the line ending with `split into separate briefs.`). Line 20 (`---`) and everything below it stays unchanged.

**VALIDATE**:
```bash
# Read TASK-BRIEF-TEMPLATE.md lines 1-35 and verify:
# 1. "One task brief = one target file" appears
# 2. "Inline content rule" section exists
# 3. "Rejection criteria" section exists with 5 bullet points
# 4. "700-1000 lines" target is preserved
# 5. Line after the header block is still "---"
```

---

### Step 2: UPDATE `.opencode/templates/TASK-BRIEF-TEMPLATE.md` — Context References Instructions (Lines 87-97)

**What**: Add inline content enforcement to the Files to Read section — the section must list files AND the brief must paste relevant content inline.

**IMPLEMENT**:

Current (lines 87-97 of `.opencode/templates/TASK-BRIEF-TEMPLATE.md`):
```markdown
## CONTEXT REFERENCES

> IMPORTANT: Read ALL files listed here before implementing. They are not optional.

### Files to Read

> Precise file references with line ranges. Read these before touching anything.

- `path/to/file1` (lines X-Y) — Why: {why this range is critical to understand}
- `path/to/file2` (all {N} lines) — Why: {what to look for / understand}
- `path/to/file3` (lines X-Y) — Why: {specific section relevant to this task}
```

Replace with:
```markdown
## CONTEXT REFERENCES

> IMPORTANT: Read ALL files listed here before implementing. They are not optional.
> All relevant content MUST be pasted inline in this section or in the Steps below.
> The executing model works from the brief alone — "see lines X-Y" is not enough.

### Files to Read

> List files with line ranges for the executing model to verify against.
> Then paste the actual content inline in code blocks below each reference.
> This is what makes the brief self-contained and worth 700+ lines.

- `path/to/file1` (lines X-Y) — Why: {why this range is critical to understand}
- `path/to/file2` (all {N} lines) — Why: {what to look for / understand}
- `path/to/file3` (lines X-Y) — Why: {specific section relevant to this task}

### Current Content: {File 1 Section Name} (Lines X-Y)

> Paste the exact content from the file in a code block. This is NOT optional.
> The executing model reads this instead of opening the file.

```
{exact content from path/to/file1, lines X-Y — every line, preserving indentation}
```

**Analysis**: {What to notice in this content. What the executing model needs to understand before modifying it.}

### Current Content: {File 2 Section Name} (Lines X-Y)

```
{exact content from path/to/file2, lines X-Y}
```

**Analysis**: {What to notice, what's relevant to this task.}
```

**PATTERN**: This task brief's own Context References section (above) — pastes full content of every section being modified.

**IMPORTS**: N/A

**GOTCHA**: The replacement adds the `### Current Content:` sub-section pattern. This is a template — the `{placeholders}` are instructions to the planning agent filling in the brief, not content for the executing agent. Keep placeholders in `{}` braces.

**VALIDATE**:
```bash
# Read TASK-BRIEF-TEMPLATE.md lines 87-120 and verify:
# 1. "All relevant content MUST be pasted inline" appears in the section intro
# 2. "The executing model works from the brief alone" appears
# 3. "### Current Content:" sub-section pattern exists with paste instructions
# 4. Code block placeholder shows "{exact content from path/to/file}"
```

---

### Step 3: UPDATE `.opencode/templates/TASK-BRIEF-TEMPLATE.md` — Patterns to Follow Instructions (Lines 99-115)

**What**: Strengthen the Patterns to Follow section to make it non-optional and require complete snippets.

**IMPLEMENT**:

Note: After Step 2, the line numbers will have shifted. Find the `### Patterns to Follow` section (originally lines 99-115) — it will now be later in the file due to the expanded Context References section.

Current content of the Patterns to Follow section:
```markdown
### Patterns to Follow

> Include actual code snippets from the codebase — copy-pasteable, not summaries.

**{Pattern Name}** (from `path/to/file:lines`):
```
{actual code snippet from the project — not pseudocode}
```
- Why this pattern: {why to follow it}
- Common gotchas: {what to watch out for}

**{Pattern Name 2}** (from `path/to/file:lines`):
```
{actual code snippet from the project}
```
- Why this pattern: {explanation}
- Common gotchas: {warnings}
```

Replace with:
```markdown
### Patterns to Follow

> This section is NOT optional. Every task has at least one pattern to follow.
> Include COMPLETE code snippets from the codebase — copy-pasteable, not summaries.
> If the task creates a new file, the pattern is the closest existing analog.
> If the task modifies a file, the pattern is the established style in that file.

**{Pattern Name}** (from `path/to/file:lines`):
```
{actual code snippet from the project — complete, not abbreviated.
 Include enough surrounding context that the executing model understands
 the structure, not just the specific lines being referenced.
 Typical: 20-50 lines per pattern snippet.}
```
- Why this pattern: {why to follow it}
- How to apply: {how this pattern maps to the current task's implementation}
- Common gotchas: {what to watch out for}

**{Pattern Name 2}** (from `path/to/file:lines`):
```
{actual code snippet from the project — complete}
```
- Why this pattern: {explanation}
- How to apply: {mapping to this task}
- Common gotchas: {warnings}
```

**PATTERN**: This brief's own Patterns to Follow section — includes the full thin brief content as an anti-pattern example.

**IMPORTS**: N/A

**GOTCHA**: The `### Patterns to Follow` heading must remain at heading level 3 (###). Don't change the heading level. The key additions are: "NOT optional", "complete, not abbreviated", "20-50 lines per pattern snippet", and the new "How to apply" field.

**VALIDATE**:
```bash
# Find "### Patterns to Follow" in the file and verify:
# 1. "This section is NOT optional" appears
# 2. "complete, not abbreviated" appears in the code block placeholder
# 3. "20-50 lines per pattern snippet" guidance exists
# 4. "How to apply" field added to each pattern block
```

---

### Step 4: UPDATE `.opencode/templates/TASK-BRIEF-TEMPLATE.md` — Step-by-Step Instructions (Lines 119-128)

**What**: Strengthen the Step-by-Step section introduction to require exact content in Current/Replace blocks.

**IMPLEMENT**:

Current content of the Step-by-Step section intro (originally lines 119-128):
```markdown
## STEP-BY-STEP TASKS

> Execute every step in order. Each step is atomic and independently verifiable.
>
> **Action keywords**: CREATE (new files), UPDATE (modify existing), ADD (insert
> new functionality to an existing section), REMOVE (delete deprecated code),
> REFACTOR (restructure without behavior change)
>
> **For text/config/command changes**: Use explicit Current / Replace with blocks.
> This eliminates ambiguity and achieves higher fidelity than prose descriptions.
```

Replace with:
```markdown
## STEP-BY-STEP TASKS

> Execute every step in order. Each step is atomic and independently verifiable.
>
> **Action keywords**: CREATE (new files), UPDATE (modify existing), ADD (insert
> new functionality to an existing section), REMOVE (delete deprecated code),
> REFACTOR (restructure without behavior change)
>
> **Current / Replace with blocks are mandatory for all file edits.**
> - **Current blocks**: Paste the EXACT content from the file — every line,
>   preserving indentation. Never abbreviate, summarize, or use "..." to skip
>   lines. The executing model matches this content to find the edit location.
> - **Replace with blocks**: Paste the COMPLETE new content, ready to paste
>   directly into the file. Include all lines, not just the changed ones.
> - **Context window**: Include 2-3 unchanged lines above and below the edit
>   to anchor the replacement location unambiguously.
```

**PATTERN**: This brief's own Step-by-Step section — every step has full Current/Replace blocks with exact content.

**IMPORTS**: N/A

**GOTCHA**: The Step placeholder blocks (Steps 1-7 starting at line 132) stay exactly as-is. Only the section introduction (the `>` block quote at the top) changes.

**VALIDATE**:
```bash
# Find "## STEP-BY-STEP TASKS" in the file and verify:
# 1. "Current / Replace with blocks are mandatory" appears
# 2. "EXACT content from the file — every line" appears
# 3. "Never abbreviate, summarize, or use '...'" appears
# 4. "2-3 unchanged lines above and below" guidance exists
# 5. Step 1 placeholder block (### Step 1:) follows unchanged
```

---

## TESTING STRATEGY

### Unit Tests
No unit tests — this task modifies a markdown template file. Covered by manual testing in Level 5.

### Integration Tests
N/A — template changes are validated when `/planning` next runs and produces briefs.

### Edge Cases
- Template must still be usable for code files (not just markdown edits) — verify the inline content rule works for TypeScript/Python/etc.
- Template must still allow multi-file briefs as an exception — verify the granularity rule says "default" not "always"
- Template step placeholders (Steps 1-7) must be unchanged — verify no accidental modification
- The header block is now longer (~31 lines vs 19 lines) — verify it doesn't break the `---` separator on line 20 (now shifted)

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# Open TASK-BRIEF-TEMPLATE.md and verify it is valid markdown
# Check that --- separators are in the right places
# Verify no broken code block fences (matching ``` pairs)
```

### Level 2: Type Safety
N/A — no type-checked code modified.

### Level 3: Unit Tests
N/A — no unit tests for this task (see Testing Strategy).

### Level 4: Integration Tests
N/A — covered by Level 5 manual validation.

### Level 5: Manual Validation

1. Read the entire TASK-BRIEF-TEMPLATE.md from top to bottom
2. Verify the header block contains all 5 rules: When to use, Target Length, Self-containment, Granularity, Inline content, Rejection criteria
3. Verify the CONTEXT REFERENCES section requires pasting content inline with `### Current Content:` sub-sections
4. Verify the Patterns to Follow section says "NOT optional" and requires complete snippets
5. Verify the STEP-BY-STEP section requires exact Current/Replace blocks
6. Verify ALL sections below Step 7 (Testing Strategy through end of file) are UNCHANGED
7. **Success**: All 5 rules present in header, inline content enforced in 3 sections, everything else unchanged
8. **Failure**: If any section below Step 7 was modified, revert — those sections don't change in this task

### Level 6: Cross-Check

Verify consistency with Task 2's target (planning.md):
- The 1-task-per-file rule in the template matches the splitting heuristic that will be added to planning.md
- The rejection criteria in the template matches what planning.md will enforce during generation
- Both files use "700-1000 lines" as the target range

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [ ] Header block rewritten with 5 rules: When to use, Target Length, Self-containment, Granularity, Inline content, Rejection criteria
- [ ] "One task brief = one target file" stated as default granularity
- [ ] Multi-file briefs explicitly allowed as exception with justification requirement
- [ ] "Inline content rule" section exists with clear "never write see lines X-Y" language
- [ ] "Rejection criteria" list with 5 bullet points for thin brief detection
- [ ] CONTEXT REFERENCES section requires pasting content inline with `### Current Content:` pattern
- [ ] Patterns to Follow section marked "NOT optional" with "complete, not abbreviated" requirement
- [ ] STEP-BY-STEP section requires exact Current/Replace blocks with "never abbreviate" language
- [ ] "700-1000 lines" target preserved
- [ ] ALL sections from TESTING STRATEGY through end of file are unchanged
- [ ] ALL step placeholders (Steps 1-7) are unchanged

### Runtime (verify after testing/deployment)

- [ ] Next `/planning` run produces task briefs that follow the new template rules
- [ ] Task briefs hit 700+ lines naturally with inline content
- [ ] Briefs like dispatch-wiring task-1.md (116 lines) would be rejected under new rules

---

## HANDOFF NOTES

> Written AFTER execution completes. These feed into Task 2's "Prior Task Context" section.

### Files Created/Modified

- `.opencode/templates/TASK-BRIEF-TEMPLATE.md` — Header guidance rewritten (lines 1-19 → 1-31), Context References section strengthened (inline paste requirement + Current Content sub-sections), Patterns to Follow section marked non-optional with complete snippet requirement, Step-by-Step intro strengthened with exact Current/Replace block requirement

### Patterns Established

- **Granularity rule**: "One task brief = one target file" as stated default
- **Inline content rule**: "All context pasted in code blocks — never 'see lines X-Y'"
- **Rejection criteria pattern**: 5-point checklist for detecting thin briefs

### State to Carry Forward

- Task 2 must use the same language ("one target file", "inline content", "rejection criteria") for consistency with the template
- The template is now the structural reference; planning.md is the generation instruction set — they must agree

### Known Issues or Deferred Items

- The template is now ~494 lines of structure (up from 482). This is fine — it's a template, not a brief.
- The actual validation of whether `/planning` produces compliant briefs is deferred to runtime testing

---

## COMPLETION CHECKLIST

- [ ] All 4 steps completed in order
- [ ] Each step's VALIDATE check executed and passed
- [ ] All validation levels run (L1, L5 manual, L6 cross-check)
- [ ] Manual testing confirms all header rules are present and clear
- [ ] Implementation acceptance criteria all checked
- [ ] No regressions in sections below Step 7 placeholder
- [ ] Handoff notes written for Task 2
- [ ] Brief marked done: rename `task-1.md` → `task-1.done.md`

---

## NOTES

### Key Design Decisions (This Task)

- **Added rules to existing structure, didn't restructure**: The template's sections are correct. The problem was weak enforcement language, not missing sections. Adding rules to the header and section intros is the minimal change.
- **Rejection criteria in the template, not just planning.md**: Putting rejection criteria in the template means ANY tool that reads the template (not just `/planning`) knows the quality bar. The planning command's rejection criteria (Task 2) echoes these but adds generation-specific rules.
- **"Default" not "always" for 1-task-per-file**: Absolute rules get gamed. Stating it as the default with an explicit exception path (tightly coupled cross-file edits) is more robust.

### Implementation Notes

- The header block grows from 19 to ~31 lines. The `---` separator (originally line 20) shifts down. All line numbers in the rest of the file shift by ~12 lines. Steps 2-4 must find content by section heading, not line number.
- Code block fences inside code blocks can cause markdown rendering issues. The template has nested code blocks (pattern snippets inside code block examples). Verify fence matching after edits.
- The "How to apply" field added to Patterns is new — existing briefs don't have it. This is forward-looking guidance, not a retroactive requirement.
