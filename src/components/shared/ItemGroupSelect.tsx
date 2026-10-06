import { CreatableSelect } from '../ui/CreatableSelect';
import { getItemGroupList, createItemGroup } from '../../api/ItemGroupApi';
import type { SelectOption } from '../ui/Select';
import { useInfiniteSelect } from '../../hooks';

interface ItemGroupSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    initialOption?: SelectOption | null;
}

export function ItemGroupSelect({ label = 'Item Group', value, onChange, error, required, initialOption }: ItemGroupSelectProps) {
    const { options, isLoading, isLoadingMore, hasMore, onLoadMore, onSearchChange, addOption } = useInfiniteSelect({
        selectedValue: value,
        initialOption,
        fetchPage: async (page, search) => {
            const res = await getItemGroupList(page, 15, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (r: any) => ({ value: String(r.id), label: r.code ? `${r.code} - ${r.name}` : r.name || 'Group' }),
    });

    const handleCreateOption = async (values: Record<string, any>): Promise<SelectOption> => {
        const created = await createItemGroup({ code: values.code, name: values.name, status: values.status ?? true });
        const data = created.data || created;
        const newOption = { value: String(data.id ?? ''), label: data.code ? `${data.code} - ${data.name}` : data.name || values.name };
        addOption(newOption);
        return newOption;
    };

    return (
        <CreatableSelect
            label={required ? `${label}*` : label}
            value={String(value ?? '')}
            onChange={onChange}
            options={options}
            placeholder="Select Item Group"
            createLabel="Add New Group"
            onCreate={handleCreateOption}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            onSearchChange={onSearchChange}
            fields={[
                { type: 'text', name: 'code', label: 'Group Code', required: true, hasCodeSettings: true },
                { type: 'text', name: 'name', label: 'Group Name', required: true },
                { type: 'toggle', name: 'status', label: 'Active' },
            ]}
            error={error}
        />
    );
}
