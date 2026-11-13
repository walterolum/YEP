import { ChevronDown, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAppSurface } from '@/app/providers/AppSurface';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const frame = window.requestAnimationFrame(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      focusable?.[0]?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-navy-950/55 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'app-surface app-dialog-panel relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-lg sm:rounded-lg',
          size === 'sm' && 'sm:max-w-md',
          size === 'md' && 'sm:max-w-lg',
          size === 'lg' && 'sm:max-w-3xl',
        )}
      >
        <div className="app-dialog-header flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="app-dialog-title text-lg font-semibold tracking-tight text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-[0.8125rem] leading-5 text-slate">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate transition hover:bg-canvas hover:text-ink"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children && <div className="px-5 py-5">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-line bg-canvas/50 px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'primary',
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

export function Dropdown({
  trigger,
  children,
  align = 'right',
  label,
  className,
  triggerClassName,
  showChevron = true,
}: {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  label: string;
  className?: string;
  triggerClassName?: string;
  showChevron?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const appSurface = useAppSurface();

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={cn('inline-flex items-center gap-1.5 rounded-md', triggerClassName)}
      >
        {trigger}
        {showChevron && (
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
        )}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'ui-dropdown absolute z-40 mt-2 min-w-52 animate-fade-in overflow-hidden rounded-md border border-line bg-white py-1 shadow-lg',
            appSurface && 'app-dropdown-menu',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  icon,
  tone = 'default',
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  href?: string;
}) {
  const className = cn(
    'ui-menu-item flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[0.8125rem] font-medium transition-colors hover:bg-canvas',
    tone === 'danger' ? 'text-danger' : 'text-ink',
  );
  if (href) {
    return (
      <Link to={href} className={className} role="menuitem" onClick={onClick}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" role="menuitem" onClick={onClick} className={className}>
      {icon}
      {children}
    </button>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <span className="group relative inline-flex">
      <span aria-describedby={id}>{children}</span>
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-56 -translate-x-1/2 rounded bg-navy px-2.5 py-1.5 text-2xs font-medium leading-4 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
