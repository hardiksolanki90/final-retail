import axiosInstance from '../lib/axios';
import type { SalesmanUnload, SalesmanUnloadFormData, SalesmanUnloadListResponse } from '../types/SalesmanUnload';

export const getSalesmanUnloadList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<SalesmanUnloadListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/salesman-unload/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.salesmanUnloads ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const createSalesmanUnload = async (data: SalesmanUnloadFormData): Promise<SalesmanUnload> => {
  const response = await axiosInstance.post('/salesman-unload/add', data);
  return response.data.data;
};

export const bulkActionSalesmanUnloads = async (
  uuids: string[],
  action: 'activate' | 'deactivate' | 'delete',
): Promise<void> => {
  await axiosInstance.post('/salesman-unload/bulk-action', { uuids, action });
};
