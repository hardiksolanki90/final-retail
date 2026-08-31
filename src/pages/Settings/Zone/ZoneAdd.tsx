import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { ZoneFormData } from '../../../types/Zone';

interface ZoneAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: ZoneFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: ZoneFormData = {
  name: '',
  noTruck: '',
  status: 'active',
};

export function ZoneAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: ZoneAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<ZoneFormData>({
    defaultValues: initialFormData
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: ZoneFormData) => {
    try {
      onEvent?.({
        eventType: initialData ? 'ZoneUpdated' : 'ZoneCreated',
        zone: formData,
      });
      onClose();
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving zone'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="zone-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Zone' : 'Add Zone'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="zone-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            {...register('name', {
              required: 'Name is required',
              validate: value => value.trim() !== '' || 'Name cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter zone name"
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. of Trucks *</label>
          <input
            {...register('noTruck', {
              required: 'Number of trucks is required',
              validate: value => value.trim() !== '' || 'Number of trucks cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter number of trucks"
          />
          {errors.noTruck && (
            <p className="text-red-600 text-xs mt-1">{errors.noTruck.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
          <select
            {...register('status', { required: 'Status is required' })}
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
