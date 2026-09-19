import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { CountryPhoneInput } from '../../../components/ui/CountryPhoneInput';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { DepotSelect } from '../../../components/ui/DepotSelect';
import { RouteSelect } from '../../../components/shared/RouteSelect';
import type { WarehouseFormData, Warehouse } from '../../../types/Warehouse';

interface WarehouseAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WarehouseFormData) => void | Promise<void>;
  initialData?: Warehouse | null;
  isLoading?: boolean;
}

const defaultValues: WarehouseFormData = {
  code: '',
  name: '',
  address: '',
  manager: '',
  managerPhone: '',
  isMain: false,
  depotId: undefined,
  routeId: undefined,
  status: true,
};

export function WarehouseAdd({ isOpen, onClose, onSubmit, initialData, isLoading = false }: WarehouseAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
  } = useForm<WarehouseFormData>({ defaultValues });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        address: initialData.address ?? '',
        manager: initialData.manager ?? '',
        managerPhone: initialData.managerPhone ?? '',
        isMain: initialData.isMain ?? false,
        depotId: initialData.depotId,
        routeId: initialData.routeId,
        status: initialData.status ?? true,
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: WarehouseFormData) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving warehouse' });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Status:</span>
        <button
          type="button"
          onClick={() => setValue('status', !watchedStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            watchedStatus ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              watchedStatus ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
        <SaveButton type="submit" form="warehouse-form" disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Warehouse' : 'Add Warehouse'} width="w-[500px]" footer={footerContent}>
      <form id="warehouse-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <strong className="font-semibold">Error:</strong> {errors.root.message}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Code*</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('code', { required: 'Code is required', validate: (v) => v.trim() !== '' || 'Code cannot be empty' })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter warehouse code"
            />
            <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} />
          </div>
          {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
          <input
            {...register('name', { required: 'Name is required', validate: (v) => v.trim() !== '' || 'Name cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter warehouse name"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Controller
            name="depotId"
            control={control}
            render={({ field }) => (
              <DepotSelect
                label="Depot"
                value={field.value}
                onChange={(val) => field.onChange(val || undefined)}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="routeId"
            control={control}
            render={({ field }) => (
              <RouteSelect
                label="Route"
                value={field.value?.toString() ?? ''}
                onChange={(val) => field.onChange(val ? Number(val) : undefined)}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            {...register('address')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
          <input
            {...register('manager')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter manager name"
          />
        </div>

        <div>
          <Controller
            name="managerPhone"
            control={control}
            render={({ field }) => (
              <CountryPhoneInput
                label="Manager Phone"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.managerPhone?.message}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            Main Warehouse
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={watch('isMain')}
              onChange={(e) => setValue('isMain', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </form>
    </Drawer>
  );
}
