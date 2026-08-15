import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface TaxListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getTaxList = async (page = 1, perPage = 15, searchTerm?: string): Promise<TaxListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/tax-rate/list?${params.toString()}`);
  return response.data;
};

export const createTax = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/tax-rate/add', data);
  showToast.success('Tax created successfully');
  return response.data;
};

export const updateTax = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/tax-rate/edit/${uuid}`, data);
  showToast.success('Tax updated successfully');
  return response.data;
};

export const deleteTax = async (uuid: string) => {
  await axiosInstance.delete(`/tax-rate/delete/${uuid}`);
  showToast.success('Tax deleted successfully');
};
