import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { buttonStyles } from '@/components/ui';
import { Dropdown } from '@/components/ui/Overlay';
import { cn } from '@/utils/cn';

const primaryLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Programmes', to: '/programmes' },
  { label: 'Virtual Exchange', to: '/virtual-exchange' },
  { label: 'Impact Projects', to: '/impact-projects' },
];

const moreLinks = [
  { label: 'Mentorship', to: '/mentorship' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Impact & stories', to: '/impact' },
  { label: 'Responsible AI & safety', to: '/responsible-ai' },
  { label: 'Frequently asked questions', to: '/faq' },
  { label: 'Contact', to: '/contact' },
  { label: 'Verify a certificate', to: '/verify' },
];

const mobileLinks = [
  ...primaryLinks,
  ...moreLinks,
  { label: 'Accessibility statement', to: '/accessibility' },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'relative inline-flex h-full shrink-0 items-center whitespace-nowrap px-0.5 text-[0.8125rem] font-medium transition-colors',
    'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:rounded-full after:bg-royal after:transition-transform after:duration-200',
    isActive
      ? 'text-royal after:scale-x-100'
      : 'text-slate hover:text-ink hover:after:scale-x-100 hover:after:opacity-40',
  );
}

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

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
        setMobileOpen(false);
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
  }, [mobileOpen]);

  return (
    <>
      <div className="hidden border-b border-white/10 bg-navy-900 text-white lg:block">
        <div className="container-editorial flex h-9 items-center justify-between text-2xs">
          <p className="flex items-center gap-2 text-navy-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-300" />
            </span>
            Proposed programme platform · Not an accredited offering
          </p>
          <div className="flex items-center gap-5">
            <Link to="/verify" className="transition hover:text-cyan-200">
              Verify a certificate
            </Link>
            <Link to="/accessibility" className="transition hover:text-cyan-200">
              Accessibility
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div className="container-editorial flex h-[4.25rem] items-center justify-between gap-6">
          <Logo />

          <nav className="hidden h-full shrink-0 items-center gap-6 xl:flex" aria-label="Primary navigation">
            {primaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
            <Dropdown
              label="More pages"
              trigger={
                <span className="whitespace-nowrap text-[0.8125rem] font-medium text-slate hover:text-ink">More</span>
              }
              triggerClassName="h-full"
              align="right"
            >
              {(close) => (
                <div className="w-60 py-1.5">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={close}
                      className="flex items-center justify-between gap-3 rounded-md px-3.5 py-2 text-[0.8125rem] font-medium text-ink transition hover:bg-canvas"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3 text-slate-300" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </Dropdown>
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <Link to="/login" className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'whitespace-nowrap' })}>
              Sign in
            </Link>
            <Link
              to="/register"
              className={buttonStyles({ variant: 'electric', size: 'sm', className: 'whitespace-nowrap' })}
            >
              Join YouthRise
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink transition hover:border-cyan-200 hover:bg-canvas xl:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-navy-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            tabIndex={-1}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-full w-[min(23rem,90vw)] animate-slide-in flex-col overflow-y-auto border-l border-white/10 bg-navy-900 text-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Logo variant="light" size="sm" showSubtitle={false} />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-navy-100 transition hover:bg-white/10 hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4" aria-label="Mobile navigation">
              {mobileLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-cyan/10 text-cyan-200 ring-1 ring-inset ring-cyan/20'
                        : 'text-navy-100 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5 text-navy-200/60" aria-hidden="true" />
                </NavLink>
              ))}
            </nav>
            <div className="space-y-2 border-t border-white/10 p-4">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className={buttonStyles({
                  variant: 'outline',
                  size: 'md',
                  className: 'w-full border-white/20 bg-white/5 text-white hover:border-cyan/40 hover:bg-white/10',
                })}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className={buttonStyles({ variant: 'electric', size: 'md', className: 'w-full' })}
              >
                Join YouthRise
              </Link>
              <p className="flex items-start gap-1.5 pt-2 text-2xs leading-4 text-navy-200">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-teal-300" aria-hidden="true" />
                Demonstration platform. Programme details are proposals, not confirmed offers.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
