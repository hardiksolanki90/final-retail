export interface NormalizedListResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}

/**
 * Backend `list` endpoints now respond via the `paginated()` helper:
 * `{ total, currentPage, nextPage, lastPage, <itemName>: [...] }` — the
 * item array key varies per module. This normalizes that back into the
 * `{ data, meta }` shape every provider/list page already consumes.
 */
export function unwrapPaginated<T>(
  response: any,
  itemName: string,
  requestedPerPage: number
): NormalizedListResponse<T> {
  const items: T[] = Array.isArray(response?.[itemName]) ? response[itemName] : [];
  const currentPage = response?.currentPage ?? 1;
  const lastPage = response?.lastPage ?? 1;
  const total = response?.total ?? items.length;
  const nextPage = response?.nextPage ?? null;

  return {
    data: items,
    meta: {
      current_page: currentPage,
      per_page: requestedPerPage,
      total,
      last_page: lastPage,
      has_more_pages: nextPage !== null,
      next_page_url: nextPage !== null ? String(nextPage) : null,
      prev_page_url: currentPage > 1 ? String(currentPage - 1) : null,
    },
  };
}
