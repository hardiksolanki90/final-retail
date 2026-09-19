# 🛒 Final Retail — Product & Technical Context

> Captured: 2026-09-08 by PM analysis pass  
> Maintainer: Rudransh

---

## 1. What This Product Is

**Final Retail** is a **Retail Distribution Management System (RDMS)** — a B2B SaaS web app used by FMCG/CPG distributors and their field salesforce.

It has two codebases that run together:

| Layer | Codebase | Stack |
|---|---|---|
| Frontend (SPA) | `final-retail` | React 19 + TypeScript + Vite 7 + TailwindCSS v4 |
| Backend (API) | `final-retail-laravel` | Laravel (PHP) + MySQL (`prod_nfpc`) |

**Entry URL**: `http://localhost:5173` (dev) → proxied to Laravel API at `http://localhost:8000/api`

---

## 2. Module Inventory (40 Modules)

The frontend has 40 distinct page modules. These map to real-world retail distribution workflows:

| Category | Modules |
|---|---|
| **Field Sales** | Orders, Deliveries, Invoices, CreditNotes, DebitNotes, Returns |
| **Salesman Ops** | Salesman, SalesmanLoad, SalesmanUnload, JourneyPlans, Beats |
| **Customer** | Customers, Registration, Complaints/Feedbacks |
| **Merchandising** | Planogram, ShareOfShelf, ShelfDisplay, StockInStores, PricingCheck |
| **Promotions & Pricing** | Promotion, MarketPromotion, Discount, Pricings, Campaign |
| **Inventory** | GRN, Pallet, Items, ItemUom, SalesmanLoad/Unload |
| **Master Data / Settings** | Settings (Bank, Country, Currency, Tax, Region, Zone, Route, etc.) |
| **Tracking & Reporting** | AssetTracking, Reports, PortfolioManagements, RouteItemGroupings |
| **Auth & Org** | Authentication, Organisation |
| **Competitor Intel** | CompetitorInfos |
| **Survey** | Surveys |

---

## 3. Tech Stack

### Frontend (`final-retail`)
- **React 19** + TypeScript + Vite 7
- **TailwindCSS v4** (via `@tailwindcss/vite`) — NO Ant Design
- **TanStack React Query v5** — server state / data fetching
- **React Hook Form v7** — ALL forms
- **React Router DOM v7** — SPA routing
- **Axios** — HTTP client (base instance in `src/services/api.js`)
- **Lucide React** — icons
- **React Hot Toast** — notifications
- Utilities: `clsx`, `react-number-format`, `react-phone-input-2`

### Backend (`final-retail-laravel`)
- **Laravel** (PHP) — REST API
- **Laravel Sanctum** — cookie-based auth (CSRF token flow)
- MySQL database: `prod_nfpc`
- Auth: `GET /sanctum/csrf-cookie` → `POST /api/auth/login`

---

## 4. Key Architecture Patterns

### API Layer
```
src/services/api.js         ← Axios base instance (CSRF, 401/419 interceptors, withCredentials)
src/api/{Module}Api.ts      ← Module API classes (list, add, getByUuid, update, delete)
```

### Data Flow
```
Page Component → Custom Hook → API Class → Axios Instance → Laravel API → MySQL
```

### State Management
- **Server state**: React Query (useQuery / useMutation)
- **App state**: React Context (auth, org, theme)
- **Form state**: React Hook Form
- **Local UI state**: useState

### Modal | Hook Pattern
Every modal has exactly **4 props**: `isOpen`, `onClose`, `data`, `onEvent`  
Hook file (`useMyModal.tsx`) exposes `open()` (Promise-based) + `ModalView`  
Consumer: `const result = await open(data)` + renders `<ModalView />` in JSX

### Routing
- Centralized: `src/router/index.tsx`
- Protected routes: `<ProtectedRoute />`
- Org-required routes: `<OrganisationGuard />`

### Module Scaffolding
Each module follows:
```
pages/{Module}/
├── {Module}List.tsx      ← Table + search + filters + bulk actions
├── {Module}Add.tsx       ← Create/edit form
└── {Module}View.tsx      ← Detail view (optional)

hooks/{Module}/
├── use{Module}.ts        ← Data hook (React Query + mutations)
└── use{Module}Form.ts    ← Form hook (optional)
```

---

## 5. Coding Conventions (Non-Negotiable)

1. All new files: `.tsx`/`.ts` with proper types — NO `any`
2. API calls: ONLY via `src/api/` classes — never inline `axios.get()` in components
3. Forms: ALWAYS use React Hook Form
4. Styling: ONLY TailwindCSS utility classes + CSS variables (`--text-primary`, `--bg-card`, etc.)
5. Notifications: `react-hot-toast`
6. Entity references: UUID only — never internal DB IDs
7. Error display: `toast.error()` from `react-hot-toast`
8. Components: PascalCase filenames; Hooks: camelCase with `use` prefix
9. Airbnb style guide for React/TypeScript
10. Canonical DB schema: `docs/DATABASE_STRUCTURE.md`

---

## 6. PM Discovery Findings (Session: 2026-09-08)

| Question | Answer |
|---|---|
| **Product Status** | Early development — no real users yet |
| **Target Users** | All roles: field salesmen, managers, back-office, retail customers, merchandisers |
| **Mobile / Desktop** | Desktop/laptop only (office use) |
| **Offline support** | Critical for field reps — strategy TBD (decide together) |
| **Multi-tenancy** | Yes — each Organisation is a separate isolated tenant |
| **RBAC** | Role-based (Admin, Manager, Salesman, etc.) — needs design |
| **External integrations** | None — standalone system |
| **Deployment** | Not decided yet (cloud SaaS vs. on-premise) |
| **Working mode** | Focus on one module per session as directed |
| **Module priority** | Driven by each session — no fixed queue yet |

### 🔑 Critical Decisions Pending

1. **Offline strategy**: Field reps need offline access but the current stack (React SPA + Axios) has no offline layer. Options to evaluate:
   - **PWA + Service Workers** — cache API responses, queue mutations offline
   - **IndexedDB sync** — full local DB with background sync (heavier but robust)
   - **Read-only offline** — cache last fetch, block writes until connected
   - Recommend: decide before building any more field-facing modules

2. **RBAC design**: Need to define roles, their permissions per module, and whether field-level restrictions are needed (e.g. can salesman edit price?)

3. **Deployment target**: Affects infrastructure decisions (CDN, Docker, env config)

---

## 7. File Map (Key Files)

| File | Purpose |
|---|---|
| [`CLAUDE.md`](file:///Users/rudransh/Documents/Final%20Retail/final-retail/CLAUDE.md) | AI coding context for this frontend |
| [`PROJECT_STRUCTURE.md`](file:///Users/rudransh/Documents/Final%20Retail/final-retail/PROJECT_STRUCTURE.md) | Full coding standards & patterns |
| [`docs/architecture.md`](file:///Users/rudransh/Documents/Final%20Retail/final-retail/docs/architecture.md) | System architecture diagram |
| [`docs/onboarding.md`](file:///Users/rudransh/Documents/Final%20Retail/final-retail/docs/onboarding.md) | Dev setup guide |
| [`src/services/api.js`](file:///Users/rudransh/Documents/Final%20Retail/final-retail/src/services) | Axios base instance |
| [`src/router/index.tsx`](file:///Users/rudransh/Documents/Final%20Retail/final-retail/src/router) | Route definitions |
| [`.claude/rules/frontend/`](file:///Users/rudransh/Documents/Final%20Retail/final-retail/.claude/rules/frontend) | api.md, react.md, styling.md, modal-hook-pattern.md |
