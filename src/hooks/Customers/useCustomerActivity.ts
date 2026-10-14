import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getCustomerItemReport, getCustomerLedger, getCustomerTransactions } from '../../api/CustomerApi';
import type { CustomerActivityFilters } from '../../types/Customer';

/** The customer's documents, 25 at a time (null uuid = no request). */
export function useCustomerTransactions(uuid: string | null, filters: CustomerActivityFilters) {
  return useInfiniteQuery({
    queryKey: ['customer-transactions', uuid, filters],
    queryFn: ({ pageParam }) => getCustomerTransactions(uuid as string, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.has_more_pages ? last.meta.current_page + 1 : undefined),
    enabled: Boolean(uuid),
  });
}

export function useCustomerLedger(uuid: string | null, filters: CustomerActivityFilters) {
  return useQuery({ queryKey: ['customer-ledger', uuid, filters], queryFn: () => getCustomerLedger(uuid as string, filters), enabled: Boolean(uuid), placeholderData: keepPreviousData });
}

export function useCustomerItemReport(uuid: string | null, filters: CustomerActivityFilters) {
  return useQuery({ queryKey: ['customer-item-report', uuid, filters], queryFn: () => getCustomerItemReport(uuid as string, filters), enabled: Boolean(uuid), placeholderData: keepPreviousData });
}
