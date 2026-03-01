# Enforce Comprehensive Task Briefs — Implementation Plan

## Feature Description

Make `/planning` produce task briefs that are comprehensive 700-line execution documents by enforcing two rules: (1) one task brief = one target file, and (2) all context must be pasted inline — never "see lines X-Y." The 700-line minimum stays, but becomes naturally achievable because each brief deeply covers a single file with full inline content, complete Current/Replace blocks, and every template section filled.

## User Story

As a developer using the AI coding system, I want task briefs to be comprehensive self-contained execution documents (700+ lines each), so that the executing LLM can work autonomously from the brief alone — without reading external files, guessing at context, or skipping validation steps.

## Problem Statement

The task brief system has a 700-1000 line target per brief, but `/planning` consistently produces thin briefs (116-221 lines for dispatch-wiring-completion, 225-566 lines for distilled-task-briefs). The root causes are:

1. **No 1-task-per-file rule**: Briefs scope to "one unit of work" which is vague. Some briefs touch 4 files (task-9 of dispatch-wiring), leaving no room for depth on any single file.
2. **Reference instead of inline**: Briefs say "see lines 130-142" instead of pasting the actual content. The executing model must then read the file itself, defeating self-containment.
3. **Skipped sections**: Briefs omit PRIOR TASK CONTEXT, TESTING STRATEGY, VALIDATION COMMANDS (structured by level), ACCEPTANCE CRITERIA, HANDOFF NOTES, and COMPLETION CHECKLIST — all required by the template but not enforced.
4. **Contradictory guidance**: `planning.md` line 274 says "Do NOT force 700 lines for a genuinely simple 1-file change — be proportionate" which directly contradicts the 700-line target on line 258.

The template structure (TASK-BRIEF-TEMPLATE.md) is correct — the sections are right. The problem is that the template's enforcement language is weak and the planning command's generation instructions don't require inline content.

## Solution Statement

1. **Add 1-task-per-file as the default granularity rule** to both the template and the planning command. Multi-file briefs become the exception (only when edits are tightly coupled).
2. **Require inline content** — the template and planning command must explicitly state that all context references, patterns, and Current/Replace blocks paste the actual file content, not line-range references.
3. **Add rejection criteria** to the planning command so thin briefs that skip sections or use references instead of inline content are caught.
4. **Remove contradictory "be proportionate" language** that undermines the 700-line minimum.

## Feature Metadata

- **Depth**: light
- **Dependencies**: distilled-task-briefs (done)
- **Estimated tasks**: 2
- **Risk**: Low — markdown-only edits to 2 system files

---

## Context References

### Codebase Files

- `.opencode/templates/TASK-BRIEF-TEMPLATE.md` (all 482 lines) — The template being modified. Key sections: header guidance (lines 1-19), Context References section (lines 87-116), Step-by-Step section (lines 119-316), Validation Commands (lines 345-395)
- `.opencode/commands/planning.md` (lines 248-276) — The task brief generation instructions being modified. Key lines: 258 (700-1000 target), 262-272 (required sections list), 274 (contradictory proportionate guidance)
- `.agents/features/dispatch-wiring-completion/task-1.md` (116 lines) — Example of a thin brief. Missing: header metadata, Prior Task Context, Context References (uses references not inline), Patterns to Follow, structured Validation Commands, Acceptance Criteria, Handoff Notes, Completion Checklist
- `.agents/features/dispatch-wiring-completion/task-9.md` (221 lines) — Example of a brief that partially follows the template but still skips inline content
- `.agents/features/distilled-task-briefs/task-2.md` (566 lines) — Closest to target length, but still under 700

### Gap Analysis: Thin Brief vs Template

Comparing `dispatch-wiring-completion/task-1.md` (116 lines) against the full template:

| Template Section | Lines in Template | task-1.md Status | What's Missing |
|---|---|---|---|
| Header metadata (Feature, Brief Path, Plan Overview) | 3 lines | **Missing** | No provenance — executing model doesn't know which feature/plan this belongs to |
| OBJECTIVE | 5 lines | Present (1 line) | Adequate |
| SCOPE (files table, out of scope, dependencies) | 15 lines | **Partial** — "File to Modify" only | No out-of-scope list, no dependency chain |
| PRIOR TASK CONTEXT | 20 lines | **Missing entirely** | No continuity — executing model doesn't know what task-0 did |
| CONTEXT REFERENCES — Files to Read | 10 lines | **Missing** | Says "lines 130-142" inline but doesn't list as a read-first section |
| CONTEXT REFERENCES — Patterns to Follow | 15 lines | **Missing** | References `/build` 7a pattern in prose but doesn't paste the pattern |
| STEP-BY-STEP — with PATTERN/GOTCHA/VALIDATE per step | 150+ lines | **Partial** — has "Current State" and "Exact Replacement" | No per-step PATTERN, IMPORTS, GOTCHA, VALIDATE sub-fields |
| TESTING STRATEGY (unit, integration, edge cases) | 20 lines | **Missing** | No testing section at all |
| VALIDATION COMMANDS (L1-L6 structured) | 50 lines | **Skeletal** — 5-line "Validation" list | Not structured by level, no commands |
| ACCEPTANCE CRITERIA (checkboxes) | 15 lines | **Missing** | No checkboxes, no verification gate |
| HANDOFF NOTES | 20 lines | **Missing** | No state for next task |
| COMPLETION CHECKLIST | 10 lines | **Missing** | No final gate |
| NOTES (design decisions) | 10 lines | Present (3 lines) | Adequate but thin |

**Estimated line count if all sections filled with inline content**: 700-900 lines — the target is naturally achievable when sections aren't skipped and content is pasted inline.

### How 1-Task-Per-File Enables 700 Lines

When a brief covers one file:
- **Context References** pastes the full relevant sections of that file (50-150 lines of inline content)
- **Patterns to Follow** pastes complete reference patterns from other files (30-80 lines)
- **Current/Replace blocks** contain the exact file content being changed (50-200 lines)
- **Validation** can be specific to that one file (10-20 lines)
- **Acceptance Criteria** can be precise about that file's state (10-15 lines)

When a brief covers 4 files (like task-9):
- Each file gets ~25 lines of context → shallow coverage
- Current/Replace blocks are abbreviated → executing model must read files anyway
- The brief tries to be efficient → skips sections to save space

The 1-file rule makes comprehensiveness the natural path, not a forced padding exercise.

---

## Implementation Plan

### Phase 1: Template Enforcement (Task 1)
Update TASK-BRIEF-TEMPLATE.md header guidance and section instructions to enforce 1-task-per-file and inline content.

### Phase 2: Planning Command Enforcement (Task 2)
Update planning.md task brief generation instructions with the 1-task-per-file rule, inline content requirement, and rejection criteria.

---

## Step-by-Step Tasks

### Task 1: UPDATE `.opencode/templates/TASK-BRIEF-TEMPLATE.md`

- **Brief**: `task-1.md`
- **ACTION**: UPDATE
- **TARGET**: `.opencode/templates/TASK-BRIEF-TEMPLATE.md`
- **Scope**: Rewrite header guidance (lines 1-19) to add 1-task-per-file rule and inline content requirement. Add enforcement language to Context References section (lines 87-97), Patterns to Follow section (lines 99-115), and Step-by-Step section (lines 127-128). No structural changes to sections themselves.

### Task 2: UPDATE `.opencode/commands/planning.md`

- **Brief**: `task-2.md`
- **ACTION**: UPDATE
- **TARGET**: `.opencode/commands/planning.md`
- **Scope**: Rewrite task brief generation instructions (lines 252-274) to add 1-task-per-file as default granularity, require inline content, add rejection criteria for thin briefs, and remove the contradictory "be proportionate" escape clause.

---

## Testing Strategy

### Manual Verification (Both Tasks)
- Read each modified file end-to-end after edits
- Verify the 700-line target is preserved
- Verify 1-task-per-file is stated as the default (not the only option)
- Verify inline content requirement is explicit, not just implied
- Verify rejection criteria would catch the dispatch-wiring-completion thin briefs
- Verify no structural changes to template sections

---

## Validation Commands

```bash
# L1: Verify files exist and are well-formed (manual — open and read)
# L2: N/A — no type-checked code
# L3: N/A — no unit tests for markdown edits
# L5: Manual — read each file, verify rules are clear and enforceable
```

---

## Acceptance Criteria

### Implementation
- [x] TASK-BRIEF-TEMPLATE.md header states 1-task-per-file as default granularity
- [x] TASK-BRIEF-TEMPLATE.md requires inline content (paste, not reference) in Context References and Patterns
- [x] TASK-BRIEF-TEMPLATE.md requires full Current/Replace blocks with exact file content
- [x] planning.md states 1-task-per-file as default splitting heuristic
- [x] planning.md requires inline content in brief generation instructions
- [x] planning.md has rejection criteria for thin/incomplete briefs
- [x] planning.md no longer has contradictory "be proportionate" escape clause
- [x] 700-line minimum target preserved in both files

### Consistency
- [x] Template and planning command use consistent language about the 1-task-per-file rule
- [x] Multi-file briefs are still allowed as an exception (not banned)
- [x] Master plan system is unaffected

### No Regressions
- [x] Template section structure is unchanged (same sections, same order)
- [x] plan.md 700-line hard requirement is unchanged
- [x] Required sections list in planning.md is unchanged (same 10 sections)

## Completion Checklist

- [x] Both tasks implemented
- [x] Each modified file reviewed for consistency
- [x] Rules are clear enough to reject dispatch-wiring-completion style thin briefs
- [x] Pipeline handoff updated

## Notes

- **Key decision**: 1-task-per-file is the default, not an absolute rule. Tightly coupled cross-file edits (e.g., renaming something in file A that requires updating the import in file B) can share a brief. But this is the exception, stated explicitly.
- **Key decision**: "Inline content" means paste the actual text in code blocks. Line-range references (`lines 130-142`) are only used in the Context References "Files to Read" section to tell the executing model what to read FIRST — but the brief must ALSO paste the relevant content inline in the Steps section.
- **Key decision**: The contradictory "be proportionate" language (line 274) is replaced, not just removed. The new language says multi-file briefs are an exception, not that 700 lines can be ignored.
- **Confidence**: 9/10 for one-pass success

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.done.md` | Update TASK-BRIEF-TEMPLATE.md — add 1-task-per-file rule + inline content enforcement | done | 0 created, 1 modified |
| 2 | `task-2.done.md` | Update planning.md — add 1-task-per-file rule + rejection criteria for thin briefs | done | 0 created, 1 modified |
