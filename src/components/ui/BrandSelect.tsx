import { HierarchicalCreatableSelect } from './HierarchicalCreatableSelect';
import { getBrandList, createBrand } from '../../api/ItemApi';
import type { SelectOption } from './Select';
import { useInfiniteSelect } from '../../hooks';

export interface BrandSelectProps {
  value?: number | string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function BrandSelect({
  value,
  onChange,
  error,
  disabled = false,
}: BrandSelectProps) {
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
      const res = await getBrandList(page, 15, search || undefined);
      return {
        items: res?.data || [],
        hasMore: Boolean(res?.meta?.has_more_pages),
      };
    },
    mapItemToOption: (r: any) => ({
      value: String(r.id),
      label: r.brandName,
    }),
  });

  const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createBrand({
      brandName: values.brandName,
      parentId: values.parentId ? Number(values.parentId) : undefined,
      status: values.status ?? true,
    });
    const newOption: SelectOption = {
      value: String(created.id),
      label: created.brandName,
    };
    addOption(newOption);
    return newOption;
  };

  return (
    <HierarchicalCreatableSelect
      label="Brand"
      error={error}
      value={String(value ?? '')}
      onChange={onChange}
      options={options} 
      placeholder="Select Brand"
      createLabel="Add New Brand"
      onCreate={handleCreate}
      nameField="brandName"
      nameLabel="Brand Name"
      parentLabel="Parent Brand"
      disabled={disabled}
      isLoading={isLoading}
      // @ts-ignore
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      onSearchChange={onSearchChange}
    />
  );
}
