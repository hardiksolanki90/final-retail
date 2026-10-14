import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { FormSkeleton } from '../../components/ui/skeleton';
import { showToast } from '../../lib/toast';
import { useRouteItemGrouping, useRouteItemGroupingActions } from '../../hooks/RouteItemGroupings/useRouteItemGroupings';
import { RouteSelect } from './RouteSelect';
import { SalesmanSelect } from './SalesmanSelect';
import { RouteItemPicker } from './RouteItemPicker';
import type { RouteItemGroupingForm } from '../../types/RouteItemGrouping';

interface RouteItemGroupingAddProps {
  isOpen: boolean;
  onClose: () => void;
  /** Set to edit that group instead of creating a new one. */
  editingUuid?: string | null;
}

const defaultValues: RouteItemGroupingForm = { code: '', name: '', routeId: '', salesmanId: '', status: true, items: [] };
const itemLabel = (item: { itemCode: string | null; itemName: string | null }) => [item.itemCode, item.itemName].filter(Boolean).join(' - ');

/** Create or edit a route item grouping: a named list of items for a route and/or a salesman. */
export function RouteItemGroupingAdd({ isOpen, onClose, editingUuid }: RouteItemGroupingAddProps) {
  const isEdit = Boolean(editingUuid);
  const { data: grouping, isLoading: isLoadingGrouping } = useRouteItemGrouping(isOpen ? (editingUuid ?? null) : null);
  const { create, update } = useRouteItemGroupingActions();
  const [codeLocked, setCodeLocked] = useState(false);
  const { register, handleSubmit, reset, control, setValue, getValues, formState: { errors } } = useForm<RouteItemGroupingForm>({ defaultValues });
  const items = useWatch({ control, name: 'items' });
  const status = useWatch({ control, name: 'status' });
  const code = useWatch({ control, name: 'code' });
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (isOpen && !editingUuid) reset(defaultValues);
  }, [isOpen, editingUuid, reset]);

  useEffect(() => {
    if (isOpen && grouping) reset({ code: grouping.code, name: grouping.name, routeId: grouping.routeId ? String(grouping.routeId) : '', salesmanId: grouping.salesmanId ? String(grouping.salesmanId) : '', status: grouping.status, items: grouping.items });
  }, [isOpen, grouping, reset]);

  const submit = handleSubmit(async (form) => {
    const payload = { code: form.code.trim() || undefined, name: form.name.trim(), routeId: form.routeId ? Number(form.routeId) : null, salesmanId: form.salesmanId ? Number(form.salesmanId) : null, status: form.status, items: form.items.map((item) => ({ itemId: item.itemId })) };
    if (editingUuid) await update.mutateAsync({ uuid: editingUuid, payload });
    else await create.mutateAsync(payload);
    onClose();
  });

  const addItem = (option: { value: string; label: string }) => {
    const itemId = Number(option.value);
    if (getValues('items').some((item) => item.itemId === itemId)) return showToast.error('This item is already in the list');
    setValue('items', [...getValues('items'), { itemId, itemCode: null, itemName: option.label }], { shouldValidate: true, shouldDirty: true });
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Status:</span>
        <button type="button" role="switch" aria-checked={status} aria-label="Status" onClick={() => setValue('status', !status, { shouldDirty: true })} className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${status ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${status ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={pending}>Cancel</CancelButton>
        <SaveButton type="submit" form="route-item-grouping-form" disabled={pending}>{pending ? 'Saving…' : isEdit ? 'Update' : 'Save'}</SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Route Item Grouping' : 'Add Route Item Grouping'} width="w-[640px]" footer={footer} isLoading={isEdit && isLoadingGrouping} skeleton={<FormSkeleton fields={['code', 'input', 'select', 'select', 'section', 'input']} />}>
      <form id="route-item-grouping-form" onSubmit={submit} className="space-y-6 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Code</label>
          <div className="relative flex items-center gap-2">
            <input {...register('code')} disabled={codeLocked} placeholder="Configure the system to auto-generate the code." className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-[var(--text-primary)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60" />
            <OrderCodeSettingsIcon label="Code" value={code || ''} onChange={(value) => setValue('code', value)} entityKey="route_item_grouping" onLockChange={setCodeLocked} />
          </div>
        </div>

        <Input label="Name" required error={errors.name?.message} placeholder="Enter group name" maxLength={191} {...register('name', { required: 'Name is required', validate: (value) => value.trim() !== '' || 'Name cannot be empty' })} />

        <div className="grid grid-cols-2 gap-4">
          <Controller name="routeId" control={control} rules={{ validate: () => Boolean(getValues('routeId') || getValues('salesmanId')) || 'Choose a route, a salesman, or both' }} render={({ field, fieldState }) => <RouteSelect label="Route" value={field.value} onChange={field.onChange} error={fieldState.error?.message} allLabel="No route" enabled={isOpen} />} />
          <Controller name="salesmanId" control={control} render={({ field }) => <SalesmanSelect label="Salesman" value={field.value} onChange={field.onChange} allLabel="No salesman" enabled={isOpen} />} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Items <span className="text-red-500">*</span> <span className="font-normal text-[var(--text-muted)]">({items.length})</span></h3>
          <Controller name="items" control={control} rules={{ validate: (value) => value.length > 0 || 'Add at least one item' }} render={({ fieldState }) => <>{fieldState.error && <p className="text-xs text-red-600">{fieldState.error.message}</p>}</>} />
          <RouteItemPicker enabled={isOpen} onPick={addItem} />
          {items.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[var(--border-color)]">
                  {items.map((item) => (
                    <tr key={item.itemId}>
                      <td className="px-4 py-2 text-[var(--text-primary)]">{itemLabel(item)}</td>
                      <td className="w-12 px-2 py-2 text-right">
                        <button type="button" aria-label={`Remove ${itemLabel(item)}`} onClick={() => setValue('items', getValues('items').filter((row) => row.itemId !== item.itemId), { shouldValidate: true, shouldDirty: true })} className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}
