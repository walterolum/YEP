import { AlertTriangle, Inbox, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Button, EmptyState, Input, useToast } from '@/components/ui';
import { ApiError } from '@/services/apiClient';
import { cn } from '@/utils/cn';
import type { User } from '@/types';

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

interface RunOptions {
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  onSuccess?: () => void;
}

/**
 * Small wrapper around asynchronous service calls so every screen reports
 * pending, success and failure states consistently.
 */
export function useAsyncAction() {
  const { toast } = useToast();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(key: string, action: () => Promise<T>, options: RunOptions = {}): Promise<T | undefined> => {
      setPendingKey(key);
      try {
        const result = await action();
        if (options.successTitle) {
          toast({
            title: options.successTitle,
            description: options.successDescription,
            variant: 'success',
          });
        }
        options.onSuccess?.();
        return result;
      } catch (error) {
        toast({
          title: options.errorTitle ?? 'The action could not be completed',
          description: errorMessage(error),
          variant: 'error',
        });
        return undefined;
      } finally {
        setPendingKey(null);
      }
    },
    [toast],
  );

  return {
    run,
    pendingKey,
    isPending: (key?: string) => (key ? pendingKey === key : pendingKey !== null),
  };
}

export function usePagination<T>(items: T[], perPage = 8) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const validPage = Math.min(Math.max(1, page), pageCount);

  const pageItems = useMemo(
    () => items.slice((validPage - 1) * perPage, validPage * perPage),
    [items, validPage, perPage],
  );

  return { page: validPage, setPage, pageCount, pageItems, total: items.length };
}

export function FilterToolbar({
  query,
  onQueryChange,
  placeholder,
  children,
  resultLabel,
  onReset,
  className,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  children?: ReactNode;
  resultLabel?: string;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('ui-toolbar rounded-lg border border-line bg-white p-3.5 shadow-xs', className)}>
      <div className="grid gap-2.5 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="md:col-span-1">
          <label htmlFor="app-search" className="sr-only">
            Search
          </label>
          <Input
            id="app-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            suffix={
              query ? (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-slate hover:bg-canvas hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : undefined
            }
          />
        </div>
        {children}
      </div>
      {(resultLabel || onReset) && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          {resultLabel && (
            <p className="text-2xs text-slate" aria-live="polite">
              {resultLabel}
            </p>
          )}
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function PersonCell({ user, hint }: { user?: User; hint?: string }) {
  if (!user) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-slate">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        Unavailable
      </span>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[0.625rem] font-semibold text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        {user.initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[0.8125rem] font-medium text-ink">{user.name}</span>
        <span className="block truncate text-2xs text-slate">{hint ?? user.country}</span>
      </span>
    </span>
  );
}

export function PanelEmpty({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <EmptyState
      icon={icon ?? <Inbox className="h-5 w-5" aria-hidden="true" />}
      title={title}
      description={description}
      action={action}
    />
  );
}

export function DemoFigure({ children }: { children: ReactNode }) {
  return <span className="text-2xs text-slate-400">{children}</span>;
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line/70 py-2.5 last:border-0">
      <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{label}</dt>
      <dd className="text-right text-[0.8125rem] text-ink">{value}</dd>
    </div>
  );
}
