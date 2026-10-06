import { useQuery, type QueryClient } from '@tanstack/react-query';

/** How long one record's details count as fresh — reopening inside this window sends no request. */
export const DETAIL_STALE_MS = 2 * 60 * 1000;

/** Cache key prefix for an entity's single-record details, e.g. detailKey('brand') → 'brand-detail'. */
export const detailKey = (entity: string) => `${entity}-detail`;

/**
 * One record's full details through the query cache (no uuid = nothing selected, no request).
 * No refetch on window focus, so a form being edited is never replaced mid-typing.
 * Invalidate with `queryClient.invalidateQueries({ queryKey: [detailKey(entity)] })` after a save.
 */
export function useEntityDetail<T>(entity: string, fetcher: (uuid: string) => Promise<T>, uuid: string | null | undefined) {
    return useQuery({ queryKey: [detailKey(entity), uuid ?? null], queryFn: () => fetcher(uuid as string), enabled: Boolean(uuid), staleTime: DETAIL_STALE_MS, refetchOnWindowFocus: false, retry: 1 });
}

/** After a create / update / delete / bulk action: refresh the entity's list and drop its cached details. */
export function invalidateEntity(queryClient: QueryClient, listKey: string, entity: string) {
    return Promise.all([queryClient.invalidateQueries({ queryKey: [listKey] }), queryClient.invalidateQueries({ queryKey: [detailKey(entity)] })]);
}

/**
 * A detail query is "loading" while it has no data yet (including a retry paused because the tab is
 * in the background) or is refetching — so a form is never editable on placeholder data.
 */
export function isDetailLoading(query: { isPending: boolean; isFetching: boolean }, uuid: string | null | undefined) {
    return Boolean(uuid) && (query.isPending || query.isFetching);
}

interface ListRow {
    uuid?: string;
    id?: string | number;
}

/**
 * Edit-drawer data for a clicked list row: the row's full details from the cache, and a
 * loading flag while they are fetched (any fetch, so a form is never swapped under the user).
 * Until the details arrive — or if they can't be loaded — the drawer uses the list row itself,
 * so it is already in edit mode (title, update action) while the loader shows.
 */
export function useEditDetail<T extends object>(entity: string, fetcher: (uuid: string) => Promise<T>, row: (T & ListRow) | null) {
    const uuid = row ? String(row.uuid ?? row.id ?? '') || null : null;
    const query = useEntityDetail(entity, fetcher, uuid);

    return {
        initialData: (query.data ?? row) as T | null,
        isLoading: isDetailLoading(query, uuid),
        /** The details couldn't be loaded (and nothing is retrying). */
        failed: Boolean(uuid) && query.isError && !query.isFetching,
    };
}
