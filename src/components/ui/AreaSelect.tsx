import { CreatableSelect } from './CreatableSelect';
import { getAreaList, createArea } from '../../api/AreaApi';
import type { SelectOption } from './Select';
import { useInfiniteSelect } from '../../hooks';

export interface AreaSelectProps {
  value?: number | string;
  onChange: (val: number | '') => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function AreaSelect({
  value,
  onChange,
  placeholder = 'Select area',
  label,
  error,
  className,
  disabled = false,
}: AreaSelectProps) {
  const {
    options,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    onSearchChange,
    addOption,
  } = useInfiniteSelect({
    selectedValue: value,
    fetchPage: async (page, search) => {
      const res = await getAreaList(page, 15, search || undefined);
      return {
        items: res?.data || [],
        hasMore: Boolean(res?.meta?.has_more_pages),
      };
    },
    mapItemToOption: (a: any) => ({
      value: a.id,
      label: (a.areaCode ?? a.code)
        ? `${a.areaCode ?? a.code} - ${a.areaName ?? a.name}`
        : (a.areaName ?? a.name ?? String(a.id)),
    }),
  });

  const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
    const res = await createArea({
      areaName: values.name,
      areaCode: values.code || undefined,
      parentId: values.parentId ? Number(values.parentId) : undefined,
      status: values.status ?? true,
    });
    const created = res.data ?? res;
    const newOption: SelectOption = {
      value: String(created.id ?? ''),
      label: (created.areaCode ?? created.code)
        ? `${created.areaCode ?? created.code} - ${created.areaName ?? created.name}`
        : (created.areaName ?? created.name),
    };
    addOption(newOption);
    return newOption;
  };

  return (
    <CreatableSelect
      label={label}
      error={error}
      value={String(value ?? '')}
      onChange={(val) => onChange(val ? Number(val) : '')}
      options={options}
      placeholder={placeholder}
      className={className}
      createLabel="Add New Area"
      onCreate={handleCreate}
      disabled={disabled}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      onSearchChange={onSearchChange}
      loadingMessage="Loading areas..."
      fields={[
        { type: 'text', name: 'name', label: 'Area Name', required: true },
        { type: 'text', name: 'code', label: 'Area Code', placeholder: 'e.g. AR01' },
        { type: 'select', name: 'parentId', label: 'Parent Area', options, placeholder: 'None (top level)' },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
    />
  );
}

export default AreaSelect;
