import axiosInstance from '../lib/axios';
import type { ConsumerSurvey, ConsumerSurveyFormData, SensorySurvey, SensorySurveyFormData } from '../types/Survey';

interface RawListResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

function unwrapList<T>(payload: any, page: number, perPage: number, itemName: string): RawListResponse<T> {
  return {
    data: payload[itemName] ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
}

// ─── Consumer Survey ────────────────────────────────────────────────────────

export const getConsumerSurveyList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<RawListResponse<ConsumerSurvey>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/consumer-survey/list?${params.toString()}`);
  return unwrapList(response.data, page, perPage, 'consumerSurveys');
};

export const createConsumerSurvey = async (data: ConsumerSurveyFormData): Promise<ConsumerSurvey> => {
  const response = await axiosInstance.post('/consumer-survey/add', data);
  return response.data.data;
};

export const updateConsumerSurvey = async (uuid: string, data: ConsumerSurveyFormData): Promise<ConsumerSurvey> => {
  const response = await axiosInstance.post(`/consumer-survey/edit/${uuid}`, data);
  return response.data.data;
};

export const bulkActionConsumerSurveys = async (
  uuids: string[],
  action: 'activate' | 'deactivate' | 'delete',
): Promise<void> => {
  await axiosInstance.post('/consumer-survey/bulk-action', { uuids, action });
};

// ─── Sensory Survey ─────────────────────────────────────────────────────────

export const getSensorySurveyList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<RawListResponse<SensorySurvey>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/sensory-survey/list?${params.toString()}`);
  return unwrapList(response.data, page, perPage, 'sensorySurveys');
};

export const createSensorySurvey = async (data: SensorySurveyFormData): Promise<SensorySurvey> => {
  const response = await axiosInstance.post('/sensory-survey/add', data);
  return response.data.data;
};

export const updateSensorySurvey = async (uuid: string, data: SensorySurveyFormData): Promise<SensorySurvey> => {
  const response = await axiosInstance.post(`/sensory-survey/edit/${uuid}`, data);
  return response.data.data;
};

export const bulkActionSensorySurveys = async (
  uuids: string[],
  action: 'activate' | 'deactivate' | 'delete',
): Promise<void> => {
  await axiosInstance.post('/sensory-survey/bulk-action', { uuids, action });
};
