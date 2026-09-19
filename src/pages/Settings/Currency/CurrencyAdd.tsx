import { useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { CurrencyFormData, CurrencyMasterOption } from '../../../types/Currency';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { getCurrencyMasterList } from '../../../api/CurrencyApi';
import { useCountryMasters } from '../../../hooks/Country/useCountryMasters';
import { useInfiniteSelect } from '../../../hooks/useInfiniteSelect';

// ISO alpha-2 -> flag emoji (regional indicator symbols) — no image assets needed.
const toFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

interface CurrencyAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    initialData?: CurrencyFormData;
    isLoading?: boolean;
  };
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

export function CurrencyAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: CurrencyAddProps) {
  const initialData = data?.initialData;
  const isLoading = data?.isLoading || false;
  const { countryMasters } = useCountryMasters();
  // Full master records for every option ever loaded (a page only carries
  // {value,label,prefix} — this is what applyMaster() reads the real fields from).
  const mastersById = useRef(new Map<number, CurrencyMasterOption>());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
    control
  } = useForm<CurrencyFormData>({
    defaultValues: initialFormData
  });

  const currencyMasterId = watch('currencyMasterId');

  // A currency can be shared by many countries — pick whichever comes first
  // in country_masters by default, but override the well-known ones so USD
  // doesn't end up showing Ecuador's flag, GBP Guernsey's, etc.
  const CURRENCY_FLAG_OVERRIDES: Record<string, string> = {
    USD: 'US',
    EUR: 'EU',
    GBP: 'GB',
    CHF: 'CH',
    NZD: 'NZ',
    BND: 'BN',
  };

  const countryCodeByCurrency = useMemo(() => {
    const map = new Map<string, string>();
    countryMasters.forEach((m) => {
      if (m.currencyCode && m.countryCode && !map.has(m.currencyCode)) {
        map.set(m.currencyCode, m.countryCode);
      }
    });
    Object.entries(CURRENCY_FLAG_OVERRIDES).forEach(([code, cc]) => map.set(code, cc));
    return map;
  }, [countryMasters]);

  const {
    options: masterOptions,
    isLoading: mastersLoading,
    isLoadingMore: mastersLoadingMore,
    hasMore: mastersHasMore,
    onLoadMore: onMastersLoadMore,
    onSearchChange: onMastersSearchChange,
    addOption: addMasterOption,
  } = useInfiniteSelect<CurrencyMasterOption>({
    selectedValue: currencyMasterId || undefined,
    fetchPage: async (page, search) => {
      const res = await getCurrencyMasterList(page, 20, search || undefined);
      res.data.forEach((m) => mastersById.current.set(m.id, m));
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (m) => {
      const cc = countryCodeByCurrency.get(m.code);
      // ‎ (LTR mark) pins the label's direction — RTL currency symbols
      // (AED, SAR, JOD, etc.) otherwise flip it rightward.
      return {
        value: m.id,
        label: `‎${m.symbol} ${m.code} - ${m.name}`,
        prefix: cc ? toFlagEmoji(cc) : undefined,
      };
    },
  });

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
      // Seed the dropdown with the record being edited — it may not be on
      // the infinite list's first loaded page otherwise.
      if (initialData.currencyMasterId) {
        const cc = countryCodeByCurrency.get(initialData.code);
        addMasterOption({
          value: initialData.currencyMasterId,
          label: `‎${initialData.symbol} ${initialData.code} - ${initialData.name}`,
          prefix: cc ? toFlagEmoji(cc) : undefined,
        });
      }
    } else {
      reset(initialFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (formData: CurrencyFormData) => {
    try {
      await onEvent?.({
        eventType: initialData ? 'CurrencyUpdated' : 'CurrencyCreated',
        currency: formData,
      });
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving currency'
      });
    }
  };

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
      <SaveButton type="submit" form="currency-form" disabled={isLoading || isSubmitting}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Currency' : 'Add Currency'}
      width="w-[500px]"
      footer={footerContent}
    >
      <form id="currency-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {/* Show root errors */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency Master *</label>
          <Controller
            name="currencyMasterId"
            control={control}
            rules={{ required: 'Currency master is required' }}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onChange={(e) => {
                  const master = mastersById.current.get(Number(e.target.value));
                  if (!master) return;
                  field.onChange(master.id);
                  applyMaster(master);
                }}
                options={masterOptions}
                placeholder="Select a currency"
                searchPlaceholder="Search..."
                isLoading={mastersLoading}
                loadingMessage="Loading currencies..."
                hasMore={mastersHasMore}
                isLoadingMore={mastersLoadingMore}
                onLoadMore={onMastersLoadMore}
                onSearchChange={onMastersSearchChange}
              />
            )}
          />
          {errors.currencyMasterId && (
            <p className="text-red-600 text-xs mt-1">{errors.currencyMasterId.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Code *</label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('code', {
                required: 'Code is required',
                validate: value => value.trim() !== '' || 'Code cannot be empty'
              })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter currency code"
            />
            <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} />
            {errors.code && (
              <p className="text-red-600 text-xs mt-1">{errors.code.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            {...register('name', {
              required: 'Name is required',
              validate: value => value.trim() !== '' || 'Name cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter currency name"
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name Plural *</label>
          <input
            {...register('namePlural', {
              required: 'Name plural is required',
              validate: value => value.trim() !== '' || 'Name plural cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter plural name"
          />
          {errors.namePlural && (
            <p className="text-red-600 text-xs mt-1">{errors.namePlural.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Symbol *</label>
          <input
            {...register('symbol', {
              required: 'Symbol is required',
              validate: value => value.trim() !== '' || 'Symbol cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter currency symbol"
          />
          {errors.symbol && (
            <p className="text-red-600 text-xs mt-1">{errors.symbol.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Symbol Native *</label>
          <input
            {...register('symbolNative', {
              required: 'Native symbol is required',
              validate: value => value.trim() !== '' || 'Native symbol cannot be empty'
            })}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter native symbol"
          />
          {errors.symbolNative && (
            <p className="text-red-600 text-xs mt-1">{errors.symbolNative.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Digits *</label>
          <input
            {...register('decimalDigits', {
              required: 'Decimal digits is required',
              valueAsNumber: true,
            })}
            type="number"
            step="1"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 2"
          />
          {errors.decimalDigits && (
            <p className="text-red-600 text-xs mt-1">{errors.decimalDigits.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rounding *</label>
          <input
            {...register('rounding', {
              required: 'Rounding is required',
              valueAsNumber: true,
            })}
            type="number"
            step="1"
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 0"
          />
          {errors.rounding && (
            <p className="text-red-600 text-xs mt-1">{errors.rounding.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <select
            {...register('format')}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1,234,567.89">1,234,567.89</option>
            <option value="1.234.567.89">1.234.567.89</option>
            <option value="1 234 567.89">1 234 567.89</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="defaultCurrency" {...register('defaultCurrency')} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <label htmlFor="defaultCurrency" className="text-sm font-medium text-gray-700">Default Currency</label>
        </div>

      </form>
    </Drawer>
  );
}
