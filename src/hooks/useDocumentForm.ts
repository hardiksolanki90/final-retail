import { useMutation, useQuery } from '@tanstack/react-query';
import { createDocument, type DocumentKind } from '../api/DocumentApi';
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
        queryFn: async (): Promise<SelectOption[]> => (await getReasonOptions()).map((r) => ({ value: String(r.value), label: r.label })),
        staleTime: 5 * 60 * 1000,
    });

    const invoicesQuery = useQuery({ queryKey: ['document-invoices'], queryFn: getInvoiceOptions, staleTime: 5 * 60 * 1000 });

    return { ...base, warehouses: warehousesQuery.data ?? [], reasons: reasonsQuery.data ?? [], invoices: invoicesQuery.data ?? [] };
}

/** POSTs a new Delivery / Invoice / Debit Note; the server prices and taxes every line. */
export function useCreateDocument(kind: DocumentKind, label: string) {
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => createDocument(kind, payload),
        onSuccess: () => showToast.success(`${label} created successfully!`),
        onError: (error: { response?: { data?: { message?: string } } }) => showToast.error(error.response?.data?.message || `Failed to create ${label.toLowerCase()}`),
    });
}
