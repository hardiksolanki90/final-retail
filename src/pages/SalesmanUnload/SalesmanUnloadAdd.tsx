import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, PackageOpen, ChevronLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import type { SalesmanUnloadFormData, SalesmanUnloadItem } from '../../types/SalesmanUnload';
import type { SelectOption } from '../../components/ui/Select';
import { useSalesmanUnloadFormOptions, useSalesmanUnloadMutations } from '../../hooks/SalesmanUnload/useSalesmanUnload';

const initialItem: SalesmanUnloadItem = {
  id: '', itemId: '', itemName: '', uom: '', quantity: 1, unloadType: 'fresh', reasonId: '',
};

const defaultValues: SalesmanUnloadFormData = {
  unloadNumber: '',
  routeId: '',
  warehouseId: '',
  vanId: '',
  salesmanId: '',
  transactionDate: new Date().toISOString().split('T')[0],
  items: [{ ...initialItem, id: '1' }],
};

const uomOptions = [
  { value: 'PCS', label: 'PCS' }, { value: 'KG', label: 'KG' },
  { value: 'LTR', label: 'LTR' }, { value: 'BOX', label: 'BOX' }, { value: 'CTN', label: 'CTN' },
];

const unloadTypeOptions = [
  { value: 'fresh', label: 'Fresh' },
  { value: 'damage', label: 'Damage' },
  { value: 'expired', label: 'Expired' },
];

export function SalesmanUnloadAdd() {
  const navigate = useNavigate();
  const { salesmen, items, routes, vans, warehouses, reasons, isLoading: optionsLoading } = useSalesmanUnloadFormOptions();
  const { createMutation } = useSalesmanUnloadMutations();

  const { register, handleSubmit, formState: { errors, isSubmitting }, control } =
    useForm<SalesmanUnloadFormData>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onFormSubmit = async (data: SalesmanUnloadFormData) => {
    try {
      await createMutation.mutateAsync(data);
      navigate('/salesman-unload');
    } catch {
      // toast already shown by the mutation's onError handler
    }
  };

  const selectClass = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';
  const fieldClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <PackageOpen className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Salesman Unload</h2>
        </div>
        <button onClick={() => navigate('/salesman-unload')} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="bg-white dark:bg-gray-800 p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salesman <span className="text-red-500">*</span></label>
                <select {...register('salesmanId', { required: 'Salesman is required' })} className={fieldClass} disabled={optionsLoading}>
                  <option value="">{optionsLoading ? 'Loading…' : 'Select Salesman'}</option>
                  {salesmen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.salesmanId && <p className="text-sm text-red-500 mt-1">{errors.salesmanId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
                <select {...register('routeId')} className={fieldClass} disabled={optionsLoading}>
                  <option value="">Select Route</option>
                  {routes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Van</label>
                <select {...register('vanId')} className={fieldClass} disabled={optionsLoading}>
                  <option value="">Select Van</option>
                  {vans.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse</label>
                <select {...register('warehouseId')} className={fieldClass} disabled={optionsLoading}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map((o: SelectOption) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <Input label="Unload Number" {...register('unloadNumber')} placeholder="Auto-generated" disabled />
            <Input label="Transaction Date" type="date" {...register('transactionDate', { required: 'Date is required' })} required />
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['#', 'Item', 'UOM', 'Qty', 'Unload Type', 'Reason', 'Action'].map(h => (
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.itemId`)} className={selectClass} disabled={optionsLoading}>
                        <option value="">Select Item</option>
                        {items.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.uom`)} className={selectClass}>
                        <option value="">UOM</option>
                        {uomOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" min="0" />
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.unloadType`)} className={selectClass}>
                        {unloadTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.reasonId`)} className={selectClass}>
                        <option value="">Select Reason</option>
                        {reasons.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => fields.length > 1 && remove(index)} className="text-red-500 hover:text-red-700" disabled={fields.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <Button type="button" onClick={() => append({ ...initialItem, id: Date.now().toString() })} variant="primary">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 p-4 flex justify-end gap-3">
          <CancelButton onClick={() => navigate('/salesman-unload')} disabled={isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save & Submit'}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}
