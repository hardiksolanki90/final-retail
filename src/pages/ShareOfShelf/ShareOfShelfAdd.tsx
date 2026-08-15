import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface ShareOfShelfFormFields {
  code: string;
  customerId: string;
  customerName: string;
  merchandiserId: string;
  merchandiserName: string;
  date: string;
  category: string;
  brandName: string;
  totalShelfSpace: number;
  ownShelfSpace: number;
  sharePercentage: number;
  competitorShelfSpace: number;
  notes?: string;
  status?: 'completed' | 'pending';
}

interface ShareOfShelfAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShareOfShelfFormFields) => void | Promise<void>;
  initialData?: ShareOfShelfFormFields;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
  categories?: SelectOption[];
  brands?: SelectOption[];
}

const defaultValues: ShareOfShelfFormFields = {
  code: '',
  customerId: '',
  customerName: '',
  merchandiserId: '',
  merchandiserName: '',
  date: '',
  category: '',
  brandName: '',
  totalShelfSpace: 0,
  ownShelfSpace: 0,
  sharePercentage: 0,
  competitorShelfSpace: 0,
  notes: '',
  status: 'pending',
};

export function ShareOfShelfAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  merchandisers = [],
  categories = [],
}: ShareOfShelfAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShareOfShelfFormFields>({ defaultValues });

  const totalShelfSpace = useWatch({ control, name: 'totalShelfSpace' });
  const ownShelfSpace = useWatch({ control, name: 'ownShelfSpace' });

  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, reset]);

  // Auto-calculate share percentage and competitor space
  useEffect(() => {
    const total = Number(totalShelfSpace) || 0;
    const own = Number(ownShelfSpace) || 0;
    if (total > 0) {
      setValue('sharePercentage', parseFloat(((own / total) * 100).toFixed(2)));
      setValue('competitorShelfSpace', total - own);
    }
  }, [totalShelfSpace, ownShelfSpace, setValue]);

  const onFormSubmit = async (data: ShareOfShelfFormFields) => {
    await onSubmit(data);
    onClose();
  };

  const selectClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  const defaultCategoryOptions: SelectOption[] = categories.length > 0 ? categories : [
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
      title={initialData ? 'Edit Share of Shelf' : 'Add Share of Shelf'}
      width="w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
                  <OrderCodeSettingsIcon label="Code" value="" onChange={() => {}} />
                </div>
                <Input
            label="Code"
            {...register('code', { required: 'Code is required' })}
            error={errors.code?.message}
            placeholder="Enter code"
            required
          />
          <Input
            label="Date"
            type="date"
            {...register('date', { required: 'Date is required' })}
            error={errors.date?.message}
            required
          />
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select {...register('category', { required: 'Category is required' })} className={selectClass}>
              <option value="">Select category</option>
              {defaultCategoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
          </div>
          <Input
            label="Brand Name"
            {...register('brandName', { required: 'Brand Name is required' })}
            error={errors.brandName?.message}
            placeholder="Enter brand name"
            required
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Shelf Space Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Shelf Space"
              type="number"
              {...register('totalShelfSpace', { valueAsNumber: true, min: { value: 0.01, message: 'Must be greater than 0' } })}
              error={errors.totalShelfSpace?.message}
              placeholder="Enter total shelf space"
              min="0" step="0.01"
              required
            />
            <Input
              label="Own Shelf Space"
              type="number"
              {...register('ownShelfSpace', { valueAsNumber: true })}
              placeholder="Enter own shelf space"
              min="0" step="0.01"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              label="Share Percentage"
              type="number"
              {...register('sharePercentage', { valueAsNumber: true })}
              placeholder="Auto-calculated"
              disabled
              step="0.01"
            />
              </div>
            <Input
              label="Competitor Shelf Space"
              type="number"
              {...register('competitorShelfSpace', { valueAsNumber: true })}
              placeholder="Auto-calculated"
              disabled
              step="0.01"
            />
          </div>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select {...register('status')} className={selectClass}>
            <option value="pending">Pending</option>
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
