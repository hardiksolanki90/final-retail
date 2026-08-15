import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface RegionListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getRegionList = async (page = 1, perPage = 15, searchTerm?: string): Promise<RegionListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/region/list?${params.toString()}`);
  return response.data;
};

export const createRegion = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/region/add', data);
  showToast.success('Region created successfully');
  return response.data;
};

export const updateRegion = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/region/edit/${uuid}`, data);
  showToast.success('Region updated successfully');
  return response.data;
};

export const deleteRegion = async (uuid: string) => {
  await axiosInstance.delete(`/region/delete/${uuid}`);
  showToast.success('Region deleted successfully');
};
