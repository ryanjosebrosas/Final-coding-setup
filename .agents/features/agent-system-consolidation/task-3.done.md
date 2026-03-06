# Task 3: Update /code-review Command Syntax

## Objective

Update the `/code-review` command (`.opencode/commands/code-review.md`) to replace any "Agent tool" references with the correct `task()` syntax, ensuring consistency with the updated `/planning` command.

## Scope

### Files Touched
- `.opencode/commands/code-review.md` — MODIFY (if agent references exist)

### What's Out of Scope
- Other commands (planning.md handled in task 2)
- Creating new agent definitions
- Skill file changes

### Dependencies
- Task 1 complete — Registry verified
- Task 2 complete — Planning command updated (establishes pattern)

## Prior Task Context

Task 1 verified registry has all needed agents. Task 2 established the pattern for updating commands:
- Replace "Agent tool to invoke X" with `task(subagent_type="...", ...)`
- Use `run_in_background=true` for parallel research
- Use `run_in_background=false` when waiting for result
- Include [CONTEXT], [GOAL], [DOWNSTREAM], [REQUEST] in prompts

---

## Context References

### `.opencode/commands/code-review.md` — Current State

Need to read and analyze this file for any "Agent tool" or subagent references.

Potential patterns to look for:
- "Agent tool to invoke"
- "delegate to `code-review` subagent"
- "invoke the `X` subagent"

### Expected Agent Mapping

If code-review.md references agents:

| Current Reference | Replace With |
|-------------------|--------------|
| `code-review` subagent | `task(category="deep", load_skills=["code-review"], ...)` |
| Any research agent | Same mapping as task 2 |

---

## Patterns to Follow

### Pattern: Category Dispatch for Code Review

If the command references a code-review agent, use category dispatch:

```typescript
task(
  category="deep",
  load_skills=["code-review"],
  run_in_background=false,  // Wait for review result
  description="Code review for {feature}",
  prompt=`
    Review the following changes for:
    - Type safety issues
    - Security vulnerabilities
    - Architecture concerns
    - Performance problems
    - Code quality issues
    
    Changes:
    {diff or file list}
    
    Return: findings by severity (Critical, Major, Minor)
  `
)
```

### Pattern: Research During Review

If the command invokes research agents before reviewing:

```typescript
// First, gather context
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find patterns in changed files",
  prompt="Find existing patterns in {affected directories}..."
)

// Then, perform review
task(
  category="deep",
  load_skills=["code-review"],
  run_in_background=false,
  description="Review changes",
  prompt="Review with context: {research findings}..."
)
```

---

## Step-by-Step Tasks

### Step 3.1: Analyze Current code-review.md

**IMPLEMENT**: Read `.opencode/commands/code-review.md` and identify:
- Any "Agent tool" references
- Any subagent invocation patterns
- Any references to `.opencode/agents/code-review.md`

**VALIDATE**: Document all agent references found

**GOTCHA**: The command might not have any agent invocations — it could be self-contained

### Step 3.2: Update Agent References (if found)

**IMPLEMENT**: For each agent reference found, apply the appropriate replacement:

If referencing `code-review` agent:
```markdown
# OLD
Use the Agent tool to invoke the `code-review` subagent

# NEW
Use category dispatch with the code-review skill:

\`\`\`typescript
task(
  category="deep",
  load_skills=["code-review"],
  run_in_background=false,
  description="Review changes for {feature}",
  prompt=\`
    Review these changes for type safety, security, architecture, performance, and code quality.
    
    Return findings by severity: Critical, Major, Minor
  \`
)
\`\`\`
```

If referencing research agents, use the same mapping from task 2.

**VALIDATE**: All replacements use valid syntax

### Step 3.3: Verify No "Agent tool" References Remain

**IMPLEMENT**: After updates, grep for any remaining legacy syntax

```bash
grep -n "Agent tool" .opencode/commands/code-review.md
grep -n "invoke.*subagent" .opencode/commands/code-review.md
```

**VALIDATE**: Both greps return 0 results

---

## Testing Strategy

### Manual Verification
- Read updated code-review.md and verify all `task()` calls have correct syntax
- Verify no "Agent tool" references remain

### Edge Case
- If code-review.md has no agent invocations, document this and mark task complete

---

## Validation Commands

```bash
# Check for remaining legacy syntax
grep -n "Agent tool" .opencode/commands/code-review.md
# Should return 0 results

grep -n "subagent_type\|category=" .opencode/commands/code-review.md
# Should show the new task() calls (if any were added)
```

---

## Acceptance Criteria

### Implementation
- [ ] code-review.md analyzed for agent references
- [ ] All agent references updated (or documented as none found)
- [ ] No "Agent tool" references remain

### Runtime
- [ ] `/code-review` command is syntactically valid
- [ ] All task() calls use valid subagent_type or category values

---

## Handoff Notes

Task 3 may be simpler than task 2 — code-review.md might be self-contained without agent invocations.

If no agent references found:
- Document: "code-review.md does not invoke agents — no changes needed"
- Mark task complete

Task 4 will delete the legacy markdown agent files.

---

## Completion Checklist

- [ ] Read current code-review.md completely
- [ ] Documented all agent references found (or none)
- [ ] Updated all agent references (or documented none needed)
- [ ] Grep confirms no "Agent tool" references remain
- [ ] All task() calls use valid values
