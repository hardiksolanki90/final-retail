import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { RouteSelect } from '../../components/shared/RouteSelect';
import { CountryPhoneInput } from '../../components/ui/CountryPhoneInput';
import { Eye, EyeOff, X } from 'lucide-react';
import type {
  SalesmanFormData,
  Salesman,
} from '../../types/Salesman';
import { useSalesman } from '../../providers/SalesmanProvider';
import { reserveCodeIfAuto } from '../../api/CodeSettingApi';

interface SalesmanAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Salesman | null;
  onEvent?: (data: any) => void;
}

// Fixed by business rule (not org-configurable) — mirrors the numeric codes
// documented on salesman_infos.salesman_type_id/salesman_role_id and
// App\Models\SalesmanInfo::TYPES/ROLES on the backend. No lookup table, no
// API fetch — the set never changes.
const SALESMAN_TYPES = [
  { id: 1, name: 'Salesman' },
  { id: 2, name: 'Merchandiser' },
];

const SALESMAN_ROLES = [
  { id: 1, name: 'PreSales', typeId: 1 },
  { id: 2, name: 'VanSales', typeId: 1 },
  { id: 3, name: 'Hybrid', typeId: 1 },
  { id: 4, name: 'Delivery', typeId: 1 },
  { id: 5, name: 'Merchandiser', typeId: 2 },
];

const SALESMAN_CATEGORIES = [
  { id: 1, name: 'Salesman' },
  { id: 2, name: 'Salesman cum Driver' },
  { id: 3, name: 'Helper' },
  { id: 4, name: 'Driver cum Helper' },
];

const initialFormData: SalesmanFormData = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  mobile: '',
  countryId: '',
  routeId: '',
  salesmanTypeId: '',
  salesmanRoleId: '',
  salesmanCategoryId: '',
  supervisorId: '',
  employeeCode: '',
  salesmanCode: '',
  profileImage: '',
  designation: '',
  joiningDate: '',
  status: true,
  isBlock: false,
  blockStartDate: '',
  blockEndDate: '',
};

export function SalesmanAdd({
  isOpen,
  onClose,
  data,
  onEvent,
}: SalesmanAddProps) {
  const {
    addSalesman,
    updateSalesmanData,
    isAdding,
    isUpdating,
    supervisorOptions,
    isLoadingRelatedData,
  } = useSalesman();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
    control
  } = useForm<SalesmanFormData>({
    defaultValues: initialFormData
  });

  const isEditing = !!data;
  const watchedTypeId = watch('salesmanTypeId');
  const watchedIsBlock = watch('isBlock');

  const selectedType = SALESMAN_TYPES.find(t => t.id.toString() === watchedTypeId);
  const isMerchandising = selectedType?.name === 'Merchandiser';
  const entityLabel = isMerchandising ? 'Merchandiser' : 'Salesman';

  const salesmanTypeOptions: SelectOption[] = SALESMAN_TYPES.map(t => ({ value: t.id, label: t.name }));
  const salesmanRoleOptions: SelectOption[] = SALESMAN_ROLES
    .filter(r => r.typeId === selectedType?.id)
    .map(r => ({ value: r.id, label: r.name }));
  const salesmanCategoryOptions: SelectOption[] = SALESMAN_CATEGORIES.map(c => ({ value: c.id, label: c.name }));

  const [showPassword, setShowPassword] = useState(false);
  const [codeLocked, setCodeLocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setValue('profileImage', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (isOpen && data) {
      reset({
        firstname: data.user?.firstname || '',
        lastname: data.user?.lastname || '',
        email: data.user?.email || '',
        mobile: data.user?.mobile || '',
        countryId: data.user?.countryId?.toString() || '',
        routeId: data.route?.id?.toString() || '',
        salesmanTypeId: data.salesmanType?.id?.toString() || '',
        salesmanRoleId: data.salesmanRole?.id?.toString() || '',
        salesmanCategoryId: data.salesmanCategory?.id?.toString() || '',
        supervisorId: data.supervisor?.id?.toString() || '',
        employeeCode: data.employeeCode || '',
        salesmanCode: data.salesmanCode || '',
        profileImage: data.profileImage || '',
        designation: data.designation || '',
        joiningDate: data.joiningDate || '',
        status: data.status ?? true,
        isBlock: data.isBlocked || false,
        blockStartDate: data.blockStartDate || '',
        blockEndDate: data.blockEndDate || '',
      });
    } else if (isOpen) {
      reset(initialFormData);
    }
  }, [isOpen, data, reset]);

  const onFormSubmit = async (formData: SalesmanFormData) => {
    try {
      const resolvedCode = await reserveCodeIfAuto('salesman', formData.salesmanCode);
      if (resolvedCode !== formData.salesmanCode) {
        formData.salesmanCode = resolvedCode;
        setValue('salesmanCode', resolvedCode ?? '');
        setCodeLocked(true);
      }

      let result;

      if (isEditing && data?.uuid) {
        result = await updateSalesmanData(data.uuid, formData);
      } else {
        result = await addSalesman(formData);
      }

      onEvent?.({
        eventType: 'SalesmanSaved',
        salesman: result,
      });

      reset(initialFormData);
      onClose();
    } catch (error: any) {
      const emailError = error.response?.data?.errors?.email?.[0];
      if (emailError) {
        setError('email', { message: emailError });
      }
      setError('root', {
        message: error.response?.data?.message || 'Failed to save salesman. Please try again.'
      });
    }
  };

  const handleClose = () => {
    reset(initialFormData);
    onClose();
  };

  // Convert related data to SelectOptions

  const supervisorOptionsList: SelectOption[] = supervisorOptions.map(supervisor => ({
    value: supervisor.id.toString(),
    label: supervisor.name
  }));
  // The currently assigned supervisor may no longer be eligible (e.g. their
  // Supervisor role was removed) — keep them selectable so editing doesn't
  // silently blank the field.
  if (data?.supervisor && !supervisorOptionsList.some(opt => opt.value === data.supervisor!.id.toString())) {
    supervisorOptionsList.unshift({ value: data.supervisor.id.toString(), label: data.supervisor.name });
  }

  const footerContent = (
    <div className="flex justify-end gap-3">
      <CancelButton onClick={handleClose} disabled={isSubmitting || isAdding || isUpdating}>
        Cancel
      </CancelButton>
      <SaveButton type="submit" form="salesman-form" disabled={isSubmitting || isAdding || isUpdating}>
        {isSubmitting ? 'Saving...' : isEditing ? `Update ${entityLabel}` : `Save ${entityLabel}`}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
      width="w-[700px]"
      footer={footerContent}
    >
      <form id="salesman-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.root.message}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {entityLabel} Code <span className="text-red-500 font-bold ml-0.5">*</span></label>
          </div>
          <div className="flex items-center gap-2 relative">
            <Input
              {...register('salesmanCode')}
              placeholder="Auto-generated if empty"
              error={errors.salesmanCode?.message}
              disabled={codeLocked}
            />
            <OrderCodeSettingsIcon
              label={`${entityLabel} Code`}
              value={watch('salesmanCode') || ''}
              onChange={(v) => setValue('salesmanCode', v)}
              entityKey="salesman"
              onLockChange={setCodeLocked}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Profile Image:
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border rounded-md p-1.5 bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none"
              accept="image/*"
              onChange={handleImageChange}
            />
            {watch('profileImage') && (
              <div className="relative shrink-0">
                <img
                  src={watch('profileImage')}
                  alt="Profile Preview"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute cursor-pointer -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-700 dark:bg-gray-600 text-white flex items-center justify-center hover:bg-gray-900 dark:hover:bg-gray-500 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name <span className="text-red-500 font-bold ml-0.5">*</span></label>
            <Input
              {...register('firstname', {
                required: 'First name is required',
                validate: value => value.trim() !== '' || 'First name cannot be empty'
              })}
              error={errors.firstname?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name <span className="text-red-500 font-bold ml-0.5">*</span></label>
            <Input
              {...register('lastname', {
                required: 'Last name is required',
                validate: value => value?.trim() !== '' || 'Last name cannot be empty'
              })}
              error={errors.lastname?.message}
            />
          </div>
        </div>

        <div>
          <Controller
            name="salesmanTypeId"
            control={control}
            rules={{ required: `${entityLabel} Type is required` }}
            render={({ field }) => (
              <Select
                label={`${entityLabel} Type*`}
                options={[{ value: '', label: 'Select type' }, ...salesmanTypeOptions]}
                value={field.value}
                onChange={(e) => {
                  const nextTypeId = String(e.target.value);
                  if (nextTypeId !== field.value) {
                    // Role is only valid for the Type it was picked under.
                    setValue('salesmanRoleId', '');
                  }
                  field.onChange(nextTypeId);
                }}
                error={errors.salesmanTypeId?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="salesmanRoleId"
            control={control}
            rules={{ required: `${entityLabel} Role is required` }}
            render={({ field }) => (
              <Select
                label={`${entityLabel} Role*`}
                options={[{ value: '', label: 'Select role' }, ...salesmanRoleOptions]}
                value={field.value}
                onChange={(e) => field.onChange(String(e.target.value))}
                error={errors.salesmanRoleId?.message}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="salesmanCategoryId"
            control={control}
            render={({ field }) => (
              <Select
                label="Salesman Category"
                options={[{ value: '', label: 'Select category' }, ...salesmanCategoryOptions]}
                value={field.value}
                onChange={(e) => field.onChange(String(e.target.value))}
                error={errors.salesmanCategoryId?.message}
              />
            )}
          />
        </div>

        <div>
          <RouteSelect
            value={watch('routeId')?.toString() || ''}
            onChange={(value) => setValue('routeId', value)}
            required
            isLoading={isLoadingRelatedData}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <Input
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }
            })}
            type="email"
            error={errors.email?.message}
          />
        </div>

        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password <span className="text-red-500 font-bold ml-0.5">*</span></label>
            <Input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              error={errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Salesman Supervisor
          </label>
          <Controller
            name="supervisorId"
            control={control}
            render={({ field }) => (
              <Select
                options={[{ value: '', label: 'Select Options' }, ...supervisorOptionsList]}
                value={field.value}
                onChange={(e) => field.onChange(String(e.target.value))}
                isLoading={isLoadingRelatedData}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <CountryPhoneInput
                label="Mobile"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.mobile?.message}
              />
            )}
          />
        </div>

        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Is Block
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!watchedIsBlock}
                onChange={(e) => {
                  setValue('isBlock', e.target.checked);
                  if (!e.target.checked) {
                    setValue('blockStartDate', '');
                    setValue('blockEndDate', '');
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {watchedIsBlock && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Block Start Date"
                {...register('blockStartDate')}
              />
              <Input
                type="date"
                label="Block End Date"
                {...register('blockEndDate')}
              />
            </div>
          )}
        </div>

      </form>
    </Drawer>
  );
}

export default SalesmanAdd;
