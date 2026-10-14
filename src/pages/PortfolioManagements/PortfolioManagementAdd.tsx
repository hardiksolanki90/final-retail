import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { DatePicker } from '../../components/ui/DatePicker';
import { format, parse, isValid } from 'date-fns';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { FormSkeleton } from '../../components/ui/skeleton';
import { getCustomerOptions } from '../../api/CustomerApi';
import { getStockItemOptions } from '../../api/StockApi';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import { usePortfolioManagement, usePortfolioManagementActions } from '../../hooks/PortfolioManagements/usePortfolioManagements';
import { showToast } from '../../lib/toast';
import type { CustomerSelectOption } from '../../types/Customer';
import type { StockItemOption } from '../../types/Stock';
import type { PortfolioManagementItem } from '../../types/PortfolioManagement';

function parseDateValue(value: string | undefined | null): Date | null {
  if (!value) return null;
  const raw = value.slice(0, 10);
  const parsed = parse(raw, 'yyyy-MM-dd', new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

interface PortfolioManagementAddProps {
  isOpen?: boolean;
  onClose: () => void;
  editUuid?: string | null;
}

export function PortfolioManagementAdd({ isOpen = true, onClose, editUuid }: PortfolioManagementAddProps) {
  const isEdit = Boolean(editUuid);
  const { data: existing, isLoading: isLoadingExisting } = usePortfolioManagement(isOpen ? (editUuid ?? null) : null);
  const { create, update } = usePortfolioManagementActions();

  // Header form states
  const [code, setCode] = useState('');
  const [codeLocked, setCodeLocked] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState(true);
  const [customerIds, setCustomerIds] = useState<string[]>([]);

  // Items table state
  const [items, setItems] = useState<PortfolioManagementItem[]>([]);

  // Item entry box states ("Add Item" card)
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemOption, setSelectedItemOption] = useState<StockItemOption | null>(null);
  const [listingFees, setListingFees] = useState('');
  const [storePrice, setStorePrice] = useState('');
  const [customerItemCode, setCustomerItemCode] = useState('');
  const [uomId, setUomId] = useState('');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Customer dropdown
  const customerSelect = useInfiniteSelect({
    fetchPage: async (page, search, perPage) => {
      const res = await getCustomerOptions(page, search || undefined, perPage);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (c: CustomerSelectOption) => ({
      value: String(c.value),
      label: [c.code, c.label].filter(Boolean).join(' - '),
    }),
  });

  // Item dropdown
  const itemSelect = useInfiniteSelect({
    fetchPage: async (page, search) => {
      const res = await getStockItemOptions(page, search || undefined);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (opt: StockItemOption) => opt,
  });

  // Pre-fill existing record when editing
  useEffect(() => {
    if (existing) {
      setCode(existing.code || '');
      setName(existing.name || '');
      setStartDate(existing.startDate || '');
      setEndDate(existing.endDate || '');
      setStatus(existing.status ?? true);

      const ids: string[] = [];
      if (existing.customers && existing.customers.length > 0) {
        existing.customers.forEach((cust) => {
          const val = String(cust.customerId || cust.userId);
          if (val) {
            ids.push(val);
            const label = [cust.customerCode, cust.customerName].filter(Boolean).join(' - ') || val;
            customerSelect.addOption({ value: val, label });
          }
        });
      } else if (existing.customerId) {
        const val = String(existing.customerId);
        ids.push(val);
        const label = [existing.customerCode, existing.customerName].filter(Boolean).join(' - ') || val;
        customerSelect.addOption({ value: val, label });
      }
      setCustomerIds(ids);

      setItems(existing.items || []);
    } else if (!isEdit) {
      setCode('');
      setName('');
      setStartDate('');
      setEndDate('');
      setStatus(true);
      setCustomerIds([]);
      setItems([]);
      resetItemForm();
    }
  }, [existing, isEdit]);

  const resetItemForm = () => {
    setSelectedItemId('');
    setSelectedItemOption(null);
    setListingFees('');
    setStorePrice('');
    setCustomerItemCode('');
    setUomId('');
    setEditingItemIndex(null);
  };

  // Handle item pick in "Select Item" box
  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedItemId(val);
    const opt = (itemSelect.options as StockItemOption[]).find((o) => String(o.value) === String(val)) ?? null;
    setSelectedItemOption(opt);
    if (opt?.uoms && opt.uoms.length > 0) {
      const base = opt.uoms.find((u) => u.isBase) ?? opt.uoms[0];
      setUomId(String(base.value));
    } else {
      setUomId('');
    }
  };

  // Add / Update item row
  const handleAddOrUpdateItem = () => {
    if (!selectedItemId) {
      showToast.error('Please select an item');
      return;
    }
    if (!storePrice || Number(storePrice) < 0) {
      showToast.error('Please enter a valid store price');
      return;
    }

    const numericItemId = Number(selectedItemId);
    const existingIndex = items.findIndex((it) => it.itemId === numericItemId);

    if (editingItemIndex === null && existingIndex !== -1) {
      showToast.error('This item is already added to the portfolio');
      return;
    }

    let itemCode = selectedItemOption?.label?.split(' - ')[0] || '';
    let itemName = selectedItemOption?.label?.split(' - ').slice(1).join(' - ') || selectedItemOption?.label || '';

    // If editing existing item where option might not have been re-selected
    if (!itemName && editingItemIndex !== null && items[editingItemIndex]) {
      itemCode = items[editingItemIndex].itemCode || itemCode;
      itemName = items[editingItemIndex].itemName || itemName;
    }

    const selectedUom = selectedItemOption?.uoms?.find((u) => String(u.value) === String(uomId));

    const newItem: PortfolioManagementItem = {
      itemId: numericItemId,
      itemCode,
      itemName,
      storePrice: Number(storePrice),
      listingFees: listingFees ? Number(listingFees) : 0,
      customerItemCode: customerItemCode.trim() || null,
      uomId: uomId ? Number(uomId) : null,
      uomName: selectedUom?.label || (editingItemIndex !== null ? items[editingItemIndex]?.uomName : null) || null,
    };

    if (editingItemIndex !== null) {
      const updated = [...items];
      updated[editingItemIndex] = newItem;
      setItems(updated);
    } else {
      setItems((prev) => [...prev, newItem]);
    }

    resetItemForm();
  };

  // Load item into form for editing
  const handleEditItemRow = (index: number) => {
    const item = items[index];
    setEditingItemIndex(index);
    setSelectedItemId(String(item.itemId));
    const opt = (itemSelect.options as StockItemOption[]).find((o) => String(o.value) === String(item.itemId)) ?? null;
    setSelectedItemOption(opt);
    setStorePrice(String(item.storePrice));
    setListingFees(item.listingFees != null ? String(item.listingFees) : '');
    setCustomerItemCode(item.customerItemCode || '');
    setUomId(item.uomId ? String(item.uomId) : '');
  };

  // Remove item row
  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editingItemIndex === index) {
      resetItemForm();
    }
  };

  // Save Portfolio
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast.error('Please enter portfolio name');
      return;
    }
    if (!startDate) {
      showToast.error('Please select Valid From date');
      return;
    }
    if (!endDate) {
      showToast.error('Please select Valid To date');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      showToast.error('Valid To date must be on or after Valid From date');
      return;
    }
    if (customerIds.length === 0) {
      showToast.error('Please select at least one customer');
      return;
    }

    const payload = {
      code: code.trim() || undefined,
      name: name.trim(),
      startDate,
      endDate,
      status,
      customerId: customerIds[0] ?? null,
      customers: customerIds.map((id) => ({ customerId: id })),
      items: items.map((it) => ({
        itemId: it.itemId,
        storePrice: it.storePrice,
        listingFees: it.listingFees,
        customerItemCode: it.customerItemCode,
        uomId: it.uomId,
      })),
    };

    if (isEdit && editUuid) {
      update.mutate(
        { uuid: editUuid, payload },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isSaving = create.isPending || update.isPending;

  // UOM Options for the Item Picker
  const uomOptions =
    selectedItemOption?.uoms && selectedItemOption.uoms.length > 0
      ? selectedItemOption.uoms
      : uomId
        ? [{ value: uomId, label: items[editingItemIndex ?? -1]?.uomName || 'Selected UOM' }]
        : [];

  const footer = (
    <div className="flex items-center justify-between gap-3">
      {/* Status Switch (Footer Left) */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Status:</span>
        <button
          type="button"
          role="switch"
          aria-checked={status}
          aria-label="Status"
          onClick={() => setStatus((prev) => !prev)}
          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${status ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${status ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
        >
          {status ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Buttons (Footer Right) */}
      <div className="flex items-center gap-3">
        <CancelButton onClick={onClose} disabled={isSaving}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="portfolio-form" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEdit ? 'Update Portfolio' : 'Save Portfolio'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Portfolio' : 'Add Portfolio'}
      width="w-[740px] max-w-full"
      footer={footer}
      isLoading={isEdit && isLoadingExisting}
      skeleton={<FormSkeleton fields={['code', 'input', ['input', 'input'], 'select', 'section', 'input']} />}
    >
      <form id="portfolio-form" onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Section 1: Portfolio Information */}
        <div className="space-y-4">
          <div className="border-b border-[var(--border-color)] pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              General Information
            </h3>
          </div>

          {/* Portfolio Code */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Portfolio Code
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={codeLocked}
                placeholder="Auto-generated if left blank"
                className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              />
              <OrderCodeSettingsIcon
                label="Portfolio Code"
                value={code}
                onChange={setCode}
                entityKey="portfolio_management"
                onLockChange={setCodeLocked}
              />
            </div>
          </div>

          {/* Portfolio Name */}
          <Input
            label="Portfolio Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Modern Trade Key Accounts"
          />

          {/* Validity Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatePicker
              label="Valid From"
              required
              selected={parseDateValue(startDate)}
              onChange={(date) => {
                const nextStart = date ? format(date, 'yyyy-MM-dd') : '';
                setStartDate(nextStart);
                if (nextStart && endDate && nextStart > endDate) {
                  setEndDate('');
                }
              }}
              placeholderText="Select start date"
              dateFormat="MMM d, yyyy"
            />
            <DatePicker
              label="Valid To"
              required
              selected={parseDateValue(endDate)}
              onChange={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
              placeholderText="Select end date"
              dateFormat="MMM d, yyyy"
              minDate={parseDateValue(startDate) ?? undefined}
            />
          </div>

          {/* Customer Selection */}
          <MultiSelect
            label="Customers"
            required
            value={customerIds}
            onChange={setCustomerIds}
            options={customerSelect.options}
            isLoading={customerSelect.isLoading}
            isLoadingMore={customerSelect.isLoadingMore}
            isLoadingAll={customerSelect.isLoadingAll}
            hasMore={customerSelect.hasMore}
            onLoadMore={customerSelect.onLoadMore}
            onSearchChange={customerSelect.onSearchChange}
            onLoadAll={customerSelect.loadAll}
            placeholder="Select customers"
            searchable
            searchPlaceholder="Search customer by name or code…"
          />
        </div>

        {/* Section 2: Item Entry Card */}
        <div className="space-y-4">
          <div className="border-b border-[var(--border-color)] pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Product Pricing & Items
            </h3>
          </div>

          {/* Item Picker Card */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs font-bold">
                  {editingItemIndex !== null ? '✎' : '+'}
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {editingItemIndex !== null ? `Edit Item #${editingItemIndex + 1}` : 'Add Item to Portfolio'}
                </span>
              </div>
              {editingItemIndex !== null && (
                <button
                  type="button"
                  onClick={resetItemForm}
                  className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Item Dropdown */}
            <div>
              <Select
                label="Stock Item"
                value={selectedItemId}
                onChange={handleItemSelect}
                options={itemSelect.options}
                isLoading={itemSelect.isLoading}
                isLoadingMore={itemSelect.isLoadingMore}
                hasMore={itemSelect.hasMore}
                onLoadMore={itemSelect.onLoadMore}
                onSearchChange={itemSelect.onSearchChange}
                placeholder="Search and select item…"
                searchPlaceholder="Type item code or name…"
              />
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Input
                label="Store Price"
                type="number"
                step="0.01"
                min="0"
                value={storePrice}
                onChange={(e) => setStorePrice(e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="Listing Fees"
                type="number"
                step="0.01"
                min="0"
                value={listingFees}
                onChange={(e) => setListingFees(e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="Customer Item Code"
                value={customerItemCode}
                onChange={(e) => setCustomerItemCode(e.target.value)}
                placeholder="SKU / Barcode"
              />
              <Select
                label="UOM"
                value={uomId}
                onChange={(e) => setUomId(e.target.value)}
                options={uomOptions}
                placeholder="Select UOM"
                searchPlaceholder="Search UOM…"
              />
            </div>

            {/* Add / Update Item Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddOrUpdateItem}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
              >
                {editingItemIndex !== null ? (
                  <>
                    <Check className="w-4 h-4" />
                    Update Item
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Item
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Added Items Table - Only visible once at least one item is added */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Items in Portfolio{' '}
                  <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
                    ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </span>
                </h4>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-color)] shadow-xs">
                <table className="min-w-full divide-y divide-[var(--border-color)] text-xs">
                  <thead className="bg-[var(--bg-secondary)]/80">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-3 py-2.5 text-right font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Store Price
                      </th>
                      <th className="px-3 py-2.5 text-right font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Listing Fees
                      </th>
                      <th className="px-3 py-2.5 text-left font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Customer Code
                      </th>
                      <th className="px-3 py-2.5 text-center font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        UOM
                      </th>
                      <th className="px-3 py-2.5 text-center font-bold text-[var(--text-muted)] uppercase tracking-wider w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                    {items.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors hover:bg-[var(--bg-secondary)]/40 ${editingItemIndex === idx ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                          }`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-[var(--text-primary)]">
                              {item.itemName || 'Unnamed Item'}
                            </span>
                            {item.itemCode && (
                              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                                {item.itemCode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-[var(--text-primary)]">
                          {Number(item.storePrice).toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[var(--text-secondary)]">
                          {item.listingFees != null && Number(item.listingFees) > 0
                            ? Number(item.listingFees).toFixed(2)
                            : '—'}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[var(--text-secondary)]">
                          {item.customerItemCode || '—'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {item.uomName ? (
                            <span className="inline-block rounded-md bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                              {item.uomName}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditItemRow(idx)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-md transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
                              title="Remove item"
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
          )}
        </div>
      </form>
    </Drawer>
  );
}
