import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type { Organisation, OrganisationFormData } from '../types/Organisation';

// Session-scoped: backend resolves the org from the authenticated user, no uuid needed.
// Returns null when the user hasn't completed the Organisation Details form yet
// (registration no longer creates an organisation row up front).
export const getCurrentOrganisation = async (): Promise<Organisation | null> => {
    const response = await axiosInstance.get('/organisation/current');
    const org = response.data.data ?? null;
    return org;
};

/**
 * Full organisation record for the Organisation screens. Global, cached
 * organisation data comes from AuthContext (/app/config) instead.
 */
export const getOrganisationDetails = async (): Promise<Organisation | null> => {
    try {
        const response = await axiosInstance.get('/organisation/details');
        const org = response.data?.data ?? null;
        return org;
    } catch (error) {
        console.error('Failed to fetch organisation details', error);
        return null;
    }
};

export const updateOrganisation = async (data: OrganisationFormData): Promise<Organisation> => {
    try {
        const response = await axiosInstance.post('/organisation/update', data);
        const updated = response.data.data || response.data;
        return updated;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to update organisation';
        showToast.error(message);
        throw error;
    }
};
