import { useState } from 'react';
import type { SelectKeyCombinationData } from '../../../../types/PricingPromoDiscount';

// ── Static data ───────────────────────────────────────────────────────────────
const KEY_COMBINATIONS = [
  { value: 'customer_material', label: 'Customer/Material' },
  { value: 'customer_item_group', label: 'Customer/Item Group' },
  { value: 'channel_material', label: 'Channel/Material' },
  { value: 'customer_category_material', label: 'Customer Category/Material' },
];

const selectCls =
  'block w-full px-3 py-2 text-sm rounded border border-primary-400 bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none';

const checkboxCls = 'w-4 h-4 accent-gray-900 dark:accent-white cursor-pointer rounded';
const checkLabelCls = 'flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]';
const sectionLabelCls = 'text-sm font-semibold text-[var(--text-primary)] mb-2 block';

interface Props {
  data: SelectKeyCombinationData;
  onChange: (data: SelectKeyCombinationData) => void;
}

export function SelectKeyCombinationTab({ data, onChange }: Props) {
  // Derive the human-readable selected keys for the summary line
  const selectedKeys: string[] = [];
  if (data.location.country) selectedKeys.push('Country');
  if (data.location.region) selectedKeys.push('Region');
  if (data.location.area) selectedKeys.push('Area');
  if (data.location.route) selectedKeys.push('Route');
  if (data.customer.salesOrganisation) selectedKeys.push('Sales Organisation');
  if (data.customer.channel) selectedKeys.push('Channel');
  if (data.customer.customerCategory) selectedKeys.push('Customer Category');
  if (data.customer.customer) selectedKeys.push('Customer');
  if (data.item.majorCategory) selectedKeys.push('Major Category');
  if (data.item.itemGroup) selectedKeys.push('Item Group');

  function updateLocation(key: keyof typeof data.location, val: boolean) {
    onChange({ ...data, location: { ...data.location, [key]: val } });
  }
  function updateCustomer(key: keyof typeof data.customer, val: boolean) {
    onChange({ ...data, customer: { ...data.customer, [key]: val } });
  }
  function updateItem(key: keyof typeof data.item, val: boolean) {
    onChange({ ...data, item: { ...data.item, [key]: val } });
  }

  return (
    <div className="space-y-5">
      {/* Select Key dropdown */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Select Key
        </label>
        <div className="relative">
          <select
            value={data.selectedCombination}
            onChange={(e) => onChange({ ...data, selectedCombination: e.target.value })}
            className={selectCls}
          >
            {KEY_COMBINATIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
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
        <p className="mt-2 text-xs text-[var(--text-secondary)] text-center">
          To create new key combination click on "+" Button.
        </p>
      </div>

      {/* + Button */}
      <div className="flex justify-center">
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-primary-600 text-white text-xl font-bold flex items-center justify-center hover:bg-primary-700 shadow transition-colors"
          title="Add new key combination"
        >
          +
        </button>
      </div>

      {/* Location */}
      <div>
        <span className={sectionLabelCls}>Location</span>
        <div className="grid grid-cols-3 gap-y-3 gap-x-6">
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.location.country} onChange={(e) => updateLocation('country', e.target.checked)} className={checkboxCls} />
            Country
          </label>
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.location.region} onChange={(e) => updateLocation('region', e.target.checked)} className={checkboxCls} />
            Region
          </label>
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.location.area} onChange={(e) => updateLocation('area', e.target.checked)} className={checkboxCls} />
            Area
          </label>
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.location.route} onChange={(e) => updateLocation('route', e.target.checked)} className={checkboxCls} />
            Route
          </label>
        </div>
      </div>

      {/* Customer */}
      <div>
        <span className={sectionLabelCls}>Customer</span>
        <div className="grid grid-cols-3 gap-y-3 gap-x-6">
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.customer.salesOrganisation} onChange={(e) => updateCustomer('salesOrganisation', e.target.checked)} className={checkboxCls} />
            Sales Organisation
          </label>
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.customer.channel} onChange={(e) => updateCustomer('channel', e.target.checked)} className={checkboxCls} />
            Channel
          </label>
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.customer.customerCategory} onChange={(e) => updateCustomer('customerCategory', e.target.checked)} className={checkboxCls} />
            Customer Category
          </label>
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.customer.customer} onChange={(e) => updateCustomer('customer', e.target.checked)} className={checkboxCls} />
            Customer
          </label>
        </div>
      </div>

      {/* Item */}
      <div>
        <span className={sectionLabelCls}>Item</span>
        <div className="grid grid-cols-3 gap-y-3 gap-x-6">
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.item.majorCategory} onChange={(e) => updateItem('majorCategory', e.target.checked)} className={checkboxCls} />
            Major Category
          </label>
          <label className={checkLabelCls}>
            <input type="checkbox" checked={data.item.itemGroup} onChange={(e) => updateItem('itemGroup', e.target.checked)} className={checkboxCls} />
            Item Group
          </label>
        </div>
      </div>

      {/* Key summary */}
      {selectedKeys.length > 0 && (
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Key: </span>
          {selectedKeys.join(', ')}
        </p>
      )}
    </div>
  );
}
