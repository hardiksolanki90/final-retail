import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type DepotListResponse = NormalizedListResponse<any>;

export const getDepotList = async (
  page = 1,
  perPage = 15,
  searchTerm?: string,
  regionId?: number | string,
  areaId?: number | string
): Promise<DepotListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  if (regionId) params.append('region_id', regionId.toString());
  if (areaId) params.append('area_id', areaId.toString());
  const response = await axiosInstance.get(`/depot/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'depots', perPage);
};

export const createDepot = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/depot/add', data);
  showToast.success('Depot created successfully');
  return response.data;
};

export const updateDepot = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/depot/edit/${uuid}`, data);
  showToast.success('Depot updated successfully');
  return response.data;
};

export const deleteDepot = async (uuid: string) => {
  await axiosInstance.delete(`/depot/delete/${uuid}`);
  showToast.success('Depot deleted successfully');
};

export const getDepotOptions = async (
  regionId?: number | string,
  areaId?: number | string
): Promise<{ value: number; label: string }[]> => {
  const params = new URLSearchParams();
  if (regionId) params.append('region_id', regionId.toString());
  if (areaId) params.append('area_id', areaId.toString());
  const response = await axiosInstance.get(`/depot/all?${params.toString()}`);
  return (response.data?.data ?? []).map((d: { id: number; depotCode: string; depotName: string }) => ({
    value: d.id,
    label: `${d.depotCode} - ${d.depotName}`,
  }));
};
