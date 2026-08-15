import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import type {
  Salesman,
  SalesmanFormData,
  SalesmanListResponse,
  SalesmanSalesData,
  SalesmanLoginHistory,
  SalesmanType,
  SalesmanRole,
  SalesmanFilters,
  SalesmanBulkAction,
  SalesmanSelectOption,
  Country,
  Route,
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
  return response.data;
};

export const getAllSalesmen = async (filters?: SalesmanFilters): Promise<SalesmanSelectOption[]> => {
  const params = new URLSearchParams();

  if (filters?.routeId) {
    params.append('route_id', filters.routeId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  const response = await axiosInstance.get(`/salesman/all?${params.toString()}`);
  return response.data.data || response.data;
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
  return response.data;
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

// Salesman Types API
export const getSalesmanTypes = async (): Promise<SalesmanType[]> => {
  const response = await axiosInstance.get('/salesman-type/all');
  return response.data.data || response.data;
};

export const getSalesmanTypeDetails = async (uuid: string): Promise<SalesmanType> => {
  const response = await axiosInstance.get(`/salesman-type/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createSalesmanType = async (data: Partial<SalesmanType>): Promise<SalesmanType> => {
  const response = await axiosInstance.post('/salesman-type/add', data);
  return response.data.data || response.data;
};

export const updateSalesmanType = async (uuid: string, data: Partial<SalesmanType>): Promise<SalesmanType> => {
  const response = await axiosInstance.post(`/salesman-type/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteSalesmanType = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/salesman-type/delete', { id: uuid });
};

// Salesman Roles API
export const getSalesmanRoles = async (): Promise<SalesmanRole[]> => {
  const response = await axiosInstance.get('/salesman-role/all');
  return response.data.data || response.data;
};

export const getSalesmanRoleDetails = async (uuid: string): Promise<SalesmanRole> => {
  const response = await axiosInstance.get(`/salesman-role/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createSalesmanRole = async (data: Partial<SalesmanRole>): Promise<SalesmanRole> => {
  const response = await axiosInstance.post('/salesman-role/add', data);
  return response.data.data || response.data;
};

export const updateSalesmanRole = async (uuid: string, data: Partial<SalesmanRole>): Promise<SalesmanRole> => {
  const response = await axiosInstance.post(`/salesman-role/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteSalesmanRole = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/salesman-role/delete', { id: uuid });
};

// Routes API (for salesman assignment)
export const getRoutes = async (): Promise<Route[]> => {
  const response = await axiosInstance.get('/route/all');
  return response.data.data || response.data;
};

// Countries API
export const getCountries = async (): Promise<Country[]> => {
  const response = await axiosInstance.get('/country/all');
  return response.data.data || response.data;
};

// Supervisor Options (Active Salesmen who can be supervisors)
export const getSupervisorOptions = async (): Promise<SupervisorOption[]> => {
  const response = await axiosInstance.get('/salesman/all?supervisor=true');
  return response.data.data || response.data;
};

// Utility Functions
export const exportSalesmen = async (format: 'csv' | 'xlsx'): Promise<Blob> => {
  const response = await axiosInstance.get(`/salesman/export?format=${format}`, {
    responseType: 'blob',
  });
  return response.data;
};
