import axiosInstance from '../lib/axios';
import type { Delivery, DeliveryFormData, DeliveryListResponse } from '../types/Delivery';

export const getDeliveryList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
  filters?: {
    status?: string;
    customerId?: string;
    driverId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<DeliveryListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customer_id', filters.customerId);
    if (filters.driverId) params.append('driver_id', filters.driverId);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
  }

  const response = await axiosInstance.get(`/deliveries?${params.toString()}`);
  return response.data;
};

export const getDeliveryDetails = async (uuid: string): Promise<Delivery> => {
  const response = await axiosInstance.get(`/deliveries/${uuid}`);
  return response.data.data || response.data;
};

export const createDelivery = async (deliveryData: DeliveryFormData): Promise<Delivery> => {
  const response = await axiosInstance.post('/deliveries', deliveryData);
  return response.data.data || response.data;
};

export const updateDelivery = async (uuid: string, deliveryData: DeliveryFormData): Promise<Delivery> => {
  const response = await axiosInstance.put(`/deliveries/${uuid}`, deliveryData);
  return response.data.data || response.data;
};

export const deleteDelivery = async (uuid: string): Promise<void> => {
  await axiosInstance.delete(`/deliveries/${uuid}`);
};

export const updateDeliveryStatus = async (
  uuid: string,
  status: Delivery['status']
): Promise<Delivery> => {
  const response = await axiosInstance.patch(`/deliveries/${uuid}/status`, { status });
  return response.data.data || response.data;
};

export const markDeliveryAsDelivered = async (
  uuid: string,
  deliveryData: {
    actualDeliveryDate: string;
    signature?: string;
    proof?: string;
    deliveryNotes?: string;
  }
): Promise<Delivery> => {
  const response = await axiosInstance.post(`/deliveries/${uuid}/complete`, deliveryData);
  return response.data.data || response.data;
};

export const assignDriver = async (
  uuid: string,
  driverId: string
): Promise<Delivery> => {
  const response = await axiosInstance.post(`/deliveries/${uuid}/assign-driver`, { driverId });
  return response.data.data || response.data;
};

export const getDeliveryTracking = async (uuid: string): Promise<unknown> => {
  const response = await axiosInstance.get(`/deliveries/${uuid}/tracking`);
  return response.data.data || response.data;
};

export const bulkUpdateDeliveryStatus = async (
  uuids: string[],
  status: Delivery['status']
): Promise<void> => {
  await axiosInstance.post('/deliveries/bulk-status', { uuids, status });
};

export const exportDeliveries = async (
  format: 'csv' | 'xlsx',
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    customerId?: string;
    driverId?: string;
  }
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);

  if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
  if (filters?.dateTo) params.append('date_to', filters.dateTo);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.customerId) params.append('customer_id', filters.customerId);
  if (filters?.driverId) params.append('driver_id', filters.driverId);

  const response = await axiosInstance.get(`/deliveries/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const getDeliveryRouteOptimization = async (
  deliveryIds: string[]
): Promise<unknown> => {
  const response = await axiosInstance.post('/deliveries/optimize-route', { deliveryIds });
  return response.data.data || response.data;
};