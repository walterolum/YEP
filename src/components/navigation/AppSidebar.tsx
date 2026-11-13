import { Link, NavLink } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Lightbulb,
  X,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_NAV, ROLE_ACCENT } from '@/components/navigation/navConfig';
import { Avatar } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ROLE_LABELS } from '@/types';

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  const groups = ROLE_NAV[user.role];

  return (
    <div className="app-sidebar relative flex h-full flex-col overflow-hidden bg-[#07152B] text-white">
      {/* Background ambient flowing curves */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <svg
          className="absolute -bottom-20 -left-20 h-80 w-80 text-cyan-500/10"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M45,-65.4C58.3,-57.1,69,-44.2,74.5,-29.3C80.1,-14.4,80.4,2.5,75.1,17.4C69.7,32.4,58.7,45.4,45.4,55.8C32.1,66.1,16,73.8,0.2,73.5C-15.6,73.2,-31.2,65,-44.8,54.4C-58.4,43.9,-70,30.9,-75.4,15.2C-80.8,-0.5,-80,-19,-71.7,-33.4C-63.5,-47.9,-47.8,-58.4,-32.7,-65.7C-17.6,-73,-3.2,-77.2,11.2,-75.3C25.6,-73.4,40,-65.5,45,-65.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Header with New YEP Logo */}
      <div className="relative z-10 flex h-[4.75rem] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <Logo variant="light" to="/app" size="sm" showSubtitle={true} />
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-navy-100 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Role workspace badge */}
      <div className="relative z-10 px-4 pt-3.5">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" aria-hidden="true" />
            {ROLE_ACCENT[user.role].label}
          </p>
          <p className="mt-0.5 truncate text-xs text-navy-200">{user.organization ?? 'East Africa Regional Platform'}</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="scrollbar-thin relative z-10 flex-1 overflow-y-auto px-3.5 py-3.5" aria-label="Application navigation">
        {groups.map((group, index) => (
          <div key={group.label ?? `group-${index}`} className={cn(index > 0 && 'mt-4')}>
            {group.label && (
              <p className="px-3 pb-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-slate-400">{group.label}</p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-2 text-[0.84rem] font-semibold transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20'
                            : 'text-slate-300 hover:bg-white/[0.08] hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                              isActive
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-cyan-300',
                            )}
                          >
                            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                          </span>
                          <span className="truncate">{item.label}</span>
                          {item.badge && item.badge > 0 ? (
                            <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-500 px-1 text-[0.6rem] font-bold text-white">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          ) : isActive ? (
                            <ChevronRight className="ml-auto h-4 w-4 text-white/90" aria-hidden="true" />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Africa Mission & User Status Card */}
      <div className="relative z-10 shrink-0 border-t border-white/10 p-3 bg-gradient-to-t from-[#050D1A] to-transparent">
        {/* Mission card */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-blue-500/10 p-3 shadow-sm">
          <svg
            className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-amber-400/15"
            viewBox="0 0 100 100"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M48,15 C52,18 60,20 62,28 C64,36 58,45 60,54 C62,63 56,72 50,85 C46,82 40,70 38,62 C36,54 30,48 32,38 C34,28 42,20 48,15 Z" />
          </svg>

          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] font-bold leading-tight text-amber-300">
                Empowered Youth,
              </p>
              <p className="text-[0.68rem] font-medium leading-tight text-white/80">
                A Transformed Africa
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Pill */}
        <Link
          to="/app/profile"
          onClick={onNavigate}
          className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-1.5 transition hover:border-white/10 hover:bg-white/[0.06]"
        >
          <Avatar name={user.name} size="sm" tone="teal" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-white">{user.name}</span>
            <span className="block truncate text-2xs text-navy-200">{ROLE_LABELS[user.role]}</span>
          </span>
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function focusableItems() {
      const panel = panelRef.current;
      if (!panel) return [];
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusableItems();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-navy-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close navigation menu"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Application navigation"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 w-[min(18.5rem,88vw)] animate-slide-in shadow-2xl"
      >
        <AppSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
