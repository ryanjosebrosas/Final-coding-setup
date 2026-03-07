// ============================================================================
// E2E PIPELINE LOOP TESTS
// ============================================================================
//
// Validates the full pipeline lifecycle as a user would experience it:
//   /planning → /execute (task 1) → /execute (task 2) → /code-loop → /commit → /pr
//
// These tests simulate the artifact + handoff lifecycle across all pipeline
// stages without mocking internal modules. Every assertion reflects real
// file-system state a user would observe.
//

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, renameSync } from "node:fs"
import { join } from "node:path"
import {
  readHandoff,
  writeHandoff,
  createHandoff,
  updateHandoff,
  hasPendingWork,
} from "../../pipeline/handoff"
import {
  discoverArtifacts,
  getPendingArtifacts,
  getDoneArtifacts,
  markArtifactDone,
  getNextPendingTask,
} from "../../pipeline/artifacts"
import {
  canTransition,
  getValidNextStates,
  isTerminalState,
  getCommandTargetState,
} from "../../pipeline/state-machine"
import { suggestNextCommand } from "../../pipeline/commands"
import type { PipelineStatus } from "../../pipeline/types"

// ============================================================================
// TEST WORKSPACE SETUP
// ============================================================================

function createWorkspace(testDir: string, feature: string) {
  const featureDir = join(testDir, ".agents", "features", feature)
  const contextDir = join(testDir, ".agents", "context")
  mkdirSync(featureDir, { recursive: true })
  mkdirSync(contextDir, { recursive: true })
  return { featureDir, contextDir }
}

function writeTaskBrief(featureDir: string, n: number, done = false) {
  const name = done ? `task-${n}.done.md` : `task-${n}.md`
  writeFileSync(join(featureDir, name), `# Task ${n}\nObjective: test task ${n}`, "utf-8")
}

function writePlan(featureDir: string, done = false) {
  const name = done ? "plan.done.md" : "plan.md"
  writeFileSync(join(featureDir, name), "# Plan\n## TASK INDEX\n| 1 | task-1.md | scope | pending | - |", "utf-8")
}

function writeReport(featureDir: string, done = false) {
  const name = done ? "report.done.md" : "report.md"
  writeFileSync(join(featureDir, name), "# Execution Report\nChanges applied.", "utf-8")
}

function writeReview(featureDir: string, done = false) {
  const name = done ? "review.done.md" : "review.md"
  writeFileSync(join(featureDir, name), "# Code Review\n✅ CLEAN", "utf-8")
}

// ============================================================================
// STAGE 1: /planning → awaiting-execution
// ============================================================================

describe("E2E Stage 1: /planning", () => {
  const testDir = join(process.cwd(), ".test-e2e-planning")
  const feature = "my-feature"

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
    const { featureDir } = createWorkspace(testDir, feature)
    writePlan(featureDir)
    writeTaskBrief(featureDir, 1)
    writeTaskBrief(featureDir, 2)
  })

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it("should write handoff with awaiting-execution after /planning", () => {
    const handoff = createHandoff(feature, "/planning", `/execute .agents/features/${feature}/plan.md`)
    handoff.taskProgress = { completed: 0, total: 2 }
    writeHandoff(testDir, handoff)

    const read = readHandoff(testDir)
    expect(read?.status).toBe("awaiting-execution")
    expect(read?.feature).toBe(feature)
    expect(read?.taskProgress?.completed).toBe(0)
    expect(read?.taskProgress?.total).toBe(2)
  })

  it("should have 2 pending task briefs after /planning", () => {
    const artifacts = discoverArtifacts(testDir, feature)
    const pending = getPendingArtifacts(artifacts)
    const tasks = pending.filter(a => a.type === "task")
    expect(tasks).toHaveLength(2)
  })

  it("should suggest /execute as next command from awaiting-execution", () => {
    expect(suggestNextCommand("awaiting-execution")).toBe("/execute")
  })

  it("should allow transition from awaiting-execution to executing-tasks", () => {
    expect(canTransition("awaiting-execution", "executing-tasks")).toBe(true)
  })
})

// ============================================================================
// STAGE 2: /execute task 1 → executing-tasks
// ============================================================================

describe("E2E Stage 2: /execute task 1", () => {
  const testDir = join(process.cwd(), ".test-e2e-execute1")
  const feature = "my-feature"

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
    const { featureDir } = createWorkspace(testDir, feature)
    writePlan(featureDir)
    writeTaskBrief(featureDir, 1)
    writeTaskBrief(featureDir, 2)

    const handoff = createHandoff(feature, "/planning", `/execute .agents/features/${feature}/plan.md`)
    handoff.taskProgress = { completed: 0, total: 2 }
    writeHandoff(testDir, handoff)
  })

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it("should identify task-1 as next pending task", () => {
    const artifacts = discoverArtifacts(testDir, feature)
    const next = getNextPendingTask(artifacts)
    expect(next?.name).toBe("task-1")
  })

  it("should advance handoff to executing-tasks after marking task-1 done", () => {
    const artifacts = discoverArtifacts(testDir, feature)
    const task1 = artifacts.find(a => a.name === "task-1")!

    markArtifactDone(testDir, task1)

    const handoff = readHandoff(testDir)!
    const updated = updateHandoff(handoff, {
      status: "executing-tasks",
      taskProgress: { completed: 1, total: 2 },
    })
    writeHandoff(testDir, updated)

    const read = readHandoff(testDir)
    expect(read?.status).toBe("executing-tasks")
    expect(read?.taskProgress?.completed).toBe(1)
    expect(read?.taskProgress?.total).toBe(2)
  })

  it("should have task-2 as next pending after task-1 done", () => {
    const featureDir = join(testDir, ".agents", "features", feature)
    renameSync(join(featureDir, "task-1.md"), join(featureDir, "task-1.done.md"))

    const artifacts = discoverArtifacts(testDir, feature)
    const next = getNextPendingTask(artifacts)
    expect(next?.name).toBe("task-2")
  })
})

// ============================================================================
// STAGE 3: /execute task 2 → awaiting-review
// ============================================================================

describe("E2E Stage 3: /execute task 2 (final task)", () => {
  const testDir = join(process.cwd(), ".test-e2e-execute2")
  const feature = "my-feature"

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
    const { featureDir } = createWorkspace(testDir, feature)
    writePlan(featureDir)
    writeTaskBrief(featureDir, 1, true)
    writeTaskBrief(featureDir, 2)
    writeReport(featureDir)

    const handoff = createHandoff(feature, "/execute", `/execute .agents/features/${feature}/plan.md`)
    handoff.status = "executing-tasks"
    handoff.taskProgress = { completed: 1, total: 2 }
    writeHandoff(testDir, handoff)
  })

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it("should find task-2 as the only pending task", () => {
    const artifacts = discoverArtifacts(testDir, feature)
    const next = getNextPendingTask(artifacts)
    expect(next?.name).toBe("task-2")
  })

  it("should advance to awaiting-review after all tasks done", () => {
    const featureDir = join(testDir, ".agents", "features", feature)
    renameSync(join(featureDir, "task-2.md"), join(featureDir, "task-2.done.md"))
    renameSync(join(featureDir, "plan.md"), join(featureDir, "plan.done.md"))

    const handoff = readHandoff(testDir)!
    const updated = updateHandoff(handoff, {
      status: "awaiting-review",
      nextCommand: `/code-loop ${feature}`,
      taskProgress: { completed: 2, total: 2 },
    })
    writeHandoff(testDir, updated)

    const read = readHandoff(testDir)
    expect(read?.status).toBe("awaiting-review")
    expect(read?.taskProgress?.completed).toBe(2)
    expect(read?.taskProgress?.total).toBe(2)
  })

  it("should have no pending tasks after all marked done", () => {
    const featureDir = join(testDir, ".agents", "features", feature)
    renameSync(join(featureDir, "task-2.md"), join(featureDir, "task-2.done.md"))

    const artifacts = discoverArtifacts(testDir, feature)
    const next = getNextPendingTask(artifacts)
    expect(next).toBeUndefined()
  })

  it("should allow transition from executing-tasks to awaiting-review", () => {
    expect(canTransition("executing-tasks", "awaiting-review")).toBe(true)
  })

  it("should suggest /code-loop as next command from awaiting-review", () => {
    expect(suggestNextCommand("awaiting-review")).toBe("/code-loop")
  })
})

// ============================================================================
// STAGE 4: /code-loop → ready-to-commit (clean) or awaiting-fixes (issues found)
// ============================================================================

describe("E2E Stage 4: /code-loop", () => {
  const testDir = join(process.cwd(), ".test-e2e-codeloop")
  const feature = "my-feature"

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
    const { featureDir } = createWorkspace(testDir, feature)
    writePlan(featureDir, true)
    writeTaskBrief(featureDir, 1, true)
    writeTaskBrief(featureDir, 2, true)
    writeReport(featureDir)

    const handoff = createHandoff(feature, "/execute", `/code-loop ${feature}`)
    handoff.status = "awaiting-review"
    handoff.taskProgress = { completed: 2, total: 2 }
    writeHandoff(testDir, handoff)
  })

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it("clean review path: should advance to ready-to-commit", () => {
    const featureDir = join(testDir, ".agents", "features", feature)
    writeReview(featureDir, true)

    const handoff = readHandoff(testDir)!
    const updated = updateHandoff(handoff, {
      status: "ready-to-commit",
      nextCommand: "/commit",
    })
    writeHandoff(testDir, updated)

    const read = readHandoff(testDir)
    expect(read?.status).toBe("ready-to-commit")
    expect(read?.nextCommand).toBe("/commit")
  })

  it("issues found path: should advance to awaiting-fixes", () => {
    const featureDir = join(testDir, ".agents", "features", feature)
    writeReview(featureDir, false)

    const handoff = readHandoff(testDir)!
    const updated = updateHandoff(handoff, {
      status: "awaiting-fixes",
      nextCommand: `/code-loop ${feature}`,
    })
    writeHandoff(testDir, updated)

    const read = readHandoff(testDir)
    expect(read?.status).toBe("awaiting-fixes")
  })

  it("should allow transition from awaiting-review to ready-to-commit", () => {
    expect(canTransition("awaiting-review", "ready-to-commit")).toBe(true)
  })

  it("should allow transition from awaiting-review to awaiting-fixes", () => {
    expect(canTransition("awaiting-review", "awaiting-fixes")).toBe(true)
  })

  it("should allow re-review cycle: awaiting-fixes → awaiting-re-review → ready-to-commit", () => {
    expect(canTransition("awaiting-fixes", "awaiting-re-review")).toBe(true)
    expect(canTransition("awaiting-re-review", "ready-to-commit")).toBe(true)
  })

  it("should suggest /commit from ready-to-commit", () => {
    expect(suggestNextCommand("ready-to-commit")).toBe("/commit")
  })
})

// ============================================================================
// STAGE 5: /commit → ready-for-pr
// ============================================================================

describe("E2E Stage 5: /commit", () => {
  const testDir = join(process.cwd(), ".test-e2e-commit")
  const feature = "my-feature"

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
    const { featureDir } = createWorkspace(testDir, feature)
    writePlan(featureDir, true)
    writeReport(featureDir)
    writeReview(featureDir, true)

    const handoff = createHandoff(feature, "/code-loop", "/commit")
    handoff.status = "ready-to-commit"
    writeHandoff(testDir, handoff)
  })

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it("should advance to ready-for-pr after commit", () => {
    const { featureDir } = createWorkspace(testDir, feature)
    renameSync(join(featureDir, "report.md"), join(featureDir, "report.done.md"))
    renameSync(join(featureDir, "review.done.md"), join(featureDir, "review.done.md"))

    const handoff = readHandoff(testDir)!
    const updated = updateHandoff(handoff, {
      status: "ready-for-pr",
      nextCommand: `/pr ${feature}`,
      lastCommand: "/commit",
    })
    writeHandoff(testDir, updated)

    const read = readHandoff(testDir)
    expect(read?.status).toBe("ready-for-pr")
    expect(read?.nextCommand).toContain("/pr")
  })

  it("should allow transition from ready-to-commit to ready-for-pr", () => {
    expect(canTransition("ready-to-commit", "ready-for-pr")).toBe(true)
  })

  it("should suggest /pr from ready-for-pr", () => {
    expect(suggestNextCommand("ready-for-pr")).toBe("/pr")
  })

  it("report should still have pending state until commit marks it done", () => {
    const artifacts = discoverArtifacts(testDir, feature)
    const pending = getPendingArtifacts(artifacts)
    expect(pending.some(a => a.name === "report")).toBe(true)
  })
})

// ============================================================================
// STAGE 6: /pr → pr-open (terminal)
// ============================================================================

describe("E2E Stage 6: /pr → terminal", () => {
  const testDir = join(process.cwd(), ".test-e2e-pr")
  const feature = "my-feature"

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
    createWorkspace(testDir, feature)

    const handoff = createHandoff(feature, "/commit", `/pr ${feature}`)
    handoff.status = "ready-for-pr"
    writeHandoff(testDir, handoff)
  })

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it("should advance to pr-open after /pr", () => {
    const handoff = readHandoff(testDir)!
    const updated = updateHandoff(handoff, {
      status: "pr-open",
      lastCommand: "/pr",
      nextCommand: "",
    })
    writeHandoff(testDir, updated)

    const read = readHandoff(testDir)
    expect(read?.status).toBe("pr-open")
    expect(isTerminalState("pr-open")).toBe(true)
  })

  it("should have no pending work at pr-open", () => {
    const handoff = readHandoff(testDir)!
    const terminal = updateHandoff(handoff, { status: "pr-open" })
    expect(hasPendingWork(terminal)).toBe(false)
  })

  it("should suggest null next command from terminal state", () => {
    expect(suggestNextCommand("pr-open")).toBeNull()
  })

  it("should reject all further transitions from pr-open", () => {
    const validStates: PipelineStatus[] = [
      "awaiting-execution", "executing-tasks", "executing-series",
      "awaiting-review", "awaiting-fixes", "awaiting-re-review",
      "ready-to-commit", "ready-for-pr", "blocked",
    ]
    for (const state of validStates) {
      expect(canTransition("pr-open", state)).toBe(false)
    }
  })
})

// ============================================================================
// FULL LOOP: integrated state machine walk
// ============================================================================

describe("E2E Full Loop: state machine walk", () => {
  it("should trace the complete happy path without gaps", () => {
    const loop: PipelineStatus[] = [
      "awaiting-execution",
      "executing-tasks",
      "awaiting-review",
      "ready-to-commit",
      "ready-for-pr",
      "pr-open",
    ]

    for (let i = 0; i < loop.length - 1; i++) {
      const from = loop[i]
      const to = loop[i + 1]
      expect(canTransition(from, to), `${from} → ${to}`).toBe(true)
    }
  })

  it("should trace the re-review cycle without gaps", () => {
    const cycle: PipelineStatus[] = [
      "awaiting-review",
      "awaiting-fixes",
      "awaiting-re-review",
      "ready-to-commit",
    ]

    for (let i = 0; i < cycle.length - 1; i++) {
      const from = cycle[i]
      const to = cycle[i + 1]
      expect(canTransition(from, to), `${from} → ${to}`).toBe(true)
    }
  })

  it("should correctly map pipeline commands to target states", () => {
    expect(getCommandTargetState("/planning")).toBe("awaiting-execution")
    expect(getCommandTargetState("/execute")).toBe("executing-tasks")
    expect(getCommandTargetState("/code-loop")).toBe("ready-to-commit")
    expect(getCommandTargetState("/commit")).toBe("ready-for-pr")
  })

  it("should have consistent next-command suggestions through full loop", () => {
    expect(suggestNextCommand("awaiting-execution")).toBe("/execute")
    expect(suggestNextCommand("executing-tasks")).toBeNull()
    expect(suggestNextCommand("awaiting-review")).toBe("/code-loop")
    expect(suggestNextCommand("ready-to-commit")).toBe("/commit")
    expect(suggestNextCommand("ready-for-pr")).toBe("/pr")
    expect(suggestNextCommand("pr-open")).toBeNull()
  })
})

// ============================================================================
// SMOKE TEST: /prime reads handoff correctly
// ============================================================================

describe("Smoke: /prime handoff read", () => {
  const testDir = join(process.cwd(), ".test-e2e-prime-smoke")

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
    mkdirSync(join(testDir, ".agents", "context"), { recursive: true })
  })

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true })
  })

  it("should surface correct next command for each pipeline state", () => {
    const cases: Array<{ status: PipelineStatus; expectedSuggestion: string | null }> = [
      { status: "awaiting-execution", expectedSuggestion: "/execute" },
      { status: "awaiting-review", expectedSuggestion: "/code-loop" },
      { status: "ready-to-commit", expectedSuggestion: "/commit" },
      { status: "ready-for-pr", expectedSuggestion: "/pr" },
      { status: "pr-open", expectedSuggestion: null },
    ]

    for (const { status, expectedSuggestion } of cases) {
      const handoff = createHandoff("test-feature", "/test", "/test")
      handoff.status = status
      writeHandoff(testDir, handoff)

      const read = readHandoff(testDir)
      expect(read?.status).toBe(status)
      expect(hasPendingWork(read)).toBe(status !== "pr-open")
      expect(suggestNextCommand(status)).toBe(expectedSuggestion)
    }
  })

  it("should return null handoff when no handoff file exists", () => {
    const handoff = readHandoff(testDir)
    expect(handoff).toBeNull()
    expect(hasPendingWork(null)).toBe(false)
  })

  it("should preserve feature name through write/read cycle", () => {
    const handoff = createHandoff("auth-system", "/planning", "/execute")
    writeHandoff(testDir, handoff)

    const read = readHandoff(testDir)
    expect(read?.feature).toBe("auth-system")
  })

  it("should preserve task progress through write/read cycle", () => {
    const handoff = createHandoff("my-feature", "/execute", "/execute")
    handoff.status = "executing-tasks"
    handoff.taskProgress = { completed: 3, total: 5 }
    writeHandoff(testDir, handoff)

    const read = readHandoff(testDir)
    expect(read?.taskProgress?.completed).toBe(3)
    expect(read?.taskProgress?.total).toBe(5)
  })
})

// ============================================================================
// CATEGORIES CONFIG SMOKE TEST
// ============================================================================

describe("Smoke: categories config loads without warning", () => {
  it("should load categories without Invalid categories config warning", async () => {
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (...args: unknown[]) => { warnings.push(String(args[0])) }

    try {
      const { clearCategoriesCache, loadCategories } = await import("../../config/load-categories")
      clearCategoriesCache()
      const config = loadCategories()

      expect(config.categories).toBeDefined()
      expect(Object.keys(config.categories).length).toBeGreaterThan(0)

      const invalidWarnings = warnings.filter(w => w.includes("Invalid categories config"))
      expect(invalidWarnings).toHaveLength(0)
    } finally {
      console.warn = originalWarn
    }
  })
})
