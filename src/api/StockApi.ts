import axiosInstance from '../lib/axios';
import { queryClient } from '../lib/queryClient';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';
import type { StockAvailability, StockBalance, StockEntryPayload, StockImportResult, StockItemOption, StockMovement, StockSetPayload, StockSettings } from '../types/Stock';

export interface StockListParams {
  warehouseId?: number;
  itemId?: number;
  search?: string;
  includeZero?: boolean;
  page?: number;
  perPage?: number;
}

const toParams = (entries: Record<string, string | number | boolean | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(entries).forEach(([key, value]) => value !== undefined && value !== '' && value !== false && params.append(key, String(value)));
  return params.toString();
};

export const getStockList = async ({ warehouseId, itemId, search, includeZero, page = 1, perPage = 15 }: StockListParams): Promise<NormalizedListResponse<StockBalance>> => {
  const query = toParams({ warehouse_id: warehouseId, item_id: itemId, search, include_zero: includeZero, page, per_page: perPage });
  return unwrapPaginated<StockBalance>((await axiosInstance.get(`/stock/list?${query}`)).data, 'stock', perPage);
};

export const getStockMovements = async ({ warehouseId, itemId, page = 1, perPage = 15 }: StockListParams): Promise<NormalizedListResponse<StockMovement>> => {
  const query = toParams({ warehouse_id: warehouseId, item_id: itemId, page, per_page: perPage });
  return unwrapPaginated<StockMovement>((await axiosInstance.get(`/stock/movements?${query}`)).data, 'movements', perPage);
};

/** Books opening stock or a receipt of several items into a warehouse. */
export const createStockEntry = async (payload: StockEntryPayload) => (await axiosInstance.post('/stock-entry/add', payload)).data;

/** Sets what one item holds in a warehouse (edit); quantity 0 removes it (delete). The difference is booked as an adjustment. */
export const setStock = async (payload: StockSetPayload) => (await axiosInstance.post('/stock/set', payload)).data;

/** What a document line needs against what the warehouse holds; the document forms identify warehouse, item and UOM by uuid. */
export const getStockAvailability = async (params: { warehouse: string; item: string; uom?: string; quantity: number }): Promise<StockAvailability> => (await axiosInstance.get(`/stock/availability?${toParams({ ...params })}`)).data.data;

export const getStockSettings = async (): Promise<StockSettings> => (await axiosInstance.get('/stock/settings')).data.data;

export const updateStockSettings = async (settings: Partial<StockSettings>): Promise<StockSettings> => (await axiosInstance.post('/stock/settings', settings)).data.data;

/** Opening stock from a CSV (item_code, uom_code, quantity). With `dryRun` the server only checks the file; a bad row rejects the whole file (422 with `errors.file`). */
export const importStockCsv = async ({ warehouseId, entryDate, file, dryRun }: { warehouseId: number; entryDate: string; file: File; dryRun: boolean }): Promise<StockImportResult | null> => {
  const form = new FormData();
  form.append('file', file);
  form.append('warehouseId', String(warehouseId));
  form.append('entryDate', entryDate);
  form.append('dryRun', dryRun ? '1' : '0');
  const res = (await axiosInstance.post('/stock-entry/import', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  return dryRun ? (res.data as StockImportResult) : null;
};

interface RawItemOption {
  itemId: number;
  label: string;
  code?: string | null;
  uoms?: { itemUomId: number; code?: string; name?: string; isBase: boolean }[];
}

/** One searchable page of items for the stock entry form: values are the items' integer ids, with the UOMs each can be received in (base first). */
export const getStockItemOptions = async (page = 1, search?: string, perPage = 25): Promise<NormalizedListResponse<StockItemOption>> => {
  const url = `/item/all?${toParams({ page, per_page: perPage, search })}`;
  // Every line of the form asks for the same first page: one request, kept for a minute.
  return queryClient.fetchQuery<NormalizedListResponse<StockItemOption>>({
    queryKey: ['stock-item-options', url],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const res = unwrapPaginated<RawItemOption>((await axiosInstance.get(url)).data, 'items', perPage);
      const data = res.data.map((item) => ({
        value: String(item.itemId),
        label: [item.code, item.label].filter(Boolean).join(' - '),
        uoms: (item.uoms ?? []).map((uom) => ({ value: String(uom.itemUomId), label: [uom.code, uom.name].filter(Boolean).join(' - '), isBase: uom.isBase })),
      }));
      return { ...res, data };
    },
  });
};
