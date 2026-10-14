import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStockEntry, getStockAvailability, getStockItemOptions, getStockList, getStockMovements, getStockSettings, importStockCsv, setStock, updateStockSettings, type StockListParams } from '../../api/StockApi';
import { showToast } from '../../lib/toast';
import type { StockEntryPayload } from '../../types/Stock';

const STOCK_LIST_KEY = 'stock-list';
const STOCK_MOVEMENTS_KEY = 'stock-movements';

type ApiError = { response?: { data?: { message?: string } } };
const errorToast = (fallback: string) => (error: ApiError) => showToast.error(error.response?.data?.message || fallback);

/** A warehouse's balances, one page at a time. Idle until a warehouse is given. */
export function useWarehouseStock(params: StockListParams) {
  return useQuery({ queryKey: [STOCK_LIST_KEY, params], queryFn: () => getStockList(params), enabled: params.warehouseId !== undefined, placeholderData: keepPreviousData });
}

export function useStockMovements(params: StockListParams, enabled: boolean) {
  return useQuery({ queryKey: [STOCK_MOVEMENTS_KEY, params], queryFn: () => getStockMovements(params), enabled, placeholderData: keepPreviousData });
}

/** Availability of one document line; idle until a warehouse and an item are chosen. */
export function useLineAvailability(params: { warehouse?: string; item?: string; uom?: string; quantity: number }) {
  const { warehouse, item, uom, quantity } = params;
  return useQuery({ queryKey: ['stock-availability', warehouse, item, uom, quantity], queryFn: () => getStockAvailability({ warehouse: warehouse as string, item: item as string, uom: uom || undefined, quantity }), enabled: Boolean(warehouse && item), staleTime: 15 * 1000, placeholderData: keepPreviousData });
}

/** The organisation's stock rules (whether stock may go below zero). */
export function useStockSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['stock-settings'], queryFn: getStockSettings, staleTime: 5 * 60 * 1000 });
  const update = useMutation({
    mutationFn: updateStockSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(['stock-settings'], settings);
      void queryClient.invalidateQueries({ queryKey: [STOCK_LIST_KEY] });
      showToast.success('Stock setting saved');
    },
    onError: errorToast('Failed to save the stock setting'),
  });
  return { settings: query.data, isLoading: query.isLoading, update };
}

/** Everything that shows stock goes stale after any stock write. */
function useRefreshStock() {
  const queryClient = useQueryClient();
  return () => [STOCK_LIST_KEY, STOCK_MOVEMENTS_KEY, 'items-with-stock'].forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
}

/** Books opening stock or a receipt of several items into a warehouse. */
export function useAddStock() {
  const refresh = useRefreshStock();
  return useMutation({
    mutationFn: (payload: StockEntryPayload) => createStockEntry(payload),
    onSuccess: () => {
      showToast.success('Stock added to the warehouse');
      refresh();
    },
    onError: errorToast('Failed to save the stock entry'),
  });
}

/** The UOMs one item can be counted in (base first), for the edit drawer. */
export function useStockItemUoms(itemId: number | null, itemCode: string | null, enabled: boolean) {
  return useQuery({ queryKey: ['stock-item-uoms', itemId], queryFn: async () => (await getStockItemOptions(1, itemCode ?? undefined)).data.find((option) => option.value === String(itemId))?.uoms ?? [], enabled: enabled && itemId !== null, staleTime: 5 * 60 * 1000 });
}

/** Edit (new quantity) or delete (quantity 0) one item's stock in a warehouse. */
export function useSetStock() {
  const refresh = useRefreshStock();
  return useMutation({
    mutationFn: setStock,
    onSuccess: (_data, payload) => {
      showToast.success(payload.quantity > 0 ? 'Stock updated' : 'Stock removed');
      refresh();
    },
    onError: errorToast('Failed to update the stock'),
  });
}

/** "Check file" (dry run) and "Import" for the opening-stock CSV. Errors are left to the caller, which lists the file's row problems. */
export function useImportStock() {
  const refresh = useRefreshStock();
  return {
    check: useMutation({ mutationFn: (args: { warehouseId: number; entryDate: string; file: File }) => importStockCsv({ ...args, dryRun: true }) }),
    run: useMutation({
      mutationFn: (args: { warehouseId: number; entryDate: string; file: File }) => importStockCsv({ ...args, dryRun: false }),
      onSuccess: () => {
        showToast.success('Opening stock imported');
        refresh();
      },
    }),
  };
}
