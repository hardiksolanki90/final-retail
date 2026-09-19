import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { CountryPhoneInput } from '../../../components/ui/CountryPhoneInput';
import { Select } from '../../../components/ui/Select';

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string | number;
}

interface UserAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void | Promise<void>;
  initialData?: UserFormData;
  rolesOptions: { value: string | number; label: string }[];
}

const initialFormData: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roleId: '',
};

export function UserAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  rolesOptions = [],
}: UserAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    control,
  } = useForm<UserFormData>({
    defaultValues: initialFormData
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving user'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="user-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update user' : 'Create user'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit User' : 'Create User'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="user-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
            <input
              {...register('firstName', {
                required: 'First name is required',
                validate: value => value.trim() !== '' || 'First name cannot be empty'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
            <input
              {...register('lastName', {
                required: 'Last name is required',
                validate: value => value.trim() !== '' || 'Last name cannot be empty'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <CountryPhoneInput
                label="Phone*"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.phone?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="roleId"
            control={control}
            rules={{ required: 'Role is required' }}
            render={({ field }) => (
              <Select
                label="Roles*"
                placeholder="Select a role"
                searchable
                options={rolesOptions}
                value={field.value ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.roleId?.message}
              />
            )}
          />
        </div>
      </form>
    </Drawer>
  );
}
