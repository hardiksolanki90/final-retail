import { Select } from './Select';
import { getItemUomList } from '../../api/ItemApi';
import { useInfiniteSelect } from '../../hooks';

export interface ItemUomSelectProps {
  label?: string;
  value?: number | string;
  onChange: (val: string) => void;
  onSelectOption?: (option: { value: string | number; label: string }) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function ItemUomSelect({
  label = 'UOM',
  value,
  onChange,
  onSelectOption,
  error,
  disabled = false,
  required = false,
}: ItemUomSelectProps) {
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
      const res = await getItemUomList(page, 15, search || undefined);
      return {
        items: res?.data || [],
        hasMore: Boolean(res?.meta?.has_more_pages),
      };
    },
    mapItemToOption: (r: any) => ({
      value: String(r.id),
      label: `${r.name} (${r.code})`,
    }),
  });

  return (
    <Select
      label={label}
      error={error}
      value={String(value ?? '')}
      onChange={(e) => {
        onChange(e.target.value);
        if (onSelectOption) {
          const selected = options.find((o) => o.value === e.target.value);
          if (selected) onSelectOption(selected);
        }
      }}
      options={options} 
      placeholder="Select UOM"
      disabled={disabled}
      required={required}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      onSearchChange={onSearchChange}
    />
  );
}
