import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { DriverReplacementFormData } from '../../../types/DriverReplacement';

interface DriverReplacementAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DriverReplacementFormData) => void | Promise<void>;
  initialData?: DriverReplacementFormData;
  salesmanOptions: { value: number; label: string }[];
  vanOptions: { value: number; label: string }[];
  reasonOptions: { value: number; label: string }[];
}

const initialFormData: DriverReplacementFormData = {
  oldSalesmanId: '',
  newSalesmanId: '',
  oldVanId: '',
  newVanId: '',
  reasonId: '',
  date: '',
};

export function DriverReplacementAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  salesmanOptions,
  vanOptions,
  reasonOptions,
}: DriverReplacementAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<DriverReplacementFormData>({ defaultValues: initialFormData });

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset(initialFormData);
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: DriverReplacementFormData) => {
    const payload: DriverReplacementFormData = {
      ...data,
      oldSalesmanId: data.oldSalesmanId ? Number(data.oldSalesmanId) : '',
      newSalesmanId: data.newSalesmanId ? Number(data.newSalesmanId) : '',
      oldVanId: data.oldVanId ? Number(data.oldVanId) : '',
      newVanId: data.newVanId ? Number(data.newVanId) : '',
      reasonId: data.reasonId ? Number(data.reasonId) : '',
    };
    try {
      await onSubmit(payload);
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving driver replacement' });
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
    <Drawer isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Driver Replacement' : 'Add Driver Replacement'} width="w-[500px]" footer={footerContent}>
      <form id="driver-replacement-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Old Salesman *</label>
          <select {...register('oldSalesmanId', { required: 'Old Salesman is required' })} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select salesman</option>
            {salesmanOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {errors.oldSalesmanId && <p className="text-red-600 text-xs mt-1">{errors.oldSalesmanId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Salesman *</label>
          <select {...register('newSalesmanId', { required: 'New Salesman is required' })} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select salesman</option>
            {salesmanOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {errors.newSalesmanId && <p className="text-red-600 text-xs mt-1">{errors.newSalesmanId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Old Van</label>
          <select {...register('oldVanId')} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select van (optional)</option>
            {vanOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Van</label>
          <select {...register('newVanId')} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select van (optional)</option>
            {vanOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <select {...register('reasonId')} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select reason (optional)</option>
            {reasonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input type="date" {...register('date', { required: 'Date is required' })} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
