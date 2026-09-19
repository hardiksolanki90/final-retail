import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { RouteFormData } from '../../../types/Route';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { AreaSelect, DepotSelect } from '../../../components/ui';

interface RouteAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: RouteFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: RouteFormData = {
  code: '',
  name: '',
  areaId: '',
  depotId: '',
  status: true,
};

export function RouteAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: RouteAddProps) {
  const initialData = data?.initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
  } = useForm<RouteFormData>({
    defaultValues: initialFormData,
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        areaId: (initialData as any).areaId ?? (initialData as any).area?.id ?? '',
        depotId: (initialData as any).depotId ?? (initialData as any).depot?.id ?? '',
      });
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: RouteFormData) => {
    try {
      await onEvent?.({
        eventType: initialData ? 'RouteUpdated' : 'RouteCreated',
        route: formData,
      });
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving route',
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
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
        <CancelButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="route-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Route' : 'Add Route'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="route-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code *</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('code', {
                required: 'Code is required',
                validate: (value) => value.trim() !== '' || 'Code cannot be empty',
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter route code"
            />
            <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} />
          </div>
          {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
          <input
            {...register('name', {
              required: 'Name is required',
              validate: (value) => value.trim() !== '' || 'Name cannot be empty',
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter route name"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Controller
            name="areaId"
            control={control}
            rules={{ required: 'Area is required' }}
            render={({ field }) => (
              <AreaSelect
                label="Area *"
                error={errors.areaId?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="depotId"
            control={control}
            rules={{ required: 'Depot is required' }}
            render={({ field }) => (
              <DepotSelect
                label="Depot *"
                error={errors.depotId?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </form>
    </Drawer>
  );
}

export default RouteAdd;
