import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, type SelectOption } from '../ui/Select';
import { getCurrencyMasterList } from '../../api/CurrencyApi';
import { useCountryMasters } from '../../hooks/Country/useCountryMasters';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import type { CurrencyMasterOption } from '../../types/Currency';

// ISO alpha-2 -> flag emoji (regional indicator symbols) — no image assets needed.
const toFlagEmoji = (countryCode: string) => countryCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

// A currency is shared by many countries — pin the well-known ones so USD
// doesn't show Ecuador's flag, GBP Guernsey's, etc.
const FLAG_OVERRIDES: Record<string, string> = { USD: 'US', EUR: 'EU', GBP: 'GB', CHF: 'CH', NZD: 'NZ', BND: 'BN' };

// U+200E (LTR mark) pins direction so RTL symbols (AED, SAR, JOD…) don't flip the label.
const currencyText = (m: Pick<CurrencyMasterOption, 'symbol' | 'code' | 'name'>) => `‎${m.symbol} ${m.code} - ${m.name}`;

/** currency code -> ISO country code for its flag. */
function useCurrencyFlags() {
  const { countryMasters } = useCountryMasters();
  return useMemo(() => {
    const map = new Map<string, string>();
    countryMasters.forEach((m) => {
      if (m.currencyCode && m.countryCode && !map.has(m.currencyCode)) map.set(m.currencyCode, m.countryCode);
    });
    Object.entries(FLAG_OVERRIDES).forEach(([code, cc]) => map.set(code, cc));
    return map;
  }, [countryMasters]);
}

/** One currency master by exact code (search endpoint), cached like the country list. */
function useCurrencyMasterByCode(code: string | undefined) {
  const { data } = useQuery({
    queryKey: ['currency-master', 'code', code],
    queryFn: async () => (await getCurrencyMasterList(1, 20, code)).data.find((m) => m.code === code) ?? null,
    enabled: Boolean(code),
    staleTime: 30 * 60 * 1000,
  });
  return data ?? null;
}

export interface CurrencyMasterSelectProps {
  /** Currency code, e.g. "AED" — what organisations and currencies store. */
  value: string | undefined;
  onChange: (master: CurrencyMasterOption | null) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  /** Extra classes for the Select button (e.g. a page's own design system). */
  className?: string;
}

/** Searchable, paged currency picker (flag + symbol + code + name) over currency masters. */
export function CurrencyMasterSelect({ value, onChange, label, error, placeholder = 'Select a currency', className }: CurrencyMasterSelectProps) {
  const flags = useCurrencyFlags();
  const mastersByCode = useRef(new Map<string, CurrencyMasterOption>());

  const toOption = useCallback(
    (m: CurrencyMasterOption): SelectOption => {
      const cc = flags.get(m.code);
      return { value: m.code, label: currencyText(m), prefix: cc ? toFlagEmoji(cc) : undefined };
    },
    [flags]
  );

  const { options, isLoading, isLoadingMore, hasMore, onLoadMore, onSearchChange, addOption } = useInfiniteSelect<CurrencyMasterOption>({
    selectedValue: value || undefined,
    fetchPage: async (page, search) => {
      const res = await getCurrencyMasterList(page, 20, search || undefined);
      res.data.forEach((m) => mastersByCode.current.set(m.code, m));
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: toOption,
  });

  // The saved currency may not be on the first loaded page — seed it so the button shows its label.
  const selected = useCurrencyMasterByCode(value || undefined);
  useEffect(() => {
    if (!selected) return;
    mastersByCode.current.set(selected.code, selected);
    addOption(toOption(selected));
  }, [selected, addOption, toOption]);

  return (
    <Select
      label={label}
      error={error}
      value={value ?? ''}
      onChange={(e) => onChange(mastersByCode.current.get(e.target.value) ?? null)}
      options={options}
      placeholder={placeholder}
      searchPlaceholder="Search currency…"
      isLoading={isLoading}
      loadingMessage="Loading currencies..."
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={onLoadMore}
      onSearchChange={onSearchChange}
      className={className}
    />
  );
}

/** Read-only twin of CurrencyMasterSelect: same flag + symbol + code + name for a currency code. */
export function CurrencyMasterLabel({ code }: { code: string | null | undefined }) {
  const flags = useCurrencyFlags();
  const master = useCurrencyMasterByCode(code || undefined);
  if (!code) return null;
  const cc = flags.get(code);
  return (
    <span className="inline-flex items-center gap-2">
      {cc && <span aria-hidden="true">{toFlagEmoji(cc)}</span>}
      {master ? currencyText(master) : code}
    </span>
  );
}

export default CurrencyMasterSelect;
