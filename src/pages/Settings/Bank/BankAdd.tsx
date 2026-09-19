import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { BankFormData } from '../../../types/Bank';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { useAuth } from '../../../context/AuthContext';

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
  status: true,
  iban: '',
  swiftCode: '',
  ifscCode: '',
  routingNumber: '',
  sortCode: '',
  branchName: '',
};

export function BankAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: BankAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;
  const { user } = useAuth();
  const countryCode = user?.organisation?.country?.countryCode?.toUpperCase() || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue
  } = useForm<BankFormData>({
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

  const onFormSubmit = async (formData: BankFormData) => {
    try {
      await onEvent?.({
        eventType: initialData ? 'BankUpdated' : 'BankCreated',
        bank: formData,
      });
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving bank'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <button
          type="button"
          onClick={() => setValue('status', !watchedStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            watchedStatus ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              watchedStatus ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="flex gap-3">
        <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
        <SaveButton type="submit" form="bank-form" disabled={isLoading || isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Bank Code *</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('bankCode', {
                required: 'Bank code is required',
                validate: value => value.trim() !== '' || 'Bank code cannot be empty'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter bank code"
            />
            <OrderCodeSettingsIcon label="Bank Code" value={watch('bankCode') || ''} onChange={(v) => setValue('bankCode', v)} />
            {errors.bankCode && (
              <p className="text-red-600 text-xs mt-1">{errors.bankCode.message}</p>
            )}
          </div>
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

        {countryCode === 'AE' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN *</label>
              <input
                {...register('iban', {
                  required: 'IBAN is required for UAE'
                })}
                className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter IBAN"
              />
              {errors.iban && <p className="text-red-600 text-xs mt-1">{errors.iban.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Swift Code *</label>
              <input
                {...register('swiftCode', {
                  required: 'Swift Code is required for UAE'
                })}
                className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Swift Code"
              />
              {errors.swiftCode && <p className="text-red-600 text-xs mt-1">{errors.swiftCode.message}</p>}
            </div>
          </>
        )}
        
        {countryCode === 'IN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
            <input
              {...register('ifscCode', {
                required: 'IFSC Code is required for India'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter IFSC Code"
            />
            {errors.ifscCode && <p className="text-red-600 text-xs mt-1">{errors.ifscCode.message}</p>}
          </div>
        )}

        {countryCode === 'US' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number *</label>
            <input
              {...register('routingNumber', {
                required: 'Routing Number is required for US'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Routing Number"
            />
            {errors.routingNumber && <p className="text-red-600 text-xs mt-1">{errors.routingNumber.message}</p>}
          </div>
        )}

        {countryCode === 'GB' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code *</label>
            <input
              {...register('sortCode', {
                required: 'Sort Code is required for UK'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Sort Code"
            />
            {errors.sortCode && <p className="text-red-600 text-xs mt-1">{errors.sortCode.message}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
          <input
            {...register('branchName')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter branch name"
          />
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

      </form>
    </Drawer>
  );
}
