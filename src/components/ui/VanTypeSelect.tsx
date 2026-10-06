import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreatableSelect } from './CreatableSelect';
import { getVanTypeOptions, createVanType, type VanTypeOption } from '../../api/VanApi';
import type { SelectOption } from './Select';

export interface VanTypeSelectProps {
  value?: number | string;
  onChange: (val: number | '') => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function VanTypeSelect({ value, onChange, placeholder = 'Select van type', label, error, className, disabled = false }: VanTypeSelectProps) {
  const queryClient = useQueryClient();
  const { data: options = [], isLoading } = useQuery({
    queryKey: ['van-type-options'],
    queryFn: async (): Promise<SelectOption[]> => (await getVanTypeOptions()).map((o: VanTypeOption) => ({ value: String(o.value), label: o.label })),
  });

  const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
    const res = await createVanType({ name: values.name, parentId: values.parentId ? Number(values.parentId) : undefined, status: values.status ?? true });
    const created = res.data ?? res;
    const newOption: SelectOption = { value: String(created.id ?? ''), label: created.name };
    // Show the new option at once (and keep it for the next mount) without waiting for a refetch.
    queryClient.setQueryData<SelectOption[]>(['van-type-options'], (prev) => [newOption, ...(prev ?? [])]);
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
      createLabel="Add New Van Type"
      onCreate={handleCreate}
      disabled={disabled}
      isLoading={isLoading}
      loadingMessage="Loading van types..."
      fields={[
        { type: 'text', name: 'name', label: 'Van Type Name', required: true },
        { type: 'select', name: 'parentId', label: 'Parent Van Type', options, placeholder: 'None (top level)' },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
    />
  );
}

export default VanTypeSelect;
