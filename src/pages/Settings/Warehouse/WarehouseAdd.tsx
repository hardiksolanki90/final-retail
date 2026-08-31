import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { WarehouseFormData, Warehouse } from '../../../types/Warehouse';
import { getDepotOptions } from '../../../api/DepotApi';
import { getRouteOptions } from '../../../api/RouteApi';

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
  isMain: false,
  depotId: undefined,
  routeId: undefined,
  status: true,
};

export function WarehouseAdd({ isOpen, onClose, onSubmit, initialData, isLoading = false }: WarehouseAddProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<WarehouseFormData>({ defaultValues });

  const { data: depotOptions = [] } = useQuery({ queryKey: ['depot-options'], queryFn: getDepotOptions, staleTime: 10 * 60 * 1000 });
  const { data: routeOptions = [] } = useQuery({ queryKey: ['route-options'], queryFn: getRouteOptions, staleTime: 10 * 60 * 1000 });

  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        address: initialData.address ?? '',
        manager: initialData.manager ?? '',
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
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="warehouse-form" disabled={isLoading || isSubmitting}>
        {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Warehouse' : 'Add Warehouse'} width="w-[500px]" footer={footerContent}>
      <form id="warehouse-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
          <input
            {...register('code', { required: 'Code is required', validate: v => v.trim() !== '' || 'Code cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter warehouse code"
          />
          {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
          <input
            {...register('name', { required: 'Name is required', validate: v => v.trim() !== '' || 'Name cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter warehouse name"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <input
            {...register('address')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manager</label>
          <input
            {...register('manager')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter manager name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depot</label>
          <select
            {...register('depotId', { valueAsNumber: true })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select depot</option>
            {depotOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
          <select
            {...register('routeId', { valueAsNumber: true })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select route</option>
            {routeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isMain" {...register('isMain')} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <label htmlFor="isMain" className="text-sm font-medium text-gray-700 dark:text-gray-300">Main Warehouse</label>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="status" {...register('status')} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
        </div>
      </form>
    </Drawer>
  );
}
