import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { CountryMasterSelect } from '../../../components/shared/CountryMasterSelect';
import type { CountryFormData, CountryMaster } from '../../../types/Country';


interface CountryAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: CountryFormData;
    isLoading?: boolean;
  };
  onEvent?: (event: any) => void;
}

const initialFormData: CountryFormData = {
  countryMasterId: '',
  name: '',
  countryCode: '',
  dialCode: '',
  currency: '',
  currencyCode: '',
  currencySymbol: '',
  status: true,
};

export function CountryAdd({ isOpen, onClose, data, onEvent }: CountryAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
    control
  } = useForm<CountryFormData>({
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

  const onFormSubmit = async (formData: CountryFormData) => {
    try {
      await onEvent?.({
        eventType: initialData ? 'CountryUpdated' : 'CountryCreated',
        country: formData,
      });
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving country'
      });
    }
  };

  const handleCountryChange = (master: CountryMaster | null) => {
    if (!master) return;
    setValue('name', master.name || '', { shouldValidate: true });
    setValue('countryCode', master.countryCode || '', { shouldValidate: true });
    setValue('dialCode', master.dialCode || '', { shouldValidate: true });
    setValue('currency', master.currency || '', { shouldValidate: true });
    setValue('currencyCode', master.currencyCode || '', { shouldValidate: true });
    setValue('currencySymbol', master.currencySymbol || '', { shouldValidate: true });
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
        <SaveButton type="submit" form="country-form" disabled={isLoading || isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Country' : 'Add Country'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="country-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <Controller
            name="countryMasterId"
            control={control}
            rules={{ required: 'Country is required' }}
            render={({ field }) => (
              <CountryMasterSelect
                label="Country Master *"
                value={field.value}
                onChange={(master) => {
                  field.onChange(master?.id ?? '');
                  handleCountryChange(master);
                }}
                error={errors.countryMasterId?.message}
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. India"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country Code *</label>
            <input
              {...register('countryCode', { required: 'Country Code is required' })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. IN"
            />
            {errors.countryCode && <p className="text-red-600 text-xs mt-1">{errors.countryCode.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dial Code</label>
            <input
              {...register('dialCode')}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. +91"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              {...register('currency')}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Indian rupee"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
            <input
              {...register('currencyCode')}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. INR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <input
              {...register('currencySymbol')}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. ₹"
            />
          </div>
        </div>

      </form>
    </Drawer>
  );
}
