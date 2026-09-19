import { useQuery } from '@tanstack/react-query';
import { getAllCountryMasters } from '../../api/CountryApi';

// Global ISO reference list — effectively static, so it's cached far longer
// than the 5 min default and shared across every page that needs the picker
// (Organisation View/Add/Edit, Settings > Country) instead of each refetching.
export function useCountryMasters() {
  const query = useQuery({
    queryKey: ['country-masters', 'all'],
    queryFn: getAllCountryMasters,
    staleTime: 30 * 60 * 1000,
  });

  return {
    countryMasters: query.data ?? [],
    isLoading: query.isLoading,
  };
}
