# Task 2: Update /planning Command Syntax

## Objective

Update the `/planning` command (`.opencode/commands/planning.md`) to replace all "Agent tool" references with the correct `task(subagent_type="...")` syntax that actually works with the TypeScript agent registry.

## Scope

### Files Touched
- `.opencode/commands/planning.md` — MODIFY

### What's Out of Scope
- Other commands (handled in task 3)
- Registry changes (verified complete in task 1)
- Skill file changes

### Dependencies
- Task 1 complete — Registry verified

## Prior Task Context

Task 1 verified that the registry has properly configured `explore` and `librarian` agents ready for invocation. Both have:
- `mode: "subagent"` — Can be invoked via task()
- `archonEnabled: true` — Can use Archon RAG
- Proper fallback chains

---

## Context References

### Current Broken Syntax in planning.md

The command currently uses non-existent "Agent tool" syntax:

```markdown
### 2a. Codebase research → delegate to `research-codebase` subagent (Haiku)

Use the Agent tool to invoke the `research-codebase` subagent with a prompt covering:
- Feature being built and key integration points to find
- Patterns to look for (naming conventions, error handling, testing)
- Specific files or directories likely relevant

The subagent returns: file:line references, patterns found, gotchas, integration points.

### 2b. Knowledge base (if Archon connected) → delegate to `archon-retrieval` subagent (Haiku)

Use the Agent tool to invoke the `archon-retrieval` subagent with:
- 2-5 keyword queries for the feature's key concepts
- Ask for both docs and code examples

The subagent returns: matched documentation excerpts and code examples with source references.

### 2c. External docs (if needed) → delegate to `research-external` subagent (Haiku)

Use the Agent tool to invoke the `research-external` subagent with:
- Libraries/APIs involved and what specifically to look up
- Any known version constraints

The subagent returns: relevant docs, best practices, pitfalls.

### 2d. Past plans → delegate to `planning-research` subagent (Haiku)

Use the Agent tool to invoke the `planning-research` subagent with:
- Feature name and short description
- Ask it to scan `.agents/features/*/plan.done.md` for similar features and reusable patterns

The subagent returns: prior decisions, reusable patterns, lessons learned.
```

### Agent Mapping for Replacement

| Current Reference | Replace With |
|-------------------|--------------|
| `research-codebase` subagent | `task(subagent_type="explore", ...)` |
| `archon-retrieval` subagent | `task(subagent_type="librarian", ...)` |
| `research-external` subagent | `task(subagent_type="librarian", ...)` |
| `planning-research` subagent | `task(subagent_type="explore", ...)` |

---

## Patterns to Follow

### Pattern: task() Invocation in Command Markdown

Commands should show the exact TypeScript syntax to use:

```markdown
### 2a. Codebase research → `explore` agent

Invoke the explore agent for internal codebase search:

\`\`\`typescript
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find patterns for {feature}",
  prompt=\`
    I'm building {feature description}. Find:
    - Key integration points in {likely directories}
    - Naming conventions and patterns used
    - Error handling approaches
    - Test patterns if they exist
    
    Return: file:line references, patterns found, gotchas, integration points.
  \`
)
\`\`\`
```

---

## Step-by-Step Tasks

### Step 2.1: Update Section 2a (Codebase Research)

**IMPLEMENT**: Replace the research-codebase reference

**Current** (lines ~71-78):
```markdown
### 2a. Codebase research → delegate to `research-codebase` subagent (Haiku)

Use the Agent tool to invoke the `research-codebase` subagent with a prompt covering:
- Feature being built and key integration points to find
- Patterns to look for (naming conventions, error handling, testing)
- Specific files or directories likely relevant

The subagent returns: file:line references, patterns found, gotchas, integration points.
```

**Replace with**:
```markdown
### 2a. Codebase research → `explore` agent

Invoke the explore agent for internal codebase search. Run in background for parallel execution:

\`\`\`typescript
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find codebase patterns for {feature}",
  prompt=\`
    [CONTEXT]: Building {feature} — need to understand existing codebase patterns
    [GOAL]: Find integration points and patterns to follow
    [DOWNSTREAM]: Will use findings to inform implementation approach
    [REQUEST]: Find:
    - Key integration points in likely directories
    - Naming conventions and patterns used
    - Error handling approaches
    - Test patterns if they exist
    
    Return: file:line references, patterns found, gotchas, integration points.
  \`
)
\`\`\`

The explore agent returns structured findings from the internal codebase.
```

**VALIDATE**: Syntax is correct TypeScript, subagent_type is "explore"

**GOTCHA**: Must use `run_in_background=true` for parallel execution

### Step 2.2: Update Section 2b (Knowledge Base / Archon)

**IMPLEMENT**: Replace the archon-retrieval reference

**Current** (lines ~80-87):
```markdown
### 2b. Knowledge base (if Archon connected) → delegate to `archon-retrieval` subagent (Haiku)

Use the Agent tool to invoke the `archon-retrieval` subagent with:
- 2-5 keyword queries for the feature's key concepts
- Ask for both docs and code examples

The subagent returns: matched documentation excerpts and code examples with source references.
```

**Replace with**:
```markdown
### 2b. Knowledge base (if Archon connected) → `librarian` agent

The librarian agent has `archonEnabled: true` and can search the Archon knowledge base:

\`\`\`typescript
task(
  subagent_type="librarian",
  run_in_background=true,
  load_skills=[],
  description="Search knowledge base for {feature} patterns",
  prompt=\`
    [CONTEXT]: Building {feature} — need relevant documentation and examples
    [GOAL]: Find authoritative docs and code examples from knowledge base
    [DOWNSTREAM]: Will use findings to inform implementation patterns
    [REQUEST]: Search for:
    - 2-5 keyword queries for key concepts: {keywords}
    - Both documentation and code examples
    - Focus on production patterns, skip tutorials
    
    Return: matched documentation excerpts and code examples with source references.
  \`
)
\`\`\`

The librarian agent automatically uses Archon RAG when connected.
```

**VALIDATE**: Syntax is correct, mentions archonEnabled

### Step 2.3: Update Section 2c (External Docs)

**IMPLEMENT**: Replace the research-external reference

**Current** (lines ~89-96):
```markdown
### 2c. External docs (if needed) → delegate to `research-external` subagent (Haiku)

Use the Agent tool to invoke the `research-external` subagent with:
- Libraries/APIs involved and what specifically to look up
- Any known version constraints

The subagent returns: relevant docs, best practices, pitfalls.
```

**Replace with**:
```markdown
### 2c. External docs (if needed) → `librarian` agent

For external documentation beyond the knowledge base:

\`\`\`typescript
task(
  subagent_type="librarian",
  run_in_background=true,
  load_skills=[],
  description="Find external docs for {library/API}",
  prompt=\`
    [CONTEXT]: Building {feature} with {library/API}
    [GOAL]: Find official documentation and best practices
    [DOWNSTREAM]: Will use findings to implement correctly
    [REQUEST]: Look up:
    - Official documentation for {library/API}
    - Version-specific constraints: {versions}
    - Best practices and common pitfalls
    
    Return: relevant docs, best practices, pitfalls to avoid.
  \`
)
\`\`\`

The librarian agent searches GitHub, Context7, and web sources for documentation.
```

**VALIDATE**: Uses same "librarian" agent as 2b

### Step 2.4: Update Section 2d (Past Plans)

**IMPLEMENT**: Replace the planning-research reference

**Current** (lines ~98-104):
```markdown
### 2d. Past plans → delegate to `planning-research` subagent (Haiku)

Use the Agent tool to invoke the `planning-research` subagent with:
- Feature name and short description
- Ask it to scan `.agents/features/*/plan.done.md` for similar features and reusable patterns

The subagent returns: prior decisions, reusable patterns, lessons learned.
```

**Replace with**:
```markdown
### 2d. Past plans → `explore` agent

Search completed plans for patterns and lessons learned:

\`\`\`typescript
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find similar past plans for {feature}",
  prompt=\`
    [CONTEXT]: Planning {feature} — want to learn from past work
    [GOAL]: Find similar completed plans and extract reusable patterns
    [DOWNSTREAM]: Will use findings to avoid repeating mistakes
    [REQUEST]: Scan:
    - .agents/features/*/plan.done.md for similar features
    - Look for: prior architectural decisions, reusable patterns, lessons learned
    - Match on: {keywords related to feature}
    
    Return: prior decisions, reusable patterns, gotchas to avoid.
  \`
)
\`\`\`

The explore agent searches the internal codebase including completed plan artifacts.
```

**VALIDATE**: Uses "explore" agent for internal search

### Step 2.5: Update Phase 5 Plan Writing References

**IMPLEMENT**: If planning.md references a `plan-writer` subagent, update to use category dispatch

Search for and update any references like:
```markdown
delegate to `plan-writer` subagent
```

Replace with:
```markdown
### 5. Write Plan Artifacts

Use category dispatch with the writing category and planning-methodology skill:

\`\`\`typescript
task(
  category="writing",
  load_skills=["planning-methodology"],
  run_in_background=false,  // Wait for result
  description="Write plan.md for {feature}",
  prompt=\`
    Create the plan.md and task briefs for {feature}.
    
    Context from Phase 1-4:
    {synthesis, analysis, approach decision, decomposition}
    
    Output: plan.md (700-1000 lines) + task-N.md briefs
  \`
)
\`\`\`
```

**VALIDATE**: Uses category dispatch, not subagent_type

---

## Testing Strategy

### Manual Verification
- Read updated planning.md and verify all `task()` calls have correct syntax
- Verify no "Agent tool" references remain
- Verify subagent_type values match registry agent names

### Syntax Check
- All TypeScript code blocks should be valid syntax
- All subagent_type values should be: explore, librarian, oracle, metis, momus, prometheus, sisyphus, hephaestus, atlas, sisyphus-junior, multimodal-looker

---

## Validation Commands

```bash
# L1: Lint (no TypeScript in .md files to lint)
# N/A

# L2: Types (no TypeScript in .md files to check)
# N/A

# L3: Manual syntax verification
grep -n "Agent tool" .opencode/commands/planning.md
# Should return 0 results

grep -n "subagent_type" .opencode/commands/planning.md
# Should show the new task() calls
```

---

## Acceptance Criteria

### Implementation
- [ ] Section 2a updated: `research-codebase` → `explore`
- [ ] Section 2b updated: `archon-retrieval` → `librarian`
- [ ] Section 2c updated: `research-external` → `librarian`
- [ ] Section 2d updated: `planning-research` → `explore`
- [ ] Phase 5 updated: `plan-writer` → category dispatch (if applicable)
- [ ] No "Agent tool" references remain

### Runtime
- [ ] `/planning {feature}` command is syntactically valid
- [ ] All task() calls use valid subagent_type values

---

## Handoff Notes

Task 2 updates the largest command file. Key changes:
- 4 agent invocations updated in Phase 2
- May have Phase 5 plan-writer reference to update
- All "Agent tool" references replaced with `task()` syntax

Task 3 should follow the same pattern for `/code-review` command.

---

## Completion Checklist

- [ ] Read current planning.md completely
- [ ] Updated section 2a (codebase research)
- [ ] Updated section 2b (knowledge base)
- [ ] Updated section 2c (external docs)
- [ ] Updated section 2d (past plans)
- [ ] Updated Phase 5 if plan-writer referenced
- [ ] Grep confirms no "Agent tool" references remain
- [ ] All subagent_type values are valid registry names
