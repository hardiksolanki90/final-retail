import { Select } from '../../components/ui/Select';
import { getSalesmanOptions } from '../../api/SalesmanApi';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import type { SalesmanSelectOption } from '../../types/Salesman';

interface SalesmanSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  /** Adds a first option with an empty value (a filter's "All salesmen"). */
  allLabel?: string;
  enabled?: boolean;
}

/** Searchable salesman dropdown that loads more as you scroll; the value is the salesman's user id (integer, as a string). */
export function SalesmanSelect({ value, onChange, label, error, allLabel, enabled = true }: SalesmanSelectProps) {
  const select = useInfiniteSelect({
    enabled,
    selectedValue: value,
    fetchPage: async (page, search) => {
      const res = await getSalesmanOptions(page, search || undefined);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (salesman: SalesmanSelectOption) => ({ value: String(salesman.userId), label: [salesman.salesmanCode, salesman.name].filter(Boolean).join(' - ') }),
  });
  const options = allLabel ? [{ value: '', label: allLabel }, ...select.options] : select.options;
  return <Select label={label} value={value} onChange={(e) => onChange(e.target.value)} options={options} isLoading={select.isLoading} isLoadingMore={select.isLoadingMore} hasMore={select.hasMore} onLoadMore={select.onLoadMore} onSearchChange={select.onSearchChange} placeholder="Select salesman" searchPlaceholder="Search by code or name…" error={error} />;
}
