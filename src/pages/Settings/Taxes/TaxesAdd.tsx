import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { TaxFormData } from '../../../types/Taxes';
import { getTaxTypes, getTaxRegions, type TaxRegion } from '../../../api/TaxApi';
import { FormSkeleton, type FormSkeletonField } from '../../../components/ui/skeleton';

// Mirrors the form below: Name, Rate, Type, State/Province, Default, Description.
const TAXES_FORM_SKELETON: FormSkeletonField[] = ['input', 'input', 'select', 'select', 'check', 'textarea'];

interface TaxesAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaxFormData) => void | Promise<void>;
  initialData?: TaxFormData;
  isLoading?: boolean;
}

const initialFormData: TaxFormData = { name: '', rate: '', type: '', region: '', isDefault: false, description: '' };

export function TaxesAdd({ isOpen, onClose, onSubmit, initialData, isLoading = false }: TaxesAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<TaxFormData>({ defaultValues: initialFormData });

  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<TaxRegion[]>([]);

  useEffect(() => {
    if (isOpen) {
      getTaxTypes()
        .then(setTypeOptions)
        .catch(() => setTypeOptions([]));
      getTaxRegions()
        .then(setRegionOptions)
        .catch(() => setRegionOptions([]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      reset({ ...initialData, region: initialData.region ?? '' });
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: TaxFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving tax' });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting || isLoading}>
        Cancel
      </CancelButton>
      <SaveButton type="submit" form="tax-form" disabled={isSubmitting || isLoading}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isLoading={isLoading}
      skeleton={<FormSkeleton fields={TAXES_FORM_SKELETON} />}
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Tax' : 'Add Tax'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="tax-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('name', { required: 'Name is required', validate: (value) => value.trim() !== '' || 'Name cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter tax name"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('rate', {
              required: 'Rate is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Rate must be between 0 and 100' },
              max: { value: 100, message: 'Rate must be between 0 and 100' },
            })}
            type="number"
            step="0.01"
            min="0"
            max="100"
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e') e.preventDefault();
            }}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter tax rate"
          />
          {errors.rate && <p className="text-red-600 text-xs mt-1">{errors.rate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          {typeOptions.length > 0 ? (
            <select {...register('type')} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select type</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          ) : (
            <input
              {...register('type')}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter tax type"
            />
          )}
          {errors.type && <p className="text-red-600 text-xs mt-1">{errors.type.message}</p>}
        </div>

        {regionOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
            <select {...register('region')} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All regions</option>
              {regionOptions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">A rate for a state or province is used for customers there; "All regions" is the fallback.</p>
          </div>
        )}

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" {...register('isDefault')} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-gray-700">
            Use as the default rate for this tax type and region
            <span className="block text-xs text-gray-500">Documents use the default rate of the organisation's tax type. The first rate you add is the default.</span>
          </span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter description"
          />
          {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
