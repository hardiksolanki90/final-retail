import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPalletList } from '../../api/PalletApi';
import { getAllSalesmen } from '../../api/SalesmanApi';
import { getAllItems } from '../../api/ItemApi';
import { getWarehouseAll } from '../../api/WarehouseApi';
import { getAllDivisions } from '../../api/DivisionApi';

export function usePallets(page: number = 1) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['pallets', page],
    queryFn: () => getPalletList(page),
    staleTime: 2 * 60 * 1000,
  });

  return {
    pallets: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['pallets'] }),
  };
}

export function usePalletFormOptions() {
  const salesmenQuery = useQuery({
    queryKey: ['pallet-salesmen'],
    queryFn: () => getAllSalesmen(),
    staleTime: 5 * 60 * 1000,
  });

  const itemsQuery = useQuery({
    queryKey: ['pallet-items'],
    queryFn: () => getAllItems(),
    staleTime: 5 * 60 * 1000,
  });

  const warehousesQuery = useQuery({
    queryKey: ['pallet-warehouses'],
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

  const divisionsQuery = useQuery({
    queryKey: ['pallet-divisions'],
    queryFn: () => getAllDivisions(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    // pallets.salesman_id is a straight FK to users, so the option value
    // must be the salesman's underlying userId, not SalesmanInfo's own uuid.
    salesmen: (salesmenQuery.data ?? []).map((s) => ({ value: String(s.userId), label: s.name })),
    items: itemsQuery.data ?? [],
    warehouses: warehousesQuery.data ?? [],
    divisions: divisionsQuery.data ?? [],
    isLoading: salesmenQuery.isLoading || itemsQuery.isLoading || warehousesQuery.isLoading || divisionsQuery.isLoading,
  };
}
