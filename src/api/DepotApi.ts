import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface DepotListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getDepotList = async (page = 1, perPage = 15, searchTerm?: string): Promise<DepotListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/depot/list?${params.toString()}`);
  return response.data;
};

export const createDepot = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/depot/add', data);
  showToast.success('Depot created successfully');
  return response.data;
};

export const updateDepot = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/depot/edit/${uuid}`, data);
  showToast.success('Depot updated successfully');
  return response.data;
};

export const deleteDepot = async (uuid: string) => {
  await axiosInstance.delete(`/depot/delete/${uuid}`);
  showToast.success('Depot deleted successfully');
};

export const getDepotOptions = async (): Promise<{ value: number; label: string }[]> => {
  const response = await axiosInstance.get('/depot/all');
  return (response.data?.data ?? []).map((d: { id: number; depotCode: string; depotName: string }) => ({
    value: d.id,
    label: `${d.depotCode} - ${d.depotName}`,
  }));
};
