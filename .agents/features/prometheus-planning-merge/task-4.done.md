# Task 4: Add Metis Consultation to Phase 3

## Objective

Add Metis gap analysis consultation after Phase 3d (Decompose) and before Phase 4 (Preview).

## Scope

### Files Touched
- `.opencode/commands/planning.md` — MODIFY (Phase 3 section, ~50 lines added)

### Dependencies
- Tasks 1-3 complete

---

## Prior Task Context

Phase 3 currently has:
- 3a. Synthesize
- 3b. Analyze
- 3c. Decide
- 3d. Decompose

Metis consultation goes after 3d, becoming 3e.

---

## Step-by-Step Tasks

### Step 4.1: Add Metis Consultation Section

**IMPLEMENT**: After "3d. Decompose" section, add:

```markdown
### 3e. Metis Consultation (Gap Analysis)

**Before presenting the preview**, summon Metis to catch what you might have missed.

Metis is the pre-planning gap analyzer. It identifies hidden assumptions, ambiguities, and potential AI failure points.

```typescript
task(
  subagent_type="metis",
  run_in_background=false,  // Wait for response
  load_skills=[],
  description="Gap analysis for {feature} plan",
  prompt=`
    Review this planning session before I present the preview:
    
    **User's Goal**: 
    {summarize what user wants from Phase 1}
    
    **What We Discussed**:
    {key points from Phase 1 interview}
    
    **My Understanding** (from Synthesis):
    {SYNTHESIS block content}
    
    **Research Findings**:
    {key discoveries from Phase 2}
    
    **Proposed Approach** (from Decide):
    {APPROACH DECISION block content}
    
    **Task Breakdown** (from Decompose):
    {TASK DECOMPOSITION block content}
    
    Please identify:
    1. **Questions I should have asked but didn't** — gaps in discovery
    2. **Guardrails that need to be explicitly set** — scope boundaries missing
    3. **Potential scope creep areas** — where AI might over-build
    4. **Assumptions I'm making that need validation** — implicit assumptions
    5. **Missing acceptance criteria** — how will we know tasks are done
    6. **Edge cases not addressed** — failure modes not covered
    
    Be specific. Reference the task breakdown by task number.
  `
)
```

**Metis Response Handling:**

1. **CRITICAL gaps** (blocks preview):
   - Return to user: "Metis identified a critical gap: {gap}. Let me ask: {question}"
   - Update draft with answer
   - Re-run Metis if needed

2. **MINOR gaps** (fix silently):
   - Incorporate into Phase 4 preview
   - Note in "Guardrails Applied" section

3. **ASSUMPTIONS flagged**:
   - Add to preview as "Assumptions (validate with user)"
   - Ask user to confirm before proceeding

**Update Phase 3 Output Summary:**

By the end of Phase 3, the following are locked in:
- **Synthesis** — distilled understanding
- **Analysis** — dependency graph, risks, failure modes
- **Approach** — chosen approach with reasoning
- **Decomposition** — task list with justification
- **Metis Review** — gaps identified and addressed

---
```

### Step 4.2: Update Phase 4 Preview to Include Metis Findings

**IMPLEMENT**: In Phase 4 preview format, add Metis findings:

```markdown
## Phase 4: Preview (Approval Gate)

Before writing the full plan, show a **1-page preview**:

```
PLAN PREVIEW: {spec-name}
=============================

What:      {1-line description}
Approach:  {the locked-in approach}
Files:     {create: X, modify: Y}
Key decision: {the main architectural choice and why}
Risks:     {top 1-2 risks}
Tests:     {testing approach from Phase 1}
Estimated tasks: {N tasks}
Mode:      {Task Briefs (N briefs, default) | Master + Sub-Plans (N phases, escape hatch)}

Metis Review:
  Gaps addressed: {list of gaps Metis found that were incorporated}
  Assumptions: {list — ask user to validate}
  Guardrails: {explicit scope boundaries}
```

```
Approve this direction to write the full plan? [y/n/adjust]
```

Only write the plan file after explicit approval.
```

---

## Validation Commands

```bash
# Verify Metis section added
grep -n "Metis Consultation" .opencode/commands/planning.md
grep -n "subagent_type=\"metis\"" .opencode/commands/planning.md

# Verify in Phase 3
grep -n "### 3e\." .opencode/commands/planning.md
```

---

## Acceptance Criteria

- [ ] Metis consultation section added as 3e
- [ ] Prompt includes all Phase 3 block contents
- [ ] 6 gap categories listed in prompt
- [ ] Response handling documented (CRITICAL/MINOR/ASSUMPTIONS)
- [ ] Phase 4 preview updated with Metis findings
- [ ] Assumptions ask for user validation

---

## Completion Checklist

- [ ] Section 3e added for Metis
- [ ] Metis invocation template complete
- [ ] Gap handling documented
- [ ] Preview format updated
