import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import type { DepotFormData } from '../../../types/Depot';
import { RegionSelect } from '../../../components/ui/RegionSelect';
import { AreaSelect } from '../../../components/ui/AreaSelect';
import { CountryPhoneInput } from '../../../components/ui/CountryPhoneInput';

interface DepotAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: DepotFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: DepotFormData = {
  regionId: '',
  areaId: '',
  depotCode: '',
  depotName: '',
  depotManager: '',
  depotManagerContact: '',
  status: true,
};

export function DepotAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: DepotAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue
  } = useForm<DepotFormData>({
    defaultValues: initialFormData
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        areaId: (initialData as any).areaId ?? (initialData as any).area?.id ?? '',
        regionId: (initialData as any).regionId ?? (initialData as any).region?.id ?? '',
      });
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: DepotFormData) => {
    try {
      await onEvent?.({
        eventType: initialData ? 'DepotUpdated' : 'DepotCreated',
        depot: formData,
      });
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving depot'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
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
        <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
        <SaveButton type="submit" form="depot-form" disabled={isLoading || isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Depot' : 'Add Depot'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="depot-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Depot Code *</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('depotCode', {
                required: 'Depot code is required',
                validate: value => value.trim() !== '' || 'Depot code cannot be empty'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. DP01"
            />
            <OrderCodeSettingsIcon label="Depot Code" value={watch('depotCode') || ''} onChange={(v) => setValue('depotCode', v)} />
            {errors.depotCode && (
              <p className="text-red-600 text-xs mt-1">{errors.depotCode.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Depot Name *</label>
          <input
            {...register('depotName', {
              required: 'Depot name is required',
              validate: value => value.trim() !== '' || 'Depot name cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter depot name"
          />
          {errors.depotName && (
            <p className="text-red-600 text-xs mt-1">{errors.depotName.message}</p>
          )}
        </div>

        <div>
          <Controller
            name="regionId"
            control={control}
            rules={{ required: 'Region is required' }}
            render={({ field }) => (
              <RegionSelect
                label="Region *"
                error={errors.regionId?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="areaId"
            control={control}
            render={({ field }) => (
              <AreaSelect
                label="Area"
                error={errors.areaId?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Depot Manager *</label>
          <input
            {...register('depotManager', {
              required: 'Depot manager is required',
              validate: value => value.trim() !== '' || 'Depot manager cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter depot manager name"
          />
          {errors.depotManager && (
            <p className="text-red-600 text-xs mt-1">{errors.depotManager.message}</p>
          )}
        </div>

        <div>
          <Controller
            name="depotManagerContact"
            control={control}
            render={({ field }) => (
              <CountryPhoneInput
                label="Manager Contact"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.depotManagerContact?.message}
              />
            )}
          />
        </div>

      </form>
    </Drawer>
  );
}
