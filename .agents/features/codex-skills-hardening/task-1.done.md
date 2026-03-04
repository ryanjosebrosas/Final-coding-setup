# Task 1: Create MVP Skill (Codex)

## Objective

Create `.codex/skills/mvp/SKILL.md` — a Codex CLI skill for big-idea discovery sessions,
following the existing Codex skill pattern with YAML frontmatter trigger phrases and
workflow guidance that adds reasoning depth beyond the command file.

## Scope

- **File to create**: `.codex/skills/mvp/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/mvp.md` or `.claude/skills/mvp/SKILL.md`
- **Dependencies**: None

## Prior Task Context

None — this is task 1 of 14.

## Context References

### Reference: Existing Codex Skill Pattern — `.codex/skills/prime/SKILL.md`

```markdown
---
name: prime
description: Load project context at the start of a Codex session. Use when the user
             asks to prime, load context, start a session, check status, or find out
             what to work on next. Trigger phrases: "prime me", "load context",
             "what's the status", "start a new session", "what should I work on next",
             "check pending work", "prime the session", "show me what's pending".
---

# Prime: Load Project Context

## When to Use This Skill

Use this skill at the START of every Codex session before doing any implementation work.
It surfaces pending tasks, git state, memory context, and Archon connection status so you
know exactly what to work on.

## Step 0: Check Git State
...

## Key Notes

- This skill is READ-ONLY — it does not modify files, commit, or start implementation
- Always run at session start before any work (ABP — Always Be Priming)
- If `.claude/config.md` is missing, note it but do not create it — that is Claude's job
```

Key pattern observations:
1. Frontmatter: `name:` + `description:` (multi-line, ends with "Trigger phrases: ...")
2. Body starts with `# Title: Subtitle`
3. `## When to Use This Skill` section is first
4. Numbered steps for workflow
5. `## Key Notes` or `## Key Rules` as final section
6. NO license/compatibility fields (unlike .claude/skills/)

### Reference: Source Command — `.opencode/commands/mvp.md` (key sections)

```markdown
---
description: Define or refine the product MVP vision through interactive big-idea discovery
model: claude-opus-4-6
---

# MVP: Big Idea Discovery

## Step 1: Check Existing MVP
Read mvp.md if it exists. Present summary. Ask: "Is this still the direction?"

## Step 2: Big Idea Discovery (Interactive)

### Phase A: Extract the Core Idea
Start with one open question: "What are you building?"
Rules:
- Ask ONE question at a time. Never fire a list.
- Push back if vague: "That's broad — concrete scenario?"
- Push back if too large: "That's 6 months. Smallest version that proves the idea?"

### Phase B: Capture Tech Direction
Ask: "What's your tech direction?"

### Phase C: Scope Gate
Present synthesis. Ask: "Does this capture it? (yes / adjust: ...)"
Do NOT proceed until confirmed.

## Step 3: Write mvp.md
Sections: Big Idea, Users and Problems, Core Capabilities, Tech Direction,
Out of Scope (MVP), MVP Done When (checkboxes).

## Notes
- One question at a time.
- Push back on scope. An MVP that takes 6 months is not an MVP.
- Tech direction is captured here, not invented in /prd.
- mvp.md is a compass, not a spec. Keep it under 50 lines.
- Out of Scope is as important as In Scope.
```

## Patterns to Follow

### Pattern: Skill adds DEPTH beyond command

The command says "ask one question at a time." The skill explains WHY and what a GOOD question
looks like vs a BAD one. Skills add reasoning criteria, not just step repetition.

Example from `.codex/skills/execute/SKILL.md` (adding depth):
```markdown
## Step 2: Execute Tasks in Order
...
d. Track divergences — if implementation differs from plan, classify as:
   - Good Divergence ✅ — plan limitation discovered (assumed wrong, better pattern found,
     technical constraint not known at planning time)
   - Bad Divergence ❌ — execution issue (ignored constraints, took shortcuts,
     misunderstood requirements)
```
The command says "track divergences." The skill tells you HOW to classify them.

### Pattern: Trigger phrases in description

```yaml
description: Execute a task brief from .agents/features/ to implement a planned feature.
             Use when the user asks to execute a task brief, implement a plan, run a task,
             work on the next task, or implement a feature. Trigger phrases include:
             "execute task", "implement the plan", "run the task brief",
             "execute .agents/features/", "work on task N", "implement task brief at...",
             "run the next task", "implement the next task".
```

Pattern: starts with what the skill does, then "Use when...", then "Trigger phrases include:".

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/mvp/SKILL.md`

Create the directory and file:

```
mkdir -p .codex/skills/mvp
```

File content:

```markdown
---
name: mvp
description: Define or refine the product MVP vision through Socratic big-idea discovery.
             Use when the user wants to define what they're building, discover an MVP,
             refine an existing product direction, or start a new product. Trigger phrases
             include: "define MVP", "what should I build", "help me discover my product",
             "I have an idea", "let's define the product", "refine the MVP", "mvp".
---

# MVP: Big Idea Discovery

## When to Use This Skill

Use this skill when:
- The user says "I have an idea" or "what should I build"
- `/mvp` command is invoked
- Existing `mvp.md` needs revision or validation
- Discovery conversation needs grounding before `/prd` can run

## Step 0: Check Existing mvp.md

If `mvp.md` exists at the project root:
1. Read it fully
2. Present a crisp summary (product, big idea, capabilities, tech direction, done criteria)
3. Ask: "Is this still the direction, or do you want to revise?"
4. If satisfied → skip to write confirmation and done
5. If revising → identify specifically what changed, update only affected sections

Do NOT rewrite the entire document unless the user explicitly requests it.

## Step 1: Phase A — Extract the Core Idea

Start with exactly ONE open question:

```
What are you building?
```

Listen. Then respond with ONE of:
- **Restate + challenge**: "So you're building X. What makes that different from Y?"
- **Dig deeper**: "Who specifically is the person who needs this?"
- **Scope probe**: "What does the first working version look like?"

**Discipline rules:**
- ONE question per message — never bundle multiple questions
- Each question must respond to what the user JUST said (not a script)
- Push back on vague scope: "That's broad — give me one concrete scenario"
- Push back on large scope: "That's 6 months of work. What's the smallest version that proves the idea?"

**Clarity test:** You are ready for Phase B when you can answer all three:
1. What does this build? (concrete product, not a category)
2. Who uses it and why? (specific persona, specific pain)
3. What does the first working version look like?

## Step 2: Phase B — Capture Tech Direction

Once the product idea is clear, shift to tech direction:

```
What's your tech direction? (language, framework, stack — or "not sure yet")
```

Capture exactly what the user says. Do NOT suggest a stack unless asked.
If "not sure": ask ONE follow-up — "What environment does this run in? (web, CLI, API, mobile)"

## Step 3: Phase C — Scope Gate (Non-Skippable)

Present synthesis and require explicit confirmation:

```
Here's what I've heard:

Big Idea: {one sentence}
User: {who}
Core Problem: {the pain}
First Version: {what "done" looks like}
Tech Direction: {stack or "undecided"}

Does this capture it? (yes / adjust: ...)
```

Do NOT write mvp.md until the user says yes or makes corrections.
If corrections: incorporate, re-present, wait for confirmation again.

## Step 4: Write mvp.md

After Phase C confirmation, write `mvp.md` at the project root:

```markdown
# {Product Name}

## Big Idea
{2-3 sentences: what, who, problem, differentiator. Precise — readable to a dev.}

## Users and Problems
- **Primary user**: {specific, not "developers" but "solo devs building SaaS tools"}
- **Problem 1**: {concrete pain with a real scenario}
- **Problem 2**: {concrete pain}

## Core Capabilities
1. {Capability — verb-first: "Store and retrieve..."}
2. {Capability}
3. {Capability}
4. {4-6 is the right range for an MVP}

## Tech Direction
- **Language**: {language or "undecided"}
- **Framework**: {framework or "undecided"}
- **Runtime**: {web / API / CLI / mobile / etc.}
- **Key Constraints**: {hard constraints or "none identified"}

## Out of Scope (MVP)
- {Deferred capability — with ONE sentence on WHY it's deferred}
- {Deferred capability}

## MVP Done When
- [ ] {Concrete, testable signal — not "works well" but "user can do X end-to-end"}
- [ ] {Concrete signal}
- [ ] {Concrete signal}
```

## mvp.md Quality Standards

**Good mvp.md:**
- Under 50 lines (compass, not spec)
- "MVP Done When" criteria are concrete and testable
- "Out of Scope" has at least 2 explicitly deferred items with reasons
- Tech direction is filled in — not "undecided" in all fields

**Bad mvp.md:**
- Lists 8+ core capabilities (too broad for MVP)
- Has vague "Done When" like "performs well" or "users are happy"
- Has no Out of Scope section (scope creep will happen downstream)
- Has tech direction as "undecided" in all fields (stalls /prd)

## Key Rules

1. **One question at a time** — the Socratic method requires listening between questions
2. **Push back on scope** — an MVP that takes 6 months is not an MVP
3. **Phase C confirmation is non-negotiable** — never write without explicit approval
4. **Tech direction is captured, not invented** — what the user says is what goes in
5. **Out of Scope is as important as In Scope** — unnamed deferrals become scope creep
6. **Revision mode** — read existing mvp.md fully before saying anything; update only what changed
```

### VALIDATE

```bash
grep -c "name: mvp" .codex/skills/mvp/SKILL.md
# Expected: 1

grep -c "When to Use This Skill" .codex/skills/mvp/SKILL.md
# Expected: 1

grep -c "Key Rules" .codex/skills/mvp/SKILL.md
# Expected: 1

grep -c "Scope Gate" .codex/skills/mvp/SKILL.md
# Expected: 1
```

## Testing Strategy

No unit tests — markdown file. Validation is structural (grep) + manual review to confirm
the skill adds depth beyond the command (quality criteria, not just workflow steps).

## Validation Commands

```bash
# L1: Frontmatter present
grep -c "name: mvp" .codex/skills/mvp/SKILL.md
# Expected: 1

# L1: Required sections
grep -c "When to Use This Skill" .codex/skills/mvp/SKILL.md
grep -c "Key Rules" .codex/skills/mvp/SKILL.md
grep -c "Trigger phrases" .codex/skills/mvp/SKILL.md

# L2-L5: N/A — markdown only
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/mvp/SKILL.md` exists
- [ ] Frontmatter has `name:` and `description:` with trigger phrases
- [ ] Has "When to Use This Skill" section
- [ ] Has "Key Rules" section with at least 5 rules
- [ ] Has Phase C (Scope Gate) — non-skippable gate
- [ ] Has mvp.md quality standards (good vs bad examples)
- [ ] Does NOT simply duplicate command steps — adds reasoning depth

### Runtime
- [ ] Codex matches this skill when user says "I have an idea" or "define MVP"

## Handoff Notes

Task 2 creates `.codex/skills/prd/SKILL.md`. Same pattern: Codex frontmatter with trigger
phrases, workflow guidance that adds depth. PRD focus: Spec Lock gate, Direction Preview gate,
Section 8 backend design depth standards.

## Completion Checklist

- [ ] `.codex/skills/mvp/SKILL.md` created
- [ ] All grep validations pass (name, When to Use, Key Rules, Trigger phrases)
- [ ] `task-1.md` → `task-1.done.md` rename completed
