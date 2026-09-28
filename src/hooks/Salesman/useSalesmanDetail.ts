import { useQuery } from '@tanstack/react-query';
import { getSalesmanDetails } from '../../api/SalesmanApi';

export function useSalesmanDetail(uuid?: string) {
  const query = useQuery({
    queryKey: ['salesman-detail', uuid],
    queryFn: () => getSalesmanDetails(uuid!),
    enabled: !!uuid,
  });

  return {
    salesman: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
