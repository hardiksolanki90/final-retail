import { useRef } from 'react';
import ReactFlagsSelect from 'react-flags-select';
import { Select } from '../ui/Select';
import { useCountryMasters } from '../../hooks/Country/useCountryMasters';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import { getCountryMasterList } from '../../api/CountryApi';
import type { CountryMaster } from '../../types/Country';

// ISO alpha-2 -> flag emoji (regional indicator symbols) — no image assets needed.
const toFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

export interface CountryMasterSelectProps {
  value: number | string | undefined;
  onChange: (master: CountryMaster | null) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  /** 'select' (default) matches the app's standard Select/AreaSelect dropdown,
   *  loaded page-by-page. 'flags' uses react-flags-select's own chrome (full
   *  list, since it needs every country for its own search) — for pages
   *  (like the Organisation onboarding wizard) with their own design system. */
  variant?: 'select' | 'flags';
  selectButtonClassName?: string;
}

export function CountryMasterSelect({
  value,
  onChange,
  label,
  error,
  placeholder = 'Select a country',
  variant = 'select',
  selectButtonClassName = '!rounded-lg !border !border-gray-300 !w-full !py-2',
}: CountryMasterSelectProps) {
  const { countryMasters } = useCountryMasters();
  const mastersById = useRef(new Map<number, CountryMaster>());

  const {
    options,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    onSearchChange,
  } = useInfiniteSelect<CountryMaster>({
    selectedValue: value,
    fetchPage: async (page, search) => {
      const res = await getCountryMasterList(page, 20, search || undefined);
      res.data.forEach((m) => mastersById.current.set(m.id, m));
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (m) => ({
      value: m.id,
      label: m.name,
      prefix: toFlagEmoji(m.countryCode),
    }),
  });

  if (variant === 'flags') {
    const masterByCountryCode = new Map(countryMasters.map((m) => [m.countryCode, m]));
    const codeByMasterId = new Map(countryMasters.map((m) => [String(m.id), m.countryCode]));
    const customLabels: Record<string, string> = {};
    countryMasters.forEach((m) => { customLabels[m.countryCode] = m.name; });

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        )}
        <ReactFlagsSelect
          selected={codeByMasterId.get(String(value ?? '')) || ''}
          onSelect={(code) => onChange(masterByCountryCode.get(code) ?? null)}
          countries={countryMasters.map((m) => m.countryCode)}
          customLabels={customLabels}
          searchable
          searchPlaceholder="Search country…"
          placeholder={placeholder}
          selectButtonClassName={selectButtonClassName}
        />
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <Select
      label={label}
      error={error}
      value={value ? String(value) : ''}
      onChange={(e) => onChange(mastersById.current.get(Number(e.target.value)) ?? null)}
      options={options}
      placeholder={placeholder}
      isLoading={isLoading}
      loadingMessage="Loading countries..."
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={onLoadMore}
      onSearchChange={onSearchChange}
    />
  );
}

export default CountryMasterSelect;
