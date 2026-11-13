import { AlertCircle } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, required, optional, children, className }: FieldProps) {
  return (
    <div className={cn('ui-field space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3 text-[0.8125rem] font-semibold text-ink">
        <span>
          {label}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </span>
        {optional && <span className="text-2xs font-normal text-slate">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-xs font-medium text-danger" id={`${htmlFor}-error`} role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-5 text-slate" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const controlBase =
  'w-full rounded-md border bg-white px-3 text-sm text-ink shadow-xs transition-colors placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-slate';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  prefixIcon?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ className, invalid, prefixIcon, suffix, ...props }: InputProps) {
  return (
    <div className="relative">
      {prefixIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefixIcon}</span>
      )}
      <input
        className={cn(
          'ui-input',
          controlBase,
          'min-h-10 py-2',
          prefixIcon && 'pl-9',
          suffix && 'pr-10',
          invalid ? 'border-danger focus:border-danger' : 'border-line hover:border-slate-300 focus:border-royal',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {suffix && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{suffix}</span>}
    </div>
  );
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffix'> {
  showLabel?: string;
  hideLabel?: string;
}

export function PasswordInput({ showLabel = 'Show password', hideLabel = 'Hide password', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="inline-flex h-8 w-8 items-center justify-center rounded text-slate transition hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      }
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'ui-textarea',
        controlBase,
        'min-h-24 resize-y py-2.5 leading-6',
        invalid ? 'border-danger focus:border-danger' : 'border-line hover:border-slate-300 focus:border-royal',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'ui-select',
        controlBase,
        'min-h-10 appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23526174%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat py-2 pr-9',
        invalid ? 'border-danger focus:border-danger' : 'border-line hover:border-slate-300 focus:border-royal',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: string;
  error?: string;
}

export function Checkbox({ label, description, error, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <input
          id={inputId}
          type="checkbox"
          className="ui-checkbox mt-0.5 h-4 w-4 shrink-0 rounded-xs border-line text-royal accent-royal focus:ring-royal"
          aria-invalid={error ? true : undefined}
          aria-describedby={description ? `${inputId}-description` : undefined}
          {...props}
        />
        <label htmlFor={inputId} className="text-[0.8125rem] leading-5 text-ink">
          {label}
        </label>
      </div>
      {description && (
        <p id={`${inputId}-description`} className="ml-6.5 mt-1 text-xs leading-5 text-slate">
          {description}
        </p>
      )}
      {error && (
        <p className="ml-6.5 mt-1 text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <label htmlFor={id} className="text-[0.8125rem] font-semibold text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs leading-5 text-slate">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'ui-switch relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal',
          checked ? 'bg-teal' : 'bg-slate-300',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[1.4rem]' : 'translate-x-1',
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn('space-y-5', className)}>
      <legend className="text-base font-semibold tracking-tight text-ink">{title}</legend>
      {description && <p className="-mt-3 max-w-prose text-sm leading-6 text-slate">{description}</p>}
      {children}
    </fieldset>
  );
}
