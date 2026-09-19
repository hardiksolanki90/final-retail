import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../lib/toast';

interface RegisterFormData {
  firstname: string;
  lastname: string;
  org_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  acceptTerms: boolean;
  usertype: number;
}

const initialFormData: RegisterFormData = {
  firstname: '',
  lastname: '',
  org_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  acceptTerms: false,
  usertype: 1,
};

const STEP_FIELDS: (keyof RegisterFormData)[][] = [
  ['firstname', 'lastname', 'org_name'],
  ['email', 'password', 'password_confirmation', 'acceptTerms'],
];

const MANIFEST_TAGS = ['ORG SETUP', 'ADMIN ACCESS', 'MULTI-TENANT'];

const inputClass =
  'font-mono-ui w-full border-2 border-[#0B0D0A]/15 bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-[#0B0D0A] outline-none transition-[box-shadow,border-color] placeholder:text-[#0B0D0A]/30 focus:border-[#FF5A1F] focus:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] dark:placeholder:text-[#F5F3ED]/30';

const labelClass =
  'font-mono-ui mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70';

const iconClass =
  'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40';

export const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    trigger,
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: initialFormData,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(0);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const isLastStep = step === STEP_FIELDS.length - 1;

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step] as any);
    if (valid) setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !isLastStep) e.preventDefault();
  };

  const onFormSubmit = async (data: RegisterFormData) => {
    try {
      // acceptTerms and org_name are client-only — not users-table columns,
      // not sent. org_name is stashed for the onboarding wizard to prefill.
      const { acceptTerms: _acceptTerms, org_name, ...rest } = data;
      const payload = {
        ...rest,
        usertype: 1, // Default to admin for organisation creation
      };

      const result = await registerUser(payload);

      if (result.success) {
        reset(initialFormData);
        if (org_name.trim()) sessionStorage.setItem('pending_org_name', org_name.trim());
        showToast.success('Account created! Complete your organisation details to continue.');
        navigate('/organisation/add', { replace: true });
      } else {
        setError('root', {
          message: result.message || 'Registration failed',
        });

        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof RegisterFormData, {
                message: messages[0],
              });
            }
          });
        }
      }
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
      });

      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as keyof RegisterFormData, {
              message: messages[0],
            });
          }
        });
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F5F3ED] dark:bg-[#0B0D0A]">
      {/* ─────────────────────── Brand / Manifest Panel ─────────────────────── */}
      <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden bg-[#0B0D0A] px-12 py-10">
        <div className="auth-dot-grid pointer-events-none absolute inset-0" />

        <div className="relative z-10 flex items-center gap-3 animate-fade-up">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[#F5F3ED]">
            <Boxes className="h-5 w-5 text-[#F5F3ED]" strokeWidth={2} />
          </div>
          <span className="font-mono-ui text-xs tracking-[0.25em] text-[#F5F3ED]/70">
            FINAL_RETAIL // RDMS
          </span>
        </div>

        <div className="relative z-10">
          <span
            className="font-mono-ui block select-none text-[7rem] font-medium leading-none text-[#F5F3ED]/10 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            N.02
          </span>
          <h1
            className="font-display -mt-8 max-w-md text-6xl font-bold leading-[0.98] tracking-tight text-[#F5F3ED] animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            Stand up your
            <br />
            organisation.
          </h1>
          <p
            className="font-mono-ui mt-6 max-w-sm text-xs leading-relaxed tracking-wide text-[#F5F3ED]/50 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            ONE ADMIN ACCOUNT PROVISIONS YOUR TENANT — ROLES, ROUTES &amp;
            REPORTING FOLLOW ONCE YOU'RE IN.
          </p>

          <ul className="mt-8 space-y-2 animate-fade-up" style={{ animationDelay: '320ms' }}>
            {MANIFEST_TAGS.map((tag) => (
              <li
                key={tag}
                className="font-mono-ui flex items-center gap-3 text-xs tracking-[0.15em] text-[#F5F3ED]/70"
              >
                <span className="h-1.5 w-1.5 shrink-0 bg-[#FF5A1F]" />
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="auth-stripe mb-6 h-1.5 w-24" />
          <p className="font-mono-ui text-[10px] tracking-[0.2em] text-[#F5F3ED]/40">
            © 2026 FINAL RETAIL — B2B DISTRIBUTION OS / ORG: MULTI-TENANT
          </p>
        </div>
      </div>

      {/* ────────────────────────────── Form Panel ───────────────────────────── */}
      <div className="relative flex lg:col-span-7 flex-col justify-center px-6 py-14 sm:px-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-xl">
          <div className="font-mono-ui mb-8 flex items-center justify-between text-[10px] tracking-[0.2em] text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40 animate-fade-up">
            <span>AUTH / REGISTER</span>
            <span>{String(step + 1).padStart(2, '0')} / 02</span>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
            <h2 className="font-display text-4xl font-bold tracking-tight text-[#0B0D0A] dark:text-[#F5F3ED]">
              {step === 0 ? 'Create account' : 'Set your credentials'}
            </h2>
            <p className="font-mono-ui mt-3 text-xs tracking-wide text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50">
              {step === 0
                ? 'YOUR IDENTITY & THE ORGANISATION YOU ARE STANDING UP.'
                : 'HOW YOU WILL SIGN BACK IN.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} onKeyDown={handleFormKeyDown} className="mt-8 space-y-5" noValidate>
            {errors.root && (
              <div className="animate-fade-up border-2 border-[#FF5A1F] bg-[#FF5A1F]/10 px-4 py-3 text-sm text-[#0B0D0A] dark:text-[#F5F3ED]">
                <span className="font-mono-ui text-[10px] font-semibold tracking-[0.2em]">
                  REGISTRATION_ERROR —
                </span>{' '}
                {errors.root.message}
              </div>
            )}

            {/* ── Step 1: Identity & Organisation ── */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <label htmlFor="firstname" className={labelClass}>
                      First Name *
                    </label>
                    <div className="relative">
                      <User className={iconClass} />
                      <input
                        {...register('firstname', {
                          required: 'First name is required',
                          validate: (v) => v.trim() !== '' || 'First name cannot be empty',
                        })}
                        id="firstname"
                        type="text"
                        placeholder="John"
                        className={inputClass}
                      />
                    </div>
                    {errors.firstname && (
                      <p className="font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]">{errors.firstname.message}</p>
                    )}
                  </div>

                  <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
                    <label htmlFor="lastname" className={labelClass}>
                      Last Name
                    </label>
                    <input
                      {...register('lastname')}
                      id="lastname"
                      type="text"
                      placeholder="Doe"
                      className="font-mono-ui w-full border-2 border-[#0B0D0A]/15 bg-transparent px-3.5 py-2.5 text-sm text-[#0B0D0A] outline-none transition-[box-shadow,border-color] placeholder:text-[#0B0D0A]/30 focus:border-[#FF5A1F] focus:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] dark:placeholder:text-[#F5F3ED]/30"
                    />
                  </div>
                </div>

                <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                  <label htmlFor="org_name" className={labelClass}>
                    Organisation Name *
                  </label>
                  <div className="relative">
                    <Boxes className={iconClass} />
                    <input
                      {...register('org_name', {
                        required: 'Organisation name is required',
                        validate: (v) => v.trim() !== '' || 'Organisation name cannot be empty',
                      })}
                      id="org_name"
                      type="text"
                      placeholder="Acme Distribution Co."
                      className={inputClass}
                    />
                  </div>
                  {errors.org_name && (
                    <p className="font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]">{errors.org_name.message}</p>
                  )}
                </div>

                <div className="animate-fade-up pt-2" style={{ animationDelay: '260ms' }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="group flex w-full items-center justify-center gap-2 border-2 border-[#0B0D0A] bg-[#0B0D0A] py-3.5 text-sm font-semibold tracking-wide text-[#F5F3ED] shadow-[6px_6px_0_0_#FF5A1F] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#FF5A1F] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_0_#FF5A1F] dark:border-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#0B0D0A]"
                  >
                    CONTINUE
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Credentials ── */}
            {step === 1 && (
              <>
                <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
                  <label htmlFor="email" className={labelClass}>
                    Work Email *
                  </label>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      className={inputClass}
                    />
                  </div>
                  {errors.email && (
                    <p className="font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
                    <label htmlFor="password" className={labelClass}>
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'At least 8 characters',
                          },
                        })}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B0D0A]/40 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/40 dark:hover:text-[#F5F3ED]"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <label htmlFor="password_confirmation" className={labelClass}>
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        {...register('password_confirmation', {
                          required: 'Please confirm password',
                          validate: (val) => val === watch('password') || 'Passwords do not match',
                        })}
                        id="password_confirmation"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B0D0A]/40 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/40 dark:hover:text-[#F5F3ED]"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]">
                        {errors.password_confirmation.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      {...register('acceptTerms', {
                        required: 'You must accept the Terms and Conditions to continue',
                      })}
                      id="acceptTerms"
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 rounded-none border-2 border-[#0B0D0A]/30 accent-[#FF5A1F] dark:border-[#F5F3ED]/30"
                    />
                    <span className="font-mono-ui text-[11px] tracking-wide text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70">
                      I AGREE TO THE TERMS AND CONDITIONS
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]">{errors.acceptTerms.message}</p>
                  )}
                </div>

                <div className="animate-fade-up flex items-center gap-3 pt-2" style={{ animationDelay: '180ms' }}>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="font-mono-ui flex items-center gap-2 px-2 text-xs font-semibold tracking-[0.15em] text-[#0B0D0A]/60 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/60 dark:hover:text-[#F5F3ED]"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex flex-1 items-center justify-center gap-2 border-2 border-[#0B0D0A] bg-[#0B0D0A] py-3.5 text-sm font-semibold tracking-wide text-[#F5F3ED] shadow-[6px_6px_0_0_#FF5A1F] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#FF5A1F] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_0_#FF5A1F] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#0B0D0A]"
                  >
                    {isSubmitting ? (
                      'CREATING ORGANISATION…'
                    ) : (
                      <>
                        CREATE ORGANISATION &amp; ACCOUNT
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            <div className="animate-fade-up pt-2 text-center" style={{ animationDelay: '360ms' }}>
              <p className="font-mono-ui text-[11px] tracking-wide text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
                ALREADY REGISTERED?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#FF5A1F] underline underline-offset-4 hover:text-[#e04f18]"
                >
                  SIGN IN
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
