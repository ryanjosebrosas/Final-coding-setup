# Claude AI Coding System

A production-grade AI-assisted development framework for Claude Code. This is a complete **development operating system** with structured workflows, multi-agent orchestration, and human oversight at every step.

---

## Why This Exists

Building software with AI is chaotic. Models hallucinate, lose context between sessions, and make changes without oversight. This system solves three critical problems:

| Problem | Solution |
|---------|----------|
| **Context Loss** | Session handoff via `.agents/context/next-command.md` — every session knows exactly where you left off |
| **Cost Overruns** | Model tiering — Opus orchestrates, Codex executes, GLM-5:cloud handles utilities |
| **Quality Issues** | PIV Loop with mandatory planning and review gates before any code ships |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ORCHESTRATION LAYER                             │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │    Sisyphus      │    │      Oracle      │    │      Metis       │       │
│  │  (Claude Opus)   │    │  (Claude Opus)   │    │  (Claude Opus)   │       │
│  │   Orchestrator   │───▶│   Consultation   │    │   Gap Analysis   │       │
│  └────────┬─────────┘    └──────────────────┘    └──────────────────┘       │
│           │                                                                  │
│           │ delegates via task()                                            │
│           ▼                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              EXECUTION LAYER                                 │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │   Hephaestus     │    │ Sisyphus-Junior  │    │      Momus       │       │
│  │  (GPT-5.3-Codex) │    │  (GPT-5.3-Codex) │    │  (Claude Opus)   │       │
│  │   Deep Worker    │    │ Category Executor│    │  Plan Reviewer   │       │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              UTILITY LAYER                                   │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │     Explore      │    │    Librarian     │    │      Atlas       │       │
│  │  (GLM-5:cloud)   │    │  (GLM-5:cloud)   │    │  (GLM-5:cloud)   │       │
│  │  Codebase Grep   │    │  External Docs   │    │  Todo Tracking   │       │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘       │
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │ Multimodal-Looker│                                                        │
│  │ (Gemini-3-Flash) │                                                        │
│  │  PDF/Image Parse │                                                        │
│  └──────────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Model Assignment

| Role | Model | Agents |
|------|-------|--------|
| **Orchestration** | Claude Opus 4.5 | Sisyphus |
| **Consultation** | Claude Opus 4.5 | Oracle, Metis, Momus |
| **Execution** | GPT-5.3-Codex | Hephaestus, Sisyphus-Junior |
| **Utility** | GLM-5:cloud | Atlas, Librarian, Explore |
| **Vision** | Gemini-3-Flash | Multimodal-Looker |

---

## The PIV Loop

Every feature follows **Plan → Implement → Validate**. No exceptions.

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
│  START  │────▶│  /planning  │────▶│  /execute   │────▶│  MORE   │
└─────────┘     │  {feature}  │     │  plan.md    │     │ TASKS?  │
                └──────┬──────┘     └─────────────┘     └────┬────┘
                       │                                      │
                       ▼                                      │ yes
                ┌─────────────┐                               │
                │    USER     │◀──────────────────────────────┘
                │  APPROVES?  │
                └──────┬──────┘
                       │ yes
                       ▼
                ┌─────────────┐     ┌─────────────┐     ┌─────────┐
                │ /code-loop  │────▶│   ISSUES?   │────▶│  /commit │
                │  {feature}  │     │             │ no  │   /pr    │
                └─────────────┘     └──────┬──────┘     └─────────┘
                       ▲                   │ yes
                       └───────────────────┘
```

### Hard Rules

| Rule | Enforcement |
|------|-------------|
| **Planning is mandatory** | `/planning` auto-invoked on "implement", "add", "refactor" |
| **User approval required** | Every plan must be reviewed and approved |
| **Opus never edits directly** | Orchestrator delegates ALL file edits via `task()` |
| **Validation at every level** | Lint → Types → Tests → Human review |

---

## Agent System

### 10 Specialized Agents

```
                              ┌─────────────────┐
                              │    SISYPHUS     │
                              │  Orchestrator   │
                              │ (Claude Opus)   │
                              └────────┬────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
    ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
    │  PLANNING   │            │ EXECUTION   │            │  RESEARCH   │
    └──────┬──────┘            └──────┬──────┘            └──────┬──────┘
           │                          │                          │
    ┌──────┴──────┐            ┌──────┴──────┐            ┌──────┴──────┐
    │             │            │             │            │             │
    ▼             ▼            ▼             ▼            ▼             ▼
┌───────┐   ┌───────┐    ┌───────┐   ┌───────┐    ┌───────┐   ┌───────┐
│ Metis │   │ Momus │    │Hephae-│   │Sisyph-│    │Explore│   │Librar-│
│ (Gap  │   │(Plan  │    │ stus  │   │Junior │    │(Code- │   │ ian   │
│Analyze│   │Review)│    │(Deep) │   │(Tasks)│    │ base) │   │(Docs) │
└───────┘   └───────┘    └───────┘   └───────┘    └───────┘   └───────┘
```

### Agent Reference

| Agent | Model | Role | Permissions |
|-------|-------|------|-------------|
| **Sisyphus** | Claude Opus 4.5 | Main orchestrator, workflow management | Full |
| **Oracle** | Claude Opus 4.5 | Architecture consultation, debugging help | Read-only |
| **Metis** | Claude Opus 4.5 | Pre-planning gap analysis | Read-only |
| **Momus** | Claude Opus 4.5 | Plan completeness review | Read-only |
| **Hephaestus** | GPT-5.3-Codex | Deep autonomous implementation | Full (no delegation) |
| **Sisyphus-Junior** | GPT-5.3-Codex | Category-dispatched execution | Full (no delegation) |
| **Atlas** | GLM-5:cloud | Todo tracking, progress management | Full (no delegation) |
| **Explore** | GLM-5:cloud | Internal codebase grep | Read-only |
| **Librarian** | GLM-5:cloud | External documentation search | Read-only |
| **Multimodal-Looker** | Gemini-3-Flash | PDF/image analysis | Vision-only |

### Permission Levels

| Level | read | write | edit | bash | grep | delegate |
|-------|------|-------|------|------|------|----------|
| `full` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `full-no-task` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `read-only` | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `vision-only` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## Delegation System

### Auto-Invoke /planning

When Sisyphus detects implementation intent ("implement X", "add Y", "refactor Z"), it **automatically invokes `/planning`**:

```
User: "implement auth system"
         ↓
Sisyphus: "I detect implementation intent. Invoking /planning auth-system..."
         ↓
/planning runs full interview workflow
         ↓
User approves plan
         ↓
Execution begins via task()
```

### Category Dispatch

All execution routes through `task()` with categories:

```typescript
task(
  category="deep",           // Model selection
  load_skills=["execute"],   // Skill injection
  prompt="Implement auth middleware..."
)
```

| Category | Model | Use For |
|----------|-------|---------|
| `visual-engineering` | GPT-5.3-Codex | Frontend, UI/UX, styling |
| `ultrabrain` | GPT-5.3-Codex | Hard logic, algorithms |
| `deep` | GPT-5.3-Codex | Autonomous problem-solving |
| `quick` | GPT-5.3-Codex | Single file changes, typos |
| `writing` | GPT-5.3-Codex | Documentation, prose |
| `artistry` | GPT-5.3-Codex | Creative, non-standard solutions |

### Token-Conscious Routing

**Opus orchestrates. Codex executes. GLM-5:cloud researches.**

| Task | Route To | NOT |
|------|----------|-----|
| File edits | `task(category="quick")` | Direct Edit tool |
| Implementation | `task(category="deep")` | Direct Edit tool |
| Codebase search | `task(subagent_type="explore")` | Direct Grep |
| External docs | `task(subagent_type="librarian")` | Direct WebFetch |

---

## Slash Commands

### Session Management

| Command | Purpose |
|---------|---------|
| `/prime` | Load context, detect stack, surface pending work. **Run first.** |

### Planning Pipeline

| Command | Purpose |
|---------|---------|
| `/planning {feature}` | Interactive discovery → plan + task briefs |
| `/execute {plan.md}` | Implement from plan (one task per session) |
| `/code-loop {feature}` | Review → fix → re-review cycle |
| `/commit` | Conventional commit with scope |
| `/pr {feature}` | Create pull request |

### Project Foundation

| Command | Purpose |
|---------|---------|
| `/mvp` | Big-idea discovery via Socratic interview |
| `/prd` | Product Requirements Document |
| `/pillars` | Architectural pillars with gate criteria |
| `/decompose` | Break PRD into ordered specs |

### Code Quality

| Command | Purpose |
|---------|---------|
| `/code-review` | Technical review (Critical/Major/Minor) |
| `/code-review-fix {review}` | Apply fixes by severity |
| `/final-review` | Human approval gate |
| `/system-review` | Plan vs implementation divergence |

---

## State Management

### Pipeline Handoff

Session continuity via `.agents/context/next-command.md`:

```markdown
# Pipeline Handoff
- Last Command: /execute (task 2 of 4)
- Feature: user-auth
- Next Command: /execute .agents/features/user-auth/plan.md
- Task Progress: 2/4 complete
- Status: executing-tasks
```

### Artifact Lifecycle

```
plan.md ──▶ task-{N}.md ──▶ task-{N}.done.md ──▶ plan.done.md
                                                      │
                                                      ▼
                                               report.md ──▶ report.done.md
                                                      │
                                                      ▼
                                               review.md ──▶ review.done.md
```

| Artifact | Created By | Marked Done By |
|----------|-----------|----------------|
| `plan.md` | `/planning` | `/execute` (all tasks done) |
| `task-{N}.md` | `/planning` | `/execute` |
| `report.md` | `/execute` | `/commit` |
| `review.md` | `/code-review` | `/commit` |

### Directory Structure

```
.agents/
├── context/
│   └── next-command.md      ← Pipeline handoff
├── features/{name}/
│   ├── plan.md              ← Feature plan
│   ├── task-{N}.md          ← Task briefs
│   ├── report.md            ← Execution report
│   └── review.md            ← Code review
└── specs/
    ├── BUILD_ORDER.md
    └── PILLARS.md

.opencode/
├── agents/
│   └── registry.ts          ← Agent definitions
├── commands/
│   └── planning.md          ← /planning methodology
├── config/
│   └── load-categories.ts   ← Category → model mapping
├── hooks/
│   └── *.ts                 ← Lifecycle hooks
└── skills/
    └── {skill}/SKILL.md     ← Loadable skills
```

---

## Lifecycle Hooks

Key hooks for completion guarantees:

| Hook | Purpose |
|------|---------|
| `todo-continuation` | Preserves todos across context compactions |
| `category-skill-reminder` | Reminds to load skills for categories |
| `agent-usage-reminder` | Suggests explore/librarian over direct tools |
| `session-recovery` | Detects errors, provides recovery |
| `command-model-router` | Routes commands to appropriate models |

---

## Getting Started

### 1. Copy Framework

```bash
cp -r claude-ai-coding-system/.opencode your-project/
cp -r claude-ai-coding-system/.agents your-project/
cp claude-ai-coding-system/AGENTS.md your-project/
```

### 2. Start Session

```bash
/prime                    # Load context
/planning {feature}       # Plan your feature
# (approve plan)
/execute plan.md          # Execute task 1
# (repeat for each task)
/code-loop {feature}      # Review cycle
/commit && /pr {feature}  # Ship it
```

### Session Flow

```
Session 1: /prime → /planning feature → END (plan approved)
Session 2: /prime → /execute plan.md  → END (task 1)
Session 3: /prime → /execute plan.md  → END (task 2)
Session N: /prime → /code-loop        → END (clean)
Session N+1: /prime → /commit → /pr   → END (shipped)
```

---

## Requirements

| Requirement | Purpose |
|-------------|---------|
| Claude Code CLI | Base AI coding assistant |
| `git` CLI | Version control |
| `gh` CLI | Pull request creation |
| Node.js / Bun | TypeScript infrastructure |

### Model Access

The system uses these models (configure via your provider):

- **Claude Opus 4.5** — Orchestration, consultation
- **GPT-5.3-Codex** — Execution (all categories)
- **GLM-5** — Utility agents (Ollama)
- **Gemini-3-Flash** — Vision tasks

---

## Key Principles

1. **Opus orchestrates, never implements** — All file edits delegated via `task()`
2. **Planning before implementation** — `/planning` auto-invoked for implementation requests
3. **One task per session** — Context windows are finite; embrace the limit
4. **Handoff preserves state** — `next-command.md` tells you exactly what's next
5. **Skills enhance agents** — Load domain-specific knowledge via `load_skills=[]`

---

## License

MIT

---

## Contributing

1. Fork the repository
2. Run `/planning your-feature`
3. Follow the PIV Loop
4. Submit a PR
