import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { CurrencyMasterSelect } from '../../../components/shared/CurrencyMasterSelect';
import type { CurrencyFormData, CurrencyMasterOption } from '../../../types/Currency';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';

interface CurrencyAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: { initialData?: CurrencyFormData; isLoading?: boolean };
  onEvent?: (event: any) => void;
}

const initialFormData: CurrencyFormData = {
  currencyMasterId: '',
  code: '',
  name: '',
  symbol: '',
  namePlural: '',
  symbolNative: '',
  decimalDigits: '',
  rounding: '',
  defaultCurrency: false,
  format: '1,234,567.89',
};

export function CurrencyAdd({ isOpen, onClose, data, onEvent }: CurrencyAddProps) {
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
    control,
  } = useForm<CurrencyFormData>({ defaultValues: initialFormData });

  const code = watch('code');

  const applyMaster = (master: CurrencyMasterOption) => {
    setValue('currencyMasterId', master.id);
    setValue('code', master.code);
    setValue('name', master.name);
    setValue('namePlural', master.namePlural);
    setValue('symbol', master.symbol);
    setValue('symbolNative', master.symbolNative);
    setValue('decimalDigits', master.decimalDigits);
    setValue('rounding', master.rounding);
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: CurrencyFormData) => {
    try {
      await onEvent?.({ eventType: initialData ? 'CurrencyUpdated' : 'CurrencyCreated', currency: formData });
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving currency' });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>
        Cancel
      </CancelButton>
      <SaveButton type="submit" form="currency-form" disabled={isLoading || isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Currency' : 'Add Currency'} width="w-[500px]" footer={footerContent}>
      <form id="currency-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency Master <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <Controller
            name="currencyMasterId"
            control={control}
            rules={{ required: 'Currency master is required' }}
            render={({ field }) => (
              <CurrencyMasterSelect
                value={code}
                onChange={(master) => {
                  if (!master) return;
                  field.onChange(master.id);
                  applyMaster(master);
                }}
              />
            )}
          />
          {errors.currencyMasterId && <p className="text-red-600 text-xs mt-1">{errors.currencyMasterId.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Code <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('code', { required: 'Code is required', validate: (value) => value.trim() !== '' || 'Code cannot be empty' })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Configure the system to auto-generate the code."
            />
            <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} />
            {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('name', { required: 'Name is required', validate: (value) => value.trim() !== '' || 'Name cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter currency name"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name Plural <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('namePlural', { required: 'Name plural is required', validate: (value) => value.trim() !== '' || 'Name plural cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter plural name"
          />
          {errors.namePlural && <p className="text-red-600 text-xs mt-1">{errors.namePlural.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symbol <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('symbol', { required: 'Symbol is required', validate: (value) => value.trim() !== '' || 'Symbol cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter currency symbol"
          />
          {errors.symbol && <p className="text-red-600 text-xs mt-1">{errors.symbol.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symbol Native <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('symbolNative', { required: 'Native symbol is required', validate: (value) => value.trim() !== '' || 'Native symbol cannot be empty' })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter native symbol"
          />
          {errors.symbolNative && <p className="text-red-600 text-xs mt-1">{errors.symbolNative.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decimal Digits <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('decimalDigits', { required: 'Decimal digits is required', valueAsNumber: true })}
            type="number"
            step="1"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 2"
          />
          {errors.decimalDigits && <p className="text-red-600 text-xs mt-1">{errors.decimalDigits.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rounding <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            {...register('rounding', { required: 'Rounding is required', valueAsNumber: true })}
            type="number"
            step="1"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 0"
          />
          {errors.rounding && <p className="text-red-600 text-xs mt-1">{errors.rounding.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <select {...register('format')} className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="1,234,567.89">1,234,567.89</option>
            <option value="1.234.567.89">1.234.567.89</option>
            <option value="1 234 567.89">1 234 567.89</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="defaultCurrency" {...register('defaultCurrency')} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <label htmlFor="defaultCurrency" className="text-sm font-medium text-gray-700">
            Default Currency
          </label>
        </div>
      </form>
    </Drawer>
  );
}
