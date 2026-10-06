import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select } from './Select';
import { getTaxRegions } from '../../api/TaxApi';

interface StateSelectProps {
  /** ISO country code; the list is the country's states / provinces. */
  countryCode?: string | null;
  /** The stored state name (free text — may be "gujarat", "GJ" or empty). */
  value: string;
  onChange: (state: string) => void;
  /** Shown instead when the country has no state list (any country but India and Canada). */
  fallback: ReactNode;
  placeholder?: string;
}

const key = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');

/**
 * State / province picker for countries whose tax depends on it (India GST,
 * Canada GST/HST/PST/QST — see the server's TaxRegions). It stores the full
 * name so the customer address and server-side matching keep working; any other
 * country gets `fallback`, the plain text field.
 */
export function StateSelect({ countryCode, value, onChange, fallback, placeholder = 'Select state' }: StateSelectProps) {
  const { data: regions = [] } = useQuery({ queryKey: ['tax-regions', countryCode], queryFn: () => getTaxRegions(countryCode), enabled: Boolean(countryCode), staleTime: Infinity });

  const { options, selected } = useMemo(() => {
    const match = regions.find((r) => key(r.name) === key(value) || key(r.code) === key(value));
    const list = regions.map((r) => ({ value: r.name, label: r.name }));
    // Keep an unrecognised saved value selectable rather than silently dropping it.
    if (value && !match) list.unshift({ value, label: value });
    return { options: list, selected: match?.name ?? value };
  }, [regions, value]);

  if (regions.length === 0) return <>{fallback}</>;

  return <Select value={selected} onChange={(e) => onChange(String(e.target.value))} options={options} placeholder={placeholder} />;
}
