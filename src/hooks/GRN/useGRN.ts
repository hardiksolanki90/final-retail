import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGRNList,
  createGRN,
  updateGRN,
  bulkActionGRN,
} from '../../api/GRNApi';
import { getWarehouseAll } from '../../api/WarehouseApi';
import { getAllItems } from '../../api/ItemApi';
import { getReasonOptions } from '../../api/ReasonApi';
import { showToast } from '../../lib/toast';
import type { GRNFormData } from '../../types/GRN';

export function useGRN(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['grn', page, searchTerm],
    queryFn: () => getGRNList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      bulkActionGRN(uuids, action),
    onSuccess: () => {
      showToast.success('GRNs updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['grn'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update GRNs');
    },
  });

  return {
    grns: listQuery.data?.data ?? [],
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

/** Select-option data needed by the GRN Add form. */
export function useGRNFormOptions() {
  const warehousesQuery = useQuery({
    queryKey: ['grn-warehouses'],
    // WarehouseRepository::toSelectOption returns {id, uuid, code, name} —
    // not the {value, label} shape used elsewhere — so map it explicitly.
    queryFn: async () => {
      const rows = (await getWarehouseAll()).data ?? [];
      return rows.map((w: { uuid: string; code?: string; name?: string }) => ({
        value: w.uuid,
        label: w.code ? `${w.code} - ${w.name ?? ''}` : (w.name ?? w.uuid),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const itemsQuery = useQuery({
    queryKey: ['grn-items'],
    queryFn: () => getAllItems(),
    staleTime: 5 * 60 * 1000,
  });

  const reasonsQuery = useQuery({
    queryKey: ['grn-reasons'],
    queryFn: () => getReasonOptions(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    warehouses: warehousesQuery.data ?? [],
    items: itemsQuery.data ?? [],
    reasons: reasonsQuery.data ?? [],
    isLoading: warehousesQuery.isLoading || itemsQuery.isLoading || reasonsQuery.isLoading,
  };
}

export function useGRNMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: GRNFormData) => createGRN(data),
    onSuccess: () => {
      showToast.success('GRN created successfully!');
      queryClient.invalidateQueries({ queryKey: ['grn'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create GRN');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: GRNFormData }) => updateGRN(uuid, data),
    onSuccess: () => {
      showToast.success('GRN updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['grn'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update GRN');
    },
  });

  return { createMutation, updateMutation };
}
