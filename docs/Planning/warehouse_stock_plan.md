# Warehouse Stock (Add Items to a Warehouse) — Implementation Plan

Status: **Phases 1–4 done, phase 5 done except Credit Note (2026-10-08). 2026-10-09: Entries screen + Adjust stock UI removed; stock screen rows have Edit (set quantity in any UOM) and Delete (set to 0) via `stock/set`; same item+UOM lines merge. Phase 6 (reports) next.** All section 8 decisions confirmed.
Scope: after a warehouse is created, put item stock into it, keep the quantity correct as documents move stock, and show it in the UI.

---

## 1. Summary

Final Retail has warehouses and item masters, but **no stock at all**: no quantity table, and no document (GRN, Load, Unload, Delivery, Invoice, Credit Note) changes a quantity. The legacy `nfpc` project did track stock, but with several design flaws (section 3). This plan keeps what nfpc got right (warehouse tree with van warehouses, availability check on delivery, adjustment flow) and replaces the weak parts with an industry-standard **movement ledger + derived balance**.

Decisions already made by the project owner:

- Relations between records use the **integer `id`**, strictly (not UUID). A record's own `uuid` is only used to address it in URLs (`/entity/view|edit|delete/{uuid}`).
- Code style: single-line, no `any`, API calls only through `src/api/*Api.ts`, React Hook Form, skeleton loaders (see `CLAUDE.md`).

### Recommended path in one view

1. **Foundation** — ledger, balances, `StockService`, units, permissions, check script.
2. **Add items to a warehouse** — stock entry (opening / receipt), warehouse "Stock" section, history, CSV import.
3. **Corrections** — adjustment, reversal, reconcile command.
4. **GRN** posts stock (and transfers when a source warehouse is set).
5. **Outbound and vans** — load / unload transfers, delivery / invoice withdrawal with availability checks.
6. **Reports** — stock summary and ledger.

Rule for every phase: ship only when its check script, `tsc`, ESLint and build pass; do not start the next phase on a failing ledger check.

---

## 2. What the web research says (best practice)

| Topic | Practice | Source |
| --- | --- | --- |
| Data model | Append-only **movement ledger** is the record of truth; on-hand quantity is a **derived balance** per item and warehouse. Balances can be rebuilt from movements, never the reverse. | [estoqerp ledger issue](https://github.com/noor-hidayat/estoqerp/issues/18), [HLD inventory design](https://programmingappliedai.substack.com/p/hld-design-inventory-management-system), [OneUptime MySQL schema](https://oneuptime.com/blog/post/2026-03-31-mysql-design-schema-for-inventory-system/view) |
| ERP reference | ERPNext: documents (Stock Entry, Purchase Receipt) write Stock Ledger Entries; opening stock is a *Material Receipt* into a target warehouse. Odoo: counts are applied as stock moves, not direct edits. | [ERPNext Stock Entry](https://docs.frappe.io/erpnext/stock-entry), [ERPNext Opening Stock](https://docs.erpnext.com/docs/v13/user/manual/en/stock/opening-stock), [Odoo adjustments](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/warehouses_storage/inventory_management/count_products.html) |
| Opening stock | Load only after item master data is complete. | [ERP stock adjustment guide](https://www.erpag.com/news/stock-adjustment) |
| Corrections | Fix a wrong receipt by **reversing** it, not by plugging an adjustment. Adjustments need a reason and approval thresholds. | [ERP stock adjustment guide](https://www.erpag.com/news/stock-adjustment), [OneBusiness stocktaking](https://onebusinesserp.com/best-practices-for-stocktaking/) |
| Concurrency | Lock the balance row (`lockForUpdate`) inside a transaction, check, then write. Add `CHECK (qty >= 0)` as a backstop (MySQL 8.0.16+). Make posting idempotent. | [Laravel pessimistic locking](https://ohansyah.medium.com/handling-race-conditions-in-laravel-pessimistic-locking-d88086433154), [Backpack: race conditions](https://backpackforlaravel.com/articles/tutorials/4-ways-to-prevent-race-conditions-in-laravel) |
| Van sales | Each van is its own stock location. Loading and unloading are **transfers** between depot warehouse and van, reconciled at end of day. | [Distributo van sales](https://distributo.com/van-sales), [RouteMagic van sales](https://www.routemagic.app/solutions/van-sales/) |

---

## 3. What the legacy `nfpc` project does (and where it falls short)

Location: `/Users/rudransh/Documents/Hardik/nfpc` (Laravel, legacy `App\Model\*`, controllers in `app/Http/Controllers/Api`).

### 3.1 Stock model in nfpc

| Table / model | Role |
| --- | --- |
| `warehouses` | `depot_id`, `route_id`, `parent_warehouse_id`. Depot warehouse has `route_id = null`; a **van warehouse** has a `route_id` and a parent. |
| `warehouse_details` (`WarehouseDetail`) | Balance row per **(warehouse, item, UOM)**: `qty`, `batch` (string). |
| `warehouse_detail_logs` (`WarehouseDetailLog`) | Log: `qty`, `action_type` ("Load, Unload, Return…"). |
| `storage_locations` + `storagelocation_details` | Second stock level used by load/unload/invoice/credit note (`loc_type = 1`). |
| `stock_adjustments` + details | Header (`Draft` → `Adjustment`) with lines `available_qty`, `new_qty`, `adjusted_qty`. |
| `van_to_van_transfer` + details | Transfer between two routes' warehouses. |
| `good_receipt_notes` | Has source/destination warehouse; its stock-posting code is **commented out**. |
| `batches` | `batch_number`, dates, `current_in_stock`, `stock_out_sequence` (FIFO-style). |

### 3.2 How nfpc moves stock

- **Add item to warehouse** — `WarehousedetailController@store`: adds to the existing (warehouse, item, UOM) row or creates it; if the warehouse is a **child (van)**, it subtracts the same quantity from the **parent** warehouse.
- **Stock adjustment** — `StockAdjustmentController`: `qty = qty - adjusted_qty` when status becomes `Adjustment`; deleting reverses; `getquantity` sums rows for availability.
- **Delivery** — `DeliveryController` (~line 385): checks the depot warehouse has the item, converts a lower-unit quantity with `lower_unit_item_upc` / `item_main_prices.item_upc`, errors with "Item is out of stock".
- **Salesman Load** — `SalesmanLoadController` (~line 244): moves stock **depot storage location → route storage location** after `qtyConversion()`; errors "Item is out of stock / not available".
- **Salesman Unload / Credit Note / Load Request / Invoice** — same pattern, reverse direction (unload, credit note add back; invoice subtracts from the route location).
- **Van-to-van transfer** — subtract from source warehouse, add to destination, write two log rows.

### 3.3 Weaknesses to avoid (verified in the nfpc code)

1. **Log is overwritten, not appended** — `WarehousedetailController@store` loads the *first* log row for the balance and sets its `qty`; history is lost.
2. **No locking** — read-then-write on `qty`, so two simultaneous requests can oversell.
3. **Inverted check** — the secondary-UOM branch in `DeliveryController` errors when `warehouse_detail->qty > total_qty` (i.e. when stock is *sufficient*). Other branches use `>` where `>=` is correct.
4. **Parent decrement has no guard** — adding to a van warehouse reads the parent's row without a null check and can go negative.
5. **Two parallel stock levels** (`warehouse_details` vs `storagelocation_details`) that can drift apart; documents use different ones.
6. **One row per UOM** — the same item is split over several rows; availability needs summing and ad-hoc conversion (`qtyConversion` divides by `item_upc` to express stock in the secondary UOM, producing fractions).
7. **Duplicated conversion/availability code** copied across controllers instead of one service.

### 3.4 Fit with Final Retail today

- `warehouses` already has `depot_id`, `route_id`, `parent_warehouse_id`, `is_main`, `loc_type` — the same tree as nfpc, so **vans can be child warehouses** exactly as in nfpc.
- `good_receipt_notes` has `source_warehouse_id` / `destination_warehouse_id`; `salesman_loads/unloads`, `orders`, `deliveries`, `invoices`, `credit_notes` carry `warehouse_id`.
- `items.lower_unit_uom_id` + `lower_unit_item_upc` and `item_main_prices.item_upc` give the unit conversion. Final Retail multiplies: a pack with `upc = 12` is 12 lower units.
- There is **no `storage_locations` table** in the new schema and `vans` has no warehouse link yet.
- `CodeSettingService` already generates document numbers (`consumeNext`, `isManual`).

---

## 4. Target design

### 4.1 Principles

1. **One stock level**: the warehouse. No separate storage-location stock. Vans are child warehouses (parent = depot warehouse), like nfpc.
2. **One writer**: a single `StockService` is the only code allowed to change stock. Controllers and documents never touch quantities directly.
3. **Ledger first**: every change is an append-only `stock_movements` row; `stock_balances` is updated in the same transaction.
4. **One unit**: quantities are stored in the item's **base unit** (lower unit). Pack entries convert with `qty × item_upc`; display converts back.
5. **No negative stock** by default, with an organisation setting to allow it.
6. **Reverse, never edit**: a mistake is fixed by a reversal movement (linked to the original), not by changing history.

### 4.2 Tables (integer FKs; `uuid` only for URLs)

`stock_balances`
- `id`, `uuid`, `organisation_id`, `warehouse_id`, `item_id`, `on_hand_qty decimal(18,3)` (base unit), timestamps
- unique `(organisation_id, warehouse_id, item_id)`; **no `CHECK (on_hand_qty >= 0)`** — an organisation may allow negative stock (`organisations.allow_negative_stock`), so `StockService` enforces the rule under the row lock and `stock:reconcile` (phase 3) detects drift

`stock_movements` (append-only; no updates or soft deletes)
- `id`, `uuid`, `organisation_id`, `warehouse_id`, `item_id`
- `movement_type`: `opening | receipt | adjustment | transfer_in | transfer_out | load | unload | sale | return | reversal`
- `qty_delta decimal(18,3)` (signed, base unit), `balance_after decimal(18,3)`
- `entered_qty`, `entered_uom_id`, `upc_used` (what the user typed, for display/audit)
- `source_type`, `source_id` (the document), `source_line_id` — which document caused it
- `reversal_of_id` nullable (→ `stock_movements.id`)
- `idempotency_key` unique (e.g. `grn:{id}:line:{id}:post`)
- `reason_id` nullable, `remark`, `created_by`, `occurred_at`, `created_at`
- indexes `(warehouse_id, item_id, occurred_at)`, `(source_type, source_id)`

`stock_entries` + `stock_entry_lines` (the "add items to warehouse" document)
- Header: `uuid`, `organisation_id`, `entry_number` (code setting `stock_entry`), `entry_type` (`opening | receipt | adjustment`), `warehouse_id`, `entry_date`, `reason_id`, `remark`, `status` (`Draft | Posted | Reversed`), `posted_at`, `posted_by`
- Line: `item_id`, `item_uom_id`, `qty` (as entered), `base_qty`, and for adjustments `system_qty`, `counted_qty`, `difference_qty`
- Draft is editable; **Posted** writes movements and becomes read-only; **Reverse** writes opposite movements and marks it `Reversed`.

Later (not phase 1): `batch_id` / expiry on balances and movements if FMCG expiry tracking is required (nfpc has a `batches` table to reuse as a model).

### 4.3 `StockService` (the only writer)

```
post(warehouseId, itemId, deltaBase, type, source, idempotencyKey, reason?, remark?)
transfer(fromWarehouseId, toWarehouseId, itemId, qtyBase, source, key)   // two linked movements, one transaction
reverse(movementIds | source)                                               // writes opposite movements
available(warehouseId, itemId): decimal
```

Inside one `DB::transaction`:
1. `idempotency_key` already used → return the existing result (safe retries).
2. Lock the balance row (`lockForUpdate`; create it first if missing).
3. If `delta < 0` and the result would be `< 0` and negative stock is not allowed → throw `InsufficientStock` (422 with item name and available quantity).
4. Insert the movement with `balance_after`; update the balance.
5. Transfers lock both rows **in a fixed order (lowest `warehouse_id` first)** to avoid deadlocks.
6. Balance rows are **read-and-locked first and inserted only when missing**. Inserting over an existing row takes a shared lock, and two concurrent writers then deadlock (found by the concurrency check). The transaction also retries up to 3 times if the database picks it as a deadlock victim.

Unit conversion helper: `StockUnits::toBase(item, uomId, qty)` using `item_main_prices.item_upc` (lower unit → 1); the reverse for display. One implementation, used everywhere (replaces nfpc's copied helpers).

### 4.4 Van warehouses

- A van warehouse is a `warehouses` row with `route_id` set and `parent_warehouse_id` = the depot warehouse (matches nfpc and the existing columns).
- **Load** = `transfer(depot warehouse → van warehouse)`; **Unload** = reverse transfer, with fresh stock returning to the depot and damaged/expired lines recorded as `unload` movements flagged by `unload_type` (Final Retail's `salesman_unload_details.unload_type` already has `fresh | damage | expired`).
- Open question: whether each `vans` row or each **route** owns the van warehouse (nfpc keys it by route). See section 8.

### 4.5 Document integration (what moves stock)

| Document | Effect | Phase |
| --- | --- | --- |
| Stock Entry (opening / receipt) | `+` to its warehouse | 2 |
| Stock Entry (adjustment) | `±` difference to counted quantity | 3 |
| GRN | `+` destination warehouse; if a source warehouse is set, a transfer | 4 |
| Salesman Load | transfer depot → van | 5 |
| Salesman Unload | transfer van → depot (fresh) / write-off (damage, expired) | 5 |
| Delivery (and Invoice when not preceded by a delivery) | `−` from the document's warehouse; availability check on save | 5 |
| Credit Note (return) | `+` back, only when goods are physically returned | 5 |

Posting happens when the document reaches its "confirmed" state; edit/delete/cancel posts a **reversal**, then a new posting for an edit. Each document must declare exactly which state posts, to avoid double posting.

---

## 5. API (follows the existing `/entity/action` pattern)

| Route | Purpose |
| --- | --- |
| `GET stock/list` | Balances. Filters: `warehouse_id`, `item_id`, `search`, `per_page`. Includes item code/name, base UOM, on-hand in base and in the item's pack UOM. |
| `GET stock/movements` | Ledger for a warehouse and/or item with running balance. |
| `GET stock/available` | Quantity available for `(warehouse_id, item_id)`, used by document forms. |
| `GET stock-entry/list`, `GET stock-entry/view/{uuid}` | Entries. |
| `POST stock-entry/add`, `POST stock-entry/edit/{uuid}` | Create / edit a Draft. |
| `POST stock-entry/post/{uuid}` | Post a Draft. |
| `POST stock-entry/reverse/{uuid}` | Reverse a Posted entry. |
| `DELETE stock-entry/delete/{uuid}` | Delete a Draft only. |

Permissions: new `stock` and `stock-entry` modules in `RolePermissionSeeder` (`view`, `create`, `edit`, `delete`, plus `stock-entry.post`). Requests validate `warehouseId` / `itemId` / `itemUomId` as integers that exist in the user's organisation and are not soft-deleted. Responses never include a raw `organisation_id`; related records are returned as integer id plus name.

---

## 6. Frontend

Follows the project rules (React Hook Form, `src/api/*Api.ts`, TanStack Query hooks, skeletons, `dark:` variants, toasts).

1. **Warehouse view drawer — "Stock" section**: table of items in this warehouse (code, name, on-hand with pack breakdown, last movement), search, skeleton loading, "Add stock" button (permission gated). Lives next to the existing sections in `settingViews.ts` / the warehouse view.
2. **"Add stock" drawer** (`StockEntryAdd`): entry type (Opening / Receipt), date, remark, and a multi-line item table — item select, UOM (base or any assigned UOM), quantity, live "= N base units". Draft save and Post. Errors from the server shown per line.
3. **Stock Adjustment drawer**: pick items, shows system quantity, enter counted quantity, shows difference, reason required.
4. **Movement history drawer**: per item in a warehouse, running balance, link to the source document.
5. **Document forms** (phase 5): show "Available: N" next to each line (via `stock/available`) and block save with the server's `InsufficientStock` message.
6. **Cache**: stock writes invalidate `stock-*` query keys and call the existing `invalidateRecordViews`.
7. **Files**: `src/api/StockApi.ts`, `src/types/Stock.ts`, `src/hooks/Stock/useStock.ts`, `src/pages/Settings/Warehouse/StockSection.tsx`, `StockEntryAdd.tsx`, `StockAdjustmentAdd.tsx`, `StockMovementsDrawer.tsx`.

---

## 7. Phases

### Phase 1 — Foundation (backend) — DONE
- Migrations: `stock_balances`, `stock_movements`, `stock_entries`, `stock_entry_lines`; `CHECK` constraint; indexes.
- Models, `StockService`, `StockUnits`, `InsufficientStock` exception, code setting `stock_entry`, permissions.
- Organisation setting `allow_negative_stock` (default off).
- Built: migrations `2026_10_08_100000_create_stock_tables`, `2026_10_08_100010_seed_stock_permissions`; models `StockBalance`, `StockMovement` (append-only), `StockEntry`, `StockEntryLine`; `App\Services\Stock\StockService`; `App\Exceptions\InsufficientStock`; `stock_entry` code setting; `RolePermissionSeeder` now upserts. Unit conversion reuses `PdpResolutionService::lowerUnitQty` (no new class).
- Check script `tests/checks/stock_check.php` (24 checks incl. two real concurrent processes) (rolled-back transaction): post/receipt, UOM conversion, insufficient stock, idempotent retry, reversal, transfer both directions, **two concurrent withdrawals** cannot overdraw, balance equals sum of movements.

### Phase 2 — Add items to a warehouse (the original request) — DONE
- Stock Entry API for `opening` and `receipt`; `stock/list`, `stock/movements`.
- Frontend: warehouse "Stock" section, "Add stock" drawer, movement history.
- Opening-stock CSV import (item code, UOM, quantity) for loading many items at once. **Not built yet** — moved to phase 3 with the legacy import.
- Built: `StockEntryController` / `StockController`, `StockEntryRepository` / `StockRepository`, requests/resources, routes `stock/list`, `stock/movements`, `stock-entry/{list,view,add,edit,post,delete}`; `item/with-stock` now returns real balances. Item options (`item/all`) also carry integer `itemId` and per-UOM `itemUomId`. Frontend: `StockApi.ts`, `useStock.ts`, `WarehouseStockTab` (a **Stock** tab on the warehouse view via the new `extraTabs` prop of `SettingViewDrawer`), `StockEntryAdd`, `StockMovementsDrawer`. "Add stock" saves and posts in one step; Drafts exist in the API but have no screen yet.
- Checks: `tests/checks/stock_entry_check.php` (35 checks).

### Phase 3 — Corrections — DONE
- Adjustment entries (count up/down, reason required, optional approval threshold), reverse a posted entry.
- Reconcile command `php artisan stock:reconcile` comparing every balance with its ledger sum.
- Built: `POST stock-entry/reverse/{uuid}` (all-or-nothing; refused when its stock was already used; needs `stock-entry.edit`); adjustment entries (`entryType=adjustment`, reason required, counted quantity, zero allowed, difference computed under the row lock at posting via `StockService::adjustTo`); `stock:reconcile [--organisation=]` (reports balances that differ from the ledger, movements without a balance row, negative balances where not allowed; exit 1 on problems); `POST stock-entry/import` CSV opening stock (`item_code,uom_code,quantity`, dry run first, any bad row rejects the file, duplicate rows added up in base units); `stock:import-legacy {file} --organisation= [--apply] [--force]` (CSV `warehouse_code,item_code,uom_code,quantity` exported from nfpc `warehouse_details`; report-only without `--apply`; refuses a warehouse that already has stock without `--force`). Migration `2026_10_08_110000_add_reversal_to_stock_entries`.
- Frontend: on the warehouse **Stock** tab — **Entries** (post / delete a Draft, reverse a Posted entry), **Import CSV** (check file, then import), **Adjust stock** (live system quantity and difference), **Add stock**.
- Checks: `tests/checks/stock_correction_check.php` (40 checks).

### Phase 4 — GRN posting — DONE
- Post on GRN create (destination `+`, source `−` if present); reversal on edit/delete/cancel.
- Block the GRN when the source warehouse lacks stock.
- Built: `App\Services\Stock\GrnStock` (post / reverse); `GoodReceiptNoteRepository` posts on create, reverses then re-posts on edit, reverses on delete (single and bulk), all in one transaction. A GRN with a destination only = receipt; source + destination = transfer; no destination = no stock effect; source must differ from destination. Deactivating a GRN (status flag) does not touch stock. Migration `good_receipt_notes.tracks_stock` (default false): only GRNs created from now on move stock — older GRNs are never back-posted. Frontend: stock views refresh after any write (`recordCache`). Check: `tests/checks/grn_stock_check.php` (19 checks).

### Phase 5 — Outbound and van flow — DONE (Credit Note deferred)
- Salesman Load / Unload transfers, Delivery and Invoice withdrawal with availability check, Credit Note return.
- Availability shown in the document forms; one place decides which state posts.
- **Decisions taken for phase 5:** the app has no approve/confirm step for any document (stage is only set at creation), so documents post **when saved** and are taken back on edit / delete, like the GRN (the trigger moves to "approved" once an approval step exists). Van warehouses are **created automatically** on a route's first load.
- Built: `Services\Stock\DocumentStock` (Load, Unload, Delivery, Invoice), `VanWarehouses`, `StockService::reverseSource`; migration `tracks_stock` on `salesman_loads`, `salesman_unloads`, `deliveries`, `invoices` (older documents are never back-posted or reversed). Load: depot warehouse → route's van once confirmed (text UOM matched to the item's UOMs, else base); a load/unload with no route uses the salesman's own route. Unload: fresh → van to depot; damage/expired → written off the van; a route with no van warehouse yet (no tracked load) moves nothing, and once the van has one an unload larger than its stock is refused. Delivery: out of its warehouse (no warehouse = no stock effect). Invoice: out of its warehouse unless it comes from a delivery. `GET stock/availability` (uuid-based, for the forms) and a **"In stock / Only N …"** hint under each Delivery and Invoice line; the Invoice form gained an optional Warehouse field. Check: `tests/checks/document_stock_check.php` (38 checks).
- **Not done — Credit Note:** credit notes have no warehouse and no flag saying goods came back, so where returned stock goes is undecided (needs a warehouse field and a "returned goods" marker on the form).

### Phase 6 — Reports
- Stock summary (warehouse × item), stock ledger with running balance, low-stock list, stock value only if costing is added later.

Each phase ends with: check script passing, `npx tsc -b`, ESLint on touched files, `npx vite build`, and a note in `docs/record-view-network-check.md` for any new list.

---

## 8. Decisions (confirmed by the owner)

| # | Question | Decision | Why |
| --- | --- | --- | --- |
| 1 | First delivery | **Phases 1–3**: add stock, corrections, reversal, reconcile. GRN next, outbound after. | Gives a usable, correct stock screen quickly; documents are wired only once the ledger is proven. |
| 2 | Negative stock | **Blocked**; organisation setting `allow_negative_stock` to relax. | FMCG distributors need trustworthy availability; legacy `nfpc` let it go negative. |
| 3 | Van stock owner | **One child warehouse per route** (parent = depot warehouse). | Same as `nfpc`, so legacy data maps cleanly; a route outlives a van (vans get swapped). |
| 4 | Batch / expiry | **Not now**; add `batch_id` later. | Keeps phases small; the schema leaves room. |
| 5 | Costing / value | **Quantity only.** | No cost data exists in the item master to value stock reliably. |
| 6 | Legacy balances | **Import** `warehouse_details` and `storagelocation_details` as opening stock via CSV; secondary-UOM quantity × `item_upc` to base. | Avoids re-keying stock; one-time, reviewable. |
| 7 | Which state withdraws stock | **Delivery on Approved**; Invoice only when it has no delivery; Credit Note only when goods return. | Matches the existing document stages and avoids double withdrawal. |

## 9. Risks and mitigations

- **Double posting** (edit, retry, two documents for one movement): idempotency keys per document line; the document layer is the only caller.
- **Existing documents have no stock history**: start from an opening-stock entry per warehouse; do not back-post old documents.
- **UOM rounding**: store base quantities with 3 decimals; reject quantities that are not whole base units unless the item allows fractions.
- **Deadlocks on transfers**: always lock the lower `warehouse_id` first.
- **Performance**: balances are one row per warehouse and item; the ledger is read only for history and reconciliation.
- **Scope creep from batch/expiry and costing**: kept out of phases 1–6 deliberately.

---

## 10. Verification

- Backend: `tests/checks/stock_check.php` (rolled-back transaction) plus the existing checks (`document_number_check`, `delivery_from_order_check`, `user_profiles_check`) to confirm no regression.
- Concurrency: a check that fires two withdrawals of the same stock and asserts one fails and the balance never goes below zero.
- Frontend: `npx tsc -b`, `npx eslint` on touched files, `npx vite build`, and a manual pass in the browser: create warehouse → add opening stock → see balance → post a delivery → see balance fall and the movement appear.

---

## 11. Sources

- [HLD: Design Inventory management System](https://programmingappliedai.substack.com/p/hld-design-inventory-management-system)
- [estoqerp: Inventory Stock Ledger issue](https://github.com/noor-hidayat/estoqerp/issues/18)
- [How to Design a Schema for an Inventory System in MySQL](https://oneuptime.com/blog/post/2026-03-31-mysql-design-schema-for-inventory-system/view)
- [ERPNext Stock Entry](https://docs.frappe.io/erpnext/stock-entry)
- [ERPNext Opening Stock](https://docs.erpnext.com/docs/v13/user/manual/en/stock/opening-stock)
- [Odoo 19 inventory adjustments](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/warehouses_storage/inventory_management/count_products.html)
- [Stock Adjustment: How & When to Use It](https://www.erpag.com/news/stock-adjustment)
- [Best Practices for Stocktaking](https://onebusinesserp.com/best-practices-for-stocktaking/)
- [Handling Race Conditions in Laravel: Pessimistic Locking](https://ohansyah.medium.com/handling-race-conditions-in-laravel-pessimistic-locking-d88086433154)
- [4 Ways To Prevent Race Conditions in Laravel](https://backpackforlaravel.com/articles/tutorials/4-ways-to-prevent-race-conditions-in-laravel)
- [Distributo van sales](https://distributo.com/van-sales)
- [RouteMagic van sales](https://www.routemagic.app/solutions/van-sales/)
- Legacy code read for this plan: `nfpc/app/Http/Controllers/Api/{WarehousedetailController,WarehouseController,StockAdjustmentController,DeliveryController,SalesmanLoadController,SalesmanUnloadController,VantovanTransferController,GoodreceiptnoteController}.php`, `nfpc/app/Model/{Warehouse,WarehouseDetail,WarehouseDetailLog,StoragelocationDetail,StockAdjustment}.php`, `nfpc/app/Library/helper.php` (`qtyConversion`), and the matching migrations.
