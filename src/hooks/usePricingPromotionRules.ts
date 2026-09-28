import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi, promotionApi, discountApi } from '../api/PricingPromotionApi';
import { getCustomerOptions } from '../api/CustomerApi';
import { getAllItemGroups } from '../api/ItemGroupApi';
import { getAllItems } from '../api/ItemApi';
import { getAllItemUoms } from '../api/ItemUomApi';
import { showToast } from '../lib/toast';
import type { RuleFormData, RuleType } from '../types/PricingPromoDiscount';

const LABELS: Record<RuleType, string> = {
  pricing: 'Pricing rule',
  promotion: 'Promotion',
  discount: 'Discount',
};

function apiFor(type: RuleType) {
  if (type === 'pricing') return pricingApi;
  if (type === 'promotion') return promotionApi;
  return discountApi;
}

export function useRules(type: RuleType, page: number = 1, searchTerm: string = '') {
  const api = apiFor(type);
  const queryClient = useQueryClient();
  const queryKey = [`${type}-rules`];

  const listQuery = useQuery({
    queryKey: [...queryKey, page, searchTerm],
    queryFn: () => api.getList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      api.bulkAction(uuids, action),
    onSuccess: () => {
      showToast.success(`${LABELS[type]}s updated successfully!`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || `Failed to update ${LABELS[type].toLowerCase()}s`);
    },
  });

  return {
    rules: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    currentPage: listQuery.data?.currentPage ?? page,
    lastPage: listQuery.data?.lastPage ?? 1,
    isLoading: listQuery.isLoading,
    bulkAction: bulkActionMutation.mutate,
  };
}

export function useRuleMutations(type: RuleType) {
  const api = apiFor(type);
  const queryClient = useQueryClient();
  const queryKey = [`${type}-rules`];

  const createMutation = useMutation({
    mutationFn: (data: RuleFormData) => api.create(data),
    onSuccess: () => {
      showToast.success(`${LABELS[type]} created successfully!`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || `Failed to create ${LABELS[type].toLowerCase()}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: RuleFormData }) => api.update(uuid, data),
    onSuccess: () => {
      showToast.success(`${LABELS[type]} updated successfully!`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || `Failed to update ${LABELS[type].toLowerCase()}`);
    },
  });

  return { createMutation, updateMutation };
}

/** Select-option data needed by the Add/Edit wizard, shared by all 3 modules. */
export function useRuleFormOptions() {
  const customersQuery = useQuery({
    queryKey: ['rule-customers'],
    // Bounded page instead of an unpaginated fetch-everything — this wizard
    // doesn't have a searchable customer picker yet, so no infinite-scroll
    // wiring here; just cap the request size.
    queryFn: async () => (await getCustomerOptions(1, undefined, 200)).data,
    staleTime: 5 * 60 * 1000,
  });

  const itemGroupsQuery = useQuery({
    queryKey: ['rule-item-groups'],
    queryFn: () => getAllItemGroups(),
    staleTime: 5 * 60 * 1000,
  });

  const itemsQuery = useQuery({
    queryKey: ['rule-items'],
    queryFn: () => getAllItems(),
    staleTime: 5 * 60 * 1000,
  });

  const uomsQuery = useQuery({
    queryKey: ['rule-item-uoms'],
    queryFn: () => getAllItemUoms(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    customers: customersQuery.data ?? [],
    itemGroups: (itemGroupsQuery.data ?? []) as { value: string; label: string }[],
    items: itemsQuery.data ?? [],
    itemUoms: uomsQuery.data ?? [],
    isLoading:
      customersQuery.isLoading || itemGroupsQuery.isLoading || itemsQuery.isLoading || uomsQuery.isLoading,
  };
}
