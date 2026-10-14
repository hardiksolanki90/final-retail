import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { SalesmanLoadFormData, SalesmanLoadItem } from '../../types/SalesmanLoad';
import type { SelectOption } from '../../components/ui/Select';
import type { ItemSelectOption } from '../../types/Item';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { useDocumentNumber } from '../../hooks/CodeSetting/useDocumentNumber';

interface SalesmanLoadAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SalesmanLoadFormData) => void | Promise<void>;
  initialData?: SalesmanLoadFormData;
  isLoading?: boolean;
  salesman?: SelectOption[];
  routes?: SelectOption[];
  items?: ItemSelectOption[];
  /** On-hand quantity in the item's base unit, keyed by item uuid. Display only. */
  stockByItem?: Record<string, number>;
}

const blankLine = (): SalesmanLoadItem => ({ id: '', itemId: '', itemName: '', uom: '', quantity: 0 });

const defaultValues: SalesmanLoadFormData = {
  loadCode: '',
  loadType: '',
  routeId: '',
  salesmanId: '',
  loadDate: new Date().toISOString().split('T')[0],
  items: [blankLine()],
};

const loadTypeOptions = [
  { value: 1, label: 'Delivery Load' },
  { value: 2, label: 'Van Load' },
];

/** "CTN - Carton" → CTN. The load stores the unit as text. */
const uomCode = (label?: string) => (label ? label.split(' - ')[0] : '');

export function SalesmanLoadAdd({ isOpen, onClose, onSubmit, initialData, isLoading = false, salesman = [], routes = [], items = [], stockByItem = {} }: SalesmanLoadAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SalesmanLoadFormData>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const optionsKey = initialData ? `${salesman.length}|${routes.length}|${items.length}` : '';
  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, optionsKey, reset]);

  const { manual: manualNumbering, locked: codeLocked, reserve: reserveNumber } = useDocumentNumber('salesman_load', (value) => setValue('loadCode', value), isOpen && !initialData);

  const onFormSubmit = async (data: SalesmanLoadFormData) => {
    const lines = data.items.filter((line) => line.itemId);
    if (lines.length === 0) {
      setError('items', { message: 'Add at least one item' });
      return;
    }
    const loadCode = initialData ? data.loadCode : await reserveNumber(data.loadCode);
    try {
      await onSubmit({
        ...data,
        loadCode: loadCode ?? '',
        items: lines.map((line) => ({ ...line, requestedQty: line.requestedQty ?? line.quantity })),
      });
      onClose();
    } catch {
      // The caller already showed the error; keep the drawer open so nothing typed is lost.
    }
  };

  const selectClass =
    'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';
  const cellSelect = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';
  const lines = watch('items');

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Salesman Load' : 'Add Salesman Load'} width="w-full max-w-5xl">
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Load Type <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select {...register('loadType', { required: 'Load Type is required', valueAsNumber: true })} className={selectClass}>
                <option value="">Select</option>
                {loadTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.loadType && <p className="text-sm text-red-500 mt-1">{errors.loadType.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
              <select {...register('routeId')} className={selectClass}>
                <option value="">Select</option>
                {routes.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Salesman Load Number {manualNumbering && <span className="text-red-500 font-bold ml-0.5">*</span>}
                </label>
              </div>
              <div className="flex items-center gap-2 relative">
                <Input
                  {...register('loadCode', { validate: (value) => !manualNumbering || Boolean(value) || 'Salesman Load Number is required' })}
                  error={errors.loadCode?.message}
                  placeholder="Configure the system to auto-generate the code."
                  disabled={codeLocked || Boolean(initialData)}
                />
                <OrderCodeSettingsIcon label="Salesman Load Number" entityKey="salesman_load" value={watch('loadCode') || ''} onChange={(v) => setValue('loadCode', v)} />
              </div>
            </div>
            <Input label="Load Date" type="date" {...register('loadDate', { required: 'Load Date is required' })} error={errors.loadDate?.message} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salesman <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select {...register('salesmanId', { required: 'Salesman is required' })} className={selectClass}>
                <option value="">Select</option>
                {salesman.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.salesmanId && <p className="text-sm text-red-500 mt-1">{errors.salesmanId.message}</p>}
            </div>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['#', 'Item Name', 'UOM', 'Quantity', 'On Hand Qty', 'Action'].map((heading) => (
                  <th key={heading} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const itemId = lines?.[index]?.itemId;
                const chosen = items.find((item) => item.value === itemId);
                const uomChoices = (chosen?.uoms ?? []).map((uom) => ({ value: uomCode(uom.label), label: uom.label }));
                const currentUom = lines?.[index]?.uom;
                if (currentUom && !uomChoices.some((uom) => uom.value === currentUom)) uomChoices.unshift({ value: currentUom, label: currentUom });
                const itemField = register(`items.${index}.itemId`);
                const onHand = itemId && stockByItem[itemId] !== undefined ? stockByItem[itemId].toFixed(2) : '—';

                return (
                  <tr key={field.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">
                      <select
                        {...itemField}
                        className={cellSelect}
                        onChange={(event) => {
                          itemField.onChange(event);
                          const item = items.find((option) => option.value === event.target.value);
                          const base = item?.uoms.find((uom) => uom.isBase) ?? item?.uoms[0];
                          setValue(`items.${index}.itemName`, item?.label ?? '');
                          setValue(`items.${index}.uom`, uomCode(base?.label));
                        }}
                      >
                        <option value="">Select</option>
                        {items.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.uom`)} className={cellSelect}>
                        <option value="">UOM</option>
                        {uomChoices.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" min="0" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-24 px-2 py-1 border rounded text-sm" />
                    </td>
                    <td className="px-3 py-2 tabular-nums text-gray-700 dark:text-gray-300">{onHand}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => fields.length > 1 && remove(index)} className="text-red-500 hover:text-red-700 disabled:opacity-40" disabled={fields.length === 1} aria-label="Remove line">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(errors.items?.message || errors.items?.root?.message) && <p className="text-sm text-red-500">{errors.items?.message || errors.items?.root?.message}</p>}
        <button type="button" onClick={() => append(blankLine())} className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
          <Plus className="w-4 h-4" />
          Add item
        </button>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Saving...' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}
