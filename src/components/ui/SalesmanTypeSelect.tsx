import { useEffect, useState } from 'react';
import { CreatableSelect } from './CreatableSelect';
import { getSalesmanTypes, createSalesmanType } from '../../api/SalesmanApi';
import type { SelectOption } from './Select';

export interface SalesmanTypeSelectProps {
  value?: number | string;
  onChange: (val: number | '') => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SalesmanTypeSelect({
  value,
  onChange,
  placeholder = 'Select type',
  label,
  error,
  className,
  disabled = false,
  isLoading: isLoadingProp = false,
}: SalesmanTypeSelectProps) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getSalesmanTypes()
      .then((types) => setOptions(types.map((t) => ({ value: String(t.id), label: t.name }))))
      .catch(() => setOptions([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createSalesmanType({
      code: values.code,
      name: values.name,
      status: values.status ?? true,
    });
    const newOption: SelectOption = { value: String(created.id ?? ''), label: created.name };
    setOptions((prev) => [newOption, ...prev]);
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
      createLabel="Add New Salesman Type"
      onCreate={handleCreate}
      disabled={disabled}
      isLoading={isLoadingProp || isLoading}
      loadingMessage="Loading salesman types..."
      fields={[
        { type: 'text', name: 'code', label: 'Type Code', required: true, hasCodeSettings: true },
        { type: 'text', name: 'name', label: 'Type Name', required: true },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
    />
  );
}

export default SalesmanTypeSelect;
