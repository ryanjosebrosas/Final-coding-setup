# Task 4: Create Council Skill (Codex)

## Objective

Create `.codex/skills/council/SKILL.md` — a Codex CLI skill for multi-perspective discussions
that adds reasoning depth: perspective selection quality (genuinely distinct), genuine argument
discipline, and synthesis standards.

## Scope

- **File to create**: `.codex/skills/council/SKILL.md`
- **Out of scope**: Do NOT modify `.opencode/commands/council.md`
- **Dependencies**: None

## Prior Task Context

Tasks 1-3 created mvp, prd, planning skills. Council is different — it's not about creating
artifacts, it's about discussion quality. Same frontmatter pattern but the body focuses on
what makes a multi-perspective analysis useful vs. decorative.

## Context References

### Reference: Source Command — `.opencode/commands/council.md`

```markdown
---
description: Run a multi-perspective council discussion on the given topic
model: claude-opus-4-6
---

# Council
Present multiple perspectives on the given topic. Claude generates diverse viewpoints
internally — or uses the Agent tool to spawn sub-perspectives — then synthesizes them.

## How It Works
Council is a Claude-native discussion command. Claude presents 3-5 distinct perspectives
on the topic, then offers analysis and synthesis.

RULE — No Pre-Summarize: Present perspectives FIRST, in full. Do NOT summarize or
synthesize before the user has read the perspectives.

## Action
1. Identify 3-5 distinct perspectives — genuinely different viewpoints, not slight variations.
   Examples:
   - "Pragmatist vs Purist vs Performance-focused vs Security-focused"
   - "Junior dev vs Senior dev vs Architect vs User"
   - "Short-term vs Long-term vs Risk-averse vs Innovation-first"

2. Present each perspective in full (150-300 words each)

3. Analysis section:
   - Agreement: what all perspectives agree on
   - Conflicts: where perspectives fundamentally disagree and why
   - Key themes: 2-3 recurring themes

4. Synthesis: the most useful takeaway given all perspectives

## Rules
- Max 1 council per user question.
- For brainstorming use 3-4 perspectives; for architecture decisions use 4-5.
- Each perspective must argue its position genuinely — not strawman the others.
- The synthesis must not pick a "winner" unless the evidence clearly points to one.
```

### Reference: Codex frontmatter pattern (from prime skill)

```yaml
---
name: prime
description: Load project context at the start of a Codex session. Use when the user
             asks to prime, load context, start a session, check status, or find out
             what to work on next. Trigger phrases: "prime me", "load context",
             "what's the status", "start a new session", "what should I work on next".
---
```

## Patterns to Follow

### Pattern: Skill explains WHY the rule exists

Command says: "Each perspective must argue its position genuinely — not strawman the others."
Skill explains: Why strawmanning degrades the value of council — the user ends up with a
biased analysis that confirms what they already thought.

### Pattern: Good vs Bad examples

Bad perspectives: "Optimistic view" vs "Pessimistic view" — these are not genuinely distinct;
they're the same frame on opposite poles.
Good perspectives: "Security-first architect" vs "Pragmatic solo dev shipping fast" vs
"Product manager optimizing for user adoption" — these argue from different values.

## Step-by-Step Tasks

### IMPLEMENT: Create `.codex/skills/council/SKILL.md`

```markdown
---
name: council
description: Run a multi-perspective council discussion on the given topic, presenting
             genuinely distinct viewpoints then synthesizing them. Use when the user wants
             multiple perspectives on a decision, needs to explore tradeoffs from different
             angles, or wants to pressure-test an approach. Trigger phrases include:
             "council", "multiple perspectives", "what would different people think",
             "debate this", "pros and cons from different angles", "get a council on".
---

# Council: Multi-Perspective Discussion

## When to Use This Skill

Use this skill when:
- `/council {topic}` is invoked
- The user wants to explore a decision from multiple viewpoints
- Architecture choices or tradeoffs need to be pressure-tested
- A complex topic benefits from genuinely diverse analysis

## Perspective Selection Quality

The most important decision in council is choosing the right perspectives.

**What makes perspectives genuinely distinct:**
- Different VALUE systems (speed vs correctness vs maintainability vs security)
- Different ROLES with different incentives (user vs developer vs ops vs product manager)
- Different TIME horizons (short-term execution vs long-term architecture)
- Different RISK tolerances (ship now vs ship safely)

**Bad perspectives (not genuinely distinct):**
- "Optimistic view" vs "Pessimistic view" — same frame, opposite poles
- "Pro X" vs "Anti X" — these are positions, not viewpoints
- "Senior dev" vs "Very senior dev" — same values, different experience

**Good perspectives (genuinely distinct):**
- "Pragmatic solo developer shipping fast" vs "Security-focused architect" vs
  "Product manager focused on user adoption" — different values, different incentives
- "Short-term: ship in 2 days" vs "Long-term: build for 2 years" vs "Risk-averse: can't break prod"

**Selection heuristic:**
- Brainstorming topic → 3-4 perspectives
- Architecture decision → 4-5 perspectives
- "What could go wrong" → adversarial + defensive + neutral perspectives

## Genuine Argument Discipline

Each perspective must argue from its own values — not strawman the others.

**Strawmanning (prohibited):**
Perspective A (Security): "The pragmatists want to ship insecure code"
— This misrepresents Perspective B's actual position.

**Genuine argument:**
Perspective A (Security): "The threat model for this system includes external attackers.
Even if the probability is low, the impact of a breach is catastrophic. Shipping before
security review is accepted risk I'm unwilling to take."

**The test:** Could each perspective's author look at it and say "that's a fair representation
of my view"? If not, rewrite it.

## No-Pre-Summarize Rule

Present ALL perspectives in full BEFORE any analysis or synthesis.

Why: Presenting a summary first biases the reader toward the summary's framing.
The user should read each perspective fresh, with the analysis coming after.

Wrong order:
1. "Here are the key themes across perspectives..." [summary]
2. Perspective 1...
3. Perspective 2...

Right order:
1. Perspective 1 (full, 150-300 words)
2. Perspective 2 (full, 150-300 words)
3. Analysis: Agreement, Conflicts, Themes
4. Synthesis: the most useful takeaway

## Analysis Quality

The analysis section must identify genuine conflicts, not just list what each perspective said.

**Good analysis:**
```
Agreement: All perspectives agree that the current auth system will become a bottleneck
  at 10k concurrent users.

Conflicts: The Security perspective requires OAuth 2.0 + audit logging (2 week implementation).
  The Pragmatist perspective accepts session cookies with CSRF protection (2 day implementation).
  This is a genuine conflict: the same threat model is evaluated with different risk tolerances.

Key themes:
  1. Timeline pressure vs security depth trade-off
  2. All perspectives underestimate the migration cost of changing auth later
```

**Bad analysis:**
```
Key themes:
  1. Security is important
  2. Speed matters
  3. The team should decide
```

## Synthesis Standards

The synthesis must not pick a winner unless the evidence clearly points to one.

Instead: map the decision to the user's specific context and priorities.

**Good synthesis:**
"If you're pre-launch with no sensitive user data, the Pragmatist's 2-day approach
is defensible and the Security trade-off is acceptable — revisit before handling
payment data. If you're already handling PII, the Security perspective's concerns
are blocking regardless of timeline."

**Bad synthesis:**
"Both approaches have merit. You should weigh the tradeoffs and decide."

## Key Rules

1. **Perspectives must be genuinely distinct** — different values/roles, not the same frame
2. **No pre-summarize** — present all perspectives before analysis
3. **Each perspective argues genuinely** — no strawmanning other views
4. **Analysis names actual conflicts** — not just theme lists
5. **Synthesis maps to user's context** — not "you decide" without guidance
6. **Max 1 council per question** — don't run multiple councils on the same topic
```

### VALIDATE

```bash
grep -c "name: council" .codex/skills/council/SKILL.md
grep -c "When to Use This Skill" .codex/skills/council/SKILL.md
grep -c "Key Rules" .codex/skills/council/SKILL.md
grep -c "Trigger phrases" .codex/skills/council/SKILL.md
grep -c "Genuine Argument" .codex/skills/council/SKILL.md
```

## Testing Strategy

No unit tests — markdown. L1 grep + manual review that skill covers perspective selection
quality with good/bad examples and genuine argument discipline.

## Validation Commands

```bash
# L1
grep -c "name: council" .codex/skills/council/SKILL.md
grep -c "When to Use This Skill" .codex/skills/council/SKILL.md
grep -c "Key Rules" .codex/skills/council/SKILL.md
grep -c "Trigger phrases" .codex/skills/council/SKILL.md

# L2-L5: N/A
```

## Acceptance Criteria

### Implementation
- [ ] `.codex/skills/council/SKILL.md` exists
- [ ] Frontmatter has `name: council` and trigger phrases
- [ ] Has `## When to Use This Skill` section
- [ ] Has perspective selection quality section with good/bad examples
- [ ] Has genuine argument discipline section (no strawmanning)
- [ ] Has no-pre-summarize rule with explanation
- [ ] Has `## Key Rules` section

### Runtime
- [ ] Codex matches this skill when user says "council" or "multiple perspectives"

## Handoff Notes

Task 5 creates `.codex/skills/code-review-fix/SKILL.md`. Shift from discussion skills to
implementation/fix skills. Focus: hard entry gate (requires review file), minimal change
principle, severity ordering rationale, per-fix verification, scope discipline.

## Completion Checklist

- [ ] `.codex/skills/council/SKILL.md` created
- [ ] All grep validations pass
- [ ] `task-4.md` → `task-4.done.md` rename completed
