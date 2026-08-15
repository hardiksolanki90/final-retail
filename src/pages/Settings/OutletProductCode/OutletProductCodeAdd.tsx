import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { OutletProductCodeFormData } from '../../../types/OutletProductCode';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';

interface OutletProductCodeAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OutletProductCodeFormData) => void | Promise<void>;
  initialData?: OutletProductCodeFormData;
  isLoading?: boolean;
}

const initialFormData: OutletProductCodeFormData = {
  code: '',
  productName: '',
  outletId: '',
  customerId: '',
};

export function OutletProductCodeAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: OutletProductCodeAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<OutletProductCodeFormData>({
    defaultValues: initialFormData
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: OutletProductCodeFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Error saving outlet product code' 
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="outlet-product-code-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Outlet Product Code' : 'Add Outlet Product Code'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="outlet-product-code-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <OrderCodeSettingsIcon label="Code *" value="" onChange={() => {}} />
          <input
            {...register('code', {
              required: 'Code is required',
              validate: value => value.trim() !== '' || 'Code cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter code"
          />
          {errors.code && (
            <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            {...register('productName', {
              required: 'Product Name is required',
              validate: value => value.trim() !== '' || 'Product Name cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product name"
          />
          {errors.productName && (
            <p className="text-red-600 text-xs mt-1">{errors.productName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outlet ID *</label>
          <input
            {...register('outletId', {
              required: 'Outlet ID is required',
              validate: value => value.trim() !== '' || 'Outlet ID cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter outlet ID"
          />
          {errors.outletId && (
            <p className="text-red-600 text-xs mt-1">{errors.outletId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
          <input
            {...register('customerId', {
              required: 'Customer ID is required',
              validate: value => value.trim() !== '' || 'Customer ID cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter customer ID"
          />
          {errors.customerId && (
            <p className="text-red-600 text-xs mt-1">{errors.customerId.message}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}
