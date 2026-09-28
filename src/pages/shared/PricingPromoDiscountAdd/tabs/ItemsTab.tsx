import type { RuleFormData, RuleItemRow, RowType } from '../../../../types/PricingPromoDiscount';
import type { SelectOption } from '../../../../components/ui/Select';

const inputCls =
  'block w-full px-2 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors';

const selectCls = `${inputCls} appearance-none`;

const thCls =
  'px-3 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide bg-[var(--bg-secondary)]';

const tdCls = 'px-3 py-2 text-sm';

let idCounter = 0;
function newId() {
  return `new-${++idCounter}`;
}

interface Props {
  data: RuleFormData;
  onChange: (data: RuleFormData) => void;
  items: SelectOption[];
  itemUoms: SelectOption[];
}

function ItemSelect({ value, options, onChange }: { value: string; options: SelectOption[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      <option value="">— Select item —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function UomSelect({ value, options, onChange }: { value: string; options: SelectOption[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
      <option value="">— UOM —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function ItemsTab({ data, onChange, items, itemUoms }: Props) {
  function rowsOf(rowType: RowType): RuleItemRow[] {
    return data.items.filter((r) => r.rowType === rowType);
  }

  function setRows(rowType: RowType, rows: RuleItemRow[]) {
    onChange({
      ...data,
      items: [...data.items.filter((r) => r.rowType !== rowType), ...rows],
    });
  }

  function updateRow(rowType: RowType, id: string, field: keyof RuleItemRow, value: string) {
    setRows(rowType, rowsOf(rowType).map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow(rowType: RowType) {
    setRows(rowType, [
      ...rowsOf(rowType),
      { id: newId(), rowType, itemId: '', uomId: '', quantity: '', price: '' },
    ]);
  }

  function deleteRow(rowType: RowType, id: string) {
    setRows(rowType, rowsOf(rowType).filter((r) => r.id !== id));
  }

  function renderTable(rowType: RowType, title: string, showPrice: boolean) {
    const rows = rowsOf(rowType);
    return (
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{title}</p>
        <div className="border border-[var(--border-color)] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className={thCls} style={{ width: '40%' }}>Item</th>
                <th className={thCls} style={{ width: '20%' }}>UOM</th>
                <th className={thCls} style={{ width: '15%' }}>Quantity</th>
                {showPrice && <th className={thCls} style={{ width: '15%' }}>Price</th>}
                <th className={thCls}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={showPrice ? 5 : 4} className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">
                    No items added yet.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className={tdCls}>
                    <ItemSelect value={row.itemId} options={items} onChange={(v) => updateRow(rowType, row.id, 'itemId', v)} />
                  </td>
                  <td className={tdCls}>
                    <UomSelect value={row.uomId ?? ''} options={itemUoms} onChange={(v) => updateRow(rowType, row.id, 'uomId', v)} />
                  </td>
                  <td className={tdCls}>
                    <input
                      type="number"
                      min="0"
                      value={row.quantity ?? ''}
                      onChange={(e) => updateRow(rowType, row.id, 'quantity', e.target.value)}
                      className={inputCls}
                    />
                  </td>
                  {showPrice && (
                    <td className={tdCls}>
                      <input
                        type="number"
                        min="0"
                        value={row.price ?? ''}
                        onChange={(e) => updateRow(rowType, row.id, 'price', e.target.value)}
                        className={inputCls}
                      />
                    </td>
                  )}
                  <td className={tdCls}>
                    <button
                      type="button"
                      onClick={() => deleteRow(rowType, row.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => addRow(rowType)}
          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          + Add Row
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderTable('order', 'Order Items (what the customer must buy)', true)}
      {renderTable('offer', 'Offer Items (what the customer gets)', false)}
    </div>
  );
}
