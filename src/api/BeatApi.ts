import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { BeatListResponse } from '../types/Beat';
import { unwrapPaginated } from '../lib/paginatedResponse';

export interface BeatOption {
  value: number;
  label: string;
}

export const getBeatList = async (
  page = 1,
  perPage = 15,
  searchTerm?: string,
  areaId?: number | string
): Promise<BeatListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  if (areaId) params.append('area_id', areaId.toString());
  const response = await axiosInstance.get(`/beat/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'beats', perPage);
};

export const getBeatAll = async (searchTerm?: string, areaId?: number | string) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (areaId) params.append('area_id', areaId.toString());
  const response = await axiosInstance.get(`/beat/all?${params.toString()}`);
  return response.data; // {data: [{id, uuid, beatCode, code, beatName, name}], message}
};

export const createBeat = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/beat/add', data);
  showToast.success('Beat created successfully');
  return response.data;
};

export const updateBeat = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/beat/edit/${uuid}`, data);
  showToast.success('Beat updated successfully');
  return response.data;
};

export const deleteBeat = async (uuid: string) => {
  await axiosInstance.delete(`/beat/delete/${uuid}`);
  showToast.success('Beat deleted successfully');
};

export const getBeatOptions = async (areaId?: number | string): Promise<BeatOption[]> => {
  const params = new URLSearchParams();
  if (areaId) params.append('area_id', areaId.toString());
  const response = await axiosInstance.get(`/beat/all?${params.toString()}`);
  const data = response.data?.data ?? [];
  return data.map((b: { id: number; beatCode?: string; code?: string; beatName?: string; name?: string }) => ({
    value: b.id,
    label: (b.beatCode ?? b.code)
      ? `${b.beatCode ?? b.code} - ${b.beatName ?? b.name ?? ''}`
      : (b.beatName ?? b.name ?? String(b.id)),
  }));
};
