import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { titleCase } from '@/utils/format';

type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'teal' | 'navy' | 'outline';

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: 'bg-canvas text-slate border-line',
  info: 'bg-royal-50 text-royal-700 border-royal-100',
  success: 'bg-success-50 text-success border-success-100',
  warning: 'bg-warning-50 text-warning border-warning-100',
  danger: 'bg-danger-50 text-danger border-danger-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  navy: 'bg-navy-50 text-navy border-navy-100',
  outline: 'bg-white text-slate border-line',
};

export function Badge({
  children,
  variant = 'neutral',
  className,
  icon,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'ui-badge inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.06em]',
        badgeVariants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const statusMap: Record<string, { variant: BadgeVariant; label?: string }> = {
  active: { variant: 'success' },
  suspended: { variant: 'danger' },
  invited: { variant: 'info' },
  open: { variant: 'success' },
  waitlist: { variant: 'warning' },
  closed: { variant: 'neutral' },
  draft: { variant: 'neutral' },
  published: { variant: 'success' },
  archived: { variant: 'neutral' },
  upcoming: { variant: 'info' },
  completed: { variant: 'success' },
  cancelled: { variant: 'neutral' },
  not_started: { variant: 'neutral', label: 'Not started' },
  in_progress: { variant: 'info', label: 'In progress' },
  submitted: { variant: 'info' },
  under_review: { variant: 'warning', label: 'Under review' },
  revision: { variant: 'danger', label: 'Revision required' },
  approved: { variant: 'success' },
  available: { variant: 'info' },
  graded: { variant: 'success' },
  locked: { variant: 'neutral' },
  reopened: { variant: 'warning' },
  valid: { variant: 'success' },
  revoked: { variant: 'danger' },
  pending: { variant: 'warning' },
  on_track: { variant: 'success', label: 'On track' },
  at_risk: { variant: 'warning', label: 'At risk' },
  reported: { variant: 'info' },
  triaged: { variant: 'info' },
  investigating: { variant: 'warning' },
  resolved: { variant: 'success' },
  escalated: { variant: 'danger' },
  received: { variant: 'info' },
  identity_check: { variant: 'warning', label: 'Identity check' },
  rejected: { variant: 'danger' },
  nominated: { variant: 'info' },
  accepted: { variant: 'success' },
  declined: { variant: 'neutral' },
  registered: { variant: 'teal' },
  verified: { variant: 'success' },
  none: { variant: 'neutral' },
  public: { variant: 'success' },
  limited: { variant: 'warning' },
  hidden: { variant: 'neutral' },
  not_looking: { variant: 'neutral', label: 'Not looking' },
  undisclosed: { variant: 'neutral' },
  low: { variant: 'neutral' },
  medium: { variant: 'warning' },
  high: { variant: 'danger' },
  critical: { variant: 'danger' },
  success: { variant: 'success' },
  denied: { variant: 'danger' },
  failed: { variant: 'danger' },
  withdrawn: { variant: 'neutral' },
  waitlisted: { variant: 'warning' },
};

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  const config = statusMap[status] ?? { variant: 'neutral' as const };
  const text = label ?? config.label ?? titleCase(status);
  return (
    <Badge variant={config.variant} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {text}
    </Badge>
  );
}
