import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import PhoneInput, { type Country as PhoneCountry } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Building2, MapPin, ShieldCheck, ClipboardCheck, ArrowRight, ArrowLeft, Check, Phone } from 'lucide-react';
import { useOrganisation, useUpdateOrganisation } from '../../hooks/Organisation/useOrganisation';
import { useCountryMasters } from '../../hooks/Country/useCountryMasters';
import { CountryMasterSelect } from '../../components/shared/CountryMasterSelect';
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

// Same predefined fiscal-year formats as the om-ionic onboarding wizard's
// financialYearFormat field.
const FISCAL_YEAR_OPTIONS = ['Jan-Dec', 'Apr-Mar', 'Jul-Jun'];

// ─── Ledger stepper: 3 stages, each field lives on exactly one stage ──────────

type FieldName = keyof OrganisationFormData;

const STEPS: { key: string; title: string; tag: string; blurb: string; icon: typeof Building2; fields: FieldName[] }[] = [
    {
        key: 'organisation',
        title: 'Organisation',
        tag: 'CORE_IDENTITY',
        blurb: 'WHO IS OPERATING THIS LEDGER.',
        icon: Building2,
        fields: ['country_master_id', 'org_name', 'org_company_id', 'org_currency', 'org_fasical_year'],
    },
    {
        key: 'location',
        title: 'Location',
        tag: 'REGISTERED_ADDRESS',
        blurb: 'WHERE OPERATIONS ARE BASED.',
        icon: MapPin,
        fields: ['org_phone', 'org_contact_person', 'org_contact_person_number', 'org_street1', 'org_street2', 'org_city', 'org_state', 'org_postal'],
    },
    {
        key: 'tax',
        title: 'Tax & Modules',
        tag: 'COMPLIANCE',
        blurb: 'REGISTRATION IDS & FEATURE FLAGS.',
        icon: ShieldCheck,
        fields: ['org_tax_id', 'gst_reg_date', 'is_batch_enabled', 'is_credit_limit_enabled'],
    },
    {
        key: 'review',
        title: 'Review',
        tag: 'FINAL_CHECK',
        blurb: 'CONFIRM BEFORE THIS GOES LIVE.',
        icon: ClipboardCheck,
        fields: [],
    },
];

export const OrganisationAdd: React.FC = () => {
    const navigate = useNavigate();
    const { checkAuthStatus, user, organisationComplete, organisation: authOrg } = useAuth();
    const { countryMasters } = useCountryMasters();
    const { organisation, isSuccess: orgFetched } = useOrganisation();
    const updateMutation = useUpdateOrganisation();
    const [step, setStep] = React.useState(0);
    const { register, handleSubmit, reset, trigger, setValue, watch, control, setError, formState: { errors } } = useForm<OrganisationFormData>({
        defaultValues: initialFormData
    });
    const formValues = watch();

    // De-duplicated currency list derived from the country master data itself —
    // no separate endpoint needed, and it covers every currency a real country
    // selection could produce (not just a hardcoded handful).
    const currencyOptions = React.useMemo(() => {
        const byCode = new Map<string, string>();
        countryMasters.forEach((master) => {
            if (master.currencyCode) byCode.set(master.currencyCode, master.currency || master.currencyCode);
        });
        return Array.from(byCode.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [countryMasters]);

    // Still needed for PhoneInput's defaultCountry — CountryMasterSelect owns
    // the ISO-code<->master mapping for the picker itself now.
    const codeByMasterId = React.useCallback(
        (id: string) => countryMasters.find((m) => String(m.id) === id)?.countryCode || '',
        [countryMasters]
    );

    // Derived live from the selected country's own tax profile (same data the
    // picker already fetched) — flips instantly on country change, no save
    // round-trip, and never guesses a system-specific default like "GSTIN".
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

    const reviewRows = React.useMemo(() => {
        const selectedCountry = countryMasters.find((m) => String(m.id) === formValues.country_master_id);
        const selectedCurrency = currencyOptions.find(([code]) => code === formValues.org_currency);
        const address = [formValues.org_street1, formValues.org_street2, formValues.org_city, formValues.org_state, formValues.org_postal]
            .filter(Boolean)
            .join(', ');
        const modules = [
            formValues.is_batch_enabled && 'Batch Tracking',
            formValues.is_credit_limit_enabled && 'Credit Limit',
        ].filter(Boolean).join(', ');

        return [
            ['Organisation', formValues.org_name],
            ['Company ID', formValues.org_company_id],
            ['Country', selectedCountry?.name ?? ''],
            ['Currency', selectedCurrency ? `${selectedCurrency[0]} — ${selectedCurrency[1]}` : (formValues.org_currency ?? '')],
            ['Fiscal Year', formValues.org_fasical_year ?? ''],
            ['Organisation Phone', formValues.org_phone],
            ['Contact', formValues.org_contact_person ?? ''],
            ['Address', address],
            [taxIdLabel, formValues.org_tax_id ?? ''],
            ['Modules', modules || 'None'],
        ] as const;
    }, [formValues, countryMasters, currencyOptions, taxIdLabel]);

    React.useEffect(() => {
        const orgData = organisation || authOrg || user?.organisation;
        const isComplete = orgData?.is_complete || organisationComplete;
        const hasData = Boolean(orgData?.id || orgData?.org_name || (user as any)?.organisation_id);
        
        if (hasData && isComplete) {
            navigate('/organisation/view', { replace: true });
        }
    }, [organisation, authOrg, user, organisationComplete, navigate]);

    React.useEffect(() => {
        if (!orgFetched) return;
        if (organisation) {
            reset({
                org_name: organisation.org_name || '',
                org_company_id: organisation.org_company_id || '',
                // Legacy orgs saved under the old dual-field onboarding form may
                // only have gstin_number set — fall back to it once so existing
                // data isn't orphaned now that there's a single tax-ID field.
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
        } else {
            // No organisation row yet — carry over the name captured at
            // registration, if any (see Register.tsx's PENDING_ORG_NAME_KEY).
            const pendingOrgName = sessionStorage.getItem('pending_org_name');
            if (pendingOrgName) {
                setValue('org_name', pendingOrgName);
                sessionStorage.removeItem('pending_org_name');
            }
        }
    }, [organisation, orgFetched, reset, setValue]);

    const onSubmit = async (data: OrganisationFormData) => {
        try {
            await updateMutation.mutateAsync(data);
            await checkAuthStatus();
            sessionStorage.removeItem('pending_org_name');
            showToast.success('Organisation profile saved');
            navigate('/organisation/view');
        } catch (error: any) {
            setError('root', { message: error.response?.data?.message || 'Failed to save organisation' });
        }
    };

    const isLastStep = step === STEPS.length - 1;

    const handleNext = async () => {
        const valid = await trigger(STEPS[step].fields as any);
        if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter' && !isLastStep) e.preventDefault();
    };

    const inputClass = "font-mono-ui w-full border-2 border-[#0B0D0A]/15 bg-transparent py-2.5 px-3.5 text-sm text-[#0B0D0A] outline-none transition-[box-shadow,border-color] placeholder:text-[#0B0D0A]/30 focus:border-[#FF5A1F] focus:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] dark:placeholder:text-[#F5F3ED]/30";
    const labelClass = "font-mono-ui mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70";
    const errorClass = "font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]";
    const phoneInputClass = "font-mono-ui border-2 border-[#0B0D0A]/15 bg-transparent py-2.5 pl-3.5 pr-11 text-sm text-[#0B0D0A] transition-[box-shadow,border-color] focus-within:border-[#FF5A1F] focus-within:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] focus:outline-none ring-0";

    return (
        <div className="min-h-screen grid lg:grid-cols-12 bg-[#F5F3ED] dark:bg-[#0B0D0A]">
            {/* ─────────────────────── Step Rail (ledger spine) ─────────────────────── */}
            <div className="relative hidden lg:flex lg:col-span-4 flex-col justify-between overflow-hidden bg-[#0B0D0A] px-12 py-10">
                <div className="auth-dot-grid pointer-events-none absolute inset-0" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border-2 border-[#F5F3ED]">
                        <Building2 className="h-5 w-5 text-[#F5F3ED]" strokeWidth={2} />
                    </div>
                    <span className="font-mono-ui text-xs tracking-[0.25em] text-[#F5F3ED]/70">
                        FINAL_RETAIL // ONBOARD
                    </span>
                </div>

                <div className="relative z-10">
                    <span key={step} className="font-mono-ui block select-none text-[7rem] font-medium leading-none text-[#F5F3ED]/10 animate-fade-up">
                        {String(step + 1).padStart(2, '0')}
                    </span>
                    <h1 key={STEPS[step].key} className="font-display -mt-8 max-w-md text-5xl font-bold leading-[0.98] tracking-tight text-[#F5F3ED] animate-fade-up">
                        {STEPS[step].title}
                    </h1>
                    <p className="font-mono-ui mt-5 max-w-sm text-xs leading-relaxed tracking-wide text-[#F5F3ED]/50">
                        {STEPS[step].blurb}
                    </p>

                    <ul className="mt-10 space-y-4">
                        {STEPS.map((s, i) => {
                            const StepIcon = s.icon;
                            const state = i < step ? 'done' : i === step ? 'current' : 'pending';
                            return (
                                <li key={s.key}>
                                    <button
                                        type="button"
                                        onClick={() => i < step && setStep(i)}
                                        disabled={i > step}
                                        className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed"
                                    >
                                        <span
                                            className={
                                                'flex h-8 w-8 shrink-0 items-center justify-center border-2 font-mono-ui text-[11px] transition-colors ' +
                                                (state === 'done'
                                                    ? 'border-[#FF5A1F] bg-[#FF5A1F] text-[#0B0D0A]'
                                                    : state === 'current'
                                                        ? 'border-[#FF5A1F] text-[#FF5A1F]'
                                                        : 'border-[#F5F3ED]/20 text-[#F5F3ED]/30')
                                            }
                                        >
                                            {state === 'done' ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <StepIcon className="h-3.5 w-3.5" strokeWidth={2} />}
                                        </span>
                                        <span
                                            className={
                                                'font-mono-ui text-xs tracking-[0.15em] ' +
                                                (state === 'pending' ? 'text-[#F5F3ED]/30' : 'text-[#F5F3ED]/80')
                                            }
                                        >
                                            {String(i + 1).padStart(2, '0')} — {s.tag}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="relative z-10">
                    <div className="auth-stripe mb-6 h-1.5 w-24" />
                    <p className="font-mono-ui text-[10px] tracking-[0.2em] text-[#F5F3ED]/40">
                        STEP {step + 1} OF {STEPS.length} — ALL FIELDS SAVE ON FINAL SUBMIT
                    </p>
                </div>
            </div>

            {/* ────────────────────────────── Form Panel ───────────────────────────── */}
            <div className="relative flex lg:col-span-8 flex-col justify-center px-6 py-14 sm:px-12 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-2xl">
                    <div className="font-mono-ui mb-8 flex items-center justify-between text-[10px] tracking-[0.2em] text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40">
                        <span>ORG / SETUP</span>
                        <span>{String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</span>
                    </div>

                    {/* mobile step dots (rail is desktop-only) */}
                    <div className="mb-6 flex items-center gap-2 lg:hidden">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.key}
                                className={
                                    'h-1.5 flex-1 ' + (i <= step ? 'bg-[#FF5A1F]' : 'bg-[#0B0D0A]/10 dark:bg-[#F5F3ED]/10')
                                }
                            />
                        ))}
                    </div>

                    <div className="animate-fade-up">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B0D0A] dark:text-[#F5F3ED]">
                            {STEPS[step].title}
                        </h2>
                        <p className="font-mono-ui mt-2 text-xs tracking-wide text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50">
                            {STEPS[step].blurb}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="mt-8" noValidate>
                        {errors.root && (
                            <div className="mb-6 border-2 border-[#FF5A1F] bg-[#FF5A1F]/10 px-4 py-3 text-sm text-[#0B0D0A] dark:text-[#F5F3ED]">
                                <span className="font-mono-ui text-[10px] font-semibold tracking-[0.2em]">SAVE_FAILED —</span>{' '}
                                {errors.root.message}
                            </div>
                        )}

                        {/* ── Step 1: Organisation ── */}
                        {step === 0 && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Country *</label>
                                    <Controller
                                        name="country_master_id"
                                        control={control}
                                        rules={{ required: 'Country is required' }}
                                        render={({ field }) => (
                                            <CountryMasterSelect
                                                variant="flags"
                                                value={field.value}
                                                onChange={(master) => {
                                                    field.onChange(master ? String(master.id) : '');
                                                    if (master?.currencyCode) setValue('org_currency', master.currencyCode);
                                                }}
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
                                    <label className={labelClass}>Organisation Name *</label>
                                    <input
                                        type="text"
                                        {...register('org_name', { required: 'Organisation name is required' })}
                                        className={inputClass}
                                        placeholder="Acme Distribution Co."
                                    />
                                    {errors.org_name && <p className={errorClass}>{errors.org_name.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Company ID *</label>
                                    <input
                                        type="text"
                                        {...register('org_company_id', { required: 'Company ID is required' })}
                                        className={inputClass}
                                        placeholder="CO-00142"
                                    />
                                    {errors.org_company_id && <p className={errorClass}>{errors.org_company_id.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Currency</label>
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
                                    <label className={labelClass}>Fiscal Year</label>
                                    <select {...register('org_fasical_year')} className={inputClass}>
                                        <option value="">Select fiscal year</option>
                                        {FISCAL_YEAR_OPTIONS.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Location ── */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Organisation Phone *</label>
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
                                    <label className={labelClass}>Contact Person</label>
                                    <input type="text" {...register('org_contact_person')} className={inputClass} placeholder="Full name" />
                                </div>

                                <div>
                                    <label className={labelClass}>Contact Person's Direct Line</label>
                                    <input type="text" {...register('org_contact_person_number')} className={inputClass} placeholder="Their personal phone" />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Street 1 *</label>
                                    <input
                                        type="text"
                                        {...register('org_street1', { required: 'Street is required' })}
                                        className={inputClass}
                                        placeholder="Street address line 1"
                                    />
                                    {errors.org_street1 && <p className={errorClass}>{errors.org_street1.message}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Street 2</label>
                                    <input type="text" {...register('org_street2')} className={inputClass} placeholder="Street address line 2 (optional)" />
                                </div>

                                <div>
                                    <label className={labelClass}>City</label>
                                    <input type="text" {...register('org_city')} className={inputClass} placeholder="City" />
                                </div>

                                <div>
                                    <label className={labelClass}>State / Province</label>
                                    <input type="text" {...register('org_state')} className={inputClass} placeholder="State" />
                                </div>

                                <div>
                                    <label className={labelClass}>Postal Code</label>
                                    <input type="text" {...register('org_postal')} className={inputClass} placeholder="ZIP / postal code" />
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Tax & Modules ── */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>{taxIdLabel}</label>
                                        <input type="text" {...register('org_tax_id')} className={inputClass} placeholder="Registration ID" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>{taxRegDateLabel}</label>
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
                                    <span className={labelClass}>Feature Modules</span>
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
                        )}

                        {/* ── Step 4: Review ── */}
                        {step === 3 && (
                            <div className="border-2 border-[#0B0D0A]/15 dark:border-[#F5F3ED]/20">
                                {reviewRows.map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between gap-4 border-b-2 border-[#0B0D0A]/10 px-4 py-3 last:border-b-0 dark:border-[#F5F3ED]/10"
                                    >
                                        <span className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50">
                                            {label}
                                        </span>
                                        <span className="font-mono-ui text-right text-sm text-[#0B0D0A] dark:text-[#F5F3ED]">
                                            {value || '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Nav ── */}
                        <div className="mt-10 flex items-center justify-between border-t-2 border-[#0B0D0A]/10 pt-6 dark:border-[#F5F3ED]/10">
                            {step > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep((s) => Math.max(s - 1, 0))}
                                    className="font-mono-ui flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-[#0B0D0A]/60 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/60 dark:hover:text-[#F5F3ED]"
                                >
                                    <ArrowLeft className="h-4 w-4" /> BACK
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => navigate('/organisation/view')}
                                    className="font-mono-ui text-xs tracking-[0.15em] text-[#0B0D0A]/40 underline underline-offset-4 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/40 dark:hover:text-[#F5F3ED]"
                                >
                                    CANCEL
                                </button>
                            )}

                            {isLastStep ? (
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="group flex items-center gap-2 border-2 border-[#0B0D0A] bg-[#0B0D0A] px-6 py-3 text-sm font-semibold tracking-wide text-[#F5F3ED] shadow-[6px_6px_0_0_#FF5A1F] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#FF5A1F] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_0_#FF5A1F] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#0B0D0A]"
                                >
                                    {updateMutation.isPending ? 'SAVING…' : (
                                        <>
                                            SAVE & SUBMIT
                                            <Check className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="group flex items-center gap-2 border-2 border-[#0B0D0A] bg-[#0B0D0A] px-6 py-3 text-sm font-semibold tracking-wide text-[#F5F3ED] shadow-[6px_6px_0_0_#FF5A1F] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#FF5A1F] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_0_#FF5A1F] dark:border-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#0B0D0A]"
                                >
                                    CONTINUE
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrganisationAdd;
