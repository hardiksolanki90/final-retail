import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';
import type {
  Salesman,
  SalesmanFormData,
  SalesmanListResponse,
  SalesmanSalesData,
  SalesmanLoginHistory,
  SalesmanFilters,
  SalesmanBulkAction,
  SalesmanSelectOption,
  Country,
  SupervisorOption,
} from '../types/Salesman';

// Salesman CRUD Operations
export const getSalesmanList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
  filters?: SalesmanFilters
): Promise<SalesmanListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  if (filters?.routeId) {
    params.append('route_id', filters.routeId.toString());
  }

  if (filters?.salesmanTypeId) {
    params.append('salesman_type_id', filters.salesmanTypeId.toString());
  }

  if (filters?.salesmanRoleId) {
    params.append('salesman_role_id', filters.salesmanRoleId.toString());
  }

  if (filters?.supervisorId) {
    params.append('supervisor_id', filters.supervisorId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  if (filters?.isBlocked !== undefined) {
    params.append('is_blocked', filters.isBlocked.toString());
  }

  const response = await axiosInstance.get(`/salesman/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'salesman', perPage) as SalesmanListResponse;
};

export const getAllSalesmen = async (filters?: SalesmanFilters): Promise<SalesmanSelectOption[]> => {
  const params = new URLSearchParams();
  params.append('per_page', '50');

  if (filters?.routeId) {
    params.append('route_id', filters.routeId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  const response = await axiosInstance.get(`/salesman/all?${params.toString()}`);
  return response.data?.salesman ?? [];
};

/** Paginated + searchable salesman options, for searchable Select dropdowns. */
export const getSalesmanOptions = async (
  page: number = 1,
  search?: string,
  perPage: number = 25
): Promise<NormalizedListResponse<SalesmanSelectOption>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (search) {
    params.append('search', search);
  }

  const response = await axiosInstance.get(`/salesman/all?${params.toString()}`);
  return unwrapPaginated(response.data, 'salesman', perPage);
};

export const searchSalesmen = async (
  searchTerm: string,
  page: number = 1,
  perPage: number = 15,
  filters?: SalesmanFilters
): Promise<SalesmanListResponse> => {
  const params = new URLSearchParams();
  params.append('search', searchTerm);
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (filters?.routeId) {
    params.append('route_id', filters.routeId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  const response = await axiosInstance.post('/salesman/search', Object.fromEntries(params));
  return unwrapPaginated(response.data, 'salesman', perPage) as SalesmanListResponse;
};

export const getSalesmanDetails = async (uuid: string): Promise<Salesman> => {
  const response = await axiosInstance.get(`/salesman/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createSalesman = async (salesmanData: SalesmanFormData): Promise<Salesman> => {
  try {
    const response = await axiosInstance.post('/salesman/add', salesmanData);
    return response.data.data || response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to create salesman';
    showToast.error(message);
    throw error;
  }
};

export const updateSalesman = async (uuid: string, salesmanData: SalesmanFormData): Promise<Salesman> => {
  try {
    const response = await axiosInstance.post(`/salesman/edit/${uuid}`, salesmanData);
    return response.data.data || response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update salesman';
    showToast.error(message);
    throw error;
  }
};

export const deleteSalesman = async (uuid: string): Promise<void> => {
  try {
    await axiosInstance.post('/salesman/delete', { id: uuid });
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to delete salesman';
    showToast.error(message);
    throw error;
  }
};

export const getSalesmanSales = async (
  uuid: string,
  startDate?: string,
  endDate?: string
): Promise<SalesmanSalesData> => {
  const params = new URLSearchParams();
  
  if (startDate) {
    params.append('start_date', startDate);
  }
  
  if (endDate) {
    params.append('end_date', endDate);
  }

  const response = await axiosInstance.get(`/salesman/${uuid}/sales?${params.toString()}`);
  return response.data.data || response.data;
};

export const getSalesmanLoginHistory = async (
  userId: number,
  limit: number = 20
): Promise<SalesmanLoginHistory[]> => {
  const response = await axiosInstance.get(`/salesman/${userId}/login-history?limit=${limit}`);
  return response.data.data || response.data;
};

export const bulkActionSalesmen = async (bulkAction: SalesmanBulkAction): Promise<void> => {
  try {
    await axiosInstance.post('/salesman/bulk-action', bulkAction);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to complete bulk action';
    showToast.error(message);
    throw error;
  }
};

// Countries API
export const getCountries = async (): Promise<Country[]> => {
  const response = await axiosInstance.get('/country/all?per_page=50');
  return response.data?.countries ?? [];
};

// Supervisor Options (users holding the "Supervisor" RBAC role)
export const getSupervisorOptions = async (): Promise<SupervisorOption[]> => {
  const response = await axiosInstance.get('/supervisors');
  const options: { value: number; label: string }[] = response.data?.data ?? [];
  return options.map((option) => ({ id: option.value, name: option.label }));
};

// Utility Functions
export const exportSalesmen = async (format: 'csv' | 'xlsx'): Promise<Blob> => {
  const response = await axiosInstance.get(`/salesman/export?format=${format}`, {
    responseType: 'blob',
  });
  return response.data;
};
