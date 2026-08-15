import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { SalesmanLoadFormData } from '../../types/SalesmanLoad';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface SalesmanLoadAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SalesmanLoadFormData) => void | Promise<void>;
  initialData?: SalesmanLoadFormData;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  vans?: SelectOption[];
  warehouses?: SelectOption[];
}

const defaultValues: SalesmanLoadFormData = {
  loadCode: '',
  salesmanId: '',
  vanId: '',
  warehouseId: '',
  loadDate: new Date().toISOString().split('T')[0],
  items: [],
  notes: '',
  status: 'pending',
};

export function SalesmanLoadAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  salesmen = [],
  vans = [],
  warehouses = [],
}: SalesmanLoadAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SalesmanLoadFormData>({ defaultValues });

  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: SalesmanLoadFormData) => {
    await onSubmit(data);
    onClose();
  };

  const selectClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Salesman Load' : 'Add Salesman Load'}
      width="w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <Input
          label="Load Code"
          {...register('loadCode', { required: 'Load Code is required' })}
          error={errors.loadCode?.message}
          placeholder="Enter load code"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Salesman <span className="text-red-500">*</span>
          </label>
                  <OrderCodeSettingsIcon label="Status" value="" onChange={() => {}} />
          <select {...register('salesmanId', { required: 'Salesman is required' })} className={selectClass}>
            <option value="">Select salesman</option>
            {salesmen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.salesmanId && <p className="text-sm text-red-500 mt-1">{errors.salesmanId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Van <span className="text-red-500">*</span>
            </label>
            <select {...register('vanId', { required: 'Van is required' })} className={selectClass}>
              <option value="">Select van</option>
              {vans.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.vanId && <p className="text-sm text-red-500 mt-1">{errors.vanId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Warehouse <span className="text-red-500">*</span>
            </label>
            <select {...register('warehouseId', { required: 'Warehouse is required' })} className={selectClass}>
              <option value="">Select warehouse</option>
              {warehouses.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.warehouseId && <p className="text-sm text-red-500 mt-1">{errors.warehouseId.message}</p>}
          </div>
        </div>

        <Input
          label="Load Date"
          type="date"
          {...register('loadDate', { required: 'Load Date is required' })}
          error={errors.loadDate?.message}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select {...register('status')} className={selectClass}>
            <option value="pending">Pending</option>
            <option value="loaded">Loaded</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            {...register('notes')}
            placeholder="Enter notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}