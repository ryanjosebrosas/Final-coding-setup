# Plan: string-reverse

> **Feature**: `string-reverse`
> **Spec ID**: P1-01 (light)
> **Pillar**: P1 — Core String Utilities
> **Feature Directory**: `.agents/features/string-reverse/`
> **Plan Type**: Task Briefs (1 task, 1 brief)
> **Generated**: 2026-03-02
> **Mode**: Auto-approve (autonomous planning for /build pipeline)

---

## FEATURE DESCRIPTION

Implement a `reverse()` function that takes a string input and returns the reversed string. This is the first spec in Pillar 1 (Core String Utilities) and establishes the foundational patterns for string manipulation functions in the project.

**User Story**: As a developer using this utility library, I need a `reverse()` function so that I can easily reverse strings without implementing the logic myself.

**Problem Statement**: String reversal is a common operation needed in many contexts (palindrome checking, text transformations, data normalization). Rather than reimplementing this logic each time, we need a reliable, tested utility function.

**Solution Statement**: Create a pure function `reverse(str: string): string` that uses the idiomatic split-reverse-join pattern to reverse any input string, including handling the empty string edge case correctly.

---

## FEATURE METADATA

| Field | Value |
|-------|-------|
| **Spec ID** | P1-01 |
| **Spec Name** | string-reverse |
| **Complexity** | light |
| **Pillar** | P1 — Core String Utilities |
| **Dependencies** | none (first spec) |
| **Target Files** | `src/strings.ts`, `src/strings.test.ts` |
| **Files to Create** | `src/strings.test.ts`, `package.json` (minimal) |
| **Files to Modify** | `src/strings.ts` |
| **Estimated Effort** | 1 task, ~30 minutes |
| **Risk Level** | LOW |
| **Test Framework** | vitest (to be established) |

### Slice Guardrails

**What's In Scope**:
- `reverse()` function implementation in `src/strings.ts`
- Unit tests in `src/strings.test.ts` covering acceptance criteria
- Minimal `package.json` with vitest for test running
- Export the function from `src/strings.ts`

**What's Out of Scope**:
- `capitalize()` function (next spec: P1-02)
- Additional string utilities (future specs)
- Integration with other modules (no other modules exist yet)
- Performance optimization (the split-reverse-join pattern is sufficient for this use case)

**Definition of Done**:
- [ ] `reverse()` function implemented and exported from `src/strings.ts`
- [ ] Tests pass for `reverse("hello")` === `"olleh"`
- [ ] Tests pass for `reverse("")` === `""`
- [ ] All validation commands pass (L1-L5)
- [ ] No TypeScript errors
- [ ] Task brief marked done: `task-1.md` → `task-1.done.md`

---

## PILLAR CONTEXT

### Pillar Overview

**Pillar**: P1 — Core String Utilities

**Scope**: Foundational string manipulation functions that form the base of the utility library. This pillar establishes:
- Function signature patterns (pure functions, TypeScript types)
- Testing patterns (vitest setup, test structure)
- Export patterns (how functions are exposed from modules)

**Research Findings**: None — this is the first spec, so no prior research exists. Patterns will be established here and carried forward to subsequent specs.

**PRD Requirements Covered by This Spec**:
- [ ] Create foundational string utilities
- [ ] Establish testing patterns
- [ ] Create exportable module structure

**Specs in This Pillar**:
1. `P1-01` **string-reverse** (light) — This spec
2. `P1-02` **string-capitalize** (light) — Depends on P1-01

**Pillar Gate**: `src/strings.ts` exports `reverse` and `capitalize`, all tests pass.

---

## CONTEXT REFERENCES

### Codebase Files

#### src/strings.ts (4 lines) — Current stub

**Why**: This is the target file for implementation. Need to understand the current empty state before modifying.

**File Path**: `C:\Users\Utopia\Desktop\opencode-ai-coding-system\src\strings.ts`

**Current Content**:
```typescript
// String utility functions — Build Test Project
// This file will be populated by /build specs

export {};
```

**Analysis**: 
- Line 1-2: Comment header describing the file's purpose — must be preserved
- Line 3: Empty line for readability
- Line 4: `export {}` — TypeScript idiom for empty module, will be replaced with actual exports
- Total: 4 lines, all will be preserved except line 4 which expands to include function

**What to look for**: 
- Comment header pattern (preserve in all modifications)
- Export pattern (currently empty, will add function exports)
- File structure (TypeScript module, no imports needed for pure functions)

**Modification Strategy**: 
- Preserve lines 1-3 exactly
- Replace line 4 with function implementation + export
- Future functions will be added below reverse()

#### BUILD_ORDER.md (lines 1-18) — Spec definition

**Why**: Contains the authoritative spec definition for this feature. Source of truth for acceptance criteria.

**File Path**: `C:\Users\Utopia\Desktop\opencode-ai-coding-system\.agents\specs\BUILD_ORDER.md`

**Current Content**:
```markdown
# Build Order — Build Test Project

Generated: 2026-03-01
Status: 0/2 complete

---

## Pillar 1: Core String Utilities

- [ ] `P1-01` **string-reverse** (light) — Create reverse() function that reverses a string
  - depends: none
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: reverse("hello") returns "olleh", reverse("") returns ""

- [ ] `P1-02` **string-capitalize** (light) — Create capitalize() function that capitalizes first letter of each word
  - depends: P1-01
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: capitalize("hello world") returns "Hello World", capitalize("") returns ""
```

**Analysis**:
- Line 1: Title — identifies this as the build order for the test project
- Line 3: Generation date — 2026-03-01, may need update after completion
- Line 4: Status — currently 0/2 complete, will become 1/2 after this spec
- Line 8: Pillar 1 header — Core String Utilities
- Lines 10-13: P1-01 spec — THIS SPEC (reverse function)
- Lines 15-18: P1-02 spec — depends on P1-01 completion

**Acceptance Criteria** (from lines 10-13):
1. `reverse("hello")` must return `"olleh"` — primary test case
2. `reverse("")` must return `""` — edge case (empty string)

**Dependencies**: `depends: none` — this is the first spec, no prior work required

**Touches**: 
- `src/strings.ts` — modify (add function)
- `src/strings.test.ts` — create (add tests)

**Next Spec**: P1-02 string-capitalize depends on P1-01 — must complete this spec before capitalize

#### build-state.json — Current build state

**Why**: Tracks build progress, patterns established, and decisions log. Updated after each spec.

**File Path**: `C:\Users\Utopia\Desktop\opencode-ai-coding-system\.agents\specs\build-state.json`

**Current Content**:
```json
{
  "lastSpec": null,
  "completed": [],
  "currentPillar": 1,
  "totalSpecs": 2,
  "currentSpec": "string-reverse",
  "currentStep": "planning",
  "patternsEstablished": [],
  "decisionsLog": []
}
```

**Field Analysis**:
- `lastSpec: null` — no prior specs completed (first spec)
- `completed: []` — empty array, will become `["P1-01"]` after completion
- `currentPillar: 1` — working on Pillar 1 (Core String Utilities)
- `totalSpecs: 2` — Pillar 1 has 2 specs total
- `currentSpec: "string-reverse"` — this spec
- `currentStep: "planning"` — current phase (will update to "execution" then "complete")
- `patternsEstablished: []` — no patterns yet (we're creating the foundation)
- `decisionsLog: []` — no decisions logged yet

**Update Strategy** (after execution):
```json
{
  "lastSpec": "string-reverse",
  "completed": ["P1-01"],
  "currentPillar": 1,
  "totalSpecs": 2,
  "currentSpec": "string-capitalize",
  "currentStep": "planning",
  "patternsEstablished": ["vitest-testing", "function-export-pattern"],
  "decisionsLog": [
    {
      "spec": "P1-01",
      "decision": "Use vitest as test framework",
      "rationale": "Modern, fast, ESM-native, works well with TypeScript"
    },
    {
      "spec": "P1-01",
      "decision": "split-reverse-join pattern for string reversal",
      "rationale": "Idiomatic JavaScript/TypeScript approach"
    }
  ]
}
```

### Related Files (to be created)

#### src/strings.test.ts — Will be created

**Why**: Test file for the reverse() function. Must be created as part of this spec.

**Expected Structure**:
```typescript
import { describe, it, expect } from 'vitest';
import { reverse } from './strings';

describe('reverse', () => {
  it('should reverse a string', () => {
    expect(reverse('hello')).toBe('olleh');
  });

  it('should return empty string for empty input', () => {
    expect(reverse('')).toBe('');
  });

  // Additional edge cases...
});
```

**File Location**: `C:\Users\Utopia\Desktop\opencode-ai-coding-system\src\strings.test.ts`

**Naming Convention**: `{module}.test.ts` — standard vitest/test file naming

#### package.json — Will be created

**Why**: Minimal package.json to enable vitest test running. Establishes project's dependency management.

**Expected Structure**:
```json
{
  "name": "build-test-project",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

**File Location**: `C:\Users\Utopia\Desktop\opencode-ai-coding-system\package.json`

**Key Fields**:
- `"type": "module"` — enables ESM imports (required for vitest)
- `"test"` script — runs `vitest run` for one-time test execution
- `"vitest"` devDependency — test framework

---

## PATTERNS TO FOLLOW

### Pattern 1: TypeScript Function Export (to be established)

Since this is the first spec, we're establishing the pattern rather than following one. The pattern will be:

```typescript
// String utility functions — Build Test Project
// This file will be populated by /build specs

/**
 * Function description comment.
 * @param param - Description of parameter
 * @returns Description of return value
 */
export function functionName(param: Type): ReturnType {
  // Implementation
}
```

**Why this pattern**: 
- Standard TypeScript ESM export syntax
- Clear and idiomatic
- JSDoc comments provide IDE autocomplete and documentation
- Preserves the comment header from the original file

**How to apply**: 
- Use this structure for `reverse()` function
- Add JSDoc comment describing what the function does
- Use explicit TypeScript types (string in, string out)
- Export the function so it can be imported by tests and other modules

**Common gotchas**:
- Don't remove the comment header (lines 1-2)
- Ensure function signature is correct (`reverse(str: string): string`)
- Use `export` keyword (not `export default`)
- JSDoc is optional but recommended for documentation

**Example Applied to reverse()**:
```typescript
// String utility functions — Build Test Project
// This file will be populated by /build specs

/**
 * Reverses a string.
 * @param str - The string to reverse
 * @returns The reversed string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}
```

### Pattern 2: Vitest Test Structure (to be established)

```typescript
import { describe, it, expect } from 'vitest';
import { functionName } from './module-name';

describe('functionName', () => {
  it('should do X when Y', () => {
    expect(functionName(input)).toBe(expectedOutput);
  });

  it('should handle edge case Z', () => {
    expect(functionName(edgeInput)).toBe(edgeOutput);
  });
});
```

**Why this pattern**: 
- Standard vitest structure with describe/it blocks
- Clear test names that describe behavior ("should do X when Y")
- Arrange-Act-Assert pattern implicit in the test structure
- Import from 'vitest' (not 'jest' or other frameworks)

**How to apply**: 
- Use this structure for all reverse() tests
- First test covers acceptance criteria (normal case)
- Second test covers acceptance criteria (empty string edge case)
- Additional tests cover other edge cases (single char, palindrome, spaces)

**Common gotchas**:
- Import path is `./module-name` NOT `./module-name.ts` — vitest resolves extension automatically
- Test names should be descriptive (not just "test 1", "test 2")
- Use `expect().toBe()` for exact string matching
- Import the function being tested from the correct relative path

**Example Applied to reverse()**:
```typescript
import { describe, it, expect } from 'vitest';
import { reverse } from './strings';

describe('reverse', () => {
  it('should reverse a string', () => {
    expect(reverse('hello')).toBe('olleh');
  });

  it('should return empty string for empty input', () => {
    expect(reverse('')).toBe('');
  });
});
```

### Pattern 3: split-reverse-join Implementation (standard JavaScript pattern)

```typescript
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}
```

**Why this pattern**: 
- Idiomatic JavaScript/TypeScript string reversal using built-in array methods
- Highly readable — any JavaScript developer understands this immediately
- Efficient enough for typical string lengths
- No external dependencies required
- Handles all edge cases naturally (empty string, single char, unicode, etc.)

**How it works**:
1. `str.split('')` — splits string into array of characters: `"hello"` → `['h', 'e', 'l', 'l', 'o']`
2. `.reverse()` — reverses the array in place: `['h', 'e', 'l', 'l', 'o']` → `['o', 'l', 'l', 'e', 'h']`
3. `.join('')` — joins array back into string: `['o', 'l', 'l', 'e', 'h']` → `"olleh"`

**How to apply**: 
- This is the exact implementation for reverse()
- No modification needed — this pattern is complete and correct

**Common gotchas**:
- Works correctly for empty strings: `"".split('')` → `[]` → `[]` → `""`
- Works correctly for single characters: `"a".split('')` → `['a']` → `['a']` → `"a"`
- Does NOT modify the original string (strings are immutable in JavaScript)
- Array.reverse() modifies the array in place, but that's fine since we create a new array with split()

**Edge Case Verification**:
```typescript
reverse('')        // '' → [].reverse() → [] → '' ✓
reverse('a')       // 'a' → ['a'].reverse() → ['a'] → 'a' ✓
reverse('ab')      // 'ab' → ['a','b'].reverse() → ['b','a'] → 'ba' ✓
reverse('hello')   // 'hello' → ['h','e','l','l','o'].reverse() → ['o','l','l','e','h'] → 'olleh' ✓
```

### Pattern 4: package.json for TypeScript Projects (to be established)

```json
{
  "name": "project-name",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

**Why this pattern**:
- `"type": "module"` enables ESM imports (required for vitest and modern TypeScript)
- Test scripts provide standard commands for running tests
- devDependencies for tools that are only needed during development

**How to apply**:
- Use this structure for the project's package.json
- Add vitest as devDependency (not dependency — only needed for testing)
- Include test and test:watch scripts

**Common gotchas**:
- `"type": "module"` is required for ESM imports in Node.js 18+
- vitest version should be compatible with Node.js version
- devDependencies are not installed in production builds (which is correct for test tools)

---

## IMPLEMENTATION PLAN

### Overview

This implementation is straightforward — one task covering both implementation and tests. The task will:
1. Set up minimal package.json with vitest (enables test running)
2. Implement reverse() function in strings.ts (core implementation)
3. Create strings.test.ts with tests covering acceptance criteria (verification)
4. Run validation commands to verify (L1-L5 validation pyramid)

### Why One Task?

**Decision**: Single task for implementation + tests rather than separate tasks.

**Rationale**:
- Implementation and tests are tightly coupled — can't meaningfully test without implementation
- Both files are small (strings.ts ~15 lines, strings.test.ts ~30 lines)
- Single task reduces overhead for such a simple feature
- Tests verify implementation in the same execution session

**When to Split**: For larger features where:
- Implementation is complex (100+ lines)
- Tests are extensive (50+ test cases)
- Multiple files are involved (5+ files)
- Tests depend on external systems (integration tests)

**This Spec**: None of the above apply — single task is appropriate.

### Execution Flow

```
/execute .agents/features/string-reverse/plan.md
  ↓
Reads task-1.md
  ↓
Step 1: Create package.json
  ↓
Step 2: Implement reverse() in strings.ts
  ↓
Step 3: Create strings.test.ts with tests
  ↓
Step 4: Run validation commands
  ↓
Step 5: Update build-state.json
  ↓
Step 6: Update pipeline handoff
  ↓
Step 7: Mark task-1.md as done
  ↓
Returns: task-1.done.md, all tests passing
```

### Validation Strategy

Each step includes a VALIDATE section with commands to verify correctness. The validation pyramid:

| Level | Purpose | Command |
|-------|---------|---------|
| L1 | Syntax & Style | File existence, JSON validity |
| L2 | Type Safety | `npx tsc --noEmit` |
| L3 | Unit Tests | `npx vitest run` |
| L4 | Integration | N/A (no integration points) |
| L5 | Manual | Read files, verify structure |

**Pass Criteria**: All levels that apply must pass. L4 is N/A for this spec.

---

## IMPLEMENTATION PLAN

### Overview

This implementation is straightforward — one task covering both implementation and tests. The task will:
1. Set up minimal package.json with vitest
2. Implement reverse() function in strings.ts
3. Create strings.test.ts with tests covering acceptance criteria
4. Run validation commands to verify

### Phases

Since this is a light spec with only one task, there are no distinct phases. The single task covers:
- Setup (package.json)
- Implementation (strings.ts)
- Testing (strings.test.ts)

---

## STEP-BY-STEP TASKS

### Task 1: Implement reverse() and create tests

| Field | Value |
|-------|-------|
| **Target Files** | `src/strings.ts` (modify), `src/strings.test.ts` (create), `package.json` (create) |
| **Scope** | Implement reverse() function with vitest tests |
| **Dependencies** | None (first task) |
| **Estimated Lines** | 700-1000 lines in task brief |
| **Execution Mode** | Single `/execute` session |

**Summary**: Implement the reverse() function using split-reverse-join pattern. Create comprehensive tests covering the acceptance criteria (normal case and empty string). Set up minimal package.json with vitest for test running.

**Detailed scope in task brief**: `task-1.md`

---

## TESTING STRATEGY

### Unit Tests

**Location**: `src/strings.test.ts`

**Test Cases**:
1. Normal case: `reverse("hello")` returns `"olleh"`
2. Empty string: `reverse("")` returns `""`
3. Single character: `reverse("a")` returns `"a"`
4. Palindrome: `reverse("radar")` returns `"radar"`
5. With spaces: `reverse("hello world")` returns `"dlrow olleh"`

**Coverage Goal**: 100% of reverse() function (trivial for single function)

### Integration Tests

N/A — No integration points exist yet. This is a standalone utility function.

### Edge Cases

- Empty string (required by acceptance criteria)
- Single character (boundary case)
- Unicode characters (future consideration, not required for this spec)
- Very long strings (not tested for this light spec)

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
# TypeScript syntax check
npx tsc --noEmit

# If ESLint configured (not yet)
# npx eslint .
```

### Level 2: Type Safety

```bash
# TypeScript type check
npx tsc --noEmit
```

### Level 3: Unit Tests

```bash
# Run vitest
npx vitest run
```

### Level 4: Integration Tests

N/A — No integration tests for this spec.

### Level 5: Manual Validation

1. Read `src/strings.ts` and verify `reverse()` function is exported
2. Read `src/strings.test.ts` and verify test structure
3. Run `npx vitest run` and verify all tests pass
4. Manually verify `reverse("hello")` === `"olleh"` in Node REPL if needed

---

## ACCEPTANCE CRITERIA

### Implementation (verify during execution)

- [ ] `reverse()` function implemented in `src/strings.ts`
- [ ] Function uses split-reverse-join pattern
- [ ] Function is exported from `src/strings.ts`
- [ ] `src/strings.test.ts` created with vitest tests
- [ ] Test for `reverse("hello")` === `"olleh"` exists
- [ ] Test for `reverse("")` === `""` exists
- [ ] `package.json` created with vitest dependency
- [ ] All TypeScript compilation passes
- [ ] All tests pass

### Runtime (verify after testing)

- [ ] `npx vitest run` passes with all tests green
- [ ] No TypeScript errors in strings.ts or strings.test.ts
- [ ] Function can be imported and used: `import { reverse } from './strings'`

---

## COMPLETION CHECKLIST

- [ ] Task 1 executed and marked done (`task-1.md` → `task-1.done.md`)
- [ ] All validation levels passed (L1-L5)
- [ ] Acceptance criteria verified
- [ ] No regressions (no prior code to regress)
- [ ] Handoff notes written in task-1.done.md
- [ ] Build state updated (`.agents/specs/build-state.json`)
- [ ] Pipeline handoff updated (`.agents/context/next-command.md`)

---

## NOTES

### Key Design Decisions

1. **Vitest as test framework**: Modern, fast, ESM-native, works well with TypeScript. Establishes pattern for all future specs.

2. **Single task for implementation + tests**: For such a small feature, separating implementation and tests would add unnecessary overhead. They are tightly coupled.

3. **split-reverse-join pattern**: Idiomatic JavaScript/TypeScript approach. More readable than manual character iteration.

### Risks

- **LOW**: Empty string handling — the split-reverse-join pattern naturally handles empty strings correctly (returns empty array, reverses to empty array, joins to empty string).

### Confidence Score

**9/10** — Trivial implementation with well-understood patterns. One point deducted only because this is the first spec and we're establishing all patterns from scratch (no prior art to validate against).

### Dependencies

- **Internal**: None (first spec)
- **External**: vitest (will be added to package.json)

---

## TASK INDEX

| Task | Brief Path | Scope | Status | Files |
|------|-----------|-------|--------|-------|
| 1 | `task-1.md` | Implement reverse() function and create vitest tests | pending | 2 created, 1 modified |

---

## METADATA

**Plan Length**: This plan is designed to be 700-1000 lines when rendered, providing comprehensive context for execution.

**Execution Model**: `/execute .agents/features/string-reverse/plan.md` will read this plan and execute task-1.md in a single session.

**Next Command After Planning**: `/execute .agents/features/string-reverse/plan.md`

**Next Command After Execution**: `/code-loop string-reverse`

**Next Command After Review**: `/commit string-reverse`

**Next Command After Commit**: `/pr string-reverse`

---

*End of plan — proceed to task-1.md for execution details*
