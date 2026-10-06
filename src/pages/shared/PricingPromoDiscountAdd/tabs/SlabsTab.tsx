import { Plus, Trash2 } from 'lucide-react';
import type { RuleFormData, RuleSlabRow } from '../../../../types/PricingPromoDiscount';

const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';

const inputCls =
  'block w-full px-2 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors';

const numberInputCls = `${inputCls} ${mono}`;

const thCls = `px-3 py-3 text-left text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] ${mono}`;

const tdCls = 'px-3 py-2 text-sm';

const sectionLabelCls = `text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${mono}`;

let idCounter = 0;
function newId() {
  return `new-${++idCounter}`;
}

interface Props {
  data: RuleFormData;
  onChange: (data: RuleFormData) => void;
  /** 'promotion': bought-qty ranges that each give a free qty (per offer item). */
  mode?: 'discount' | 'promotion';
}

export function SlabsTab({ data, onChange, mode = 'discount' }: Props) {
  const promotion = mode === 'promotion';
  // Discount Type (set in the Discount section above) decides which column
  // applies to every slab row — Fixed shows Value, Percentage shows
  // Percentage. Unset shows both, so existing data isn't hidden.
  const showValue = promotion || data.discountType !== 'percentage';
  const showPercentage = !promotion && data.discountType !== 'fixed';
  const columnCount = 3 + (showValue ? 1 : 0) + (showPercentage ? 1 : 0);

  function updateRow(id: string, field: keyof RuleSlabRow, value: string) {
    onChange({ ...data, slabs: data.slabs.map((r) => (r.id === id ? { ...r, [field]: value } : r)) });
  }

  function addRow() {
    onChange({ ...data, slabs: [...data.slabs, { id: newId(), minSlab: '', maxSlab: '', value: '', percentage: '' }] });
  }

  function deleteRow(id: string) {
    onChange({ ...data, slabs: data.slabs.filter((r) => r.id !== id) });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className={sectionLabelCls}>
          {promotion
            ? 'Free-goods Slabs — bought quantity ranges, each giving a free quantity per offer item'
            : data.discountApplyOn === 'value'
              ? 'Discount Slabs — value ranges, each with a flat value or a percentage'
              : 'Discount Slabs — quantity ranges, each with a flat value or a percentage'}
        </p>
        <span className={`text-[11px] text-[var(--text-muted)] ${mono}`}>
          {data.slabs.length} row{data.slabs.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b-2 border-[var(--border-color)]">
              <th className={thCls} style={{ width: '25%' }}>
                {!promotion && data.discountApplyOn === 'value' ? 'Min Value' : 'Min Qty'}
              </th>
              <th className={thCls} style={{ width: '25%' }}>
                {!promotion && data.discountApplyOn === 'value' ? 'Max Value' : 'Max Qty'}
              </th>
              {showValue && (
                <th className={thCls} style={{ width: '20%' }}>
                  {promotion ? 'Free Qty' : 'Value'}
                </th>
              )}
              {showPercentage && (
                <th className={thCls} style={{ width: '20%' }}>
                  Percentage
                </th>
              )}
              <th className={thCls}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {data.slabs.length === 0 && (
              <tr>
                <td colSpan={columnCount} className={`px-3 py-8 text-center text-sm text-[var(--text-muted)] ${mono}`}>
                  No slabs added yet.
                </td>
              </tr>
            )}
            {data.slabs.map((row) => (
              <tr key={row.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className={tdCls}>
                  <input type="number" min="0" value={row.minSlab} onChange={(e) => updateRow(row.id, 'minSlab', e.target.value)} className={numberInputCls} />
                </td>
                <td className={tdCls}>
                  <input type="number" min="0" value={row.maxSlab} onChange={(e) => updateRow(row.id, 'maxSlab', e.target.value)} className={numberInputCls} />
                </td>
                {showValue && (
                  <td className={tdCls}>
                    <input type="number" min="0" value={row.value} onChange={(e) => updateRow(row.id, 'value', e.target.value)} className={numberInputCls} />
                  </td>
                )}
                {showPercentage && (
                  <td className={tdCls}>
                    <input type="number" min="0" value={row.percentage} onChange={(e) => updateRow(row.id, 'percentage', e.target.value)} className={numberInputCls} />
                  </td>
                )}
                <td className={tdCls}>
                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
        <Plus className="w-3.5 h-3.5" />
        Add Slab
      </button>
    </div>
  );
}
