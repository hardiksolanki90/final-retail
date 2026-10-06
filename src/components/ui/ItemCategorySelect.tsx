import { HierarchicalCreatableSelect } from './HierarchicalCreatableSelect';
import { getItemCategoryList, createItemCategory } from '../../api/ItemApi';
import type { SelectOption } from './Select';
import { useInfiniteSelect } from '../../hooks';

export interface ItemCategorySelectProps {
    value?: number | string;
    onChange: (val: string) => void;
    error?: string;
    disabled?: boolean;
    initialOption?: SelectOption | null;
}

export function ItemCategorySelect({ value, onChange, error, disabled = false, initialOption }: ItemCategorySelectProps) {
    const { options, isLoading, isLoadingMore, hasMore, onLoadMore, onSearchChange, addOption } = useInfiniteSelect({
        selectedValue: value,
        initialOption,
        fetchPage: async (page, search) => {
            const res = await getItemCategoryList(page, 15, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (r: any) => ({ value: String(r.id), label: r.categoryName }),
    });

    const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
        const created = await createItemCategory({ categoryName: values.categoryName, parentId: values.parentId ? Number(values.parentId) : undefined, status: values.status ?? true });
        const newOption: SelectOption = { value: String(created.id), label: created.categoryName };
        addOption(newOption);
        return newOption;
    };

    // We pass `parentOptions` (all loaded options) so the Parent dropdown has all categories,
    // but the main dropdown is fully paginated.
    return (
        <HierarchicalCreatableSelect
            label="Category"
            error={error}
            value={String(value ?? '')}
            onChange={onChange}
            options={options} // Main dropdown options (paginated)
            placeholder="Select Category"
            createLabel="Add New Category"
            onCreate={handleCreate}
            nameField="categoryName"
            nameLabel="Category Name"
            parentLabel="Parent Category"
            disabled={disabled}
            isLoading={isLoading}
            // @ts-ignore - passing extra props to Select inside HierarchicalCreatableSelect
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            onSearchChange={onSearchChange}
        />
    );
}
