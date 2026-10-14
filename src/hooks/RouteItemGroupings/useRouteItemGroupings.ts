import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRouteItemGrouping, deleteRouteItemGrouping, deleteRouteItemGroupings, getRouteItemGrouping, getRouteItemGroupings, updateRouteItemGrouping } from '../../api/RouteItemGroupingApi';
import { showToast } from '../../lib/toast';
import type { RouteItemGroupingListParams, RouteItemGroupingPayload } from '../../types/RouteItemGrouping';

const LIST_KEY = 'route-item-groupings';
const DETAIL_KEY = 'route-item-grouping-detail';

type ApiError = { response?: { data?: { message?: string } } };
const errorToast = (fallback: string) => (error: ApiError) => showToast.error(error.response?.data?.message || fallback);

/** One page of groups; the previous page stays on screen while the next one loads. */
export function useRouteItemGroupings(params: RouteItemGroupingListParams) {
  return useQuery({ queryKey: [LIST_KEY, params], queryFn: () => getRouteItemGroupings(params), placeholderData: keepPreviousData });
}

/** One group with its items; idle until a uuid is given. */
export function useRouteItemGrouping(uuid: string | null) {
  return useQuery({ queryKey: [DETAIL_KEY, uuid], queryFn: () => getRouteItemGrouping(uuid as string), enabled: Boolean(uuid) });
}

/** The lists and the open group go stale after any write. */
function useRefresh() {
  const queryClient = useQueryClient();
  return () => [LIST_KEY, DETAIL_KEY].forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
}

export function useRouteItemGroupingActions() {
  const refresh = useRefresh();
  const done = (message: string) => () => {
    showToast.success(message);
    refresh();
  };
  return {
    create: useMutation({ mutationFn: (payload: RouteItemGroupingPayload) => createRouteItemGrouping(payload), onSuccess: done('Route item grouping created'), onError: errorToast('Failed to create the route item grouping') }),
    update: useMutation({ mutationFn: ({ uuid, payload }: { uuid: string; payload: RouteItemGroupingPayload }) => updateRouteItemGrouping(uuid, payload), onSuccess: done('Route item grouping updated'), onError: errorToast('Failed to update the route item grouping') }),
    remove: useMutation({ mutationFn: deleteRouteItemGrouping, onSuccess: done('Route item grouping deleted'), onError: errorToast('Failed to delete the route item grouping') }),
    removeMany: useMutation({ mutationFn: deleteRouteItemGroupings, onSuccess: done('Route item groupings deleted'), onError: errorToast('Failed to delete the route item groupings') }),
  };
}
