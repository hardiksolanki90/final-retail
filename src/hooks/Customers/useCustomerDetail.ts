import { getCustomerDetails } from '../../api/CustomerApi';
import { detailKey, useEntityDetail } from '../useEntityDetail';

/** Cache key prefix for single-customer details; invalidate it when customers change. */
export const CUSTOMER_DETAIL_KEY = detailKey('customer');

/** One customer's full details (null uuid = nothing selected, no request). */
export function useCustomerDetail(uuid: string | null) {
  return useEntityDetail('customer', getCustomerDetails, uuid);
}
