import {
  Bell,
  Bookmark,
  CalendarClock,
  CheckCheck,
  FileCheck2,
  Megaphone,
  Menu,
  ShieldCheck,
  UserRound,
  LogOut,
  Info,
  Inbox,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandMark } from '@/components/brand/Logo';
import { useAuth } from '@/app/providers/AuthProvider';
import { useDemoData } from '@/hooks/useDemoData';
import { Avatar, ConfirmDialog, Dropdown, MenuItem } from '@/components/ui';
import { ROLE_HOME } from '@/types';
import { DEMO_MODE } from '@/services/apiClient';
import { notificationService } from '@/services/notificationService';
import { ROLE_ACCENT } from '@/components/navigation/navConfig';
import { ROLE_ICONS } from '@/components/navigation/navConfig';
import { cn } from '@/utils/cn';
import { relativeTime } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';
import type { Role } from '@/types';

const notificationIcons = {
  announcement: Megaphone,
  feedback: FileCheck2,
  session: CalendarClock,
  system: Info,
  approval: ShieldCheck,
};

function DemoRoleSwitcher() {
  const { user, switchDemoRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<Role | null>(null);
  if (!DEMO_MODE || !user) return null;

  const roles: Role[] = ['participant', 'facilitator', 'mentor', 'university', 'employer', 'partner', 'admin'];

  async function handleSwitch(role: Role) {
    setSwitching(role);
    try {
      await switchDemoRole(role);
      navigate(ROLE_HOME[role]);
      toast({ title: `Viewing as ${ROLE_ACCENT[role].short}`, variant: 'success' });
    } catch {
      toast({ title: 'Could not switch demonstration role', variant: 'error' });
    } finally {
      setSwitching(null);
    }
  }

  return (
    <Dropdown
      label="Switch demonstration role"
      trigger={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-100 bg-warning-50 px-2.5 py-1 text-2xs font-semibold text-warning shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
          <span className="hidden sm:inline">Demo · </span>
          {ROLE_ACCENT[user.role].short}
        </span>
      }
      triggerClassName="hover:bg-warning-50/80"
      align="right"
    >
      {(close) => (
        <div className="w-64">
          <p className="border-b border-line px-3.5 py-2 text-2xs font-semibold uppercase tracking-[0.1em] text-slate">
            Switch demonstration role
          </p>
          <div className="py-1">
            {roles.map((role) => {
              const Icon = ROLE_ICONS[role];
              return (
                <button
                  key={role}
                  type="button"
                  role="menuitem"
                  disabled={switching !== null}
                  onClick={async () => {
                    close();
                    await handleSwitch(role);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[0.8125rem] transition hover:bg-canvas disabled:opacity-50',
                    role === user.role ? 'font-semibold text-royal' : 'text-ink',
                  )}
                >
                  <Icon className="h-4 w-4 text-slate" aria-hidden="true" />
                  {ROLE_ACCENT[role].short}
                  {role === user.role && <span className="ml-auto text-2xs text-royal">Current</span>}
                </button>
              );
            })}
          </div>
          <p className="border-t border-line px-3.5 py-2 text-2xs leading-4 text-slate">
            Role switching exists only in demonstration mode. Production roles require authorised approval.
          </p>
        </div>
      )}
    </Dropdown>
  );
}

export function AppTopbar({ onOpenNav }: { onOpenNav: () => void }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const state = useDemoData();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;
  const notifications = state.notifications
    .filter((notification) => notification.userId === user.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const unread = notifications.filter((notification) => !notification.read).length;

  async function handleSignOut() {
    setSigningOut(true);
    await logout();
    setSigningOut(false);
    setSignOutOpen(false);
    navigate('/login');
    toast({ title: 'Signed out', description: 'Your demonstration session has ended.', variant: 'info' });
  }

  return (
    <>
      <header className="app-topbar hairline-top sticky top-0 z-30 border-b border-line/80">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onOpenNav}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white/70 text-ink shadow-xs transition hover:border-navy/25 hover:bg-white lg:hidden"
              aria-label="Open application navigation"
            >
              <Menu className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
            <Link
              to="/app"
              aria-label="YouthRise dashboard home"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
            >
              <span aria-hidden="true">
                <BrandMark className="h-8 w-8" />
              </span>
            </Link>
            <div className="hidden min-w-0 sm:block">
              <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(18,200,176,0.8)]" aria-hidden="true" />
                {ROLE_ACCENT[user.role].label}
              </p>
              <p className="truncate text-2xs text-slate">{user.organization ?? 'YouthRise · demonstration'}</p>
            </div>
          </div>

          {/* Topbar Search Bar as in Image 1 */}
          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search youth, programs, or events..."
                className="h-9 w-full rounded-full border border-line bg-canvas/80 pl-9 pr-4 text-xs text-ink placeholder:text-slate-400 focus:border-royal focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <DemoRoleSwitcher />

            <Dropdown
              label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              showChevron={false}
              trigger={
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate transition hover:border-line hover:bg-white hover:text-ink hover:shadow-xs">
                  <Bell className="h-4.5 w-4.5" aria-hidden="true" />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.5625rem] font-bold text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </span>
              }
              triggerClassName="hover:bg-canvas"
              align="right"
            >
              {(close) => (
                <div className="w-[22rem] max-w-[calc(100vw-2rem)]">
                  <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
                    <p className="text-xs font-semibold text-ink">Notifications</p>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          void notificationService.markAllRead(user.id);
                        }}
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-royal hover:underline"
                      >
                        <CheckCheck className="h-3 w-3" aria-hidden="true" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Inbox className="mx-auto h-5 w-5 text-slate" aria-hidden="true" />
                      <p className="mt-2 text-xs text-slate">No notifications yet.</p>
                    </div>
                  ) : (
                    <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => {
                        const Icon = notificationIcons[notification.kind];
                        return (
                          <li key={notification.id}>
                            <Link
                              to={notification.href ?? '/app/notifications'}
                              onClick={() => {
                                close();
                                void notificationService.markRead(notification.id);
                              }}
                              className={cn(
                                'flex gap-2.5 px-3.5 py-3 transition hover:bg-canvas',
                                !notification.read && 'bg-cyan-50/50',
                              )}
                            >
                              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas text-slate">
                                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-start gap-2">
                                  <span className="text-xs font-semibold leading-5 text-ink">{notification.title}</span>
                                  {!notification.read && (
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" aria-label="Unread" />
                                  )}
                                </span>
                                <span className="mt-0.5 line-clamp-2 block text-2xs leading-4 text-slate">{notification.body}</span>
                                <span className="mt-1 block text-[0.625rem] text-slate-400">{relativeTime(notification.createdAt)}</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <Link
                    to="/app/notifications"
                    onClick={close}
                    className="block border-t border-line px-3.5 py-2.5 text-center text-2xs font-semibold text-royal hover:bg-canvas"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </Dropdown>

            <Dropdown
              label="Account menu"
              trigger={
                <span className="flex items-center gap-2 rounded-lg border border-transparent py-1 pl-1 pr-1.5 transition hover:border-line hover:bg-white hover:shadow-xs">
                  <Avatar name={user.name} size="sm" tone="navy" />
                  <span className="hidden text-left md:block">
                    <span className="block max-w-32 truncate text-xs font-semibold text-ink">{user.name}</span>
                    <span className="block text-2xs text-slate">{ROLE_ACCENT[user.role].short}</span>
                  </span>
                </span>
              }
              triggerClassName="hover:bg-canvas"
              align="right"
            >
              {(close) => (
                <div className="w-60">
                  <div className="border-b border-line px-3.5 py-3">
                    <p className="truncate text-xs font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-2xs text-slate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <MenuItem icon={<UserRound className="h-4 w-4 text-slate" aria-hidden="true" />} onClick={close} href="/app/profile">
                      Profile & settings
                    </MenuItem>
                    <MenuItem icon={<Bell className="h-4 w-4 text-slate" aria-hidden="true" />} onClick={close} href="/app/notifications">
                      Notifications
                    </MenuItem>
                    <MenuItem icon={<Bookmark className="h-4 w-4 text-slate" aria-hidden="true" />} onClick={close} href="/verify">
                      Verify a certificate
                    </MenuItem>
                  </div>
                  <div className="border-t border-line py-1">
                    <MenuItem
                      icon={<LogOut className="h-4 w-4" aria-hidden="true" />}
                      tone="danger"
                      onClick={() => {
                        close();
                        setSignOutOpen(true);
                      }}
                    >
                      Sign out
                    </MenuItem>
                  </div>
                </div>
              )}
            </Dropdown>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => void handleSignOut()}
        title="Sign out of YouthRise?"
        description="You will need to sign in again to access your programmes and workspace. Unsaved form changes will be lost."
        confirmLabel="Sign out"
        loading={signingOut}
      />
    </>
  );
}
