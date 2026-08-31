import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface BankListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getBankList = async (page = 1, perPage = 15, searchTerm?: string): Promise<BankListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/bank/list?${params.toString()}`);
  return response.data;
};

export const createBank = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/bank/add', data);
  showToast.success('Bank created successfully');
  return response.data;
};

export const updateBank = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/bank/edit/${uuid}`, data);
  showToast.success('Bank updated successfully');
  return response.data;
};

export const deleteBank = async (uuid: string) => {
  await axiosInstance.post('/bank/delete', { id: uuid });
  showToast.success('Bank deleted successfully');
};
