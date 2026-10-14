import { Select } from '../../components/ui/Select';
import { getRouteList } from '../../api/RouteApi';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';

interface RouteSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  /** Adds a first option with an empty value (a filter's "All routes"). */
  allLabel?: string;
  enabled?: boolean;
}

interface RouteRow {
  id: number;
  code: string;
  name: string;
}

/** Searchable route dropdown that loads more as you scroll; the value is the route's integer id as a string. */
export function RouteSelect({ value, onChange, label, error, allLabel, enabled = true }: RouteSelectProps) {
  const select = useInfiniteSelect({
    enabled,
    selectedValue: value,
    fetchPage: async (page, search) => {
      const res = await getRouteList(page, 25, search || undefined);
      return { items: res.data as RouteRow[], hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (route: RouteRow) => ({ value: String(route.id), label: [route.code, route.name].filter(Boolean).join(' - ') }),
  });
  const options = allLabel ? [{ value: '', label: allLabel }, ...select.options] : select.options;
  return <Select label={label} value={value} onChange={(e) => onChange(e.target.value)} options={options} isLoading={select.isLoading} isLoadingMore={select.isLoadingMore} hasMore={select.hasMore} onLoadMore={select.onLoadMore} onSearchChange={select.onSearchChange} placeholder="Select route" searchPlaceholder="Search by code or name…" error={error} />;
}
