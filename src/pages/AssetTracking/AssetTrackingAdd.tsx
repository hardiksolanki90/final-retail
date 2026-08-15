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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asset Code <span className="text-red-500">*</span>
          </label>
                  <OrderCodeSettingsIcon label="Image" value="" onChange={() => {}} />
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
          {errors.assetCode && (
            <p className="text-red-600 text-xs mt-1">{errors.assetCode.message}</p>
          )}
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
          <Input
            label="From Date"
            type="date"
            value={formData.fromDate}
            onChange={(e) => handleChange('fromDate', e.target.value)}
            error={errors.fromDate}
            required
          />
          <Input
            label="To Date"
            type="date"
            value={formData.toDate}
            onChange={(e) => handleChange('toDate', e.target.value)}
            error={errors.toDate}
            required
          />
        </div>

        <Input
          label="Model Name"
          value={formData.modelName}
          onChange={(e) => handleChange('modelName', e.target.value)}
          error={errors.modelName}
          placeholder="Enter model name"
          required
        />

        <Input
          label="Barcode"
          value={formData.barcode}
          onChange={(e) => handleChange('barcode', e.target.value)}
          error={errors.barcode}
          placeholder="Enter barcode"
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={handleSelectChange('category')}
          options={defaultCategories}
          placeholder="Select category"
          required
        />

        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          error={errors.location}
          placeholder="Enter location"
          required
        />

        <Input
          label="Area"
          value={formData.area}
          onChange={(e) => handleChange('area', e.target.value)}
          error={errors.area}
          placeholder="Enter area"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Worker"
            value={formData.worker || ''}
            onChange={(e) => handleChange('worker', e.target.value)}
            placeholder="Enter worker name"
          />
          <Input
            label="Additional Worker"
            value={formData.additionalWorker || ''}
            onChange={(e) => handleChange('additionalWorker', e.target.value)}
            placeholder="Enter additional worker"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Team"
            value={formData.team || ''}
            onChange={(e) => handleChange('team', e.target.value)}
            placeholder="Enter team name"
          />
          <Input
            label="Vendors"
            value={formData.vendors || ''}
            onChange={(e) => handleChange('vendors', e.target.value)}
            placeholder="Enter vendor name"
          />
        </div>

        <Select
          label="Customer"
          value={formData.customerId}
          onChange={handleSelectChange('customerId')}
          options={customers}
          placeholder="Select customer"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            value={formData.purchaseDate || ''}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
          />
          <Input
            label="Placed In Service"
            type="date"
            value={formData.placedInService || ''}
            onChange={(e) => handleChange('placedInService', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Price"
            type="number"
            value={formData.purchasePrice?.toString() || '0'}
            onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
            placeholder="Enter purchase price"
          />
          <Input
            label="Residual Price"
            type="number"
            value={formData.residualPrice?.toString() || '0'}
            onChange={(e) => handleChange('residualPrice', parseFloat(e.target.value) || 0)}
            placeholder="Enter residual price"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Warranty Expiration"
            type="date"
            value={formData.warrantyExpiration || ''}
            onChange={(e) => handleChange('warrantyExpiration', e.target.value)}
          />
          <Input
            label="Useful Life"
            value={formData.usefulLife || ''}
            onChange={(e) => handleChange('usefulLife', e.target.value)}
            placeholder="Enter useful life"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Information
          </label>
          <textarea
            value={formData.additionalInformation || ''}
            onChange={(e) => handleChange('additionalInformation', e.target.value)}
            placeholder="Enter additional information"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isSubmitting}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}
