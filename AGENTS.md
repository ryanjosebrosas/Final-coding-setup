# Claude Code AI Coding System

This repository contains an AI-assisted development framework with structured workflows, slash commands, and context engineering methodology.

## Core Methodology

**ARCHITECTURE — Claude Plans, Execution Agent Implements** — Claude (this session) handles ONLY planning, architecture, orchestration, review, commit, and PR. ALL implementation (file edits, code writing, refactoring) is handed to an **execution agent**. 

**Execution Options (FLEXIBLE — choose what works for you):**

| Option | How It Works | When to Use |
|--------|--------------|-------------|
| **Codex CLI** | `codex /execute .agents/features/{feature}/task-{N}.md` | Default, automated execution |
| **Alternative CLI** | `aider --file task.md`, `gemini execute task.md`, etc. | If you prefer a different execution agent |
| **Manual Execution** | Read `task-{N}.md` → implement by hand → review with `/code-review` | Full control, learning, or when no CLI available |
| **Dispatch Agent** | `dispatch(mode="agent", taskType="execution", ...)` | Use T1 models via OpenCode server |

**The execution agent is a SWAPPABLE SLOT.** The task brief format (`.agents/features/{feature}/task-{N}.md`) is the universal interface — any agent, tool, or human that can read a markdown file and implement the instructions works.

**Violation examples** (all FORBIDDEN):
- Claude using Edit/Write tools on .ts, .py, .md config, or any project source file
- Claude writing code in a response and asking the user to apply it
- Proceeding to execution without a `/planning`-generated task brief in `.agents/features/`

**Valid implementation paths:**
1. **Automated**: Plan in `.agents/features/{feature}/` → hand to Codex: `codex /execute .agents/features/{feature}/task-{N}.md` → Codex edits → Claude reviews via `/code-review`
2. **Manual**: Plan in `.agents/features/{feature}/` → read `task-{N}.md` → implement by hand → Claude reviews via `/code-review`
3. **Alternative CLI**: Plan in `.agents/features/{feature}/` → use preferred execution agent → Claude reviews via `/code-review`

**HARD RULE — /planning Before ALL Implementation** — EVERY feature, fix, or non-trivial change MUST go through `/planning` first. The plan MUST be reviewed and approved by the user before ANY implementation begins. No exceptions. No "quick fixes." No "I'll just do this one thing." The sequence is ALWAYS: `/planning` → user reviews plan → user approves → **choose execution method**. Jumping straight to code is a VIOLATION even if the task seems simple.

**MODEL TIERS — Use the right model for the task:**
- **Opus** (`claude-opus-4-6`) → thinking & planning: `/mvp`, `/prd`, `/planning`, `/council`, architecture decisions
- **Sonnet** (`claude-sonnet-4-6`) → review & validation: `/code-review`, `/code-loop`, `/system-review`, `/pr`, `/final-review`
- **Haiku** (`claude-haiku-4-5-20251001`) → retrieval & light tasks: `/prime`, RAG queries, `/commit`, quick checks
- **Execution Agent** → implementation: YOU choose (manual, Codex, aider, Claude Code, etc.)

**YAGNI** — Only implement what's needed. No premature optimization.
**KISS** — Prefer simple, readable solutions over clever abstractions.
**DRY** — Extract common patterns; balance with YAGNI.
**Limit AI Assumptions** — Be explicit in plans and prompts. Less guessing = better output.
**Always Be Priming (ABP)** — Start every session with /prime. Context is everything.

## PIV Loop (Plan → Implement → Validate)

```
PLAN → IMPLEMENT → VALIDATE → (iterate)
```

### Granularity Principle

Multiple small PIV loops — one feature slice per loop, built completely before moving on.
Complex features (10+ tasks): `/planning` auto-decomposes into task briefs, one brief per session.

### Planning (Layer 1 + Layer 2)

**Layer 1 — Project Planning** (done once):
- PRD (what to build), AGENTS.md / CLAUDE.md (how to build)

**Layer 2 — Task Planning** (done for every feature):
1. **Discovery** — conversation with the user to explore ideas and research the codebase
2. **Structured Plan** — turn conversation into a markdown document
   - Save to: `.agents/features/{feature}/plan.md`
   - Apply the 4 pillars of Context Engineering (see Context Engineering section)

**Do NOT** take your PRD and use it as a structured plan. Break it into granular Layer 2 plans — one per PIV loop.

### Implementation

Choose your execution method:

| Method | Command | Best For |
|--------|---------|-----------|
| **Codex CLI** | `codex /execute .agents/features/{feature}/task-{N}.md` | Automated execution (default) |
| **Alternative CLI** | `aider --file task.md`, `gemini execute task.md`, etc. | Different execution agent preference |
| **Manual Execution** | Read `task-N.md` → implement by hand → `/code-review` | Full control, learning, no CLI required |
| **Dispatch Agent** | `dispatch(mode="agent", taskType="execution", ...)` | T1 models via OpenCode server |

**Implementation rules:**
- One task brief per session (then task-2.md, task-3.md...)
- Trust but verify — always run `/code-review` after execution
- **MANDATORY**: Never execute without a `/planning` artifact in `.agents/features/`
- **MANDATORY**: The plan MUST be reviewed and approved by the user before execution
- If tempted to skip planning for a "simple" change — STOP. Run `/planning` anyway.

**Manual execution workflow:**
1. Open `.agents/features/{feature}/task-{N}.md` (read the brief)
2. Implement by hand using your preferred editor/IDE
3. Run `/code-review` or `/code-loop` to validate
4. Mark complete: `task-N.md` → `task-N.done.md`

### Validation
- AI: tests + linting. Human: code review + manual testing.
- 5-level pyramid: Syntax → Types → Unit → Integration → Human.
- Small issues → fix prompts. Major issues → revert to save point, tweak plan, retry.

## Context Engineering (4 Pillars)

Structured plans must cover 4 pillars:
1. **Memory** — discovery conversation (short-term) + `memory.md` (long-term, read at `/prime`, updated at `/commit`)
2. **RAG** — external docs, library references. If Archon MCP available, use `rag_search_knowledge_base()` first.
3. **Prompt Engineering** — be explicit, reduce assumptions
4. **Task Management** — step-by-step task list. If Archon MCP available, sync tasks with `manage_task()`.

### Pillar → Plan Mapping

| Pillar | Plan Section | What to Include |
|--------|-------------|-----------------|
| **Memory** | Related Memories | Past decisions, gotchas from `memory.md` |
| **RAG** | Relevant Documentation, Patterns to Follow | External docs, codebase code examples |
| **Prompt Engineering** | Solution Statement, Implementation Plan | Explicit decisions, step-by-step detail |
| **Task Management** | Step-by-Step Tasks | Atomic tasks with all 7 fields filled |

## Git Save Points

**Before implementation**, commit the plan:
```
git add .agents/features/{feature}/plan.md && git commit -m "plan: {feature} structured plan"
```

**If implementation fails**: `git stash` → tweak plan → retry.

**NEVER include `Co-Authored-By` lines in commits.** Commits are authored solely by the user.

## Decision Framework

**Proceed autonomously when:**
- Task is clear, following established patterns, or plan is explicit

**Ask the user when:**
- Requirements ambiguous, multiple approaches, breaking changes, or business logic decisions

Use `/planning` for structured plans in `.agents/features/`.

## Archon Integration

If Archon MCP is connected, use it for knowledge management, RAG search, and task tracking.

### RAG Workflow (Research Before Implementation)

#### Searching Documentation

1. **Get sources** → `rag_get_available_sources()` - Returns list with id, title, url
2. **Find source ID** → Match to documentation
3. **Search** → `rag_search_knowledge_base(query="vector functions", source_id="src_abc123")`

**CRITICAL**: Keep queries SHORT (2-5 keywords only). Vector search works best with concise queries.

#### General Research

```python
# Search knowledge base (2-5 keywords only!)
rag_search_knowledge_base(query="authentication JWT", match_count=5)

# Find code examples
rag_search_code_examples(query="React hooks", match_count=3)

# Read full page content
rag_read_full_page(page_id="...")  # or url="https://..."
```

### Task Tracking (Optional)

If connected, sync plan tasks to Archon for visibility:

```python
# Create project for feature
manage_project("create", title="feature-name", description="...")

# Create tasks from plan
manage_task("create", project_id="proj-123", title="Task name", description="...", task_order=10)

# Update task status as you work
manage_task("update", task_id="task-123", status="doing")
manage_task("update", task_id="task-123", status="done")
```

**Task Status Flow**: `todo` → `doing` → `review` → `done`

### RAG Query Optimization

Good queries (2-5 keywords):
- `rag_search_knowledge_base(query="vector search pgvector")`
- `rag_search_code_examples(query="React useState")`

Bad queries (too long):
- `rag_search_knowledge_base(query="how to implement vector search with pgvector in PostgreSQL...")`

### If Archon Not Connected

Proceed without it. Archon is an enhancement, not a requirement. Use local codebase exploration (Glob, Grep, Read) and WebFetch for documentation.

## Execution Agent Integration (`.codex/` or Alternative)

The execution agent is a **swappable slot**. Choose one:

| Option | Location | Invoke |
|--------|----------|--------|
| **Codex CLI** (default) | `.codex/skills/execute/SKILL.md` | `codex /execute task.md` |
| **Aider CLI** | Create `.aider/skills/execute/SKILL.md` | `aider --file task.md` |
| **Gemini CLI** | Create skills for Gemini | `gemini execute task.md` |
| **Manual** | None required | Read `task-N.md` → implement → `/code-review` |

**Codex CLI skills** (if installed):
- `.codex/skills/execute/SKILL.md` — Execute a task brief (invoke: "execute the task brief at...")
- `.codex/skills/prime/SKILL.md` — Load project context (invoke: "prime me" or "load context")
- `.codex/skills/commit/SKILL.md` — Create a conventional commit (invoke: "commit my changes")
- `.codex/skills/code-review/SKILL.md` — Technical code review (invoke: "review my code" or "code review")
- `.codex/skills/code-loop/SKILL.md` — Automated fix loop (invoke: "code loop" or "fix all review issues")

---

## Project Structure

### Dynamic Content (`.agents/`)
All generated/dynamic content lives at project root:
- `.agents/features/{name}/` — All artifacts for one feature (plan, report, review, loop reports)
  - `plan.md` / `plan.done.md` — Feature plan overview + task index (marked done when all task briefs done)
  - `task-{N}.md` / `task-{N}.done.md` — Task briefs (one per `/execute` session, default mode)
  - `plan-master.md` — Master plan for very large multi-phase features (escape hatch)
  - `plan-phase-{N}.md` — Sub-plans for each phase (executed one per session, not sequentially)
  - `report.md` / `report.done.md` — Execution report (marked done after commit)
  - `review.md` / `review.done.md` — Code review (marked done when addressed)
  - `review-{N}.md` — Numbered reviews from `/code-loop` iterations
  - `loop-report-{N}.md` — Loop iteration reports
  - `checkpoint-{N}.md` — Loop checkpoints
  - `fixes-{N}.md` — Fix plans from `/code-loop`
- `.agents/context/` — Session context
  - `next-command.md` — Pipeline handoff file (auto-updated by every pipeline command, read by `/prime`)

#### `.done.md` Lifecycle

| Artifact | Created by | Marked `.done.md` by | Trigger |
|----------|-----------|---------------------|---------|
| `plan.md` | `/planning` | `/execute` | All task briefs done (or legacy single plan executed) |
| `task-{N}.md` | `/planning` | `/execute` | Task brief fully executed in one session |
| `plan-master.md` | `/planning` | `/execute` | All phases completed |
| `plan-phase-{N}.md` | `/planning` | `/execute` | Phase fully executed |
| `report.md` | `/execute` | `/commit` | Changes committed to git |
| `review.md` | `/code-review` | `/commit` or `/code-loop` | All findings addressed |
| `review-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
| `loop-report-{N}.md` | `/code-loop` | `/code-loop` | Clean exit |
| `fixes-{N}.md` | `/code-loop` | `/code-loop` | Fixes fully applied |

#### Pipeline Handoff File

`.agents/context/next-command.md` is a **singleton** file overwritten by every pipeline command on completion. It tracks the current pipeline position so that `/prime` can surface "what to do next" when starting a new session.

| Field | Purpose |
|-------|---------|
| **Last Command** | Which command just completed |
| **Feature** | Active feature name |
| **Next Command** | Exact command to run next |
| **Master Plan** | Path to master plan (if multi-phase) |
| **Phase Progress** | N/M complete (if multi-phase) |
| **Task Progress** | N/M complete (if task brief mode) |
| **Timestamp** | When handoff was written |
| **Status** | Pipeline state (awaiting-execution, executing-tasks, executing-series, awaiting-review, awaiting-fixes, awaiting-re-review, ready-to-commit, ready-for-pr, pr-open, blocked) |

The handoff file is NOT a log — it only contains the latest state. History lives in git commits and `.done.md` artifacts.

#### Feature Name Propagation

The **Feature** field in the handoff file is the canonical source for feature names. All pipeline commands must:
1. **Read** the Feature field from `.agents/context/next-command.md` first
2. **Fall back** to derivation (commit scope, report path, directory name) only if the handoff is missing or stale
3. **Write** the same Feature value to the handoff when completing

This ensures consistent feature names across sessions. If a command derives a feature name from a fallback source, it must match the handoff value. If they conflict, the handoff value wins.

#### Session Model (One Command Per Context Window)

Each session is one model context window. The autonomous flow is:

```
Session:  /prime → [one command] → END
```

**Task brief feature (default):**
```
Session 1:  /prime → /planning {feature}                         → END (plan.md + task-N.md files written)
Session 2:  /prime → /execute .agents/features/{f}/plan.md       → END (task 1 only — auto-detected)
Session 3:  /prime → /execute .agents/features/{f}/plan.md       → END (task 2 — auto-detected)
Session N+1:/prime → /execute .agents/features/{f}/plan.md       → END (task N — auto-detected)
Session N+2:/prime → /code-loop {feature}                        → END
Session N+3:/prime → /commit → /pr                               → END (both in same session)
```

**Master plan feature (multi-phase, escape hatch for 10+ task features):**
```
Session 1:  /prime → /planning {feature}                         → END (master + sub-plans written)
Session 2:  /prime → /execute .../plan-master.md                 → END (phase 1 only)
Session 3:  /prime → /execute .../plan-master.md                 → END (phase 2 — auto-detected)
Session 4:  /prime → /execute .../plan-master.md                 → END (phase N — auto-detected)
Session 5:  /prime → /code-loop {feature}                        → END
Session 6:  /prime → /commit → /pr                               → END (both in same session)
```

**Key rules:**
- `/execute` with task briefs executes ONE brief per session, never loops through all briefs
- `/execute` with a master plan executes ONE phase per session, never loops through all phases
- The handoff file tells the next session exactly what to run — the user just runs `/prime`
- Task brief detection is automatic: `/execute plan.md` scans for `task-{N}.done.md` files and picks the next undone brief
- Phase detection is automatic: `/execute plan-master.md` scans for `.done.md` files and picks the next undone phase
- If a session crashes, the brief/phase wasn't marked `.done.md`, so the next session retries it
- `/commit → /pr` runs in the same session when they are the final pipeline step. `/commit` writes a `ready-for-pr` handoff, but `/pr` runs immediately after (not in a separate session). If `/pr` fails, its failure handoff persists for the next `/prime` session.

### Static Configuration (`.claude/`)
System configuration and reusable assets:
- `.claude/commands/` — Slash commands (manual pipeline)
- `.claude/sections/` — Auto-loaded rules (always loaded)
- `.claude/config.md` — Auto-detected project stack and validation commands

---

## Manual Pipeline

```
/prime → /mvp → /prd → /planning {feature} → /execute → /code-loop → /commit → /pr
```

## Model Assignment

| Model | Role | Commands |
|-------|------|----------|
| **Claude Opus** | Think / Plan | `/mvp`, `/prd`, `/planning`, `/council` |
| **Claude Sonnet** | Review / Validate | `/code-review`, `/code-loop`, `/system-review`, `/pr`, `/final-review` |
| **Claude Haiku** | Retrieve / Light | `/prime`, `/commit`, RAG queries |
| **Execution Agent** | Implement | `codex /execute`, `aider --file`, `dispatch(agent)`, OR manual implementation |

**Execution is FLEXIBLE** — The task brief format is the universal interface. Use Codex CLI (default), alternative CLI (Aider, Gemini, etc.), dispatch to T1 models, or implement manually.

## Key Commands

| Command | Model | Purpose |
|---------|-------|---------|
| `/prime` | Haiku | Load codebase context at session start |
| `/mvp` | Opus | Define product vision (big idea discovery) |
| `/prd` | Opus | Create full product requirements document |
| `/planning {feature}` | Opus | Create structured implementation plan + task briefs |
| `codex /execute {brief}` | Codex CLI | Implement from task brief (one brief per session) |
| `/code-review` | Sonnet | Technical code review |
| `/code-review-fix {review}` | Sonnet | Apply fixes from code review findings |
| `/code-loop {feature}` | Sonnet | Review → fix → re-review cycle |
| `/final-review` | Sonnet | Human approval gate before commit |
| `/system-review` | Sonnet | Divergence analysis (plan vs implementation) |
| `/commit` | Haiku | Conventional git commit |
| `/pr` | Sonnet | Create pull request from feature commits |
| `/council {topic}` | Opus | Multi-perspective discussion for architecture decisions |
