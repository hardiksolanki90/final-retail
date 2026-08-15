import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { DriverReplacementFormData } from '../../../types/DriverReplacement';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';

interface DriverReplacementAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DriverReplacementFormData) => void | Promise<void>;
  initialData?: DriverReplacementFormData;
  isLoading?: boolean;
}

const initialFormData: DriverReplacementFormData = {
  originalDriverId: '',
  replacementDriverId: '',
  startDate: '',
  endDate: '',
  reason: '',
  status: 'active',
};

export function DriverReplacementAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: DriverReplacementAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setError
  } = useForm<DriverReplacementFormData>({
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

  const onFormSubmit = async (data: DriverReplacementFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Error saving driver replacement' 
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="driver-replacement-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Driver Replacement' : 'Add Driver Replacement'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="driver-replacement-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Driver *</label>
                  <OrderCodeSettingsIcon label="Original Driver *" value="" onChange={() => {}} />
          <select
            {...register('originalDriverId', {
              required: 'Original Driver is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select driver</option>
            <option value="1">Driver 1</option>
            <option value="2">Driver 2</option>
          </select>
          {errors.originalDriverId && (
            <p className="text-red-600 text-xs mt-1">{errors.originalDriverId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Driver *</label>
          <select
            {...register('replacementDriverId', {
              required: 'Replacement Driver is required'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select replacement</option>
            <option value="3">Driver 3</option>
            <option value="4">Driver 4</option>
          </select>
          {errors.replacementDriverId && (
            <p className="text-red-600 text-xs mt-1">{errors.replacementDriverId.message}</p>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register('status')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && (
            <p className="text-red-600 text-xs mt-1">{errors.status.message}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}
