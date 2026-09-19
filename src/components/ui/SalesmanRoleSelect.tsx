import { useEffect, useState } from 'react';
import { CreatableSelect } from './CreatableSelect';
import { getSalesmanRoles, createSalesmanRole } from '../../api/SalesmanApi';
import type { SelectOption } from './Select';

export interface SalesmanRoleSelectProps {
  value?: number | string;
  onChange: (val: number | '') => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SalesmanRoleSelect({
  value,
  onChange,
  placeholder = 'Select role',
  label,
  error,
  className,
  disabled = false,
  isLoading: isLoadingProp = false,
}: SalesmanRoleSelectProps) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getSalesmanRoles()
      .then((roles) => setOptions(roles.map((r) => ({ value: String(r.id), label: r.name }))))
      .catch(() => setOptions([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createSalesmanRole({
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
      createLabel="Add New Salesman Role"
      onCreate={handleCreate}
      disabled={disabled}
      isLoading={isLoadingProp || isLoading}
      loadingMessage="Loading salesman roles..."
      fields={[
        { type: 'text', name: 'code', label: 'Role Code', required: true, hasCodeSettings: true },
        { type: 'text', name: 'name', label: 'Role Name', required: true },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
    />
  );
}

export default SalesmanRoleSelect;
