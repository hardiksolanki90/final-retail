import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { MerchandiserReplacement, MerchandiserReplacementFormData } from '../types/MerchandiserReplacement';

export interface MerchandiserReplacementListResponse {
  data: MerchandiserReplacement[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; has_more_pages?: boolean; };
  message?: string;
}

export interface MerchandiserReplacementFilters {
  old_salesman_id?: number;
  new_salesman_id?: number;
}

export const getMerchandiserReplacementList = async (
  page = 1,
  perPage = 15,
  filters?: MerchandiserReplacementFilters
): Promise<MerchandiserReplacementListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (filters?.old_salesman_id) params.append('old_salesman_id', filters.old_salesman_id.toString());
  if (filters?.new_salesman_id) params.append('new_salesman_id', filters.new_salesman_id.toString());
  const response = await axiosInstance.get(`/merchandiser-replacement/list?${params.toString()}`);
  return response.data;
};

export const createMerchandiserReplacement = async (data: MerchandiserReplacementFormData) => {
  const response = await axiosInstance.post('/merchandiser-replacement/add', data);
  showToast.success('Merchandiser replacement created successfully');
  return response.data;
};

export const updateMerchandiserReplacement = async (uuid: string, data: MerchandiserReplacementFormData) => {
  const response = await axiosInstance.post(`/merchandiser-replacement/edit/${uuid}`, data);
  showToast.success('Merchandiser replacement updated successfully');
  return response.data;
};

export const deleteMerchandiserReplacement = async (uuid: string) => {
  await axiosInstance.delete(`/merchandiser-replacement/delete/${uuid}`);
  showToast.success('Merchandiser replacement deleted successfully');
};
