---
description: Prime agent with project context and auto-detect tech stack
---

# Prime: Load Project Context + Stack Detection

Quick context load with automatic tech stack detection. No agents, no bloat. Direct commands and file reads.

## Step 0: Dirty State Check

Before loading context, check for uncommitted changes:

```bash
git status --short
```

**If dirty (files shown):**
```
WARNING: Uncommitted changes detected

{list files from git status --short}

Review these changes before proceeding. Run /commit to save progress, or /prime again to continue.
```

**If clean:** Proceed to Step 1.

---

## Step 1: Detect Context Mode

Check for code directories using Glob:

```
{src,app,frontend,backend,lib,api,server,client,cmd,pkg,internal}/**
```

**If ANY files found** → **Codebase Mode** (go to Step 2B)
**If no files found** → **System Mode** (go to Step 2A)

---

## Step 2A: System Mode — Load Context

Run these commands directly:

```bash
git log -10 --oneline
git status
```

Read these files if they exist:
- `memory.md`
- `.opencode/config.md`

---

## Step 2B: Codebase Mode — Load Context

Run these commands directly:

```bash
git log -10 --oneline
git status
git ls-files
```

Read these files if they exist:
- `memory.md`
- `.opencode/config.md`
- Entry point file (auto-detect)

### Auto-Detect Tech Stack

Detect the project's language, framework, and tooling by checking for these files:

#### Package Manifests (detect language + dependencies)

| File | Language | Framework Detection |
|------|----------|-------------------|
| `package.json` | JavaScript/TypeScript | Check deps for react, next, express, fastify, etc. |
| `pyproject.toml` | Python | Check deps for fastapi, django, flask, etc. |
| `Cargo.toml` | Rust | Check deps for actix, axum, rocket, etc. |
| `go.mod` | Go | Check imports for gin, echo, fiber, etc. |
| `Gemfile` | Ruby | Check deps for rails, sinatra, etc. |
| `pom.xml` / `build.gradle` | Java/Kotlin | Check deps for spring, quarkus, etc. |
| `composer.json` | PHP | Check deps for laravel, symfony, etc. |
| `*.csproj` / `*.sln` | C#/.NET | Check for ASP.NET, Blazor, etc. |
| `mix.exs` | Elixir | Check deps for phoenix, etc. |
| `pubspec.yaml` | Dart/Flutter | Check deps for flutter, etc. |

#### Linter Config (detect L1 validation command)

| File | Linter | Command |
|------|--------|---------|
| `.eslintrc*` / `eslint.config.*` | ESLint | `npx eslint .` |
| `ruff.toml` / `[tool.ruff]` in pyproject.toml | Ruff | `ruff check .` |
| `.rubocop.yml` | RuboCop | `rubocop` |
| `.golangci.yml` | golangci-lint | `golangci-lint run` |
| `rustfmt.toml` / `.rustfmt.toml` | rustfmt | `cargo fmt --check` |
| `biome.json` | Biome | `npx biome check .` |
| `.prettierrc*` | Prettier | `npx prettier --check .` |

#### Type Checker Config (detect L2 validation command)

| File / Signal | Type Checker | Command |
|--------------|-------------|---------|
| `tsconfig.json` | TypeScript | `npx tsc --noEmit` |
| `[tool.mypy]` or `mypy.ini` | mypy | `mypy src/` |
| `sorbet/` directory | Sorbet | `srb tc` |
| Rust (any) | rustc | `cargo check` |
| Go (any) | go vet | `go vet ./...` |

#### Test Runner Config (detect L3/L4 validation commands)

| File / Signal | Test Runner | Command |
|--------------|------------|---------|
| `jest.config.*` or jest in package.json | Jest | `npx jest` |
| `vitest.config.*` or vitest in package.json | Vitest | `npx vitest run` |
| `pytest.ini` / `[tool.pytest]` / `conftest.py` | pytest | `pytest` |
| `_test.go` files | go test | `go test ./...` |
| `*_test.rs` / `#[test]` | cargo test | `cargo test` |
| `*_spec.rb` / `.rspec` | RSpec | `rspec` |
| `*_test.rb` / `test/` | Minitest | `ruby -Itest test/**/*_test.rb` |

#### Entry Point Detection

Check in order:
1. `src/index.ts` / `src/index.js` / `src/main.ts` / `src/main.js`
2. `src/app.ts` / `src/app.js` / `app/page.tsx` (Next.js)
3. `src/main.py` / `app/main.py` / `main.py`
4. `src/main.rs` / `cmd/main.go` / `main.go`
5. `src/index.rb` / `config.ru` (Ruby)

Read the first entry point found for project overview.

---

## Step 3: Write/Update Config

If `.opencode/config.md` does not exist, create it from auto-detected values:

```markdown
# Project Configuration
<!-- Auto-detected by /prime on {date}. Override any value manually. -->

## Stack
- **Language**: {detected}
- **Framework**: {detected}
- **Package Manager**: {npm/yarn/pnpm/pip/cargo/go/bundle/etc.}

## Validation Commands
- **L1 Lint**: {detected lint command}
- **L1 Format**: {detected format check command}
- **L2 Types**: {detected type check command}
- **L3 Unit Tests**: {detected test command}
- **L4 Integration Tests**: {detected test command with integration marker}
- **L5 Manual**: {describe or "N/A"}

## Source Directories
- **Source**: {src/ | app/ | lib/ | etc.}
- **Tests**: {tests/ | test/ | __tests__/ | *_test.go | etc.}
- **Config**: {config/ | etc.}

## Git
- **Remote**: {auto-detected from git remote -v}
- **Main Branch**: {main | master | auto-detected}
- **PR Target**: {same as main branch}
```

If `.opencode/config.md` already exists, read it and use its values (user overrides take priority over auto-detection).

---

## Step 4: Assemble Report

**System Mode** — Present:

```
## Current State
- **Branch**: {current branch name}
- **Status**: {clean/dirty, summary of changes if any}
- **Recent Work**: {list each of the last 10 commits as "- `hash` message"}

## Memory Context
{If memory.md exists:
- **Last Session**: {most recent date from Session Notes}
- **Key Decisions**: {bullet list from Key Decisions section}
- **Active Patterns**: {from Architecture Patterns section}
- **Gotchas**: {from Gotchas section}
- **Memory Health**: {if last session date is >7 days ago, warn "Stale — last updated {date}". Otherwise "Fresh"}
Otherwise: "No memory.md found"}
```

---

**Codebase Mode** — Present:

```
## Current State
- **Branch**: {current branch name}
- **Status**: {clean/dirty, summary of changes if any}
- **Recent Work**: {list each of the last 10 commits as "- `hash` message"}

## Tech Stack (Auto-Detected)
- **Language**: {language and version}
- **Framework**: {framework and version}
- **Key Dependencies**: {top 5 with versions}
- **Linter**: {tool} → `{command}`
- **Type Checker**: {tool} → `{command}`
- **Test Runner**: {tool} → `{command}`

## Project Overview
{If README.md exists:
- **Purpose**: {what this project does — 1 sentence}
- **Key Capabilities**: {main features — comma-separated list}
Otherwise: "No README.md found"}

## Memory Context
{If memory.md exists:
- **Last Session**: {most recent date from Session Notes}
- **Key Decisions**: {bullet list from Key Decisions section}
- **Active Patterns**: {from Architecture Patterns section}
- **Gotchas**: {from Gotchas section}
- **Memory Health**: {if last session date is >7 days ago, warn "Stale — last updated {date}". Otherwise "Fresh"}
Otherwise: "No memory.md found"}

## Build State
{If .agents/specs/build-state.json exists:
- **Last Spec**: {lastSpec}
- **Completed**: {count}/{total} ({pct}%)
- **Current Pillar**: {currentPillar}
- **Patterns**: {patternsEstablished}
Otherwise: "No build state found. Run /mvp to start a new project."}

## Archon Status
{If Archon MCP connected:
- **Connection**: Connected
- **Project**: {project name if found}
- **Active Tasks**: {count of tasks in 'doing' status}
Otherwise: "Archon not connected"}
```
