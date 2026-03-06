# Task 1: Add Intent Classification and Draft Management

## Objective

Add Step 0 (Intent Classification) and Step 1 (Draft Management) to the beginning of `/planning` command, establishing the foundation for intent-aware planning and session persistence.

## Scope

### Files Touched
- `.opencode/commands/planning.md` — MODIFY (add ~80-100 lines)

### What's Out of Scope
- Phase 1 interview changes (Task 2)
- Agent invocations (Tasks 3-4)
- Output format changes (Task 5)
- Self-review/Momus (Task 6)

### Dependencies
- None — this is the first task

---

## Context References

### Current planning.md Structure (lines 1-65)

```markdown
---
description: Interactive discovery session — explore ideas WITH the user, then produce a structured plan
model: openai/gpt-5.3-codex
---

# Planning: Interactive Discovery + Structured Plan

Work WITH the user to explore, question, and discover the right approach for a spec, then produce a structured implementation plan. This is a conversation, not an auto-generator.

## Feature: $ARGUMENTS

---

## Pipeline Position

```
/mvp → /prd → /planning (this) → codex /execute → /code-review → /commit → /pr
```

Used standalone for each feature or capability.

---

## Core Rules

1. **Discovery first, plan second.** Do NOT auto-generate a plan. Ask questions, discuss approaches, explore the codebase together.
2. **Work WITH the user.** This is a conversation. Ask short questions, confirm insights, discuss tradeoffs.
3. **No code in this phase.** Planning produces a plan document, not code.
4. **Plan-before-execute.** `codex /execute` only runs from a `/planning`-generated artifact in `.agents/features/{feature}/`.

---

## Phase 1: Understand (Discovery Conversation)
...
```

### Prometheus Intent Classification (from prometheus/SKILL.md lines 25-41)

```markdown
## Step 0: Intent Classification (EVERY Request)

Before consultation, classify work intent. This determines interview strategy.

### Intent Types

| Intent | Signal | Strategy |
|--------|--------|----------|
| **Trivial** | Single file, <10 lines, obvious fix | Skip heavy interview. Quick confirm → suggest action. |
| **Simple** | 1-2 files, clear scope, <30 min | Lightweight: 1-2 questions → propose approach. |
| **Refactoring** | "refactor", "restructure", existing code | Safety focus: tests, rollback, behavior preservation |
| **Build from Scratch** | New feature, greenfield, "create new" | Discovery focus: patterns first, then requirements |
| **Mid-sized** | Scoped feature, clear boundaries | Boundary focus: deliverables, exclusions, guardrails |
| **Collaborative** | "let's figure out", "help me plan" | Dialogue focus: explore together, incremental clarity |
| **Architecture** | System design, infrastructure | Strategic focus: Oracle consultation REQUIRED |
| **Research** | Goal exists, path unclear | Investigation focus: parallel probes, exit criteria |
```

### Prometheus Draft Management (from prometheus/SKILL.md lines 44-56, 198-214)

```markdown
## Step 1: Check Draft State

Check `.agents/features/{feature}/prometheus-draft.md` for existing interview progress.

**If exists:**
1. Read draft to restore context
2. Present: "Continuing from our previous discussion about {topic}. We'd covered: {summary}"
3. Ask: "Ready to continue, or should we start fresh?"

**If not exists:**
1. Create `.agents/features/{feature}/` directory if needed
2. Create initial draft: `.agents/features/{feature}/prometheus-draft.md`
3. Begin Step 2

## Step 4: Draft Management

**First response**: Create draft file immediately after understanding topic.

**Every subsequent response**: Append/update draft with new information.

**Inform user**: "I'm recording our discussion in `.agents/features/{name}/planning-draft.md`."
```

---

## Patterns to Follow

### Pattern: Insert Before Phase 1

The new steps go AFTER Core Rules and BEFORE Phase 1:

```markdown
## Core Rules
...

---

## Step 0: Intent Classification
...

---

## Step 1: Draft Management
...

---

## Phase 1: Discovery
...
```

### Pattern: Intent Announcement

After classification, announce to user:

```markdown
**Announce classification:**
```
I'm classifying this as **{INTENT}** based on {signals}.

This means I'll focus on {strategy focus}.

{Intent-specific note if applicable, e.g., "For Architecture, I'll consult Oracle."}
```
```

---

## Step-by-Step Tasks

### Step 1.1: Add Step 0 (Intent Classification)

**IMPLEMENT**: Insert after Core Rules section (after line 30), before Phase 1

**Add this content:**

```markdown
---

## Step 0: Intent Classification

Before discovery, classify the work intent. This determines interview strategy and required consultations.

### Intent Types

| Intent | Signal | Interview Strategy |
|--------|--------|-------------------|
| **Trivial** | Single file, <10 lines, obvious fix | Quick confirm, but still full planning process |
| **Simple** | 1-2 files, clear scope, <30 min work | Focused questions on scope boundaries |
| **Refactoring** | "refactor", "restructure", existing code | Safety focus: tests, rollback, behavior preservation |
| **Build from Scratch** | New feature, greenfield, "create new" | Discovery focus: find patterns first, then requirements |
| **Mid-sized** | Scoped feature, clear boundaries | Boundary focus: deliverables, exclusions, guardrails |
| **Collaborative** | "let's figure out", "help me plan" | Dialogue focus: explore together, incremental clarity |
| **Architecture** | System design, infrastructure | Strategic focus: **Oracle consultation REQUIRED** |
| **Research** | Goal exists, path unclear | Investigation focus: parallel probes, exit criteria |

### Classification Process

1. Parse `$ARGUMENTS` and any prior context
2. Match against signal patterns
3. Select primary intent (may have secondary)
4. Announce classification to user

### Intent Announcement

After classification, tell the user:

```
I'm classifying this as **{INTENT}** based on {observed signals}.

Interview focus: {strategy description}
{If Architecture: "Oracle consultation will be required in Phase 3."}
{If Refactoring: "I'll focus on safety: tests, rollback strategy, behavior preservation."}

Let's begin discovery.
```

### Intent Determines Downstream Behavior

| Intent | Phase 1 Focus | Phase 2 Extras | Phase 3 Extras |
|--------|---------------|----------------|----------------|
| Trivial | Quick scope confirm | Standard | Standard |
| Simple | Boundary questions | Standard | Standard |
| Refactoring | Safety + rollback | Test coverage search | Risk analysis emphasis |
| Build from Scratch | Pattern discovery | Extra pattern search | Standard |
| Mid-sized | Exclusions + guardrails | Standard | Standard |
| Collaborative | Open exploration | Standard | Standard |
| Architecture | System boundaries | Oracle in Phase 2 | Oracle review required |
| Research | Exit criteria | Parallel probes | Standard |
```

**VALIDATE**: Section appears after Core Rules, before Phase 1

### Step 1.2: Add Step 1 (Draft Management)

**IMPLEMENT**: Insert after Step 0, before Phase 1

**Add this content:**

```markdown
---

## Step 1: Draft Management

Planning sessions persist across context windows via draft files.

### Draft File Location

```
.agents/features/{feature}/planning-draft.md
```

### On Session Start

**Check for existing draft:**

```typescript
// Check if draft exists
const draftPath = `.agents/features/${feature}/planning-draft.md`
```

**If draft exists:**
1. Read draft to restore context
2. Summarize what was previously discussed
3. Present to user:
   ```
   Continuing from our previous planning session for {feature}.
   
   **Previously discussed:**
   - {topic 1}
   - {topic 2}
   - {key decision made}
   
   **Current status:** {where we left off}
   
   Ready to continue, or should we start fresh?
   ```
4. If user says "start fresh" → delete draft, begin from Step 0

**If no draft exists:**
1. Create feature directory: `.agents/features/{feature}/`
2. Create initial draft with intent classification
3. Inform user: "I'm recording our discussion in `.agents/features/{feature}/planning-draft.md`"

### During Session

**After every meaningful exchange**, update the draft:

```markdown
# Planning Draft: {feature}

## Intent Classification
- **Type**: {intent}
- **Signals**: {why this classification}
- **Classified at**: {timestamp}

## Discovery Progress
- [ ] Intent classified
- [ ] Test strategy discussed
- [ ] Scope boundaries defined
- [ ] Clearance check passed

## Key Discussions

### {timestamp} — {topic}
{summary of what was discussed}
{decisions made}
{open questions}

### {timestamp} — {topic}
...

## Current Understanding
{latest synthesis of what we're building}

## Open Questions
- {question 1}
- {question 2}

## Decisions Made
- {decision 1}: {rationale}
- {decision 2}: {rationale}
```

### Draft Cleanup

After plan is written and user confirms:
1. Draft file is deleted
2. Plan artifacts remain in `.agents/features/{feature}/`

---
```

**VALIDATE**: Section appears after Step 0, before Phase 1

### Step 1.3: Renumber Phase 1

**IMPLEMENT**: Update "## Phase 1" to maintain logical flow

The section header stays "## Phase 1" but add a note that it follows Steps 0-1:

```markdown
## Phase 1: Discovery (Intent-Specific Interview)

> **Prerequisite**: Steps 0-1 complete (intent classified, draft initialized)

Start by understanding what the user wants to build...
```

**VALIDATE**: Phase 1 header updated with prerequisite note

---

## Testing Strategy

### Manual Verification

1. Read updated planning.md
2. Verify Step 0 appears after Core Rules
3. Verify Step 1 appears after Step 0
4. Verify Phase 1 follows Step 1
5. Verify intent types table is complete (8 types)
6. Verify draft file pattern uses `planning-draft.md`

### Syntax Check

```bash
# Verify sections exist
grep -n "## Step 0: Intent Classification" .opencode/commands/planning.md
grep -n "## Step 1: Draft Management" .opencode/commands/planning.md
grep -n "## Phase 1:" .opencode/commands/planning.md
```

---

## Validation Commands

```bash
# Check line count increased
wc -l .opencode/commands/planning.md
# Should be ~750-780 lines (up from 663)

# Verify section order
grep -n "^## " .opencode/commands/planning.md | head -10
# Should show: Core Rules, Step 0, Step 1, Phase 1, Phase 2...
```

---

## Acceptance Criteria

### Implementation
- [ ] Step 0 (Intent Classification) added with 8 intent types
- [ ] Intent announcement template included
- [ ] Intent → downstream behavior table included
- [ ] Step 1 (Draft Management) added
- [ ] Draft file pattern defined (`planning-draft.md`)
- [ ] Session continuation flow documented
- [ ] Draft cleanup documented
- [ ] Phase 1 has prerequisite note

### Structure
- [ ] Sections in correct order: Core Rules → Step 0 → Step 1 → Phase 1
- [ ] No duplicate section headers
- [ ] Markdown formatting valid

---

## Handoff Notes

Task 1 establishes the foundation. Task 2 will enhance Phase 1 with intent-specific interview strategies that USE the classification from Step 0.

Key file locations for Task 2:
- Intent classification is in Step 0
- Draft management is in Step 1
- Phase 1 needs to reference intent for question strategy

---

## Completion Checklist

- [ ] Step 0 added after Core Rules
- [ ] Step 1 added after Step 0
- [ ] Phase 1 has prerequisite note
- [ ] Intent types table complete (8 types)
- [ ] Draft file pattern is `planning-draft.md`
- [ ] Section order verified
- [ ] Line count increased appropriately
