import { useAuth } from '../../context/AuthContext';

/** Money formatting in the organisation's effective currency (from global config). */
export function useMoney() {
  const currency = useAuth().currency;
  const code = currency?.code ?? '';
  const digits = currency?.decimalDigits ?? 2;
  const prefix = code ? `${code} ` : '';

  const format = (value: number | string | null | undefined): string => `${prefix}${(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

  /** Dashboard style: 1.2M / 350K / 900. */
  const formatCompact = (value: number, millionDigits = 1): string => {
    if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(millionDigits)}M`;
    if (value >= 1_000) return `${prefix}${(value / 1_000).toFixed(0)}K`;
    return `${prefix}${value.toFixed(0)}`;
  };

  return { code, digits, format, formatCompact };
}
