import { AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const alertConfig: Record<AlertVariant, { classes: string; icon: ReactNode }> = {
  info: { classes: 'border-royal-100 bg-royal-50 text-royal-700', icon: <Info className="h-4 w-4" aria-hidden="true" /> },
  success: { classes: 'border-success-100 bg-success-50 text-success', icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> },
  warning: { classes: 'border-warning-100 bg-warning-50 text-warning', icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" /> },
  danger: { classes: 'border-danger-100 bg-danger-50 text-danger', icon: <XCircle className="h-4 w-4" aria-hidden="true" /> },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  action,
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  const config = alertConfig[variant];
  return (
    <div
      className={cn('ui-alert flex gap-3 rounded-md border p-3.5 text-sm', config.classes, className)}
      role="status"
      data-variant={variant}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="min-w-0 flex-1 leading-6">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5', 'text-[0.8125rem]')}>{children}</div>
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon && (
        <div className="ui-empty-icon mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-slate">
          {icon}
        </div>
      )}
      <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this information. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry} iconLeft={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('ui-skeleton relative overflow-hidden rounded bg-navy-50', className)}
      aria-hidden="true"
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading content">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function InlineLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </span>
  );
}
