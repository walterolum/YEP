import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/**
 * YEP Brand Mark: Dynamic reaching youth figure bursting upward with open arms
 * toward a glowing golden star, featuring flowing gold, electric cyan, and royal blue curves.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-10 w-10 shrink-0', className)}
      role="img"
      aria-label="YEP - Youth Empowerment mark"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="yep-gold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
        <linearGradient id="yep-cyan-blue" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        <linearGradient id="yep-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1E36" />
          <stop offset="100%" stopColor="#05101F" />
        </linearGradient>
        <filter id="star-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded container with subtle neon border */}
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="13"
        fill="url(#yep-bg)"
        stroke="rgba(56, 189, 248, 0.35)"
        strokeWidth="1.2"
      />

      {/* Golden sweeping left wing / reaching arm */}
      <path
        d="M12 36C14 28 17 20 22 15C19 19 16 26 14 36Z"
        fill="url(#yep-gold)"
        opacity="0.85"
      />
      <path
        d="M10 26C15 23 20 18 22 13C17 17 12 21 9 26Z"
        fill="url(#yep-gold)"
      />

      {/* Cyan & royal blue sweeping right wing / soaring arm */}
      <path
        d="M38 17C32 20 27 26 24 35C26 27 30 20 38 17Z"
        fill="url(#yep-cyan-blue)"
      />
      <path
        d="M39 24C33 27 29 32 26 38C28 32 33 27 39 24Z"
        fill="url(#yep-cyan-blue)"
        opacity="0.9"
      />

      {/* Center dynamic ascending body / youth core */}
      <path
        d="M24 13C23 22 21 31 16 38C22 32 24 23 24 13Z"
        fill="#FFFFFF"
        opacity="0.95"
      />

      {/* Golden Radiant Peak Star */}
      <g filter="url(#star-glow)">
        <polygon
          points="24,5 25.8,10.2 31,12 25.8,13.8 24,19 22.2,13.8 17,12 22.2,10.2"
          fill="#FDE047"
        />
        <circle cx="24" cy="12" r="1.8" fill="#FFFBEB" />
      </g>

      {/* Dynamic secondary sparkle */}
      <circle cx="34" cy="10" r="1.2" fill="#38BDF8" opacity="0.9" />
    </svg>
  );
}

const markSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-13 w-13',
} as const;

const wordSizes = {
  sm: 'text-[1.125rem]',
  md: 'text-[1.375rem]',
  lg: 'text-[1.75rem]',
} as const;

const taglineSizes = {
  sm: 'text-[0.55rem]',
  md: 'text-[0.625rem]',
  lg: 'text-[0.7rem]',
} as const;

export function Logo({
  variant = 'dark',
  size = 'md',
  to = '/',
  showSubtitle = true,
  className,
}: {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  showSubtitle?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex max-w-full items-center gap-3 rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
        className,
      )}
      aria-label="YEP - Youth Empowerment Management System"
    >
      <BrandMark className={markSizes[size]} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn('font-black tracking-tight flex items-baseline gap-1', wordSizes[size])}>
          <span
            className={cn(
              'font-extrabold tracking-tight',
              variant === 'light'
                ? 'text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]'
                : 'text-navy-950',
            )}
          >
            YEP
          </span>
          <span
            className={cn(
              'text-[0.7em] font-bold tracking-normal',
              variant === 'light' ? 'text-amber-400' : 'text-amber-500',
            )}
          >
            ✦
          </span>
        </span>
        {showSubtitle && (
          <span
            className={cn(
              'mt-1 text-balance font-semibold uppercase leading-[1.3] tracking-[0.06em]',
              taglineSizes[size],
              variant === 'light' ? 'text-navy-100/90' : 'text-slate-600',
            )}
          >
            Youth Empowerment Management System
          </span>
        )}
      </span>
    </Link>
  );
}
