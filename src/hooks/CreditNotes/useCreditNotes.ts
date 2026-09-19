import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCreditNoteList,
  createCreditNote,
  updateCreditNote,
  bulkActionCreditNotes,
  getInvoiceOptions,
} from '../../api/CreditNoteApi';
import { getAllCustomers } from '../../api/CustomerApi';
import { getAllItems } from '../../api/ItemApi';
import { getReasonOptions } from '../../api/ReasonApi';
import { showToast } from '../../lib/toast';
import type { CreditNoteFormData } from '../../types/CreditNote';

export function useCreditNotes(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['credit-notes', page, searchTerm],
    queryFn: () => getCreditNoteList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      bulkActionCreditNotes(uuids, action),
    onSuccess: () => {
      showToast.success('Credit notes updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update credit notes');
    },
  });

  return {
    creditNotes: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    currentPage: listQuery.data?.currentPage ?? page,
    lastPage: listQuery.data?.lastPage ?? 1,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    bulkAction: bulkActionMutation.mutate,
    isBulkActing: bulkActionMutation.isPending,
  };
}

/** Select-option data needed by the CreditNote Add form. */
export function useCreditNoteFormOptions() {
  const customersQuery = useQuery({
    queryKey: ['credit-note-customers'],
    queryFn: () => getAllCustomers(),
    staleTime: 5 * 60 * 1000,
  });

  const invoicesQuery = useQuery({
    queryKey: ['credit-note-invoices'],
    queryFn: () => getInvoiceOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const reasonsQuery = useQuery({
    queryKey: ['credit-note-reasons'],
    queryFn: () => getReasonOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const itemsQuery = useQuery({
    queryKey: ['credit-note-items'],
    queryFn: () => getAllItems(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    customers: customersQuery.data ?? [],
    invoices: invoicesQuery.data ?? [],
    // credit_notes.reason is a free-text column, not a reason_type_id FK —
    // store the human-readable name as the value, not the numeric id.
    reasons: (reasonsQuery.data ?? []).map((r) => ({ value: r.label, label: r.label })),
    items: itemsQuery.data ?? [],
    isLoading:
      customersQuery.isLoading || invoicesQuery.isLoading || reasonsQuery.isLoading || itemsQuery.isLoading,
  };
}

export function useCreditNoteMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreditNoteFormData) => createCreditNote(data),
    onSuccess: () => {
      showToast.success('Credit note created successfully!');
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create credit note');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: CreditNoteFormData }) => updateCreditNote(uuid, data),
    onSuccess: () => {
      showToast.success('Credit note updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['credit-notes'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update credit note');
    },
  });

  return { createMutation, updateMutation };
}
