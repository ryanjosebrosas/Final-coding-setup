# Task 1: Create MVP Skill

## Objective

Create `.claude/skills/mvp/SKILL.md` — a knowledge framework that deepens Claude's reasoning
for big-idea discovery sessions, adding quality criteria and anti-patterns not present in the
command file alone.

## Scope

- **File to create**: `.claude/skills/mvp/SKILL.md`
- **Out of scope**: Do NOT modify `.claude/commands/mvp.md`
- **Dependencies**: None

## Prior Task Context

None — this is task 1 of 11.

## Context References

### Reference: planning-methodology/SKILL.md (the canonical pattern)

```markdown
---
name: planning-methodology
description: Guide for systematic interactive planning with template-driven output and confidence scoring
license: MIT
compatibility: claude-code
---

# Planning Methodology — Interactive Discovery + Structured Output

This skill provides the knowledge framework for transforming feature requests into comprehensive
implementation plans. It complements the `/planning` command — the command provides the
interactive discovery workflow, this skill provides the structured output methodology.

## When This Skill Applies

- User asks to "plan a feature", "create an implementation plan", or "structure development work"
- A feature request needs to be broken down before implementation
- Inside `/build` when generating standard or heavy plans

## The Discovery-to-Plan Flow
...

## Key Rules

1. Discovery first, plan second.
2. Plan depth scales with complexity.
3. No code in planning.
4. Research validation.
5. Agent-to-agent optimization.

## Related Commands

- `/planning [feature]` — The interactive discovery workflow that uses this methodology
- `/execute [plan-path]` — Implements the plan this methodology produces
```

### Reference: .claude/commands/mvp.md (source command — full content)

```markdown
---
description: Define or refine the product MVP vision through interactive big-idea discovery
model: claude-opus-4-6
---

# MVP: Big Idea Discovery

The entry point to everything. Runs a Socratic discovery conversation to extract,
pressure-test, and articulate the big idea — produces mvp.md as the compass for the pipeline.

## Step 1: Check Existing MVP
Read mvp.md if it exists. Present summary. Ask: "Is this still the direction?"

## Step 2: Big Idea Discovery (Interactive)

### Phase A: Extract the Core Idea
Start with one open question: "What are you building?"
Listen. Then respond with one of:
- Restate + challenge: "So you're building X. What makes that different from Y?"
- Dig deeper: "Who specifically is the person who needs this?"
- Scope probe: "What does the first working version look like?"

Rules:
- Ask ONE question at a time. Never fire a list.
- Push back if vague: "That's broad — concrete scenario?"
- Push back if too large: "That's 6 months. Smallest version that proves the idea?"
- Keep going until you can answer: What does this build? Who uses it? First version?

### Phase B: Capture Tech Direction
Ask: "What's your tech direction?"
Capture: language/framework, runtime environment, known constraints.

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
- The discovery conversation is the real work.
```

## Patterns to Follow

### Pattern: Skill adds DEPTH beyond the command

The command tells Claude WHAT to do (steps). The skill tells Claude HOW TO THINK (quality criteria):

```markdown
## When This Skill Applies
- User says "what should I build", "help me define my product", "I have an idea"
- /mvp command is invoked
- Discovery conversation needs grounding before /prd

## Discovery Quality Standards
A good discovery conversation has these properties:
- Each question responds directly to what the user just said (not a pre-written script)
- The question count is proportional to clarity — clear ideas need fewer questions
- Scope challenges are specific: "That's 3 features — which one is the core?"
  not generic: "That might be too large"
```

### Pattern: Anti-patterns section

Each skill should enumerate what NOT to do:

```markdown
## Anti-Patterns

- **Question flooding**: Asking 3+ questions at once overwhelms users and signals
  you're not listening. One question = one concept = one answer.
- **Tech-first discovery**: Jumping to "what stack?" before the idea is clear produces
  premature commitment. Tech direction is Phase B, not Phase A.
- **Skipping scope gate**: Proceeding without Phase C confirmation wastes effort on
  a direction the user didn't actually approve.
```

## Step-by-Step Tasks

### IMPLEMENT: Create `.claude/skills/mvp/SKILL.md`

Create the file at `.claude/skills/mvp/SKILL.md` with this exact content:

```markdown
---
name: mvp
description: Knowledge framework for big-idea discovery using Socratic questioning and scope discipline
license: MIT
compatibility: claude-code
---

# MVP Discovery — Socratic Methodology

This skill provides the reasoning framework for running effective big-idea discovery sessions.
It complements the `/mvp` command — the command provides the workflow steps, this skill
provides the quality standards and thinking discipline behind them.

## When This Skill Applies

- User says "I have an idea", "help me define my product", "what should I build"
- `/mvp` command is invoked
- Existing `mvp.md` needs revision or validation
- Discovery conversation needs grounding before `/prd` can run

## Discovery Quality Standards

A high-quality discovery conversation has these measurable properties:

**One question at a time** — Each question must:
- Respond directly to what the user just said (not pre-scripted)
- Target one specific unknown (not bundle multiple concerns)
- Be answerable in 1-2 sentences (not open-ended essays)

**Scope discipline** — Apply this test before accepting any scope:
- Can one developer build this in 4-6 weeks?
- Does the user have a concrete scenario where this gets used?
- Are there 2-3 core capabilities, not 8-10?
If any answer is "no", probe deeper before proceeding.

**Evidence of clarity** — You are ready for Phase C (Scope Gate) when you can answer
all three of these without guessing:
1. What does this build? (concrete product, not category)
2. Who uses it and why? (specific persona with a specific pain)
3. What does the first working version look like? (demonstrable, not theoretical)

## Scope Gate Quality

The Phase C synthesis must be:
- **Precise**: "A CLI tool that converts Markdown files to PDF with custom CSS themes"
  not "A document conversion utility"
- **Honest about constraints**: If the user said "FastAPI + PostgreSQL", that is in the
  synthesis. Do not invent or omit.
- **Explicit about what's deferred**: Out-of-scope items in `mvp.md` prevent scope creep
  downstream. If nothing is deferred, the MVP is probably too large.

## mvp.md Quality Standards

A good `mvp.md` is:
- Under 50 lines (it is a compass, not a spec)
- Specific enough that a developer can start without asking follow-up questions
- Contains "MVP Done When" checkboxes that are concrete and testable —
  not "works well" but "user can do X end-to-end without errors"
- Has Out of Scope section with at least 2 explicitly deferred items with reasons

A bad `mvp.md`:
- Lists 8+ core capabilities (too broad for MVP)
- Has vague "MVP Done When" criteria like "performs well" or "users are happy"
- Has no Out of Scope section (scope creep will happen downstream)
- Has tech direction as "undecided" in all fields (stalls /prd)

## Anti-Patterns

**Question flooding** — Asking 3+ questions in one message overwhelms users and
signals you are not listening. One question = one concept = one answer.
Bad: "What are you building? Who uses it? What's the tech stack? What's the timeline?"
Good: "What are you building?" → listen → next targeted question

**Tech-first discovery** — Jumping to "what stack?" before the idea is clear produces
premature commitment. A bad tech choice locked in early costs more to fix later.
Phase A (idea) must be clear before Phase B (tech direction).

**Vague scope challenges** — Challenging scope without specificity is unhelpful.
Bad: "That might be too large for an MVP."
Good: "You've described 4 distinct features. Which one, if it existed alone,
would let you test whether this idea works?"

**Skipping Phase C confirmation** — Proceeding to write `mvp.md` without explicit
user confirmation means you may have misunderstood the idea. Phase C is not optional.

**Treating mvp.md as a spec** — `mvp.md` is the compass, not the blueprint.
Details (data models, API contracts, architecture) belong in `/prd`.
If mvp.md is growing past 60 lines, you are writing a PRD, not an MVP doc.

## Revision Mode

When `mvp.md` already exists:
1. Read it in full before saying anything
2. Present the existing state as a crisp summary (product, big idea, capabilities, status)
3. Ask ONE question: "Is this still the direction, or do you want to revise?"
4. If revising: identify specifically what changed, update only the affected sections
5. Do NOT rewrite the entire document unless the user explicitly requests it

## Key Rules

1. **One question at a time** — The Socratic method requires listening between questions
2. **Push back on scope** — An MVP that takes 6 months is not an MVP
3. **Tech direction is captured, not invented** — What the user says is what goes in
4. **Phase C confirmation is non-negotiable** — Never write without explicit approval
5. **Out of Scope is as important as In Scope** — Unnamed deferrals become scope creep
6. **Discovery conversation is the real work** — 10 minutes here saves days downstream

## Related Commands

- `/mvp [topic]` — The interactive discovery workflow this skill supports
- `/prd` — Expands `mvp.md` into full product spec; reads `mvp.md` as primary input
- `/planning {feature}` — Creates implementation plans for each capability in `mvp.md`
```

### VALIDATE

```bash
grep -c "name: mvp" .claude/skills/mvp/SKILL.md
# Expected: 1

grep -c "compatibility: claude-code" .claude/skills/mvp/SKILL.md
# Expected: 1

grep -c "When This Skill Applies" .claude/skills/mvp/SKILL.md
# Expected: 1

grep -c "Key Rules" .claude/skills/mvp/SKILL.md
# Expected: 1
```

## Testing Strategy

No unit tests — markdown file. Validation is structural (grep checks) + manual review
to confirm the skill adds depth beyond the command.

## Validation Commands

```bash
# L1: Frontmatter present
grep -c "name: mvp" .claude/skills/mvp/SKILL.md

# L1: Required sections present
grep -c "When This Skill Applies" .claude/skills/mvp/SKILL.md
grep -c "Key Rules" .claude/skills/mvp/SKILL.md
grep -c "Anti-Patterns" .claude/skills/mvp/SKILL.md
grep -c "Related Commands" .claude/skills/mvp/SKILL.md

# L2-L5: N/A — markdown only
```

## Acceptance Criteria

### Implementation
- [ ] `.claude/skills/mvp/SKILL.md` exists
- [ ] Frontmatter has: name, description, license, compatibility
- [ ] Has "When This Skill Applies" section
- [ ] Has "Anti-Patterns" section with at least 3 anti-patterns
- [ ] Has "Key Rules" section
- [ ] Has "Related Commands" section
- [ ] Does NOT simply duplicate `mvp.md` command steps

### Runtime
- [ ] Skill provides reasoning depth beyond the command workflow

## Handoff Notes

Task 2 creates `.claude/skills/prd/SKILL.md`. It follows the same pattern. The PRD skill
focuses on: spec lock quality, direction preview, backend design depth standards, and
what makes a PRD useful vs. decorative.

## Completion Checklist

- [ ] `.claude/skills/mvp/SKILL.md` created
- [ ] All grep validations pass
- [ ] File follows planning-methodology skill pattern
- [ ] `task-1.md` → `task-1.done.md` rename completed
