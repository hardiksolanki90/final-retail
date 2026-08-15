import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { MerchandiserReplacementFormData } from '../../../types/MerchandiserReplacement';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';

interface MerchandiserReplacementAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MerchandiserReplacementFormData) => void | Promise<void>;
  initialData?: MerchandiserReplacementFormData;
  isLoading?: boolean;
}

const initialFormData: MerchandiserReplacementFormData = {
  originalMerchandiserId: '',
  replacementMerchandiserId: '',
  startDate: '',
  endDate: '',
  reason: '',
  status: 'active',
};

export function MerchandiserReplacementAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: MerchandiserReplacementAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch
  } = useForm<MerchandiserReplacementFormData>({
    defaultValues: initialFormData
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: MerchandiserReplacementFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Error saving merchandiser replacement' 
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-primary)]">Status:</span>
        <button
          type="button"
          onClick={() => {
            const currentStatus = watchedStatus || 'active';
            reset({ ...watch(), status: currentStatus === 'active' ? 'inactive' : 'active' });
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            (watchedStatus || 'active') === 'active'
              ? 'bg-primary-600 dark:bg-primary-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              (watchedStatus || 'active') === 'active' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${
          (watchedStatus || 'active') === 'active'
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {(watchedStatus || 'active') === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
        <SaveButton type="submit" form="merchandiser-replacement-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
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
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Merchandiser *</label>
                  <OrderCodeSettingsIcon label="Original Merchandiser *" value="" onChange={() => {}} />
          <select
            {...register('originalMerchandiserId', {
              required: 'Original Merchandiser is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select merchandiser</option>
            <option value="1">Merchandiser 1</option>
            <option value="2">Merchandiser 2</option>
          </select>
          {errors.originalMerchandiserId && (
            <p className="text-red-600 text-xs mt-1">{errors.originalMerchandiserId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Merchandiser *</label>
          <select
            {...register('replacementMerchandiserId', {
              required: 'Replacement Merchandiser is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select replacement</option>
            <option value="3">Merchandiser 3</option>
            <option value="4">Merchandiser 4</option>
          </select>
          {errors.replacementMerchandiserId && (
            <p className="text-red-600 text-xs mt-1">{errors.replacementMerchandiserId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              {...register('startDate', {
                required: 'Start Date is required'
              })}
              type="date"
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.startDate && (
              <p className="text-red-600 text-xs mt-1">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              {...register('endDate')}
              type="date"
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.endDate && (
              <p className="text-red-600 text-xs mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input
            {...register('reason')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter reason"
          />
          {errors.reason && (
            <p className="text-red-600 text-xs mt-1">{errors.reason.message}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}
