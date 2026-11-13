import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('ui-card rounded-2xl border border-slate-100 bg-white shadow-xs', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
  titleAs: Title = 'h2',
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  titleAs?: 'h2' | 'h3' | 'h4';
}) {
  return (
    <div className={cn('ui-card-header flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4', className)}>
      <div className="min-w-0">
        <Title className="ui-card-title text-card font-semibold tracking-tight text-ink">{title}</Title>
        {description && <div className="mt-1 text-[0.8125rem] leading-5 text-slate">{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('ui-card-body p-5', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('ui-card-footer flex flex-wrap items-center gap-3 border-t border-line bg-canvas/50 px-5 py-3', className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className={cn('eyebrow mb-3', align === 'center' && 'justify-center')}>
            <span className="h-px w-6 bg-teal" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-display-md font-semibold text-ink">{title}</h2>
        {description && <p className="mt-3 text-[0.9875rem] leading-7 text-slate">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  className,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: { value: string; direction?: 'up' | 'down' | 'flat' };
  icon?: ReactNode;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'ui-stat relative overflow-hidden rounded-2xl border p-5 transition hover:shadow-md',
        emphasis
          ? 'border-navy-800 bg-navy-900 text-white shadow-lg'
          : 'border-slate-100 bg-white shadow-xs',
        className,
      )}
      data-emphasis={emphasis || undefined}
    >
      {emphasis && (
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan/15 blur-2xl"
          aria-hidden="true"
        />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <p className={cn('text-2xs font-semibold uppercase tracking-[0.12em]', emphasis ? 'text-navy-100' : 'text-slate-500')}>
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              'ui-stat-icon flex h-9 w-9 items-center justify-center rounded-xl',
              emphasis ? 'bg-cyan/10 text-cyan-300 ring-1 ring-cyan/20' : 'bg-blue-50 text-blue-600',
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          'ui-stat-value relative mt-3 text-2xl font-black leading-none tracking-tight',
          emphasis ? 'text-white' : 'text-slate-900',
        )}
      >
        {value}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-bold',
              emphasis ? 'bg-cyan/10 text-cyan-200 ring-1 ring-cyan/20' : 'bg-emerald-50 text-emerald-700',
            )}
          >
            {trend.direction === 'down' ? (
              <TrendingUp className="h-3 w-3 rotate-180" aria-hidden="true" />
            ) : trend.direction === 'flat' ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            )}
            {trend.value}
          </span>
        )}
        {hint && <p className={cn('text-xs leading-5', emphasis ? 'text-navy-100' : 'text-slate-500')}>{hint}</p>}
      </div>
    </div>
  );
}
