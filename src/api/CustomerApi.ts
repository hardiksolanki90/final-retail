import axiosInstance from '../lib/axios';
import { showToast } from '../lib/toast';
import { unwrapPaginated } from '../lib/paginatedResponse';
import type {
  Customer,
  CustomerFormData,
  CustomerListResponse,
  CustomerSalesData,
  CustomerType,
  CustomerCategory,
  CustomerGroup,
  Channel,
  PaymentTerm,
  Route,
  CustomerFilters,
  CustomerBulkAction,
  CustomerSelectOption,
  SalesOrganisation,
} from '../types/Customer';

// Customer CRUD Operations
export const getCustomerList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
  filters?: CustomerFilters
): Promise<CustomerListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  if (filters?.routeId) {
    params.append('route_id', filters.routeId.toString());
  }

  if (filters?.salesmanId) {
    params.append('salesman_id', filters.salesmanId.toString());
  }

  if (filters?.customerTypeId) {
    params.append('customer_type_id', filters.customerTypeId.toString());
  }

  if (filters?.customerCategoryId) {
    params.append('customer_category_id', filters.customerCategoryId.toString());
  }

  if (filters?.channelId) {
    params.append('channel_id', filters.channelId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  const response = await axiosInstance.get(`/customer/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'customers', perPage) as CustomerListResponse;
};

export const getAllCustomers = async (filters?: CustomerFilters): Promise<CustomerSelectOption[]> => {
  const params = new URLSearchParams();

  if (filters?.salesmanId) {
    params.append('salesman_id', filters.salesmanId.toString());
  }

  if (filters?.routeId) {
    params.append('route_id', filters.routeId.toString());
  }

  const response = await axiosInstance.get(`/customer/all?${params.toString()}`);
  return response.data.data || response.data;
};

export const searchCustomers = async (
  searchTerm: string,
  page: number = 1,
  perPage: number = 15,
  filters?: CustomerFilters
): Promise<CustomerListResponse> => {
  const params = new URLSearchParams();
  params.append('search', searchTerm);
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (filters?.routeId) {
    params.append('route_id', filters.routeId.toString());
  }

  if (filters?.salesmanId) {
    params.append('salesman_id', filters.salesmanId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  const response = await axiosInstance.post('/customer/search', Object.fromEntries(params));
  return unwrapPaginated(response.data, 'customers', perPage) as CustomerListResponse;
};

export const getCustomerDetails = async (uuid: string): Promise<Customer> => {
  const response = await axiosInstance.get(`/customer/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createCustomer = async (customerData: CustomerFormData): Promise<Customer> => {
  try {
    const response = await axiosInstance.post('/customer/add', customerData);
    return response.data.data || response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to create customer';
    showToast.error(message);
    throw error;
  }
};

export const updateCustomer = async (uuid: string, customerData: CustomerFormData): Promise<Customer> => {
  try {
    const response = await axiosInstance.post(`/customer/edit/${uuid}`, customerData);
    return response.data.data || response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update customer';
    showToast.error(message);
    throw error;
  }
};

export const deleteCustomer = async (uuid: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/customer/delete/${uuid}`);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to delete customer';
    showToast.error(message);
    throw error;
  }
};

export const getCustomerSales = async (
  uuid: string,
  startDate?: string,
  endDate?: string
): Promise<CustomerSalesData> => {
  const params = new URLSearchParams();
  
  if (startDate) {
    params.append('start_date', startDate);
  }
  
  if (endDate) {
    params.append('end_date', endDate);
  }

  const response = await axiosInstance.get(`/customer/${uuid}/sales?${params.toString()}`);
  return response.data.data || response.data;
};

export const getCustomersBySalesman = async (salesmanId: number): Promise<Customer[]> => {
  const response = await axiosInstance.get(`/customer/salesman/${salesmanId}`);
  return response.data.data || response.data;
};

export const bulkActionCustomers = async (bulkAction: CustomerBulkAction): Promise<void> => {
  try {
    await axiosInstance.post('/customer/bulk-action', bulkAction);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to complete bulk action';
    showToast.error(message);
    throw error;
  }
};

// Customer Types API
export const getCustomerTypes = async (): Promise<CustomerType[]> => {
  const response = await axiosInstance.get('/customer-type/all');
  return response.data.data || response.data;
};

export const getCustomerTypeDetails = async (uuid: string): Promise<CustomerType> => {
  const response = await axiosInstance.get(`/customer-type/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createCustomerType = async (data: Partial<CustomerType>): Promise<CustomerType> => {
  const response = await axiosInstance.post('/customer-type/add', data);
  return response.data.data || response.data;
};

export const updateCustomerType = async (uuid: string, data: Partial<CustomerType>): Promise<CustomerType> => {
  const response = await axiosInstance.post(`/customer-type/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteCustomerType = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/customer-type/delete', { id: uuid });
};

// Customer Categories API
export interface CustomerCategoryListResponse {
  data: any[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number; };
  current_page?: number; per_page?: number; total?: number; last_page?: number;
}

export const getCustomerCategoryList = async (
  page: number = 1,
  perPage: number = 15,
  searchTerm?: string
): Promise<CustomerCategoryListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/customer-category/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'customerCategories', perPage);
};

export const getCustomerCategories = async (): Promise<CustomerCategory[]> => {
  const response = await axiosInstance.get('/customer-category/all?per_page=50');
  return response.data?.customerCategories ?? [];
};

export const getCustomerCategoryDetails = async (uuid: string): Promise<CustomerCategory> => {
  const response = await axiosInstance.get(`/customer-category/view/${uuid}`);
  return response.data.data || response.data;
};

export const createCustomerCategory = async (data: Partial<CustomerCategory>): Promise<CustomerCategory> => {
  const response = await axiosInstance.post('/customer-category/add', data);
  return response.data.data || response.data;
};

export const updateCustomerCategory = async (uuid: string, data: Partial<CustomerCategory>): Promise<CustomerCategory> => {
  const response = await axiosInstance.post(`/customer-category/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteCustomerCategory = async (uuid: string): Promise<void> => {
  await axiosInstance.delete(`/customer-category/delete/${uuid}`);
};

// Customer Groups API
export const getCustomerGroups = async (): Promise<CustomerGroup[]> => {
  const response = await axiosInstance.get('/customer-group/all?per_page=50');
  return response.data?.customerGroups ?? [];
};

export const getCustomerGroupDetails = async (uuid: string): Promise<CustomerGroup> => {
  const response = await axiosInstance.get(`/customer-group/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createCustomerGroup = async (data: Partial<CustomerGroup>): Promise<CustomerGroup> => {
  const response = await axiosInstance.post('/customer-group/add', data);
  return response.data.data || response.data;
};

export const updateCustomerGroup = async (uuid: string, data: Partial<CustomerGroup>): Promise<CustomerGroup> => {
  const response = await axiosInstance.post(`/customer-group/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteCustomerGroup = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/customer-group/delete', { id: uuid });
};

// Channels API
export const getChannels = async (): Promise<Channel[]> => {
  const response = await axiosInstance.get('/channel/all?per_page=50');
  return response.data?.channels ?? [];
};

export const getChannelDetails = async (uuid: string): Promise<Channel> => {
  const response = await axiosInstance.get(`/channel/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createChannel = async (data: Partial<Channel>): Promise<Channel> => {
  const response = await axiosInstance.post('/channel/add', data);
  return response.data.data || response.data;
};

export const updateChannel = async (uuid: string, data: Partial<Channel>): Promise<Channel> => {
  const response = await axiosInstance.post(`/channel/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteChannel = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/channel/delete', { id: uuid });
};

// Sales Organisation API
export const getSalesOrganisations = async (): Promise<SalesOrganisation[]> => {
  const response = await axiosInstance.get('/sales-organisation/all?per_page=50');
  return response.data?.salesOrganisations ?? [];
};

export const getSalesOrganisationDetails = async (uuid: string): Promise<SalesOrganisation> => {
  const response = await axiosInstance.get(`/sales-organisation/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createSalesOrganisation = async (data: Partial<SalesOrganisation>): Promise<SalesOrganisation> => {
  const response = await axiosInstance.post('/sales-organisation/add', data);
  return response.data.data || response.data;
};

export const updateSalesOrganisation = async (uuid: string, data: Partial<SalesOrganisation>): Promise<SalesOrganisation> => {
  const response = await axiosInstance.post(`/sales-organisation/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteSalesOrganisation = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/sales-organisation/delete', { id: uuid });
};

// Payment Terms API
export const getPaymentTerms = async (): Promise<PaymentTerm[]> => {
  const response = await axiosInstance.get('/payment-term/all?per_page=50');
  return response.data?.paymentTerms ?? [];
};

export const getPaymentTermDetails = async (uuid: string): Promise<PaymentTerm> => {
  const response = await axiosInstance.get(`/payment-term/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createPaymentTerm = async (data: Partial<PaymentTerm>): Promise<PaymentTerm> => {
  const response = await axiosInstance.post('/payment-term/add', data);
  return response.data.data || response.data;
};

export const updatePaymentTerm = async (uuid: string, data: Partial<PaymentTerm>): Promise<PaymentTerm> => {
  const response = await axiosInstance.post(`/payment-term/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deletePaymentTerm = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/payment-term/delete', { id: uuid });
};

// Routes API
export const getRoutes = async (): Promise<Route[]> => {
  const response = await axiosInstance.get('/route/all?per_page=50');
  return response.data?.routes ?? [];
};

export const getRouteDetails = async (uuid: string): Promise<Route> => {
  const response = await axiosInstance.get(`/route/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createRoute = async (data: Partial<Route>): Promise<Route> => {
  const response = await axiosInstance.post('/route/add', data);
  return response.data.data || response.data;
};

export const updateRoute = async (uuid: string, data: Partial<Route>): Promise<Route> => {
  const response = await axiosInstance.post(`/route/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteRoute = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/route/delete', { id: uuid });
};

// Utility Functions
export const exportCustomers = async (format: 'csv' | 'xlsx'): Promise<Blob> => {
  const response = await axiosInstance.get(`/customer/export?format=${format}`, {
    responseType: 'blob',
  });
  return response.data;
};