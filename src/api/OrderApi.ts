import axiosInstance from '../lib/axios';
import type { Order, OrderFormData, OrderListResponse } from '../types/Order';

export const getOrderList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
  filters?: {
    status?: string;
    customerId?: string;
    salesmanId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<OrderListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customer_id', filters.customerId);
    if (filters.salesmanId) params.append('salesman_id', filters.salesmanId);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
  }

  const response = await axiosInstance.get(`/orders?${params.toString()}`);
  return response.data;
};

export const getOrderDetails = async (uuid: string): Promise<Order> => {
  const response = await axiosInstance.get(`/orders/${uuid}`);
  return response.data.data || response.data;
};

export const createOrder = async (orderData: OrderFormData): Promise<Order> => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data.data || response.data;
};

export const updateOrder = async (uuid: string, orderData: OrderFormData): Promise<Order> => {
  const response = await axiosInstance.put(`/orders/${uuid}`, orderData);
  return response.data.data || response.data;
};

export const deleteOrder = async (uuid: string): Promise<void> => {
  await axiosInstance.delete(`/orders/${uuid}`);
};

export const updateOrderStatus = async (
  uuid: string,
  status: Order['status']
): Promise<Order> => {
  const response = await axiosInstance.patch(`/orders/${uuid}/status`, { status });
  return response.data.data || response.data;
};

export const cancelOrder = async (uuid: string, reason?: string): Promise<Order> => {
  const response = await axiosInstance.post(`/orders/${uuid}/cancel`, { reason });
  return response.data.data || response.data;
};

export const getOrderSummary = async (uuid: string): Promise<unknown> => {
  const response = await axiosInstance.get(`/orders/${uuid}/summary`);
  return response.data.data || response.data;
};

export const bulkUpdateOrderStatus = async (
  uuids: string[],
  status: Order['status']
): Promise<void> => {
  await axiosInstance.post('/orders/bulk-status', { uuids, status });
};

export const exportOrders = async (
  format: 'csv' | 'xlsx',
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    customerId?: string;
  }
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);

  if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
  if (filters?.dateTo) params.append('date_to', filters.dateTo);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.customerId) params.append('customer_id', filters.customerId);

  const response = await axiosInstance.get(`/orders/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};
