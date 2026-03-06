# OpenCode Integration Guide

This guide explains how to use the integrated OpenCode AI Coding System.

## Table of Contents

1. [Categories](#categories)
2. [Skills](#skills)
3. [Hooks](#hooks)
4. [Commands](#commands)
5. [Wisdom Accumulation](#wisdom-accumulation)
6. [Quick Reference](#quick-reference)

---

## Categories

Categories optimize model selection for specific task types. Use the `category` parameter in `task()` dispatch.

### Available Categories

| Category | Model | Use For |
|----------|-------|---------|
| `visual-engineering` | openai/gpt-5.3-codex | Frontend, UI/UX, styling, animations |
| `ultrabrain` | openai/gpt-5.3-codex | Hard algorithms, architecture, complex logic |
| `artistry` | openai/gpt-5.3-codex | Creative solutions, unconventional approaches |
| `quick` | openai/gpt-5.3-codex | Trivial changes, typo fixes, simple modifications |
| `deep` | openai/gpt-5.3-codex | Investigation, research, debugging, trace |
| `unspecified-low` | openai/gpt-5.3-codex | General low-stakes tasks |
| `unspecified-high` | openai/gpt-5.3-codex | General high-stakes tasks |
| `writing` | openai/gpt-5.3-codex | Documentation, prose, technical writing |

### Selection Gates

Categories have validation gates to prevent misuse:

- **quick** rejects: architecture, security, database, complex features
- **ultrabrain** requires: algorithm, architecture, optimization, security
- **deep** prefers: investigate, research, debug, understand

### Example Usage

```typescript
// Quick task
task({
  category: "quick",
  prompt: "Fix typo in README.md",
  load_skills: []
})

// Deep investigation
task({
  category: "deep",
  prompt: "Investigate memory leak in auth flow",
  load_skills: ["prime"]
})

// Ultrabrain for hard problem
task({
  category: "ultrabrain",
  prompt: "Design distributed caching strategy for high-traffic API",
  load_skills: ["planning-methodology"]
})
```

---

## Skills

Skills inject specialized knowledge into task dispatch. Use `load_skills` to add context.

### Available Skills

| Skill | Purpose |
|-------|---------|
| `prime` | Context loading methodology |
| `planning-methodology` | Interactive discovery + structured plans |
| `code-loop` | Review → fix → review cycle |
| `code-review` | Technical code review |
| `code-review-fix` | Apply fixes from review findings |
| `commit` | Conventional commit creation |
| `council` | Multi-perspective reasoning |
| `decompose` | Pillar identification for PRDs |
| `execute` | Implementation execution |
| `final-review` | Human approval gate |
| `mvp` | Big-idea discovery |
| `pillars` | PRD pillar analysis |
| `pr` | Pull request creation |
| `prd` | Product requirements document |
| `system-review` | Divergence analysis |

### Example Usage

```typescript
task({
  category: "visual-engineering",
  prompt: "Implement responsive navbar",
  load_skills: ["frontend-ui-ux", "git-master"]
})

task({
  category: "quick",
  prompt: "Add logging to utils",
  load_skills: [] // No skills needed for trivial task
})
```

---

## Hooks

Hooks enforce completion guarantees and session continuity. They run automatically.

### Hook Tiers (Execution Order)

| Tier | Priority | Hooks |
|------|----------|-------|
| **Continuation** | 1 | todo-continuation, atlas, session-recovery, background-notification |
| **Session** | 2 | agent-usage-reminder |
| **Tool-Guard** | 3 | rules-injector, comment-checker, directory-agents-injector |
| **Transform** | 4 | (placeholder) |
| **Skill** | 5 | category-skill-reminder |

### Key Hooks

#### todo-continuation

Ensures todos are completed before session ends.

**Events**: `session.idle`, `session.error`, `session.deleted`

**Behavior**: 
- Checks for incomplete todos
- Injects continuation reminder
- Prevents premature session exit

#### atlas

Manages boulder state for task orchestration.

**Events**: `tool.execute.before`, `tool.execute.after`

**Behavior**:
- Reads `boulder.json` for plan progress
- Orchestrates task execution
- Writes state after each task

#### session-recovery

Recovers from recoverable errors.

**Events**: `chat.message`

**Behavior**:
- Detects error types (missing tool result, unavailable tool, etc.)
- Aborts session with toast notification
- Triggers recovery callback if set

---

## Commands

Slash commands trigger specific workflows.

### Pipeline Commands

| Command | Model | Purpose |
|---------|-------|---------|
| `/prime` | ollama/glm-5:cloud | Load codebase context |
| `/mvp` | anthropic/claude-opus-4-6 | Define product vision |
| `/prd` | anthropic/claude-opus-4-6 | Create requirements document |
| `/planning` | anthropic/claude-opus-4-6 | Interactive planning → task briefs |
| `/execute` | openai/gpt-5.3-codex | Implement from task brief |
| `/code-loop` | openai/gpt-5.3-codex | Review → fix → review cycle |
| `/code-review` | openai/gpt-5.3-codex | Technical code review |
| `/code-review-fix` | openai/gpt-5.3-codex | Apply fixes from review |
| `/final-review` | openai/gpt-5.3-codex | Human approval gate |
| `/system-review` | openai/gpt-5.3-codex | Divergence analysis |
| `/commit` | ollama/glm-5:cloud | Create conventional commit |
| `/pr` | openai/gpt-5.3-codex | Create pull request |

### Utility Commands

| Command | Purpose |
|---------|---------|
| `/code-review` | Technical review |
| `/system-review` | Divergence analysis |
| `/council` | Multi-perspective discussion |

### Command Flow

```
/prime → /planning {feature} → codex /execute → /code-loop → /commit → /pr
```

---

## Wisdom Accumulation

The wisdom system captures learnings across sessions and injects them into future tasks.

### Wisdom Lifecycle

```
1. CAPTURE (end of task)
   ├── extractFromReviewFinding()
   ├── extractFromTestFailure()
   ├── extractFromSuccess()
   └── extractFromReport()

2. CATEGORIZE
   ├── Convention — Established patterns
   ├── Success — What worked well
   ├── Failure — What to avoid
   └── Gotcha — Traps and edge cases

3. STORE
   └── .agents/wisdom/{feature}/learnings.md

4. RETRIEVE (start of next task)
   └── loadWisdom(feature) → filter by relevance

5. INJECT (into prompt)
   └── buildInjectionBlock() → prepend to task
```

### Wisdom File Structure

```
.agents/wisdom/{feature}/
├── learnings.md      # Conventions, Successes, Failures, Gotchas
├── decisions.md      # Architectural decisions with rationale
├── issues.md         # Open/resolved issues
├── verification.md   # Test results
└── problems.md       # Technical debt
```

### Example Wisdom Entry

```markdown
## ⚠️ GOTCHAS TO AVOID

### JWT in localStorage
- **Pattern**: Storing JWT in localStorage
- **Problem**: XSS vulnerability
- **Location**: src/auth/token.ts
- **Solution**: Use httpOnly cookies instead
- **Severity**: critical
- **Confidence**: 95
```

---

## Quick Reference

### Category Selection

```
Quick task (typo, simple change) → quick
Deep investigation (debug, research) → deep  
Hard problem (architecture, algorithm) → ultrabrain
Frontend/UI work → visual-engineering
Documentation → writing
Creative/unconventional → artistry
General purpose, low stakes → unspecified-low
General purpose, high stakes → unspecified-high
```

### Skill Selection

```
Need context? → prime
Writing plan? → planning-methodology
Code review? → code-review
Commit time? → commit
```

### Command Quick Reference

```
Start session → /prime
Plan feature → /planning {feature}
Execute plan → codex /execute task-1.md
Review code → /code-loop
Commit changes → /commit
Create PR → /pr
```

---

## Further Reading

- **AGENTS.md** — Full agent documentation
- **README.md** — Project overview
- **.opencode/commands/** — Command definitions
- **.opencode/skills/** — Skill definitions
