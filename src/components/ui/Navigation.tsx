import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

/**
 * `items` accepts [value, label] pairs expressed as objects or as plain strings.
 * Plain strings are normalised to `{ id, label }` — they must never be spread,
 * which is what turned a tab label into "v e / i l / o r".
 */
export type TabInput = TabItem | string;

function normaliseTabs(items: TabInput[]): TabItem[] {
  return (items ?? []).map((item) => (typeof item === 'string' ? { id: item, label: item } : item));
}

export function Tabs({
  items: rawItems,
  active,
  onChange,
  ariaLabel,
  className,
}: {
  items: TabInput[];
  active: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  const items = normaliseTabs(rawItems);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((item) => item.id === active);
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = items[(index + direction + items.length) % items.length];
      onChange(next.id);
      document.getElementById(`tab-${next.id}`)?.focus();
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onChange(items[0].id);
      document.getElementById(`tab-${items[0].id}`)?.focus();
    }
    if (event.key === 'End') {
      event.preventDefault();
      const last = items[items.length - 1];
      onChange(last.id);
      document.getElementById(`tab-${last.id}`)?.focus();
    }
  }

  return (
    <div className={cn('ui-tabs overflow-x-auto border-b border-line', className)} role="tablist" aria-label={ariaLabel} onKeyDown={handleKeyDown}>
      <div className="flex min-w-max gap-1">
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.id)}
              data-active={selected || undefined}
              className={cn(
                'ui-tab relative -mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-[0.8125rem] font-semibold transition-colors',
                selected ? 'border-royal text-royal' : 'border-transparent text-slate hover:border-line hover:text-ink',
              )}
            >
              {item.label}
              {typeof item.count === 'number' && (
                <span className={cn('rounded px-1.5 py-0.5 text-2xs', selected ? 'bg-royal-50 text-royal' : 'bg-canvas text-slate')}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabPanel({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  if (id !== active) return null;
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className="animate-fade-in">
      {children}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  totalLabel,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  totalLabel?: string;
}) {
  if (pageCount <= 1) return totalLabel ? <p className="text-xs text-slate">{totalLabel}</p> : null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === pageCount || Math.abs(value - page) <= 1,
  );

  return (
    <nav className="ui-pagination flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      {totalLabel ? <p className="text-xs text-slate">{totalLabel}</p> : <span />}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="ui-page-btn inline-flex h-8 w-8 items-center justify-center rounded border border-line text-slate transition hover:bg-canvas disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        {pages.map((value, index) => {
          const previous = pages[index - 1];
          return (
            <span key={value} className="flex items-center gap-1">
              {previous && value - previous > 1 && <span className="px-1 text-xs text-slate">…</span>}
              <button
                type="button"
                onClick={() => onChange(value)}
                aria-current={value === page ? 'page' : undefined}
                data-current={value === page || undefined}
                className={cn(
                  'ui-page-btn inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-xs font-semibold transition',
                  value === page
                    ? 'border-navy bg-navy text-white'
                    : 'border-line bg-white text-slate hover:bg-canvas hover:text-ink',
                )}
              >
                {value}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === pageCount}
          className="ui-page-btn inline-flex h-8 w-8 items-center justify-center rounded border border-line text-slate transition hover:bg-canvas disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="ui-breadcrumbs">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate">
        <li>
          <Link to="/app" className="inline-flex items-center gap-1 transition hover:text-ink" aria-label="Dashboard home">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden="true" />
            {item.href ? (
              <Link to={item.href} className="transition hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
