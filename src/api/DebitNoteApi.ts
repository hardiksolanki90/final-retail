import axiosInstance from '../lib/axios';
import type { DebitNoteListResponse, DebitNoteListRow } from '../types/DebitNote';

export const getDebitNoteList = async (page: number = 1, searchTerm?: string, perPage: number = 15): Promise<DebitNoteListResponse> => {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/debit-note/list?${params.toString()}`);
  const payload = response.data;

  return { data: (payload.debitNotes ?? []) as DebitNoteListRow[], total: payload.total ?? 0, currentPage: payload.currentPage ?? page, perPage, lastPage: payload.lastPage ?? 1 };
};

export const bulkActionDebitNotes = async (uuids: string[], action: 'activate' | 'deactivate' | 'delete'): Promise<void> => {
  await axiosInstance.post('/debit-note/bulk-action', { uuids, action });
};
