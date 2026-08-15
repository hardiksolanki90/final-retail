# CLAUDE.md — Retail App React (Frontend)

## Project Overview

React frontend for the Retail Distribution Management System. Provides a web interface for managing orders, deliveries, invoices, customers, salesman operations, settings, and more.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS v4 (via `@tailwindcss/vite` plugin)
- **State/Data**: TanStack React Query v5
- **Forms**: React Hook Form v7
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Utilities**: clsx, react-number-format, react-phone-input-2

## Project Structure

```
src/
├── api/              # API class modules (AuthApi, CustomerApi, OrderApi, etc.)
├── assets/           # Static assets (images, fonts)
├── components/
│   ├── layout/       # Layout components (Sidebar, Header, etc.)
│   ├── shared/       # Shared/reusable components
│   └── ui/           # Base UI components
├── context/          # React Context providers
├── data/             # Static data/constants
├── hooks/            # Custom hooks (per module: Customer/, Order/, Settings/, etc.)
├── lib/              # Utility libraries (axios instance)
├── pages/            # Page components organized by module (39 modules)
├── providers/        # App-level providers
├── router/           # Route definitions (index.tsx)
├── services/         # API service layer (api.js — axios instance + interceptors)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Key Commands

```bash
# Start development server
npm run dev

# Build for production
tsc -b && vite build

# Lint
npm run lint

# Preview production build
npm run preview
```

## Architecture Patterns

### API Layer
- `src/services/api.js` — Base Axios instance with interceptors (CSRF, 401/419 handling)
- `src/api/*.ts` — Module-specific API classes (e.g., `CustomerApi.ts`, `OrderApi.ts`)
- Base URL: `/api` (proxied to Laravel backend via Vite config)

### Hooks Pattern
- Custom hooks per module in `src/hooks/{ModuleName}/`
- Use React Query for server state management
- Hooks encapsulate API calls, caching, and mutations

### Page Organization
- One directory per module in `src/pages/`
- Typical module structure: `{Module}List.tsx`, `{Module}Add.tsx`, `{Module}View.tsx`
- Pages use hooks for data fetching and mutations

### Modal | Hook Pattern
- Every modal component has **exactly 4 props**: `isOpen`, `onClose`, `data`, `onEvent`
- Hook file (`useMyModal.tsx`) manages state and returns `open()` (Promise-based) + `ModalView`
- Consumer calls `const result = await open(data)` and renders `<ModalView />` in its JSX
- **Use Modal|Hook** for single-component modals; **use Zustand** for globally accessible or multi-caller modals
- See `.claude/rules/frontend/modal-hook-pattern.md` for full implementation guide

### Routing
- Centralized in `src/router/index.tsx`
- Protected routes via `ProtectedRoute` component
- Organisation guard via `OrganisationGuard` component

## Important Conventions

1. **TypeScript**: All new files must be `.tsx`/`.ts`, define proper types
2. **API calls**: Use the API classes in `src/api/`, never call Axios directly in components
3. **State management**: Use React Query for server state, React Context for app state
4. **Forms**: Use React Hook Form for all forms
5. **Styling**: Use TailwindCSS utility classes
6. **Notifications**: Use `react-hot-toast` for user feedback
7. **UUID**: All entity references use UUID, never internal DB IDs

## See Also

- `.claude/rules/frontend/react.md` — React component standards
- `.claude/rules/frontend/styling.md` — TailwindCSS conventions
- `.claude/rules/frontend/api.md` — API integration patterns
- `.claude/rules/frontend/modal-hook-pattern.md` — Modal | Hook pattern (4-prop rule, Promise-based open, Zustand alternative)
