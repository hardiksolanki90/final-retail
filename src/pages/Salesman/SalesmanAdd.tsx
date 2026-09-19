import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { RouteSelect } from '../../components/shared/RouteSelect';
import { SalesmanTypeSelect } from '../../components/ui/SalesmanTypeSelect';
import { SalesmanRoleSelect } from '../../components/ui/SalesmanRoleSelect';
import { Eye, EyeOff } from 'lucide-react';
import type {
  SalesmanFormData,
  Salesman,
} from '../../types/Salesman';
import { useSalesman } from '../../providers/SalesmanProvider';

interface SalesmanAddProps {
  isOpen: boolean;
  onClose: () => void;
  data?: Salesman | null;
  onEvent?: (data: any) => void;
}

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
  supervisorId: '',
  employeeCode: '',
  salesmanCode: '',
  profileImage: '',
  designation: '',
  joiningDate: '',
  status: true,
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
    salesmanTypes,
    countries,
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
  const watchedStatus = watch('status');
  const watchedTypeId = watch('salesmanTypeId');
  
  const selectedType = salesmanTypes.find(t => t.id.toString() === watchedTypeId);
  const isMerchandising = selectedType?.name?.toLowerCase().includes('merchandis');
  const entityLabel = isMerchandising ? 'Merchandiser' : 'Salesman';

  const [showPassword, setShowPassword] = useState(false);


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
        supervisorId: data.supervisor?.id?.toString() || '',
        employeeCode: data.employeeCode || '',
        salesmanCode: data.salesmanCode || '',
        profileImage: data.profileImage || '',
        designation: data.designation || '',
        joiningDate: data.joiningDate || '',
        status: data.status || true,
      });
    } else if (isOpen) {
      reset(initialFormData);
    }
  }, [isOpen, data, reset]);

  const onFormSubmit = async (formData: SalesmanFormData) => {
    try {
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
  const countryOptions: SelectOption[] = countries.map(country => ({
    value: country.id.toString(),
    label: country.name
  }));

  const supervisorOptionsList: SelectOption[] = supervisorOptions.map(supervisor => ({
    value: supervisor.id.toString(),
    label: supervisor.name
  }));

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
      width="w-[800px]"
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
              {entityLabel} Code*
            </label>
          </div>
          <div className="flex items-center gap-2 relative">
            <Input
              {...register('salesmanCode', { required: `${entityLabel} Code is required` })}
              placeholder="Auto-generated if empty"
              error={errors.salesmanCode?.message}
            />
            <OrderCodeSettingsIcon label={`${entityLabel} Code`} value={watch('salesmanCode') || ''} onChange={(v) => setValue('salesmanCode', v)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Profile Image:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border rounded-md p-1.5 bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none"
              accept="image/*"
              {...register('profileImage')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name*
            </label>
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
              Last Name*
            </label>
            <Input
              {...register('lastname', { 
                required: 'Last name is required',
                validate: value => value.trim() !== '' || 'Last name cannot be empty'
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
              <SalesmanTypeSelect
                label={`${entityLabel} Type*`}
                value={field.value}
                onChange={(val) => field.onChange(String(val))}
                isLoading={isLoadingRelatedData}
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
              <SalesmanRoleSelect
                label={`${entityLabel} Role*`}
                value={field.value}
                onChange={(val) => field.onChange(String(val))}
                isLoading={isLoadingRelatedData}
                error={errors.salesmanRoleId?.message}
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
              Password*
            </label>
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
          <Select
            {...register('supervisorId')}
            options={[{value: '', label: 'Select Options'}, ...supervisorOptionsList]}
            isLoading={isLoadingRelatedData}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mobile
          </label>
          <Input
            {...register('mobile')}
          />
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            Is Block
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!watchedStatus}
              onChange={(e) => setValue('status', !e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>

      </form>
    </Drawer>
  );
}

export default SalesmanAdd;
