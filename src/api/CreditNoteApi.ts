import axiosInstance from '../lib/axios';
import type { CreditNote, CreditNoteFormData, CreditNoteListResponse } from '../types/CreditNote';
import type { SelectOption } from '../components/ui/Select';

export const getCreditNoteList = async (
  page: number = 1,
  searchTerm?: string,
  perPage: number = 15,
): Promise<CreditNoteListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);

  const response = await axiosInstance.get(`/credit-note/list?${params.toString()}`);
  const payload = response.data;

  return {
    data: payload.creditNotes ?? [],
    total: payload.total ?? 0,
    currentPage: payload.currentPage ?? page,
    perPage,
    lastPage: payload.lastPage ?? 1,
  };
};

export const getCreditNoteByUuid = async (uuid: string): Promise<CreditNote> => {
  const response = await axiosInstance.get(`/credit-note/edit/${uuid}`);
  return response.data.data;
};

export const createCreditNote = async (data: CreditNoteFormData): Promise<CreditNote> => {
  const response = await axiosInstance.post('/credit-note/add', data);
  return response.data.data;
};

export const updateCreditNote = async (uuid: string, data: CreditNoteFormData): Promise<CreditNote> => {
  const response = await axiosInstance.post(`/credit-note/edit/${uuid}`, data);
  return response.data.data;
};

export const deleteCreditNote = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/credit-note/delete', { id: uuid });
};

export const bulkActionCreditNotes = async (
  uuids: string[],
  action: 'activate' | 'deactivate' | 'delete',
): Promise<void> => {
  await axiosInstance.post('/credit-note/bulk-action', { uuids, action });
};

/**
 * Invoice select options for the Credit Note form. InvoiceApi.ts calls a
 * REST-plural path that doesn't match any real route (same drift bug as
 * Pallet) — calling the real `invoice/all` route directly here instead of
 * depending on that file.
 */
export const getInvoiceOptions = async (): Promise<SelectOption[]> => {
  const response = await axiosInstance.get('/invoice/all');
  return response.data.data ?? [];
};
