---
name: mvp
description: Knowledge framework for big-idea discovery using Socratic questioning and scope discipline
license: MIT
compatibility: opencode
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
4. If revising: before editing, read the current content of each section to be changed.
   Identify specifically what changed from the user's input vs what already exists.
   Update only the affected sections — do NOT rewrite sections the user didn't mention.
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
