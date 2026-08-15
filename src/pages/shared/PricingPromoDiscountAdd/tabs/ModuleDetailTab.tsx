import type { ModuleDetailData, OrderItemRow, OfferItemRow, ModuleType } from '../../../../types/PricingPromoDiscount';

// ── Static options ────────────────────────────────────────────────────────────
const ITEM_OPTIONS = [
  { value: 'item1', label: 'Miico SL Milk FF 1L' },
  { value: 'item2', label: 'Oasis LL Plain 5G1X1' },
  { value: 'item3', label: 'Coca-Cola 330ml' },
  { value: 'item4', label: 'Pepsi 500ml' },
];

const UOM_OPTIONS = [
  { value: 'pcs', label: 'PCS' },
  { value: 'kg', label: 'KG' },
  { value: 'ltr', label: 'LTR' },
  { value: 'ctn', label: 'CTN' },
];

const ORDER_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'rush', label: 'Rush' },
];

const OFFER_TYPE_OPTIONS = [
  { value: 'free_goods', label: 'Free Goods' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
];

// ── Shared class strings ──────────────────────────────────────────────────────
const inputCls =
  'block w-full px-2 py-1.5 text-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors';

const selectCls = `${inputCls} appearance-none`;

const thCls =
  'px-3 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide bg-[var(--bg-secondary)]';

const tdCls = 'px-3 py-2 text-sm';

// ── Row ID counter ────────────────────────────────────────────────────────────
let idCounter = 200;
function uid() { return String(++idCounter); }

// ── Combobox-style item select with clear (x) ─────────────────────────────────
function ItemSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectCls} pr-8`}
      >
        <option value=""></option>
        {ITEM_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs leading-none"
          title="Clear"
        >
          ×
        </button>
      )}
      <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
        <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ── Action buttons ────────────────────────────────────────────────────────────
function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add
    </button>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete
    </button>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  moduleType: ModuleType;
  data: ModuleDetailData;
  onChange: (data: ModuleDetailData) => void;
}

export function ModuleDetailTab({ data, onChange }: Props) {
  // ── Order Items helpers ───────────────────────────────────────────────────
  function updateOrderItem(id: string, field: keyof OrderItemRow, value: string) {
    onChange({
      ...data,
      orderItems: data.orderItems.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    });
  }

  function addOrderItem() {
    onChange({
      ...data,
      orderItems: [
        ...data.orderItems,
        { id: uid(), itemName: '', quantity: '', uom: '', price: '' },
      ],
    });
  }

  function deleteOrderItem(id: string) {
    onChange({
      ...data,
      orderItems: data.orderItems.filter((r) => r.id !== id),
    });
  }

  // ── Offer Items helpers ───────────────────────────────────────────────────
  function updateOfferItem(id: string, field: keyof OfferItemRow, value: string) {
    onChange({
      ...data,
      offerItems: data.offerItems.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    });
  }

  function addOfferItem() {
    onChange({
      ...data,
      offerItems: [
        ...data.offerItems,
        { id: uid(), itemName: '', uom: '', offeredQuantity: '' },
      ],
    });
  }

  function deleteOfferItem(id: string) {
    onChange({
      ...data,
      offerItems: data.offerItems.filter((r) => r.id !== id),
    });
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Name</label>
        <input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className={inputCls}
          placeholder=""
        />
      </div>

      {/* Start Date / End Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Start Date</label>
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => onChange({ ...data, startDate: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">End Date</label>
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => onChange({ ...data, endDate: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* Order Type / Offer Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Order Type:</label>
          <div className="relative">
            <select
              value={data.orderType}
              onChange={(e) => onChange({ ...data, orderType: e.target.value })}
              className={selectCls}
            >
              <option value=""></option>
              {ORDER_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Offer Type:</label>
          <div className="relative">
            <select
              value={data.offerType}
              onChange={(e) => onChange({ ...data, offerType: e.target.value })}
              className={selectCls}
            >
              <option value=""></option>
              {OFFER_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Order Item table */}
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Order Item:</p>
        <div className="border border-[var(--border-color)] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className={thCls} style={{ width: '35%' }}>Item Name</th>
                <th className={thCls} style={{ width: '15%' }}>Quantity</th>
                <th className={thCls} style={{ width: '18%' }}>UOM</th>
                <th className={thCls} style={{ width: '18%' }}>Price</th>
                <th className={thCls} style={{ width: '14%' }}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {data.orderItems.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className={tdCls}>
                    <ItemSelect value={row.itemName} onChange={(v) => updateOrderItem(row.id, 'itemName', v)} />
                  </td>
                  <td className={tdCls}>
                    <input
                      value={row.quantity}
                      onChange={(e) => updateOrderItem(row.id, 'quantity', e.target.value)}
                      className={inputCls}
                      type="number"
                      min="0"
                      placeholder=""
                    />
                  </td>
                  <td className={tdCls}>
                    <div className="relative">
                      <select
                        value={row.uom}
                        onChange={(e) => updateOrderItem(row.id, 'uom', e.target.value)}
                        className={selectCls}
                      >
                        <option value=""></option>
                        {UOM_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                        <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}>
                    <input
                      value={row.price}
                      onChange={(e) => updateOrderItem(row.id, 'price', e.target.value)}
                      className={inputCls}
                      type="number"
                      min="0"
                      placeholder=""
                    />
                  </td>
                  <td className={tdCls}>
                    {data.orderItems.indexOf(row) === 0 ? (
                      <AddBtn onClick={addOrderItem} />
                    ) : (
                      <DeleteBtn onClick={() => deleteOrderItem(row.id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Item table */}
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Offer Item:</p>
        <div className="border border-[var(--border-color)] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className={thCls} style={{ width: '35%' }}>Item Name</th>
                <th className={thCls} style={{ width: '22%' }}>UOM</th>
                <th className={thCls} style={{ width: '25%' }}>Offered Quantity</th>
                <th className={thCls} style={{ width: '18%' }}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {data.offerItems.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className={tdCls}>
                    <ItemSelect value={row.itemName} onChange={(v) => updateOfferItem(row.id, 'itemName', v)} />
                  </td>
                  <td className={tdCls}>
                    <div className="relative">
                      <select
                        value={row.uom}
                        onChange={(e) => updateOfferItem(row.id, 'uom', e.target.value)}
                        className={selectCls}
                      >
                        <option value=""></option>
                        {UOM_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                        <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className={tdCls}>
                    <input
                      value={row.offeredQuantity}
                      onChange={(e) => updateOfferItem(row.id, 'offeredQuantity', e.target.value)}
                      className={inputCls}
                      type="number"
                      min="0"
                      placeholder=""
                    />
                  </td>
                  <td className={tdCls}>
                    {data.offerItems.indexOf(row) === 0 ? (
                      <AddBtn onClick={addOfferItem} />
                    ) : (
                      <DeleteBtn onClick={() => deleteOfferItem(row.id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
