import { ChevronDown, type LucideIcon } from 'lucide-react';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Shown as the empty choice, e.g. "Select Status"; leave out when a value is always picked. */
  placeholder?: string;
  icon?: LucideIcon;
  /** Box width class, e.g. "w-[233px]". */
  width: string;
}

/** The record view's filter box: native select with a leading icon and a chevron. */
export function FilterSelect({ label, value, onChange, options, placeholder, icon: Icon, width }: FilterSelectProps) {
  return (
    <label className={`relative inline-flex h-10 shrink-0 items-center ${width}`}>
      {Icon && <Icon className="pointer-events-none absolute left-[9px] h-4 w-4 text-[var(--rv-icon)]" />}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-full w-full cursor-pointer appearance-none truncate rounded-[4px] border border-[var(--rv-border)] bg-[var(--rv-bg)] pr-9 text-[15px] shadow-[0_1px_2px_rgb(0_0_0/0.04)] outline-none focus:border-[var(--rv-accent-border)] focus:ring-2 focus:ring-[var(--rv-ring)] ${Icon ? 'pl-[31px]' : 'pl-2.5'} ${value ? 'text-[var(--rv-ink)]' : 'text-[var(--rv-secondary)]'}`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-[18px] w-[18px] text-[var(--rv-icon)]" />
    </label>
  );
}
