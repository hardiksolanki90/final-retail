import { useState } from 'react';
import { Select, type SelectOption } from './Select';
import { QuickCreateModal, type QuickCreateField } from './QuickCreateModal';

export interface CreatableSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Modal title, e.g. "Add New Category". */
  createLabel: string;
  /** Field schema for the quick-create modal — see the entity's migration for the real column list. */
  fields: QuickCreateField[];
  onCreate: (values: Record<string, any>) => Promise<SelectOption>;
  isLoading?: boolean;
  loadingMessage?: string;
  disabled?: boolean;
  className?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onSearchChange?: (query: string) => void;
  pageSize?: number;
}

export function CreatableSelect({
  label,
  error,
  placeholder,
  options,
  value,
  onChange,
  createLabel,
  fields,
  onCreate,
  isLoading = false,
  loadingMessage = 'Loading...',
  disabled = false,
  className,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onSearchChange,
  pageSize,
}: CreatableSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (values: Record<string, any>) => {
    const created = await onCreate(values);
    onChange(String(created.value));
  };

  return (
    <>
      <Select
        label={label}
        error={error}
        placeholder={placeholder}
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        disabled={disabled}
        className={className}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
        onSearchChange={onSearchChange}
        pageSize={pageSize}
        createAction={{
          label: createLabel,
          onClick: () => setIsModalOpen(true),
        }}
      />
      <QuickCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={createLabel}
        fields={fields}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export default CreatableSelect;
