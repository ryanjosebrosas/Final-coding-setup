# Task 1: Harden /mvp Command + Skill

## Objective

Harden `.claude/commands/mvp.md` and `.claude/skills/mvp/SKILL.md` to enforce gates explicitly,
then sync both files to `.opencode/` mirrors — leaving all other commands untouched.

---

## Scope

**Files modified** (4 total):
- `.claude/commands/mvp.md` — command workflow (200 lines, exists)
- `.claude/skills/mvp/SKILL.md` — quality framework (113 lines, exists)
- `.opencode/commands/mvp.md` — mirror of command (sync after edit)
- `.opencode/skills/mvp/SKILL.md` — mirror of skill (create dir + file if needed)

**Out of scope:**
- `.claude/commands/prd.md` and any other command — do NOT touch
- `.codex/` directory — not part of this task
- `mvp.md` at project root — do NOT touch

**Depends on:** Nothing (first task)

---

## Prior Task Context

None. This is the first task in the command-hardening feature.

---

## Context References

### Current content of .claude/commands/mvp.md (full file — 200 lines)

```markdown
---
description: Define or refine the product MVP vision through interactive big-idea discovery
model: claude-opus-4-6
---

# MVP: Big Idea Discovery

The entry point to everything. Before a single line of code is written, the idea must be sharp. This command runs a Socratic discovery conversation to extract, pressure-test, and articulate the big idea — then produces `mvp.md` as the compass for the entire build pipeline.

## Usage

```
/mvp [topic or direction]
```

`$ARGUMENTS` — Optional: a rough idea, product name, or direction to start from.

---

## Pipeline Position

```
/mvp (big idea) → /prd (full spec) → /planning (feature plan) → /execute → /code-review → /commit → /pr
```

This is Step 1. Nothing else starts without a clear `mvp.md`.

---

## Step 1: Check Existing MVP

Check if `mvp.md` exists at the project root.

**If exists:**
1. Read `mvp.md` fully.
2. Present a crisp summary:
   ```
   Existing MVP found:
   - Product: {name}
   - Big Idea: {2 sentences}
   - Core Capabilities: {list}
   - Tech Direction: {stack or "not set"}
   - Status: {MVP Done When — how many checked?}
   ```
3. Ask: "Is this still the direction, or do you want to revise?"
4. If satisfied → skip to Step 4 (confirm and done).
5. If revising → continue to Step 2 with the existing content as context.

**If doesn't exist:**
Continue to Step 2.

---

## Step 2: Big Idea Discovery (Interactive)

This is the most important step. The goal is not to fill a form — it is to pressure-test the idea until it is clear, honest, and buildable.

### Phase A: Extract the Core Idea

Start with one open question. Do NOT ask a list of questions upfront.

```
What are you building?
```

Listen to the answer. Then respond with one of:
- **Restate + challenge**: "So you're building X. What makes that different from Y that already exists?"
- **Dig deeper**: "Who specifically is the person who needs this? What are they doing right now instead?"
- **Scope probe**: "When you say 'done', what does the first working version look like?"

**Rules for this phase:**
- Ask ONE question at a time. Never fire a list.
- Each question must respond to what the user just said — not a pre-written script.
- Push back if the idea is vague: "That's broad — can you give me a concrete scenario where this gets used?"
- Push back if the scope is too large: "That sounds like 6 months of work. What's the smallest version that proves the idea?"
- Keep going until you can answer all three of these yourself:
  1. What does this build?
  2. Who uses it and why?
  3. What is the first working version?

### Phase B: Capture Tech Direction

Once the product idea is clear, shift to tech direction. This feeds directly into `/prd`.

Ask:
```
What's your tech direction? (language, framework, stack — or "not sure yet")
```

If they have a direction: capture it. Don't challenge it unless it's clearly wrong for the use case.
If they say "not sure": ask one follow-up — "What environment does this run in? (web app, CLI tool, API service, mobile app, etc.)"

Capture:
- Preferred language/framework (or "undecided")
- Runtime environment (web, API, CLI, desktop, mobile, embedded)
- Any known constraints (existing codebase, hosting requirements, team familiarity)

### Phase C: Scope Gate

Before writing anything, present your synthesis and ask for a hard confirmation:

```
Here's what I've heard:

Big Idea: {one sentence — what it does and why it matters}
User: {who uses it}
Core Problem: {the pain it solves}
First Version: {what "done" looks like concretely}
Tech Direction: {stack or "undecided"}

Does this capture it? (yes / adjust: ...)
```

Do NOT proceed until the user says yes or makes corrections. Incorporate corrections and re-present if needed.

---

## Step 3: Write mvp.md

Write `mvp.md` at the project root:

```markdown
# {Product Name}

## Big Idea

{2-3 sentences: what it is, who it's for, what problem it solves, what makes it different.
This should be precise enough to read to a developer and have them understand what to build.}

## Users and Problems

- **Primary user**: {who — be specific, not "developers" but "solo developers building SaaS tools"}
- **Problem 1**: {concrete pain point with a real scenario}
- **Problem 2**: {concrete pain point}
- **Problem 3**: {optional — only add if genuinely distinct}

## Core Capabilities

These are the building blocks. Each one becomes one or more features in /planning.

1. {Capability — one line, verb-first: "Store and retrieve..."}
2. {Capability}
3. {Capability}
4. {Capability}
5. {Optional — 4-6 capabilities is the right range for an MVP}

## Tech Direction

- **Language**: {language or "undecided"}
- **Framework**: {framework or "undecided"}
- **Runtime**: {web app / API service / CLI / mobile / etc.}
- **Key Constraints**: {any hard constraints, or "none identified"}

## Out of Scope (MVP)

These are real ideas that belong in a future version — not this one.

- {Deferred capability — with one sentence on WHY it's deferred}
- {Deferred capability}

## MVP Done When

These are the acceptance signals for the entire project.

- [ ] {Concrete, testable signal — not "works well" but "user can do X end-to-end"}
- [ ] {Concrete signal}
- [ ] {Concrete signal}
```

---

## Step 4: Confirm and Advance

Show the user the written `mvp.md` and present the next step:

```
MVP defined. Saved to mvp.md.

Core capabilities identified: {N}
Tech direction: {stack summary}
MVP done when: {N criteria}

Next: /prd — expand this into a full product spec with architecture, tech stack,
backend design, API contracts, and implementation phases.

Then for each capability: /planning {feature} to create an implementation plan.

Run /prd to continue.
```

---

## Notes

- **One question at a time.** The Socratic approach only works if you listen between questions.
- **Push back on scope.** An MVP that takes 6 months is not an MVP. Challenge large ideas into their smallest useful form.
- **Tech direction is captured here, not invented in /prd.** If the user says "FastAPI + PostgreSQL", that's what /prd designs around.
- **mvp.md is a compass, not a spec.** Keep it under 50 lines. Details belong in /prd.
- **"Out of Scope" is as important as "In Scope".** Explicitly naming what's deferred prevents scope creep in every downstream command.
- **The discovery conversation is the real work.** A 10-minute conversation here saves days of building the wrong thing.
```

### Current content of .claude/skills/mvp/SKILL.md (full file — 113 lines)

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

---

## Patterns to Follow

### Gate enforcement pattern (apply to Phase C)

Every gate in every command must have:
1. The confirmation prompt block (formatted)
2. Immediately followed by: "Do NOT proceed until the user says yes or makes corrections."

Current Phase C has the prompt but the enforcement language is weak:
```
Do NOT proceed until the user says yes or makes corrections.
```
This is already present — but needs to also say: "Incorporate corrections and re-present until confirmed."

### Out of Scope mandatory pattern

Current template marks the Out of Scope section as clearly present but the description
"These are real ideas that belong in a future version" doesn't signal it's REQUIRED.

Add a REQUIRED callout before the template block:
```markdown
**REQUIRED: Include at least 2 deferred items with reasons.** An MVP with no Out of Scope
section has not been scoped — scope creep will happen downstream.
```

### SKILL.md Hard Stop pattern (from skills/commit/SKILL.md style)

Add a callout box or bold text for Phase C:
```markdown
## Phase C: Hard Stop

Phase C is a HARD STOP — not a suggestion. Do NOT write `mvp.md` until the user
explicitly confirms the synthesis. If the user says "close enough" or "yeah that's fine",
re-present the synthesis and ask for an unambiguous "yes" or specific adjustments.
```

---

## Step-by-Step Tasks

### Step 1: Edit .claude/commands/mvp.md

IMPLEMENT: Apply three targeted hardening edits:

**Edit 1 — Harden Phase C gate language**

CURRENT (in Step 2, Phase C section):
```markdown
Do NOT proceed until the user says yes or makes corrections. Incorporate corrections and re-present if needed.
```

REPLACE WITH:
```markdown
**HARD STOP** — Do NOT write `mvp.md` until the user explicitly confirms. "Close enough"
is not confirmation. If the user is vague, re-present the synthesis and ask again.
Incorporate corrections and re-present until you have an unambiguous "yes".
```

**Edit 2 — Make Out of Scope mandatory in Step 3 template**

CURRENT (in Step 3, before the Out of Scope section of the template):
```markdown
## Out of Scope (MVP)

These are real ideas that belong in a future version — not this one.
```

REPLACE WITH:
```markdown
## Out of Scope (MVP)

**REQUIRED: At least 2 items.** An MVP with no Out of Scope section has not been scoped.
Scope creep happens downstream when deferrals are unnamed here.

These are real ideas that belong in a future version — not this one.
```

**Edit 3 — Add file confirmation to Step 4**

CURRENT (Step 4 output block):
```markdown
MVP defined. Saved to mvp.md.
```

REPLACE WITH:
```markdown
mvp.md written to: {project root}/mvp.md
Lines: {line count} | Capabilities: {N} | Done-when criteria: {N}
```

PATTERN: Confirmation blocks should report what was actually written, not just "done."

VALIDATE: `grep -n "HARD STOP\|REQUIRED" .claude/commands/mvp.md` — should return 2 results

### Step 2: Edit .claude/skills/mvp/SKILL.md

IMPLEMENT: Apply two targeted hardening edits:

**Edit 1 — Add Phase C Hard Stop callout section**

Insert after the "Scope Gate Quality" section and before "mvp.md Quality Standards":

```markdown
## Phase C: The Hard Stop

Phase C is a HARD STOP — not a suggestion. The synthesis confirmation gate exists
because discovery conversations create implicit understanding that may not match what the
user actually wants. Making it explicit catches the gap before writing.

**Hard Stop signals** — require re-presentation, not proceeding:
- "Yeah, that's basically it" — too vague; ask for explicit yes or specific adjustments
- "Sure, go ahead" — could mean "yes that's right" or "just write something"; confirm
- No response / one-word acknowledgment — not confirmation

**What counts as confirmed:**
- "Yes, that captures it" / "Yes, proceed" / explicit adjustments that the user then approves

Do NOT write `mvp.md` until one of these is received.
```

**Edit 2 — Expand Revision Mode with pre-update check**

CURRENT (Revision Mode, step 4):
```markdown
4. If revising: identify specifically what changed, update only the affected sections
```

REPLACE WITH:
```markdown
4. If revising: before editing, read the current content of each section to be changed.
   Identify specifically what changed from the user's input vs what already exists.
   Update only the affected sections — do NOT rewrite sections the user didn't mention.
```

VALIDATE: `grep -n "Hard Stop\|pre-update" .claude/skills/mvp/SKILL.md` — should return results

### Step 3: Sync to opencode mirrors

**For .opencode/commands/mvp.md:**
Read the updated `.claude/commands/mvp.md` and write identical content to `.opencode/commands/mvp.md`.

**For .opencode/skills/mvp/SKILL.md:**
1. Create directory if not exists: `.opencode/skills/mvp/`
2. Write identical content to `.opencode/skills/mvp/SKILL.md`

Note: The opencode mirrors are byte-for-byte identical — same frontmatter including `compatibility: claude-code`.
This is the observed pattern (checked against existing opencode files which mirror claude exactly).

VALIDATE:
```bash
diff .claude/commands/mvp.md .opencode/commands/mvp.md   # should output nothing
diff .claude/skills/mvp/SKILL.md .opencode/skills/mvp/SKILL.md   # should output nothing
```

---

## Testing Strategy

**Unit (per-file):**
- `mvp.md` command: Phase C section contains "HARD STOP"; Out of Scope template contains "REQUIRED"
- `SKILL.md` skill: Contains "Phase C: The Hard Stop" section; Revision Mode has "before editing, read"
- Both mirror files: zero diff against source files

**Integration:**
- All 4 files open without markdown parse errors
- Pipeline Position block in command still reads correctly (no broken formatting)

**Edge cases:**
- SKILL.md frontmatter must remain valid YAML after edits
- Template code blocks in command file must remain properly fenced (no broken ```)

---

## Validation Commands

**L1 Syntax — verify even code fence count:**
```bash
python3 -c "
import re
for f in ['.claude/commands/mvp.md', '.opencode/commands/mvp.md']:
    content = open(f).read()
    count = len(re.findall(r'^```', content, re.MULTILINE))
    print(f'{f}: {count} fences (should be even: {count % 2 == 0})')
"
```

**L2 Structure — required sections:**
```bash
grep -n "Pipeline Position\|Phase C\|Hard Stop\|REQUIRED\|Out of Scope" .claude/commands/mvp.md
grep -n "Phase C: The Hard Stop\|Hard Stop\|Revision Mode\|Key Rules" .claude/skills/mvp/SKILL.md
```

**L3 Gate enforcement:**
```bash
grep -n "HARD STOP\|Do NOT write\|REQUIRED" .claude/commands/mvp.md
```

**L4 Mirror sync:**
```bash
diff .claude/commands/mvp.md .opencode/commands/mvp.md && echo "COMMAND MIRROR OK"
diff .claude/skills/mvp/SKILL.md .opencode/skills/mvp/SKILL.md && echo "SKILL MIRROR OK"
```

**L5 Pipeline references:**
```bash
grep -n "Pipeline Position" .claude/commands/mvp.md
# Should show the pipeline line — verify no broken formatting
```

---

## Acceptance Criteria

### Implementation

- [ ] `.claude/commands/mvp.md` Phase C section contains "HARD STOP" enforcement text
- [ ] `.claude/commands/mvp.md` Out of Scope template section contains "REQUIRED: At least 2 items"
- [ ] `.claude/commands/mvp.md` Step 4 output block shows file path written (not just "Saved to mvp.md")
- [ ] `.claude/skills/mvp/SKILL.md` contains "Phase C: The Hard Stop" section
- [ ] `.claude/skills/mvp/SKILL.md` Revision Mode step 4 includes "before editing, read"
- [ ] `.opencode/commands/mvp.md` exists and is identical to `.claude/commands/mvp.md`
- [ ] `.opencode/skills/mvp/SKILL.md` exists and is identical to `.claude/skills/mvp/SKILL.md`

### Runtime

- [ ] L1: Both command files have even number of code fence markers
- [ ] L2: Both command files have "Pipeline Position" section; both skill files have "Key Rules" section
- [ ] L3: `grep "HARD STOP" .claude/commands/mvp.md` returns at least 1 match
- [ ] L4: `diff .claude/commands/mvp.md .opencode/commands/mvp.md` produces no output
- [ ] L4: `diff .claude/skills/mvp/SKILL.md .opencode/skills/mvp/SKILL.md` produces no output

---

## Handoff Notes

Task 2 targets `.claude/commands/prd.md` and `.claude/skills/prd/SKILL.md`. Same hardening
pattern: enforce gate language explicitly, sync opencode mirrors. No dependency on Task 1's
output (different files). Task 2 should note that the PRD output next-step pipeline reference
needs to be updated to say "/pillars" (since /pillars command will be created in Task 3).

---

## Completion Checklist

- [ ] Read `.claude/commands/mvp.md` before editing
- [ ] Read `.claude/skills/mvp/SKILL.md` before editing
- [ ] Applied Phase C HARD STOP hardening to command
- [ ] Applied Out of Scope REQUIRED hardening to command
- [ ] Applied Step 4 file-written confirmation to command
- [ ] Applied Phase C Hard Stop section to skill
- [ ] Applied Revision Mode pre-update check to skill
- [ ] Synced `.opencode/commands/mvp.md` (identical copy)
- [ ] Synced `.opencode/skills/mvp/SKILL.md` (identical copy, created dir if needed)
- [ ] All validation commands pass
- [ ] All acceptance criteria checked off
