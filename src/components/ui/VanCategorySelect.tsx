import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreatableSelect } from './CreatableSelect';
import { getVanCategoryOptions, createVanCategory, type VanCategoryOption } from '../../api/VanApi';
import type { SelectOption } from './Select';

export interface VanCategorySelectProps {
  value?: number | string;
  onChange: (val: number | '') => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function VanCategorySelect({ value, onChange, placeholder = 'Select van category', label, error, className, disabled = false }: VanCategorySelectProps) {
  const queryClient = useQueryClient();
  const { data: options = [], isLoading } = useQuery({
    queryKey: ['van-category-options'],
    queryFn: async (): Promise<SelectOption[]> => (await getVanCategoryOptions()).map((o: VanCategoryOption) => ({ value: String(o.value), label: o.label })),
  });

  const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
    const res = await createVanCategory({ name: values.name, parentId: values.parentId ? Number(values.parentId) : undefined, status: values.status ?? true });
    const created = res.data ?? res;
    const newOption: SelectOption = { value: String(created.id ?? ''), label: created.name };
    // Show the new option at once (and keep it for the next mount) without waiting for a refetch.
    queryClient.setQueryData<SelectOption[]>(['van-category-options'], (prev) => [newOption, ...(prev ?? [])]);
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
      createLabel="Add New Van Category"
      onCreate={handleCreate}
      disabled={disabled}
      isLoading={isLoading}
      loadingMessage="Loading van categories..."
      fields={[
        { type: 'text', name: 'name', label: 'Van Category Name', required: true },
        { type: 'select', name: 'parentId', label: 'Parent Van Category', options, placeholder: 'None (top level)' },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
    />
  );
}

export default VanCategorySelect;
