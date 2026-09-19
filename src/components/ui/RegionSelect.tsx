import { useState, useEffect } from 'react';
import { CreatableSelect } from './CreatableSelect';
import { getRegionList, createRegion } from '../../api/RegionApi';
import { getAllCountries, getAllCountryMasters } from '../../api/CountryApi';
import type { SelectOption } from './Select';
import { useInfiniteSelect } from '../../hooks';

let cachedCountryOptions: SelectOption[] | null = null;
let countryOptionsPromise: Promise<SelectOption[]> | null = null;

async function getCachedCountryOptions(): Promise<SelectOption[]> {
  if (cachedCountryOptions) return cachedCountryOptions;
  if (!countryOptionsPromise) {
    countryOptionsPromise = (async () => {
      try {
        let countries = await getAllCountries();
        if (!countries || countries.length === 0) {
          const masters = await getAllCountryMasters();
          countries = masters.map((m) => ({
            id: m.id,
            uuid: String(m.id),
            name: m.name,
            countryCode: m.countryCode ?? '',
          }));
        }
        cachedCountryOptions = countries.map((c) => ({
          value: c.id,
          label: c.countryCode ? `${c.countryCode} - ${c.name}` : c.name,
        }));
        return cachedCountryOptions;
      } catch {
        return [];
      } finally {
        countryOptionsPromise = null;
      }
    })();
  }
  return countryOptionsPromise;
}

export interface RegionSelectProps {
  value?: number | string;
  onChange: (val: number | '') => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function RegionSelect({
  value,
  onChange,
  placeholder = 'Select region',
  label,
  error,
  className,
  disabled = false,
}: RegionSelectProps) {
  const [countryOptions, setCountryOptions] = useState<SelectOption[]>(cachedCountryOptions || []);

  useEffect(() => {
    if (!cachedCountryOptions) {
      getCachedCountryOptions().then(setCountryOptions);
    }
  }, []);

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
      const res = await getRegionList(page, 15, search || undefined);
      return {
        items: res?.data || [],
        hasMore: Boolean(res?.meta?.has_more_pages),
      };
    },
    mapItemToOption: (r: any) => ({
      value: r.id,
      label: (r.regionCode ?? r.code)
        ? `${r.regionCode ?? r.code} - ${r.regionName ?? r.name}`
        : (r.regionName ?? r.name ?? String(r.id)),
    }),
  });

  const handleCreate = async (values: Record<string, any>): Promise<SelectOption> => {
    const res = await createRegion({
      regionName: values.name,
      name: values.name,
      regionCode: values.code || undefined,
      code: values.code || undefined,
      countryId: values.countryId ? Number(values.countryId) : (countryOptions[0]?.value ?? 1),
      status: values.status ?? true,
    });
    const created = res.data ?? res;
    const newOption: SelectOption = {
      value: String(created.id ?? ''),
      label: (created.regionCode ?? created.code)
        ? `${created.regionCode ?? created.code} - ${created.regionName ?? created.name}`
        : (created.regionName ?? created.name),
    };
    addOption(newOption);
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
      createLabel="Add New Region"
      onCreate={handleCreate}
      disabled={disabled}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      onSearchChange={onSearchChange}
      loadingMessage="Loading regions..."
      fields={[
        { type: 'text', name: 'name', label: 'Region Name', required: true },
        { type: 'text', name: 'code', label: 'Region Code', placeholder: 'e.g. RG01', required: true },
        { type: 'select', name: 'countryId', label: 'Country', options: countryOptions, placeholder: 'Select Country' },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
    />
  );
}

export default RegionSelect;
