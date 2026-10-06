import { useMemo } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../api/OrderApi';
import { resolvePdp, resolvePdpPromotions } from '../api/PdpResolutionApi';
import { getAllSalesmen } from '../api/SalesmanApi';
import { getPaymentTerms } from '../api/CustomerApi';
import { showToast } from '../lib/toast';
import { useCustomerOptions } from './usePricingPromotionRules';
import type { SelectOption } from '../components/ui/Select';
import type { OrderFormData } from '../types/Order';
import { withCustomerCode } from '../utils/customerOptions';

/** Customers (labelled "CODE - name"; shared cache with the PDP wizard) + salesmen + payment terms. Items load per line, see LineItemSelect. */
export function useOrderFormOptions() {
    const { customers: allCustomers } = useCustomerOptions();
    const customers = useMemo(() => withCustomerCode(allCustomers), [allCustomers]);

    const salesmenQuery = useQuery({ queryKey: ['salesman-all'], queryFn: () => getAllSalesmen(), staleTime: 10 * 60 * 1000 });

    const paymentTermsQuery = useQuery({ queryKey: ['payment-terms-all'], queryFn: () => getPaymentTerms(), staleTime: 10 * 60 * 1000 });

    const salesmen: SelectOption[] = (salesmenQuery.data ?? []).map((s) => ({ value: String(s.id), label: s.salesmanCode ? `${s.salesmanCode} - ${s.name}` : s.name }));

    const paymentTerms: SelectOption[] = (paymentTermsQuery.data ?? []).filter((t) => t.uuid).map((t) => ({ value: t.uuid as string, label: t.name }));

    return { customers, salesmen, paymentTerms };
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: OrderFormData) => createOrder(data),
        onSuccess: () => {
            showToast.success('Order created successfully!');
            queryClient.invalidateQueries({ queryKey: ['order-list'] });
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to create order');
        },
    });
}

/** Advisory price/discount/free-goods preview for one order line. */
export function usePdpResolution() {
    return useMutation({ mutationFn: resolvePdp });
}

/** Free goods the whole basket earns. `linesJson` is a stable, already-debounced key. */
export function usePdpPromotions(customerId: string, linesJson: string) {
    const enabled = Boolean(customerId) && linesJson !== '[]';
    const { data } = useQuery({
        queryKey: ['pdp-promotions', customerId, linesJson],
        queryFn: () => resolvePdpPromotions({ customerId, lines: JSON.parse(linesJson) }),
        enabled,
        placeholderData: keepPreviousData,
    });
    return enabled ? (data ?? []) : [];
}
