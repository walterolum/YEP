import { ArrowLeft, Home, LockKeyhole, LogIn, SearchX, ServerCrash, TimerOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { buttonStyles } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

function ErrorShell({
  code,
  icon,
  title,
  description,
  children,
}: {
  code: string;
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy">
            {icon}
          </div>
          <p className="mt-5 text-2xs font-semibold uppercase tracking-[0.16em] text-slate">{code}</p>
          <h1 className="mt-2 text-display-md font-semibold text-ink">{title}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate">{description}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">{children}</div>
        </div>
      </main>
      <footer className="border-t border-line bg-white px-5 py-4 text-center text-2xs text-slate">
        YouthRise
      </footer>
    </div>
  );
}

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <ErrorShell
      code="Error 404"
      icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
      title="This page could not be found"
      description="The link may be out of date, or the page may have moved. Return to the website or sign in to your workspace."
    >
      <Link to="/" className={buttonStyles({ variant: 'primary' })}>
        <Home className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
      <Link to="/login" className={buttonStyles({ variant: 'outline' })}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Sign in
      </Link>
    </ErrorShell>
  );
}

export function ForbiddenPage() {
  useDocumentTitle('Access denied');
  return (
    <ErrorShell
      code="Error 403"
      icon={<LockKeyhole className="h-6 w-6" aria-hidden="true" />}
      title="You do not have access to this area"
      description="Your account does not include the role required for this page. If you believe this is a mistake, contact the programme administrator."
    >
      <Link to="/app" className={buttonStyles({ variant: 'primary' })}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Return to my workspace
      </Link>
      <Link to="/contact" className={buttonStyles({ variant: 'outline' })}>
        Contact support
      </Link>
    </ErrorShell>
  );
}

export function SessionExpiredPage() {
  useDocumentTitle('Session expired');
  return (
    <ErrorShell
      code="Session expired"
      icon={<TimerOff className="h-6 w-6" aria-hidden="true" />}
      title="Your session has ended"
      description="For safety, sessions expire after eight hours of inactivity. Sign in again to continue where you left off. Unsaved changes may have been lost."
    >
      <Link to="/login" className={buttonStyles({ variant: 'primary' })}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Sign in again
      </Link>
      <Link to="/" className={buttonStyles({ variant: 'outline' })}>
        Back to website
      </Link>
    </ErrorShell>
  );
}

export function AccountPendingPage() {
  useDocumentTitle('Account pending approval');
  return (
    <ErrorShell
      code="Pending Verification"
      icon={<TimerOff className="h-6 w-6 text-amber-500" aria-hidden="true" />}
      title="Your Registration is Pending Approval"
      description="Thank you for joining the Youth Empowerment Platform (YEP). In accordance with youth safety and cohort governance, your registration is currently being verified by an administrator. You will receive an email as soon as your account is approved."
    >
      <div className="w-full mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 text-left">
        <p className="font-bold text-amber-950">Registration Status: Under Administrative Review</p>
        <p className="mt-1">Assigned Cohort: East Africa Digital Innovators (18-35)</p>
        <p className="mt-0.5">Average verification window: 24 hours</p>
      </div>
      <Link to="/login" className={buttonStyles({ variant: 'primary' })}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Return to login
      </Link>
      <Link to="/contact" className={buttonStyles({ variant: 'outline' })}>
        Contact support
      </Link>
    </ErrorShell>
  );
}

export function AccountSuspendedPage() {
  useDocumentTitle('Account suspended');
  return (
    <ErrorShell
      code="Account Suspended"
      icon={<LockKeyhole className="h-6 w-6 text-red-500" aria-hidden="true" />}
      title="This Account Has Been Suspended"
      description="Access to the Youth Empowerment Platform for this profile has been suspended by an administrator. Historical programme and learning records remain preserved in accordance with DPPA 2019 standards."
    >
      <div className="w-full mb-4 rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-900 text-left">
        <p className="font-bold text-red-950">Notice of Administrative Action</p>
        <p className="mt-1">For appeals or data access requests under the Data Protection and Privacy Act 2019, please reach out directly to our compliance officers.</p>
      </div>
      <Link to="/contact" className={buttonStyles({ variant: 'primary' })}>
        Submit appeal
      </Link>
      <Link to="/login" className={buttonStyles({ variant: 'outline' })}>
        Sign in with different account
      </Link>
    </ErrorShell>
  );
}

export function UnauthorizedPage() {
  return <ForbiddenPage />;
}

export function RouteErrorPage() {
  const error = useRouteError();
  useDocumentTitle('Something went wrong');
  const isRouteError = isRouteErrorResponse(error);
  return (
    <ErrorShell
      code={isRouteError ? `Error ${error.status}` : 'Unexpected error'}
      icon={<ServerCrash className="h-6 w-6" aria-hidden="true" />}
      title="Something went wrong"
      description={
        isRouteError
          ? error.statusText || 'The page could not be loaded.'
          : 'An unexpected error interrupted this page. Try again, or return to the home page.'
      }
    >
      <button type="button" onClick={() => window.location.reload()} className={buttonStyles({ variant: 'primary' })}>
        Reload the page
      </button>
      <Link to="/" className={buttonStyles({ variant: 'outline' })}>
        <Home className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
    </ErrorShell>
  );
}
