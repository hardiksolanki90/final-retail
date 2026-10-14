# Record view — network check

How to check: DevTools → Network → filter `Fetch/XHR`, leave "Disable cache" unticked. Cache lifetime is 5 min (details 2 min), no refetch on window focus.

## What each view should send

| Screen | Open from the list | Pick another record in the left list | Reopen the same record |
| --- | --- | --- | --- |
| Customer | `customer/edit/{uuid}` (Profile) — no list call when the page is on page 1 with no search / filter (the left list reuses the page's rows); otherwise also rail page 1. Transactions / Ledger / Item Wise only when that tab is opened | `customer/edit/{uuid}` only (nothing if hovered first or fresh) | nothing |
| Item | one detail call — no list call when the page is on page 1 with no search / filter; otherwise also rail page 1 | one detail call | nothing |
| Salesman | one detail call — no list call when the Salesman page's plain first page (no search / filter) is still in the cache; otherwise also rail page 1 | one detail call | nothing |
| Journey Plan | one detail call (header shows at once) — no list call when the Journey Plan page's first page is still in the cache; otherwise also rail page 1 | one detail call | nothing |
| Pricing / Promotion / Discount | one detail call — no list call when the page is on page 1 with no search; otherwise also rail page 1 | one detail call | nothing |
| Order, Delivery, Invoice | `…/details/{uuid}` — no list call when the page is on page 1 with no search / status / date filter; otherwise also rail page 1 | one details call | nothing |
| Credit / Debit Note, GRN, Salesman Load / Unload | one detail call — no list call when the page is on page 1 with no search; otherwise also rail page 1 | one detail call | nothing |
| Settings screens (Brand, Area, Bank, Item UOM … plus Pallet, Surveys, Users, Roles, Work-flow) | no list call when the page is on page 1 with no search / filter (otherwise rail page 1), plus a detail call **only** when the list row lacks a shown field (e.g. description, logo) | none, or one detail call for rows that lack a field | nothing |
| Customer → Transactions → open a document | the document's detail call | one detail call | nothing |

## Prefetch (Customer + the 8 documents)

- Hover a left-list card ~120 ms → its detail call fires in the background; clicking it then sends nothing.
- ↑ / ↓ → opens the next record and warms the one after it.
- Settings, Item, Salesman, Journey Plan and rules have no prefetch (their list row already shows most fields).

## After a change (save / delete / status change)

- Open record views refetch their left list and details; closed ones just go stale and refetch next time they show.
- Order / Delivery / Invoice / notes / GRN / loads: the customer's Transactions, Ledger and Item Wise tabs refetch too.
- Pallet create clears the same caches.

## Seeded left list

- Every record view except documents opened from a customer's Transactions: the left list starts from the page's own first page and uses the page's page size, so scrolling to page 2 asks for `page=2&per_page=<page size>`.
- A save / delete / status change clears it; the next open fetches it.
- Salesman and Journey Plan are separate routes, so they read the list page's cached first page instead of getting the rows passed in. It is used only if it is still cached (about 5 min after leaving the list) and not cleared by a save; an older one is shown and refreshed in the background. A direct link has no cached page, so it fetches page 1.

## Things that are expected, not bugs

- Search typing: one rail call per 300 ms pause.
- Credit Limit, Driver Replacement, Merchandiser Replacement: search box has no effect (their APIs have no search).
- Direct link to a Journey Plan / Salesman view (no list row): placeholder until the one detail call returns.
- Failed 4xx is not retried; 5xx / network errors retry up to 2 times.
