import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface CurrencyListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getCurrencyList = async (page = 1, perPage = 15, searchTerm?: string): Promise<CurrencyListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/currency/list?${params.toString()}`);
  return response.data;
};

export const createCurrency = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/currency/add', data);
  showToast.success('Currency created successfully');
  return response.data;
};

export const updateCurrency = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/currency/edit/${uuid}`, data);
  showToast.success('Currency updated successfully');
  return response.data;
};

export const deleteCurrency = async (uuid: string) => {
  await axiosInstance.delete(`/currency/delete/${uuid}`);
  showToast.success('Currency deleted successfully');
};
