import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, Trash2 } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Select, type SelectOption } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { CampaignFormData } from '../../types/Campaign';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

import { getAllSalesmen } from '../../api/SalesmanApi';
import { getCustomerOptions } from '../../api/CustomerApi';

const CAMPAIGN_TYPES: string[] = [
  'Seasonal',
  'Launch',
  'Holiday',
  'Promotional',
  'Branding',
  'Trade Marketing',
  'Clearance',
  'Digital',
  'Event',
  'Other',
];

const CAMPAIGN_TYPE_OPTIONS: SelectOption[] = CAMPAIGN_TYPES.map((t) => ({
  value: t,
  label: t,
}));

interface CampaignAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => void | Promise<void>;
  initialData?: CampaignFormData;
  isLoading?: boolean;
  merchandisers?: SelectOption[];
  salesmen?: SelectOption[];
  customers?: SelectOption[];
}

export function CampaignAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  merchandisers: propMerchandisers = [],
  salesmen: propSalesmen = [],
  customers: propCustomers = [],
}: CampaignAddProps) {
  const [internalSalesmen, setInternalSalesmen] = useState<SelectOption[]>(
    propSalesmen.length > 0 ? propSalesmen : propMerchandisers
  );
  const [internalCustomers, setInternalCustomers] = useState<SelectOption[]>(propCustomers);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<CampaignFormData>({
    defaultValues: {
      campaignCode: '',
      type: 'Seasonal',
      budget: '',
      startDate: new Date().toISOString(),
      endDate: '',
      date: new Date().toISOString(),
      salesmanId: '',
      customerId: '',
      feedback: '',
      image: null,
      status: 'active',
    },
  });

  useEffect(() => {
    register('startDate', { required: 'Start Date & Time is required' });
    register('endDate');
    register('type', { required: 'Campaign Type is required' });
    register('salesmanId', { required: 'Salesman is required' });
    register('customerId', { required: 'Customer is required' });
  }, [register]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageSize, setImageSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    const list = propSalesmen.length > 0 ? propSalesmen : propMerchandisers;
    if (list.length > 0) {
      setInternalSalesmen(
        list.map((s: any) => {
          const val = String(s.userId ?? s.id ?? s.value ?? '');
          const code = s.salesmanCode ?? s.salesman_code ?? s.code ?? '';
          const name = s.name ?? [s.firstname, s.lastname].filter(Boolean).join(' ') ?? s.label ?? '';
          const label =
            (!name || name === 'undefined undefined') && code
              ? code
              : [code, name].filter((x) => Boolean(x) && x !== 'undefined undefined').join(' - ') || s.label || `Salesman #${val}`;
          return {
            value: val,
            label,
          };
        })
      );
    }
    if (propCustomers.length > 0) setInternalCustomers(propCustomers);
  }, [propMerchandisers, propSalesmen, propCustomers]);

  useEffect(() => {
    if (isOpen && internalSalesmen.length === 0) {
      getAllSalesmen()
        .then((res) => {
          setInternalSalesmen(
            (res || []).map((s: any) => {
              const val = String(s.userId ?? s.id ?? s.value ?? '');
              const code = s.salesmanCode ?? s.salesman_code ?? s.code ?? '';
              const name = s.name ?? [s.firstname, s.lastname].filter(Boolean).join(' ') ?? s.label ?? '';
              const label = [code, name].filter(Boolean).join(' - ') || name || code || (val ? `Salesman #${val}` : '');
              return {
                value: val,
                label,
              };
            })
          );
        })
        .catch(() => {});
    }
    if (isOpen && internalCustomers.length === 0) {
      getCustomerOptions(1, undefined, 100)
        .then((res) => {
          setInternalCustomers(
            (res?.data || []).map((c: any) => ({
              value: String(c.value ?? c.id ?? ''),
              label: [c.code, c.label || c.name].filter(Boolean).join(' - ') || c.label || c.name || String(c.value ?? c.id ?? ''),
            }))
          );
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const rawStart = initialData.startDate || (initialData as any).start_date || initialData.date || new Date().toISOString();
        const rawEnd = initialData.endDate || (initialData as any).end_date || '';
        const rawStatus = (initialData as any).status;
        const normalizedStatus: 'active' | 'inactive' =
          rawStatus === 'inactive' || rawStatus === '0' || rawStatus === 0
            ? 'inactive'
            : 'active';

        reset({
          campaignCode: initialData.campaignCode || (initialData as any).campaign_id || (initialData as any).code || '',
          type: initialData.type || 'Seasonal',
          budget: initialData.budget ?? '',
          startDate: rawStart,
          endDate: rawEnd,
          date: rawStart,
          salesmanId: String(initialData.salesmanId || (initialData as any).salesman_id || ''),
          customerId: String(initialData.customerId || (initialData as any).customer_id || ''),
          feedback: initialData.feedback || '',
          image: initialData.image || null,
          status: normalizedStatus,
        });

        if (initialData.image) {
          if (typeof initialData.image === 'string') {
            setImagePreview(initialData.image);
            setImageName(initialData.image.split('/').pop() || 'current-image.jpg');
            setImageSize('');
          } else if (initialData.image instanceof File) {
            setImagePreview(URL.createObjectURL(initialData.image));
            setImageName(initialData.image.name);
            setImageSize(formatFileSize(initialData.image.size));
          }
        } else {
          setImagePreview(null);
          setImageName('');
          setImageSize('');
        }
      } else {
        reset({
          campaignCode: '',
          type: 'Seasonal',
          budget: '',
          startDate: new Date().toISOString(),
          endDate: '',
          date: new Date().toISOString(),
          salesmanId: '',
          customerId: '',
          feedback: '',
          image: null,
          status: 'active',
        });
        setImagePreview(null);
        setImageName('');
        setImageSize('');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [initialData, isOpen, reset]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageFile = (file: File | null) => {
    if (!file) return;
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setValue('image', file, { shouldValidate: true });
    setImageName(file.name);
    setImageSize(formatFileSize(file.size));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setValue('image', null, { shouldValidate: true });
    setImageName('');
    setImageSize('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  const onFormSubmit = async (data: CampaignFormData) => {
    try {
      const trimmedData: CampaignFormData = {
        ...data,
        campaignCode: data.campaignCode?.trim() || '',
        type: data.type?.trim() || '',
        budget: data.budget ? Number(data.budget) : undefined,
        startDate: data.startDate || data.date || '',
        endDate: data.endDate || '',
        date: data.startDate || data.date || '',
        status: data.status || 'active',
        feedback: data.feedback?.trim() || '',
      };

      await onSubmit(trimmedData);
      onClose();
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      setError('root', { type: 'manual', message: error?.message || 'Failed to save campaign. Please try again.' });
    }
  };

  const startDateValue = watch('startDate') ? new Date(watch('startDate')!) : null;
  const endDateValue = watch('endDate') ? new Date(watch('endDate')!) : null;
  const currentStatus = watch('status') ?? 'active';
  const isActive = currentStatus === 'active';

  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      {/* Status Switch */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-label="Status"
          onClick={() => setValue('status', isActive ? 'inactive' : 'active', { shouldDirty: true })}
          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            isActive ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <CancelButton onClick={onClose} disabled={isSubmitting || isLoading}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="campaign-form" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Campaign' : 'Add Campaign'}
      width="w-[600px]"
      footer={footer}
    >
      <form id="campaign-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.root.message}</p>
          </div>
        )}

        {/* Start Date & Time and End Date & Time Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label="Start Date & Time"
            required
            selected={startDateValue}
            onChange={(d) => {
              setValue('startDate', d ? d.toISOString() : '', { shouldValidate: true });
              setValue('date', d ? d.toISOString() : '');
              clearErrors('startDate');
            }}
            showTimeSelect
            dateFormat="MMM d, yyyy h:mm aa"
            placeholderText="Select start date & time"
            error={errors.startDate?.message}
          />

          <DatePicker
            label="End Date & Time"
            selected={endDateValue}
            onChange={(d) => {
              setValue('endDate', d ? d.toISOString() : '', { shouldValidate: true });
              clearErrors('endDate');
            }}
            minDate={startDateValue ?? undefined}
            showTimeSelect
            dateFormat="MMM d, yyyy h:mm aa"
            placeholderText="Select end date & time"
            error={errors.endDate?.message}
          />
        </div>

        {/* Campaign Code */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campaign Code <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
          </div>
          <div className="flex items-center gap-2 relative">
            <input
              {...register('campaignCode', {
                required: 'Campaign Code is required',
                validate: (value) => (value?.trim() ? true : 'Campaign Code is required'),
              })}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Configure the system to auto-generate the code."
            />
            <OrderCodeSettingsIcon label="Campaign Code" value={watch('campaignCode') || ''} onChange={(v) => setValue('campaignCode', v)} />
            {errors.campaignCode && <p className="text-red-600 text-xs mt-1">{errors.campaignCode.message}</p>}
          </div>
        </div>

        {/* Campaign Type & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Campaign Type"
            required
            options={CAMPAIGN_TYPE_OPTIONS}
            value={watch('type') || ''}
            onChange={(e) => {
              setValue('type', e.target.value, { shouldValidate: true });
              clearErrors('type');
            }}
            placeholder="Select type"
            error={errors.type?.message}
            searchable
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('budget')}
              className="block w-full px-3 py-2 rounded-lg border transition-colors
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. 50000"
            />
            {errors.budget && <p className="text-red-600 text-xs mt-1">{errors.budget.message}</p>}
          </div>
        </div>

        {/* Salesman */}
        <Select
          label="Salesman"
          required
          options={internalSalesmen}
          value={watch('salesmanId') || ''}
          onChange={(e) => {
            setValue('salesmanId', e.target.value, { shouldValidate: true });
            clearErrors('salesmanId');
          }}
          placeholder="Select salesman"
          error={errors.salesmanId?.message}
          searchable
          searchPlaceholder="Search salesman..."
        />

        {/* Customer */}
        <Select
          label="Customer"
          required
          options={internalCustomers}
          value={watch('customerId') || ''}
          onChange={(e) => {
            setValue('customerId', e.target.value, { shouldValidate: true });
            clearErrors('customerId');
          }}
          placeholder="Select customer"
          error={errors.customerId?.message}
          searchable
          searchPlaceholder="Search customer..."
        />

        {/* Feedback */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Feedback <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <textarea
            {...register('feedback', {
              required: 'Feedback is required',
              validate: (value) => (value?.trim() ? true : 'Feedback is required'),
            })}
            placeholder="Enter campaign feedback"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.feedback && <p className="text-red-600 text-xs mt-1">{errors.feedback.message}</p>}
        </div>

        {/* Image Upload */}
        <div className="w-full">
          {!imagePreview ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Campaign Image
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                  ${
                    isDragging
                      ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/20 ring-4 ring-primary-500/10'
                      : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                  }`}
              >
                <div className="w-12 h-12 mb-3 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  <span className="text-primary-600 dark:text-primary-400 underline font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-center">
                  PNG, JPG, JPEG, WEBP or GIF (up to 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign Image
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove image
                </button>
              </div>

              <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 p-3.5 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="relative group/preview shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/5 shadow-xs">
                    <img
                      src={imagePreview}
                      alt="Campaign preview"
                      className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={imageName}>
                      {imageName || 'campaign-image.jpg'}
                    </p>
                    {imageSize && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{imageSize}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Uploaded
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                      >
                        Replace image
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}
