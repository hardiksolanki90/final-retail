---
description: Run a code review of recently changed React/TypeScript files against CLAUDE.md and project standards (component patterns, API integration, TailwindCSS conventions). Reports bugs, violations, and improvement suggestions.
---

Review the recently changed or staged files in this React frontend project for:

1. **React Component Standards** (see `.claude/rules/frontend/react.md`)
   - Functional components with TypeScript + properly typed props
   - Page components use correct module structure (`*List.tsx`, `*Add.tsx`, `*View.tsx`)
   - No direct Axios calls in components — use API classes (`src/api/*.ts`)
   - React Query used for server state, React Hook Form for forms

2. **API Integration Patterns** (see `.claude/rules/frontend/api.md`)
   - API classes follow the `list / listAll / add / getByUuid / update / delete` pattern
   - Axios base instance from `src/services/api.js` used (not a new Axios instance)
   - Errors handled via React Query `onError` + `toast.error()`
   - Auth state managed via React Context, not localStorage

3. **TailwindCSS Conventions** (see `.claude/rules/frontend/styling.md`)
   - TailwindCSS v4 utility classes used (not inline styles)
   - `clsx` used for conditional class composition
   - No arbitrary CSS unless absolutely necessary

4. **TypeScript**
   - Props typed with `interface {ComponentName}Props`
   - No `any` types
   - API response types defined in `src/types/`

Report format:
```
### Code Review
Found N issues:

1. <brief description> (`rules/frontend/react.md` says "...")
   <file path and line range>

2. ...

🤖 Generated with Claude Code
```

If no issues found:
```
### Code Review
No issues found. Checked for React, API, TailwindCSS, and TypeScript compliance.

🤖 Generated with Claude Code
```
