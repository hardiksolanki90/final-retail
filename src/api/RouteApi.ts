import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';

export interface RouteListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getRouteList = async (page = 1, perPage = 15, searchTerm?: string): Promise<RouteListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/route/list?${params.toString()}`);
  return response.data;
};

export const createRoute = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/route/add', data);
  showToast.success('Route created successfully');
  return response.data;
};

export const updateRoute = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/route/edit/${uuid}`, data);
  showToast.success('Route updated successfully');
  return response.data;
};

export const deleteRoute = async (uuid: string) => {
  await axiosInstance.delete(`/route/delete/${uuid}`);
  showToast.success('Route deleted successfully');
};

export const getRouteOptions = async (): Promise<{ value: number; label: string }[]> => {
  const response = await axiosInstance.get('/route/all');
  return (response.data?.data ?? []).map((r: { id: number; code?: string; name?: string }) => ({
    value: r.id,
    label: r.code ? `${r.code} - ${r.name ?? ''}` : (r.name ?? String(r.id)),
  }));
};
