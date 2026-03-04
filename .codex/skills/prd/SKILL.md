---
name: prd
description: Produce actionable PRDs with binding tech decisions and deep backend design.
             Use when the user wants to create a product requirements document.
             Trigger phrases include: "create PRD", "write product spec", "product
             requirements document", "write the PRD", "spec out the product",
             "document the requirements", "write a technical spec".
---

# PRD: Product Requirements Document

## When to Use This Skill

Use this skill when the user needs a PRD that can drive implementation planning.
A PRD is only useful if it answers the questions that `/planning` will ask — it must
contain binding decisions, not open questions.

## Spec Lock — The Direction Preview Gate

Before writing the full PRD, present a Direction Preview:

```
DIRECTION PREVIEW
=================
Tech Stack: {language, framework, DB, hosting}
Architecture: {monolith / microservices / serverless}
Auth: {JWT / session / OAuth provider}
Key Decisions: {3-5 binding choices}
```

Get explicit approval before writing the full PRD. Why:
- Full PRDs are 400+ lines — writing the wrong one wastes significant effort
- The direction preview takes 5 minutes; a wrong full PRD wastes an hour
- Users often discover they want to change direction when they see it summarized

**Spec Lock means**: once the direction preview is approved, the PRD captures those
decisions as binding — they don't change during planning or implementation.

## Section 8 Depth Standards

Section 8 (Backend Design) is where PRDs most often fail to provide enough depth.
Quality standard:

**Too shallow:**
"The API will handle user authentication."

**Sufficient depth:**
```
POST /auth/login
  Body: { email: string, password: string }
  Returns: { token: string, expires_at: ISO8601 }
  Errors: 401 (invalid credentials), 422 (validation), 429 (rate limited)
  Rate limit: 5 attempts per IP per minute
```

For each backend API endpoint, the PRD should specify:
- Method + path
- Request body shape
- Response shape (success + error cases)
- Auth requirement
- Rate limiting (if applicable)

For data models, specify:
- Fields with types
- Constraints (required, unique, indexed)
- Relationships

## What Makes a PRD Useful vs. Decorative

**Useful PRD** — Planning can start immediately after reading it:
- Every tech decision is made and binding
- Data models are specified
- API contracts are defined
- Edge cases are called out
- Success criteria are measurable

**Decorative PRD** — Planning still has unanswered questions:
- "We'll use a modern framework" (which one?)
- "Handle errors gracefully" (how?)
- "User management" (what exactly does the user need to manage?)
- Success criteria are vague ("users should find it easy to use")

## Key Rules

1. **Direction preview before full PRD** — never write 400 lines before confirming direction
2. **Spec Lock** — decisions in the PRD are binding; don't re-open them during planning
3. **Section 8 depth** — API endpoints need method, path, body, response, errors
4. **Measurable success criteria** — "3-second load time" not "fast"
5. **No open questions** — every "TBD" is a planning blocker; resolve it in the PRD

## Related Commands

- `/prd` — The PRD creation workflow this skill supports
- `/mvp` — Precedes PRD; provides the problem + scope that the PRD specifies
- `/planning` — Consumes the PRD; turns it into implementation plans
