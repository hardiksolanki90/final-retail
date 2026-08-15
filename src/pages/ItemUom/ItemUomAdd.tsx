import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { ItemUomFormData } from '../../types/ItemUom';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface ItemUomAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemUomFormData) => void | Promise<void>;
  initialData?: ItemUomFormData;
  isLoading?: boolean;
}

export function ItemUomAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ItemUomAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<ItemUomFormData>({
    defaultValues: {
      code: '',
      name: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        code: '',
        name: ''
      });
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ItemUomFormData) => {
    try {
      // Trim values before submission
      const trimmedData: ItemUomFormData = {
        code: data.code?.trim() || '',
        name: data.name?.trim() || ''
      };
      
      await onSubmit(trimmedData);
      onClose();
    } catch (error: any) {
      console.error('Error saving item UOM:', error);
      setError('root', {
        type: 'manual',
        message: error?.message || 'Failed to save item UOM. Please try again.'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="item-uom-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item UOM' : 'Add Item UOM'}
      width="w-[400px]"
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
            <OrderCodeSettingsIcon label="Code" value="" onChange={() => {}} />
          </div>
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
          {errors.code && (
            <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>
          )}
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
