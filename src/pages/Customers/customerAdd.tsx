import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { CreatableSelect } from '../../components/ui/CreatableSelect';
import { RegionSelect } from '../../components/ui/RegionSelect';
import { StateSelect } from '../../components/ui/StateSelect';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { CountryPhoneInput } from '../../components/ui/CountryPhoneInput';
import { getAllSalesmen } from '../../api/SalesmanApi';
import { getAllCountries } from '../../api/CountryApi';
import { getCustomerOptions, getCustomerTypeOptions } from '../../api/CustomerApi';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import type { CustomerFormData, Customer } from '../../types/Customer';
import { useCustomer } from '../../providers/CustomerProvider';
import { useAuth } from '../../context/AuthContext';
import { reserveCodeIfAuto } from '../../api/CodeSettingApi';
import { useCodeSetting } from '../../hooks/CodeSetting/useCodeSetting';
import { AlertCircle, X } from 'lucide-react';
import { FormSkeleton, type FormSkeletonField } from '../../components/ui/skeleton';

// Mirrors the form below, row for row: code; name pair; email; address, state/city, zip/phone,
// channel/type, parent channel/sales organisation, country/region pairs; salesman; partner function; image.
const CUSTOMER_FORM_SKELETON: FormSkeletonField[] = [
    'code',
    ['input', 'input'],
    'input',
    ['input', 'input'],
    ['input', 'input'],
    ['input', 'input'],
    ['input', 'input'],
    ['input', 'input'],
    ['input', 'input'],
    'input',
    { group: ['input', 'input', 'input', 'input'] },
    'file',
];

interface CustomerAddProps {
    isOpen: boolean;
    onClose: () => void;
    /** The customer being edited, and whether its details are still loading (drawer open, loader shown). */
    data?: { initialData?: Customer | null; isLoading?: boolean };
    onEvent?: (data: any) => void;
}

const initialFormData: CustomerFormData = {
    code: '',
    shopName: '',
    firstName: '',
    lastName: '',
    email: '',
    enableLogin: false,
    password: '',
    passwordConfirmation: '',
    phoneNumber: '',
    customerOfficeAddress: '',
    customerOfficeCity: '',
    customerOfficeState: '',
    customerOfficeZipcode: '',
    customerHomeAddress: '',
    image: '',
    status: true,
    salesmanId: '',
    salesOrganisationId: '',
    countryId: '',
    regionId: '',
    shipToPartyId: '',
    soldToPartyId: '',
    payerId: '',
    billToPartyId: '',
    customerTypeId: '',
    customerCategoryId: '',
    channelId: '',
};

function FormFieldLabel({ label, required = false }: { label: string; required?: boolean }) {
    return (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {required && <span className="text-red-500 font-bold">*</span>}
        </label>
    );
}

export function CustomerAdd({ isOpen, onClose, data: drawerData, onEvent }: CustomerAddProps) {
    const data = drawerData?.initialData ?? null;
    const isLoading = drawerData?.isLoading ?? false;
    const {
        addCustomer,
        updateCustomerData,
        isAdding,
        isUpdating,
        customerCategories,
        channels,
        createCustomerCategoryOption,
        createChannelOption,
        createSalesOrganisationOption,
        salesOrganisations,
    } = useCustomer();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
        watch,
        setValue,
        control,
    } = useForm<CustomerFormData>({ defaultValues: initialFormData });

    // Loading an edit counts as editing, so the Add-only auto-code preview doesn't start.
    const isEditing = !!data || isLoading;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [codeLocked, setCodeLocked] = useState(false);
    // True while the Customer Code input shows an auto-numbering preview
    // rather than a real reservation — onFormSubmit must still call
    // reserveCodeIfAuto fresh at submit time so concurrent users don't all
    // reuse the same previewed number.
    const [isAutoPreview, setIsAutoPreview] = useState(false);
    // Deferred to isOpen so GET /code-setting/customer fires when the
    // Create/Edit drawer actually opens, not on every Customers-page mount
    // (this component stays mounted in the background between opens).
    const { codeSetting } = useCodeSetting('customer', isOpen);

    useEffect(() => {
        if (isOpen && data) {
            reset({
                code: data.code || '',
                shopName: data.shopName || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                enableLogin: Boolean(data.hasLoginAccess),
                password: '',
                passwordConfirmation: '',
                phoneNumber: data.phoneNumber || '',
                customerOfficeAddress: data.customerOfficeAddress || (data as any).address || '',
                customerHomeAddress: data.customerHomeAddress || '',
                customerOfficeState: data.customerOfficeState || (data as any).state || '',
                customerOfficeCity: data.customerOfficeCity || (data as any).city || '',
                customerOfficeZipcode: data.customerOfficeZipcode || (data as any).zipcode || '',
                image: data.image || '',
                status: data.status ?? true,
                salesmanId: data.salesman?.id?.toString() || data.salesmanId?.toString() || data.salesmanId?.toString() || '',
                salesOrganisationId: data.salesOrganisationId?.toString() || data.salesOrganisation?.id?.toString() || '',
                countryId: data.countryId?.toString() || (data as any).country?.id?.toString() || '',
                regionId: data.regionId?.toString() || (data as any).region?.id?.toString() || '',
                shipToPartyId: data.partners?.shipTo?.value ?? '',
                soldToPartyId: data.partners?.soldTo?.value ?? '',
                payerId: data.partners?.payer?.value ?? '',
                billToPartyId: data.partners?.billTo?.value ?? '',
                customerTypeId: data.customerType?.id?.toString() || data.customerTypeId?.toString() || '',
                customerCategoryId: data.customerCategory?.id?.toString() || data.customerCategoryId?.toString() || '',
                channelId: data.channel?.id?.toString() || data.channelId?.toString() || '',
            });
        } else if (isOpen) {
            reset(initialFormData);
        }
    }, [isOpen, data, reset]);

    // Show the next auto-generated code as soon as the setting loads, so the
    // field isn't blank — this is a preview only, the real reservation still
    // happens on submit (see isAutoPreview below).
    useEffect(() => {
        if (!isOpen || isEditing) return;

        if (codeSetting?.isCodeAuto && (codeSetting.nextCommingNumber || codeSetting.startCode)) {
            const preview = `${codeSetting.prefixCode ?? ''}${codeSetting.nextCommingNumber ?? codeSetting.startCode ?? ''}`;
            setValue('code', preview);
            setCodeLocked(true);
            setIsAutoPreview(true);
        } else {
            setIsAutoPreview(false);
        }
    }, [isOpen, isEditing, codeSetting, setValue]);

    const onFormSubmit = async (formData: CustomerFormData) => {
        try {
            const resolvedCode = await reserveCodeIfAuto('customer', isAutoPreview ? undefined : formData.code);
            if (resolvedCode !== formData.code) {
                formData.code = resolvedCode;
                setValue('code', resolvedCode ?? '');
                setCodeLocked(true);
            }

            const computedShopName = formData.shopName?.trim() || `${formData.firstName} ${formData.lastName || ''}`.trim() || formData.firstName;
            const payload: CustomerFormData = {
                ...formData,
                shopName: computedShopName,
                customerOfficeAddress: formData.customerOfficeAddress || '',
                salesmanId: formData.salesmanId || '',
                // '' (not undefined) so clearing a partner actually clears it on update.
                shipToPartyId: formData.shipToPartyId ?? '',
                soldToPartyId: formData.soldToPartyId ?? '',
                payerId: formData.payerId ?? '',
                billToPartyId: formData.billToPartyId ?? '',
            };

            let result;
            if (isEditing && data?.uuid) {
                result = await updateCustomerData(data.uuid, payload);
            } else {
                result = await addCustomer(payload);
            }
            onEvent?.({ eventType: 'CustomerSaved', customer: result });
            reset(initialFormData);
            onClose();
        } catch (error: any) {
            setError('root', { message: error.response?.data?.message || 'Failed to save customer. Please try again.' });
        }
    };

    const handleClose = () => {
        reset(initialFormData);
        onClose();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue('image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setValue('image', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // salesman Options
    const { data: salesman = [] } = useQuery({ queryKey: ['salesman-all'], queryFn: () => getAllSalesmen(), enabled: isOpen, staleTime: 10 * 60 * 1000 });

    const salesmanOptions: SelectOption[] = salesman.map((s: any) => ({
        value: s.id?.toString() || s.value?.toString() || '',
        label: s.name ? `${s.salesmanCode ? s.salesmanCode + ' - ' : ''}${s.name}` : s.label || s.salesmanCode || '',
    }));

    // Countries
    const { data: countries = [] } = useQuery({ queryKey: ['countries-all'], queryFn: () => getAllCountries(), enabled: isOpen, staleTime: 10 * 60 * 1000 });

    const countryOptions: SelectOption[] = countries.map((c) => ({ value: c.id?.toString() || '', label: c.name || '' }));
    // The saved country stays selectable even if it isn't in the fetched list.
    if (data?.country && !countryOptions.some((o) => o.value === String(data.country!.id))) {
        countryOptions.unshift({ value: String(data.country.id), label: data.country.name });
    }

    const watchedCountryId = watch('countryId');
    const enableLogin = watch('enableLogin');
    const selectedCountryCode = countries.find((c) => String(c.id) === String(watchedCountryId))?.countryCode;
    // The state list follows the customer's country, else the organisation's.
    const orgCountryCode = useAuth().organisation?.country?.countryCode;
    const stateCountryCode = watchedCountryId ? selectedCountryCode : orgCountryCode;

    // Customer Type — paginated + searchable (was a full unpaginated fetch)
    const customerTypeSelect = useInfiniteSelect({
        enabled: isOpen,
        fetchPage: async (page, search) => {
            const res = await getCustomerTypeOptions(page, search || undefined);
            return { items: res.data, hasMore: res.meta.has_more_pages };
        },
        mapItemToOption: (t: any) => ({ value: String(t.id ?? ''), label: t.name || '' }),
    });

    const customerCategoryOptions: SelectOption[] = customerCategories.map((cat) => ({ value: cat.id?.toString() || '', label: cat.categoryName || '' }));

    const channelOptions: SelectOption[] = channels.map((channel) => ({ value: channel.id?.toString() || '', label: channel.channelName || '' }));

    const salesOrganisationOptions: SelectOption[] = salesOrganisations.map((so) => ({ value: so.id?.toString() || '', label: so.name || '' }));

    // Partner function customer pickers — each gets its own paginated +
    // searchable instance (independent search/scroll state per dropdown),
    // prefixed with a "Same as customer" sentinel and excluding self.
    const watchedCode = watch('code');
    const sameAsCodeLabel = watchedCode?.trim() ? `${watchedCode.trim()} (Same customer)` : 'Same customer';

    const fetchCustomerPage = async (page: number, search: string) => {
        const res = await getCustomerOptions(page, search || undefined);
        return { items: res.data, hasMore: res.meta.has_more_pages };
    };
    const mapCustomerToOption = (c: any) => ({ value: c.value, label: c.label });

    // The saved partner may not be on the first fetched page — hand each select its label
    // (the "same customer" choice is added separately by buildPartnerOptions).
    const savedPartner = (key: 'shipTo' | 'soldTo' | 'payer' | 'billTo') => {
        const saved = data?.partners?.[key];
        return saved && saved.value !== 'same_as_customer' ? saved : null;
    };
    const shipToPartySelect = useInfiniteSelect({
        enabled: isOpen,
        fetchPage: fetchCustomerPage,
        mapItemToOption: mapCustomerToOption,
        selectedValue: watch('shipToPartyId'),
        initialOption: savedPartner('shipTo'),
    });
    const soldToPartySelect = useInfiniteSelect({
        enabled: isOpen,
        fetchPage: fetchCustomerPage,
        mapItemToOption: mapCustomerToOption,
        selectedValue: watch('soldToPartyId'),
        initialOption: savedPartner('soldTo'),
    });
    const payerSelect = useInfiniteSelect({
        enabled: isOpen,
        fetchPage: fetchCustomerPage,
        mapItemToOption: mapCustomerToOption,
        selectedValue: watch('payerId'),
        initialOption: savedPartner('payer'),
    });
    const billToPartySelect = useInfiniteSelect({
        enabled: isOpen,
        fetchPage: fetchCustomerPage,
        mapItemToOption: mapCustomerToOption,
        selectedValue: watch('billToPartyId'),
        initialOption: savedPartner('billTo'),
    });

    const buildPartnerOptions = (options: SelectOption[]): SelectOption[] => [
        { value: 'same_as_customer', label: sameAsCodeLabel },
        // Options are keyed by customer uuid (CustomerRepository::toSelectOption),
        // so exclude self by uuid, not the numeric id.
        ...options.filter((o) => String(o.value) !== String(data?.uuid ?? '')),
    ];

    const footerContent = (
        <div className="flex items-center justify-end gap-3 w-full">
            <CancelButton onClick={handleClose} disabled={isSubmitting || isAdding || isUpdating}>
                Cancel
            </CancelButton>
            <SaveButton type="submit" form="customer-form" disabled={isLoading || isSubmitting || isAdding || isUpdating} className="bg-primary-700 hover:bg-primary-800 text-white min-w-[80px]">
                {isSubmitting || isAdding || isUpdating ? 'Saving...' : 'Save'}
            </SaveButton>
        </div>
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Edit Customer' : 'Add Customer'}
            width="w-[700px]"
            footer={footerContent}
            isLoading={isLoading}
            skeleton={<FormSkeleton fields={CUSTOMER_FORM_SKELETON} gap={5} />}
        >
            <form id="customer-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
                {/* Root errors */}
                {errors.root && (
                    <div className="flex items-start gap-2.5 border-l-2 border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 px-4 py-2.5 text-sm rounded">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{errors.root.message}</span>
                    </div>
                )}

                {/* Customer Code */}
                <div>
                    <FormFieldLabel label="Customer Code" required />
                    <div className="flex items-center gap-2">
                        <Input {...register('code')} placeholder="Configure the system to auto-generate the code." disabled={codeLocked} />
                        <OrderCodeSettingsIcon label="Customer Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} entityKey="customer" onLockChange={setCodeLocked} />
                    </div>
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="First Name" required />
                        <Input
                            {...register('firstName', { required: 'First name is required', validate: (v) => v.trim() !== '' || 'First name cannot be empty' })}
                            placeholder="Enter first name"
                            error={errors.firstName?.message}
                        />
                    </div>
                    <div>
                        <FormFieldLabel label="Last Name" />
                        <Input {...register('lastName')} placeholder="Enter last name" />
                    </div>
                </div>

                {/* Shop Name */}
                <div>
                    <FormFieldLabel label="Shop Name" />
                    <Input {...register('shopName')} placeholder="Enter shop name (defaults to the contact's name)" />
                </div>

                {/* Email */}
                <div>
                    <FormFieldLabel label="Email" />
                    <Input
                        {...register('email', {
                            required: enableLogin ? 'Email is required for the customer to sign in' : false,
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
                        })}
                        type="email"
                        placeholder="Enter email address"
                        error={errors.email?.message}
                    />
                </div>

                {/* Customer sign-in */}
                <div className="space-y-4 rounded-lg border border-[var(--border-color)] p-4">
                    <Checkbox label="Allow this customer to sign in" checked={Boolean(enableLogin)} {...register('enableLogin')} />
                    {enableLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FormFieldLabel label="Password" required={!data?.hasLoginAccess} />
                                <Input
                                    {...register('password', {
                                        required: data?.hasLoginAccess ? false : 'Password is required',
                                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                    })}
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder={data?.hasLoginAccess ? 'Leave blank to keep the current password' : 'Enter password'}
                                    error={errors.password?.message}
                                />
                            </div>
                            <div>
                                <FormFieldLabel label="Confirm Password" required={!data?.hasLoginAccess} />
                                <Input
                                    {...register('passwordConfirmation', { validate: (v) => v === watch('password') || 'Passwords do not match' })}
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Re-enter password"
                                    error={errors.passwordConfirmation?.message}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Office Address & Home Address */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Office Address" required />
                        <Input {...register('customerOfficeAddress', { required: 'Office address is required' })} placeholder="Enter office address" error={errors.customerOfficeAddress?.message} />
                    </div>
                    <div>
                        <FormFieldLabel label="Home Address" />
                        <Input {...register('customerHomeAddress')} placeholder="Enter home address" />
                    </div>
                </div>

                {/* State & City (State on left, City on right per image) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="State" />
                        <Controller
                            name="customerOfficeState"
                            control={control}
                            render={({ field }) => (
                                <StateSelect
                                    countryCode={stateCountryCode}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    fallback={<Input value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} placeholder="Enter state" />}
                                />
                            )}
                        />
                    </div>
                    <div>
                        <FormFieldLabel label="City" />
                        <Input {...register('customerOfficeCity')} placeholder="Enter city" />
                    </div>
                </div>

                {/* Zipcode & Phone Number */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Zipcode" />
                        <Input {...register('customerOfficeZipcode')} placeholder="Enter zipcode" />
                    </div>
                    <div>
                        <CountryPhoneInput name="phoneNumber" control={control} label="Phone Number" countryCode={selectedCountryCode} />
                    </div>
                </div>

                {/* Grand Channel & Customer Type */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Grand Channel" required />
                        <Controller
                            name="customerCategoryId"
                            control={control}
                            rules={{ required: 'Grand Channel is required' }}
                            render={({ field }) => (
                                <CreatableSelect
                                    value={String(field.value ?? '')}
                                    onChange={field.onChange}
                                    options={customerCategoryOptions}
                                    placeholder="Search a Customer Category"
                                    createLabel="Add New Category"
                                    onCreate={createCustomerCategoryOption}
                                    fields={[{ type: 'text', name: 'name', label: 'Category Name', required: true }]}
                                />
                            )}
                        />
                        {errors.customerCategoryId && <p className="mt-1 text-sm text-red-500">{errors.customerCategoryId.message}</p>}
                    </div>
                    <div>
                        <FormFieldLabel label="Customer Type" required />
                        <Controller
                            name="customerTypeId"
                            control={control}
                            rules={{ required: 'Customer Type is required' }}
                            render={({ field }) => (
                                <Select
                                    value={String(field.value ?? '')}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    options={customerTypeSelect.options}
                                    isLoading={customerTypeSelect.isLoading}
                                    isLoadingMore={customerTypeSelect.isLoadingMore}
                                    hasMore={customerTypeSelect.hasMore}
                                    onLoadMore={customerTypeSelect.onLoadMore}
                                    onSearchChange={customerTypeSelect.onSearchChange}
                                    placeholder="Select customer type"
                                />
                            )}
                        />
                        {errors.customerTypeId && <p className="mt-1 text-sm text-red-500">{errors.customerTypeId.message}</p>}
                    </div>
                </div>

                {/* Parent Channel & Sales Organisation */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Parent Channel" required />
                        <Controller
                            name="channelId"
                            control={control}
                            rules={{ required: 'Parent Channel is required' }}
                            render={({ field }) => (
                                <CreatableSelect
                                    value={String(field.value ?? '')}
                                    onChange={field.onChange}
                                    options={channelOptions}
                                    placeholder="Search a channel"
                                    createLabel="Add New Channel"
                                    onCreate={createChannelOption}
                                    fields={[
                                        { type: 'text', name: 'name', label: 'Channel Name', required: true },
                                        { type: 'select', name: 'parentId', label: 'Parent Channel', options: channelOptions, placeholder: 'None (top level)' },
                                        { type: 'toggle', name: 'status', label: 'Active' },
                                    ]}
                                />
                            )}
                        />
                        {errors.channelId && <p className="mt-1 text-sm text-red-500">{errors.channelId.message}</p>}
                    </div>
                    <div>
                        <FormFieldLabel label="Sales Organisation" required />
                        <Controller
                            name="salesOrganisationId"
                            control={control}
                            rules={{ required: 'Sales Organisation is required' }}
                            render={({ field }) => (
                                <CreatableSelect
                                    value={String(field.value ?? '')}
                                    onChange={field.onChange}
                                    options={salesOrganisationOptions}
                                    placeholder="Search a Sales Organisation"
                                    createLabel="Add New Sales Organisation"
                                    onCreate={createSalesOrganisationOption}
                                    fields={[
                                        { type: 'text', name: 'name', label: 'Sales Organisation Name', required: true },
                                        { type: 'select', name: 'parentId', label: 'Parent Organisation', options: salesOrganisationOptions, placeholder: 'None (top level)' },
                                        { type: 'toggle', name: 'status', label: 'Active' },
                                    ]}
                                />
                            )}
                        />
                        {errors.salesOrganisationId && <p className="mt-1 text-sm text-red-500">{errors.salesOrganisationId.message}</p>}
                    </div>
                </div>

                {/* Country & Region */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Country" />
                        <Controller
                            name="countryId"
                            control={control}
                            render={({ field }) => <Select value={String(field.value ?? '')} onChange={(e) => field.onChange(e.target.value)} options={countryOptions} placeholder="Search" />}
                        />
                    </div>
                    <div>
                        <FormFieldLabel label="Region" />
                        <Controller
                            name="regionId"
                            control={control}
                            render={({ field }) => (
                                <RegionSelect
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    initialOption={data?.region ? { value: data.region.id, label: data.region.code ? `${data.region.code} - ${data.region.name}` : data.region.name } : null}
                                    placeholder="Search"
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Salesman (formerly Merchandiser) */}
                <div>
                    <FormFieldLabel label="Salesman" />
                    <Controller
                        name="salesmanId"
                        control={control}
                        render={({ field }) => <Select value={String(field.value ?? '')} onChange={(e) => field.onChange(e.target.value)} options={salesmanOptions} placeholder="Select Options" />}
                    />
                </div>

                {/* Partner Function Section */}
                <div className="pt-2">
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <div className="inline-block border-b-2 border-primary-600 pb-2 px-1">
                            <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 dark:text-white uppercase">PATNER FUNCTION</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <FormFieldLabel label="SHIP TO PARTY" />
                            <Controller
                                name="shipToPartyId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={String(field.value ?? '')}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        options={buildPartnerOptions(shipToPartySelect.options)}
                                        isLoading={shipToPartySelect.isLoading}
                                        isLoadingMore={shipToPartySelect.isLoadingMore}
                                        hasMore={shipToPartySelect.hasMore}
                                        onLoadMore={shipToPartySelect.onLoadMore}
                                        onSearchChange={shipToPartySelect.onSearchChange}
                                        placeholder="Select customer"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <FormFieldLabel label="SOLD TO PARTY" />
                            <Controller
                                name="soldToPartyId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={String(field.value ?? '')}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        options={buildPartnerOptions(soldToPartySelect.options)}
                                        isLoading={soldToPartySelect.isLoading}
                                        isLoadingMore={soldToPartySelect.isLoadingMore}
                                        hasMore={soldToPartySelect.hasMore}
                                        onLoadMore={soldToPartySelect.onLoadMore}
                                        onSearchChange={soldToPartySelect.onSearchChange}
                                        placeholder="Select customer"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <FormFieldLabel label="PAYER " />
                            <Controller
                                name="payerId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={String(field.value ?? '')}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        options={buildPartnerOptions(payerSelect.options)}
                                        isLoading={payerSelect.isLoading}
                                        isLoadingMore={payerSelect.isLoadingMore}
                                        hasMore={payerSelect.hasMore}
                                        onLoadMore={payerSelect.onLoadMore}
                                        onSearchChange={payerSelect.onSearchChange}
                                        placeholder="Select customer"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <FormFieldLabel label="BILL TO PARTY" />
                            <Controller
                                name="billToPartyId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={String(field.value ?? '')}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        options={buildPartnerOptions(billToPartySelect.options)}
                                        isLoading={billToPartySelect.isLoading}
                                        isLoadingMore={billToPartySelect.isLoadingMore}
                                        hasMore={billToPartySelect.hasMore}
                                        onLoadMore={billToPartySelect.onLoadMore}
                                        onSearchChange={billToPartySelect.onSearchChange}
                                        placeholder="Select customer"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Image */}
                <div>
                    <FormFieldLabel label="Profile Image" />
                    <div className="flex items-center gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 dark:file:border-gray-600 file:text-sm file:font-medium file:bg-gray-50 dark:file:bg-gray-800 hover:file:bg-gray-100 dark:hover:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"
                        />
                        {watch('image') && (
                            <div className="relative shrink-0">
                                <img src={watch('image')} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute cursor-pointer cursor-pointer -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-700 dark:bg-gray-600 text-white flex items-center justify-center hover:bg-gray-900 dark:hover:bg-gray-500 transition-colors"
                                    title="Remove image"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </Drawer>
    );
}

export default CustomerAdd;
