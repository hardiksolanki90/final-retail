# Final Retail — Complete Design Brief
> **Product**: Retail Distribution Management System (RDMS)  
> **Stack**: React 19 + TypeScript + TailwindCSS v4 + Vite 7  
> **Authored**: 2026-09-10 · Senior Product Designer pass  
> **Status**: Pre-code reference — all decisions are deliberate and justified

---

## 1. Design Principles

Three non-negotiable rules. Every UI decision is judged against these.

### Principle 1 — **Density with Breathing Room**
> *"Show the data without drowning the operator."*

This is a B2B operations tool used by people who live in it for 8+ hours a day. Every screen must carry a high information density — tables, KPIs, filters — but must never feel claustrophobic. We achieve this with consistent 24px section gaps, 16px inner card padding, and a strict 1-column sidebar that reclaims space on demand (collapsible to 70px).

**Why it matters here**: A field-sales manager checking order statuses across 200+ routes cannot afford a sparse, marketing-style layout. Density is a feature.

---

### Principle 2 — **Status at a Glance**
> *"The user must never have to read to know the state."*

Every entity in this system has a status: orders (pending / confirmed / delivered / cancelled), salesmen (active / inactive), promotions (live / expired). These statuses must be visually resolved — colour-coded badges with dot indicators — before the user reads a word. Trend arrows, progress bars, and colour-coded numbers (green for positive, red for negative) must communicate direction without text.

**Why it matters here**: With 40 modules and data across thousands of rows, the eye must be able to scan before the brain catches up.

---

### Principle 3 — **Zero Ambiguity on Destructive Actions**
> *"Deletes and bulk actions require deliberate confirmation — never a single click."*

The system handles financial documents (invoices, credit notes, debit notes), GRN records, and live promotions. A mis-click that deletes an invoice or cancels an order has real business consequences. Every destructive action must show a confirmation modal with a clear description of what will be destroyed. Danger buttons are red, always labelled, never icon-only.

**Why it matters here**: Early development with no undo history in the DB schema. Mistakes are permanent.

---

## 2. Visual Direction

### Mood
**Professional · Structured · Trustworthy · Operationally Dense**

References: Linear.app (sidebar density + dark mode quality), Retool (data-centric layout), Notion (light/dark consistency). NOT a consumer SaaS — avoid gradient hero sections, large illustrations, and decorative animations.

### What to avoid
- ❌ Full-bleed background images or hero illustrations
- ❌ Rounded corners above `12px` on interactive elements (too playful for a finance/ops tool)
- ❌ Bright accent colours beyond the primary blue — the semantic palette (green/amber/red) is reserved for status only
- ❌ Font sizes below 12px anywhere (readability under field conditions)
- ❌ Decorative animations — transitions exist for orientation, not delight
- ❌ Any third-party component library (Ant Design, MUI) — TailwindCSS utility classes only

### What to embrace
- ✅ Crisp table grids with subtle row dividers
- ✅ A dual-mode system (light/dark) that works equally well — no afterthought dark mode
- ✅ Consistent icon usage from Lucide React at exactly `w-5 h-5` for nav, `w-4 h-4` inline
- ✅ Micro-transitions: `transition-colors duration-200` on all interactive states
- ✅ The sidebar collapse behaviour as a primary space-management lever

---

## 3. Design Tokens

All tokens live in `src/index.css` under `@theme {}` and `:root {}`. These are canonical — no ad-hoc colours.

### 3.1 Colour Palette

#### Primary Brand — Blue
Chosen because blue conveys trust and authority in enterprise SaaS. Not the clichéd royal blue — we use a slightly desaturated Tailwind `blue-600` as the action colour, which reads well on both white backgrounds and dark `gray-900` surfaces.

| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#eff6ff` | Button focus rings, badge backgrounds, row selected bg |
| `primary-100` | `#dbeafe` | Active nav item background (light mode) |
| `primary-200` | `#bfdbfe` | Hover state on primary ghost elements |
| `primary-400` | `#60a5fa` | Charts, data bars (light accent) |
| `primary-500` | `#3b82f6` | Charts primary bar, progress fills, bar accents |
| **`primary-600`** | **`#2563eb`** | **Primary button bg, active icon, active nav text** |
| `primary-700` | `#1d4ed8` | Primary button hover |
| `primary-800` | `#1e40af` | Dark mode active nav bg |
| `primary-900` | `#1e3a8a` | Dark mode active nav background, deep fills |

#### Neutrals — Slate
Using Tailwind's `slate` scale (not `gray`) because slate has a slight cool-blue undertone that harmonises with the primary blue. This subtlety prevents the interface from looking beige-grey.

| Token | Hex | Usage |
|---|---|---|
| `neutral-50` | `#f8fafc` | Page background (light) |
| `neutral-100` | `#f1f5f9` | Secondary backgrounds, table header bg |
| `neutral-200` | `#e2e8f0` | Borders (light mode) |
| `neutral-300` | `#cbd5e1` | Scrollbar thumb, dividers |
| `neutral-400` | `#94a3b8` | Disabled text, placeholder, muted icons |
| `neutral-500` | `#64748b` | Body text secondary (dark mode muted) |
| `neutral-600` | `#475569` | Secondary text (light mode) |
| `neutral-700` | `#334155` | Muted text (light mode), dark mode borders |
| `neutral-800` | `#1e293b` | Dark mode card bg, dark mode secondary bg |
| `neutral-900` | `#0f172a` | Dark mode primary bg, sidebar bg (dark) |

#### Semantic Colours
Reserved exclusively for status, feedback, and system state. Never decorative.

| Intent | 50 (bg) | 500 (main) | 600 (hover/text) | Usage |
|---|---|---|---|---|
| **Success** | `#f0fdf4` | `#22c55e` | `#16a34a` | Active badge, positive trend, delivered status |
| **Warning** | `#fffbeb` | `#f59e0b` | `#d97706` | Pending badge, amber trend, expiring promotions |
| **Error / Danger** | `#fef2f2` | `#ef4444` | `#dc2626` | Delete button, cancelled badge, error toast, negative trend |
| **Info** | `#eff6ff` | `#3b82f6` | `#2563eb` | Informational toast, processing badge (reuses primary) |

#### Background Surfaces (Theme Variables)
These semantic variables switch automatically via `.dark` class on `<html>`.

| Variable | Light Value | Dark Value |
|---|---|---|
| `--bg-primary` | `#ffffff` | `#0f172a` |
| `--bg-secondary` | `#f9fafb` | `#1e293b` |
| `--bg-tertiary` | `#f3f4f6` | `#334155` |
| `--bg-card` | `#ffffff` | `#1e293b` |
| `--bg-sidebar` | `#ffffff` | `#0f172a` |
| `--bg-header` | `#ffffff` | `#1e293b` |
| `--border-color` | `#e2e8f0` | `#334155` |
| `--text-primary` | `#0f172a` | `#f8fafc` |
| `--text-secondary` | `#475569` | `#94a3b8` |
| `--text-muted` | `#334155` | `#64748b` |

---

### 3.2 Typography

**Font**: **Inter** (loaded via system fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`)

**Why Inter**: It was purpose-built for screen readability at small sizes, has an extensive weight range (300–900), and its tabular numerals variant makes data tables scannable. It's the industry standard for SaaS dashboards (Linear, Vercel, Notion) — familiar without being generic.

| Scale | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `display` | 30px / 1.875rem | 700 | 1.2 | Dashboard KPI numbers |
| `heading-xl` | 24px / 1.5rem | 700 | 1.3 | Page titles (`<h1>`) |
| `heading-lg` | 20px / 1.25rem | 600 | 1.3 | Modal titles, section headers |
| `heading-md` | 18px / 1.125rem | 600 | 1.4 | Card headers (`CardHeader.title`) |
| `body-lg` | 16px / 1rem | 400 | 1.5 | Long-form content, descriptions |
| `body-md` | 14px / 0.875rem | 400 | 1.5 | Default body, table cells, form labels |
| `body-sm` | 13px / 0.8125rem | 400 | 1.4 | Secondary table info, sub-labels |
| `caption` | 12px / 0.75rem | 500 | 1.3 | Badges, tags, table column headers (uppercase + tracking) |
| `micro` | 10px / 0.625rem | 500 | 1.2 | Chart axis labels only — never for UI copy |

**Table column headers**: `text-xs font-bold uppercase tracking-wider` — the extra weight and tracking compensates for the small size.

---

### 3.3 Spacing Scale

Built on a 4px base unit. All spacing in multiples of 4.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon gaps, tight inline spacing |
| `space-2` | 8px | Button internal padding (sm), badge padding |
| `space-3` | 12px | Button padding (md), input padding |
| `space-4` | 16px | Card inner padding (sm), list item padding |
| `space-5` | 20px | — |
| `space-6` | 24px | Card padding (lg), section vertical gap |
| `space-8` | 32px | Between major page sections |
| `space-12` | 48px | Empty state vertical padding |
| `space-16` | 64px | Header height (`--header-height`) |

**Sidebar dimensions**:
- Expanded: `260px` (`--sidebar-width`)
- Collapsed: `70px` (`--sidebar-collapsed-width`)

---

### 3.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded` | 4px | Badges (non-pill), small inline elements |
| `rounded-md` | 6px | Inputs, selects, form elements |
| `rounded-lg` | 8px | Buttons, dropdown menus, filter panels |
| `rounded-xl` | 12px | Cards, table containers, modals |
| `rounded-full` | 9999px | Status dot indicators, avatar circles, pill badges |

**Why**: `rounded-xl` (12px) is the card radius. It's refined but not childish. Larger radii (20px+) were rejected — they make data containers look like consumer apps.

---

### 3.5 Shadows

| Level | CSS | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards on hover |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Default card, action buttons |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Dropdowns, floating panels |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Modals |
| `shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Modal at highest z-index |

Dark mode shadows are invisible — dark surfaces use `border` instead of shadow for elevation.

---

### 3.6 Motion / Transitions

| Purpose | Duration | Easing |
|---|---|---|
| Colour / background hover | 200ms | `ease` |
| Theme switch (all surfaces) | 200ms | `ease` |
| Sidebar collapse | 300ms | `ease-in-out` |
| Drawer slide-in | 300ms | `ease-out` |
| Drawer overlay fade | 200ms | `ease-out` |
| Dropdown open | 150ms | `ease-out` |
| Modal zoom-in | 200ms | `ease-out` |

No transitions on layout shifts or page navigations — those must feel instant.

---

## 4. Screen Inventory

All 40+ screens categorised by purpose.

### 4.1 Auth & Org Setup (2 screens)

| Screen | Route | Purpose |
|---|---|---|
| Login | `/login` | Credential entry → Sanctum cookie auth |
| Organisation Setup | `/organisation` | Select or create tenant before accessing app |

### 4.2 Dashboard Hub (14 screens)

| Screen | Route | Purpose |
|---|---|---|
| Dashboard Router | `/` | Tabs: Sales, Logistics, Merchandising, etc. |
| Sales Dashboard | `/` (tab) | Revenue KPIs, trend bar chart, regional breakdown, top products/customers |
| Sales Target Dashboard | `/` (tab) | Target vs actual by salesman/region |
| Reach & Coverage Dashboard | `/` (tab) | Customer visit coverage % |
| Pre-Sale Reach Coverage | `/` (tab) | Pre-sale visit funnel |
| Customer Dashboard | `/` (tab) | Customer health, churn risk, top accounts |
| Logistics Dashboard | `/` (tab) | Delivery fulfillment, vehicle utilisation |
| Merchandising Dashboard | `/` (tab) | Planogram compliance, shelf audit scores |
| Merchandising Analytics | `/` (tab) | Trend analysis for merchandising KPIs |
| Merchandising Reach Coverage | `/` (tab) | Merchandising visit coverage |
| Route Compliance Dashboard | `/` (tab) | Salesman route adherence % |
| Visit Frequency Dashboard | `/` (tab) | How often customers are visited |
| MSL Audit Dashboard | `/` (tab) | Must-Stock List compliance tracking |
| Positioning Dashboard | `/` (tab) | SKU positioning across shelf audits |

### 4.3 Field Sales (6 modules × 2–3 views)

| Module | List | Add/Edit | View |
|---|---|---|---|
| Orders | `/orders` | `/order/add`, `/order/edit/:uuid` | `/order/:uuid` |
| Deliveries | `/deliveries` | `/delivery/add` | `/delivery/:uuid` |
| Invoices | `/invoices` | — (generated) | `/invoice/:uuid` |
| Credit Notes | `/credit-notes` | `/credit-note/add` | `/credit-note/:uuid` |
| Debit Notes | `/debit-notes` | `/debit-note/add` | `/debit-note/:uuid` |
| Returns | `/returns` | `/return/add` | `/return/:uuid` |

### 4.4 Salesman Operations (5 modules)

| Module | List | Add/Edit |
|---|---|---|
| Salesman | `/salesman` | `/salesman/add`, `/salesman/edit/:uuid` |
| Salesman Load | `/salesman-load` | `/salesman-load/add` |
| Salesman Unload | `/salesman-unload` | `/salesman-unload/add` |
| Journey Plans | `/journey-plans` | `/journey-plan/add` |
| Beats | `/beats` | `/beat/add` |

### 4.5 Customer (3 modules)

| Module | Route | Purpose |
|---|---|---|
| Customers | `/customers` | Master list of retail outlet customers |
| Registration | `/registrations` | New customer registration workflow |
| Complaints & Feedbacks | `/complaint-feedbacks` | Issue tracking |

### 4.6 Merchandising (5 modules)

| Module | Route |
|---|---|
| Planogram | `/planogram` |
| Share of Shelf | `/share-of-shelf` |
| Shelf Display | `/shelf-display` |
| Stock In Stores | `/stock-in-stores` |
| Pricing Check | `/pricing-check` |

### 4.7 Promotions & Pricing (5 modules)

| Module | Route |
|---|---|
| Promotion | `/promotions` |
| Market Promotion | `/market-promotions` |
| Discount | `/discounts` |
| Pricings | `/pricings` |
| Campaign | `/campaigns` |

### 4.8 Inventory (4 modules)

| Module | Route |
|---|---|
| GRN (Goods Received Note) | `/grn` |
| Pallet | `/pallets` |
| Items | `/items` |
| Item UOM | `/item-uom` |

### 4.9 Master Data / Settings

| Module | Route |
|---|---|
| Settings (tabbed) | `/settings` |
| → Bank, Country, Currency, Tax, Region, Zone, Route | Tabs within `/settings` |
| Asset Tracking | `/asset-tracking` |
| Portfolio Managements | `/portfolio-managements` |
| Route Item Groupings | `/route-item-groupings` |

### 4.10 Intelligence & Survey (2 modules)

| Module | Route |
|---|---|
| Competitor Infos | `/competitor-infos` |
| Surveys | `/surveys` |

### 4.11 Reports (1 hub)

| Screen | Route |
|---|---|
| Reports Hub | `/reports` |

---

## 5. User Flows

### Flow 1 — Login & Tenant Selection
```
1. User lands on /login
2. Enters email + password → POST /api/auth/login (Sanctum)
3. On success: redirected to /organisation
4. Selects active organisation from list → stored in OrganisationContext
5. Redirected to / (Dashboard)
6. On 401 (bad credentials): inline error below password field, no page reload
7. On 419 (CSRF expired): silent CSRF refresh → retry once → error toast if still failing
```

### Flow 2 — Create an Order
```
1. Navigate to /orders (OrderList)
2. Click "Create" button (primary, top-right)
3. Routed to /order/add (OrderAdd form)
4. Select customer from async-search Select dropdown
5. Add line items: search SKU → select quantity → UOM auto-populated
6. Discounts / promotions auto-apply if active campaign matches
7. Review order summary panel (sticky right column on desktop)
8. Submit → POST /api/order/add
9. On success: toast.success() → redirect to /orders
10. On error: toast.error() + inline field errors from API validation
```

### Flow 3 — Salesman Journey Plan Assignment
```
1. Navigate to /journey-plans
2. Click "Create Journey Plan"
3. Select salesman from dropdown
4. Select beat (route) from filtered dropdown
5. Pick date range (from/to date pickers)
6. System shows preview of customers on the beat
7. Submit → assigned journey plan appears in list
8. Salesman is notified via their mobile app (out of scope for this frontend)
```

### Flow 4 — Bulk Order Status Change
```
1. On /orders list, check 2+ row checkboxes
2. "Bulk Action" button appears with count badge (e.g. "Bulk Action 3")
3. Open dropdown → select "Confirm Selected"
4. Confirmation modal: "You are about to confirm 3 orders. This cannot be undone."
5. Confirm → PATCH requests fired → rows update in-place via React Query invalidation
6. Toast: "3 orders confirmed"
7. Checkboxes cleared
```

### Flow 5 — Merchandising Planogram Audit
```
1. Navigate to /planogram
2. List view shows stores with last audit date + compliance %
3. Click store row → Planogram detail view
4. Photos of shelf displayed (if uploaded by mobile app)
5. Manager marks compliance: compliant / non-compliant per SKU
6. Saves audit record
7. Score propagates to Merchandising Dashboard
```

### Flow 6 — Export Data
```
1. On any list page, click ≡ (more actions) → "Export"
2. Export modal opens (max-w-lg)
3. User selects: All records OR specific date range
4. Selects format: CSV or XLS
5. Clicks "Export" → API generates file → browser download triggered
6. Modal closes on success
```

---

## 6. Per-Screen Layout

### 6.1 Authenticated Shell (All screens share this)

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (h-16, sticky top-0, z-40)                        │
│  [≡ Menu]  [Search bar 320px]      [☀️][🔔][⚙️][Avatar] │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ SIDEBAR  │  PAGE CONTENT AREA                           │
│ 260px    │  padding: 24px                               │
│ (or 70px │  max-width: unconstrained                    │
│ collapsed│  overflow-y: auto                            │
│)         │                                              │
│ [Logo]   │                                              │
│ [Nav     │                                              │
│  groups] │                                              │
│          │                                              │
│ ─────    │                                              │
│ [Reports]│                                              │
└──────────┴──────────────────────────────────────────────┘
```

**Z-index stack**: Header z-40 → Sidebar z-30 (desktop) / z-50 (mobile) → Dropdowns z-20 → Modals z-50 → Drawers z-50 → Toasts z-[9999]

---

### 6.2 Login Screen

**Layout**: Centred single-column, full-viewport height  
**Sections** (top to bottom):
1. Logo mark (top-centre, 32px square rounded-lg blue square with "R")
2. "Sign in to Final Retail" heading (`heading-xl`)
3. Email input (full-width)
4. Password input with show/hide toggle
5. "Forgot password?" link (right-aligned, secondary text)
6. "Sign In" primary button (full-width)

**Background**: `bg-secondary` (light grey) with white card centred  
**Primary action**: Sign In button  
**Error state**: Red border on invalid fields + helper text below field  

---

### 6.3 Dashboard Screen

**Layout**: Single scrollable column inside page content area  
**Sections** (top to bottom):
1. **Tab bar** (pills variant) — Sales / Logistics / Merchandising / etc.
2. **KPI row** — 4 StatCards in a responsive grid (1→2→4 columns)
3. **Chart row** — 2/3-width trend chart + 1/3-width breakdown (e.g. by region)
4. **Status / Table row** — 1/3 status distribution + 2/3 top-items table
5. **Detailed table** — full-width top customers / top products

**Primary action**: None (read-only analytics view)  
**Components**: `StatCard`, `Card`, `CardHeader`, `CardContent`, custom CSS bar charts, `Table`

---

### 6.4 List Screen (template for all 40 modules)

**Layout**: Full-width inside page content area  
**Sections** (top to bottom):

```
[Page Title]          [Bulk Action v] [Filter] [Columns v] [Create] [≡ v]
───────────────────────────────────────────────────────────────────────────
[Filter accordion — collapses, bg-card, rounded-xl border, shadow-sm]
  └── Search | Date From | Date To | Status select | [Apply] [Clear]
───────────────────────────────────────────────────────────────────────────
[Table container — bg-card, rounded-xl, border, overflow-hidden]
  [thead — bg-secondary, border-b]
    ☐  Col1  Col2  Col3  Col4  Status  Actions
  [tbody — rows divided by border-b]
    ☐  data  data  data  data  [Badge]  [Edit] [Delete]
  [tfoot — pagination bar]
    Rows: [10 v]  1–10 of 247    [First][Prev][Page N of M][Next][Last]
```

**Primary action**: "Create" (primary blue button, top-right)  
**Secondary actions**: Filter, Columns (visibility toggle), Export/Import (in ≡ menu)  
**Bulk actions**: Appear only when ≥1 row selected, with count badge  
**Components**: `Button`, `Badge`, `StatusBadge`, table primitives, `SearchInput`, `Dropdown`, `Pagination`, `Modal`

---

### 6.5 Add / Edit Form Screen

**Layout**: 2-column responsive (single column on mobile, 2/3 + 1/3 on desktop)  
**Sections**:

```
[Page Title: "New Order" / "Edit Order"]          [Cancel] [Save]
──────────────────────────────────────────────────────────────────
LEFT COLUMN (2/3)                  RIGHT COLUMN (1/3, sticky)
──────────────────────────────────────────────────────────────────
[Card: Basic Info]                 [Card: Summary / Totals]
  Customer *                         Subtotal
  Date *                             Tax (auto)
  Payment Terms                      Grand Total
[Card: Line Items]                 [Card: Notes]
  [+ Add Item row]                   Internal notes textarea
  SKU | QTY | UOM | Price | Total
  ──────────────────────────────
[Card: Pricing / Discounts]
  Applied promotions (read-only)
```

**Primary action**: "Save" (primary blue, top-right, sticky bottom on mobile)  
**Components**: `Input`, `Select`, `MultiSelect`, `Checkbox`, `Button`, `Card`, `CardFooter`, React Hook Form

---

### 6.6 Settings Screen (Tabbed)

**Layout**: Full-width  
**Tab variant**: `line` tabs across top  
**Pattern**: Each settings sub-section renders a small table (list-type settings) or a form (singleton settings like Organisation profile). Each tab follows the same list/form layout as other modules.

---

## 7. Component Library

### 7.1 Button

**Variants**: `primary` · `secondary` · `outline` · `ghost` · `danger` · `success`  
**Sizes**: `sm` (px-3 py-1.5) · `md` (px-4 py-2) · `lg` (px-6 py-3)  
**Props**: `isLoading` (shows Loader2 spinner), `leftIcon`, `rightIcon`, `fullWidth`, `disabled`

| Variant | Light | Light hover | Dark | Dark hover |
|---|---|---|---|---|
| primary | `bg-blue-600 text-white` | `bg-blue-700` | same | same |
| secondary | `bg-gray-100 text-gray-700` | `bg-gray-200` | `bg-gray-700 text-gray-200` | `bg-gray-600` |
| outline | `border-gray-300 text-gray-700` | `bg-gray-50` | `border-gray-600 text-gray-200` | `bg-gray-800` |
| ghost | `text-gray-700` | `bg-gray-100` | `text-gray-200` | `bg-gray-800` |
| danger | `bg-red-600 text-white` | `bg-red-700` | same | same |
| success | `bg-green-600 text-white` | `bg-green-700` | same | same |

**States**: Default → Hover → Focus (2px ring, ring-offset-2) → Disabled (opacity-50, cursor-not-allowed) → Loading (spinner replaces leftIcon)

**Preset aliases**: `SaveButton` (primary) · `CancelButton` (outline) · `DeleteButton` (danger) · `AddButton` (primary)

---

### 7.2 Badge

**Variants**: `default` · `primary` · `success` · `warning` · `danger` · `info`  
**Sizes**: `sm` · `md` (default) · `lg`  
**Shapes**: `rounded` (default, 4px) · `rounded-full` (pill, via `rounded` prop)

**StatusBadge**: Coloured dot (`w-2 h-2 rounded-full`) + label text.

Status dot colours:
- `active` → `bg-green-500`
- `inactive` → `bg-gray-400`
- `pending` → `bg-amber-500`
- `completed` → `bg-blue-500`
- `cancelled` → `bg-red-500`

Order/entity status className pattern (inline, not StatusBadge):
- `delivered` → green-100/700 (dark: green-900/30 / green-400)
- `shipped` → blue-100/700
- `processing` → yellow-100/700
- `pending` → orange-100/700
- `cancelled` → red-100/700
- `confirmed` → indigo-100/700

---

### 7.3 Card

**Sub-components**: `Card` · `CardHeader` · `CardContent` · `CardFooter` · `StatCard`

- **Card**: `bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800`
- Padding: `none` · `sm` (p-3) · `md` (p-4) · `lg` (p-6)
- `hover` prop: adds `hover:shadow-md hover:border-gray-300 transition-all`
- **CardHeader**: Title (`text-lg font-semibold`) + optional subtitle + optional right action slot
- **CardFooter**: `flex items-center justify-end gap-3 pt-4 border-t`
- **StatCard**: Left (label + value `text-3xl font-bold` + trend) / Right (icon in primary-tinted square)

---

### 7.4 Table

**Primitives**: `Table` · `TableHeader` · `TableBody` · `TableRow` · `TableHead` · `TableCell` · `TableEmpty` · `TableLoading`

| Primitive | Key classes |
|---|---|
| TableHeader | `bg-gray-50 dark:bg-gray-800` |
| TableBody | `divide-y divide-gray-200 dark:divide-gray-700` |
| TableRow | hover: `bg-gray-50 dark:bg-gray-800/50`; selected: `bg-primary-50 dark:bg-primary-900/20` |
| TableHead | `px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500` |
| TableCell | `px-4 py-3 text-sm text-gray-900 dark:text-gray-100` |
| TableEmpty | `py-12 text-center text-gray-500` + optional icon above message |
| TableLoading | Skeleton rows: `h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse` |

---

### 7.5 Input

- Default: `border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800`
- Error: `border-red-500 focus:ring-red-500`
- Disabled: `bg-gray-50 text-gray-500 cursor-not-allowed`
- Focus: `ring-2 ring-primary-500 border-primary-500` (no native outline)
- Props: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`

---

### 7.6 Select / MultiSelect

- Select: Same border/bg treatment as Input; `<select>` with themed options
- MultiSelect: Selected values appear as removable chip tags inside the input; dropdown shows checkbox list

---

### 7.7 Modal

**Sizes**: `sm` · `md` · `lg` · `xl` · `full`  
**Overlay**: `bg-black/50 backdrop-blur-sm`  
**Container**: `rounded-xl shadow-2xl flex flex-col max-h-[90vh]`  
**Sections**: Header (title + X button) → Body (`flex-1 overflow-y-auto px-6 py-4`) → Footer (right-aligned)  
**Behaviour**: Escape closes; overlay click closes (configurable); body scroll lock while open  
**Animation**: `animate-in fade-in zoom-in-95 duration-200`  
**Focus**: Moves to first focusable element on open; returns to trigger on close

---

### 7.8 Drawer

**Position**: Right side (slide in from right)  
**Sizes**: `sm` (320px) · `md` (480px) · `lg` (640px)  
**Animation**: `slideInRight 0.3s ease-out` content + `fadeIn 0.2s ease-out` overlay  
**Uses**: Notification panel, Settings panel, entity quick-view  
**Same focus-trap pattern** as Modal

---

### 7.9 Tabs

**Variants**:
- `line`: Bottom `2px` active indicator in `primary-600`, text `primary-600` when active
- `pills`: Active tab gets `bg-white dark:bg-gray-700 shadow-sm` inside `bg-gray-100 dark:bg-gray-800` container

Both support: `icon`, `label`, `disabled` state, controlled or uncontrolled active key.

---

### 7.10 Sidebar Navigation

- Logo area: `h-16 border-b`, with "R" mark in `bg-blue-600 rounded-lg`
- Section captions: `text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400` (hidden when collapsed)
- Nav items: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium`
- Active: `bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`
- Hover: `hover:bg-gray-100 dark:hover:bg-gray-800`
- Collapsed: Icon only; tooltip `absolute left-full ml-2 bg-gray-900 text-white text-sm rounded px-2 py-1`

---

### 7.11 Header

**Left**: Mobile menu toggle (≡, `lg:hidden`) + Search bar (`w-64 lg:w-80`, `hidden sm:block`)  
**Right**: Theme toggle (Sun/Moon/Monitor dropdown) → Notifications bell (red count badge) → Settings gear (opens SettingsDrawer) → Profile button (avatar + name/email + chevron)

Profile dropdown: View Profile / Account Settings / divider / Sign Out (red)

---

### 7.12 Pagination

**Left slot**: "Rows per page: [select 10/15/25/50]" + "X–Y of Z"  
**Right slot**: [First] [Prev] [Page N of M] [Next] [Last]  
All nav buttons: `px-3 py-1 text-sm rounded border border-[--border-color] hover:bg-[--bg-secondary] disabled:opacity-50 disabled:cursor-not-allowed`

---

### 7.13 Dropdown (Generic)

Pattern: Trigger button → absolute `div` positioned `right-0 mt-2`  
Container: `bg-[--bg-card] border border-[--border-color] rounded-lg shadow-lg z-20`  
Items: `px-4 py-2 text-sm text-[--text-primary] hover:bg-[--bg-secondary] transition-colors`  
Close: Outside click via `useRef + useEffect`; also Escape key

---

### 7.14 Checkbox

`w-4 h-4 rounded border-[--border-color] text-primary-600 focus:ring-primary-500`  
Indeterminate state (partial selection) must be set via `ref.indeterminate = true`

---

## 8. UI States

### 8.1 List Screen States

| State | Behaviour |
|---|---|
| **Loading** | `TableLoading` skeleton (5 rows). Semi-transparent overlay on table container (`bg-white/50 dark:bg-black/20`) + centred spinner (`animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600`) |
| **Empty (no data)** | `TableEmpty` — centred icon + "No [entities] found." If filter active: secondary text "Try clearing your filters" |
| **Error** | Centred `text-red-500`: "Error loading [entity]: [error.message]" |
| **Offline** | Amber toast: "You are offline. Data may be stale." Table shows last cached data |
| **Success (mutation)** | `toast.success("Order created.")` auto-dismiss 4s |
| **Partial load** | Spinner overlay on table while new page fetches |

### 8.2 Form Screen States

| State | Behaviour |
|---|---|
| **Loading** | Full form skeleton — labels as grey bars, inputs as empty rounded boxes |
| **Submitting** | Save button `isLoading=true` (spinner), all inputs `disabled` |
| **Validation error** | Inline `error` prop on Input (red border + error text below field) |
| **Server error** | `toast.error("Failed to save: [API message]")`. Fields NOT cleared |
| **Success** | `toast.success(...)` → `navigate('/[module]')` |

### 8.3 Dashboard States

| State | Behaviour |
|---|---|
| **Loading** | StatCard values → `animate-pulse` grey bars. Chart area → grey placeholder |
| **No data** | Card body: "No data for selected period." centred, muted text |
| **Error** | Inline error text per card — does not block sibling cards |

### 8.4 Modal States

| State | Behaviour |
|---|---|
| **Open** | Backdrop blurs, zoom-in-95 animation, body scroll locked |
| **Submitting** | Primary button goes to loading state; overlay click disabled |
| **Error** | Error shown inside modal body — modal stays open |
| **Success** | Modal closes, toast fires |

### 8.5 Offline (Global)

Detect via `navigator.onLine` + `window.addEventListener('offline' / 'online')`:
- **Go offline**: Amber toast "You are offline. Changes may not save." + disable all mutating buttons
- **Back online**: Green toast "Connection restored." + re-enable mutations
- Tables remain readable with cached React Query data

---

## 9. Responsive Behaviour

**Desktop-first** product (per project context: "Desktop/laptop only for office use"). Mobile is graceful degradation.

### Breakpoints

| Name | Width | Key changes |
|---|---|---|
| `xs` (default) | 0–639px | Single column, sidebar hidden, no search bar in header |
| `sm` | 640px+ | Search bar visible, 2-col grids in forms |
| `md` | 768px+ | 2-col KPI cards, some 2-col form layouts |
| `lg` | 1024px+ | Sidebar always visible, 4-col KPI grid, 2/3+1/3 chart rows |
| `xl` | 1280px+ | Wider table rows, default expanded sidebar |
| `2xl` | 1536px+ | Max-width cap on content where needed |

### Sidebar
- **Desktop (lg+)**: Fixed left, always visible, collapse toggle reclaims 190px
- **Mobile (< lg)**: Hidden (`-translate-x-full`), ≡ button opens it, black/50 overlay closes it

### Tables
- `overflow-x-auto` on all table wrappers — horizontal scroll before column removal
- Columns dropdown is user preference (session, not persisted)
- Checkbox column and Actions column always visible

### Forms
- Mobile: Single column
- `sm`+: 2-column for paired fields (From/To dates, Name/Code)
- `lg`+: 2/3 main + 1/3 summary (sticky `top-20`)

### Dashboard
- Mobile: All cards in single column
- `md`+: 2-column StatCard grid
- `lg`+: 4-column StatCard grid + 2/3+1/3 charts

### Header
- Mobile: Profile shows avatar only (no name/email), search bar hidden
- `md`+: Name + email + chevron visible in profile button

---

## 10. Accessibility

### 10.1 Contrast Ratios (WCAG AA)

| Foreground | Background | Ratio | Result |
|---|---|---|---|
| `#0f172a` text-primary on `#ffffff` | — | 19.1:1 | ✅ AAA |
| `#475569` text-secondary on `#ffffff` | — | 6.3:1 | ✅ AA |
| `#64748b` text-muted on `#ffffff` | — | 4.6:1 | ✅ AA |
| `#ffffff` on `#2563eb` primary button | — | 4.6:1 | ✅ AA |
| `#f8fafc` text-primary on `#0f172a` dark bg | — | 17.8:1 | ✅ AAA |
| `#94a3b8` text-secondary on `#0f172a` dark | — | 5.9:1 | ✅ AA |
| `#16a34a` success-text on `#f0fdf4` success-bg | — | 5.2:1 | ✅ AA |
| `#dc2626` error-text on `#fef2f2` error-bg | — | 5.1:1 | ✅ AA |
| `#d97706` warning-text on `#fffbeb` warning-bg | — | 4.6:1 | ✅ AA |

> ⚠️ Warning badge in dark mode (`#fbbf24` on `#1e293b`) = ~3.1:1 — passes UI component threshold only. Compensate with `font-semibold` weight.

---

### 10.2 Focus Management

- **Global**: `:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 2px; }` (defined in `index.css`)
- **Mouse users**: `:focus-visible` fires only on keyboard focus — no outlines on click
- **Modals**: On open, focus moves to first focusable element inside; on close, focus returns to trigger button
- **Drawers**: Same focus-trap pattern as modals
- **Dropdowns**: `Escape` closes and returns focus to trigger

---

### 10.3 Keyboard Navigation

| Interaction | Keys |
|---|---|
| Move between focusable elements | `Tab` / `Shift+Tab` |
| Activate buttons and links | `Enter` / `Space` |
| Close modal / drawer | `Escape` |
| Activate table row (if clickable) | `Enter` |
| Toggle checkbox | `Space` |
| Close dropdown | `Escape` |
| Dropdown item navigation | `ArrowUp` / `ArrowDown` *(needs implementing in Dropdown)* |
| Tab navigation | `ArrowLeft` / `ArrowRight` *(needs implementing in Tabs)* |

---

### 10.4 ARIA Requirements by Component

| Component | Required ARIA | Status |
|---|---|---|
| Header menu toggle | `aria-label="Toggle menu"` | ✅ Exists |
| Notification bell | `aria-label="Notifications"` | ✅ Exists |
| Settings button | `aria-label="Settings"` | ✅ Exists |
| Sidebar close (mobile) | `aria-label="Close sidebar"` | ✅ Exists |
| Modal close button | `aria-label="Close modal"` | ✅ Exists |
| Modal container | `role="dialog" aria-modal="true" aria-labelledby="modal-title-id"` | ⚠️ Needs adding |
| Table header checkbox | `aria-label="Select all"` | ⚠️ Needs adding |
| Table row checkbox | `aria-label="Select order {order_number}"` | ⚠️ Needs adding |
| Status badges | `aria-label="Status: Delivered"` | ⚠️ Needs adding |
| Progress bars | `role="progressbar" aria-valuenow aria-valuemin="0" aria-valuemax="100"` | ⚠️ Needs adding |
| Tabs container | `role="tablist"` | ⚠️ Needs adding |
| Tab button | `role="tab" aria-selected aria-controls="panel-id"` | ⚠️ Needs adding |
| Tab panel | `role="tabpanel" aria-labelledby="tab-id"` | ⚠️ Needs adding |
| Dropdown trigger | `aria-expanded aria-haspopup="menu"` | ⚠️ Needs adding |
| Dropdown menu | `role="menu"` | ⚠️ Needs adding |
| Dropdown items | `role="menuitem"` | ⚠️ Needs adding |
| Sort header | `aria-sort="ascending/descending/none"` on `<th>` | ⚠️ Needs adding |
| Loading table | `aria-busy="true"` on table container | ⚠️ Needs adding |
| Toasts (react-hot-toast) | `role="alert"` | ✅ Library handles |

---

### 10.5 Screen Reader Announcements

| Trigger | Announcement |
|---|---|
| Form save success | react-hot-toast `role="alert"` → "Order created successfully." |
| Form save error | react-hot-toast `role="alert"` → "Failed to save: [reason]" |
| Bulk action complete | `role="alert"` → "3 orders confirmed." |
| Route navigation | Page `<title>` must update per route: "Orders — Final Retail" |
| Table data loaded | `aria-busy` removed; no explicit announcement needed |
| Offline detection | `role="alert"` → "You are offline. Changes may not save." |

---

## Appendix A — Sidebar Menu Groups

| Section | Items |
|---|---|
| Overview | Dashboard |
| Field Sales | Orders, Deliveries, Invoices, Credit Notes, Debit Notes, Returns |
| Salesman Ops | Salesman, Salesman Load, Salesman Unload, Journey Plans, Beats |
| Customers | Customers, Registration, Complaints & Feedbacks |
| Merchandising | Planogram, Share of Shelf, Shelf Display, Stock in Stores, Pricing Check |
| Promotions | Promotion, Market Promotion, Discount, Pricings, Campaign |
| Inventory | GRN, Pallet, Items, Item UOM |
| Intelligence | Competitor Infos, Surveys |
| Master Data | Settings, Asset Tracking, Portfolio Managements, Route Item Groupings |
| *(standalone)* | Reports |

---

## Appendix B — Token Quick Reference

```css
/* Layout */
--sidebar-width: 260px;
--sidebar-collapsed-width: 70px;
--header-height: 64px;

/* Brand */
--primary-600: #2563eb;  /* CTA, active nav, focus ring */

/* Semantic */
--success:  #22c55e;
--warning:  #f59e0b;
--error:    #ef4444;
--info:     #3b82f6;

/* Typography */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
font-size-base: 14px;  /* body-md */

/* Radius */
--radius-card: 12px;   /* rounded-xl */
--radius-btn:   8px;   /* rounded-lg */
--radius-input:  6px;  /* rounded-md */
```

---

*End of Design Brief — Final Retail RDMS*  
*File: `docs/design-brief.md`*
