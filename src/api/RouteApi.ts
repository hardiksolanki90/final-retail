import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type RouteListResponse = NormalizedListResponse<any>;

export const getRouteList = async (
  page = 1,
  perPage = 15,
  searchTerm?: string,
  areaId?: number | string,
  depotId?: number | string
): Promise<RouteListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  if (areaId) params.append('area_id', areaId.toString());
  if (depotId) params.append('depot_id', depotId.toString());
  const response = await axiosInstance.get(`/route/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'routes', perPage);
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

export const getRouteOptions = async (
  areaId?: number | string,
  depotId?: number | string
): Promise<{ value: number; label: string }[]> => {
  const params = new URLSearchParams();
  params.append('per_page', '50');
  if (areaId) params.append('area_id', areaId.toString());
  if (depotId) params.append('depot_id', depotId.toString());
  const response = await axiosInstance.get(`/route/all?${params.toString()}`);
  return (response.data?.routes ?? []).map((r: { id: number; code?: string; routeName?: string }) => ({
    value: r.id,
    label: r.code ? `${r.code} - ${r.routeName ?? ''}` : (r.routeName ?? String(r.id)),
  }));
};
