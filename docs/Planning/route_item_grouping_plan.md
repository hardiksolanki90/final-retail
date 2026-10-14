# Route Item Grouping — study of nfpc and plan for Final Retail

Date: 2026-10-09. Status: **Phases 1–6 done (2026-10-10); phase 7 (wrap-up: real-app click-through, docs) next.** Section 6 decisions confirmed by the user on 2026-10-09 (all recommended options).

## 1. What it is (from nfpc)

A named list of items attached to a **route** and/or a **salesman** (a user). Example: "Route A – Chilled range" = 25 items. The mobile salesman app asks "which groups/items belong to my route / to me" and shows those items. In nfpc nothing else reads it: Orders, Deliveries, Invoices and Loads do **not** check it, so today it is master data (an assortment list), not a rule.

Only two other places touch it: the salesman replacement (moves every grouping of the old salesman to the new one) and the Route record (its detail response includes its groupings).

### nfpc data model (`/Users/rudransh/Documents/Hardik/nfpc`)

| Table | Columns |
|---|---|
| `route_item_groupings` | id, uuid, organisation_id (FK, cascade), salesman_id (nullable, a `users.id`, no FK), route_id (nullable, FK routes, cascade), code, name, status (bool, default 1), timestamps |
| `route_item_grouping_details` | id, uuid, route_item_grouping_id (FK, cascade), item_id (FK items, cascade), timestamps. No quantity, no priority, no unique key |

No dates, priority or per-item quantity exist in nfpc.

### nfpc endpoints (`RouteItemGroupController`, `RouteItemGroupingController`)

| Call | Behaviour |
|---|---|
| `POST route-item-grouping/list` | filters `code`, `name` (exact); whole list loaded, then paged in PHP; each row with route, salesman (+ salesman code) and items |
| `POST route-item-grouping/add` | `name`, `code` (auto-numbered), `salesman_id`, `route_id`, `items[{item_id}]`; at least one item; one transaction |
| `GET/POST route-item-grouping/edit/{uuid}` | update header, delete all detail rows, re-insert from `items` |
| `ANY route-item-grouping/delete/{uuid}` | hard delete (details cascade) |
| `POST route-item-grouping-by-salesman` | groups by `salesman_id` or `route_id`, with items |
| `GET routeitemgrouping/{route_id}` | groups of a route with items (mobile) |

### nfpc flaws not to copy

- Validation is only `name` and `code` required: route, salesman and items are never checked to exist or to belong to the organisation; the same item can be added twice.
- Update deletes the detail rows **before** checking that `items` is not empty, and the early return does not roll back — a bad request wipes the group's items.
- Code is taken as typed on update (no uniqueness check); `status` exists but is never set or filtered.
- In-memory pagination; hard delete; `Item::routeItemGroupings()` points at a column that does not exist.
- `by-salesman` mixes up the two filters when both are sent.

## 2. What Final Retail has today

- Menu entry, route `/route-item-grouping` and page title.
- `RouteItemGroupingList.tsx` / `RouteItemGroupingAdd.tsx`: **sample data only**, no API, no hook.
- `src/types/RouteItemGrouping.ts` is invented (string ids, priority, effective/expiry dates) and does not match nfpc or this app's rules.
- **Backend: nothing** — no table, model, route, controller or permission.
- `salesman_replacements` exists (old/new salesman = `users.id`), but creating one only stores the record; it moves nothing.
- Routes (`routes`: area_id, depot_id, route_code, route_name, status), items, and the code-setting service (auto-numbering per entity) all exist and follow a standard pattern (Model + Store/Update requests + List/View resources + Repository + Controller with `permissionMiddleware`, uuid in URLs, integer ids for relations).

## 3. Design for Final Retail

Same meaning as nfpc, built to this app's rules (integer ids for relations, uuid only to address a record, soft deletes, organisation scoped).

### Tables (one migration)

`route_item_groupings`: id, uuid, organisation_id (FK), route_id (nullable FK routes), salesman_id (nullable FK users — same as `salesman_replacements`), code, name, status (bool, default true), timestamps, soft deletes. Unique (organisation_id, code).

`route_item_grouping_details`: id, uuid, route_item_grouping_id (FK, cascade), item_id (FK items), timestamps. **Unique (route_item_grouping_id, item_id)**.

### Rules

- Name required (max 191); code auto-numbered through `CodeSettingService` (new entity `route_item_grouping`, label "Route Item Grouping Code", added to `CODE_LOOKUP` and `CodeSetting::ENTITIES`), typed code allowed when the setting is manual; unique per organisation, ignoring itself on edit.
- At least one route **or** one salesman (a group with neither belongs to nobody) — see decision 6.1.
- `routeId`, `salesmanId`, `items[].itemId` are integer ids and must be live records of the user's organisation; items distinct, at least one.
- Edit replaces the item list **inside one transaction and only after validation passes**, so a bad request changes nothing.
- Delete is soft; bulk delete supported.

### API (all under the standard module permission `route-item-grouping`: view / create / edit / delete)

| Call | Purpose |
|---|---|
| `GET route-item-grouping/list` | paginated (DB-level), filters `search` (code/name), `route_id`, `salesman_id`, `status`; rows carry route name, salesman name, item count |
| `GET route-item-grouping/all` | select options (id, label) |
| `GET route-item-grouping/edit/{uuid}` | one group with its items |
| `POST route-item-grouping/add` | create |
| `POST route-item-grouping/edit/{uuid}` | update |
| `DELETE route-item-grouping/delete/{uuid}`, `POST route-item-grouping/delete` | delete / bulk delete |
| `GET route-item-grouping/for?route_id=&salesman_id=` | groups (with item ids) for a route and/or salesman — replaces nfpc's two mobile calls, both filters ANDed |

salesman replacement: creating a replacement also moves the old salesman's groupings to the new one (nfpc behaviour that Final Retail is missing), inside the same transaction. Journey plans are not touched here (separate topic).

### Frontend

- `types/RouteItemGrouping.ts` rewritten to the real shape; `api/RouteItemGroupingApi.ts`; `hooks/RouteItemGroupings/useRouteItemGroupings.ts` (TanStack Query, `recordCache` invalidation).
- **List**: real data, skeleton rows, search + route / salesman / status filters, column chooser kept, bulk delete, row Edit / Delete gated by permission, row click opens a view drawer (header + items table).
- **Add/Edit drawer** (React Hook Form): Code (auto-number preview like Customer), Name, Route (infinite select), salesman (infinite select), Status, **Items**: search-and-add picker with a table of chosen items (code, name, remove), duplicates blocked. Sample data and the invented fields (priority, dates, item count input) removed.
- Page title and menu already exist.

## 4. Phases

Each phase ends with something that works and is checked; later phases need the earlier ones.

### Phase 1 — Database, permissions, numbering — DONE 2026-10-10
- Migration: `route_item_groupings` and `route_item_grouping_details` (section 3), with the unique keys.
- Permission migration: `route-item-grouping` view / create / edit / delete, granted to super-admin and org-admin roles, permission cache reset (same as the stock permissions); `RolePermissionSeeder` updated.
- Code setting: entity `route_item_grouping` ("Route Item Grouping Code") added to `CodeSettingService::CODE_LOOKUP` and `CodeSetting::ENTITIES`.
- Done when: migration runs and rolls back cleanly, permissions visible for the admin role, `consumeNext` gives a code.
- Built: migrations `2026_10_10_100000_create_route_item_grouping_tables` and `..._100010_seed_route_item_grouping_permissions`; `route-item-grouping` added to `RolePermissionSeeder`; `route_item_grouping` entity in `CodeSetting::ENTITIES` and `CodeSettingService::CODE_LOOKUP`. Verified: rollback + re-migrate, 4 permissions granted to 2 admin roles per organisation (8 grants), `consumeNext` returns the code.

### Phase 2 — Backend API — DONE 2026-10-10
- Models `RouteItemGrouping` (Filterable, Organisationid, SoftDeletes; route, salesman, items relations) and `RouteItemGroupingDetail`.
- `StoreRouteItemGroupingRequest` / `UpdateRouteItemGroupingRequest` (rules in section 3), `RouteItemGroupingList` / `RouteItemGroupingView` resources (integer ids + names, no row ids of children).
- `RouteItemGroupingRepository` + controller with `permissionMiddleware`; routes list / all / edit (GET) / add / edit (POST) / delete (uuid) / bulk delete.
- Edit validates first, then replaces the items in one transaction.
- Check `tests/checks/route_item_grouping_check.php`: create, auto code and uniqueness, duplicate / foreign-organisation / unknown ids refused, edit with an empty item list leaves the group untouched, filters, delete and bulk delete, permissions (403).
- Done when: the check passes and `route:list` shows the endpoints.
- Built: models `RouteItemGrouping` / `RouteItemGroupingDetail`; `StoreRouteItemGroupingRequest` (+ Update), trait `Concerns/ChecksLiveRecords`; resources `RouteItemGroupingList` (uuid, code, name, status, routeId/Name, salesmanId/Name/Code, itemCount) and `RouteItemGroupingView` (+ items[{itemId, itemCode, itemName}]); `RouteItemGroupingRepository`; `Api\RouteItemGroupingController`; routes `route-item-grouping/list|all|edit/{uuid}|add|edit/{uuid}|delete|delete/{uuid}` (bulk delete takes `ids` = group uuids; list key `routeItemGroupings`). A salesman = a user of the organisation with a salesman profile. Check `tests/checks/route_item_grouping_check.php` passes (the other-organisation cases are skipped when the dev DB has only one organisation).

### Phase 3 — Frontend data layer — DONE 2026-10-10
- `types/RouteItemGrouping.ts` rewritten (integer ids; code, name, route, salesman, status, items).
- `api/RouteItemGroupingApi.ts` (list, all, get, add, update, delete, bulkDelete) and `hooks/RouteItemGroupings/useRouteItemGroupings.ts` (queries, mutations, toasts, `recordCache` invalidation).
- Done when: `tsc` and ESLint clean; nothing visible changes yet.
- Built: `types/RouteItemGrouping.ts` (`RouteItemGrouping`, `RouteItemGroupingDetail`, `RouteItemGroupingItem`, `RouteItemGroupingForm`, `RouteItemGroupingPayload`, `RouteItemGroupingListParams`; the old sample form type `RouteItemGroupingFormData` is kept only until phase 5 rebuilds the drawer); `api/RouteItemGroupingApi.ts`; `hooks/RouteItemGroupings/useRouteItemGroupings.ts` (`useRouteItemGroupings`, `useRouteItemGrouping`, `useRouteItemGroupingActions` {create, update, remove, removeMany}). `tsc` shows nothing from these files.

### Phase 4 — List screen — DONE 2026-10-10
- Replace the sample data: real paging, skeleton rows, empty row.
- Columns Code, Name, Route, Salesman, Items (count), Status; search plus route / salesman / status filters; column chooser kept; row Edit and Delete and bulk delete gated by permission, `window.confirm` on delete.
- Done when: list loads from the API in the harness or real app, filters and delete work.
- Built: `RouteItemGroupingList.tsx` rewritten on `useRouteItemGroupings` (server paging, search, Route / Salesman / Status filters, column chooser, row + bulk delete with confirm, permission-gated buttons, skeleton + empty rows); shared `RouteSelect.tsx` and `SalesmanSelect.tsx` (searchable, infinite scroll, value = integer id as string; salesman value = user id) for the filters now and the form in phase 5. Row Edit is a disabled placeholder and Create still opens the old sample drawer until phase 5. `tsc` / ESLint / `vite build` clean for these files; NOT yet seen in a browser (pane cannot open localhost:5173). ESLint errors remain only in the old sample `RouteItemGroupingAdd.tsx`, which phase 5 replaces.

### Phase 5 — Add / Edit drawer and View drawer — DONE 2026-10-10
- Form (React Hook Form): Code (auto-number preview), Name, Route and Salesman (infinite selects), Status, Items picker (search, add, table of chosen items with remove, duplicates blocked, at least one).
- Edit drawer uses `FormSkeleton`; sample fields (Description, Priority, dates) removed.
- View drawer: header plus items table, opened from a row click.
- Done when: create, edit and view work end to end; `vite build` passes; screenshots checked.
- Built: `RouteItemGroupingAdd.tsx` (create + edit via `editingUuid`: Code with the code-settings icon, Name, Route, Salesman, status switch in the footer, item picker + table with remove; client checks name / route-or-salesman / at least one item; duplicate item blocked with a toast; `FormSkeleton` while an edit loads); `RouteItemGroupingView.tsx` (row click: header fields + items table + Edit button); `RouteItemPicker.tsx` (searchable, infinite, uses the id-valued `getStockItemOptions`); list rows open the view drawer, the pencil opens edit. Old sample form type removed. Verified in the harness (mock API) — create, validation, view, edit with removed item — and `tsc` / ESLint / `vite build` clean; not yet in the real app (pane cannot open localhost:5173). Code is left blank so the server numbers it (no number is burnt by a failed save).

### Phase 6 — Salesman replacement hook and lookup — DONE 2026-10-10
- Creating a `merchandiser_replacements` record also moves the old salesman's groups to the new one (same transaction).
- `GET route-item-grouping/for?route_id=&salesman_id=` (both filters ANDed) for the mobile app.
- Check cases added to the phase 2 script.
- Done when: a replacement moves the groups and the lookup returns them.
- Built: `MerchandiserReplacementRepository::store` now runs in a transaction and moves every live group of the old salesman to the new one (response gains `groupingsMoved`); editing or deleting a replacement does not move anything back. The replacement's `type` is free text here (not nfpc's replace/swap), so every replacement moves the groups. `GET route-item-grouping/for?route_id=&salesman_id=` (needs one of them, both ANDed, active groups only, with all items, not paged; permission = view). Check script extended; all pass.

### Phase 7 — Wrap-up
- Real-app click-through, `project_context.md` entry, plan status line, memory update.
- Not in scope: restricting Order / Load by the grouping, importing nfpc rows.

## 5. Risks

- "salesman" is a `users.id` here, as in nfpc and `salesman_replacements`; the salesman picker must supply that id (to be confirmed against the salesman select when building).
- Dev database has few routes/items; checks create their own data inside a rolled-back transaction.

## 6. Decisions (confirmed 2026-10-09)

1. **salesman**: any salesman (no role filter).
2. **Behaviour**: master data only, like nfpc — Orders / Loads / Deliveries are not restricted.
3. **nfpc data**: not imported now; a CSV import can follow later.
4. **Screen fields**: the sample screen's Description, Priority, Effective date and Expiry date are dropped (confirmed 2026-10-09). Form = Code, Name, Route, Merchandiser, Status, Items. List columns = Code, Name, Route, Merchandiser, Items (count), Status.
