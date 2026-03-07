---
name: prd
description: Knowledge framework for producing actionable PRDs with binding tech decisions and deep backend design
license: MIT
compatibility: opencode
---

# PRD Methodology — Binding Decisions + Backend Depth

This skill provides the quality standards and depth criteria for producing PRDs that are
genuinely useful for downstream planning. It complements the `/prd` command — the command
provides the workflow, this skill provides the quality bar.

## When This Skill Applies

- User invokes `/prd` or asks to "write the product spec" / "create the PRD"
- `mvp.md` exists and needs to be expanded into a full technical specification
- An existing PRD needs revision or quality assessment

## The Two Gates (Non-Negotiable)

Every PRD session must pass through two gates before writing:

**Gate 1: Spec Lock (Step 0)**
Lock these before drafting: Product name, Big Idea, Tech Direction, Implementation Mode,
Target Path, Maturity Target, PRD Depth. Get explicit confirmation.
Why: Writing a PRD on a misunderstood foundation wastes hours and produces a document
nobody uses.

**Gate 2: Direction Preview (Step 0.5)**
Show a one-page preview: problem framing, scope in/out, architecture, assumptions, tech stack.
Get explicit approval.
Why: Architecture is the hardest thing to change after the PRD is written. Catch it here.

## Section Depth Standards

**Section 7 (Technology Stack) — Must Be Binding**
This section flows directly into `/planning`. It must be specific:

Good: `| Language | TypeScript | 5.4 | Type safety + existing team familiarity |`
Bad:  `| Language | Modern web language | latest | good for web |`

Every row in the tech stack table must have: technology name, specific version, one-line reason.
"TBD" in all fields means Section 7 is decoration, not a decision.

**Section 8 (Backend Design) — The Technical Heart**

Section 8 is what separates a useful PRD from a decorative one. Quality standard:

Data models must have actual field names:
```
Good:
Entity: User
Fields:
  - id: UUID — primary key, auto-generated
  - email: string — unique, validated on write
  - created_at: timestamp — set on insert, never updated

Bad:
Entity: User
Fields: user data fields
```

Service contracts must specify interface:
```
Good:
Service: AuthService
Interface:
  login(email: string, password: string): Promise<AuthToken | AuthError>
  refresh(token: string): Promise<AuthToken | ExpiredError>

Bad:
Service: AuthService
Responsibility: handles authentication
```

**Section 12 (Implementation Phases) — Must Enable /pillars**

Each phase must specify:
- Concrete deliverables (not "implement authentication" but "create AuthService with
  login, logout, refresh methods + JWT token generation + Redis session store")
- Validation: how to know this phase is done
- Enables: what the next phase can do because this phase exists

A phase that says "implement core features" is not a phase — it is a placeholder.

## Depth by PRD Type

**Default: Full PRD** (all sections 1-15).
Use lightweight only when explicitly requested by the user.

**Lightweight PRD** (Sections 1-6, 11-12 only):
Use when: internal tools, prototypes, or when the tech stack is already well-known
Skip: detailed API spec, deep backend service contracts, appendix

**Full PRD** (all 15 sections):
Use when: new products, external APIs, anything with non-trivial auth or data models
Required: complete Section 8 with data models + service contracts

**Agent/Tool projects** — Emphasize Section 8 (tool contracts, I/O specs)
**User-facing apps** — Emphasize Section 5 (user stories) + Section 9 (API spec)

## Assumption Labeling

Every assumption must be labeled explicitly:
`Assumption: Users will be authenticated before accessing the API — Rationale: mvp.md
specifies auth as a core capability`

Unlabeled assumptions are invisible risks. When they turn out to be wrong, the PRD
has to be rewritten.

## Gate Refusal

If the user refuses to confirm the Spec Lock or Direction Preview:
1. Ask what specifically they want to change
2. Update the spec lock / preview with the change
3. Re-present and ask for confirmation again

Do NOT proceed to write the PRD until confirmed. If the user keeps saying "just write it",
explain that the gates catch architecture mistakes that are costly to fix after writing.

## Anti-Patterns

**Decorative PRD** — Has all 15 sections but makes no binding decisions. Every section
says what to consider rather than what was decided.
Detection: If someone could write a completely different system from this PRD, it is decorative.

**Generic architecture** — "REST API + database" without specifying which database,
which ORM, which auth approach. Section 6 must draw the actual system.

**Vague success criteria** — "performs well", "users are satisfied", "scales appropriately"
are not success criteria. Each criterion must be measurable:
Good: "Responds in <200ms for typical queries at 100 concurrent users"
Bad: "Performs well under load"

**Skipping the gates** — Writing the PRD without Spec Lock or Direction Preview produces
a document that may be based on wrong assumptions about product or architecture.

**Section 12 without enablement** — Each phase must explicitly state what it enables.
Without this, `/planning` sessions don't know their dependencies.

## Key Rules

1. **Two gates are non-negotiable** — Spec Lock + Direction Preview before writing
2. **Section 7 must be binding** — Specific tech, specific versions, specific reasons
3. **Section 8 is the heart** — Data models with field names, service contracts with types
4. **Section 12 enables /pillars** — Each phase must be concrete; /pillars uses these phases to define infrastructure layers
5. **Label every assumption** — Unlabeled assumptions are invisible failures
6. **Out of Scope needs reasons** — "Feature X deferred: complexity, needs user feedback first"
7. **For existing codebases**: scan the repo first, extract actual patterns rather than inventing

## Related Commands

- `/mvp` — Creates `mvp.md` which `/prd` reads as primary input
- `/prd [filename]` — The full PRD workflow this skill supports
- `/pillars` — Analyzes the PRD to identify infrastructure layers and build order
- `/planning {feature}` — Each implementation phase in Section 12 becomes one `/planning` session
