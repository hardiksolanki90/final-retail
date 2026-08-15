import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { AddPalletFormData } from '../../types/Pallet';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface PalletAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddPalletFormData) => void | Promise<void>;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  items?: SelectOption[];
  divisions?: SelectOption[];
  warehouses?: SelectOption[];
}

export function PalletAdd({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  salesmen = [],
  items = [],
  divisions = [],
  warehouses = [],
}: PalletAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<AddPalletFormData>({
    defaultValues: {
      date: '',
      salesmanId: '',
      itemId: '',
      divisionId: '',
      warehouseId: '',
      qty: '',
      palletType: 'allocated'
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        date: '',
        salesmanId: '',
        itemId: '',
        divisionId: '',
        warehouseId: '',
        qty: '',
        palletType: 'allocated'
      });
    }
  }, [isOpen, reset]);

  const onFormSubmit = async (data: AddPalletFormData) => {
    try {
      // Convert qty to number before submission
      const processedData: AddPalletFormData = {
        ...data,
        qty: Number(data.qty)
      };
      
      await onSubmit(processedData);
      onClose();
    } catch (error: any) {
      console.error('Error saving pallet:', error);
      setError('root', {
        type: 'manual',
        message: error?.message || 'Failed to save pallet. Please try again.'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Status placeholder if needed, matching CustomerAdd style */}
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isSubmitting}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="add-pallet-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Pallet'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Pallet"
      width="w-[700px]"
      footer={footerContent}
    >
      <form id="add-pallet-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.root.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
                  <OrderCodeSettingsIcon label="Salesman" value="" onChange={() => {}} />
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.date && (
              <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Salesman */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salesman</label>
            <select
              {...register('salesmanId')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select salesman</option>
              {salesmen.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item</label>
            <select
              {...register('itemId')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select item</option>
              {items.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Division</label>
            <select
              {...register('divisionId')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select division</option>
              {divisions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Warehouse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse</label>
            <select
              {...register('warehouseId')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Qty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Qty <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              {...register('qty', {
                required: 'Quantity is required',
                validate: value => {
                  const numValue = Number(value);
                  if (isNaN(numValue) || numValue <= 0) {
                    return 'Quantity must be greater than zero';
                  }
                  return true;
                }
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter quantity"
            />
            {errors.qty && (
              <p className="text-red-600 text-xs mt-1">{errors.qty.message}</p>
            )}
          </div>
        </div>

        {/* Pallet Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pallet Type
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="allocated"
                {...register('palletType')}
                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">Allocated</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="return"
                {...register('palletType')}
                className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">Return</span>
            </label>
          </div>
        </div>
      </form>
    </Drawer>
  );
}
