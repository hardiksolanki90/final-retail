import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface ReturnFormData {
  returnNo: string;
  orderNo: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  reason: string;
  status: string;
}

interface ReturnAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: ReturnFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: ReturnFormData = {
  returnNo: '',
  orderNo: '',
  customer: '',
  date: '',
  items: 0,
  amount: 0,
  reason: '',
  status: 'Pending',
};

export function ReturnAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: ReturnAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<ReturnFormData>({
    defaultValues: initialFormData
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ReturnFormData) => {
    try {
      onEvent?.({
        eventType: initialData ? 'ReturnUpdated' : 'ReturnCreated',
        return: data,
      });
    } catch (error: any) {
      setError('root', { 
        message: error.response?.data?.message || 'Error saving return' 
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="return-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Return' : 'Add Return'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="return-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Return Number *</label>
                  <OrderCodeSettingsIcon label="Return Number *" value="" onChange={() => {}} />
          <input
            {...register('returnNo', {
              required: 'Return number is required',
              validate: value => value.trim() !== '' || 'Return number cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter return number"
          />
          {errors.returnNo && (
            <p className="text-red-600 text-xs mt-1">{errors.returnNo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
          <input
            {...register('orderNo', {
              required: 'Order number is required',
              validate: value => value.trim() !== '' || 'Order number cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter order number"
          />
          {errors.orderNo && (
            <p className="text-red-600 text-xs mt-1">{errors.orderNo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <input
            {...register('customer', {
              required: 'Customer is required',
              validate: value => value.trim() !== '' || 'Customer cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter customer name"
          />
          {errors.customer && (
            <p className="text-red-600 text-xs mt-1">{errors.customer.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            {...register('date', {
              required: 'Date is required'
            })}
            type="date"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.date && (
            <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
          <input
            {...register('items', {
              valueAsNumber: true,
              min: { value: 0, message: 'Items must be 0 or greater' }
            })}
            type="number"
            min="0"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Number of items"
          />
          {errors.items && (
            <p className="text-red-600 text-xs mt-1">{errors.items.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            {...register('amount', {
              valueAsNumber: true,
              min: { value: 0, message: 'Amount must be 0 or greater' }
            })}
            type="number"
            step="0.01"
            min="0"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Return amount"
          />
          {errors.amount && (
            <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
          <input
            {...register('reason', {
              required: 'Reason is required',
              validate: value => value.trim() !== '' || 'Reason cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter reason for return"
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
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
            <option value="Rejected">Rejected</option>
          </select>
          {errors.status && (
            <p className="text-red-600 text-xs mt-1">{errors.status.message}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}
