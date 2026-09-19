import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { VanTypeSelect } from '../../../components/ui/VanTypeSelect';
import { VanCategorySelect } from '../../../components/ui/VanCategorySelect';
import type { VanFormData } from '../../../types/Van';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';

interface VanAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: VanFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: VanFormData = {
  vanCode: '',
  plateNumber: '',
  description: '',
  capacity: '',
  vanTypeId: '',
  vanCategoryId: '',
  status: true,
};

export function VanAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: VanAddProps) {
  const initialData = data?.initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
    control
  } = useForm<VanFormData>({
    defaultValues: initialFormData
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: VanFormData) => {
    try {
      await onEvent?.({
        eventType: initialData ? 'VanUpdated' : 'VanCreated',
        van: formData,
      });
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving van'
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
        <SaveButton type="submit" form="van-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Van' : 'Add Van'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="van-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Van Code *</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('vanCode', {
                required: 'Van code is required',
                validate: value => value.trim() !== '' || 'Van code cannot be empty'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter van code"
            />
            <OrderCodeSettingsIcon label="Van Code" value={watch('vanCode') || ''} onChange={(v) => setValue('vanCode', v)} />
            {errors.vanCode && (
              <p className="text-red-600 text-xs mt-1">{errors.vanCode.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
          <input
            {...register('plateNumber', {
              required: 'Plate number is required',
              validate: value => value.trim() !== '' || 'Plate number cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter plate number"
          />
          {errors.plateNumber && (
            <p className="text-red-600 text-xs mt-1">{errors.plateNumber.message}</p>
          )}
        </div>

        <div>
          <Controller
            name="vanTypeId"
            control={control}
            rules={{ required: 'Van type is required' }}
            render={({ field }) => (
              <VanTypeSelect
                label="Van Type *"
                error={errors.vanTypeId?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="vanCategoryId"
            control={control}
            render={({ field }) => (
              <VanCategorySelect
                label="Van Category"
                placeholder="Select van category (optional)"
                error={errors.vanCategoryId?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter description"
          />
          {errors.description && (
            <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <input
            {...register('capacity', {
              setValueAs: (v) => (v === '' ? '' : Number(v)),
              validate: (v) => v === '' || v === undefined || Number(v) >= 1 || 'Capacity must be greater than 0'
            })}
            type="number"
            min="1"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter capacity"
          />
          {errors.capacity && (
            <p className="text-red-600 text-xs mt-1">{errors.capacity.message}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}
