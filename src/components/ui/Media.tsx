import { FileText, UploadCloud, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { initialsOf } from '@/utils/format';

export function Avatar({
  name,
  size = 'md',
  tone = 'navy',
  className,
}: {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'navy' | 'teal' | 'royal' | 'sand';
  className?: string;
}) {
  const tones = {
    navy: 'bg-navy-100 text-navy',
    teal: 'bg-teal-100 text-teal-700',
    royal: 'bg-royal-100 text-royal-700',
    sand: 'bg-warning-50 text-warning',
  };
  const sizes = {
    xs: 'h-6 w-6 text-[0.5625rem]',
    sm: 'h-8 w-8 text-2xs',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-base',
  };
  return (
    <span
      className={cn(
        'ui-avatar inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide',
        tones[tone],
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  tone = 'teal',
  showValue = true,
  size = 'md',
  className,
}: {
  value: number;
  label: string;
  tone?: 'teal' | 'royal' | 'success' | 'warning' | 'navy';
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const tones = {
    teal: 'bg-teal',
    royal: 'bg-royal',
    success: 'bg-success',
    warning: 'bg-warning',
    navy: 'bg-navy',
  };
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={className}>
      <div className={cn('flex items-center justify-between gap-3', showValue && 'mb-1.5')}>
        <span className="sr-only">{label}: </span>
        {showValue && <span className="text-2xs font-semibold tabular-nums text-slate">{safeValue}%</span>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn('ui-progress-track w-full overflow-hidden rounded-full bg-navy-50', size === 'sm' ? 'h-1.5' : 'h-2')}
      >
        <div
          className={cn('ui-progress-fill h-full rounded-full transition-[width] duration-500', tones[tone])}
          data-tone={tone}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 72,
  label,
  tone = '#0F766E',
}: {
  value: number;
  size?: number;
  label: string;
  tone?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (safeValue / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${safeValue}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E1E7EF" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums text-ink">{Math.round(safeValue)}%</span>
    </div>
  );
}

export function FileUpload({
  id,
  label,
  hint,
  accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg',
  fileName,
  onFile,
  onClear,
  error,
}: {
  id?: string;
  label: string;
  hint?: string;
  accept?: string;
  fileName?: string;
  onFile: (file: File) => void;
  onClear?: () => void;
  error?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div
        className={cn(
          'rounded-xl border border-dashed p-5 text-center transition-colors',
          dragging ? 'border-royal bg-royal-50' : 'border-line bg-canvas/60 hover:border-slate-300',
          error && 'border-danger bg-danger-50',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
      >
        {fileName ? (
          <div className="flex items-center justify-between gap-3 text-left">
            <span className="flex min-w-0 items-center gap-2.5">
              <FileText className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
              <span className="truncate text-sm font-medium text-ink">{fileName}</span>
            </span>
            {onClear && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate hover:bg-white hover:text-danger"
                aria-label={`Remove ${fileName}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto h-6 w-6 text-slate" aria-hidden="true" />
            <label htmlFor={inputId} className="mt-2 inline-block cursor-pointer text-sm font-semibold text-royal underline-offset-4 hover:underline">
              {label}
            </label>
            <p className="mt-1 text-xs text-slate">{hint ?? 'PDF, DOC or image up to 10 MB. Do not upload personal data unless required.'}</p>
          </>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </div>
      {hint && <p id={`${inputId}-hint`} className="sr-only">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-danger" role="alert">{error}</p>}
    </div>
  );
}

export function DefinitionList({
  items,
  className,
}: {
  items: { label: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">{item.label}</dt>
          <dd className="mt-1 text-sm leading-6 text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
