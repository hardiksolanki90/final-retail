import axiosInstance from '../lib/axios';
import { queryClient } from '../lib/queryClient';
import { showToast } from '../lib/toast';
import type { CountryMaster } from '../types/Country';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';

export type CountryListResponse = NormalizedListResponse<any>;

export interface PublicCountryOption {
  id: number;
  uuid: string;
  name: string;
  countryCode: string;
}

/**
 * Unauthenticated — used by the public registration form, which runs before
 * a session/organisation exists (unlike getCountryList, which is tenant-scoped).
 */
export const getPublicCountryList = async (): Promise<PublicCountryOption[]> => {
  const response = await axiosInstance.get('/country/public-list');
  return response.data.data ?? [];
};

export interface CountrySelectOption {
  id: number;
  uuid: string;
  name: string;
  countryCode: string;
}

// Tenant-scoped: countries an org has already selected (Settings > Country list).
// Backend paginates now, default per_page=50.
// Shared by every caller (the Customer form and its Region dropdown, Region and Salesman forms):
// one request while it's in flight or cached; country changes invalidate 'country-list'.
export const getAllCountries = (): Promise<CountrySelectOption[]> =>
  queryClient.fetchQuery({ queryKey: ['country-list', 'all'], queryFn: async (): Promise<CountrySelectOption[]> => (await axiosInstance.get('/country/all?per_page=50')).data?.countries ?? [] });

// Global ISO reference (country_masters) — feeds "pick a country" selects,
// e.g. the Organisation profile form and Settings > Country's add drawer.
// Backend paginates; useCountryMasters()'s consumers (country picker, currency
// dedup, tax profiles, phone codes) need the full set, so follow every page.
export const getAllCountryMasters = async (): Promise<CountryMaster[]> => {
  const all: CountryMaster[] = [];
  let page: number | null = 1;
  while (page) {
    const { data }: { data: { countryMasters?: CountryMaster[]; nextPage?: number | null } } = await axiosInstance.get(`/country-master/all?per_page=250&page=${page}`);
    all.push(...(data?.countryMasters ?? []));
    // Only advance forward — a repeated/stale nextPage must not loop forever.
    page = data?.nextPage && data.nextPage > page ? data.nextPage : null;
  }
  return all;
};

export type CountryMasterListResponse = NormalizedListResponse<CountryMaster>;

export const getCountryMasterList = async (page = 1, perPage = 20, searchTerm?: string): Promise<CountryMasterListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/country-master/all?${params.toString()}`);
  return unwrapPaginated(response.data, 'countryMasters', perPage);
};

export const getCountryList = async (page = 1, perPage = 15, searchTerm?: string): Promise<CountryListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/country/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'countries', perPage);
};

export const createCountry = async (data: Record<string, any>) => {
  const response = await axiosInstance.post('/country/add', data);
  showToast.success('Country created successfully');
  return response.data;
};

export const updateCountry = async (uuid: string, data: Record<string, any>) => {
  const response = await axiosInstance.post(`/country/edit/${uuid}`, data);
  showToast.success('Country updated successfully');
  return response.data;
};

export const deleteCountry = async (uuid: string) => {
  await axiosInstance.delete(`/country/delete/${uuid}`);
  showToast.success('Country deleted successfully');
};
