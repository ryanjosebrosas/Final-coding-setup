# Agent System

TypeScript-based agent registry with specialized subagents for research, review, and implementation tasks.

## Architecture

All agents are defined in `registry.ts` with:
- Model assignments and fallback chains
- Permission levels (full, read-only, vision-only)
- Temperature settings
- Archon RAG integration flags

## Research Agents

| Agent | Purpose | Invocation |
|-------|---------|------------|
| `explore` | Internal codebase grep: finds files, extracts patterns, discovers implementations | `task(subagent_type="explore", ...)` |
| `librarian` | External docs + Archon RAG: documentation search, best practices, OSS examples | `task(subagent_type="librarian", ...)` |

Both agents have `archonEnabled: true` for RAG integration when Archon MCP is connected.

## Consultation Agents

| Agent | Purpose | Invocation |
|-------|---------|------------|
| `prometheus` | Strategic planning with interview mode — runs the full `/planning` 7-phase process, writes `plan.md` + `task-N.md` | `task(subagent_type="prometheus", load_skills=["planning-methodology"], ...)` |
| `oracle` | Architecture decisions, debugging help, multi-system tradeoffs | `task(subagent_type="oracle", ...)` |
| `metis` | Pre-planning gap analysis, hidden assumption detection | `task(subagent_type="metis", ...)` |
| `momus` | Plan completeness review, verification before execution | `task(subagent_type="momus", ...)` |

> **Planning Flow**: Use `prometheus` for full strategic planning with interview mode. `prometheus` delegates to `metis` (gap analysis) and optionally `momus` (plan quality review) as part of its process.

## Execution Agents

| Agent | Purpose | Invocation |
|-------|---------|------------|
| `hephaestus` | Deep autonomous work on hard, logic-heavy tasks | `task(subagent_type="hephaestus", ...)` |
| `sisyphus-junior` | Category-dispatched executor with constraints | `task(category="...", ...)` |
| `atlas` | Todo management and wisdom accumulation | `task(subagent_type="atlas", ...)` |

## Usage

Agents are invoked via `task()` with either `subagent_type` or `category`:

```typescript
// Direct agent invocation
task(
  subagent_type="explore",
  run_in_background=true,
  load_skills=[],
  description="Find auth patterns",
  prompt="Find authentication implementations in src/..."
)

// Category dispatch with skills
task(
  category="deep",
  load_skills=["code-review"],
  description="Review auth changes",
  prompt="Review changes in src/auth/..."
)
```

## Agent Skills

Each agent has an optional `SKILL.md` in its subdirectory (e.g., `explore/SKILL.md`) that provides additional context when the agent is invoked.

## Files

- `registry.ts` — Agent definitions, permissions, fallback chains
- `types.ts` — TypeScript type definitions
- `permissions.ts` — Permission level constants
- `resolve-agent.ts` — Agent resolution logic
- `{agent-name}/SKILL.md` — Agent-specific skills and context
