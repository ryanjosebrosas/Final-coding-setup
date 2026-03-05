---
name: council
description: Knowledge framework for multi-perspective reasoning with genuine argument discipline and synthesis quality
license: MIT
compatibility: opencode
---

# Council — Multi-Perspective Reasoning Methodology

This skill provides the quality standards for running effective council discussions. It
complements the `/council` command — the command provides the format, this skill provides
the standards for perspective quality, argument discipline, and synthesis rigor.

## When This Skill Applies

- `/council {topic}` is invoked
- User asks for "multiple perspectives on...", "what are the tradeoffs of...",
  "argue both sides of...", "help me think through..."
- An architectural decision needs structured exploration before committing
- A technical debate needs a framework to surface and compare positions

## Perspective Selection Quality

A high-quality council identifies perspectives that are **genuinely distinct** — not
slight variations of the same position. Quality test:

**Good selection** — Each perspective represents a fundamentally different value system:
- Pragmatist (ship it, iterate) vs Purist (get it right the first time)
- Security-first (assume breach) vs Velocity-first (move fast)
- Short-term (quarterly goals) vs Long-term (architectural integrity)

**Bad selection** — Perspectives that differ only in degree, not kind:
- "Moderate caution" vs "Significant caution" vs "Extreme caution" — this is one perspective
- "Use Redis" vs "Use Memcached" vs "Use a DB cache" — these are options, not perspectives

**How to identify distinct perspectives:**
1. What value does this perspective optimize for? (speed, safety, maintainability, cost...)
2. Would someone with this perspective make a different decision than someone with perspective X?
3. Is this perspective genuinely held by real practitioners, not a strawman?

## Genuine Argument Discipline

Each perspective must argue from its own values — it cannot know or respond to what
other perspectives said. Rules:

**Each perspective must:**
- Lead with its core value or priority ("From a security standpoint, the first concern is...")
- Make positive claims about its approach ("This approach ensures...")
- Acknowledge its own tradeoffs honestly ("The cost of this approach is...")

**Each perspective must NOT:**
- Reference or dismiss other perspectives ("Unlike the pragmatist view...")
- Appear to know it will be followed by other perspectives
- Argue in bad faith (strawman) or disproportionately soft-pedal its position

**Word count discipline:** 150-300 words per perspective. Under 150 = not developed enough.
Over 300 = introducing unnecessary complexity for one view.

## Analysis Quality

The Analysis section surfaces what the perspectives actually revealed:

**Agreement** — What do all perspectives agree on, despite different values?
This is important: if every perspective agrees on X, X is probably correct regardless
of which approach is chosen.

**Conflicts** — Where perspectives are genuinely irreconcilable given the constraints?
Not "Perspective 1 prefers X while Perspective 3 prefers Y" but WHY they conflict:
"The security-first and velocity-first perspectives conflict because their success
metrics are mutually exclusive in this context — you cannot have both zero authentication
bypass risk AND one-day deployment cycles with the current team size."

**Key themes** — 2-3 themes that cut across all perspectives.
These often reveal the actual decision criteria, not just the surface-level debate.

## Synthesis Standards

The synthesis is NOT a summary of the perspectives. It is the answer to:
"Given everything the council surfaced, what would a well-informed decision-maker conclude?"

**Synthesis must:**
- Map the decision to the user's specific context and constraints
- Identify which perspective's concerns are most relevant GIVEN the constraints
- Name the tradeoff being accepted, not just the recommendation

**Synthesis must NOT:**
- Pick a winner without reasoning ("Perspective 2 wins")
- Summarize what each perspective said (that is the Analysis section's job)
- Be neutral to the point of uselessness ("It depends")

**The synthesis acknowledges uncertainty correctly:**
Good: "Given that your team is 2 people and you have a 3-month runway, the pragmatist
approach is most appropriate here — the purity concerns are valid but premature at this scale."
Bad: "Both the pragmatist and purist approaches have merits and the right choice depends
on your priorities."

## When to Use /council

Best for:
- Architecture decisions with no objectively correct answer
- Technical tradeoff debates (monolith vs microservices, SQL vs NoSQL)
- Process decisions (how to structure the team, review cadence)
- Prioritization dilemmas (which feature to build first)

Not needed for:
- Factual questions ("What does X command do?")
- Clear best-practice situations (don't council about whether to validate inputs)
- Questions with one correct answer

## Anti-Patterns

**Pre-summarize** — Saying "I'll present 3 perspectives: A will argue X, B will argue Y,
C will argue Z" before presenting them removes the value. The user should encounter each
perspective fully before seeing the analysis.

**Strawman perspectives** — A perspective that exaggerates or caricatures its position to
make it easier to dismiss is a strawman. Example: "The reckless approach would ignore all
security entirely and just ship anything." No real practitioner holds this view.

**False balance** — Treating a well-supported view and a fringe view with equal weight
to appear balanced. If the evidence strongly supports one approach, the synthesis should
reflect that, not artificially elevate the alternative.

**Synthesis as summary** — Listing what each perspective said is not synthesis. Synthesis
is the answer to: "What should someone DO with this information?"

**Multiple council runs** — Running /council multiple times on the same question with
slight reframing produces inconsistent outputs and analysis paralysis. Max 1 council per
decision question.

## Key Rules

1. **Perspectives first, synthesis last** — Never summarize before the user reads perspectives
2. **Genuine distinctness** — Each perspective must optimize for a different value
3. **Argue honestly** — Each perspective defends its position without knowing other views
4. **Analysis surfaces conflicts** — Not just "they disagree" but WHY they disagree
5. **Synthesis is actionable** — Maps to the user's context, names the tradeoff accepted
6. **150-300 words per perspective** — Enough depth without unnecessary length
7. **Max 1 council per question** — Re-running the same question produces noise, not signal

## Related Commands

- `/council {topic}` — The multi-perspective workflow this skill supports
- `/planning {feature}` — Use `/council` when an architecture decision in planning is non-trivial
- `/prd` — Use `/council` on architecture approach before committing Section 6