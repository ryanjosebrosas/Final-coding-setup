# Task 8: Wisdom Extractor Tests

## Objective

Create integration tests for wisdom extraction from code reviews, test failures, success patterns, and reports.

## Scope

**Files touched**:
- CREATE: `.opencode/tests/integration/wisdom/extractor.test.ts`

## Prior Task Context

Tasks 1-7 tested routing, skills, agents, and hooks. This task tests the wisdom extraction (first stage of wisdom flow).

## Context References

```typescript
// File: .opencode/features/wisdom/extractor.ts

export function extractFromReviewFinding(finding: ReviewFinding): WisdomItem | null {
  // Extract: pattern, problem, solution, location, severity
}

export function extractFromTestFailure(failure: TestFailure): WisdomItem | null {
  // Extract: pattern, problem, solution from test failure
}

export function extractFromSuccess(approach: SuccessfulApproach): WisdomItem | null {
  // Extract: what worked, why it worked
}

export function extractFromReport(report: SystemReport): WisdomItem[] {
  // Extract multiple items from system review
}
```

## Step-by-Step Implementation

```typescript
// File: .opencode/tests/integration/wisdom/extractor.test.ts

import { describe, it, expect } from "bun:test"
import { extractFromReviewFinding, extractFromTestFailure, extractFromSuccess, extractFromReport } from "../../../features/wisdom"

describe("Wisdom Extractor", () => {
  describe("extractFromReviewFinding", () => {
    it("should extract wisdom from critical finding", () => {
      const finding = {
        severity: "critical",
        message: "SQL injection vulnerability in user input",
        location: "src/api/routes.ts:45",
        suggestion: "Use parameterized queries"
      }
      
      const wisdom = extractFromReviewFinding(finding)
      expect(wisdom).not.toBeNull()
      expect(wisdom!.category).toBe("Gotcha")
      expect(wisdom!.pattern).toContain("SQL injection")
      expect(wisdom!.severity).toBe("critical")
    })

    it("should return null for informational findings", () => {
      const finding = { severity: "info", message: "Consider refactoring" }
      expect(extractFromReviewFinding(finding)).toBeNull()
    })
  })

  describe("extractFromTestFailure", () => {
    it("should extract pattern from assertion failure", () => {
      const failure = {
        testName: "should validate email",
        error: "Expected true, received false",
        file: "tests/validation.test.ts"
      }
      
      const wisdom = extractFromTestFailure(failure)
      expect(wisdom).not.toBeNull()
      expect(wisdom!.category).toBe("Failure")
    })
  })

  describe("extractFromSuccess", () => {
    it("should extract pattern from successful approach", () => {
      const approach = {
        what: "Used connection pooling",
        why: "Reduced latency by 50%",
        location: "src/db/connection.ts"
      }
      
      const wisdom = extractFromSuccess(approach)
      expect(wisdom).not.toBeNull()
      expect(wisdom!.category).toBe("Success")
    })
  })

  describe("extractFromReport", () => {
    it("should extract multiple items from report", () => {
      const report = {
        findings: [/* multiple findings */]
      }
      
      const items = extractFromReport(report)
      expect(Array.isArray(items)).toBe(true)
    })
  })
})
```

**VALIDATE**: `bun test tests/integration/wisdom/extractor.test.ts`

## Acceptance Criteria

- [ ] Review finding extraction tested
- [ ] Test failure extraction tested
- [ ] Success extraction tested
- [ ] Report extraction tested

## Handoff Notes

Proceed to **Task 9: Wisdom Storage Tests**.