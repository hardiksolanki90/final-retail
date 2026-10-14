import { useState, useEffect, useMemo } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MultiSelect, type SelectOption } from '../../components/ui/MultiSelect';
import { DatePicker } from '../../components/ui/DatePicker';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { getCustomerOptions } from '../../api/CustomerApi';
import { getStockItemOptions } from '../../api/StockApi';
import { getAllItemUoms } from '../../api/ItemUomApi';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import { showToast } from '../../lib/toast';
import type { CustomerSelectOption } from '../../types/Customer';
import type { StockItemOption } from '../../types/Stock';
import type { StockInStoreRecord, StockInStoreItemDetail } from '../../types/StockInStore';

interface StockInStoreAddProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: StockInStoreRecord | null;
  onSave?: (savedRecord: StockInStoreRecord) => void;
}

function parseDateValue(value: string | undefined | null): Date | null {
  if (!value) return null;
  const raw = value.slice(0, 10);
  const parsed = parse(raw, 'yyyy-MM-dd', new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
}

export function StockInStoreAdd({ isOpen, onClose, editItem, onSave }: StockInStoreAddProps) {
  const isEditing = Boolean(editItem);

  // General Details form state
  const [activityName, setActivityName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [assignedCustomers, setAssignedCustomers] = useState<string[]>([]);
  const [status, setStatus] = useState(true);

  // Item Picker form state
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemOption, setSelectedItemOption] = useState<StockItemOption | null>(null);
  const [selectedUom, setSelectedUom] = useState('');
  const [selectedUomId, setSelectedUomId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Items table state
  const [items, setItems] = useState<StockInStoreItemDetail[]>([]);

  // Fallback UOM options from ItemUomApi
  const [globalUoms, setGlobalUoms] = useState<SelectOption[]>([]);

  // Form error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer dropdown with infinite scrolling & search
  const customerSelect = useInfiniteSelect({
    fetchPage: async (page, search, perPage) => {
      const res = await getCustomerOptions(page, search || undefined, perPage);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (c: CustomerSelectOption) => ({
      value: String(c.value),
      label: [c.code, c.label].filter(Boolean).join(' - '),
    }),
    enabled: isOpen,
  });

  // Item dropdown with infinite scrolling & search
  const itemSelect = useInfiniteSelect({
    fetchPage: async (page, search) => {
      const res = await getStockItemOptions(page, search || undefined);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (opt: StockItemOption) => opt,
    enabled: isOpen,
  });

  // Load global UOM list once for fallback
  useEffect(() => {
    let active = true;
    async function loadUoms() {
      try {
        const uomRes = await getAllItemUoms();
        if (active && uomRes?.length) {
          setGlobalUoms(uomRes);
        }
      } catch {
        // ignore
      }
    }
    if (isOpen) {
      void loadUoms();
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Pre-fill form when editing an existing item, or reset when adding fresh
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setEditingRowIndex(null);
      return;
    }

    if (editItem) {
      setActivityName(editItem.activityName || '');
      setDateFrom(editItem.dateFrom || '');
      setDateTo(editItem.dateTo || '');
      setStatus(editItem.status !== false);

      const custIds: string[] = [];
      if (editItem.customers && editItem.customers.length > 0) {
        editItem.customers.forEach((c) => {
          const val = String(c.code || c.id);
          custIds.push(val);
          customerSelect.addOption({
            value: val,
            label: [c.code, c.name].filter(Boolean).join(' - ') || val,
          });
        });
      }
      setAssignedCustomers(custIds);

      // Pre-fill existing items
      const existingItems = editItem.items || [];
      existingItems.forEach((itm) => {
        if (itm.itemId) {
          itemSelect.addOption({
            value: String(itm.itemId),
            label: [itm.itemCode, itm.itemName].filter(Boolean).join(' - ') || itm.itemName,
            uoms: itm.itemUom ? [{ value: itm.itemUom, label: itm.itemUom, isBase: true }] : [],
          });
        }
      });
      setItems(existingItems);
    } else {
      // Clean blank state for adding
      setActivityName('');
      setDateFrom('');
      setDateTo('');
      setAssignedCustomers([]);
      setStatus(true);
      setItems([]);
    }

    // Reset item picker
    setSelectedItemId('');
    setSelectedItemOption(null);
    setSelectedUom('');
    setSelectedUomId('');
    setCapacity('');
    setEditingRowIndex(null);
  }, [isOpen, editItem]);

  // Compute available UOMs based on the selected item's own units
  const availableUoms: SelectOption[] = useMemo(() => {
    if (selectedItemOption?.uoms && selectedItemOption.uoms.length > 0) {
      return selectedItemOption.uoms.map((u) => ({
        value: u.label || u.value,
        label: u.label || u.value,
      }));
    }
    if (globalUoms.length > 0) {
      return globalUoms;
    }
    return [
      { value: 'BT', label: 'BT' },
      { value: 'CTN', label: 'CTN' },
      { value: 'CT', label: 'CT' },
      { value: 'PC', label: 'PC' },
      { value: 'BOX', label: 'BOX' },
    ];
  }, [selectedItemOption, globalUoms]);

  // Handle selecting an item
  const handleItemSelect = (val: string) => {
    setSelectedItemId(val);
    const opt = (itemSelect.options as StockItemOption[]).find((o) => String(o.value) === String(val)) ?? null;
    setSelectedItemOption(opt);

    // Auto-select base UOM or first available UOM
    if (opt?.uoms && opt.uoms.length > 0) {
      const base = opt.uoms.find((u) => u.isBase) || opt.uoms[0];
      setSelectedUom(base.label || base.value);
      setSelectedUomId(base.value);
    } else {
      setSelectedUom('');
      setSelectedUomId('');
    }
  };

  // Add or update item in the table
  const handleAddOrUpdateItem = () => {
    if (!selectedItemId) {
      showToast.error('Please select an item');
      return;
    }
    if (!selectedUom) {
      showToast.error('Please select an Item UOM');
      return;
    }
    if (!capacity.trim() || isNaN(Number(capacity))) {
      showToast.error('Please enter a valid numeric capacity');
      return;
    }

    let itemName = selectedItemOption?.label || '';
    let itemCode = '';

    // If label was formatted as "CODE - Name", extract code & name
    if (itemName.includes(' - ')) {
      const parts = itemName.split(' - ');
      itemCode = parts[0]?.trim() || '';
      itemName = parts.slice(1).join(' - ').trim();
    } else {
      itemName = selectedItemOption?.label || selectedItemId;
    }

    if (editingRowIndex !== null && editingRowIndex >= 0 && items[editingRowIndex]) {
      // Editing existing row
      const current = items[editingRowIndex];
      const updated: StockInStoreItemDetail = {
        ...current,
        itemId: selectedItemId,
        itemCode: itemCode || current.itemCode,
        itemName: itemName || current.itemName,
        itemUom: selectedUom,
        uomId: selectedUomId || current.uomId,
        capacity: capacity.trim(),
      };
      setItems((prev) => prev.map((it, idx) => (idx === editingRowIndex ? updated : it)));
      setEditingRowIndex(null);
      showToast.success('Item updated');
    } else {
      // Adding new row
      const newItem: StockInStoreItemDetail = {
        id: Math.random().toString(36).substring(2, 9),
        itemId: selectedItemId,
        itemCode: itemCode || '—',
        itemName: itemName || 'Unknown Item',
        itemUom: selectedUom,
        uomId: selectedUomId || undefined,
        capacity: capacity.trim(),
      };
      setItems((prev) => [...prev, newItem]);
    }

    // Reset item entry form
    setSelectedItemId('');
    setSelectedItemOption(null);
    setSelectedUom('');
    setSelectedUomId('');
    setCapacity('');
  };

  // Edit item from table
  const handleEditItemRow = (index: number) => {
    const itm = items[index];
    if (!itm) return;

    setEditingRowIndex(index);
    setSelectedItemId(itm.itemId || '');
    const opt = (itemSelect.options as StockItemOption[]).find((o) => String(o.value) === String(itm.itemId)) ?? null;
    setSelectedItemOption(opt);
    setSelectedUom(itm.itemUom || '');
    setSelectedUomId(itm.uomId || '');
    setCapacity(String(itm.capacity || ''));
  };

  const handleCancelItemEdit = () => {
    setSelectedItemId('');
    setSelectedItemOption(null);
    setSelectedUom('');
    setSelectedUomId('');
    setCapacity('');
    setEditingRowIndex(null);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editingRowIndex === index) {
      handleCancelItemEdit();
    }
  };

  // Submit entire form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!activityName.trim()) newErrors.activityName = 'Activity Name is required';
    if (!dateFrom) newErrors.dateFrom = 'Date From is required';
    if (!dateTo) newErrors.dateTo = 'Date TO is required';
    if (dateFrom && dateTo && dateFrom > dateTo) {
      newErrors.dateTo = 'Date TO must be equal to or after Date From';
    }
    if (assignedCustomers.length === 0) {
      newErrors.assignedCustomers = 'Please select at least one customer';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    // Map selected customer values into customer records
    const mappedCustomers = assignedCustomers.map((val) => {
      const opt = customerSelect.options.find((c) => String(c.value) === String(val));
      let code = val;
      let name = val;
      if (opt?.label) {
        if (opt.label.includes(' - ')) {
          const parts = opt.label.split(' - ');
          code = parts[0]?.trim() || val;
          name = parts.slice(1).join(' - ').trim();
        } else {
          name = opt.label;
        }
      }
      return { id: val, code, name };
    });

    const record: StockInStoreRecord = {
      id: editItem?.id ?? Date.now(),
      uuid: editItem?.uuid ?? `stock-${Date.now()}`,
      activityName: activityName.trim(),
      dateFrom,
      dateTo,
      status,
      customers: mappedCustomers,
      items,
      posts: editItem?.posts ?? [],
      damages: editItem?.damages ?? [],
      updatedAt: new Date().toISOString(),
    };

    onSave?.(record);
    showToast.success(isEditing ? 'Inventory updated successfully' : 'Inventory created successfully');
    setIsSubmitting(false);
    onClose();
  };

  // Drawer Footer
  const footerContent = (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Status Switch (Left) */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Status:</span>
        <button
          type="button"
          role="switch"
          aria-checked={status}
          aria-label="Status"
          onClick={() => setStatus((prev) => !prev)}
          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            status ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              status ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            status
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {status ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Action Buttons (Right) */}
      <div className="flex items-center gap-3">
        <CancelButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="stock-in-store-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Inventory' : 'Add Inventory'}
      width="w-[660px] max-w-full"
      footer={footerContent}
    >
      <form id="stock-in-store-form" onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Activity Name */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-center">
          <label className="sm:col-span-4 text-sm font-medium text-[var(--text-primary)]">
            Activity Name<span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <div className="sm:col-span-8">
            <Input
              value={activityName}
              onChange={(e) => {
                setActivityName(e.target.value);
                if (errors.activityName) setErrors((prev) => ({ ...prev, activityName: '' }));
              }}
              error={errors.activityName}
              placeholder="Enter activity name"
            />
          </div>
        </div>

        {/* Date From */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-center">
          <label className="sm:col-span-4 text-sm font-medium text-[var(--text-primary)]">
            Date From<span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <div className="sm:col-span-8">
            <DatePicker
              selected={parseDateValue(dateFrom)}
              onChange={(d) => {
                const formatted = d ? format(d, 'yyyy-MM-dd') : '';
                setDateFrom(formatted);
                if (errors.dateFrom) setErrors((prev) => ({ ...prev, dateFrom: '' }));
                if (formatted && dateTo && formatted > dateTo) {
                  setDateTo('');
                }
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select start date"
              error={errors.dateFrom}
            />
          </div>
        </div>

        {/* Date TO */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-center">
          <label className="sm:col-span-4 text-sm font-medium text-[var(--text-primary)]">
            Date TO<span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <div className="sm:col-span-8">
            <DatePicker
              selected={parseDateValue(dateTo)}
              onChange={(d) => {
                setDateTo(d ? format(d, 'yyyy-MM-dd') : '');
                if (errors.dateTo) setErrors((prev) => ({ ...prev, dateTo: '' }));
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select end date"
              minDate={parseDateValue(dateFrom) ?? undefined}
              error={errors.dateTo}
            />
          </div>
        </div>

        {/* Assign Customers */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-start">
          <label className="sm:col-span-4 pt-2 text-sm font-medium text-[var(--text-primary)]">
            Assign Customers<span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <div className="sm:col-span-8">
            <MultiSelect
              options={customerSelect.options}
              value={assignedCustomers}
              onChange={(val) => {
                setAssignedCustomers(val);
                if (errors.assignedCustomers) setErrors((prev) => ({ ...prev, assignedCustomers: '' }));
              }}
              error={errors.assignedCustomers}
              placeholder="Select customers"
              isLoading={customerSelect.isLoading}
              hasMore={customerSelect.hasMore}
              isLoadingMore={customerSelect.isLoadingMore}
              isLoadingAll={customerSelect.isLoadingAll}
              onLoadMore={customerSelect.onLoadMore}
              onSearchChange={customerSelect.onSearchChange}
              onLoadAll={customerSelect.loadAll}
              searchable
              searchPlaceholder="Search customer by name or code…"
            />
          </div>
        </div>

        {/* Section Header: Select Item */}
        <div className="pt-3 pb-1 border-t border-[var(--border-color)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Select Item
          </h3>
        </div>

        {/* Item */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-center">
          <label className="sm:col-span-4 text-sm font-medium text-[var(--text-primary)]">
            Item
          </label>
          <div className="sm:col-span-8">
            <Select
              value={selectedItemId}
              onChange={(e) => handleItemSelect(e.target.value)}
              options={itemSelect.options}
              placeholder="Select Item"
              isLoading={itemSelect.isLoading}
              hasMore={itemSelect.hasMore}
              isLoadingMore={itemSelect.isLoadingMore}
              onLoadMore={itemSelect.onLoadMore}
              onSearchChange={itemSelect.onSearchChange}
              searchable
              searchPlaceholder="Search item by code or name…"
            />
          </div>
        </div>

        {/* Item Uom */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-center">
          <label className="sm:col-span-4 text-sm font-medium text-[var(--text-primary)]">
            Item Uom
          </label>
          <div className="sm:col-span-8">
            <Select
              value={selectedUom}
              onChange={(e) => {
                setSelectedUom(e.target.value);
                const opt = availableUoms.find((u) => u.value === e.target.value);
                if (opt) setSelectedUomId(String(opt.value));
              }}
              options={availableUoms}
              placeholder="Select UOM"
              disabled={!selectedItemId && availableUoms.length === 0}
            />
          </div>
        </div>

        {/* Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-center">
          <label className="sm:col-span-4 text-sm font-medium text-[var(--text-primary)]">
            Capacity
          </label>
          <div className="sm:col-span-8">
            <Input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Enter capacity"
              type="text"
            />
          </div>
        </div>

        {/* + Add Button */}
        <div className="flex items-center justify-end gap-3 pt-1">
          {editingRowIndex !== null && (
            <button
              type="button"
              onClick={handleCancelItemEdit}
              className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleAddOrUpdateItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
          >
            {editingRowIndex !== null ? (
              <>
                <Check className="w-4 h-4" />
                Update Item
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>

        {/* Items Table Card - Only visible once records are added */}
        {items.length > 0 && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden mt-3">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-28">
                    ITEM UOM
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    ITEM NAME
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-32 text-right">
                    CAPACITY
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-24 text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {items.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className={`hover:bg-[var(--bg-secondary)]/60 transition-colors ${
                      editingRowIndex === idx ? 'bg-primary-50/60 dark:bg-primary-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-[var(--text-primary)]">
                      {item.itemUom}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <div className="font-medium text-[var(--text-primary)]">{item.itemName}</div>
                      {item.itemCode && item.itemCode !== '—' && (
                        <div className="text-xs font-mono text-[var(--text-secondary)]">{item.itemCode}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-mono text-right font-semibold text-[var(--text-primary)]">
                      {item.capacity}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditItemRow(idx)}
                          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-primary-600 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>
    </Drawer>
  );
}
