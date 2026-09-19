import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { ItemUomFormData } from '../../types/ItemUom';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface ItemUomAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: ItemUomFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: ItemUomFormData = {
  code: '',
  name: '',
  status: true,
};

export function ItemUomAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: ItemUomAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
  } = useForm<ItemUomFormData>({
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

  const onFormSubmit = async (formData: ItemUomFormData) => {
    try {
      // Trim values before submission
      const trimmedData: ItemUomFormData = {
        code: formData.code?.trim() || '',
        name: formData.name?.trim() || '',
        status: formData.status,
      };

      await onEvent?.({
        eventType: initialData ? 'ItemUomUpdated' : 'ItemUomCreated',
        itemUom: trimmedData,
      });
    } catch (error: any) {
      console.error('Error saving item UOM:', error);
      setError('root', {
        type: 'manual',
        message: error?.response?.data?.message || error?.message || 'Failed to save item UOM. Please try again.'
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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${watchedStatus ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${watchedStatus ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
        <SaveButton type="submit" form="item-uom-form" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item UOM' : 'Add Item UOM'}
      width="w-[400px] min-w-[600px]"
      footer={footerContent}
    >
      <form id="item-uom-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.root.message}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('code', {
                required: 'Code is required',
                validate: value => value?.trim() ? true : 'Code is required'
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter code"
            />
            <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} />
            {errors.code && (
              <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name', {
              required: 'Name is required',
              validate: value => value?.trim() ? true : 'Name is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter name"
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}
