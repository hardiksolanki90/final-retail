import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Drawer } from "../../components/ui/Drawer";
import { Input } from "../../components/ui/Input";
import { Select, type SelectOption } from "../../components/ui/Select";
import { CreatableSelect } from "../../components/ui/CreatableSelect";
import { SaveButton, CancelButton } from "../../components/ui/Button";
import { OrderCodeSettingsIcon } from "../../components/ui/OrderCodeSettingsIcon";
import { CountryPhoneInput } from "../../components/ui/CountryPhoneInput";
import { getAllSalesmen } from "../../api/SalesmanApi";
import { getAllCountries } from "../../api/CountryApi";
import { getRegionOptions, createRegion } from "../../api/RegionApi";
import { getAllCustomers } from "../../api/CustomerApi";
import type {
    CustomerFormData,
    Customer,
} from "../../types/Customer";
import { useCustomer } from "../../providers/CustomerProvider";
import { AlertCircle } from "lucide-react";

interface CustomerAddProps {
    isOpen: boolean;
    onClose: () => void;
    data?: Customer | null;
    onEvent?: (data: any) => void;
}

const initialFormData: CustomerFormData = {
    code: "",
    shopName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    customerOfficeAddress: "",
    customerOfficeCity: "",
    customerOfficeState: "",
    customerOfficeZipcode: "",
    customerHomeAddress: "",
    image: "",
    status: true,
    salesmanId: "",
    salesOrganisationId: "",
    countryId: "",
    regionId: "",
    shipToPartyId: "",
    soldToPartyId: "",
    payerId: "",
    billToPartyId: "",
    customerTypeId: "",
    customerCategoryId: "",
    channelId: "",
};

function FormFieldLabel({
    label,
    required = false,
    colon = true,
}: {
    label: string;
    required?: boolean;
    colon?: boolean;
}) {
    return (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
            {colon ? ':' : ''}
        </label>
    );
}

export function CustomerAdd({
    isOpen,
    onClose,
    data,
    onEvent,
}: CustomerAddProps) {
    const {
        addCustomer,
        updateCustomerData,
        isAdding,
        isUpdating,
        customerData,
        customerTypes,
        customerCategories,
        channels,
        createCustomerCategoryOption,
        createChannelOption,
        createSalesOrganisationOption,
        salesOrganisations,
    } = useCustomer();

    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
        watch,
        setValue,
        control,
    } = useForm<CustomerFormData>({
        defaultValues: initialFormData,
    });

    const isEditing = !!data;

    useEffect(() => {
        if (isOpen && data) {
            reset({
                code: data.code || '',
                shopName: data.shopName || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                customerOfficeAddress: data.customerOfficeAddress || (data as any).address || '',
                customerHomeAddress: data.customerHomeAddress || '',
                customerOfficeState: data.customerOfficeState || (data as any).state || '',
                customerOfficeCity: data.customerOfficeCity || (data as any).city || '',
                customerOfficeZipcode: data.customerOfficeZipcode || (data as any).zipcode || '',
                image: data.image || '',
                status: data.status ?? true,
                salesmanId: data.salesman?.id?.toString() || data.salesmanId?.toString() || data.merchandiserId?.toString() || '',
                salesOrganisationId: data.salesOrganisationId?.toString() || data.salesOrganisation?.id?.toString() || '',
                countryId: data.countryId?.toString() || (data as any).country?.id?.toString() || '',
                regionId: data.regionId?.toString() || (data as any).region?.id?.toString() || '',
                shipToPartyId: (data.shipToPartyId && data.id && String(data.shipToPartyId) === String(data.id))
                    ? 'same_as_code'
                    : (data.shipToPartyId?.toString() || ''),
                soldToPartyId: (data.soldToPartyId && data.id && String(data.soldToPartyId) === String(data.id))
                    ? 'same_as_code'
                    : (data.soldToPartyId?.toString() || ''),
                payerId: (data.payerId && data.id && String(data.payerId) === String(data.id))
                    ? 'same_as_code'
                    : (data.payerId?.toString() || ''),
                billToPartyId: (data.billToPartyId && data.id && String(data.billToPartyId) === String(data.id))
                    ? 'same_as_code'
                    : (data.billToPartyId?.toString() || ''),
                customerTypeId: data.customerType?.id?.toString() || data.customerTypeId?.toString() || '',
                customerCategoryId: data.customerCategory?.id?.toString() || data.customerCategoryId?.toString() || '',
                channelId: data.channel?.id?.toString() || data.channelId?.toString() || '',
            });
        } else if (isOpen) {
            reset(initialFormData);
        }
    }, [isOpen, data, reset]);

    const onFormSubmit = async (formData: CustomerFormData) => {
        try {
            const computedShopName = formData.shopName?.trim() || `${formData.firstName} ${formData.lastName || ''}`.trim() || formData.firstName;
            const payload: CustomerFormData = {
                ...formData,
                shopName: computedShopName,
                customerOfficeAddress: formData.customerOfficeAddress || '',
                merchandiserId: formData.salesmanId || '',
                shipToPartyId: formData.shipToPartyId || undefined,
                soldToPartyId: formData.soldToPartyId || undefined,
                payerId: formData.payerId || undefined,
                billToPartyId: formData.billToPartyId || undefined,
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
            setError('root', {
                message: error.response?.data?.message || 'Failed to save customer. Please try again.',
            });
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

    // Salesmen Options
    const { data: salesmen = [] } = useQuery({
        queryKey: ['salesmen-all'],
        queryFn: () => getAllSalesmen(),
        enabled: isOpen,
        staleTime: 10 * 60 * 1000,
    });

    const salesmanOptions: SelectOption[] = salesmen.map((s: any) => ({
        value: s.id?.toString() || s.value?.toString() || '',
        label: s.name ? `${s.salesmanCode ? s.salesmanCode + ' - ' : ''}${s.name}` : (s.label || s.salesmanCode || ''),
    }));

    // Countries
    const { data: countries = [] } = useQuery({
        queryKey: ['countries-all'],
        queryFn: () => getAllCountries(),
        enabled: isOpen,
        staleTime: 10 * 60 * 1000,
    });

    const countryOptions: SelectOption[] = countries.map(c => ({
        value: c.id?.toString() || '',
        label: c.name || '',
    }));

    const watchedCountryId = watch('countryId');
    const selectedCountryCode = countries.find(c => String(c.id) === String(watchedCountryId))?.countryCode;

    // Regions
    const { data: regionOpts = [] } = useQuery({
        queryKey: ['regions-all'],
        queryFn: () => getRegionOptions(),
        enabled: isOpen,
        staleTime: 10 * 60 * 1000,
    });

    const regionOptions: SelectOption[] = regionOpts.map(r => ({
        value: r.value?.toString() || '',
        label: r.label || '',
    }));

    const createRegionMutation = useMutation({
        mutationFn: (values: Record<string, any>) =>
            createRegion({
                regionName: values.name,
                countryId: values.countryId ? Number(values.countryId) : undefined,
                status: values.status ?? true,
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions-all'] }),
    });

    const createRegionOption = async (values: Record<string, any>): Promise<SelectOption> => {
        const created = await createRegionMutation.mutateAsync(values);
        return { value: String(created.id ?? ''), label: created.regionName || values.name };
    };

    // Customer types, categories, channels, sales organisations
    const customerTypeOptions: SelectOption[] = customerTypes.map(type => ({
        value: type.id?.toString() || '',
        label: type.name || '',
    }));

    const customerCategoryOptions: SelectOption[] = customerCategories.map(cat => ({
        value: cat.id?.toString() || '',
        label: cat.categoryName || '',
    }));

    const channelOptions: SelectOption[] = channels.map(channel => ({
        value: channel.id?.toString() || '',
        label: channel.channelName || '',
    }));

    const salesOrganisationOptions: SelectOption[] = salesOrganisations.map(so => ({
        value: so.id?.toString() || '',
        label: so.name || '',
    }));

    // Partner function customer options with "Same as customer" as the default option
    const { data: allCustomersList = [] } = useQuery({
        queryKey: ['all-customers-select'],
        queryFn: () => getAllCustomers(),
        enabled: isOpen,
        staleTime: 10 * 60 * 1000,
    });

    const watchedCode = watch('code');
    const sameAsCodeLabel = watchedCode?.trim() ? `${watchedCode.trim()} (Same customer)` : 'Same customer';

    const partnerCustomerOptions: SelectOption[] = [
        { value: 'same_as_customer', label: sameAsCodeLabel },
        ...(allCustomersList.length > 0
            ? allCustomersList
                .filter((c: any) => String(c.value ?? c.id ?? '') !== String(data?.id ?? ''))
                .map((c: any) => ({
                    value: String(c.value ?? c.id ?? ''),
                    label: c.label || `${c.code || ''} - ${c.shopName || c.name || ''}`,
                }))
            : (customerData?.data
                ?.filter(c => !data?.id || c.id !== data.id)
                .map(c => ({
                    value: c.id?.toString() || '',
                    label: `${c.code} - ${c.shopName || `${c.firstName || ''} ${c.lastName || ''}`.trim()}`,
                })) || []))
    ];

    const footerContent = (
        <div className="flex items-center justify-end gap-3 w-full">
            <CancelButton
                onClick={handleClose}
                disabled={isSubmitting || isAdding || isUpdating}
            >
                Cancel
            </CancelButton>
            <SaveButton
                type="submit"
                form="customer-form"
                disabled={isSubmitting || isAdding || isUpdating}
                className="bg-primary-700 hover:bg-primary-800 text-white min-w-[80px]"
            >
                {(isSubmitting || isAdding || isUpdating) ? 'Saving...' : 'Save'}
            </SaveButton>
        </div>
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? "Edit Customer" : "Add Customer"}
            width="w-[800px]"
            footer={footerContent}
        >
            <form
                id="customer-form"
                onSubmit={handleSubmit(onFormSubmit)}
                className="p-6 space-y-5"
            >
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
                        <Input
                            {...register('code')}
                            placeholder="Auto-generated if empty"
                        />
                        <OrderCodeSettingsIcon
                            label="Customer Code"
                            value={watch('code') || ''}
                            onChange={(v) => setValue('code', v)}
                        />
                    </div>
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="First Name" required />
                        <Input
                            {...register('firstName', {
                                required: 'First name is required',
                                validate: (v) => v.trim() !== '' || 'First name cannot be empty',
                            })}
                            placeholder="Enter first name"
                            error={errors.firstName?.message}
                        />
                    </div>
                    <div>
                        <FormFieldLabel label="Last Name" />
                        <Input
                            {...register('lastName')}
                            placeholder="Enter last name"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <FormFieldLabel label="Email" required />
                    <Input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Please enter a valid email address',
                            },
                        })}
                        type="email"
                        placeholder="Enter email address"
                        error={errors.email?.message}
                    />
                </div>

                {/* Office Address & Home Address */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Office Address" required />
                        <Input
                            {...register('customerOfficeAddress', {
                                required: 'Office address is required',
                            })}
                            placeholder="Enter office address"
                            error={errors.customerOfficeAddress?.message}
                        />
                    </div>
                    <div>
                        <FormFieldLabel label="Home Address" />
                        <Input
                            {...register('customerHomeAddress')}
                            placeholder="Enter home address"
                        />
                    </div>
                </div>

                {/* State & City (State on left, City on right per image) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="State" />
                        <Input
                            {...register('customerOfficeState')}
                            placeholder="Enter state"
                        />
                    </div>
                    <div>
                        <FormFieldLabel label="City" />
                        <Input
                            {...register('customerOfficeCity')}
                            placeholder="Enter city"
                        />
                    </div>
                </div>

                {/* Zipcode & Phone Number */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Zipcode" />
                        <Input
                            {...register('customerOfficeZipcode')}
                            placeholder="Enter zipcode"
                        />
                    </div>
                    <div>
                        <CountryPhoneInput
                            name="phoneNumber"
                            control={control}
                            label="Phone Number"
                            countryCode={selectedCountryCode}
                        />
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
                                    fields={[
                                        { type: 'text', name: 'name', label: 'Category Name', required: true },
                                    ]}
                                />
                            )}
                        />
                        {errors.customerCategoryId && (
                            <p className="mt-1 text-sm text-red-500">{errors.customerCategoryId.message}</p>
                        )}
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
                                    options={customerTypeOptions}
                                    placeholder="Select customer type"
                                />
                            )}
                        />
                        {errors.customerTypeId && (
                            <p className="mt-1 text-sm text-red-500">{errors.customerTypeId.message}</p>
                        )}
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
                        {errors.channelId && (
                            <p className="mt-1 text-sm text-red-500">{errors.channelId.message}</p>
                        )}
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
                        {errors.salesOrganisationId && (
                            <p className="mt-1 text-sm text-red-500">{errors.salesOrganisationId.message}</p>
                        )}
                    </div>
                </div>

                {/* Country & Region */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FormFieldLabel label="Country" />
                        <Controller
                            name="countryId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={String(field.value ?? '')}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    options={countryOptions}
                                    placeholder="Search"
                                />
                            )}
                        />
                    </div>
                    <div>
                        <FormFieldLabel label="Region" />
                        <Controller
                            name="regionId"
                            control={control}
                            render={({ field }) => (
                                <CreatableSelect
                                    value={String(field.value ?? '')}
                                    onChange={field.onChange}
                                    options={regionOptions}
                                    placeholder="Search"
                                    createLabel="Add New Region"
                                    onCreate={createRegionOption}
                                    fields={[
                                        { type: 'text', name: 'name', label: 'Region Name', required: true },
                                        { type: 'select', name: 'countryId', label: 'Country', options: countryOptions, placeholder: 'Select Country' },
                                        { type: 'toggle', name: 'status', label: 'Active' },
                                    ]}
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
                        render={({ field }) => (
                            <Select
                                value={String(field.value ?? '')}
                                onChange={(e) => field.onChange(e.target.value)}
                                options={salesmanOptions}
                                placeholder="Select Options"
                            />
                        )}
                    />
                </div>

                {/* Partner Function Section */}
                <div className="pt-2">
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <div className="inline-block border-b-2 border-primary-600 pb-2 px-1">
                            <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 dark:text-white uppercase">
                                PATNER FUNCTION
                            </span>
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
                                        options={partnerCustomerOptions}
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
                                        options={partnerCustomerOptions}
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
                                        options={partnerCustomerOptions}
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
                                        options={partnerCustomerOptions}
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
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 dark:file:border-gray-600 file:text-sm file:font-medium file:bg-gray-50 dark:file:bg-gray-800 hover:file:bg-gray-100 dark:hover:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800"
                        />
                        {watch('image') && (
                            <img
                                src={watch('image')}
                                alt="Profile Preview"
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                            />
                        )}
                    </div>
                </div>
            </form>
        </Drawer>
    );
}

export default CustomerAdd;
