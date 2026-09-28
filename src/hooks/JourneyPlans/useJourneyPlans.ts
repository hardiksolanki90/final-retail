import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJourneyPlanList,
  createJourneyPlan,
  updateJourneyPlan,
  bulkActionJourneyPlans,
} from '../../api/JourneyPlanApi';
import { getSalesmanOptions } from '../../api/SalesmanApi';
import { getCustomerOptions } from '../../api/CustomerApi';
import { showToast } from '../../lib/toast';
import { useInfiniteSelect } from '../useInfiniteSelect';
import type { JourneyPlanFullFormData } from '../../types/JourneyPlan';

export function useJourneyPlans(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['journey-plans', page, searchTerm],
    queryFn: () => getJourneyPlanList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      bulkActionJourneyPlans(uuids, action),
    onSuccess: () => {
      showToast.success('Journey plans updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['journey-plans'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update journey plans');
    },
  });

  return {
    journeyPlans: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    currentPage: listQuery.data?.currentPage ?? page,
    lastPage: listQuery.data?.lastPage ?? 1,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    bulkAction: bulkActionMutation.mutate,
    isBulkActing: bulkActionMutation.isPending,
  };
}

/**
 * Salesman + customer select-option data needed by the Journey Plan Add
 * form. Customers are fetched here (mounted for the whole Add flow, not
 * just the Customers tab) so picking a salesman on the Schedule step fires
 * the customer fetch immediately — not deferred until the Customers tab's
 * "Add Customer" modal happens to be opened.
 */
export function useJourneyPlanFormOptions(salesmanId?: number) {
  // Journey plans link salesmanId to the users table directly, so the option
  // value must be the salesman's underlying userId, not the SalesmanInfo
  // row's own uuid. Paginated + searchable so orgs with more than one page
  // of salesman see all of them, not just the first `per_page`.
  const merchandiserSelect = useInfiniteSelect({
    fetchPage: async (page, search) => {
      const res = await getSalesmanOptions(page, search);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (s: any) => ({ value: String(s.userId), label: s.name }),
  });

  // resetKey: salesmanId re-fetches page 1 the moment a salesman is picked
  // (or changed), so the request fires right away instead of waiting for
  // the Customers tab's modal to be opened. Once scoped to one salesman the
  // result set is small (their own customer base), so fetch it in one shot
  // instead of paginating — only the unfiltered "no salesman yet" case
  // (potentially every customer in the org) keeps a bounded page size.
  const customerSelect = useInfiniteSelect({
    resetKey: salesmanId,
    fetchPage: async (page, search) => {
      const perPage = salesmanId ? 1000 : 25;
      const res = await getCustomerOptions(page, search, perPage, salesmanId ? { salesmanId } : undefined);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (c) => ({ value: c.value, label: c.label, code: c.code }),
  });

  return {
    merchandisers: merchandiserSelect.options,
    merchandisersLoading: merchandiserSelect.isLoading,
    merchandisersLoadingMore: merchandiserSelect.isLoadingMore,
    merchandisersHasMore: merchandiserSelect.hasMore,
    onMerchandisersLoadMore: merchandiserSelect.onLoadMore,
    onMerchandisersSearchChange: merchandiserSelect.onSearchChange,
    customers: customerSelect.options,
    customersLoading: customerSelect.isLoading,
    customersLoadingMore: customerSelect.isLoadingMore,
    customersHasMore: customerSelect.hasMore,
    onCustomersLoadMore: customerSelect.onLoadMore,
    onCustomersSearchChange: customerSelect.onSearchChange,
  };
}

export function useJourneyPlanMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: JourneyPlanFullFormData) => createJourneyPlan(data),
    onSuccess: () => {
      showToast.success('Journey plan created successfully!');
      queryClient.invalidateQueries({ queryKey: ['journey-plans'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create journey plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: JourneyPlanFullFormData }) => updateJourneyPlan(uuid, data),
    onSuccess: () => {
      showToast.success('Journey plan updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['journey-plans'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update journey plan');
    },
  });

  return { createMutation, updateMutation };
}
