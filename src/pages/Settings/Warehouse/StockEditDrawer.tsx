import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { CancelButton, SaveButton } from '../../../components/ui/Button';
import { useSetStock, useStockItemUoms } from '../../../hooks/Stock/useStock';
import type { StockBalance } from '../../../types/Stock';

interface StockEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  row: StockBalance | null;
}

interface StockEditForm {
  itemUomId: string;
  quantity: string;
}

/** Edit one item's stock in the warehouse: type how much is there now (in any of the item's UOMs); the difference is booked in the history. */
export function StockEditDrawer({ isOpen, onClose, warehouseId, row }: StockEditDrawerProps) {
  const setStock = useSetStock();
  const { data: uoms = [] } = useStockItemUoms(row?.itemId ?? null, row?.itemCode ?? null, isOpen);
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<StockEditForm>({ defaultValues: { itemUomId: '', quantity: '' } });

  useEffect(() => {
    if (isOpen && row) reset({ itemUomId: uoms.find((uom) => uom.isBase)?.value ?? uoms[0]?.value ?? '', quantity: String(Number(row.onHand)) });
  }, [isOpen, row, uoms, reset]);

  const submit = handleSubmit(async (form) => {
    if (!row) return;
    await setStock.mutateAsync({ warehouseId, itemId: row.itemId, itemUomId: form.itemUomId ? Number(form.itemUomId) : undefined, quantity: Number(form.quantity) });
    onClose();
  });

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={setStock.isPending}>Cancel</CancelButton>
      <SaveButton type="submit" form="stock-edit-form" disabled={setStock.isPending}>{setStock.isPending ? 'Saving…' : 'Save'}</SaveButton>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Edit stock" width="w-[480px]" footer={footer}>
      <form id="stock-edit-form" onSubmit={submit} className="space-y-5 p-6">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{[row?.itemCode, row?.itemName].filter(Boolean).join(' - ')}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">On hand now: {row ? `${Number(row.onHand)} ${row.baseUomName ?? ''}` : ''}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Controller name="itemUomId" control={control} render={({ field }) => <Select label="UOM" value={field.value} onChange={(e) => field.onChange(e.target.value)} options={uoms} placeholder="UOM" />} />
          <Input label="Quantity" type="number" step="any" min="0" required error={errors.quantity?.message} {...register('quantity', { required: 'Enter a quantity', validate: (value) => Number(value) >= 0 || 'Cannot be below 0' })} />
        </div>
        <p className="text-xs text-[var(--text-muted)]">The quantity you type becomes the new stock of this item in this warehouse.</p>
      </form>
    </Drawer>
  );
}
