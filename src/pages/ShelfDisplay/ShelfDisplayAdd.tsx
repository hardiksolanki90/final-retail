import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { ShelfDisplayFormData } from '../../types/ShelfDisplay';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface ShelfDisplayAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShelfDisplayFormData) => void | Promise<void>;
  initialData?: ShelfDisplayFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
  brands?: SelectOption[];
  categories?: SelectOption[];
}

const defaultValues: ShelfDisplayFormData = {
  displayCode: '',
  customerId: '',
  merchandiserId: '',
  date: '',
  category: '',
  brandId: '',
  shelfPosition: '',
  facingCount: 0,
  stockLevel: 'full',
  priceTagPresent: true,
  cleanlinessRating: 5,
  image: null,
  notes: '',
};

export function ShelfDisplayAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  merchandisers = [],
  brands = [],
  categories = [],
}: ShelfDisplayAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShelfDisplayFormData>({ defaultValues });

  const [imageName, setImageName] = useState('');

  useEffect(() => {
    reset(initialData ?? defaultValues);
    setImageName('');
  }, [initialData, isOpen, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      setImageName(file.name);
    }
  };

  const onFormSubmit = async (data: ShelfDisplayFormData) => {
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
      title={initialData ? 'Edit Shelf Display' : 'Add Shelf Display'}
      width="w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <Input
          label="Display Code"
          {...register('displayCode', { required: 'Display Code is required' })}
          error={errors.displayCode?.message}
          placeholder="Enter display code"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
                  <OrderCodeSettingsIcon label="Brand" value="" onChange={() => {}} />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
            <select {...register('brandId')} className={selectClass}>
              <option value="">Select brand</option>
              {brands.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shelf Position</label>
            <select {...register('shelfPosition')} className={selectClass}>
              <option value="">Select position</option>
              <option value="top">Top Shelf</option>
              <option value="eye-level">Eye Level</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <Input
            label="Facing Count"
            type="number"
            {...register('facingCount', { valueAsNumber: true })}
            placeholder="Enter facing count"
            min="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Level</label>
            <select {...register('stockLevel')} className={selectClass}>
              <option value="full">Full</option>
              <option value="partial">Partial</option>
              <option value="empty">Empty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Tag Present</label>
            <select
              className={selectClass}
              onChange={(e) => setValue('priceTagPresent', e.target.value === 'true')}
              defaultValue="true"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <Input
          label="Cleanliness Rating (1-10)"
          type="number"
          {...register('cleanlinessRating', { valueAsNumber: true })}
          placeholder="Enter rating"
          min="1" max="10"
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {imageName && <p className="mt-1 text-sm text-gray-500">{imageName}</p>}
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
          <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}