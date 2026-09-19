import { CreatableSelect } from './CreatableSelect';
import type { SelectOption } from './Select';

export interface HierarchicalCreatableSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  createLabel: string;
  onCreate: (values: Record<string, any>) => Promise<SelectOption>;
  /** Form field name for the entity's own name, e.g. 'categoryName', 'brandName'. */
  nameField: string;
  nameLabel: string;
  parentLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Dropdown + quick-create modal for lookup entities shaped like the nfpc
 * reference schema: name + parent_id + node_level + status (Category, Brand).
 * Reuse this instead of hand-rolling the field list per entity.
 */
export function HierarchicalCreatableSelect({
  label,
  error,
  placeholder,
  options,
  value,
  onChange,
  createLabel,
  onCreate,
  nameField,
  nameLabel,
  parentLabel = 'Parent',
  isLoading,
  disabled,
  className,
}: HierarchicalCreatableSelectProps) {
  return (
    <CreatableSelect
      label={label}
      error={error}
      placeholder={placeholder}
      options={options}
      value={value}
      onChange={onChange}
      createLabel={createLabel}
      onCreate={onCreate}
      isLoading={isLoading}
      disabled={disabled}
      className={className}
      fields={[
        { type: 'text', name: nameField, label: nameLabel, required: true },
        { type: 'select', name: 'parentId', label: parentLabel, options, placeholder: 'Select Parent (optional)' },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
    />
  );
}

export default HierarchicalCreatableSelect;
