import { getSalesmanDetails } from '../../api/SalesmanApi';
import { useEntityDetail } from '../useEntityDetail';

/** One salesman's full details through the shared detail cache (same key the provider invalidates after a save). */
export function useSalesmanDetail(uuid?: string) {
    const query = useEntityDetail('salesman', getSalesmanDetails, uuid);

    return { salesman: query.data, isLoading: query.isLoading, isError: query.isError, error: query.error };
}
