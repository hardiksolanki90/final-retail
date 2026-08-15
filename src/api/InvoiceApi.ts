import axiosInstance from '../lib/axios';
import type { Invoice, InvoiceFormData, InvoiceListResponse } from '../types/Invoice';

export const getInvoiceList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
  filters?: {
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<InvoiceListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customer_id', filters.customerId);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
  }

  const response = await axiosInstance.get(`/invoices?${params.toString()}`);
  return response.data;
};

export const getInvoiceDetails = async (uuid: string): Promise<Invoice> => {
  const response = await axiosInstance.get(`/invoices/${uuid}`);
  return response.data.data || response.data;
};

export const createInvoice = async (invoiceData: InvoiceFormData): Promise<Invoice> => {
  const response = await axiosInstance.post('/invoices', invoiceData);
  return response.data.data || response.data;
};

export const updateInvoice = async (uuid: string, invoiceData: InvoiceFormData): Promise<Invoice> => {
  const response = await axiosInstance.put(`/invoices/${uuid}`, invoiceData);
  return response.data.data || response.data;
};

export const deleteInvoice = async (uuid: string): Promise<void> => {
  await axiosInstance.delete(`/invoices/${uuid}`);
};

export const updateInvoiceStatus = async (
  uuid: string,
  status: Invoice['status']
): Promise<Invoice> => {
  const response = await axiosInstance.patch(`/invoices/${uuid}/status`, { status });
  return response.data.data || response.data;
};

export const markInvoiceAsPaid = async (
  uuid: string,
  paymentData: {
    paymentMethod: string;
    paymentDate: string;
    amountPaid: number;
    notes?: string;
  }
): Promise<Invoice> => {
  const response = await axiosInstance.post(`/invoices/${uuid}/payment`, paymentData);
  return response.data.data || response.data;
};

export const getInvoiceSummary = async (uuid: string): Promise<unknown> => {
  const response = await axiosInstance.get(`/invoices/${uuid}/summary`);
  return response.data.data || response.data;
};

export const bulkUpdateInvoiceStatus = async (
  uuids: string[],
  status: Invoice['status']
): Promise<void> => {
  await axiosInstance.post('/invoices/bulk-status', { uuids, status });
};

export const exportInvoices = async (
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

  const response = await axiosInstance.get(`/invoices/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const generateInvoicePDF = async (uuid: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/invoices/${uuid}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

export const sendInvoiceEmail = async (
  uuid: string,
  emailData: {
    to: string;
    subject?: string;
    message?: string;
  }
): Promise<void> => {
  await axiosInstance.post(`/invoices/${uuid}/email`, emailData);
};