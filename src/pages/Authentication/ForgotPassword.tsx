import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Boxes, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../../api/AuthApi';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: '' },
  });

  const [sent, setSent] = useState(false);

  const onFormSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data);
      setSent(true);
    } catch (error: any) {
      setError('root', {
        message:
          error.response?.data?.errors?.email?.[0] ||
          error.response?.data?.message ||
          'An unexpected error occurred. Please try again.',
      });
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
            N.03
          </span>
          <h1
            className="font-display -mt-8 max-w-md text-6xl font-bold leading-[0.98] tracking-tight text-[#F5F3ED] animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            Lost the
            <br />
            keys?
          </h1>
          <p
            className="font-mono-ui mt-6 max-w-sm text-xs leading-relaxed tracking-wide text-[#F5F3ED]/50 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            ENTER YOUR EMAIL AND WE&apos;LL SEND A LINK TO RESET YOUR PASSWORD.
          </p>
        </div>

        <div className="relative z-10 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="auth-stripe mb-6 h-1.5 w-24" />
          <p className="font-mono-ui text-[10px] tracking-[0.2em] text-[#F5F3ED]/40">
            © 2026 FINAL RETAIL — B2B DISTRIBUTION OS / ORG: MULTI-TENANT
          </p>
        </div>
      </div>

      {/* ────────────────────────────── Form Panel ───────────────────────────── */}
      <div className="relative flex lg:col-span-7 flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 xl:px-28">
        <div className="mx-auto w-full max-w-md">
          <div className="font-mono-ui mb-10 flex items-center justify-between text-[10px] tracking-[0.2em] text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40 animate-fade-up">
            <span>AUTH / FORGOT_PASSWORD</span>
            <span>—</span>
          </div>

          {sent ? (
            <div className="animate-fade-up">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border-2 border-[#0B0D0A] dark:border-[#F5F3ED]">
                <CheckCircle2 className="h-6 w-6 text-[#0B0D0A] dark:text-[#F5F3ED]" />
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight text-[#0B0D0A] dark:text-[#F5F3ED]">
                Check your inbox
              </h2>
              <p className="font-mono-ui mt-3 text-xs leading-relaxed tracking-wide text-[#0B0D0A]/60 dark:text-[#F5F3ED]/60">
                IF AN ACCOUNT EXISTS FOR THAT EMAIL, A RESET LINK IS ON ITS WAY.
                IT&apos;S VALID FOR 60 MINUTES.
              </p>
              <Link
                to="/login"
                className="font-mono-ui mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-[#FF5A1F] underline underline-offset-4 hover:text-[#e04f18]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                BACK TO SIGN IN
              </Link>
            </div>
          ) : (
            <>
              <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
                <h2 className="font-display text-4xl font-bold tracking-tight text-[#0B0D0A] dark:text-[#F5F3ED]">
                  Forgot password
                </h2>
                <p className="font-mono-ui mt-3 text-xs tracking-wide text-[#0B0D0A]/50 dark:text-[#F5F3ED]/50">
                  WE&apos;LL EMAIL YOU A LINK TO GET BACK IN.
                </p>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="mt-9 space-y-5" noValidate>
                {errors.root && (
                  <div className="animate-fade-up border-2 border-[#FF5A1F] bg-[#FF5A1F]/10 px-4 py-3 text-sm text-[#0B0D0A] dark:text-[#F5F3ED]">
                    <span className="font-mono-ui text-[10px] font-semibold tracking-[0.2em]">
                      REQUEST_FAILED —
                    </span>{' '}
                    {errors.root.message}
                  </div>
                )}

                <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
                  <label
                    htmlFor="email"
                    className="font-mono-ui mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B0D0A]/70 dark:text-[#F5F3ED]/70"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0B0D0A]/40 dark:text-[#F5F3ED]/40" />
                    <input
                      {...register('email', {
                        required: 'Email Address is required',
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="font-mono-ui w-full border-2 border-[#0B0D0A]/15 bg-transparent py-3 pl-10 pr-3.5 text-sm text-[#0B0D0A] outline-none transition-[box-shadow,border-color] placeholder:text-[#0B0D0A]/30 focus:border-[#FF5A1F] focus:shadow-[4px_4px_0_0_#FF5A1F] dark:border-[#F5F3ED]/20 dark:text-[#F5F3ED] dark:placeholder:text-[#F5F3ED]/30"
                    />
                  </div>
                  {errors.email && (
                    <p className="font-mono-ui mt-1.5 text-[11px] text-[#FF5A1F]">{errors.email.message}</p>
                  )}
                </div>

                <div className="animate-fade-up pt-2" style={{ animationDelay: '180ms' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex w-full items-center justify-center gap-2 border-2 border-[#0B0D0A] bg-[#0B0D0A] py-3.5 text-sm font-semibold tracking-wide text-[#F5F3ED] shadow-[6px_6px_0_0_#FF5A1F] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#FF5A1F] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_0_#FF5A1F] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#F5F3ED] dark:bg-[#F5F3ED] dark:text-[#0B0D0A]"
                  >
                    {isSubmitting ? (
                      'SENDING…'
                    ) : (
                      <>
                        SEND RESET LINK
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="animate-fade-up pt-2 text-center" style={{ animationDelay: '240ms' }}>
                  <Link
                    to="/login"
                    className="font-mono-ui inline-flex items-center gap-2 text-[11px] tracking-wide text-[#0B0D0A]/60 hover:text-[#0B0D0A] dark:text-[#F5F3ED]/60 dark:hover:text-[#F5F3ED]"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    BACK TO SIGN IN
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
