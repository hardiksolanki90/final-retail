import { useState, useEffect, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { AssetTrackingFormData } from '../../types/AssetTracking';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface AssetTrackingAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: AssetTrackingFormData;
    isLoading?: boolean;
    customers?: SelectOption[];
    categories?: SelectOption[];
  };
  onEvent?: (event: any) => void;
}

const initialFormData: AssetTrackingFormData = {
  assetCode: '',
  title: '',
  description: '',
  fromDate: '',
  toDate: '',
  modelName: '',
  barcode: '',
  category: '',
  location: '',
  area: '',
  worker: '',
  additionalWorker: '',
  team: '',
  vendors: '',
  customerId: '',
  purchaseDate: '',
  placedInService: '',
  purchasePrice: 0,
  warrantyExpiration: '',
  residualPrice: 0,
  usefulLife: '',
  additionalInformation: '',
  image: null,
};

export function AssetTrackingAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: AssetTrackingAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;
  const customers = data?.customers || [];
  const categories = data?.categories || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue
  } = useForm<AssetTrackingFormData>({
    defaultValues: initialFormData
  });

  const [imageName, setImageName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      reset(initialData || initialFormData);
      setImageName('');
    }
  }, [initialData, isOpen, reset]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      setImageName(file.name);
    }
  };

  const onFormSubmit = async (data: AssetTrackingFormData) => {
    try {
      // Trim string values before submission
      const trimmedData: AssetTrackingFormData = {
        ...data,
        assetCode: data.assetCode?.trim() || '',
        title: data.title?.trim() || '',
        description: data.description?.trim() || '',
        modelName: data.modelName?.trim() || '',
        barcode: data.barcode?.trim() || '',
        location: data.location?.trim() || '',
        area: data.area?.trim() || '',
        worker: data.worker?.trim() || '',
        additionalWorker: data.additionalWorker?.trim() || '',
        team: data.team?.trim() || '',
        vendors: data.vendors?.trim() || '',
        usefulLife: data.usefulLife?.trim() || '',
        additionalInformation: data.additionalInformation?.trim() || ''
      };
      
      // Submit via onEvent pattern
      onEvent?.({ eventType: 'AssetTrackingCreated', assetTracking: trimmedData });
      onClose();
    } catch (error: any) {
      console.error('Error saving asset tracking:', error);
      setError('root', {
        type: 'manual',
        message: error?.message || 'Failed to save asset tracking. Please try again.'
      });
    }
  };

  const defaultCategories: SelectOption[] = categories.length > 0 ? categories : [
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Vehicles', label: 'Vehicles' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Asset Tracking' : 'Add Asset Tracking'}
      width="w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.root.message}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Asset Code <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('assetCode', {
                required: 'Asset Code is required',
                validate: value => value?.trim() ? true : 'Asset Code is required'
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter asset code"
            />
            <OrderCodeSettingsIcon label="Asset Code" value={watch('assetCode') || ''} onChange={(v) => setValue('assetCode', v)} />
            {errors.assetCode && (
              <p className="text-red-600 text-xs mt-1">{errors.assetCode.message}</p>
            )}
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {imageName && <p className="mt-1 text-sm text-gray-500">{imageName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title', {
              required: 'Title is required',
              validate: value => value?.trim() ? true : 'Title is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter title"
          />
          {errors.title && (
            <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            {...register('description', {
              required: 'Description is required',
              validate: value => value?.trim() ? true : 'Description is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter description"
          />
          {errors.description && (
            <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('fromDate', { required: 'From Date is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.fromDate && (
              <p className="text-red-600 text-xs mt-1">{errors.fromDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('toDate', { required: 'To Date is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.toDate && (
              <p className="text-red-600 text-xs mt-1">{errors.toDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('modelName', { required: 'Model Name is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter model name"
          />
          {errors.modelName && (
            <p className="text-red-600 text-xs mt-1">{errors.modelName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Barcode <span className="text-red-500">*</span>
          </label>
          <input
            {...register('barcode', { required: 'Barcode is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter barcode"
          />
          {errors.barcode && (
            <p className="text-red-600 text-xs mt-1">{errors.barcode.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select category</option>
            {defaultCategories.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            {...register('location', { required: 'Location is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter location"
          />
          {errors.location && (
            <p className="text-red-600 text-xs mt-1">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Area <span className="text-red-500">*</span>
          </label>
          <input
            {...register('area', { required: 'Area is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter area"
          />
          {errors.area && (
            <p className="text-red-600 text-xs mt-1">{errors.area.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Worker</label>
            <input
              {...register('worker')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter worker name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Worker</label>
            <input
              {...register('additionalWorker')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter additional worker"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
            <input
              {...register('team')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter team name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendors</label>
            <input
              {...register('vendors')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter vendor name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            {...register('customerId', { required: 'Customer is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select customer</option>
            {customers.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-red-600 text-xs mt-1">{errors.customerId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date</label>
            <input
              type="date"
              {...register('purchaseDate')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placed In Service</label>
            <input
              type="date"
              {...register('placedInService')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Price</label>
            <input
              type="number"
              {...register('purchasePrice', { valueAsNumber: true })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter purchase price"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Residual Price</label>
            <input
              type="number"
              {...register('residualPrice', { valueAsNumber: true })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter residual price"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warranty Expiration</label>
            <input
              type="date"
              {...register('warrantyExpiration')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Useful Life</label>
            <input
              {...register('usefulLife')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter useful life"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Information
          </label>
          <textarea
            {...register('additionalInformation')}
            placeholder="Enter additional information"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isSubmitting || isLoading}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}
