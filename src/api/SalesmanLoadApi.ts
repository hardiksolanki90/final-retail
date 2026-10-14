import axiosInstance from '../lib/axios';
import type { SalesmanLoadView } from '../types/DocumentView';
import type { SalesmanLoadFormData } from '../types/SalesmanLoad';

/** One row of GET /salesman-load/list (SalesmanLoadList). */
export interface SalesmanLoadListRow {
  uuid: string;
  date?: string | null;
  trip?: number | null;
  loadPeriodNumber: string;
  orderNumber?: string | null;
  salesman?: string | null;
  salesmanCode?: string | null;
  status: 'Confirm' | 'Pending';
}

export const getSalesmanLoadList = async (page: number = 1, searchTerm?: string, perPage: number = 10) => {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (searchTerm) params.append('search', searchTerm);
  const payload = (await axiosInstance.get(`/salesman-load/list?${params.toString()}`)).data;
  return { data: (payload.salesmanLoads ?? []) as SalesmanLoadListRow[], total: Number(payload.total ?? 0), currentPage: payload.currentPage ?? page, lastPage: payload.lastPage ?? 1 };
};

export const getSalesmanLoadByUuid = async (uuid: string): Promise<SalesmanLoadView> => (await axiosInstance.get(`/salesman-load/edit/${uuid}`)).data.data;

export const createSalesmanLoad = async (data: SalesmanLoadFormData): Promise<SalesmanLoadView> => (await axiosInstance.post('/salesman-load/add', data)).data.data;

export const updateSalesmanLoad = async (uuid: string, data: SalesmanLoadFormData): Promise<SalesmanLoadView> => (await axiosInstance.post(`/salesman-load/edit/${uuid}`, data)).data.data;

export const bulkActionSalesmanLoads = async (uuids: string[], action: 'activate' | 'deactivate' | 'delete'): Promise<void> => {
  await axiosInstance.post('/salesman-load/bulk-action', { uuids, action });
};
