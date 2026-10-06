import axiosInstance from '../lib/axios';
import type { AppConfig } from '../types/AppConfig';

export const getAppConfig = async (): Promise<AppConfig> => {
  const response = await axiosInstance.get('/app/config');
  return response.data.data;
};
