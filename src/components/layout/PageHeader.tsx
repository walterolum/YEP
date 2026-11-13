import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_NAV } from '@/components/navigation/navConfig';
import { Breadcrumbs } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

function useRouteBreadcrumbs() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return [];

  const items = ROLE_NAV[user.role].flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.label })),
  );

  const match = items
    .filter((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];

  if (!match) return [];

  return [
    ...(match.group ? [{ label: match.group }] : []),
    { label: match.label },
  ];
}

export function PageHeader({ title, description, eyebrow, actions, breadcrumbs, className }: PageHeaderProps) {
  const routeCrumbs = useRouteBreadcrumbs();

  return (
    <header className={cn('app-page-header mb-6', className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="app-breadcrumb-chip">
          {breadcrumbs ?? <Breadcrumbs items={routeCrumbs} />}
        </div>
        <span className="hidden items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-slate-400 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
          YouthRise workspace
        </span>
      </div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-3xl">
          {eyebrow && (
            <p className="app-eyebrow-chip mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-royal" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h1 className="app-page-title">{title}</h1>
          {description && <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-6 text-slate">{description}</p>}
        </div>
        {actions && <div className="app-page-actions flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
    </header>
  );
}

export function PageSection({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={cn('space-y-4', className)} aria-labelledby={id ? `${id}-heading` : undefined}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className="h-5 w-1 shrink-0 rounded-full bg-royal"
              aria-hidden="true"
            />
            <h2 id={id ? `${id}-heading` : undefined} className="app-section-title">
              {title}
            </h2>
          </div>
          {description && <p className="mt-1 pl-3.5 text-[0.8125rem] leading-5 text-slate">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function InlineLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-1 text-sm font-semibold text-royal transition hover:text-royal-700',
        className,
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
