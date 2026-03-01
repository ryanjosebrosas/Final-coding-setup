# Custom Subagents

Subagents for parallel research, code review, and specialist tasks.

## Research Agents

| Agent | Purpose |
|-------|---------|
| `research-codebase` | Parallel codebase exploration: finds files, extracts patterns, reports findings |
| `research-external` | Documentation search, best practices, version compatibility checks |

## Code Review Agent

| Agent | What It Covers |
|-------|---------------|
| `code-review` | Comprehensive review: type safety, security, architecture, performance, code quality |

The code review agent covers all dimensions in a single pass. When dispatch is available, multiple instances can run in parallel with different focus areas.

## Usage

Agents are invoked via the Task tool by the main agent, or can be @mentioned directly:
```
@research-codebase find all authentication-related code
@research-external what are the best practices for JWT token refresh?
@code-review review the changes in src/auth/
```

## Creating New Agents

Create new markdown files in `.opencode/agents/` following the existing format:
- Purpose statement
- Capabilities list
- Instructions for invocation
- Output format
- Rules/constraints
