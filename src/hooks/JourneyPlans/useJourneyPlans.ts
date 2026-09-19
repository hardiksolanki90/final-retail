import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJourneyPlanList,
  createJourneyPlan,
  updateJourneyPlan,
  bulkActionJourneyPlans,
} from '../../api/JourneyPlanApi';
import { getAllSalesmen } from '../../api/SalesmanApi';
import { getAllCustomers } from '../../api/CustomerApi';
import { showToast } from '../../lib/toast';
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

/** Select-option data needed by the Journey Plan Add form. */
export function useJourneyPlanFormOptions() {
  const merchandisersQuery = useQuery({
    queryKey: ['journey-plan-merchandisers'],
    queryFn: () => getAllSalesmen(),
    staleTime: 5 * 60 * 1000,
  });

  const customersQuery = useQuery({
    queryKey: ['journey-plan-customers'],
    queryFn: () => getAllCustomers(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    // Journey plans link merchandiser_id to the users table directly, so the
    // option value must be the salesman's underlying userId, not the
    // SalesmanInfo row's own uuid.
    merchandisers: (merchandisersQuery.data ?? []).map((s) => ({ value: String(s.userId), label: s.name })),
    customers: customersQuery.data ?? [],
    isLoading: merchandisersQuery.isLoading || customersQuery.isLoading,
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
