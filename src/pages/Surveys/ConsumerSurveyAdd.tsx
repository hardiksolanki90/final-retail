import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { ConsumerSurveyFormData } from '../../types/Survey';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface ConsumerSurveyAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConsumerSurveyFormData) => void | Promise<void>;
  initialData?: ConsumerSurveyFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
}

const defaultValues: ConsumerSurveyFormData = {
  surveyCode: '',
  surveyName: '',
  customerId: '',
  merchandiserId: '',
  date: '',
  questions: [],
  status: 'draft',
};

export function ConsumerSurveyAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  merchandisers = [],
}: ConsumerSurveyAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerSurveyFormData>({ defaultValues });

  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ConsumerSurveyFormData) => {
    await onSubmit(data);
    onClose();
  };

  const selectClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Consumer Survey' : 'Add Consumer Survey'}
      width="w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Survey Code"
            {...register('surveyCode', { required: 'Survey Code is required' })}
            error={errors.surveyCode?.message}
            placeholder="Enter survey code"
            required
          />
          <Input
            label="Survey Name"
            {...register('surveyName', { required: 'Survey Name is required' })}
            error={errors.surveyName?.message}
            placeholder="Enter survey name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
                  <OrderCodeSettingsIcon label="Status" value="" onChange={() => {}} />
            <select {...register('customerId', { required: 'Customer is required' })} className={selectClass}>
              <option value="">Select customer</option>
              {customers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Merchandiser <span className="text-red-500">*</span>
            </label>
            <select {...register('merchandiserId', { required: 'Merchandiser is required' })} className={selectClass}>
              <option value="">Select merchandiser</option>
              {merchandisers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.merchandiserId && <p className="text-sm text-red-500 mt-1">{errors.merchandiserId.message}</p>}
          </div>
        </div>

        <Input
          label="Date"
          type="date"
          {...register('date', { required: 'Date is required' })}
          error={errors.date?.message}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select {...register('status')} className={selectClass}>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}