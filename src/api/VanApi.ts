import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface VanListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getVanList = async (page = 1, perPage = 15, searchTerm?: string): Promise<VanListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/van/list?${params.toString()}`);
  return response.data;
};

export const createVan = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/van/add', data);
  showToast.success('Van created successfully');
  return response.data;
};

export const updateVan = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/van/edit/${uuid}`, data);
  showToast.success('Van updated successfully');
  return response.data;
};

export const deleteVan = async (uuid: string) => {
  await axiosInstance.delete(`/van/delete/${uuid}`);
  showToast.success('Van deleted successfully');
};

export interface VanOption { value: number; label: string; }

export const getVanOptions = async (): Promise<VanOption[]> => {
  const response = await axiosInstance.get('/van/all');
  const data = response.data.data || response.data || [];
  return data.map((v: { id: number; vanCode?: string; plateNumber?: string }) => ({
    value: v.id,
    label: `${v.vanCode || ''} - ${v.plateNumber || ''}`.replace(/^ - | - $/g, ''),
  }));
};
