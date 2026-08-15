import { useEffect, type ChangeEvent } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { PlanogramFormData } from '../../types/Planogram';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface PlanogramAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlanogramFormData) => void | Promise<void>;
  initialData?: PlanogramFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
  categories?: SelectOption[];
}

const defaultValues: PlanogramFormData = {
  planogramCode: '',
  name: '',
  customerId: '',
  merchandiserId: '',
  category: '',
  description: '',
  image: null,
  shelfCount: 0,
  productsPerShelf: 0,
  date: '',
  status: 'active',
};

export function PlanogramAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  merchandisers = [],
  categories = [],
}: PlanogramAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    setError,
    clearErrors
  } = useForm<PlanogramFormData>({
    defaultValues,
    mode: 'onBlur'
  });

  const watchedImage = watch('image');
  const imageName = watchedImage?.name || '';

  useEffect(() => {
    if (initialData && isOpen) {
      reset(initialData);
    } else if (isOpen && !initialData) {
      reset(defaultValues);
    }
  }, [initialData, isOpen, reset]);

  const handleSelectChange = (field: keyof PlanogramFormData) => (e: ChangeEvent<HTMLSelectElement>) => {
    setValue(field, e.target.value);
    clearErrors(field);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      clearErrors('image');
    }
  };


  const onFormSubmit = async (data: PlanogramFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      console.error('Error saving planogram:', error);
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setError(field as keyof PlanogramFormData, { 
            type: 'server', 
            message: Array.isArray(message) ? message[0] : message 
          });
        });
      }
    }
  };

  const defaultCategories: SelectOption[] = categories.length > 0 ? categories : [
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'personal_care', label: 'Personal Care' },
    { value: 'household', label: 'Household' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Planogram' : 'Add Planogram'}
      width="w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Planogram Code"
            {...register('planogramCode', {
              required: 'Planogram Code is required',
              validate: (value) => value?.trim() || 'Planogram Code is required'
            })}
            error={errors.planogramCode?.message}
            placeholder="Enter planogram code"
            required
          />
          <Input
            label="Name"
            {...register('name', {
              required: 'Name is required',
              validate: (value) => value?.trim() || 'Name is required'
            })}
            error={errors.name?.message}
            placeholder="Enter name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Customer"
            {...register('customerId', {
              required: 'Customer is required'
            })}
            onChange={handleSelectChange('customerId')}
            options={customers}
            placeholder="Select customer"
            error={errors.customerId?.message}
            required
          />
          <Select
            label="Merchandiser"
            {...register('merchandiserId', {
              required: 'Merchandiser is required'
            })}
            onChange={handleSelectChange('merchandiserId')}
            options={merchandisers}
            placeholder="Select merchandiser"
            error={errors.merchandiserId?.message}
            required
          />
        </div>

        <Select
          label="Category"
          {...register('category', {
            required: 'Category is required'
          })}
          onChange={handleSelectChange('category')}
          options={defaultCategories}
          placeholder="Select category"
          error={errors.category?.message}
          required
        />

        <Input
          label="Date"
          type="date"
          {...register('date', {
            required: 'Date is required'
          })}
          error={errors.date?.message}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Shelf Count"
            type="number"
            {...register('shelfCount', {
              valueAsNumber: true,
              min: { value: 0, message: 'Shelf count must be 0 or greater' }
            })}
            placeholder="Enter shelf count"
            min="0"
            error={errors.shelfCount?.message}
          />
          <Input
            label="Products Per Shelf"
            type="number"
            {...register('productsPerShelf', {
              valueAsNumber: true,
              min: { value: 0, message: 'Products per shelf must be 0 or greater' }
            })}
            placeholder="Enter products per shelf"
            min="0"
            error={errors.productsPerShelf?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <OrderCodeSettingsIcon label="Description" value="" onChange={() => {}} />
          <textarea
            {...register('description')}
            placeholder="Enter description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full px-3 py-2 rounded-lg border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {imageName && <p className="mt-1 text-sm text-gray-500">{imageName}</p>}
        </div>

        <Select
          label="Status"
          {...register('status')}
          onChange={handleSelectChange('status')}
          options={statusOptions}
          placeholder="Select status"
          error={errors.status?.message}
        />

        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}
