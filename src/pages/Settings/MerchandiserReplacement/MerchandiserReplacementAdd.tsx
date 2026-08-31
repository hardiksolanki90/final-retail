import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { MerchandiserReplacementFormData } from '../../../types/MerchandiserReplacement';
import type { SalesmanSelectOption } from '../../../types/Salesman';

interface MerchandiserReplacementAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MerchandiserReplacementFormData) => void | Promise<void>;
  initialData?: MerchandiserReplacementFormData;
  salesmanOptions: SalesmanSelectOption[];
}

const initialFormData: MerchandiserReplacementFormData = {
  oldSalesmanId: '',
  newSalesmanId: '',
  type: '',
  addedOn: '',
};

export function MerchandiserReplacementAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  salesmanOptions,
}: MerchandiserReplacementAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<MerchandiserReplacementFormData>({
    defaultValues: initialFormData,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: MerchandiserReplacementFormData) => {
    try {
      const payload = {
        ...data,
        oldSalesmanId: Number(data.oldSalesmanId),
        newSalesmanId: Number(data.newSalesmanId),
      };
      await onSubmit(payload);
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving merchandiser replacement',
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="merchandiser-replacement-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Replacement' : 'Add Replacement'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="merchandiser-replacement-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Salesman *</label>
          <select
            {...register('oldSalesmanId', { required: 'Old Salesman is required' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select old salesman</option>
            {salesmanOptions.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.salesmanCode})</option>
            ))}
          </select>
          {errors.oldSalesmanId && <p className="text-red-600 text-xs mt-1">{errors.oldSalesmanId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Salesman *</label>
          <select
            {...register('newSalesmanId', { required: 'New Salesman is required' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select new salesman</option>
            {salesmanOptions.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.salesmanCode})</option>
            ))}
          </select>
          {errors.newSalesmanId && <p className="text-red-600 text-xs mt-1">{errors.newSalesmanId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
          <input
            {...register('type', { required: 'Type is required' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Route Change, Territory Swap"
          />
          {errors.type && <p className="text-red-600 text-xs mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Added On *</label>
          <input
            {...register('addedOn', { required: 'Added On date is required' })}
            type="date"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.addedOn && <p className="text-red-600 text-xs mt-1">{errors.addedOn.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
