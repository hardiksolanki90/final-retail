import { useState, useEffect, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { CampaignFormData } from '../../types/Campaign';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface CampaignAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => void | Promise<void>;
  initialData?: CampaignFormData;
  isLoading?: boolean;
  merchandisers?: SelectOption[];
  customers?: SelectOption[];
}

export function CampaignAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  merchandisers = [],
  customers = [],
}: CampaignAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    setValue
  } = useForm<CampaignFormData>({
    defaultValues: {
      campaignCode: '',
      date: '',
      merchandiserId: '',
      customerId: '',
      feedback: '',
      image: null
    }
  });

  const [imageName, setImageName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        campaignCode: '',
        date: '',
        merchandiserId: '',
        customerId: '',
        feedback: '',
        image: null
      });
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

  const onFormSubmit = async (data: CampaignFormData) => {
    try {
      // Trim string values before submission
      const trimmedData: CampaignFormData = {
        ...data,
        campaignCode: data.campaignCode?.trim() || '',
        feedback: data.feedback?.trim() || ''
      };
      
      await onSubmit(trimmedData);
      onClose();
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      setError('root', {
        type: 'manual',
        message: error?.message || 'Failed to save campaign. Please try again.'
      });
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Campaign' : 'Add Campaign'}
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
            Date <span className="text-red-500">*</span>
          </label>
                  <OrderCodeSettingsIcon label="Image Upload" value="" onChange={() => {}} />
          <input
            type="datetime-local"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Campaign Code <span className="text-red-500">*</span>
          </label>
          <input
            {...register('campaignCode', {
              required: 'Campaign Code is required',
              validate: value => value?.trim() ? true : 'Campaign Code is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter campaign code"
          />
          {errors.campaignCode && (
            <p className="text-red-600 text-xs mt-1">{errors.campaignCode.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Merchandiser <span className="text-red-500">*</span>
          </label>
          <select
            {...register('merchandiserId', { required: 'Merchandiser is required' })}
            className="block w-full px-3 py-2 rounded-lg border transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select merchandiser</option>
            {merchandisers.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.merchandiserId && (
            <p className="text-red-600 text-xs mt-1">{errors.merchandiserId.message}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('feedback', {
              required: 'Feedback is required',
              validate: value => value?.trim() ? true : 'Feedback is required'
            })}
            placeholder="Enter campaign feedback"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.feedback && (
            <p className="text-red-600 text-xs mt-1">{errors.feedback.message}</p>
          )}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image Upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {imageName && <p className="mt-1 text-sm text-gray-500">{imageName}</p>}
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