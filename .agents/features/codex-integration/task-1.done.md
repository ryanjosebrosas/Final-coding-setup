# Task 1: Inline AGENTS.md Sections

<!--
USAGE: codex "execute task-1 for codex-integration feature"
       Codex reads this brief and implements it autonomously.
       ONE session = ONE task brief.
REJECTION CRITERIA: Do not execute if AGENTS.md already has inline section content.
-->

---

## OBJECTIVE

Replace the 6 `@.claude/sections/` include references in `AGENTS.md` with the full inlined
content of each section file, so Codex CLI (and any agent that reads `AGENTS.md`) receives
all system instructions without needing `@` include expansion.

---

## SCOPE

**Files touched:**
- `AGENTS.md` — project root (MODIFY)

**Out of scope:**
- Do NOT touch `.claude/sections/` files — they are the source, keep them intact
- Do NOT touch `.opencode/` or `.claude/` configuration
- Do NOT modify the Project Structure, Pipeline, Model Assignment, or Key Commands
  sections of AGENTS.md — only replace the 6 `@` include lines
- Do NOT add `.codex/` references yet — that is Tasks 2-4

**Depends on:** Nothing (first task)

---

## PRIOR TASK CONTEXT

None — this is the first task.

---

## CONTEXT REFERENCES

### Current AGENTS.md (full content — lines 1-28 being modified)

```markdown
# Claude Code AI Coding System

This repository contains an AI-assisted development framework with structured workflows,
slash commands, and context engineering methodology.

## Core Methodology

@.claude/sections/01_core_principles.md

## PIV Loop (Plan → Implement → Validate)

@.claude/sections/02_piv_loop.md

## Context Engineering (4 Pillars)

@.claude/sections/03_context_engineering.md

## Git Save Points

@.claude/sections/04_git_save_points.md

## Decision Framework

@.claude/sections/05_decision_framework.md

## Archon Integration

@.claude/sections/06_archon_workflow.md
```

### Section 01 — Core Principles (full content)

```markdown
**ARCHITECTURE — Claude Plans, Codex Executes** — Claude (this session) handles ONLY planning,
architecture, orchestration, review, commit, and PR. ALL implementation (file edits, code writing,
refactoring) is handed to Codex CLI via `codex /execute {task-brief-path}`. Claude does NOT use
Edit/Write tools on project source files directly — that is Codex's job. The execution agent is
a **swappable slot** — currently Codex CLI, but any CLI agent that can read a task brief and
execute instructions can fill this role.

**Violation examples** (all FORBIDDEN):
- Claude using Edit/Write tools on .ts, .py, .md config, or any project source file
- Claude writing code in a response and asking the user to apply it
- Proceeding to execution without a `/planning`-generated task brief in `.agents/features/`

**Valid implementation path**: Plan in `.agents/features/{feature}/` → hand to Codex:
`codex /execute .agents/features/{feature}/task-{N}.md` → Codex edits via its own tools →
Claude reviews via `/code-review`

**HARD RULE — /planning Before ALL Implementation** — EVERY feature, fix, or non-trivial change
MUST go through `/planning` first. The plan MUST be reviewed and approved by the user before ANY
implementation begins. No exceptions. No "quick fixes." No "I'll just do this one thing."
The sequence is ALWAYS: `/planning` → user reviews plan → user approves → `codex /execute`.
Jumping straight to code is a VIOLATION even if the task seems simple.

**MODEL TIERS — Use the right Claude model for the task:**
- **Opus** (`claude-opus-4-6`) → thinking & planning: `/mvp`, `/prd`, `/planning`, `/council`
- **Sonnet** (`claude-sonnet-4-6`) → review & validation: `/code-review`, `/code-loop`, `/system-review`
- **Haiku** (`claude-haiku-4-5-20251001`) → retrieval & light tasks: `/prime`, RAG queries, `/commit`
- **Codex CLI** → execution: `codex /execute {task-brief-path}`

**YAGNI** — Only implement what's needed. No premature optimization.
**KISS** — Prefer simple, readable solutions over clever abstractions.
**DRY** — Extract common patterns; balance with YAGNI.
**Limit AI Assumptions** — Be explicit in plans and prompts. Less guessing = better output.
**Always Be Priming (ABP)** — Start every session with /prime. Context is everything.
```

### Section 02 — PIV Loop (full content)

```markdown
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
   - Apply the 4 pillars of Context Engineering

**Do NOT** take your PRD and use it as a structured plan. Break it into granular Layer 2 plans.

### Implementation
- Hand task brief to Codex: `codex /execute .agents/features/{feature}/task-{N}.md`
- The execution agent is a **swappable slot** — currently Codex CLI
- **MANDATORY**: Never execute implementation work without a `/planning` artifact in `.agents/features/`
- **MANDATORY**: The plan MUST be reviewed and approved by the user before handing to Codex.

### Validation
- AI: tests + linting. Human: code review + manual testing.
- 5-level pyramid: Syntax → Types → Unit → Integration → Human.
- Small issues → fix prompts. Major issues → revert to save point, tweak plan, retry.
```

### Section 03 — Context Engineering (full content)

```markdown
Structured plans must cover 4 pillars:
1. **Memory** — discovery conversation (short-term) + `memory.md` (long-term)
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
```

### Section 04 — Git Save Points (full content)

```markdown
**Before implementation**, commit the plan:
```
git add .agents/features/{feature}/plan.md && git commit -m "plan: {feature} structured plan"
```

**If implementation fails**: `git stash` → tweak plan → retry.

**NEVER include `Co-Authored-By` lines in commits.** Commits are authored solely by the user.
```

### Section 05 — Decision Framework (full content)

```markdown
**Proceed autonomously when:**
- Task is clear, following established patterns, or plan is explicit

**Ask the user when:**
- Requirements ambiguous, multiple approaches, breaking changes, or business logic decisions

Use `/planning` for structured plans in `.agents/features/`.
```

### Section 06 — Archon Workflow (full content)

```markdown
# Archon Integration

If Archon MCP is connected, use it for knowledge management, RAG search, and task tracking.

## RAG Workflow (Research Before Implementation)

### Searching Documentation

1. **Get sources** → `rag_get_available_sources()` - Returns list with id, title, url
2. **Find source ID** → Match to documentation
3. **Search** → `rag_search_knowledge_base(query="vector functions", source_id="src_abc123")`

**CRITICAL**: Keep queries SHORT (2-5 keywords only). Vector search works best with concise queries.

### General Research

```python
# Search knowledge base (2-5 keywords only!)
rag_search_knowledge_base(query="authentication JWT", match_count=5)

# Find code examples
rag_search_code_examples(query="React hooks", match_count=3)

# Read full page content
rag_read_full_page(page_id="...")  # or url="https://..."
```

## Task Tracking (Optional)

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

## RAG Query Optimization

Good queries (2-5 keywords):
- `rag_search_knowledge_base(query="vector search pgvector")`
- `rag_search_code_examples(query="React useState")`

Bad queries (too long):
- `rag_search_knowledge_base(query="how to implement vector search with pgvector in PostgreSQL...")`

## If Archon Not Connected

Proceed without it. Archon is an enhancement, not a requirement.
```

---

## PATTERNS TO FOLLOW

### Replace pattern — AGENTS.md section headers

**BEFORE (current — Codex cannot expand this):**
```markdown
## Core Methodology

@.claude/sections/01_core_principles.md
```

**AFTER (target — inline, works for all tools):**
```markdown
## Core Methodology

**ARCHITECTURE — Claude Plans, Codex Executes** — ...
[full section content]
```

The `@` line and its blank line above are removed. The section header stays. The full content
of the referenced file replaces the `@` line.

---

## STEP-BY-STEP TASKS

### Step 1: Read current AGENTS.md

Read the full file at `AGENTS.md` to confirm current state. Verify the 6 `@` include lines
are present at approximately lines 7, 11, 15, 19, 23, 27.

### Step 2: Replace all 6 @ includes with inline content

Replace the entire lines 1-28 of AGENTS.md (the header + 6 section stubs) with the following
complete replacement block:

**CURRENT (lines 1-28 of AGENTS.md):**
```
# Claude Code AI Coding System

This repository contains an AI-assisted development framework with structured workflows,
slash commands, and context engineering methodology.

## Core Methodology

@.claude/sections/01_core_principles.md

## PIV Loop (Plan → Implement → Validate)

@.claude/sections/02_piv_loop.md

## Context Engineering (4 Pillars)

@.claude/sections/03_context_engineering.md

## Git Save Points

@.claude/sections/04_git_save_points.md

## Decision Framework

@.claude/sections/05_decision_framework.md

## Archon Integration

@.claude/sections/06_archon_workflow.md
```

**REPLACE WITH:**
```
# Claude Code AI Coding System

This repository contains an AI-assisted development framework with structured workflows,
slash commands, and context engineering methodology.

## Core Methodology

**ARCHITECTURE — Claude Plans, Codex Executes** — Claude (this session) handles ONLY planning,
architecture, orchestration, review, commit, and PR. ALL implementation (file edits, code writing,
refactoring) is handed to Codex CLI via `codex /execute {task-brief-path}`. Claude does NOT use
Edit/Write tools on project source files directly — that is Codex's job. The execution agent is
a **swappable slot** — currently Codex CLI, but any CLI agent that can read a task brief and
execute instructions can fill this role.

**Violation examples** (all FORBIDDEN):
- Claude using Edit/Write tools on .ts, .py, .md config, or any project source file
- Claude writing code in a response and asking the user to apply it
- Proceeding to execution without a `/planning`-generated task brief in `.agents/features/`

**Valid implementation path**: Plan in `.agents/features/{feature}/` → hand to Codex:
`codex /execute .agents/features/{feature}/task-{N}.md` → Codex edits via its own tools →
Claude reviews via `/code-review`

**HARD RULE — /planning Before ALL Implementation** — EVERY feature, fix, or non-trivial change
MUST go through `/planning` first. The plan MUST be reviewed and approved by the user before ANY
implementation begins. No exceptions. No "quick fixes." No "I'll just do this one thing."
The sequence is ALWAYS: `/planning` → user reviews plan → user approves → `codex /execute`.

**MODEL TIERS — Use the right Claude model for the task:**
- **Opus** (`claude-opus-4-6`) → thinking & planning: `/mvp`, `/prd`, `/planning`, `/council`
- **Sonnet** (`claude-sonnet-4-6`) → review & validation: `/code-review`, `/code-loop`, `/system-review`
- **Haiku** (`claude-haiku-4-5-20251001`) → retrieval & light tasks: `/prime`, RAG queries, `/commit`
- **Codex CLI** → execution: `codex /execute {task-brief-path}`

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
   - Apply the 4 pillars of Context Engineering

**Do NOT** take your PRD and use it as a structured plan. Break it into granular Layer 2 plans.

### Implementation
- Hand task brief to Codex: `codex /execute .agents/features/{feature}/task-{N}.md`
- The execution agent is a **swappable slot** — currently Codex CLI
- **MANDATORY**: Never execute implementation work without a `/planning` artifact in `.agents/features/`
- **MANDATORY**: The plan MUST be reviewed and approved by the user before handing to Codex.

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

```python
manage_project("create", title="feature-name", description="...")
manage_task("create", project_id="proj-123", title="Task name", description="...", task_order=10)
manage_task("update", task_id="task-123", status="doing")
manage_task("update", task_id="task-123", status="done")
```

**Task Status Flow**: `todo` → `doing` → `review` → `done`

### RAG Query Optimization

Good queries (2-5 keywords):
- `rag_search_knowledge_base(query="vector search pgvector")`

Bad queries (too long):
- `rag_search_knowledge_base(query="how to implement vector search with pgvector in PostgreSQL...")`

### If Archon Not Connected

Proceed without it. Archon is an enhancement, not a requirement. Use local codebase
exploration (Glob, Grep, Read) and WebFetch for documentation.
```

### Step 3: Add .codex reference section

After the Archon Integration section, and BEFORE the `---` horizontal rule that separates
the methodology from the Project Structure section, add:

```markdown
## Codex CLI Integration (`.codex/`)

Codex CLI skills for native execution in this system:
- `.codex/skills/execute/SKILL.md` — Execute a task brief (invoke: "execute the task brief at...")
- `.codex/skills/prime/SKILL.md` — Load project context (invoke: "prime me" or "load context")
- `.codex/skills/commit/SKILL.md` — Create a conventional commit (invoke: "commit my changes")
```

### Step 4: Verify no @ includes remain

After writing the file, scan it:
```bash
grep -n "@\.claude" AGENTS.md
```
Expected output: empty (zero matches). If any `@.claude` remain, fix them before continuing.

### Step 5: Verify inline sections present

```bash
grep -c "ARCHITECTURE" AGENTS.md   # should be >= 1
grep -c "PIV Loop" AGENTS.md       # should be >= 1
grep -c "Archon Integration" AGENTS.md  # should be >= 1
grep -c "4 pillars" AGENTS.md      # should be >= 1
```

---

## TESTING STRATEGY

**Unit**: N/A — markdown file, no logic to unit test

**Integration**: Verify Codex reads the file and understands instructions:
- After implementation, open a Codex session and ask "what is the execution model here?"
- Codex should describe: Claude plans, Codex executes, one task brief per session

**Edge cases**:
- Confirm the git code block in section 04 renders correctly (triple backtick inside markdown)
- Confirm the Python code block in section 06 renders correctly

---

## VALIDATION COMMANDS

- **L1**: `grep -n "@\.claude" AGENTS.md` → zero output (no @ includes remain)
- **L2**: `grep -c "ARCHITECTURE" AGENTS.md` → >= 1
- **L3**: `grep -c "rag_search_knowledge_base" AGENTS.md` → >= 1 (Archon section inlined)
- **L4**: `grep -c "Codex CLI Integration" AGENTS.md` → >= 1 (new section added)
- **L5 Manual**: Read AGENTS.md top-to-bottom — confirm it reads as a coherent document
  with no broken references or missing sections

---

## ACCEPTANCE CRITERIA

### Implementation
- [ ] `AGENTS.md` contains no `@.claude/sections/` lines
- [ ] All 6 section contents appear inline in AGENTS.md
- [ ] Section headers (`## Core Methodology`, `## PIV Loop`, etc.) are preserved
- [ ] New `## Codex CLI Integration (.codex/)` section added
- [ ] AGENTS.md line count is approximately 280-300 lines
- [ ] No content from the original Project Structure / Pipeline / Model Assignment sections removed

### Runtime
- [ ] Codex CLI reads AGENTS.md in one pass and understands the full system
- [ ] No broken `@` references that would confuse Codex

---

## HANDOFF NOTES

**For Task 2**: AGENTS.md now contains an inline reference to `.codex/skills/execute/SKILL.md`.
That file must be created in Task 2. The skills folder `.codex/skills/` does not exist yet —
create it as part of Task 2.

---

## COMPLETION CHECKLIST

- [ ] Read current AGENTS.md (confirmed @ includes present)
- [ ] Replaced lines 1-28 with inlined content block
- [ ] Added `.codex/` reference section
- [ ] `grep -n "@\.claude" AGENTS.md` returns empty
- [ ] All 6 sections verified present with grep
- [ ] File saved at `AGENTS.md` (project root)
- [ ] Rename this file: `task-1.md` → `task-1.done.md`
- [ ] Update `.agents/context/next-command.md` with task 1/4 complete handoff
