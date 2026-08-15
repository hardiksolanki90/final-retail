import axiosInstance from '../lib/axios';
import type {
  Beat,
  BeatFormData,
  BeatListResponse,
  Salesman,
  Area,
  Route,
  Outlet,
} from '../types/Beat';

export const getBeatList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
  areaId?: number,
  routeId?: number
): Promise<BeatListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }
  if (areaId) {
    params.append('area_id', areaId.toString());
  }
  if (routeId) {
    params.append('route_id', routeId.toString());
  }

  const response = await axiosInstance.get(`/beats?${params.toString()}`);
  return response.data;
};

export const getBeatDetails = async (id: number): Promise<Beat> => {
  const response = await axiosInstance.get(`/beats/${id}`);
  return response.data.data || response.data;
};

export const createBeat = async (beatData: BeatFormData): Promise<Beat> => {
  const response = await axiosInstance.post('/beats/create', beatData);
  return response.data.data || response.data;
};

export const updateBeat = async (
  id: number,
  beatData: BeatFormData
): Promise<Beat> => {
  const response = await axiosInstance.put('/beats/update', { id, ...beatData });
  return response.data.data || response.data;
};

export const deleteBeat = async (id: number): Promise<void> => {
  await axiosInstance.post('/beats/delete', { id });
};

export const getSalesmenList = async (): Promise<Salesman[]> => {
  const response = await axiosInstance.get('/salesmen');
  return response.data.data || response.data;
};

export const getAreasList = async (): Promise<Area[]> => {
  const response = await axiosInstance.get('/areas');
  return response.data.data || response.data;
};

export const getRoutesList = async (areaId?: number): Promise<Route[]> => {
  const params = areaId ? `?area_id=${areaId}` : '';
  const response = await axiosInstance.get(`/routes${params}`);
  return response.data.data || response.data;
};

export const getOutletsList = async (routeId?: number): Promise<Outlet[]> => {
  const params = routeId ? `?route_id=${routeId}` : '';
  const response = await axiosInstance.get(`/outlets${params}`);
  return response.data.data || response.data;
};

export const bulkUpdateBeatStatus = async (
  ids: number[],
  status: boolean
): Promise<void> => {
  await axiosInstance.post('/beats/bulk-status', { ids, status });
};

export const exportBeats = async (
  format: 'csv' | 'xlsx',
  filters?: {
    areaId?: number;
    routeId?: number;
    status?: boolean;
  }
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);

  if (filters?.areaId) params.append('area_id', filters.areaId.toString());
  if (filters?.routeId) params.append('route_id', filters.routeId.toString());
  if (filters?.status !== undefined) params.append('status', filters.status.toString());

  const response = await axiosInstance.get(`/beats/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};