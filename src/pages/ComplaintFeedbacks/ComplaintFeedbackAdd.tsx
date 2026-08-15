import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { ComplaintFeedbackFormData } from '../../types/ComplaintFeedback';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

interface ComplaintFeedbackAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComplaintFeedbackFormData) => void | Promise<void>;
  initialData?: ComplaintFeedbackFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  salesmen?: SelectOption[];
  orders?: SelectOption[];
}

const defaultValues: ComplaintFeedbackFormData = {
  type: 'complaint',
  customerId: '',
  salesmanId: '',
  orderId: '',
  subject: '',
  description: '',
  category: '',
  priority: 'low',
  status: 'open',
  resolution: '',
  attachments: [],
};

export function ComplaintFeedbackAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  salesmen = [],
  orders = [],
}: ComplaintFeedbackAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFeedbackFormData>({ defaultValues });

  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ComplaintFeedbackFormData) => {
    await onSubmit(data);
    onClose();
  };

  const typeOptions = [
    { value: 'complaint', label: 'Complaint' },
    { value: 'feedback', label: 'Feedback' },
  ];
  const categoryOptions = [
    { value: 'Product', label: 'Product' },
    { value: 'Service', label: 'Service' },
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Billing', label: 'Billing' },
    { value: 'Quality', label: 'Quality' },
    { value: 'Other', label: 'Other' },
  ];
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const selectClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Complaint/Feedback' : 'Add Complaint/Feedback'}
      width="w-[700px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
                  <OrderCodeSettingsIcon label="Related Order (Optional)" value="" onChange={() => {}} />
          <select {...register('type', { required: 'Type is required' })} className={selectClass}>
            {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
            <select {...register('customerId', { required: 'Customer is required' })} className={selectClass}>
              <option value="">Select customer</option>
              {customers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>}
          </div>
          {/* Salesman */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Salesman <span className="text-red-500">*</span>
            </label>
            <select {...register('salesmanId', { required: 'Salesman is required' })} className={selectClass}>
              <option value="">Select salesman</option>
              {salesmen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.salesmanId && <p className="text-sm text-red-500 mt-1">{errors.salesmanId.message}</p>}
          </div>
        </div>

        {/* Related Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Related Order (Optional)
          </label>
          <select {...register('orderId')} className={selectClass}>
            <option value="">Select order</option>
            {orders.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <Input
          label="Subject"
          {...register('subject', { required: 'Subject is required' })}
          error={errors.subject?.message}
          placeholder="Enter subject"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            placeholder="Enter detailed description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select {...register('category', { required: 'Category is required' })} className={selectClass}>
              <option value="">Select category</option>
              {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select {...register('priority')} className={selectClass}>
              {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select {...register('status')} className={selectClass}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resolution</label>
          <textarea
            {...register('resolution')}
            placeholder="Enter resolution details"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}
