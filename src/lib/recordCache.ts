import type { QueryClient } from '@tanstack/react-query';

/** Cache roots of the record view: the left-hand lists and the extra detail fetched for a record the list row can't fully show. */
export const RAIL_KEY = 'record-rail';
export const RECORD_DETAIL_KEY = 'record-detail';

/** Detail caches that aren't named `<entity>-detail` (order / delivery / invoice keep theirs in their providers), the customer's activity tabs, and the stock views (balances, history, entries) — every document write can change those. */
const DOCUMENT_KEYS = ['order-details', 'delivery-details', 'invoice-details', 'customer-transactions', 'customer-ledger', 'customer-item-report', 'stock-list', 'stock-movements', 'stock-availability', 'items-with-stock'];

/** After any change, drop what the record views cached so their lists and details are fetched fresh the next time they show. */
export const invalidateRecordViews = (queryClient: QueryClient) =>
  Promise.all([RAIL_KEY, RECORD_DETAIL_KEY, ...DOCUMENT_KEYS].map((key) => queryClient.invalidateQueries({ queryKey: [key] })).concat(queryClient.invalidateQueries({ predicate: ({ queryKey: [root] }) => typeof root === 'string' && root.endsWith('-detail') })));

/** The newest usable cached first page of a list the page itself loaded (root key + a match on the rest of the key), with when it arrived: for a view on its own route, which can't be handed the page's rows. Null when nothing is cached or it was invalidated. */
export function cachedFirstPage<R>(queryClient: QueryClient, root: string, match: (key: readonly unknown[]) => boolean) {
  const hit = queryClient.getQueryCache().findAll({ queryKey: [root] }).filter((q) => match(q.queryKey) && q.state.data !== undefined && !q.state.isInvalidated).sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)[0];
  return hit ? { key: hit.queryKey, data: hit.state.data as R, updatedAt: hit.state.dataUpdatedAt } : null;
}
