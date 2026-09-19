import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type RegionListResponse = NormalizedListResponse<any>;

export const getRegionList = async (page = 1, perPage = 15, searchTerm?: string): Promise<RegionListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/region/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'regions', perPage);
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

export interface RegionOption { value: number; label: string; }

export const getRegionOptions = async (): Promise<RegionOption[]> => {
  const response = await axiosInstance.get('/region/all');
  const data = response.data?.data ?? [];
  return data.map((r: { id: number; regionCode?: string; regionName?: string }) => ({
    value: r.id,
    label: r.regionCode ? `${r.regionCode} - ${r.regionName ?? ''}` : (r.regionName ?? String(r.id)),
  }));
};
