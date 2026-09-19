import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import ReactFlagsSelect from 'react-flags-select';
import PhoneInput, { type Country as PhoneCountry } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Building2, MapPin, ShieldCheck, Check, Phone, X } from 'lucide-react';
import { useOrganisation, useUpdateOrganisation } from '../../hooks/Organisation/useOrganisation';
import { useCountryMasters } from '../../hooks/Country/useCountryMasters';
import { showToast } from '../../lib/toast';
import { useAuth } from '../../context/AuthContext';
import type { OrganisationFormData } from '../../types/Organisation';

const initialFormData: OrganisationFormData = {
    org_name: '',
    org_company_id: '',
    org_tax_id: '',
    org_street1: '',
    org_street2: '',
    org_city: '',
    org_state: '',
    country_master_id: '',
    org_postal: '',
    org_phone: '',
    org_contact_person: '',
    org_contact_person_number: '',
    org_currency: '',
    org_fasical_year: '',
    is_batch_enabled: false,
    is_credit_limit_enabled: false,
    gst_reg_date: '',
};

const FISCAL_YEAR_OPTIONS = ['Jan-Dec', 'Apr-Mar', 'Jul-Jun'];

const panelClass = 'border-2 border-[#0B0D0A]/15 bg-[#F5F3ED] p-6 dark:border-[#F5F3ED]/20 dark:bg-[#0B0D0A]';
const sectionTitleClass = 'font-display text-xl font-bold text-[#0B0D0A] dark:text-[#F5F3ED]';
const inputClass = "font-mono-ui w-full border-2 border-[#0B0D0A]/15 bg-transparent py-2.5 px-3.5 text-sm text-[#0B0D0A] outline-none transition-[box-shadow,border-color] placeholder:text-[#0B0D0A]/30 focus:border-[#FF5A1F] focus:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] dark:placeholder:text-[#F5F3ED]/30";
const formLabelClass = "font-mono-ui mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70";
const errorClass = "font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]";
const phoneInputClass = "font-mono-ui border-2 border-[#0B0D0A]/15 bg-transparent py-2.5 pl-3.5 pr-11 text-sm text-[#0B0D0A] transition-[box-shadow,border-color] focus-within:border-[#FF5A1F] focus-within:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] focus:outline-none ring-0";
const primaryButtonClass =
    'group inline-flex items-center gap-2 border-2 border-[#0B0D0A] bg-[#0B0D0A] px-6 py-3 font-mono-ui text-sm font-semibold tracking-wide text-[#F5F3ED] shadow-[6px_6px_0_0_#FF5A1F] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#FF5A1F] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_0_#FF5A1F] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#0B0D0A]';

export const OrganisationEdit: React.FC = () => {
    const navigate = useNavigate();
    const { uuid } = useParams<{ uuid: string }>();
    const { checkAuthStatus } = useAuth();
    const { countryMasters } = useCountryMasters();
    const { organisation, isLoading: orgLoading, isSuccess: orgFetched } = useOrganisation();
    const updateMutation = useUpdateOrganisation();
    const { register, handleSubmit, reset, setValue, watch, control, setError, formState: { errors } } = useForm<OrganisationFormData>({
        defaultValues: initialFormData,
    });
    const formValues = watch();

    const currencyOptions = React.useMemo(() => {
        const byCode = new Map<string, string>();
        countryMasters.forEach((master) => {
            if (master.currencyCode) byCode.set(master.currencyCode, master.currency || master.currencyCode);
        });
        return Array.from(byCode.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [countryMasters]);

    const countryCodes = React.useMemo(
        () => countryMasters.map((m) => m.countryCode).filter(Boolean),
        [countryMasters]
    );
    const masterByCode = React.useCallback(
        (code: string) => countryMasters.find((m) => m.countryCode === code),
        [countryMasters]
    );
    const codeByMasterId = React.useCallback(
        (id: string) => countryMasters.find((m) => String(m.id) === id)?.countryCode || '',
        [countryMasters]
    );

    const selectedTaxProfile = React.useMemo(
        () => countryMasters.find((m) => String(m.id) === formValues.country_master_id)?.taxProfile ?? null,
        [countryMasters, formValues.country_master_id]
    );
    const taxIdLabel = selectedTaxProfile?.registrationNumberLabel
        ? `${selectedTaxProfile.registrationNumberLabel} Number`
        : 'Tax Registration Number';
    const taxRegDateLabel = selectedTaxProfile?.registrationNumberLabel
        ? `${selectedTaxProfile.registrationNumberLabel} Reg Date`
        : 'Registration Date';

    React.useEffect(() => {
        if (!orgFetched) return;
        if (!organisation) {
            // No org row at all — this route assumes an existing record;
            // OrganisationGuard already keeps this case off every Layout
            // route, but fall back to onboarding if it's ever reached anyway.
            navigate('/organisation/add', { replace: true });
            return;
        }
        // Keep the URL's uuid honest — a stale/bookmarked uuid self-corrects
        // to the org's real one instead of silently editing the wrong link.
        if (organisation.uuid && organisation.uuid !== uuid) {
            navigate(`/organisation/edit/${organisation.uuid}`, { replace: true });
        }
        reset({
            org_name: organisation.org_name || '',
            org_company_id: organisation.org_company_id || '',
            org_tax_id: organisation.org_tax_id || organisation.gstin_number || '',
            org_street1: organisation.org_street1 || '',
            org_street2: organisation.org_street2 || '',
            org_city: organisation.org_city || '',
            org_state: organisation.org_state || '',
            country_master_id: organisation.country?.countryMasterId ? String(organisation.country.countryMasterId) : '',
            org_postal: organisation.org_postal || '',
            org_phone: organisation.org_phone || '',
            org_contact_person: organisation.org_contact_person || '',
            org_contact_person_number: organisation.org_contact_person_number || '',
            org_currency: organisation.org_currency || 'USD',
            org_fasical_year: organisation.org_fasical_year || '',
            is_batch_enabled: Boolean(organisation.is_batch_enabled),
            is_credit_limit_enabled: Boolean(organisation.is_credit_limit_enabled),
            gst_reg_date: organisation.gst_reg_date || '',
        });
    }, [organisation, orgFetched, reset, navigate, uuid]);

    const onSubmit = async (data: OrganisationFormData) => {
        try {
            await updateMutation.mutateAsync(data);
            await checkAuthStatus();
            showToast.success('Organisation profile saved');
            navigate('/organisation/view');
        } catch (error: any) {
            setError('root', { message: error.response?.data?.message || 'Failed to save organisation' });
        }
    };

    if (orgLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 animate-spin border-2 border-[#0B0D0A]/15 border-t-[#FF5A1F] dark:border-[#F5F3ED]/15 dark:border-t-[#FF5A1F]" />
                    <p className="font-mono-ui text-xs tracking-[0.2em] text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
                        LOADING RECORD…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-up space-y-6">
            {/* Eyebrow / toolbar */}
            <div className="flex items-center justify-between gap-4">
                <span className="font-mono-ui text-[10px] tracking-[0.25em] text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40">
                    ORGANISATION / EDIT
                </span>
                <button
                    type="button"
                    onClick={() => navigate('/organisation/view')}
                    className="font-mono-ui flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#0B0D0A]/60 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/60 dark:hover:text-[#F5F3ED]"
                >
                    <X className="h-3.5 w-3.5" /> Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {errors.root && (
                    <div className="border-2 border-[#FF5A1F] bg-[#FF5A1F]/10 px-4 py-3 text-sm text-[#0B0D0A] dark:text-[#F5F3ED]">
                        <span className="font-mono-ui text-[10px] font-semibold tracking-[0.2em]">SAVE_FAILED —</span>{' '}
                        {errors.root.message}
                    </div>
                )}

                {/* ── Organisation ── */}
                <div className={panelClass}>
                    <div className="mb-5 flex items-center gap-2 border-b-2 border-[#0B0D0A]/10 pb-3 dark:border-[#F5F3ED]/10">
                        <Building2 className="h-4 w-4 text-[#FF5A1F]" />
                        <h3 className={sectionTitleClass}>Organisation</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={formLabelClass}>Country *</label>
                            <Controller
                                name="country_master_id"
                                control={control}
                                rules={{ required: 'Country is required' }}
                                render={({ field }) => (
                                    <ReactFlagsSelect
                                        selected={codeByMasterId(field.value ?? '')}
                                        onSelect={(code) => {
                                            const master = masterByCode(code);
                                            field.onChange(master ? String(master.id) : '');
                                            if (master?.currencyCode) setValue('org_currency', master.currencyCode);
                                        }}
                                        countries={countryCodes}
                                        searchable
                                        placeholder="Select country"
                                        selectButtonClassName="!rounded-none !border-2 !border-[#0B0D0A]/15 !bg-transparent !font-mono-ui !text-sm !text-[#0B0D0A] dark:!border-[#F5F3ED]/20 dark:!text-[#F5F3ED]"
                                    />
                                )}
                            />
                            {errors.country_master_id ? (
                                <p className={errorClass}>{errors.country_master_id.message}</p>
                            ) : (
                                <p className="font-mono-ui mt-1.5 text-[11px] text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40">
                                    Sets the default currency and tax system below.
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={formLabelClass}>Organisation Name *</label>
                            <input
                                type="text"
                                {...register('org_name', { required: 'Organisation name is required' })}
                                className={inputClass}
                                placeholder="Acme Distribution Co."
                            />
                            {errors.org_name && <p className={errorClass}>{errors.org_name.message}</p>}
                        </div>

                        <div>
                            <label className={formLabelClass}>Company ID *</label>
                            <input
                                type="text"
                                {...register('org_company_id', { required: 'Company ID is required' })}
                                className={inputClass}
                                placeholder="CO-00142"
                            />
                            {errors.org_company_id && <p className={errorClass}>{errors.org_company_id.message}</p>}
                        </div>

                        <div>
                            <label className={formLabelClass}>Currency</label>
                            <Controller
                                name="org_currency"
                                control={control}
                                render={({ field }) => (
                                    <select {...field} className={inputClass}>
                                        <option value="">Select currency</option>
                                        {currencyOptions.map(([code, name]) => (
                                            <option key={code} value={code}>{code} — {name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>

                        <div>
                            <label className={formLabelClass}>Fiscal Year</label>
                            <select {...register('org_fasical_year')} className={inputClass}>
                                <option value="">Select fiscal year</option>
                                {FISCAL_YEAR_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Location ── */}
                <div className={panelClass}>
                    <div className="mb-5 flex items-center gap-2 border-b-2 border-[#0B0D0A]/10 pb-3 dark:border-[#F5F3ED]/10">
                        <MapPin className="h-4 w-4 text-[#FF5A1F]" />
                        <h3 className={sectionTitleClass}>Location</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={formLabelClass}>Organisation Phone *</label>
                            <Controller
                                name="org_phone"
                                control={control}
                                rules={{ required: 'Phone number is required' }}
                                render={({ field }) => (
                                    <div className="relative">
                                        <PhoneInput
                                            international
                                            defaultCountry={codeByMasterId(formValues.country_master_id || '') as PhoneCountry | undefined}
                                            value={field.value}
                                            onChange={(value) => field.onChange(value ?? '')}
                                            placeholder="Enter phone number"
                                            className={phoneInputClass}
                                            numberInputProps={{ className: 'phone-input-field' }}
                                        />
                                        <Phone className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40" />
                                    </div>
                                )}
                            />
                            {errors.org_phone && <p className={errorClass}>{errors.org_phone.message}</p>}
                        </div>

                        <div>
                            <label className={formLabelClass}>Contact Person</label>
                            <input type="text" {...register('org_contact_person')} className={inputClass} placeholder="Full name" />
                        </div>

                        <div>
                            <label className={formLabelClass}>Contact Person's Direct Line</label>
                            <input type="text" {...register('org_contact_person_number')} className={inputClass} placeholder="Their personal phone" />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={formLabelClass}>Street 1 *</label>
                            <input
                                type="text"
                                {...register('org_street1', { required: 'Street is required' })}
                                className={inputClass}
                                placeholder="Street address line 1"
                            />
                            {errors.org_street1 && <p className={errorClass}>{errors.org_street1.message}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={formLabelClass}>Street 2</label>
                            <input type="text" {...register('org_street2')} className={inputClass} placeholder="Street address line 2 (optional)" />
                        </div>

                        <div>
                            <label className={formLabelClass}>City</label>
                            <input type="text" {...register('org_city')} className={inputClass} placeholder="City" />
                        </div>

                        <div>
                            <label className={formLabelClass}>State / Province</label>
                            <input type="text" {...register('org_state')} className={inputClass} placeholder="State" />
                        </div>

                        <div>
                            <label className={formLabelClass}>Postal Code</label>
                            <input type="text" {...register('org_postal')} className={inputClass} placeholder="ZIP / postal code" />
                        </div>
                    </div>
                </div>

                {/* ── Tax & Modules ── */}
                <div className={panelClass}>
                    <div className="mb-5 flex items-center gap-2 border-b-2 border-[#0B0D0A]/10 pb-3 dark:border-[#F5F3ED]/10">
                        <ShieldCheck className="h-4 w-4 text-[#FF5A1F]" />
                        <h3 className={sectionTitleClass}>Tax &amp; Modules</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className={formLabelClass}>{taxIdLabel}</label>
                                <input type="text" {...register('org_tax_id')} className={inputClass} placeholder="Registration ID" />
                            </div>
                            <div>
                                <label className={formLabelClass}>{taxRegDateLabel}</label>
                                <input type="date" {...register('gst_reg_date')} className={inputClass} />
                            </div>
                        </div>

                        {selectedTaxProfile && (
                            <div className="border-2 border-[#0B0D0A]/15 bg-[#0B0D0A]/[0.03] p-4 dark:border-[#F5F3ED]/20 dark:bg-[#F5F3ED]/[0.03]">
                                <p className="font-mono-ui text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70">
                                    {selectedTaxProfile.taxSystem} — {selectedTaxProfile.taxName}
                                </p>
                                {selectedTaxProfile.jurisdictionLevel.length > 0 && (
                                    <p className="font-mono-ui mt-1.5 text-[11px] text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
                                        Jurisdiction: {selectedTaxProfile.jurisdictionLevel.join(', ')}
                                    </p>
                                )}
                                {selectedTaxProfile.calculationNotes && (
                                    <p className="font-mono-ui mt-1.5 text-[11px] text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
                                        {selectedTaxProfile.calculationNotes}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <span className={formLabelClass}>Feature Modules</span>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {([
                                    { name: 'is_batch_enabled' as const, label: 'Batch Tracking', desc: 'Lot / batch traceability for items.' },
                                    { name: 'is_credit_limit_enabled' as const, label: 'Credit Limit', desc: 'Enforce customer credit ceilings.' },
                                ]).map((mod) => (
                                    <label
                                        key={mod.name}
                                        className="group relative flex cursor-pointer flex-col gap-1 border-2 border-[#0B0D0A]/15 p-4 transition-all hover:border-[#0B0D0A]/30 has-[:checked]:border-[#FF5A1F] has-[:checked]:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:hover:border-[#F5F3ED]/40"
                                    >
                                        <input type="checkbox" {...register(mod.name)} className="peer sr-only" />
                                        <span className="flex items-center justify-between">
                                            <span className="font-mono-ui text-xs font-semibold tracking-[0.1em] text-[#0B0D0A] dark:text-[#F5F3ED]">
                                                {mod.label.toUpperCase()}
                                            </span>
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center border-2 border-[#0B0D0A]/20 peer-checked:border-[#FF5A1F] peer-checked:bg-[#FF5A1F] dark:border-[#F5F3ED]/30">
                                                <Check className="hidden h-3.5 w-3.5 text-[#0B0D0A] peer-checked:block" strokeWidth={3} />
                                            </span>
                                        </span>
                                        <span className="font-mono-ui text-[11px] leading-relaxed text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50">
                                            {mod.desc}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Save bar ── */}
                <div className="flex items-center justify-end gap-4 border-t-2 border-[#0B0D0A]/10 pt-6 dark:border-[#F5F3ED]/10">
                    <button
                        type="button"
                        onClick={() => navigate('/organisation/view')}
                        className="font-mono-ui text-xs tracking-[0.15em] text-[#0B0D0A]/40 underline underline-offset-4 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/40 dark:hover:text-[#F5F3ED]"
                    >
                        CANCEL
                    </button>
                    <button type="submit" disabled={updateMutation.isPending} className={clsx(primaryButtonClass)}>
                        {updateMutation.isPending ? 'SAVING…' : (
                            <>
                                SAVE CHANGES
                                <Check className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrganisationEdit;
