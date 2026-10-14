import { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Drawer } from '../../../components/ui/Drawer';
import { Input } from '../../../components/ui/Input';
import { Select, type SelectOption } from '../../../components/ui/Select';
import { Button, CancelButton, SaveButton } from '../../../components/ui/Button';
import { StockItemCell } from './StockItemCell';
import { useAddStock } from '../../../hooks/Stock/useStock';
import type { StockEntryFormData, StockEntryLineForm, StockItemOption } from '../../../types/Stock';

interface StockEntryAddProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  warehouseName: string;
}

const today = () => new Date().toISOString().split('T')[0];
const emptyLine: StockEntryLineForm = { itemId: '', itemUomId: '', quantity: '' };
const defaultValues = (): StockEntryFormData => ({ entryType: 'opening', entryDate: today(), remark: '', items: [{ ...emptyLine }] });
const ENTRY_TYPES: SelectOption[] = [{ value: 'opening', label: 'Opening stock' }, { value: 'receipt', label: 'Receipt' }];

/** "Add stock" for one warehouse: opening stock or a receipt of several items, booked into the warehouse when saved. The same item in the same UOM on several lines is added up by the server. */
export function StockEntryAdd({ isOpen, onClose, warehouseId, warehouseName }: StockEntryAddProps) {
  const addStock = useAddStock();
  const [known, setKnown] = useState<Record<string, StockItemOption>>({});
  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StockEntryFormData>({ defaultValues: defaultValues() });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const lines = useWatch({ control, name: 'items' });

  const remember = useCallback((options: StockItemOption[]) => setKnown((prev) => (options.every((option) => prev[option.value]) ? prev : { ...prev, ...Object.fromEntries(options.map((option) => [option.value, option])) })), []);

  useEffect(() => {
    if (isOpen) reset(defaultValues());
  }, [isOpen, reset]);

  const submit = handleSubmit(async (form) => {
    const payload = {
      entryType: form.entryType,
      warehouseId,
      entryDate: form.entryDate,
      remark: form.remark.trim() || undefined,
      post: true,
      items: form.items.map((line) => ({ itemId: Number(line.itemId), itemUomId: line.itemUomId ? Number(line.itemUomId) : undefined, quantity: Number(line.quantity) })),
    };
    await addStock.mutateAsync(payload);
    onClose();
  });

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={addStock.isPending}>Cancel</CancelButton>
      <SaveButton type="submit" form="stock-entry-form" disabled={addStock.isPending}>{addStock.isPending ? 'Adding…' : 'Add stock'}</SaveButton>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Add stock — ${warehouseName}`} width="w-[680px]" footer={footer}>
      <form id="stock-entry-form" onSubmit={submit} className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Controller name="entryType" control={control} render={({ field }) => <Select label="Type" value={field.value} onChange={(e) => field.onChange(e.target.value)} options={ENTRY_TYPES} />} />
          <Input label="Date" type="date" required error={errors.entryDate?.message} {...register('entryDate', { required: 'Date is required' })} />
        </div>
        <Input label="Remark" placeholder="Optional note for this stock entry" maxLength={500} {...register('remark')} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Items</h3>
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => append({ ...emptyLine })}>Add item</Button>
          </div>
          {fields.map((field, index) => {
            const itemId = lines?.[index]?.itemId ?? '';
            const uoms = known[itemId]?.uoms ?? [];
            return (
              <div key={field.id} className="grid grid-cols-12 items-start gap-3 rounded-lg border border-[var(--border-color)] p-3">
                <div className="col-span-12 sm:col-span-6">
                  <Controller
                    name={`items.${index}.itemId`}
                    control={control}
                    rules={{ required: 'Select an item' }}
                    render={({ field: itemField, fieldState }) => (
                      <StockItemCell
                        value={itemField.value}
                        error={fieldState.error?.message}
                        enabled={isOpen}
                        remember={remember}
                        onPick={(option) => {
                          itemField.onChange(option?.value ?? '');
                          setValue(`items.${index}.itemUomId`, option?.uoms.find((uom) => uom.isBase)?.value ?? option?.uoms[0]?.value ?? '');
                        }}
                      />
                    )}
                  />
                </div>
                <div className="col-span-7 sm:col-span-3">
                  <Controller name={`items.${index}.itemUomId`} control={control} render={({ field: uomField }) => <Select value={uomField.value} onChange={(e) => uomField.onChange(e.target.value)} options={uoms} placeholder="UOM" disabled={!itemId} />} />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input type="number" step="any" min="0" placeholder="Qty" error={errors.items?.[index]?.quantity?.message} {...register(`items.${index}.quantity`, { required: 'Enter a quantity', validate: (value) => Number(value) > 0 || 'Must be above 0' })} />
                </div>
                <div className="col-span-1 flex h-10 items-center justify-end">
                  <button type="button" aria-label="Remove item" disabled={fields.length === 1} onClick={() => remove(index)} className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </Drawer>
  );
}
