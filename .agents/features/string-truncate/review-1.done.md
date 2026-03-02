# Code Review: string-truncate

> **Feature**: string-truncate
> **Reviewed**: 2026-03-02
> **Scope**: Changes to `src/strings.ts`, `src/strings.test.ts`

---

## Summary

Implementation of `truncate()` function with 5 unit tests. Code is clean and well-documented, but has edge case issues with small `maxLength` values.

---

## Findings

| Severity | File:Line | Issue |
|----------|-----------|-------|
| **Major** | src/strings.ts:28-33 | `maxLength < 3` produces output longer than `maxLength` |
| Minor | src/strings.ts:28 | No validation for `maxLength <= 0` |

---

## Detailed Analysis

### Major: maxLength < 3 produces invalid output

**Location**: `src/strings.ts:28-33`

**Problem**: When `maxLength` is less than 3, the calculation `maxLength - 3` becomes negative, and the result exceeds `maxLength`:

```typescript
truncate('hello', 2)  // Returns "h..." (4 chars) — exceeds maxLength 2
truncate('hello', 1)  // Returns "..." (3 chars) — exceeds maxLength 1
```

**Expected**: Result should never exceed `maxLength`. For `maxLength < 3`, either:
1. Return the string truncated to `maxLength` without ellipsis, or
2. Throw an error for invalid `maxLength`

**Recommendation**: Add guard clause:
```typescript
if (maxLength < 3) {
  return str.slice(0, maxLength);
}
```

### Minor: No validation for maxLength <= 0

**Location**: `src/strings.ts:28`

**Problem**: `maxLength <= 0` produces unexpected results:
- `truncate('hello', 0)` returns `"...hello"` (slice(0, -3) + "...")
- `truncate('hello', -1)` returns `"..hello"` (slice(0, -4) + "...")

**Recommendation**: Consider adding validation or treating non-positive maxLength as 0.

---

## Test Coverage Gaps

Missing test cases:
1. `maxLength < 3` (e.g., `truncate('hello', 2)`)
2. `maxLength = 0`
3. `maxLength` negative

---

## Positive Observations

- JSDoc documentation is clear and accurate
- Function signature is correct
- Main happy path tests pass
- Code style is consistent with existing functions

---

## Verdict

**Issues**: 1 Major, 1 Minor
**Action Required**: Fix Major issue before commit
