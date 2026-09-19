import { useQuery } from '@tanstack/react-query';
import { Select, type SelectOption } from '../ui/Select';
import { getRouteOptions } from '../../api/RouteApi';

interface RouteSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  isLoading?: boolean;
}

export function RouteSelect({ label = 'Route', value, onChange, error, required, isLoading }: RouteSelectProps) {
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['route-options'],
    queryFn: () => getRouteOptions(),
    staleTime: 10 * 60 * 1000,
  });

  const routeOptions: SelectOption[] = routes.map(route => ({
    value: route.value.toString(),
    label: route.label,
  }));

  return (
    <Select
      label={required ? `${label}*` : label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={routeOptions}
      placeholder="Select route"
      isLoading={isLoading || isLoadingRoutes}
      error={error}
    />
  );
}

export default RouteSelect;
