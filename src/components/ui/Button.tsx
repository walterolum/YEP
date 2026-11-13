import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal' | 'electric' | 'link';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-royal text-white shadow-xs hover:bg-royal-700 active:bg-royal-700 disabled:bg-royal/50',
  secondary:
    'bg-navy text-white shadow-xs hover:bg-navy-700 active:bg-navy-900 disabled:bg-navy/50',
  outline:
    'border border-line bg-white text-ink shadow-xs hover:border-navy/30 hover:bg-canvas active:bg-navy-50 disabled:text-slate-300',
  ghost: 'bg-transparent text-ink hover:bg-navy-50 active:bg-navy-100 disabled:text-slate-300',
  danger: 'bg-danger text-white shadow-xs hover:bg-[#8f1c13] active:bg-[#7a1710] disabled:bg-danger/50',
  teal: 'bg-teal text-white shadow-xs hover:bg-teal-700 active:bg-teal-700 disabled:bg-teal/50',
  electric:
    'bg-electric text-navy-950 shadow-sm ring-1 ring-inset ring-white/20 hover:bg-royal-400 active:bg-electric-600 disabled:opacity-60',
  link: 'bg-transparent px-0 text-royal underline-offset-4 hover:underline',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-9 gap-1.5 px-3 py-1.5 text-[0.8125rem]',
  md: 'min-h-[44px] sm:min-h-10 gap-2 px-4 py-2 text-sm',
  lg: 'min-h-12 gap-2 px-5 py-2.5 text-[0.9375rem]',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    'ui-btn inline-flex select-none items-center justify-center rounded-md font-semibold transition-colors duration-150 disabled:cursor-not-allowed',
    variant === 'link' ? '' : sizes[size],
    variants[variant],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className: cn(fullWidth && 'w-full', className) })}
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
}
