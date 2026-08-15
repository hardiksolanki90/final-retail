---
description: Run a code review of recently changed files against CLAUDE.md and project standards (React patterns, TypeScript, API conventions).
---

Review the recently changed or staged files in this React frontend project for:

1. **TypeScript correctness** — no `any`, proper typing, no type assertions hiding bugs
2. **React best practices** — proper hooks usage, no unnecessary re-renders, correct deps arrays
3. **API conventions** — all calls go through `src/api/`, correct error handling
4. **Component structure** — follows existing patterns in `src/components/`
5. **Security** — no secrets in code, XSS prevention, safe data rendering
6. **Performance** — no N+1 renders, lazy loading where appropriate
7. **Accessibility** — semantic HTML, ARIA attributes where needed

For each issue found:
- File path + line number
- What rule it violates
- Suggested fix

Conclude with a summary: PASS / NEEDS CHANGES.
