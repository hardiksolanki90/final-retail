import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSalesmanUnloadList, createSalesmanUnload, bulkActionSalesmanUnloads } from '../../api/SalesmanUnloadApi';
import { getAllSalesmen } from '../../api/SalesmanApi';
import { getAllItems } from '../../api/ItemApi';
import { getRouteOptions } from '../../api/RouteApi';
import { getVanOptions } from '../../api/VanApi';
import { getWarehouseAll } from '../../api/WarehouseApi';
import { getReasonOptions } from '../../api/ReasonApi';
import { showToast } from '../../lib/toast';
import type { SalesmanUnloadFormData } from '../../types/SalesmanUnload';

export function useSalesmanUnloads(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['salesman-unloads', page, searchTerm],
    queryFn: () => getSalesmanUnloadList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      bulkActionSalesmanUnloads(uuids, action),
    onSuccess: () => {
      showToast.success('Salesman unloads updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['salesman-unloads'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update salesman unloads');
    },
  });

  return {
    unloads: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    bulkAction: bulkActionMutation.mutate,
  };
}

export function useSalesmanUnloadFormOptions() {
  const salesmenQuery = useQuery({
    queryKey: ['salesman-unload-salesmen'],
    queryFn: () => getAllSalesmen(),
    staleTime: 5 * 60 * 1000,
  });

  const itemsQuery = useQuery({
    queryKey: ['salesman-unload-items'],
    queryFn: () => getAllItems(),
    staleTime: 5 * 60 * 1000,
  });

  const routesQuery = useQuery({
    queryKey: ['salesman-unload-routes'],
    queryFn: () => getRouteOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const vansQuery = useQuery({
    queryKey: ['salesman-unload-vans'],
    queryFn: () => getVanOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const warehousesQuery = useQuery({
    queryKey: ['salesman-unload-warehouses'],
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

  const reasonsQuery = useQuery({
    queryKey: ['salesman-unload-reasons'],
    queryFn: () => getReasonOptions(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    // salesman_id is a straight FK to users, so the option value must be the
    // salesman's underlying userId, not SalesmanInfo's own uuid.
    salesmen: (salesmenQuery.data ?? []).map((s) => ({ value: String(s.userId), label: s.name })),
    items: itemsQuery.data ?? [],
    routes: (routesQuery.data ?? []).map((r) => ({ value: String(r.value), label: r.label })),
    vans: (vansQuery.data ?? []).map((v) => ({ value: String(v.value), label: v.label })),
    warehouses: warehousesQuery.data ?? [],
    reasons: reasonsQuery.data ?? [],
    isLoading:
      salesmenQuery.isLoading || itemsQuery.isLoading || routesQuery.isLoading ||
      vansQuery.isLoading || warehousesQuery.isLoading || reasonsQuery.isLoading,
  };
}

export function useSalesmanUnloadMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: SalesmanUnloadFormData) => createSalesmanUnload(data),
    onSuccess: () => {
      showToast.success('Salesman unload created successfully!');
      queryClient.invalidateQueries({ queryKey: ['salesman-unloads'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create salesman unload');
    },
  });

  return { createMutation };
}
