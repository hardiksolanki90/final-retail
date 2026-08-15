import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { SensorySurveyFormData } from '../../types/Survey';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface SensorySurveyAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SensorySurveyFormData) => void | Promise<void>;
  initialData?: SensorySurveyFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
  products?: SelectOption[];
}

const defaultValues: SensorySurveyFormData = {
  surveyCode: '',
  surveyName: '',
  productId: '',
  customerId: '',
  merchandiserId: '',
  date: '',
  appearance: 0,
  aroma: 0,
  taste: 0,
  texture: 0,
  overallRating: 0,
  comments: '',
  status: 'draft',
};

export function SensorySurveyAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  merchandisers = [],
  products = [],
}: SensorySurveyAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SensorySurveyFormData>({ defaultValues });

  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: SensorySurveyFormData) => {
    await onSubmit(data);
    onClose();
  };

  const selectClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Sensory Survey' : 'Add Sensory Survey'}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Product <span className="text-red-500">*</span>
          </label>
                  <OrderCodeSettingsIcon label="Comments" value="" onChange={() => {}} />
          <select {...register('productId', { required: 'Product is required' })} className={selectClass}>
            <option value="">Select product</option>
            {products.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.productId && <p className="text-sm text-red-500 mt-1">{errors.productId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
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

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Sensory Evaluation</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Appearance (1-10)"
              type="number"
              {...register('appearance', { valueAsNumber: true, min: 1, max: 10 })}
              placeholder="Rate 1-10"
              min="1" max="10"
            />
            <Input
              label="Aroma (1-10)"
              type="number"
              {...register('aroma', { valueAsNumber: true, min: 1, max: 10 })}
              placeholder="Rate 1-10"
              min="1" max="10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              label="Taste (1-10)"
              type="number"
              {...register('taste', { valueAsNumber: true, min: 1, max: 10 })}
              placeholder="Rate 1-10"
              min="1" max="10"
            />
            <Input
              label="Texture (1-10)"
              type="number"
              {...register('texture', { valueAsNumber: true, min: 1, max: 10 })}
              placeholder="Rate 1-10"
              min="1" max="10"
            />
          </div>
          <div className="mt-4">
            <Input
              label="Overall Rating (1-10)"
              type="number"
              {...register('overallRating', { valueAsNumber: true, min: 1, max: 10 })}
              placeholder="Rate 1-10"
              min="1" max="10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comments</label>
          <textarea
            {...register('comments')}
            placeholder="Enter comments"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

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