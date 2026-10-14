import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AlertCircle, Upload, Trash2 } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { reserveCodeIfAuto } from '../../api/CodeSettingApi';
import { useCodeSetting } from '../../hooks/CodeSetting/useCodeSetting';
import { getAllSalesmen } from '../../api/SalesmanApi';
import { getCustomerOptions } from '../../api/CustomerApi';
import { DatePicker } from '../../components/ui/DatePicker';
import { format, isValid } from 'date-fns';
import axiosInstance from '../../lib/axios';
import type { PlanogramFormData } from '../../types/Planogram';

interface PlanogramAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlanogramFormData) => void | Promise<void>;
  initialData?: PlanogramFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
  salesmen?: SelectOption[];
  categories?: SelectOption[];
}

const defaultValues: PlanogramFormData = {
  planogramCode: '',
  name: '',
  customerId: '',
  salesmanId: '',
  category: '',
  description: '',
  image: null,
  shelfCount: 0,
  productsPerShelf: 0,
  date: '',
  status: 'active',
};




const fallbackCategories: SelectOption[] = [
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'household', label: 'Household' },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const parseDateValue = (val?: string | null): Date | null => {
  if (!val) return null;
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(val);
  return isValid(parsed) ? parsed : null;
};

function FormFieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
      {required && <span className="text-red-500 font-bold">*</span>}
    </label>
  );
}

function serverFieldErrors(error: unknown): Record<string, string | string[]> | null {
  if (!error || typeof error !== 'object' || !('response' in error)) return null;
  const response = (error as { response?: { data?: { errors?: Record<string, string | string[]> } } }).response;
  return response?.data?.errors ?? null;
}

export function PlanogramAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  merchandisers = [],
  salesmen = [],
  categories = [],
}: PlanogramAddProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    setError,
  } = useForm<PlanogramFormData>({ defaultValues });

  const isEditing = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [codeLocked, setCodeLocked] = useState(false);
  const [isAutoPreview, setIsAutoPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageSize, setImageSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [internalCustomers, setInternalCustomers] = useState<SelectOption[]>(customers);
  const [internalMerchandisers, setInternalMerchandisers] = useState<SelectOption[]>(
    merchandisers.length > 0 ? merchandisers : salesmen
  );
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const { codeSetting } = useCodeSetting('planogram', isOpen);

  const busy = isSubmitting || isLoading;
  const categoryOptions = categories.length > 0 ? categories : fallbackCategories;
  const customerList = internalCustomers.length > 0 ? internalCustomers : customers;
  const merchandiserList = internalMerchandisers.length > 0 ? internalMerchandisers : (salesmen.length > 0 ? salesmen : merchandisers);

  useEffect(() => {
    if (customers.length > 0) {
      setInternalCustomers(customers);
    }
  }, [customers]);

  useEffect(() => {
    const s = merchandisers.length > 0 ? merchandisers : salesmen;
    if (s.length > 0) {
      setInternalMerchandisers(s);
    }
  }, [merchandisers, salesmen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingDropdowns(true);

    const loadDropdownData = async () => {
      // 1. Customers
      if (internalCustomers.length === 0) {
        try {
          const res = await getCustomerOptions(1, undefined, 100);
          const list = res?.data || [];
          if (isMounted && list.length > 0) {
            setInternalCustomers(
              list.map((c: any) => ({
                value: String(c.value ?? c.id ?? ''),
                label: [c.code, c.label || c.name].filter(Boolean).join(' - ') || c.label || c.name || String(c.value ?? c.id ?? ''),
              }))
            );
          } else {
            const fallback = await axiosInstance.get('/customer/all?per_page=100');
            const raw = fallback.data?.customers || fallback.data?.data || [];
            if (isMounted && Array.isArray(raw) && raw.length > 0) {
              setInternalCustomers(
                raw.map((c: any) => ({
                  value: String(c.value ?? c.uuid ?? c.id ?? ''),
                  label: [c.code || c.customer_code, c.label || c.shop_name || c.name].filter(Boolean).join(' - ') || c.label || c.name || String(c.value ?? c.uuid ?? c.id ?? ''),
                }))
              );
            }
          }
        } catch {
          try {
            const fallback = await axiosInstance.get('/customer/all?per_page=100');
            const raw = fallback.data?.customers || fallback.data?.data || [];
            if (isMounted && Array.isArray(raw)) {
              setInternalCustomers(
                raw.map((c: any) => ({
                  value: String(c.value ?? c.uuid ?? c.id ?? ''),
                  label: [c.code || c.customer_code, c.label || c.shop_name || c.name].filter(Boolean).join(' - ') || c.label || c.name || String(c.value ?? c.uuid ?? c.id ?? ''),
                }))
              );
            }
          } catch (err) {
            console.error('Failed to load customers:', err);
          }
        }
      }

      // 2. Salesmen / Merchandisers
      if (internalMerchandisers.length === 0) {
        try {
          const res = await getAllSalesmen();
          if (isMounted && Array.isArray(res) && res.length > 0) {
            setInternalMerchandisers(
              res.map((s: any) => {
                const val = String(s.userId ?? s.id ?? s.value ?? '');
                const code = s.salesmanCode ?? s.salesman_code ?? s.code ?? '';
                const name = s.name ?? [s.firstname, s.lastname].filter(Boolean).join(' ') ?? s.label ?? '';
                const label = [code, name].filter(Boolean).join(' - ') || name || code || (val ? `Salesman #${val}` : '');
                return { value: val, label };
              })
            );
          } else {
            const fallback = await axiosInstance.get('/salesman/all?per_page=100');
            const raw = fallback.data?.salesman || fallback.data?.data || [];
            if (isMounted && Array.isArray(raw) && raw.length > 0) {
              setInternalMerchandisers(
                raw.map((s: any) => {
                  const val = String(s.userId ?? s.id ?? s.value ?? '');
                  const code = s.salesmanCode ?? s.salesman_code ?? s.code ?? '';
                  const name = s.name ?? [s.firstname, s.lastname].filter(Boolean).join(' ') ?? s.label ?? '';
                  const label = [code, name].filter(Boolean).join(' - ') || name || code || (val ? `Salesman #${val}` : '');
                  return { value: val, label };
                })
              );
            }
          }
        } catch {
          try {
            const fallback = await axiosInstance.get('/salesman/all?per_page=100');
            const raw = fallback.data?.salesman || fallback.data?.data || [];
            if (isMounted && Array.isArray(raw)) {
              setInternalMerchandisers(
                raw.map((s: any) => {
                  const val = String(s.userId ?? s.id ?? s.value ?? '');
                  const code = s.salesmanCode ?? s.salesman_code ?? s.code ?? '';
                  const name = s.name ?? [s.firstname, s.lastname].filter(Boolean).join(' ') ?? s.label ?? '';
                  const label = [code, name].filter(Boolean).join(' - ') || name || code || (val ? `Salesman #${val}` : '');
                  return { value: val, label };
                })
              );
            }
          } catch (err) {
            console.error('Failed to load salesmen:', err);
          }
        }
      }

      if (isMounted) setIsLoadingDropdowns(false);
    };

    loadDropdownData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      const rawStatus = (initialData as any).status;
      const normalizedStatus: 'active' | 'inactive' =
        rawStatus === 'inactive' || rawStatus === '0' || rawStatus === 0
          ? 'inactive'
          : 'active';
      reset({
        ...initialData,
        status: normalizedStatus,
      });

      if (initialData.customerId) {
        setInternalCustomers((prev) => {
          if (prev.some((c) => String(c.value) === String(initialData.customerId))) return prev;
          const label = (initialData as any).customerName || `Customer #${initialData.customerId}`;
          return [{ value: String(initialData.customerId), label }, ...prev];
        });
      }

      if (initialData.salesmanId) {
        setInternalMerchandisers((prev) => {
          if (prev.some((m) => String(m.value) === String(initialData.salesmanId))) return prev;
          const label = (initialData as any).salesmanName || `Salesman #${initialData.salesmanId}`;
          return [{ value: String(initialData.salesmanId), label }, ...prev];
        });
      }

      if (initialData.image) {
        if (typeof initialData.image === 'string') {
          setImagePreview(initialData.image);
          setImageName(initialData.image.split('/').pop() || 'planogram-image.jpg');
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
      reset(defaultValues);
      setImagePreview(null);
      setImageName('');
      setImageSize('');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [initialData, isOpen, reset]);

  useEffect(() => {
    if (!isOpen || isEditing) return;

    if (codeSetting?.isCodeAuto && (codeSetting.nextCommingNumber || codeSetting.startCode)) {
      const preview = `${codeSetting.prefixCode ?? ''}${codeSetting.nextCommingNumber ?? codeSetting.startCode ?? ''}`;
      setValue('planogramCode', preview);
      setCodeLocked(true);
      setIsAutoPreview(true);
    } else {
      setIsAutoPreview(false);
    }
  }, [isOpen, isEditing, codeSetting, setValue]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleClose = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageName('');
    setImageSize('');
    reset(defaultValues);
    setCodeLocked(false);
    setIsAutoPreview(false);
    onClose();
  };

  const handleImageFile = (file: File | null) => {
    if (!file) return;
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setValue('image', file, { shouldValidate: true, shouldDirty: true });
    setImageName(file.name);
    setImageSize(formatFileSize(file.size));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setValue('image', null, { shouldValidate: true, shouldDirty: true });
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

  const onFormSubmit = async (formData: PlanogramFormData) => {
    try {
      const resolvedCode = await reserveCodeIfAuto('planogram', isAutoPreview ? undefined : formData.planogramCode);
      if (resolvedCode && resolvedCode !== formData.planogramCode) {
        formData.planogramCode = resolvedCode;
        setValue('planogramCode', resolvedCode);
        setCodeLocked(true);
      }

      await onSubmit({
        ...formData,
        status: isActive ? 'active' : 'inactive',
      });
      reset(defaultValues);
      onClose();
    } catch (error: unknown) {
      console.error('Error saving planogram:', error);
      const fieldErrors = serverFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof PlanogramFormData, {
            type: 'server',
            message: Array.isArray(message) ? message[0] : message,
          });
        });
        return;
      }
      const message = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError('root', { message: message || 'Failed to save planogram. Please try again.' });
    }
  };

  const currentStatus = watch('status') ?? 'active';
  const isActive = currentStatus === 'active' || currentStatus === '1' || (currentStatus as unknown) === 1;

  const footerContent = (
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
          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isActive ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <CancelButton onClick={handleClose} disabled={busy}>
          Cancel
        </CancelButton>
        <SaveButton type="submit" form="planogram-form" disabled={busy} className="bg-primary-700 hover:bg-primary-800 text-white min-w-[80px]">
          {busy ? 'Saving...' : 'Save'}
        </SaveButton>
      </div>
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Edit Planogram' : 'Add Planogram'} width="w-[700px]" footer={footerContent}>
      <form id="planogram-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
        {errors.root && (
          <div className="flex items-start gap-2.5 border-l-2 border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 px-4 py-2.5 text-sm rounded">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <div>
          <FormFieldLabel label="Planogram Code" required />
          <div className="flex items-center gap-2">
            <Input
              {...register('planogramCode', {
                required: 'Planogram Code is required',
                validate: (value) => (value && value.trim() ? true : 'Planogram Code is required'),
              })}
              placeholder="Configure the system to auto-generate the code."
              disabled={codeLocked}
              error={errors.planogramCode?.message}
            />
            <OrderCodeSettingsIcon
              label="Planogram Code"
              value={watch('planogramCode') || ''}
              onChange={(v) => {
                setValue('planogramCode', v);
                setIsAutoPreview(false);
              }}
              entityKey="planogram"
              onLockChange={setCodeLocked}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormFieldLabel label="Name" required />
            <Input
              {...register('name', {
                required: 'Name is required',
                validate: (value) => (value && value.trim() ? true : 'Name is required'),
              })}
              placeholder="Enter name"
              error={errors.name?.message}
            />
          </div>
          <div>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <DatePicker
                  label="Date"
                  required
                  selected={parseDateValue(field.value)}
                  onChange={(d) => {
                    field.onChange(d && isValid(d) ? format(d, 'yyyy-MM-dd') : '');
                  }}
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select date"
                  error={errors.date?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <FormFieldLabel label="Customer" required />
            <Controller
              name="customerId"
              control={control}
              rules={{ required: 'Customer is required' }}
              render={({ field }) => (
                <Select
                  value={String(field.value ?? '')}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={customerList}
                  placeholder={isLoadingDropdowns && customerList.length === 0 ? 'Loading customers...' : 'Select customer'}
                  searchable
                />
              )}
            />
            {errors.customerId && <p className="mt-1 text-sm text-red-500">{errors.customerId.message}</p>}
          </div>
          <div>
            <FormFieldLabel label="Merchandiser" required />
            <Controller
              name="salesmanId"
              control={control}
              rules={{ required: 'Merchandiser is required' }}
              render={({ field }) => (
                <Select
                  value={String(field.value ?? '')}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={merchandiserList}
                  placeholder={isLoadingDropdowns && merchandiserList.length === 0 ? 'Loading merchandisers...' : 'Select merchandiser'}
                  searchable
                />
              )}
            />
            {errors.salesmanId && <p className="mt-1 text-sm text-red-500">{errors.salesmanId.message}</p>}
          </div>
        </div>

        <div>
          <FormFieldLabel label="Category" required />
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Select
                value={String(field.value ?? '')}
                onChange={(e) => field.onChange(e.target.value)}
                options={categoryOptions}
                placeholder="Select category"
                searchable={categoryOptions.length > 8}
              />
            )}
          />
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
        </div>

        <div className="pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormFieldLabel label="Shelf Count" />
              <Input
                type="number"
                {...register('shelfCount', { valueAsNumber: true, min: { value: 0, message: 'Shelf count must be 0 or greater' } })}
                placeholder="Enter shelf count"
                min="0"
                error={errors.shelfCount?.message}
              />
            </div>
            <div>
              <FormFieldLabel label="Products Per Shelf" />
              <Input
                type="number"
                {...register('productsPerShelf', { valueAsNumber: true, min: { value: 0, message: 'Products per shelf must be 0 or greater' } })}
                placeholder="Enter products per shelf"
                min="0"
                error={errors.productsPerShelf?.message}
              />
            </div>
          </div>
        </div>

        <div>
          <FormFieldLabel label="Description" />
          <textarea
            {...register('description')}
            placeholder="Enter description"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {/* Image Upload */}
        <div className="w-full">
          {!imagePreview ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Planogram Image
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                  ${isDragging
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
                  Planogram Image
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
                      alt="Planogram preview"
                      className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={imageName}>
                      {imageName || 'planogram-image.jpg'}
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
          {errors.image?.message && <p className="mt-1 text-sm text-red-500">{String(errors.image.message)}</p>}
        </div>
      </form>
    </Drawer>
  );
}
