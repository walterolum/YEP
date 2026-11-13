import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  aside,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs?: { label: string; to?: string }[];
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('surface-dark relative overflow-hidden border-b border-white/10', className)}>
      <div className="absolute inset-0 grid-paper-dark opacity-45" aria-hidden="true" />
      <div className="container-editorial relative py-10 sm:py-14">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-2xs text-navy-200">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-navy-200/50" aria-hidden="true" />
                  {item.to ? (
                    <Link to={item.to} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-white" aria-current="page">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow-light mb-3">
              <span className="h-px w-6 bg-cyan-300" aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 className="text-display-md font-semibold text-white">{title}</h1>
            <p className="mt-4 max-w-2xl text-[0.9875rem] leading-7 text-navy-100">{description}</p>
          </div>
          {aside && <div className="lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('rounded-lg border border-warning-100 bg-warning-50 px-3 py-2 text-2xs leading-5 text-warning', className)}>
      <span className="font-semibold">Demonstration content: </span>
      {children}
    </p>
  );
}

export function PublicCTA({
  title = 'Ready to learn, collaborate and build?',
  description = 'Join a proposed cohort, explore the programme model and see how learning can lead to a documented community project.',
  primaryLabel = 'Join YouthRise',
  primaryTo = '/register',
  secondaryLabel = 'Explore programmes',
  secondaryTo = '/programmes',
}: {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}) {
  return (
    <section className="surface-dark border-t border-white/10">
      <div className="absolute inset-0 grid-paper-dark opacity-40" aria-hidden="true" />
      <div className="container-editorial relative grid gap-8 py-14 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow-light mb-3">
            <span className="h-px w-6 bg-cyan-300" aria-hidden="true" />
            Take part
          </p>
          <h2 className="max-w-2xl text-display-md font-semibold text-white">{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-navy-100">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            to={primaryTo}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-electric px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-sm ring-1 ring-inset ring-white/20 transition hover:bg-royal-400 active:bg-electric-600"
          >
            {primaryLabel}
          </Link>
          <Link
            to={secondaryTo}
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan/50 hover:bg-white/10"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-editorial flex flex-wrap items-center justify-between gap-2 py-3 text-2xs text-navy-200">
          <p>Proposed programme. Participation is subject to eligibility, capacity and programme confirmation.</p>
          <p>No fee is represented in this demonstration.</p>
        </div>
      </div>
    </section>
  );
}
