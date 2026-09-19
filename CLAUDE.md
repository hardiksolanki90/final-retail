# CLAUDE.md — Retail Distribution Management System (Frontend)

## Product Overview

**Final Retail** is a B2B Retail Distribution Management System (RDMS) for FMCG/CPG distributors.
It covers field sales, salesman operations, customer management, merchandising, inventory, promotions, and reporting.

- **Frontend**: React 19 SPA (this repo)
- **Backend**: Laravel API (`final-retail-laravel`) at `/api` (proxied)
- **Database**: MySQL — `prod_nfpc` (canonical schema: `docs/DATABASE_STRUCTURE.md`)
- **Auth**: Laravel Sanctum (cookie-based, CSRF token flow)

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | React + TypeScript | 19 / 5.x |
| Build | Vite | 7 |
| Styling | TailwindCSS | v4 (via `@tailwindcss/vite`) |
| Server state | TanStack React Query | v5 |
| Forms | React Hook Form | v7 |
| Routing | React Router DOM | v7 |
| HTTP | Axios | 1.x |
| Icons | Lucide React | latest |
| Notifications | React Hot Toast | 2.x |
| Utilities | clsx, react-number-format, react-phone-input-2 | — |

---

## Project Structure

```
src/
├── api/              # Module-specific API classes (EntityApi.ts pattern)
├── assets/           # Static assets
├── components/
│   ├── layout/       # Sidebar, Header, Layout wrapper
│   ├── shared/       # Shared/reusable components
│   └── ui/           # Base UI primitives
├── context/          # React Context providers (auth, org, theme)
├── data/             # Static data / constants
├── hooks/            # Custom hooks — one folder per module
├── lib/              # Utility libraries (axios instance wrapper)
├── pages/            # 40 page modules (see Module Inventory below)
├── providers/        # App-level providers
├── router/           # Centralized route definitions (index.tsx)
├── services/         # api.js — Axios base instance + interceptors
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

---

## Module Inventory (40 Modules)

| Category | Modules |
|---|---|
| Field Sales | Orders, Deliveries, Invoices, CreditNotes, DebitNotes, Returns |
| Salesman Ops | Salesman, SalesmanLoad, SalesmanUnload, JourneyPlans, Beats |
| Customer | Customers, Registration, ComplaintFeedbacks |
| Merchandising | Planogram, ShareOfShelf, ShelfDisplay, StockInStores, PricingCheck |
| Promotions | Promotion, MarketPromotion, Discount, Pricings, Campaign |
| Inventory | GRN, Pallet, Items, ItemUom |
| Master / Settings | Settings (Bank, Country, Currency, Tax, Region, Zone, Route, etc.) |
| Tracking & Reports | AssetTracking, Reports, PortfolioManagements, RouteItemGroupings |
| Competitor Intel | CompetitorInfos |
| Survey | Surveys |
| Auth & Org | Authentication, Organisation |

---

## Architecture Patterns

### API Layer
- `src/services/api.js` — Axios base instance (`withCredentials`, CSRF token, 401/419 interceptors)
- `src/api/*.ts` — Module API classes. **Never call `axios.get()` directly in components.**

```typescript
// Pattern: src/api/EntityApi.ts
const EntityApi = {
  list: async (params?) => (await api.get('/entity/list', { params })).data,
  listAll: async () => (await api.get('/entity/all')).data,
  add: async (data) => (await api.post('/entity/add', data)).data,
  getByUuid: async (uuid) => (await api.get(`/entity/edit/${uuid}`)).data,
  update: async (uuid, data) => (await api.post(`/entity/edit/${uuid}`, data)).data,
  delete: async (uuid) => (await api.delete(`/entity/delete/${uuid}`)).data,
};
```

### Hooks Pattern
- One folder per module: `src/hooks/{Module}/`
- Use React Query (`useQuery` / `useMutation`) for all server state
- Hooks return data + mutation functions; pages do NOT call APIs directly

### Modal | Hook Pattern (4-prop rule)
- Every modal: exactly 4 props — `isOpen`, `onClose`, `data`, `onEvent`
- Hook (`useMyModal.tsx`) exposes `open()` (Promise-based) + `ModalView`
- Consumer: `const result = await open(data)` + renders `<ModalView />` in JSX
- Use **Zustand** for globally accessible or multi-caller modals
- Full guide: `.claude/rules/frontend/modal-hook-pattern.md`

### Routing
- Centralized: `src/router/index.tsx`
- `<ProtectedRoute />` — requires authentication
- `<OrganisationGuard />` — requires active organisation

### Module Scaffolding Template
```
pages/{Module}/
├── {Module}List.tsx     ← Table + search + filters + bulk actions + pagination
├── {Module}Add.tsx      ← Create/edit form (React Hook Form)
└── {Module}View.tsx     ← Detail view or drawer (optional)

hooks/{Module}/
├── use{Module}.ts       ← React Query data hook
└── use{Module}Form.ts   ← Form hook (optional)

api/{Module}Api.ts       ← API class
```

---

## Non-Negotiable Conventions

1. **TypeScript**: All files `.tsx`/`.ts`, proper types — NO `any`
2. **API calls**: Only via `src/api/` classes — never inline Axios in components or hooks
3. **Forms**: Always React Hook Form — no uncontrolled or manual state forms
4. **Styling**: TailwindCSS only — NO Ant Design, NO custom CSS except CSS variables
5. **Notifications**: `toast.success()` / `toast.error()` from `react-hot-toast`
6. **IDs**: UUID only — never expose internal DB integer IDs
7. **Naming**: Components PascalCase, hooks `useCamelCase`, API classes `PascalCaseApi`
8. **CSS Variables**: Use `--text-primary`, `--text-secondary`, `--bg-card`, `--border-color` for theming
9. **Dark mode**: Always add `dark:` prefix variants when styling
10. **Style guide**: Airbnb React/TypeScript

---

## Key Commands

```bash
npm run dev       # Start Vite dev server → http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

---

## See Also

- `docs/DATABASE_STRUCTURE.md` — Canonical backend DB schema (`prod_nfpc`)
- `docs/project_context.md` — project context for the frontend
- `docs/design-brief.md` — Design brief for the frontend
- `docs/architecture.md` — System architecture diagram
- `docs/security-gap.md` — Security gap analysis for the frontend
- `docs/onboarding.md` — Dev setup guide
- `.claude/rules/frontend/react.md` — React component standards
- `.claude/rules/frontend/styling.md` — TailwindCSS conventions
- `.claude/rules/frontend/api.md` — API integration patterns
- `.claude/rules/frontend/modal-hook-pattern.md` — Modal | Hook pattern (4-prop rule)
- `PROJECT_STRUCTURE.md` — Full coding standards reference
