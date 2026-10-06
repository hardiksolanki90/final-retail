import { baseUomFor, uomsForItem } from '../../../../utils/itemUoms';
import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { RuleFormData, RuleItemRow, RowType, RuleType } from '../../../../types/PricingPromoDiscount';
import { Select, type SelectOption } from '../../../../components/ui/Select';

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
  moduleType: RuleType;
  data: RuleFormData;
  onChange: (data: RuleFormData) => void;
  items: SelectOption[];
  itemUoms: SelectOption[];
}

function optionLabel(options: SelectOption[], value: string | undefined, fallback: string | undefined): string {
  if (!value) return '—';
  return options.find((o) => String(o.value) === value)?.label ?? fallback ?? value;
}

interface TableProps {
  rowType: RowType;
  title: string;
  showPrice: boolean;
  showQuantity: boolean;
  rows: RuleItemRow[];
  items: SelectOption[];
  itemUoms: SelectOption[];
  onAdd: (row: RuleItemRow) => void;
  onUpdate: (id: string, row: Partial<RuleItemRow>) => void;
  onDelete: (id: string) => void;
}

// Pick item + UOM (+ quantity/price), click "+ Add" to push it into the
// table below — matches legacy's Key Value item picker (pick-then-add, with
// a per-row edit action) instead of inline-editable rows.
function ItemsTable({ rowType, title, showPrice, showQuantity, rows, items, itemUoms, onAdd, onUpdate, onDelete }: TableProps) {
  const [draftItemId, setDraftItemId] = useState('');
  const [draftUomId, setDraftUomId] = useState('');
  const [draftQuantity, setDraftQuantity] = useState('');
  const [draftPrice, setDraftPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const columnCount = 2 + (showQuantity ? 1 : 0) + (showPrice ? 1 : 0) + 1;
  const canSubmit = Boolean(draftItemId) && Boolean(draftUomId) && (!showQuantity || Boolean(draftQuantity)) && (!showPrice || Boolean(draftPrice));

  function resetDraft() {
    setDraftItemId('');
    setDraftUomId('');
    setDraftQuantity('');
    setDraftPrice('');
    setEditingId(null);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const draft = { itemId: draftItemId, uomId: draftUomId, quantity: draftQuantity, price: draftPrice };
    if (editingId) {
      onUpdate(editingId, draft);
    } else {
      onAdd({ id: newId(), rowType, ...draft });
    }
    resetDraft();
  }

  function handleEdit(row: RuleItemRow) {
    setDraftItemId(row.itemId);
    setDraftUomId(row.uomId ?? '');
    setDraftQuantity(row.quantity ?? '');
    setDraftPrice(row.price ?? '');
    setEditingId(row.id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className={sectionLabelCls}>{title}</p>
        <span className={`text-[11px] text-[var(--text-muted)] ${mono}`}>
          {rows.length} row{rows.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className={`grid gap-3 items-end ${showQuantity && showPrice ? 'grid-cols-5' : showQuantity || showPrice ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <div className="col-span-2">
          <Select
            value={draftItemId}
            onChange={(e) => {
              // A UOM belongs to its item — picking another item resets to that item's base UOM.
              setDraftItemId(e.target.value);
              setDraftUomId(baseUomFor(items, e.target.value) ?? '');
            }}
            options={items}
            placeholder="Item"
            searchable
          />
        </div>
        <Select value={draftUomId} onChange={(e) => setDraftUomId(e.target.value)} options={uomsForItem(items, draftItemId)} placeholder={draftItemId ? 'Item Uom' : 'Select item first'} searchable />
        {showQuantity && (
          <input
            type="number"
            min="0"
            value={draftQuantity}
            onChange={(e) => setDraftQuantity(e.target.value)}
            placeholder={rowType === 'offer' ? 'Offered Quantity' : 'Quantity'}
            className={numberInputCls}
          />
        )}
        {showPrice && <input type="number" min="0" value={draftPrice} onChange={(e) => setDraftPrice(e.target.value)} placeholder="Price" className={numberInputCls} />}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg border border-[var(--border-color)]"
              title="Cancel edit"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b-2 border-[var(--border-color)]">
              <th className={thCls}>Item Name</th>
              <th className={thCls}>Item Uom</th>
              {showQuantity && <th className={thCls}>{rowType === 'offer' ? 'Offered Quantity' : 'Quantity'}</th>}
              {showPrice && <th className={thCls}>Price</th>}
              <th className={thCls}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {rows.length === 0 && (
              <tr>
                <td colSpan={columnCount} className={`px-3 py-8 text-center text-sm text-[var(--text-muted)] ${mono}`}>
                  No items added yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className={`hover:bg-[var(--bg-secondary)] transition-colors ${editingId === row.id ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                <td className={tdCls}>{optionLabel(items, row.itemId, row.itemName)}</td>
                <td className={tdCls}>{optionLabel(itemUoms, row.uomId, row.uomName)}</td>
                {showQuantity && <td className={`${tdCls} ${mono}`}>{row.quantity || '—'}</td>}
                {showPrice && <td className={`${tdCls} ${mono}`}>{row.price || '—'}</td>}
                <td className={tdCls}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(row)}
                      className="inline-flex items-center justify-center p-1.5 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(row.id);
                        if (editingId === row.id) resetDraft();
                      }}
                      className="inline-flex items-center justify-center p-1.5 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ItemsTab({ moduleType, data, onChange, items, itemUoms }: Props) {
  const isPricing = moduleType === 'pricing';

  function rowsOf(rowType: RowType): RuleItemRow[] {
    return data.items.filter((r) => r.rowType === rowType);
  }

  function setRows(rowType: RowType, rows: RuleItemRow[]) {
    onChange({ ...data, items: [...data.items.filter((r) => r.rowType !== rowType), ...rows] });
  }

  function addRow(rowType: RowType, row: RuleItemRow) {
    setRows(rowType, [...rowsOf(rowType), row]);
  }

  function updateRow(rowType: RowType, id: string, patch: Partial<RuleItemRow>) {
    setRows(
      rowType,
      rowsOf(rowType).map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  function deleteRow(rowType: RowType, id: string) {
    setRows(
      rowType,
      rowsOf(rowType).filter((r) => r.id !== id)
    );
  }

  if (isPricing) {
    return (
      <div className="space-y-8">
        <ItemsTable
          rowType="order"
          title="Priced Items"
          showPrice
          showQuantity={false}
          rows={rowsOf('order')}
          items={items}
          itemUoms={itemUoms}
          onAdd={(row) => addRow('order', row)}
          onUpdate={(id, patch) => updateRow('order', id, patch)}
          onDelete={(id) => deleteRow('order', id)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ItemsTable
        rowType="order"
        title="Order Items — what the customer must buy"
        showPrice
        showQuantity
        rows={rowsOf('order')}
        items={items}
        itemUoms={itemUoms}
        onAdd={(row) => addRow('order', row)}
        onUpdate={(id, patch) => updateRow('order', id, patch)}
        onDelete={(id) => deleteRow('order', id)}
      />
      <ItemsTable
        rowType="offer"
        title="Offer Items — what the customer gets"
        showPrice={false}
        showQuantity
        rows={rowsOf('offer')}
        items={items}
        itemUoms={itemUoms}
        onAdd={(row) => addRow('offer', row)}
        onUpdate={(id, patch) => updateRow('offer', id, patch)}
        onDelete={(id) => deleteRow('offer', id)}
      />
    </div>
  );
}
