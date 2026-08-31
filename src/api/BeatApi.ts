import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { BeatListResponse } from '../types/Beat';

export const getBeatList = async (
  page = 1,
  perPage = 15,
  searchTerm?: string
): Promise<BeatListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/area/list?${params.toString()}`);
  return response.data;
};

export const getBeatAll = async (searchTerm?: string) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/area/all?${params.toString()}`);
  return response.data; // {data: [{id, uuid, areaName, name}], message}
};

export const createBeat = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/area/add', data);
  showToast.success('Area created successfully');
  return response.data;
};

export const updateBeat = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/area/edit/${uuid}`, data);
  showToast.success('Area updated successfully');
  return response.data;
};

export const deleteBeat = async (uuid: string) => {
  await axiosInstance.post('/area/delete', { id: uuid });
  showToast.success('Area deleted successfully');
};
