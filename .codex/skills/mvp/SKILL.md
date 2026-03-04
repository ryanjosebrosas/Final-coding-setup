---
name: mvp
description: Guide big-idea discovery using Socratic questioning and scope discipline.
             Use when the user wants to define or refine their product MVP vision.
             Trigger phrases include: "define MVP", "what should I build", "help me
             discover my product idea", "refine my MVP", "what's the core feature",
             "help me scope my product", "MVP discovery".
---

# MVP: Big-Idea Discovery

## When to Use This Skill

Use this skill when the user wants to discover, define, or refine what they are building.
This is the FIRST step in the pipeline — before PRD, before planning, before any code.

## Core Discipline: One Question at a Time

The MVP discovery conversation has one rule: ask ONE question per turn.

**Why one question:**
- Multiple questions fragment the user's thinking
- The answer to question 1 often changes what question 2 should be
- One question creates focus; many questions create a form

**Bad (multiple questions):**
"What's the core problem? Who are your users? What's your monetization model?"

**Good (one question):**
"What's the one problem your product solves that nothing else solves well?"

Follow the user's answer before asking the next question. Don't have a fixed list —
let the conversation evolve based on what the user says.

## Discovery Arc

The conversation should naturally cover these areas, in whatever order emerges:

1. **Core problem** — What pain exists that isn't solved?
2. **Target user** — Who has this pain? How acute is it?
3. **Insight** — Why haven't existing solutions worked?
4. **Value** — What does success look like for the user?
5. **Scope** — What's the MINIMUM that delivers value?

Reach scope last — scope decisions only make sense after the problem and value are clear.

## Scope Gate

Before closing the discovery session, explicitly gate on scope:

"We've defined the problem and value. Now: what's the MINIMUM set of features that
delivers this value? What can we defer to v2?"

The scope gate forces a choice between "nice to have" and "must have." Features that
survive the scope gate become the MVP. Everything else is v2.

**Signs the scope gate is being bypassed:**
- User keeps adding features without removing others
- "We need X and Y and Z" without prioritization
- No discussion of what's out of scope

When this happens, ask: "If you could only ship ONE of those, which one creates the
most value?"

## MVP.md Quality Standards

The output of a good discovery session is `mvp.md` with:

- **Problem statement** — specific, not generic ("developers lose time context-switching
  between tools" not "productivity is hard")
- **Target user** — concrete ("solo developers building SaaS MVPs" not "developers")
- **Core insight** — why existing solutions don't work ("current tools require upfront
  configuration that blocks getting started")
- **Value proposition** — what success looks like for the user
- **MVP feature set** — 3-5 features that together deliver the value
- **Out of scope** — explicit list of what's deferred to v2

A weak mvp.md has: vague problem statement, no target user, and a feature list with
no scope discipline.

## Key Rules

1. **One question per turn** — never stack questions
2. **Follow the answer** — let the conversation evolve, don't follow a script
3. **Reach scope last** — don't discuss features before problem and value are clear
4. **Scope gate is mandatory** — every discovery session must force a must-have vs. nice-to-have decision
5. **MVP.md must be specific** — vague problem statements produce vague plans

## Related Commands

- `/mvp` — The MVP discovery workflow this skill supports
- `/prd` — Follows MVP; takes mvp.md and produces a full product spec
- `/planning` — Follows PRD; turns features into implementation plans
