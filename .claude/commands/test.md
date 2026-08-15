---
description: Run frontend tests and type checks. Reports failures with file, line, and suggested fix.
---

Run tests for the retail-app React frontend.

## Type check
```bash
npx tsc --noEmit
```

## Lint
```bash
npm run lint
```

## Unit / component tests (if configured)
```bash
npm test
```

## After running:
- Summarise pass/fail counts
- For each failure: show the file path + line number, error message, and a suggested fix
- Do NOT remove or disable failing tests — fix the underlying code
- If all checks pass, confirm and ask if the user wants to proceed
