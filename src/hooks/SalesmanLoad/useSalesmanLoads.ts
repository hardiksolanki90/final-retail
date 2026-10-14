import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSalesmanLoadList, bulkActionSalesmanLoads, createSalesmanLoad, updateSalesmanLoad } from '../../api/SalesmanLoadApi';
import { getAllSalesmen } from '../../api/SalesmanApi';
import { getAllItems, getItemsWithStock } from '../../api/ItemApi';
import { getRouteOptions } from '../../api/RouteApi';
import type { SalesmanLoadFormData } from '../../types/SalesmanLoad';
import { showToast } from '../../lib/toast';

export function useSalesmanLoads(page: number = 1, perPage: number = 10, searchTerm: string = '') {
    const queryClient = useQueryClient();

    const listQuery = useQuery({ queryKey: ['salesman-loads', page, perPage, searchTerm], queryFn: () => getSalesmanLoadList(page, searchTerm, perPage), staleTime: 2 * 60 * 1000 });

    const bulkActionMutation = useMutation({
        mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) => bulkActionSalesmanLoads(uuids, action),
        onSuccess: () => {
            showToast.success('Salesman loads updated');
            queryClient.invalidateQueries({ queryKey: ['salesman-loads'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => showToast.error(error.response?.data?.message || 'Failed to update salesman loads'),
    });

    const createMutation = useMutation({
        mutationFn: (data: SalesmanLoadFormData) => createSalesmanLoad(data),
        onSuccess: () => {
            showToast.success('Salesman load created');
            queryClient.invalidateQueries({ queryKey: ['salesman-loads'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => showToast.error(error.response?.data?.message || 'Failed to create salesman load'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ uuid, data }: { uuid: string; data: SalesmanLoadFormData }) => updateSalesmanLoad(uuid, data),
        onSuccess: () => {
            showToast.success('Salesman load updated');
            queryClient.invalidateQueries({ queryKey: ['salesman-loads'] });
            queryClient.invalidateQueries({ queryKey: ['salesman-load-detail'] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => showToast.error(error.response?.data?.message || 'Failed to update salesman load'),
    });

    return {
        loads: listQuery.data?.data ?? [],
        total: listQuery.data?.total ?? 0,
        isLoading: listQuery.isLoading,
        bulkAction: bulkActionMutation.mutate,
        createLoad: createMutation.mutateAsync,
        updateLoad: updateMutation.mutateAsync,
        isCreating: createMutation.isPending || updateMutation.isPending,
    };
}

/** Salesman, route, item and on-hand stock for the Add Salesman Load drawer, fetched only while it's open. */
export function useSalesmanLoadFormOptions(enabled: boolean) {
    const salesmenQuery = useQuery({ queryKey: ['salesman-load-salesmen'], queryFn: () => getAllSalesmen(), staleTime: 5 * 60 * 1000, enabled });
    const routesQuery = useQuery({ queryKey: ['salesman-load-routes'], queryFn: () => getRouteOptions(), staleTime: 5 * 60 * 1000, enabled });
    const itemsQuery = useQuery({ queryKey: ['salesman-load-items'], queryFn: () => getAllItems(), staleTime: 5 * 60 * 1000, enabled });
    const stockQuery = useQuery({ queryKey: ['salesman-load-stock'], queryFn: () => getItemsWithStock(), staleTime: 15 * 1000, enabled });

    const stockByItem: Record<string, number> = {};
    for (const item of stockQuery.data ?? []) {
        if (item.uuid) stockByItem[item.uuid] = Number(item.stock) || 0;
    }

    return {
        // Documents reference the salesman's user, by uuid.
        salesman: (salesmenQuery.data ?? []).map((s) => ({ value: s.userUuid ?? String(s.userId), label: s.salesmanCode ? `${s.salesmanCode} - ${s.name}` : s.name })),
        routes: (routesQuery.data ?? []).map((r) => ({ value: r.uuid, label: r.label })),
        items: itemsQuery.data ?? [],
        stockByItem,
    };
}
