import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
  MailCheck,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/app/providers/AuthProvider';
import {
  Alert,
  Button,
  Checkbox,
  Field,
  Input,
  PasswordInput,
  Select,
  useToast,
} from '@/components/ui';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/demoAccounts';
import { ROLE_ACCENT } from '@/components/navigation/navConfig';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/apiClient';
import { ROLE_HOME } from '@/types';
import { errorMessage } from '@/features/app/shared';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

const emailRule = z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.');

const passwordRule = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[A-Z]/, 'Include at least one uppercase letter.')
  .regex(/[a-z]/, 'Include at least one lowercase letter.')
  .regex(/[0-9]/, 'Include at least one number.');

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formError, setFormError] = useState('');
  const [demoOpen, setDemoOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  async function onSubmit(values: LoginValues) {
    setFormError('');
    try {
      const session = await login(values.email, values.password, values.remember);
      toast({ title: `Welcome back, ${session.user.name.split(' ')[0]}`, variant: 'success' });
      navigate(ROLE_HOME[session.user.role], { replace: true });
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  function fillDemoAccount(email: string) {
    setValue('email', email, { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
    setFormError('');
    setDemoOpen(false);
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">Welcome Back</h1>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
        Sign in to your account to continue
      </p>

      {formError && (
        <Alert variant="danger" className="mt-5" title="Could not sign in">
          {formError}
        </Alert>
      )}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email address" htmlFor="login-email" error={errors.email?.message} required>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            prefixIcon={<Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field label="Password" htmlFor="login-password" error={errors.password?.message} required>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Enter your password"
            prefixIcon={<LockKeyhole className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox label="Remember me" {...register('remember')} />
          <Link to="/forgot-password" className="text-[0.8125rem] font-semibold text-royal hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="electric" fullWidth size="lg" loading={isSubmitting} className="bg-[#0B2545] hover:bg-[#07192F] shadow-md">
          {isSubmitting ? 'Signing in…' : 'Sign In'}
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      {/* Or Divider matching Image 2 */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-xs text-slate-400">or</span>
      </div>

      {/* Social Buttons matching Image 2 */}
      <div className="grid gap-2.5">
        <button
          type="button"
          onClick={() => fillDemoAccount('amara@yep.demo')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-xs"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => fillDemoAccount('amara@yep.demo')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-xs"
        >
          <MicrosoftIcon className="h-4 w-4" />
          Continue with Microsoft
        </button>
      </div>

      {/* Demonstration accounts quick helper */}
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
        <button
          type="button"
          onClick={() => setDemoOpen((current) => !current)}
          aria-expanded={demoOpen}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-royal-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            1-Click Demo Accounts
          </span>
          <span className="text-2xs font-semibold text-royal-600">{demoOpen ? 'Hide' : 'Select'}</span>
        </button>
        {demoOpen && (
          <ul className="scrollbar-thin mt-2.5 max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount(account.email)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-royal hover:bg-royal/5 shadow-xs"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-ink">
                      {ROLE_ACCENT[account.role].short} · {account.name}
                    </span>
                    <span className="mt-0.5 block truncate text-2xs text-slate">{account.email}</span>
                  </span>
                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-royal" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-royal hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

const countries = ['Uganda', 'Kenya', 'Rwanda', 'Tanzania', 'Burundi', 'South Sudan', 'DR Congo', 'Other'];

/** Mirrors the server-side 18-35 eligibility rule. */
function isYouthAge(value: string) {
  if (!value) return false;
  const dob = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - dob.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age >= 18 && age <= 35;
}

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name.').max(80, 'Keep your name under 80 characters.'),
    email: emailRule,
    phone: z
      .string()
      .trim()
      .max(24, 'Enter a shorter phone number.')
      .optional()
      .or(z.literal('')),
    country: z.string().min(1, 'Select your country of residence.'),
    dateOfBirth: z
      .string()
      .min(1, 'Enter your date of birth.')
      .refine(isYouthAge, 'YEP is open to young people aged 18 to 35.'),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    interests: z.array(z.string()),
    privacyAccepted: z.boolean().refine((value) => value, {
      message: 'Accept the privacy notice and participation terms to continue.',
    }),
    communicationsConsent: z.boolean().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  useDocumentTitle('Create an account');
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      country: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
      interests: ['Digital skills'],
      privacyAccepted: false,
      communicationsConsent: false,
    },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError('');
    try {
      await createAccount({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        country: values.country,
        dateOfBirth: values.dateOfBirth,
        password: values.password,
        interests: values.interests,
        privacyAccepted: values.privacyAccepted,
        communicationsConsent: Boolean(values.communicationsConsent),
      });
      navigate('/verify-email', { replace: true, state: { email: values.email } });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setFormError(Object.values(error.fieldErrors).join(' '));
      } else {
        setFormError(errorMessage(error));
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">Create Account</h1>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
        Start your journey with YEP
      </p>

      {formError && (
        <Alert variant="danger" className="mt-5" title="Could not create the account">
          {formError}
        </Alert>
      )}

      <form className="mt-5 space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Full name" htmlFor="register-name" error={errors.fullName?.message} required>
          <Input
            id="register-name"
            autoComplete="name"
            placeholder="Enter your full name"
            prefixIcon={<User className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            invalid={Boolean(errors.fullName)}
            {...register('fullName')}
          />
        </Field>

        <Field label="Email address" htmlFor="register-email" error={errors.email?.message} required>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.org"
            prefixIcon={<Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Phone number" htmlFor="register-phone" error={errors.phone?.message} optional>
            <Input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+256 700 000000"
              prefixIcon={<Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />}
              invalid={Boolean(errors.phone)}
              {...register('phone')}
            />
          </Field>

          <Field label="Country of residence" htmlFor="register-country" error={errors.country?.message} required>
            <Select id="register-country" invalid={Boolean(errors.country)} {...register('country')}>
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Date of birth"
            htmlFor="register-date-of-birth"
            error={errors.dateOfBirth?.message}
            hint="YEP is open to young people aged 18 to 35."
            required
          >
            <Input
              id="register-date-of-birth"
              type="date"
              autoComplete="bday"
              invalid={Boolean(errors.dateOfBirth)}
              {...register('dateOfBirth')}
            />
          </Field>
        </div>

        <Field label="Password" htmlFor="register-password" error={errors.password?.message} required>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="Create a password"
            prefixIcon={<LockKeyhole className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            invalid={Boolean(errors.password)}
            onFocus={() => setShowPasswordHint(true)}
            {...register('password')}
          />
          {showPasswordHint && (
            <p className="mt-1 text-2xs text-slate-500">
              Password must be at least 8 characters with letters and numbers.
            </p>
          )}
        </Field>

        <Field label="Confirm password" htmlFor="register-confirm" error={errors.confirmPassword?.message} required>
          <PasswordInput
            id="register-confirm"
            autoComplete="new-password"
            placeholder="Confirm password"
            prefixIcon={<LockKeyhole className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </Field>

        <Checkbox
          label={
            <>
              I agree to the{' '}
              <Link to="/terms" className="font-semibold text-royal hover:underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-semibold text-royal hover:underline">
                Privacy Policy
              </Link>
            </>
          }
          error={errors.privacyAccepted?.message}
          {...register('privacyAccepted')}
        />

        <Button type="submit" variant="electric" fullWidth size="lg" loading={isSubmitting} className="bg-[#0B2545] hover:bg-[#07192F] shadow-md">
          {isSubmitting ? 'Creating account…' : 'Create Account'}
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      {/* Or Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-xs text-slate-400">or</span>
      </div>

      {/* Social Registration matching Image 2 */}
      <div className="grid gap-2.5">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-xs"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-xs"
        >
          <MicrosoftIcon className="h-4 w-4" />
          Continue with Microsoft
        </button>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-royal hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Forgot password                                                     */
/* ------------------------------------------------------------------ */

const forgotSchema = z.object({ email: emailRule });
type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });

  async function onSubmit(values: ForgotValues) {
    setFormError('');
    try {
      await authService.requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  return (
    <div>
      <p className="eyebrow mb-2">Account recovery</p>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-slate">
        Enter the email associated with your account. For security, the response is the same whether or not an account
        exists.
      </p>

      {formError && (
        <Alert variant="danger" className="mt-5">
          {formError}
        </Alert>
      )}

      {sent ? (
        <div className="mt-6 space-y-4">
          <Alert variant="success" title="Check your inbox">
            If an account exists for {getValues('email')}, a reset link has been sent. In this demonstration, use the link
            below.
          </Alert>
          <Link
            to="/reset-password?token=demo-reset-token"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm ring-1 ring-inset ring-white/20 transition hover:bg-royal-400"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Open demonstration reset link
          </Link>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full text-center text-[0.8125rem] font-semibold text-slate hover:text-ink"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Email address" htmlFor="forgot-email" error={errors.email?.message} required>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.org"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>
          <Button type="submit" variant="electric" fullWidth size="lg" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-slate hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to sign in
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reset password                                                      */
/* ------------------------------------------------------------------ */

const resetSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [complete, setComplete] = useState(false);
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetValues) {
    setFormError('');
    try {
      await authService.resetPassword(token, values.password);
      setComplete(true);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  return (
    <div>
      <p className="eyebrow mb-2">Account recovery</p>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink">Choose a new password</h1>

      {!token && (
        <Alert variant="warning" className="mt-5" title="Missing reset token">
          This link is incomplete. Request a new reset link from the{' '}
          <Link to="/forgot-password" className="font-semibold underline">
            password recovery page
          </Link>
          .
        </Alert>
      )}

      {formError && (
        <Alert variant="danger" className="mt-5" title="Could not reset the password">
          {formError}
        </Alert>
      )}

      {complete ? (
        <div className="mt-6 space-y-4">
          <Alert variant="success" title="Demonstration password updated">
            In a production system the reset token would be single-use and the password would be stored only as a salted
            hash. Sign in with your new password to continue.
          </Alert>
          <Link
            to="/login"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm ring-1 ring-inset ring-white/20 transition hover:bg-royal-400"
          >
            Go to sign in
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field
            label="New password"
            htmlFor="reset-password"
            error={errors.password?.message}
            hint="At least 8 characters with upper and lower case letters and a number."
            required
          >
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="reset-confirm" error={errors.confirmPassword?.message} required>
            <PasswordInput
              id="reset-confirm"
              autoComplete="new-password"
              invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
          </Field>
          <Button type="submit" variant="electric" fullWidth size="lg" loading={isSubmitting} disabled={!token}>
            Update password
          </Button>
          {token === 'expired' && (
            <p className="text-xs text-danger">
              This demonstration token has expired. Request a new link to continue.
            </p>
          )}
        </form>
      )}

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-slate hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to sign in
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Verify email                                                        */
/* ------------------------------------------------------------------ */

const verifySchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'Enter the six-digit code.')
    .regex(/^\d{6}$/, 'The code contains six digits.'),
});

type VerifyValues = z.infer<typeof verifySchema>;

export function VerifyEmailPage() {
  useDocumentTitle('Verify your email');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formError, setFormError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyValues>({ resolver: zodResolver(verifySchema), defaultValues: { code: '' } });

  async function onSubmit(values: VerifyValues) {
    setFormError('');
    try {
      await authService.verifyEmail(values.code);
      toast({ title: 'Email verified', description: 'Your demonstration account is ready.', variant: 'success' });
      navigate(user ? ROLE_HOME[user.role] : '/login', { replace: true });
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  async function resend() {
    setResending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setResending(false);
    setResent(true);
  }

  return (
    <div>
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-cyan/25 bg-cyan/10 text-cyan-300">
        <MailCheck className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="eyebrow mb-2">Verify your email</p>
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink">Enter your code</h1>
      <p className="mt-2 text-sm leading-6 text-slate">
        We would normally send a six-digit code to {user?.email ?? 'your email address'}. In this demonstration, use{' '}
        <code className="rounded bg-canvas px-1 py-0.5 font-mono text-xs">123456</code>.
      </p>

      {formError && (
        <Alert variant="danger" className="mt-5" title="Verification failed">
          {formError}
        </Alert>
      )}
      {resent && (
        <Alert variant="info" className="mt-5">
          A new demonstration code would be sent. Use 123456 to continue.
        </Alert>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Six-digit code" htmlFor="verify-code" error={errors.code?.message} required>
          <Input
            id="verify-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-[0.4em]"
            invalid={Boolean(errors.code)}
            {...register('code')}
          />
        </Field>
        <Button type="submit" variant="electric" fullWidth size="lg" loading={isSubmitting}>
          Verify and continue
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[0.8125rem]">
        <button
          type="button"
          onClick={() => void resend()}
          disabled={resending}
          className="font-semibold text-royal hover:underline disabled:opacity-60"
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
        {user && (
          <Link to={ROLE_HOME[user.role]} className="inline-flex items-center gap-1 font-semibold text-slate hover:text-ink">
            Skip for now
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
        <p className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.08em] text-cyan-200">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Production behaviour
        </p>
        <p className="mt-1.5 text-2xs leading-5 text-navy-200">
          Verification codes expire, are rate-limited and are never returned by the API. Email ownership is confirmed
          before sensitive account actions are enabled.
        </p>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-2xs text-slate">
        <CheckCircle2 className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
        Your demonstration data stays in this browser.
      </p>
    </div>
  );
}
