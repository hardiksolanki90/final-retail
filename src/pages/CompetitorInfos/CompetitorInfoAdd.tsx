import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { CompetitorInfoFormData } from '../../types/CompetitorInfo';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface CompetitorInfoAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompetitorInfoFormData) => void | Promise<void>;
  initialData?: CompetitorInfoFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  salesmen?: SelectOption[];
  categories?: SelectOption[];
}

export function CompetitorInfoAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  salesmen = [],
  categories = [],
}: CompetitorInfoAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<CompetitorInfoFormData>({
    defaultValues: {
      competitorName: '',
      competitorBrand: '',
      customerId: '',
      salesmanId: '',
      observationDate: '',
      productName: '',
      productCategory: '',
      price: 0,
      promotionDetails: '',
      displayType: '',
      shelfSpace: '',
      stockAvailability: 'in_stock',
      marketShare: 0,
      strengths: '',
      weaknesses: '',
      threats: '',
      opportunities: '',
      notes: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        competitorName: '',
        competitorBrand: '',
        customerId: '',
        salesmanId: '',
        observationDate: '',
        productName: '',
        productCategory: '',
        price: 0,
        promotionDetails: '',
        displayType: '',
        shelfSpace: '',
        stockAvailability: 'in_stock',
        marketShare: 0,
        strengths: '',
        weaknesses: '',
        threats: '',
        opportunities: '',
        notes: '',
        status: 'active'
      });
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: CompetitorInfoFormData) => {
    try {
      // Trim string values before submission
      const trimmedData: CompetitorInfoFormData = {
        ...data,
        competitorName: data.competitorName?.trim() || '',
        competitorBrand: data.competitorBrand?.trim() || '',
        productName: data.productName?.trim() || '',
        promotionDetails: data.promotionDetails?.trim() || '',
        shelfSpace: data.shelfSpace?.trim() || '',
        strengths: data.strengths?.trim() || '',
        weaknesses: data.weaknesses?.trim() || '',
        threats: data.threats?.trim() || '',
        opportunities: data.opportunities?.trim() || '',
        notes: data.notes?.trim() || ''
      };
      
      await onSubmit(trimmedData);
      onClose();
    } catch (error: any) {
      console.error('Error saving competitor info:', error);
      setError('root', {
        type: 'manual',
        message: error?.message || 'Failed to save competitor info. Please try again.'
      });
    }
  };

  const stockAvailabilityOptions: SelectOption[] = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'low_stock', label: 'Low Stock' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const displayTypeOptions: SelectOption[] = [
    { value: 'shelf', label: 'Shelf' },
    { value: 'endcap', label: 'End Cap' },
    { value: 'floor', label: 'Floor Display' },
    { value: 'counter', label: 'Counter' },
  ];

  const defaultCategories: SelectOption[] = categories.length > 0 ? categories : [
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'personal_care', label: 'Personal Care' },
    { value: 'household', label: 'Household' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Competitor Info' : 'Add Competitor Info'}
      width="w-[700px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.root.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Competitor Name <span className="text-red-500">*</span>
            </label>
                  <OrderCodeSettingsIcon label="Price" value="" onChange={() => {}} />
            <input
              {...register('competitorName', {
                required: 'Competitor Name is required',
                validate: value => value?.trim() ? true : 'Competitor Name is required'
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter competitor name"
            />
            {errors.competitorName && (
              <p className="text-red-600 text-xs mt-1">{errors.competitorName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Competitor Brand <span className="text-red-500">*</span>
            </label>
            <input
              {...register('competitorBrand', {
                required: 'Competitor Brand is required',
                validate: value => value?.trim() ? true : 'Competitor Brand is required'
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter competitor brand"
            />
            {errors.competitorBrand && (
              <p className="text-red-600 text-xs mt-1">{errors.competitorBrand.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              {...register('customerId', { required: 'Customer is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Salesman <span className="text-red-500">*</span>
            </label>
            <select
              {...register('salesmanId', { required: 'Salesman is required' })}
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
            {errors.salesmanId && (
              <p className="text-red-600 text-xs mt-1">{errors.salesmanId.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('observationDate', { required: 'Observation Date is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.observationDate && (
            <p className="text-red-600 text-xs mt-1">{errors.observationDate.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('productName', {
                required: 'Product Name is required',
                validate: value => value?.trim() ? true : 'Product Name is required'
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter product name"
            />
            {errors.productName && (
              <p className="text-red-600 text-xs mt-1">{errors.productName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register('productCategory', { required: 'Product Category is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select category</option>
              {defaultCategories.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.productCategory && (
              <p className="text-red-600 text-xs mt-1">{errors.productCategory.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              {...register('price', { valueAsNumber: true, min: { value: 0, message: 'Price must be positive' } })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter price"
            />
            {errors.price && (
              <p className="text-red-600 text-xs mt-1">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Market Share (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              {...register('marketShare', { valueAsNumber: true, min: { value: 0, message: 'Market share must be positive' }, max: { value: 100, message: 'Market share cannot exceed 100%' } })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter market share"
            />
            {errors.marketShare && (
              <p className="text-red-600 text-xs mt-1">{errors.marketShare.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Promotion Details</label>
          <input
            {...register('promotionDetails')}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter promotion details"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Type</label>
            <select
              {...register('displayType')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select display type</option>
              {displayTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shelf Space</label>
            <input
              {...register('shelfSpace')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter shelf space"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Availability</label>
            <select
              {...register('stockAvailability')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select stock availability</option>
              {stockAvailabilityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              {...register('status')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Strengths</label>
            <textarea
              {...register('strengths')}
              placeholder="Enter strengths"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weaknesses</label>
            <textarea
              {...register('weaknesses')}
              placeholder="Enter weaknesses"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opportunities</label>
            <textarea
              {...register('opportunities')}
              placeholder="Enter opportunities"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threats</label>
            <textarea
              {...register('threats')}
              placeholder="Enter threats"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            {...register('notes')}
            placeholder="Enter additional notes"
            rows={3}
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
