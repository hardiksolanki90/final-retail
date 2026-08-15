import type { KeyValueData } from '../../../../types/PricingPromoDiscount';

// ── Static sample options (replace with API data when available) ──────────────
const CUSTOMER_OPTIONS = [
  { value: 'c1', label: 'Union Co-Op(Branch)-Al Warqa, Union Co-Op-Aweer' },
  { value: 'c2', label: 'Carrefour Hypermarket' },
  { value: 'c3', label: 'Lulu Hypermarket' },
];

const ITEM_GROUP_OPTIONS = [
  { value: 'ig1', label: 'Mohammed Shahul#1667, Emirates Speciality Hospital' },
  { value: 'ig2', label: 'Dairy Products' },
  { value: 'ig3', label: 'Beverages' },
];

const inputCls =
  'block w-full px-3 py-2 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none';

const fieldLabelCls = 'block text-xs text-[var(--text-secondary)] mb-0.5';
const sectionLabelCls = 'text-sm font-medium text-[var(--text-primary)] mb-2 block';

interface Props {
  data: KeyValueData;
  onChange: (data: KeyValueData) => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={fieldLabelCls}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          <option value="">— Select —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function KeyValueTab({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Customer section */}
      <div>
        <span className={sectionLabelCls}>Customer</span>
        <SelectField
          label="Customer"
          value={data.customerId}
          options={CUSTOMER_OPTIONS}
          onChange={(v) => onChange({ ...data, customerId: v })}
        />
      </div>

      {/* Item section */}
      <div>
        <span className={sectionLabelCls}>Item</span>
        <SelectField
          label="Item Group"
          value={data.itemGroupId}
          options={ITEM_GROUP_OPTIONS}
          onChange={(v) => onChange({ ...data, itemGroupId: v })}
        />
      </div>
    </div>
  );
}
