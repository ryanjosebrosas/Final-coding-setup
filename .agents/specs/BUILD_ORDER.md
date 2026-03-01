# Build Order — Build Test Project

Generated: 2026-03-01
Status: 2/3 complete

---

## Pillar 1: Core String Utilities

- [x] `P1-01` **string-reverse** (light) — Create reverse() function that reverses a string
  - depends: none
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: reverse("hello") returns "olleh", reverse("") returns ""

- [x] `P1-02` **string-capitalize** (light) — Create capitalize() function that capitalizes first letter of each word
  - depends: P1-01
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: capitalize("hello world") returns "Hello World", capitalize("") returns ""

- [ ] `P1-03` **string-truncate** (light) — Create truncate() function that truncates a string and adds ellipsis if over maxLength
  - depends: P1-02
  - touches: src/strings.ts, src/strings.test.ts
  - acceptance: truncate("hello world", 5) returns "he...", truncate("hi", 10) returns "hi", truncate("", 5) returns ""
