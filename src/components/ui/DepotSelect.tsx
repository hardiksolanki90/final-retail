import { Select } from './Select';
import { getDepotList } from '../../api/DepotApi';
import { useInfiniteSelect } from '../../hooks';

export interface DepotSelectProps {
  value?: number | string;
  onChange: (val: number | '') => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function DepotSelect({
  value,
  onChange,
  placeholder = 'Select depot',
  label,
  error,
  className,
  disabled = false,
}: DepotSelectProps) {
  const {
    options,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    onSearchChange,
  } = useInfiniteSelect({
    selectedValue: value,
    fetchPage: async (page, search) => {
      const res = await getDepotList(page, 15, search || undefined);
      return {
        items: res?.data || [],
        hasMore: Boolean(res?.meta?.has_more_pages),
      };
    },
    mapItemToOption: (d: any) => ({
      value: d.id,
      label: (d.depotCode ?? d.code)
        ? `${d.depotCode ?? d.code} - ${d.depotName ?? d.name}`
        : (d.depotName ?? d.name ?? String(d.id)),
    }),
  });

  return (
    <Select
      label={label}
      error={error}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      onSearchChange={onSearchChange}
      loadingMessage="Loading depots..."
      searchable={true}
      searchPlaceholder="Search depot..."
    />
  );
}

export default DepotSelect;
