import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface ZoneListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getZoneList = async (page = 1, perPage = 15, searchTerm?: string): Promise<ZoneListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/area/list?${params.toString()}`);
  return response.data;
};

export const createZone = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/area/add', data);
  showToast.success('Zone created successfully');
  return response.data;
};

export const updateZone = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/area/edit/${uuid}`, data);
  showToast.success('Zone updated successfully');
  return response.data;
};

export const deleteZone = async (uuid: string) => {
  await axiosInstance.delete(`/area/delete/${uuid}`);
  showToast.success('Zone deleted successfully');
};
