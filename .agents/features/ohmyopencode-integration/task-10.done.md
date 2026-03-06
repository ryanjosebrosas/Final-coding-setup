# Task 10: Wisdom Injector Tests

## Objective

Create integration tests for wisdom injection into prompts: filtering by relevance, formatting, and context matching.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/wisdom/injector.test.ts`

## Prior Task Context

Tasks 8-9 tested extraction and storage. This task tests injection (final stage of wisdom flow).

## Context References

```typescript
// File: .opencode/features/wisdom/injector.ts

export interface InjectionContext {
  feature: string
  files: string[]
  taskType?: string
  keywords: string[]
  patterns: string[]
}

export interface InjectedWisdom {
  formatted: string
  items: WisdomItem[]
  skipped: number
}

export function inject(context: InjectionContext): InjectedWisdom
export function buildInjectionBlock(items: WisdomItem[]): string
```

## Step-by-Step Implementation

```typescript
// File: .opencode/tests/integration/wisdom/injector.test.ts

import { describe, it, expect, beforeEach } from "bun:test"
import { inject, buildInjectionBlock } from "../../../features/wisdom"
import { addWisdomItem, loadWisdom, clearWisdom } from "../../../features/wisdom"

describe("Wisdom Injector", () => {
  const testFeature = "test-injector"

  beforeEach(async () => {
    clearWisdom(testFeature)
  })

  describe("inject", () => {
    it("should filter by relevance score", async () => {
      // Add wisdom items
      await addWisdomItem(testFeature, {
        category: "Gotcha",
        pattern: "SQL injection in user input",
        location: "src/api/routes.ts",
        confidence: 95
      })

      const result = inject({
        feature: testFeature,
        files: ["src/api/routes.ts"],
        keywords: ["SQL"],
        patterns: []
      })

      expect(result.items.length).toBeGreaterThan(0)
      for (const item of result.items) {
        expect(item.confidence).toBeGreaterThanOrEqual(40)
      }
    })

    it("should filter by recency (last 90 days)", async () => {
      // Add old wisdom
      await addWisdomItem(testFeature, {
        category: "Convention",
        pattern: "Old pattern",
        timestamp: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
        confidence: 80
      })

      const result = inject({
        feature: testFeature,
        files: [],
        keywords: [],
        patterns: []
      })

      // Old pattern should be filtered out
      expect(result.items.some(i => i.pattern === "Old pattern")).toBe(false)
    })

    it("should limit to top 10 items", async () => {
      // Add 20 items
      for (let i = 0; i < 20; i++) {
        await addWisdomItem(testFeature, {
          category: "Gotcha",
          pattern: `Item ${i}`,
          confidence: 50
        })
      }

      const result = inject({
        feature: testFeature,
        files: [],
        keywords: [],
        patterns: []
      })

      expect(result.items.length).toBeLessThanOrEqual(10)
    })

    it("should match location to files", async () => {
      await addWisdomItem(testFeature, {
        category: "Gotcha",
        pattern: "API gotcha",
        location: "src/api/auth.ts",
        confidence: 80
      })

      const result = inject({
        feature: testFeature,
        files: ["src/api/auth.ts"],
        keywords: [],
        patterns: []
      })

      expect(result.items.some(i => i.pattern === "API gotcha")).toBe(true)
    })

    it("should match keywords", async () => {
      await addWisdomItem(testFeature, {
        category: "Success",
        pattern: "Connection pool optimization",
        confidence: 85
      })

      const result = inject({
        feature: testFeature,
        files: [],
        keywords: ["connection", "pool"],
        patterns: []
      })

      expect(result.items.some(i => i.pattern === "Connection pool optimization")).toBe(true)
    })

    it("should return empty for feature with no wisdom", () => {
      const result = inject({
        feature: "empty-feature",
        files: [],
        keywords: [],
        patterns: []
      })

      expect(result.items.length).toBe(0)
      expect(result.formatted).toBe("")
    })
  })

  describe("buildInjectionBlock", () => {
    it("should format wisdom as markdown block", () => {
      const items = [
        { category: "Gotcha", pattern: "Test gotcha", solution: "Avoid X" },
        { category: "Success", pattern: "Test success", solution: "Use Y" }
      ]

      const block = buildInjectionBlock(items)

      expect(block).toContain("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      expect(block).toContain("WISDOM FROM PREVIOUS SESSIONS")
      expect(block).toContain("⚠️ GOTCHAS TO AVOID")
      expect(block).toContain("✅ SUCCESSFUL PATTERNS")
    })

    it("should include all categories", () => {
      const items = [
        { category: "Convention", pattern: "Follow naming" },
        { category: "Success", pattern: "Use connection pool" },
        { category: "Failure", pattern: "Don't use sync I/O" },
        { category: "Gotcha", pattern: "Watch for null" }
      ]

      const block = buildInjectionBlock(items)

      expect(block).toContain("📋 CONVENTIONS TO FOLLOW")
      expect(block).toContain("✅ SUCCESSFUL PATTERNS")
      expect(block).toContain("❌ FAILURES AVOIDED")
      expect(block).toContain("⚠️ GOTCHAS TO AVOID")
    })

    it("should return empty string for empty items", () => {
      const block = buildInjectionBlock([])
      expect(block).toBe("")
    })
  })

  describe("Integration: Full Flow", () => {
    it("should capture → categorize → store → inject", async () => {
      // 1. Add wisdom (simulating capture from review)
      await addWisdomItem(testFeature, {
        category: "Gotcha",
        pattern: "JWT in localStorage",
        problem: "XSS vulnerability",
        solution: "Use httpOnly cookies",
        severity: "critical",
        confidence: 95
      })

      // 2. Load wisdom
      const wisdom = await loadWisdom(testFeature)
      expect(wisdom.gotchas.length).toBeGreaterThan(0)

      // 3. Inject into next task
      const injection = inject({
        feature: testFeature,
        files: ["src/auth/login.ts"],
        keywords: ["JWT", "token", "security"],
        patterns: ["auth"]
      })

      expect(injection.items.length).toBeGreaterThan(0)
      expect(injection.formatted).toContain("JWT")
      expect(injection.formatted).toContain("httpOnly")
    })
  })
})
```

**VALIDATE**: `bun test tests/integration/wisdom/injector.test.ts`

## Acceptance Criteria

- [ ] Relevance filtering tested
- [ ] Recency filtering tested
- [ ] Top-N limiting tested
- [ ] Location matching tested
- [ ] Keyword matching tested
- [ ] Block formatting tested
- [ ] Full flow tested

## Handoff Notes

Proceed to **Task 11: Update AGENTS.md**.