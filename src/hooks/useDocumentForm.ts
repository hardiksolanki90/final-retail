import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDocument, updateDocument, type DocumentKind } from '../api/DocumentApi';
import { getWarehouseAll } from '../api/WarehouseApi';
import { getReasonOptions } from '../api/ReasonApi';
import { getInvoiceOptions } from '../api/CreditNoteApi';
import { showToast } from '../lib/toast';
import { useOrderFormOptions } from './useOrderForm';
import type { SelectOption } from '../components/ui/Select';

/** Order's options (customers, items, UOMs, salesmen, payment terms) + warehouses, reasons, invoices. */
export function useDocumentFormOptions() {
  const base = useOrderFormOptions();

  const warehousesQuery = useQuery({
    queryKey: ['document-warehouses'],
    queryFn: async (): Promise<SelectOption[]> => {
      const rows = (await getWarehouseAll()).data ?? [];
      return rows.map((w: { uuid: string; code?: string; name?: string }) => ({ value: w.uuid, label: w.code ? `${w.code} - ${w.name ?? ''}` : (w.name ?? w.uuid) }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const reasonsQuery = useQuery({
    queryKey: ['document-reasons'],
    queryFn: async (): Promise<SelectOption[]> => (await getReasonOptions()).map((r) => ({ value: r.uuid, label: r.label })),
    staleTime: 5 * 60 * 1000,
  });

  const invoicesQuery = useQuery({ queryKey: ['document-invoices'], queryFn: getInvoiceOptions, staleTime: 5 * 60 * 1000 });

  const reasons = reasonsQuery.data ?? [];
  // Credit / debit notes store the reason as free text, not a reason id — they pick by name.
  return { ...base, warehouses: warehousesQuery.data ?? [], reasons, reasonNames: reasons.map((r) => ({ value: r.label, label: r.label })), invoices: invoicesQuery.data ?? [] };
}

// The list query each document's list page reads, refreshed after a create.
const LIST_KEYS: Record<DocumentKind, string> = { order: 'order-list', delivery: 'delivery-list', invoice: 'invoice-list', 'credit-note': 'credit-notes', 'debit-note': 'debit-notes' };

/** POSTs a new Delivery / Invoice / Credit Note / Debit Note; the server prices and taxes every line. */
export function useCreateDocument(kind: DocumentKind, label: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createDocument(kind, payload),
    onSuccess: () => {
      showToast.success(`${label} created successfully!`);
      queryClient.invalidateQueries({ queryKey: [LIST_KEYS[kind]] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => showToast.error(error.response?.data?.message || `Failed to create ${label.toLowerCase()}`),
  });
}

/** Saves changes to a pending document, then refreshes its list and its open details. */
export function useUpdateDocument(kind: DocumentKind, label: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: Record<string, unknown> }) => updateDocument(kind, uuid, payload),
    onSuccess: () => {
      showToast.success(`${label} updated`);
      queryClient.invalidateQueries({ queryKey: [LIST_KEYS[kind]] });
      queryClient.invalidateQueries({ queryKey: [`${kind}-details`] });
      queryClient.invalidateQueries({ queryKey: [`${kind}-detail`] });
    },
    onError: (error: { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => showToast.error(error.response?.data?.message || `Failed to update ${label.toLowerCase()}`),
  });
}
