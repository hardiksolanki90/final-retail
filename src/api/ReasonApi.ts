import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type ReasonListResponse = NormalizedListResponse<any>;

export const getReasonList = async (page = 1, perPage = 15, searchTerm?: string, typeFilter?: string): Promise<ReasonListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  if (typeFilter) params.append('type', typeFilter);
  const response = await axiosInstance.get(`/reason-type/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'reasonTypes', perPage);
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
  const response = await axiosInstance.get('/reason-type/all?per_page=50');
  const data = response.data?.reasonTypes ?? [];
  return data.map((r: { id: number; name?: string }) => ({ value: r.id, label: r.name || '' }));
};
