import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { Organisation, OrganisationFormData } from '../types/Organisation';

// Session-scoped: backend resolves the org from the authenticated user, no uuid needed.
export const getCurrentOrganisation = async (): Promise<Organisation> => {
  const response = await axiosInstance.get('/organisation/current');
  return response.data.data || response.data;
};

export const updateOrganisation = async (data: OrganisationFormData): Promise<Organisation> => {
  try {
    const response = await axiosInstance.post('/organisation/update', data);
    return response.data.data || response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update organisation';
    showToast.error(message);
    throw error;
  }
};
