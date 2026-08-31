import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { BankFormData } from '../../../types/Bank';

interface BankAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: BankFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: BankFormData = {
  bankCode: '',
  bankName: '',
  bankAddress: '',
  accountNumber: '',
  status: 'active',
};

export function BankAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: BankAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<BankFormData>({
    defaultValues: initialFormData
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: BankFormData) => {
    try {
      onEvent?.({
        eventType: initialData ? 'BankUpdated' : 'BankCreated',
        bank: formData,
      });
      onClose();
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving bank'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="bank-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Bank' : 'Add Bank'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="bank-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code *</label>
          <input
            {...register('bankCode', {
              required: 'Bank code is required',
              validate: value => value.trim() !== '' || 'Bank code cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bank code"
          />
          {errors.bankCode && (
            <p className="text-red-600 text-xs mt-1">{errors.bankCode.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
          <input
            {...register('bankName', {
              required: 'Bank name is required',
              validate: value => value.trim() !== '' || 'Bank name cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bank name"
          />
          {errors.bankName && (
            <p className="text-red-600 text-xs mt-1">{errors.bankName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
          <input
            {...register('accountNumber', {
              required: 'Account number is required',
              validate: value => value.trim() !== '' || 'Account number cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter account number"
          />
          {errors.accountNumber && (
            <p className="text-red-600 text-xs mt-1">{errors.accountNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Address *</label>
          <input
            {...register('bankAddress', {
              required: 'Bank address is required',
              validate: value => value.trim() !== '' || 'Bank address cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bank address"
          />
          {errors.bankAddress && (
            <p className="text-red-600 text-xs mt-1">{errors.bankAddress.message}</p>
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
