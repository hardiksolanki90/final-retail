import { useQuery } from '@tanstack/react-query';
import { getSalesmanLoginHistory } from '../../api/SalesmanApi';

/** The salesman's recent app logins (no user id = no request). */
export function useSalesmanLoginHistory(userId?: number) {
  return useQuery({ queryKey: ['salesman-login-history', userId], queryFn: () => getSalesmanLoginHistory(userId as number), enabled: Boolean(userId) });
}
