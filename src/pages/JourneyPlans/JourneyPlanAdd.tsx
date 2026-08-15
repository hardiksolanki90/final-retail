import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { JourneyPlanFormData } from '../../types/JourneyPlan';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface JourneyPlanAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JourneyPlanFormData) => void | Promise<void>;
  initialData?: JourneyPlanFormData;
  isLoading?: boolean;
  salesmen?: SelectOption[];
  routes?: SelectOption[];
  customers?: SelectOption[];
}

export function JourneyPlanAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  salesmen = [],
  routes = [],
  customers = [],
}: JourneyPlanAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<JourneyPlanFormData>({
    defaultValues: {
      planCode: '',
      planName: '',
      salesmanId: '',
      routeId: '',
      startDate: '',
      endDate: '',
      customers: [],
      visitFrequency: 'weekly',
      notes: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        planCode: '',
        planName: '',
        salesmanId: '',
        routeId: '',
        startDate: '',
        endDate: '',
        customers: [],
        visitFrequency: 'weekly',
        notes: '',
        status: 'active'
      });
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: JourneyPlanFormData) => {
    try {
      // Trim string values before submission
      const trimmedData: JourneyPlanFormData = {
        ...data,
        planCode: data.planCode?.trim() || '',
        planName: data.planName?.trim() || '',
        notes: data.notes?.trim() || ''
      };
      
      await onSubmit(trimmedData);
      onClose();
    } catch (error: any) {
      console.error('Error saving journey plan:', error);
      setError('root', {
        type: 'manual',
        message: error?.message || 'Failed to save journey plan. Please try again.'
      });
    }
  };

  const frequencyOptions: SelectOption[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Journey Plan' : 'Add Journey Plan'}
      width="w-[600px]"
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
              Plan Code <span className="text-red-500">*</span>
            </label>
                  <OrderCodeSettingsIcon label="Visit Frequency" value="" onChange={() => {}} />
            <input
              {...register('planCode', {
                required: 'Plan Code is required',
                validate: value => value?.trim() ? true : 'Plan Code is required'
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter plan code"
            />
            {errors.planCode && (
              <p className="text-red-600 text-xs mt-1">{errors.planCode.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('planName', {
                required: 'Plan Name is required',
                validate: value => value?.trim() ? true : 'Plan Name is required'
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter plan name"
            />
            {errors.planName && (
              <p className="text-red-600 text-xs mt-1">{errors.planName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Route <span className="text-red-500">*</span>
            </label>
            <select
              {...register('routeId', { required: 'Route is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select route</option>
              {routes.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.routeId && (
              <p className="text-red-600 text-xs mt-1">{errors.routeId.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('startDate', { required: 'Start Date is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.startDate && (
              <p className="text-red-600 text-xs mt-1">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('endDate', { required: 'End Date is required' })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.endDate && (
              <p className="text-red-600 text-xs mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visit Frequency</label>
          <select
            {...register('visitFrequency')}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select frequency</option>
            {frequencyOptions.map((option) => (
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            {...register('notes')}
            placeholder="Enter notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}
