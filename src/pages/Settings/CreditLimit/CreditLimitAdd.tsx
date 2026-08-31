import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { CreditLimitFormData, CreditLimit } from '../../../types/CreditLimit';
import type { SalesmanSelectOption } from '../../../types/Salesman';

interface CreditLimitAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreditLimitFormData) => void | Promise<void>;
  editData?: CreditLimit | null;
  salesmanOptions: SalesmanSelectOption[];
}

export function CreditLimitAdd({ isOpen, onClose, onSubmit, editData, salesmanOptions }: CreditLimitAddProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<CreditLimitFormData>();

  useEffect(() => {
    if (editData) {
      reset({ userId: editData.userId, creditLimitType: editData.creditLimitType });
    } else {
      reset({ userId: undefined as unknown as number, creditLimitType: undefined as unknown as 1 | 2 });
    }
  }, [editData, isOpen, reset]);

  const onFormSubmit = async (data: CreditLimitFormData) => {
    try {
      await onSubmit({ userId: Number(data.userId), creditLimitType: Number(data.creditLimitType) as 1 | 2 });
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving credit limit' });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="credit-limit-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : editData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Credit Limit' : 'Add Credit Limit'} width="w-[500px]" footer={footerContent}>
      <form id="credit-limit-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User *</label>
          <select
            {...register('userId', { required: 'User is required' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a user</option>
            {salesmanOptions.map(opt => (
              <option key={opt.uuid} value={opt.userId}>{opt.name}{opt.salesmanCode ? ` (${opt.salesmanCode})` : ''}</option>
            ))}
          </select>
          {errors.userId && <p className="text-red-600 text-xs mt-1">{errors.userId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit Type *</label>
          <select
            {...register('creditLimitType', { required: 'Credit limit type is required' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select type</option>
            <option value={1}>Customer Base</option>
            <option value={2}>LOB</option>
          </select>
          {errors.creditLimitType && <p className="text-red-600 text-xs mt-1">{errors.creditLimitType.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
