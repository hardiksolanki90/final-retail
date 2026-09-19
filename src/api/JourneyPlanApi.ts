import axiosInstance from '../lib/axios';
import type { JourneyPlanFullFormData, JourneyPlanFullListResponse } from '../types/JourneyPlan';

export const getJourneyPlanList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<JourneyPlanFullListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/journey-plan/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.journeyPlans ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const getJourneyPlanByUuid = async (uuid: string): Promise<JourneyPlanFullFormData> => {
  const response = await axiosInstance.get(`/journey-plan/edit/${uuid}`);
  return response.data.data;
};

export const createJourneyPlan = async (data: JourneyPlanFullFormData): Promise<JourneyPlanFullFormData> => {
  const response = await axiosInstance.post('/journey-plan/add', data);
  return response.data.data;
};

export const updateJourneyPlan = async (uuid: string, data: JourneyPlanFullFormData): Promise<JourneyPlanFullFormData> => {
  const response = await axiosInstance.post(`/journey-plan/edit/${uuid}`, data);
  return response.data.data;
};

export const deleteJourneyPlan = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/journey-plan/delete', { id: uuid });
};

export const bulkActionJourneyPlans = async (
  uuids: string[],
  action: 'activate' | 'deactivate' | 'delete',
): Promise<void> => {
  await axiosInstance.post('/journey-plan/bulk-action', { uuids, action });
};
