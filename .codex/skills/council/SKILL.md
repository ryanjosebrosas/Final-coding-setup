---
name: council
description: Multi-perspective reasoning with genuine argument discipline and synthesis quality.
             Use when the user wants multiple viewpoints on a decision or topic.
             Trigger phrases include: "council", "get multiple perspectives", "debate this
             topic", "what are different views on", "pros and cons", "argue both sides",
             "multi-perspective analysis", "what would different experts say".
---

# Council: Multi-Perspective Reasoning

## When to Use This Skill

Use this skill when a decision or topic benefits from multiple genuine perspectives.
Council is for real disagreement — questions where reasonable people reach different
conclusions for legitimate reasons.

Don't use council for questions with a single correct answer. "What's 2+2?" doesn't
need a council. "Should we use a monolith or microservices for this project?" does.

## Perspective Selection Quality

The value of a council depends on selecting perspectives that genuinely disagree.

**Good perspective selection:**
- Perspectives that have real-world proponents with coherent worldviews
- Perspectives that will reach different conclusions on THIS specific question
- Perspectives that illuminate different dimensions (technical, business, operational, user)

**Bad perspective selection:**
- Two perspectives that both recommend the same thing (not a real disagreement)
- Strawman perspectives that no one actually holds
- Generic "optimist/pessimist" framing that doesn't bring domain knowledge

For technical decisions: include both "pragmatic" and "principled" perspectives.
For product decisions: include both "user" and "business" perspectives.
For architecture decisions: include "maintenance" and "performance" perspectives.

## Genuine Argument Discipline

Each perspective must make its BEST argument, not a weakened version:

**Bad (weakened):**
"The monolith approach has some advantages but many teams prefer microservices."

**Good (genuine):**
"A monolith is the right choice for this stage. Microservices require 3x the
operational overhead — service discovery, distributed tracing, network partition
handling — which is pure overhead when you have one team and unknown traffic patterns.
Start monolith, extract services when you hit actual scaling constraints."

Each perspective should:
- State its position clearly (not hedge)
- Give 2-3 specific reasons
- Acknowledge the strongest counterargument and explain why it doesn't change the conclusion

## Synthesis vs. Picking a Winner

The synthesis after council perspectives is NOT about picking a winner — it's about
identifying what each perspective gets right and how to integrate those insights.

**Bad synthesis (picking a winner):**
"After reviewing both perspectives, microservices is the better choice."

**Good synthesis (integrating insights):**
"The pragmatic perspective is right that operational overhead is real and shouldn't
be underestimated for a small team. The principled perspective is right that tight
coupling creates long-term cost. The synthesis: start with a modular monolith —
hard module boundaries, no circular dependencies — that can be extracted into services
when specific modules show scaling needs."

## When to Escalate

Council is advisory, not decisive. When to escalate to the user:
- The question has business constraints only the user knows
- Perspectives are genuinely balanced with no synthesis possible
- The decision has irreversible consequences that require explicit user sign-off

## Key Rules

1. **Select perspectives that genuinely disagree** — not strawmen or fake balance
2. **Each perspective makes its best argument** — no weakened versions
3. **Acknowledge the strongest counterargument** — then explain why it doesn't change the conclusion
4. **Synthesis integrates, doesn't pick** — find what each perspective gets right
5. **Escalate when the user must decide** — council informs, user decides

## Related Commands

- `/council` — The multi-perspective discussion workflow this skill supports
- `/planning` — Often benefits from council on architectural decisions
- `/mvp` — Council can help weigh competing product directions
