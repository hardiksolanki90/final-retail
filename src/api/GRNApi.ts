import axiosInstance from '../lib/axios';
import type { GRN, GRNFormData, GRNListResponse } from '../types/GRN';

export const getGRNList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<GRNListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/grn/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.goodReceiptNotes ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const getGRNByUuid = async (uuid: string): Promise<GRN> => {
  const response = await axiosInstance.get(`/grn/edit/${uuid}`);
  return response.data.data;
};

export const createGRN = async (data: GRNFormData): Promise<GRN> => {
  const response = await axiosInstance.post('/grn/add', data);
  return response.data.data;
};

export const updateGRN = async (uuid: string, data: GRNFormData): Promise<GRN> => {
  const response = await axiosInstance.post(`/grn/edit/${uuid}`, data);
  return response.data.data;
};

export const deleteGRN = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/grn/delete', { id: uuid });
};

export const bulkActionGRN = async (
  uuids: string[],
  action: 'activate' | 'deactivate' | 'delete',
): Promise<void> => {
  await axiosInstance.post('/grn/bulk-action', { uuids, action });
};
