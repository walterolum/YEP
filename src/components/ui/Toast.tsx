import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppSurface } from '@/app/providers/AppSurface';
import { cn } from '@/utils/cn';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  surface?: 'app';
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  surface?: 'app';
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig: Record<ToastVariant, { icon: ReactNode; classes: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />, classes: 'border-success-100 text-success' },
  error: { icon: <XCircle className="h-4 w-4" aria-hidden="true" />, classes: 'border-danger-100 text-danger' },
  warning: { icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />, classes: 'border-warning-100 text-warning' },
  info: { icon: <Info className="h-4 w-4" aria-hidden="true" />, classes: 'border-royal-100 text-royal' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { ...input, id, variant: input.variant ?? 'info' }]);
      const timer = window.setTimeout(() => dismiss(id), 6000);
      timers.current.push(timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const currentTimers = timers.current;
    return () => currentTimers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-5 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => {
          const config = variantConfig[item.variant];
          return (
            <div
              key={item.id}
              className={cn(
                'ui-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border bg-white p-3.5 shadow-lg animate-slide-in',
                item.surface === 'app' && 'app-toast',
                config.classes,
              )}
              role="status"
            >
              <span className="mt-0.5 shrink-0">{config.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-semibold text-ink">{item.title}</p>
                {item.description && <p className="mt-0.5 text-xs leading-5 text-slate">{item.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate hover:bg-canvas hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  const appSurface = useAppSurface();

  const toast = useCallback(
    (input: ToastInput) => {
      if (!context) throw new Error('useToast must be used inside ToastProvider');
      context.toast({ ...input, surface: appSurface ? 'app' : undefined });
    },
    [context, appSurface],
  );

  return useMemo(() => ({ toast }), [toast]);
}
