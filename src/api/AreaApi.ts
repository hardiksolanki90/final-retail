import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { AreaListResponse } from '../types/Area';
import { unwrapPaginated } from '../lib/paginatedResponse';

export interface AreaOption {
  value: number;
  label: string;
}

export const getAreaList = async (
  page = 1,
  perPage = 15,
  searchTerm?: string
): Promise<AreaListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/area/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'areas', perPage);
};

// Backend paginates now (default per_page=20) — this asks for a page big
// enough to cover every area in one call, since the only consumer (Parent
// Area dropdown) still expects the full list.
export const getAreaAll = async (searchTerm?: string) => {
  const params = new URLSearchParams();
  params.append('per_page', '500');
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/area/all?${params.toString()}`);
  return { data: response.data?.areas ?? [], message: response.data?.message };
};

export const createArea = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/area/add', data);
  showToast.success('Area created successfully');
  return response.data;
};

export const updateArea = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/area/edit/${uuid}`, data);
  showToast.success('Area updated successfully');
  return response.data;
};

export const deleteArea = async (uuid: string) => {
  await axiosInstance.delete(`/area/delete/${uuid}`);
  showToast.success('Area deleted successfully');
};

export const getAreaOptions = async (): Promise<AreaOption[]> => {
  const response = await axiosInstance.get('/area/all?per_page=50');
  const data = response.data?.areas ?? [];
  return data.map((a: { id: number; areaCode?: string; code?: string; areaName?: string; name?: string }) => ({
    value: a.id,
    label: (a.areaCode ?? a.code)
      ? `${a.areaCode ?? a.code} - ${a.areaName ?? a.name ?? ''}`
      : (a.areaName ?? a.name ?? String(a.id)),
  }));
};
