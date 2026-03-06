# Task 9: Wisdom Storage Tests

## Objective

Create integration tests for wisdom persistence: file I/O, directory structure, and wisdom file operations.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/wisdom/storage.test.ts`

## Prior Task Context

Task 8 tested extraction. This task tests storage (second stage of wisdom flow).

## Context References

```typescript
// File: .opencode/features/wisdom/storage.ts

export async function loadWisdom(feature: string): Promise<WisdomFile>
export async function saveWisdom(wisdom: WisdomFile): Promise<void>
export async function addWisdomItem(feature: string, item: WisdomItem): Promise<void>
export async function searchWisdom(wisdom: WisdomFile, query: WisdomQuery): Promise<WisdomItem[]>
export async function ensureWisdomDir(feature: string): Promise<string>

// Storage location: .agents/wisdom/{feature}/
// Files: learnings.md, decisions.md, issues.md, verification.md
```

## Step-by-Step Implementation

```typescript
// File: .opencode/tests/integration/wisdom/storage.test.ts

import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { loadWisdom, saveWisdom, addWisdomItem, searchWisdom, ensureWisdomDir } from "../../../features/wisdom"
import { mkdir, rm } from "fs/promises"
import { join } from "path"

describe("Wisdom Storage", () => {
  const testFeature = "test-feature"
  const testDir = join(process.cwd(), ".agents", "wisdom", testFeature)

  beforeEach(async () => {
    await ensureWisdomDir(testFeature)
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  describe("ensureWisdomDir", () => {
    it("should create wisdom directory", async () => {
      const dir = await ensureWisdomDir(testFeature)
      expect(dir).toBe(testDir)
    })

    it("should not fail if directory exists", async () => {
      await ensureWisdomDir(testFeature)
      await ensureWisdomDir(testFeature) // Should not throw
    })
  })

  describe("loadWisdom", () => {
    it("should return empty wisdom for new feature", async () => {
      const wisdom = await loadWisdom("new-feature")
      expect(wisdom.feature).toBe("new-feature")
      expect(wisdom.conventions.length).toBe(0)
      expect(wisdom.successes.length).toBe(0)
    })

    it("should load existing wisdom", async () => {
      await addWisdomItem(testFeature, { category: "Gotcha", pattern: "Test" })
      const wisdom = await loadWisdom(testFeature)
      expect(wisdom.gotchas.length).toBeGreaterThan(0)
    })
  })

  describe("addWisdomItem", () => {
    it("should add wisdom item to appropriate category", async () => {
      await addWisdomItem(testFeature, {
        category: "Convention",
        pattern: "Use async/await",
        problem: "Promise chains are hard to read",
        solution: "Use async/await syntax",
        severity: "minor",
        timestamp: new Date().toISOString(),
        confidence: 80
      })

      const wisdom = await loadWisdom(testFeature)
      expect(wisdom.conventions.length).toBe(1)
    })
  })

  describe("searchWisdom", () => {
    it("should search by pattern", async () => {
      await addWisdomItem(testFeature, { category: "Gotcha", pattern: "SQL injection", /* ... */ })
      
      const results = await searchWisdom(await loadWisdom(testFeature), { pattern: "SQL" })
      expect(results.length).toBeGreaterThan(0)
    })

    it("should filter by category", async () => {
      const results = await searchWisdom(await loadWisdom(testFeature), { category: "Gotcha" })
      for (const item of results) {
        expect(item.category).toBe("Gotcha")
      }
    })

    it("should filter by minConfidence", async () => {
      const results = await searchWisdom(await loadWisdom(testFeature), { minConfidence: 70 })
      for (const item of results) {
        expect(item.confidence).toBeGreaterThanOrEqual(70)
      }
    })
  })

  describe("File I/O", () => {
    it("should persist across sessions", async () => {
      await addWisdomItem(testFeature, { category: "Gotcha", pattern: "Test persistence" })
      
      // Simulate session restart
      const wisdom = await loadWisdom(testFeature)
      expect(wisdom.gotchas.some(g => g.pattern === "Test persistence")).toBe(true)
    })
  })
})
```

**VALIDATE**: `bun test tests/integration/wisdom/storage.test.ts`

## Acceptance Criteria

- [ ] Directory creation tested
- [ ] Load/save tested
- [ ] Add item tested
- [ ] Search functionality tested
- [ ] Persistence tested

## Handoff Notes

Proceed to **Task 10: Wisdom Injector Tests**.