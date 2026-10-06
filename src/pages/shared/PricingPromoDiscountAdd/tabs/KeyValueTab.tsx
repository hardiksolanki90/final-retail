import { KeyRound } from 'lucide-react';
import type { RuleFormData } from '../../../../types/PricingPromoDiscount';
import { MultiSelect } from '../../../../components/ui/MultiSelect';
import type { SelectOption } from '../../../../components/ui/Select';
import { useInfiniteSelect } from '../../../../hooks/useInfiniteSelect';
import { getCountryList } from '../../../../api/CountryApi';
import { getRegionList } from '../../../../api/RegionApi';
import { getAreaList } from '../../../../api/AreaApi';
import { getRouteList } from '../../../../api/RouteApi';
import { getSalesOrganisationList, getChannelList, getCustomerCategoryList } from '../../../../api/CustomerApi';
import { getItemCategoryList } from '../../../../api/ItemApi';
import { DIMENSION_ORDER, type SelectedKeys } from './SelectKeyCombinationTab';

interface Props {
    selectedKeys: SelectedKeys;
    data: RuleFormData;
    onChange: (data: RuleFormData) => void;
    customers: SelectOption[];
    itemGroups: SelectOption[];
    items: SelectOption[];
}

const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';
const sectionLabelCls = `text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${mono}`;

export function KeyValueTab({ selectedKeys, data, onChange, customers, itemGroups, items }: Props) {
    const anySelected = DIMENSION_ORDER.some((d) => selectedKeys[d.key]);

    const country = useInfiniteSelect({
        enabled: selectedKeys.country,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getCountryList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (c: any) => ({ value: c.uuid, label: c.countryCode ? `${c.countryCode} - ${c.name}` : c.name }),
    });

    const region = useInfiniteSelect({
        enabled: selectedKeys.region,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getRegionList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (r: any) => ({ value: r.uuid, label: r.regionCode ? `${r.regionCode} - ${r.regionName}` : r.regionName }),
    });

    const area = useInfiniteSelect({
        enabled: selectedKeys.area,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getAreaList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (a: any) => ({ value: a.uuid, label: (a.areaCode ?? a.code) ? `${a.areaCode ?? a.code} - ${a.areaName ?? a.name}` : (a.areaName ?? a.name) }),
    });

    const route = useInfiniteSelect({
        enabled: selectedKeys.route,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getRouteList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (r: any) => ({ value: r.uuid, label: r.code ? `${r.code} - ${r.routeName}` : r.routeName }),
    });

    const salesOrganisation = useInfiniteSelect({
        enabled: selectedKeys.salesOrganisation,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getSalesOrganisationList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (s: any) => ({ value: s.uuid, label: s.name }),
    });

    const channel = useInfiniteSelect({
        enabled: selectedKeys.channel,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getChannelList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (c: any) => ({ value: c.uuid, label: c.channelName ?? c.name }),
    });

    const customerCategory = useInfiniteSelect({
        enabled: selectedKeys.customerCategory,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getCustomerCategoryList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (c: any) => ({ value: c.uuid, label: c.categoryName ?? c.name }),
    });

    const itemCategory = useInfiniteSelect({
        enabled: selectedKeys.itemCategory,
        fetchPage: async (page, search, perPage = 15) => {
            const res = await getItemCategoryList(page, perPage, search || undefined);
            return { items: res?.data || [], hasMore: Boolean(res?.meta?.has_more_pages) };
        },
        mapItemToOption: (c: any) => ({ value: c.uuid, label: c.categoryName }),
    });

    const infiniteFor: Partial<Record<keyof SelectedKeys, ReturnType<typeof useInfiniteSelect>>> = { country, region, area, route, salesOrganisation, channel, customerCategory, itemCategory };

    const staticOptionsFor: Partial<Record<keyof SelectedKeys, SelectOption[]>> = { customer: customers, itemGroup: itemGroups, item: items };

    if (!anySelected) {
        return (
            <div className="max-w-2xl flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                    <KeyRound className="w-5 h-5" />
                </div>
                <p className={`text-sm text-[var(--text-secondary)] ${mono}`}>No keys selected — go back to "Select Key Combination" and pick at least one.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {(['Location', 'Customer', 'Item'] as const).map((group) => {
                const dims = DIMENSION_ORDER.filter((d) => d.group === group && selectedKeys[d.key]);
                if (dims.length === 0) return null;

                return (
                    <div key={group} className="space-y-4 pb-6 border-b border-[var(--border-color)] last:border-b-0 last:pb-0">
                        <p className={sectionLabelCls}>{group}</p>
                        <div className="space-y-4">
                            {dims.map(({ key, label, field }) => {
                                const staticOptions = staticOptionsFor[key];
                                const value = data[field] as unknown as string[];
                                const setValue = (vals: string[]) => onChange({ ...data, [field]: vals });

                                if (staticOptions) {
                                    return <MultiSelect key={key} label={label} placeholder={`— All ${label.toLowerCase()}s —`} searchable value={value} onChange={setValue} options={staticOptions} />;
                                }

                                const infinite = infiniteFor[key]!;
                                return (
                                    <MultiSelect
                                        key={key}
                                        label={label}
                                        placeholder={`— All ${label.toLowerCase()}s —`}
                                        searchable
                                        value={value}
                                        onChange={setValue}
                                        options={infinite.options}
                                        isLoading={infinite.isLoading}
                                        isLoadingMore={infinite.isLoadingMore}
                                        hasMore={infinite.hasMore}
                                        onLoadMore={infinite.onLoadMore}
                                        onSearchChange={infinite.onSearchChange}
                                        onLoadAll={infinite.loadAll}
                                        isLoadingAll={infinite.isLoadingAll}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
