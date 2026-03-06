# Task 3: Add Oracle Consultation for Architecture Intent

## Objective

Add mandatory Oracle consultation in Phase 2 when intent is classified as Architecture.

## Scope

### Files Touched
- `.opencode/commands/planning.md` — MODIFY (Phase 2 section, ~30 lines added)

### Dependencies
- Task 1 complete — Intent classification exists
- Task 2 complete — Phase 1 captures intent

---

## Prior Task Context

Task 1 added intent classification including Architecture intent with note "Oracle consultation REQUIRED".
Task 2 added intent-specific Phase 1 interview that notes "Oracle consultation is required in Phase 3 for Architecture intent."

Now Phase 2 needs the actual Oracle invocation.

---

## Step-by-Step Tasks

### Step 3.1: Add Oracle Consultation to Phase 2

**IMPLEMENT**: After section "2d. Past plans → `explore` agent" and before "2e. Synthesize findings", add new section:

```markdown
### 2e. Oracle Consultation (Architecture Intent ONLY)

**REQUIRED when intent = Architecture.** Skip for other intents.

Oracle provides strategic consultation on architecture decisions. This is read-only — Oracle advises, does not implement.

```typescript
task(
  subagent_type="oracle",
  run_in_background=false,  // Wait for Oracle's response
  load_skills=[],
  description="Architecture consultation for {feature}",
  prompt=`
    Architecture consultation request:
    
    **Feature**: {feature name}
    **Intent**: Architecture / System Design
    
    **Context from Phase 1 Interview**:
    - Lifespan requirement: {years}
    - Scale requirement: {load expectations}
    - Non-negotiable constraints: {list}
    - Systems to integrate: {list}
    
    **Research Findings**:
    - Current architecture: {from explore agent}
    - External patterns: {from librarian agent}
    
    **Questions for Oracle**:
    1. Given these constraints, what architectural approach do you recommend?
    2. What are the key tradeoffs we should consider?
    3. What failure modes should we design against?
    4. What would you advise against doing?
    
    Provide strategic guidance. Be specific about tradeoffs.
  `
)
```

**Oracle Response Handling:**
- Incorporate Oracle's recommendations into Phase 3 Analysis
- Note Oracle's warnings in risk assessment
- Reference Oracle's guidance in approach decision

---
```

### Step 3.2: Renumber Synthesize Section

**IMPLEMENT**: Current "2e. Synthesise findings" becomes "2f. Synthesize findings"

Update the section header and any references.

### Step 3.3: Update Synthesize to Include Oracle

**IMPLEMENT**: In the synthesize section, add Oracle findings:

```markdown
### 2f. Synthesize findings

Collect results from all background agents (`background_output(task_id="...")`) and summarize:
- "Research found these patterns..." / "Past plan for {X} used this approach..."
- **If Architecture intent**: "Oracle recommends {approach} because {rationale}. Key warnings: {list}."
- Share key file:line references, patterns, and gotchas before moving to Phase 3
```

---

## Validation Commands

```bash
# Verify Oracle section added
grep -n "Oracle Consultation" .opencode/commands/planning.md
grep -n "subagent_type=\"oracle\"" .opencode/commands/planning.md

# Verify section numbering
grep -n "### 2[a-f]\." .opencode/commands/planning.md
```

---

## Acceptance Criteria

- [ ] Oracle consultation section added as 2e
- [ ] Marked as "Architecture Intent ONLY"
- [ ] Uses `run_in_background=false` (wait for response)
- [ ] Prompt includes Phase 1 interview context
- [ ] Response handling documented
- [ ] Synthesize section renumbered to 2f
- [ ] Synthesize includes Oracle findings for Architecture

---

## Completion Checklist

- [ ] Section 2e added for Oracle
- [ ] Section 2f is Synthesize (renumbered)
- [ ] Oracle invocation template complete
- [ ] Architecture intent check documented
