# Project Configuration
<!-- Auto-detected by /prime. Override any value manually. -->
<!-- Run /prime to re-detect and update auto-detected values. -->
<!-- Manual overrides in this file take priority over auto-detection. -->

## Stack
- **Language**: {auto-detected or specify: e.g., TypeScript, Python, Rust, Go}
- **Framework**: {auto-detected or specify: e.g., Next.js, FastAPI, Axum}
- **Package Manager**: {auto-detected or specify: npm, yarn, pnpm, pip, cargo, go}

## Validation Commands

These commands are used by `/build`, `/ship`, `/sync`, `/final-review`, and other pipeline commands.

- **L1 Lint**: {e.g., `npx eslint .` or `ruff check .` or `cargo clippy`}
- **L1 Format**: {e.g., `npx prettier --check .` or `ruff format --check .` or `cargo fmt --check`}
- **L2 Types**: {e.g., `npx tsc --noEmit` or `mypy src/` or `cargo check`}
- **L3 Unit Tests**: {e.g., `npx jest` or `pytest` or `cargo test` or `go test ./...`}
- **L4 Integration Tests**: {e.g., `npx jest --testPathPattern=integration` or `pytest -m integration`}
- **L5 Manual**: {describe manual verification steps, or "N/A"}

## Source Directories
- **Source**: {e.g., src/ | app/ | lib/}
- **Tests**: {e.g., tests/ | test/ | __tests__/ | src/**/*.test.ts}
- **Config**: {e.g., config/ | .env}

## Git
- **Remote**: {auto-detected from `git remote -v`, usually "origin"}
- **Main Branch**: {auto-detected, usually "main" or "master"}
- **PR Target**: {same as main branch, or specify}

## Model Tiers (Optional — for dispatch configuration)

Map your available models to tiers. Leave blank to use the primary session model for everything.

- **T1 (Fast/Free)**: {e.g., deepseek-v3, qwen3, gemini-flash, local model}
- **T2 (Standard)**: {e.g., claude-sonnet, gpt-4o, gemini-pro}
- **T3 (Strong Reasoning)**: {e.g., claude-opus, gpt-4, gemini-ultra}
- **T4 (Premium)**: {e.g., claude-opus, gpt-codex, o1}
- **T5 (Top-Tier)**: {e.g., best available model}

## RAG Integration (Optional)

If you have a RAG knowledge base MCP configured:

- **RAG Available**: {yes/no}
- **RAG Tool Prefix**: {e.g., archon_rag_, rag_, knowledge_}
- **Indexed Sources**: {list what's indexed: e.g., "Supabase docs, FastAPI docs, project wiki"}

## Notes

- `/prime` auto-detects values and fills in blanks — it never overwrites manual entries
- Validation commands should work from the project root directory
- If a validation level doesn't apply (e.g., no type checker), set it to "N/A"
- Model tier mapping is only needed if you use dispatch — the system works without it
