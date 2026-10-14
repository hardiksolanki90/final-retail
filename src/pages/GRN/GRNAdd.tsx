import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, ClipboardList, ChevronLeft } from 'lucide-react';
import type { GRNFormData, GRNItem } from '../../types/GRN';
import { useGRNFormOptions, useGRNMutations } from '../../hooks/GRN/useGRN';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { useDocumentNumber } from '../../hooks/CodeSetting/useDocumentNumber';
import { useDocumentEditing } from '../../hooks/useDocumentEditing';
import { DocumentEditSkeleton } from '../shared/DocumentForm/EditSkeleton';
import { getGRNByUuid } from '../../api/GRNApi';
import type { GRNView } from '../../types/DocumentView';

type SelectOption = { value: string; label: string };

const emptyItem: GRNItem = { id: '', itemId: '', itemName: '', uom: '', quantity: 1, reason: '', returnReason: '' };

const defaultValues: GRNFormData = {
  sourceWarehouseId: '',
  destinationWarehouseId: '',
  grnNumber: '',
  grnDate: new Date().toISOString().split('T')[0],
  items: [{ ...emptyItem, id: '1' }],
  remark: '',
};

export function GRNAdd() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEdit = Boolean(uuid);

  const { warehouses, items, reasons, isLoading: optionsLoading } = useGRNFormOptions();
  const { createMutation, updateMutation } = useGRNMutations();

  const baseUoms = ['PC', 'KG', 'BOX', 'CTN'];

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GRNFormData>({ defaultValues });

  // The fixed UOMs plus any a saved line already uses, so editing never blanks a line's UOM.
  const usedUoms = (watch('items') ?? []).map((line) => line?.uom).filter(Boolean);
  const uomOptions: SelectOption[] = [...new Set([...baseUoms, ...usedUoms])].map((code) => ({ value: code, label: code }));

  const { manual: manualNumbering, locked: codeLocked, reserve: reserveNumber } = useDocumentNumber('grn', (value) => setValue('grnNumber', value), !isEdit);

  const { isLoading: loadingSaved } = useDocumentEditing<GRNView, GRNFormData>({
    label: 'GRN',
    uuid,
    fetcher: getGRNByUuid,
    toForm: (saved) => ({
      sourceWarehouseId: saved.sourceWarehouseId ?? '',
      destinationWarehouseId: saved.destinationWarehouseId ?? '',
      grnNumber: saved.grnNumber,
      grnDate: saved.grnDate ?? '',
      remark: saved.remark ?? '',
      items: saved.items.map((line) => ({
        id: '',
        uuid: line.uuid,
        itemId: line.itemId ?? '',
        itemName: line.itemName ?? '',
        uom: line.uomCode ?? '',
        quantity: line.quantity,
        reason: line.reasonId ?? '',
        returnReason: line.returnReasonId ?? '',
      })),
    }),
    reset,
    waitFor: !optionsLoading,
    listPath: '/grn',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async (formData: GRNFormData) => {
    try {
      if (isEdit && uuid) {
        await updateMutation.mutateAsync({ uuid, data: { ...formData, grnNumber: '' } });
      } else {
        const grnNumber = await reserveNumber(formData.grnNumber);
        await createMutation.mutateAsync({ ...formData, grnNumber: grnNumber ?? '' });
      }
      navigate('/grn');
    } catch {
      // toast already shown by the mutation's onError handler
    }
  };

  const selectClass =
    'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{isEdit ? 'Edit Goods Receipt Note' : 'Add Goods Receipt Note'}</h2>
        </div>
        <button onClick={() => navigate('/grn')} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {loadingSaved ? (
          <div className="p-6">
            <DocumentEditSkeleton />
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Warehouse</label>
                    <select
                      {...register('sourceWarehouseId')}
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={optionsLoading}
                    >
                      <option value="">{optionsLoading ? 'Loading…' : 'Select'}</option>
                      {warehouses.map((o: SelectOption) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination Warehouse</label>
                    <select
                      {...register('destinationWarehouseId')}
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={optionsLoading}
                    >
                      <option value="">{optionsLoading ? 'Loading…' : 'Select'}</option>
                      {warehouses.map((o: SelectOption) => (
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GRN Number {manualNumbering && <span className="text-red-500 font-bold ml-0.5">*</span>}</label>
                      {!isEdit && <OrderCodeSettingsIcon label="GRN Number" entityKey="grn" value={watch('grnNumber') || ''} onChange={(v) => setValue('grnNumber', v)} />}
                    </div>
                    <Input
                      {...register('grnNumber', { validate: (value) => !manualNumbering || Boolean(value) || 'GRN Number is required' })}
                      error={errors.grnNumber?.message}
                      placeholder="Configure the system to auto-generate the code."
                      disabled={codeLocked || isEdit}
                    />
                  </div>
                  <div>
                    <Input label="GRN Date" type="date" {...register('grnDate', { required: 'Date is required' })} required />
                    {errors.grnDate && <p className="text-sm text-red-500 mt-1">{errors.grnDate.message}</p>}
                  </div>
                </div>
              </div>

              {/* Items table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto mb-4">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left w-12">#</th>
                      <th className="px-3 py-2 text-left w-64">Item Code</th>
                      <th className="px-3 py-2 text-left w-64">Item Name</th>
                      <th className="px-3 py-2 text-left w-32">UOM</th>
                      <th className="px-3 py-2 text-left w-24">Qty</th>
                      <th className="px-3 py-2 text-left w-48">Reason</th>
                      <th className="px-3 py-2 text-left w-48">Return Reason</th>
                      <th className="px-3 py-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">
                          <select
                            {...register(`items.${index}.itemId`)}
                            className={selectClass}
                            disabled={optionsLoading}
                            onChange={(e) => {
                              const selectedItem = items.find((i) => i.value === e.target.value);
                              if (selectedItem) {
                                setValue(`items.${index}.itemName`, selectedItem.label);
                              } else {
                                setValue(`items.${index}.itemName`, '');
                              }
                            }}
                          >
                            <option value="">{optionsLoading ? 'Loading…' : 'Search an item *'}</option>
                            {items.map((o: SelectOption) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" {...register(`items.${index}.itemName`)} className="w-full px-2 py-1 border rounded text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-75" readOnly />
                        </td>
                        <td className="px-3 py-2">
                          <select {...register(`items.${index}.uom`)} className={selectClass}>
                            <option value="">Select</option>
                            {uomOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-full px-2 py-1 border rounded text-sm" min="1" />
                        </td>
                        <td className="px-3 py-2">
                          <select {...register(`items.${index}.reason`)} className={selectClass}>
                            <option value="">Select</option>
                            {reasons.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select {...register(`items.${index}.returnReason`)} className={selectClass}>
                            <option value="">Select</option>
                            {reasons.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => fields.length > 1 && remove(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full border border-gray-300 hover:border-red-500 inline-flex items-center justify-center"
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-start mb-6">
                <Button type="button" onClick={() => append({ ...emptyItem, id: Date.now().toString() })} variant="secondary" className="flex items-center text-sm bg-gray-100 dark:bg-gray-700">
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GRN Remark</label>
                <textarea
                  {...register('remark')}
                  rows={4}
                  className="w-full max-w-2xl px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
            </div>
          </>
        )}
        <div className="bg-white dark:bg-gray-800 p-4 flex justify-end gap-3 sticky bottom-0 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-sm">
          <CancelButton onClick={() => navigate('/grn')} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save changes' : 'Save & Submit'}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}
