import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { Input } from '../../../components/ui/Input';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { WarehouseFormData } from '../../../types/Warehouse';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';

interface WarehouseAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WarehouseFormData) => void | Promise<void>;
  initialData?: WarehouseFormData;
  isLoading?: boolean;
}

const defaultValues: WarehouseFormData = {
  code: '',
  name: '',
  address: '',
  city: '',
  capacity: undefined,
  contactPerson: '',
  phone: '',
  email: '',
};

export function WarehouseAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: WarehouseAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormData>({ defaultValues });

  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: WarehouseFormData) => {
    await onSubmit(data);
    onClose();
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="warehouse-form" disabled={isLoading || isSubmitting}>
        {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Warehouse' : 'Add Warehouse'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="warehouse-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
                  <OrderCodeSettingsIcon label="Code" value="" onChange={() => {}} />
                </div>
                <Input
          label="Code"
          {...register('code', { required: 'Code is required' })}
          error={errors.code?.message}
          placeholder="Enter warehouse code"
          required
        />
              </div>
        <Input
          label="Name"
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
          placeholder="Enter warehouse name"
          required
        />
        <Input
          label="Address"
          {...register('address', { required: 'Address is required' })}
          error={errors.address?.message}
          placeholder="Enter address"
          required
        />
        <Input
          label="City"
          {...register('city')}
          error={errors.city?.message}
          placeholder="Enter city"
        />
        <Input
          label="Capacity"
          type="number"
          {...register('capacity', { valueAsNumber: true })}
          error={errors.capacity?.message}
          placeholder="Enter capacity"
        />
        <Input
          label="Contact Person"
          {...register('contactPerson')}
          error={errors.contactPerson?.message}
          placeholder="Enter contact person"
        />
        <Input
          label="Phone"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="Enter phone number"
        />
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="Enter email"
        />
      </form>
    </Drawer>
  );
}
