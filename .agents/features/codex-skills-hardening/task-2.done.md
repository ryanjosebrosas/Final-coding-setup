# Task 2: Create PRD Skill (Codex)

## Objective

Create `.codex/skills/prd/SKILL.md` — a Codex CLI skill for PRD creation that adds reasoning
depth around the two gate disciplines (Spec Lock + Direction Preview), Section 8 backend design
standards, and quality checks before writing.

## Scope

- **File to create**: `.codex/skills/prd/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/prd.md` or `.claude/skills/prd/SKILL.md`
- **Dependencies**: None

## Prior Task Context

Task 1 created `.codex/skills/mvp/SKILL.md`. Same pattern applies here: YAML frontmatter with
`name:` + multi-line `description:` ending in trigger phrases; body starting with
`## When to Use This Skill`; closing with `## Key Rules`.

## Context References

### Reference: Source Command — `.opencode/commands/prd.md` (key sections)

```markdown
---
description: Create a full Product Requirements Document with architecture, tech specs, and backend design
---

## Step 0: Spec Lock (before drafting)
Read mvp.md first. Lock these items — restate what you found and ask for explicit confirmation:
- Product, Big Idea, Tech Direction, Implementation Mode, Target Path, Maturity Target, PRD Depth
Do NOT write the PRD until the user confirms.

## Step 0.5: PRD Direction Preview
Generate a concise preview before writing:
- Problem framing, Scope in/out, Architecture (1-sentence), Key assumptions, Tech stack
Approve this direction before I write the full PRD? (yes / adjust: ...)
Only write the PRD after explicit approval.

## Section 8: Backend Design
8a. Data Models — for each entity: fields with types, relationships, indexes
8b. Core Service Contracts — for each service: responsibility, interface with types, errors, dependencies
8c. State Management
8d. Error Handling Strategy
8e. Background Processing (if applicable)

## Quality Checks (before writing file)
- [ ] Spec Lock confirmed
- [ ] PRD Direction approved
- [ ] Tech stack explicitly stated (not "TBD")
- [ ] Data models have actual field names, not just entity names
- [ ] Implementation phases coherent with data model
- [ ] Success criteria are measurable
- [ ] Assumptions are labeled
- [ ] Out-of-scope items have reasons
```

### Reference: Codex Skill Frontmatter Pattern

```yaml
---
name: execute
description: Execute a task brief from .agents/features/ to implement a planned feature.
             Use when the user asks to execute a task brief, implement a plan, run a task,
             work on the next task, or implement a feature. Trigger phrases include:
             "execute task", "implement the plan", "run the task brief".
---
```

## Patterns to Follow

### Pattern: Two-gate discipline (command has it, skill explains WHY)

The command states: "Do NOT write the PRD until user confirms."
The skill explains: what a valid Spec Lock looks like, what "confirmed" means, and what happens
if you skip it (misaligned PRD that doesn't match the product direction).

### Pattern: Quality standards with concrete examples

Bad Section 8: "User entity with fields"
Good Section 8:
```
Entity: User
Fields:
  - id: UUID — primary key
  - email: string — unique, indexed for auth lookup
  - created_at: timestamp — partition key for analytics queries
```

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/prd/SKILL.md`

```markdown
---
name: prd
description: Create a full Product Requirements Document with architecture, tech specs, and
             backend design. Use when the user wants to write a PRD, create a product spec,
             expand mvp.md into detailed requirements, or design the system architecture.
             Trigger phrases include: "create PRD", "write product spec", "product requirements",
             "design the architecture", "expand the MVP", "write the PRD", "prd".
---

# PRD: Product Requirements Document

## When to Use This Skill

Use this skill when:
- `/prd` command is invoked
- `mvp.md` exists and needs expansion into a full spec
- System architecture needs to be designed before implementation
- Backend data models and service contracts need to be defined

## Step 0: Read mvp.md First

Before any gate or writing, read `mvp.md` fully. Extract:
- Product name
- Tech Direction (language, framework, runtime)
- Core Capabilities (become the implementation phases)
- Out of Scope (feeds the PRD's exclusions)

If `mvp.md` doesn't exist: report "No mvp.md found. Run /mvp first to define the product."
Do NOT invent a product direction — read it from mvp.md.

## Step 1: Spec Lock Gate (Non-Skippable)

Restate what you found in mvp.md and lock these items before writing anything:

```
Spec Lock:
- Product: {name from mvp.md}
- Big Idea: {one sentence}
- Tech Direction: {from mvp.md Tech Direction section}
- Implementation Mode: {docs-only | code implementation | both}
- Target Path: {PRD.md or custom path}
- Maturity Target: {alpha | MVP | production}
- PRD Depth: {lightweight (skip optional sections) | full (all sections)}

Confirm? (yes / adjust: ...)
```

**Why this gate matters:** The PRD locks architectural decisions (stack, data model, service
contracts) that every downstream planning session inherits. A PRD written against the wrong
tech direction produces plans that can't be executed.

## Step 2: Direction Preview Gate (Non-Skippable)

After Spec Lock, generate a 1-page preview before writing the full file:

```
PRD Direction:

Problem framing:  {1 sentence on what problem this solves}
Scope in:         {3-5 bullet points of what's included}
Scope out:        {2-3 explicit exclusions}
Architecture:     {1-sentence approach: "REST API + PostgreSQL + React"}
Key assumptions:  {list any assumptions made due to missing info}
Tech stack:       {from mvp.md + any inferences}

Approve this direction? (yes / adjust: ...)
```

**Why this gate matters:** Architecture is the hardest decision to reverse. A 1-paragraph
preview costs 30 seconds to review; rebuilding after a wrong architecture choice costs days.

## Step 3: Section 8 — Backend Design (Quality Standard)

Section 8 is the most technically important section. Vague descriptions here produce vague plans.

**8a. Data Models — required depth:**

```
Entity: {Name}
Fields:
  - {field}: {type} — {purpose and constraints}
  - {field}: {type} — {purpose}
Relationships:
  - {relationship to other entities, with cardinality}
Indexes:
  - {field(s)}: {reason this index is needed}
```

Bad: "User entity with id, email, name"
Good:
```
Entity: User
Fields:
  - id: UUID — primary key, auto-generated
  - email: string — unique, indexed for auth lookup, max 255 chars
  - created_at: timestamp — auto-set on insert, indexed for analytics
Relationships:
  - User has many Documents (one-to-many, FK on Document.user_id)
Indexes:
  - email: unique index — auth queries by email
  - created_at: range index — analytics date-range queries
```

**8b. Service Contracts — required depth:**

```
Service: {Name}
Responsibility: {one sentence — what this service OWNS (not does)}
Interface:
  {method signature}
  Input: {type with field descriptions}
  Output: {type with field descriptions}
  Errors: {what it throws/returns on failure — specific types}
Dependencies: {what other services/modules it calls}
```

Bad: "AuthService handles authentication"
Good:
```
Service: AuthService
Responsibility: Owns user identity verification and session lifecycle
Interface:
  login(email: string, password: string): Promise<{token: string, user: User}>
  Input: email (validated format), password (min 8 chars)
  Output: JWT token (24h expiry) + User object (no password field)
  Errors: AuthError("invalid_credentials") | AuthError("account_locked")
Dependencies: UserRepository (read), TokenStore (write)
```

## Step 4: Quality Checks Before Writing

Before writing the PRD file, verify:

- [ ] Spec Lock was confirmed (not just presented)
- [ ] Direction Preview was approved (not just shown)
- [ ] Tech stack is concrete: language + framework + DB + runtime specified
- [ ] Data models have actual field names, types, and purposes (not just entity names)
- [ ] Service contracts have typed interfaces with error types
- [ ] Implementation phases map to mvp.md Core Capabilities (1-1 or N-1)
- [ ] Success criteria are measurable ("responds in <200ms", not "is fast")
- [ ] Every assumption is labeled: "Assumption: {statement} — Rationale: {why assumed}"
- [ ] Out-of-scope items have reasons (not just names)

## Key Rules

1. **Read mvp.md before anything else** — PRD extends the product direction, never invents it
2. **Both gates are non-skippable** — Spec Lock + Direction Preview before any writing
3. **Section 8 must have field names and types** — "user entity" is not enough
4. **Service contracts must have typed interfaces** — method signatures, not descriptions
5. **Assumptions must be labeled** — undeclared assumptions become hidden bugs in the plan
6. **Lightweight vs Full** — skip optional sections only if user chose lightweight depth
```

### VALIDATE

```bash
grep -c "name: prd" .codex/skills/prd/SKILL.md
grep -c "When to Use This Skill" .codex/skills/prd/SKILL.md
grep -c "Key Rules" .codex/skills/prd/SKILL.md
grep -c "Spec Lock" .codex/skills/prd/SKILL.md
grep -c "Trigger phrases" .codex/skills/prd/SKILL.md
```

## Testing Strategy

No unit tests — markdown file. L1 grep checks + manual review that skill covers the two gates
(Spec Lock, Direction Preview) and Section 8 depth standards with concrete good/bad examples.

## Validation Commands

```bash
# L1
grep -c "name: prd" .codex/skills/prd/SKILL.md
grep -c "When to Use This Skill" .codex/skills/prd/SKILL.md
grep -c "Key Rules" .codex/skills/prd/SKILL.md
grep -c "Spec Lock" .codex/skills/prd/SKILL.md
grep -c "Direction Preview" .codex/skills/prd/SKILL.md

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/prd/SKILL.md` exists
- [ ] Frontmatter has `name: prd` and trigger phrases
- [ ] Has `## When to Use This Skill` section
- [ ] Has Spec Lock gate with explanation of why it matters
- [ ] Has Direction Preview gate with explanation of why it matters
- [ ] Has Section 8 depth standards with concrete good/bad examples
- [ ] Has Quality Checks list before writing
- [ ] Has `## Key Rules` section

### Runtime
- [ ] Codex matches this skill when user says "create PRD" or "write product spec"

## Handoff Notes

Task 3 creates `.codex/skills/planning/SKILL.md`. Same frontmatter pattern. Planning skill
focus: discovery-first discipline, task decomposition quality criteria, brief writing standards
(why 700 lines, what inline content means), pipeline handoff requirements.

## Completion Checklist

- [ ] `.codex/skills/prd/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-2.md` → `task-2.done.md` rename completed
