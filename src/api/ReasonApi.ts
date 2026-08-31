import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface ReasonListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getReasonList = async (page = 1, perPage = 15, searchTerm?: string): Promise<ReasonListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/reason-type/list?${params.toString()}`);
  return response.data;
};

export const createReason = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/reason-type/add', data);
  showToast.success('Reason created successfully');
  return response.data;
};

export const updateReason = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/reason-type/edit/${uuid}`, data);
  showToast.success('Reason updated successfully');
  return response.data;
};

export const deleteReason = async (uuid: string) => {
  await axiosInstance.delete(`/reason-type/delete/${uuid}`);
  showToast.success('Reason deleted successfully');
};

export interface ReasonOption { value: number; label: string; }

export const getReasonOptions = async (): Promise<ReasonOption[]> => {
  const response = await axiosInstance.get('/reason-type/all');
  const data = response.data.data || response.data || [];
  return data.map((r: { id: number; name?: string }) => ({ value: r.id, label: r.name || '' }));
};
