import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bell,
  CheckCheck,
  Download,
  KeyRound,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  ConfirmDialog,
  Field,
  Input,
  Pagination,
  ProgressBar,
  Select,
  Switch,
  Tabs,
  TabPanel,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { notificationService } from '@/services/notificationService';
import { userService } from '@/services/programmeService';
import { ROLE_LABELS } from '@/types';
import { formatDate, formatDateTime, relativeTime } from '@/utils/format';
import { errorMessage, useAsyncAction, usePagination } from '@/features/app/shared';

/* ------------------------------------------------------------------ */
/* Profile & settings                                                  */
/* ------------------------------------------------------------------ */

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80, 'Keep your name under 80 characters.'),
  country: z.string().min(1, 'Select a country.'),
  phone: z.string().trim().max(24, 'Enter a shorter phone number.').optional(),
  organization: z.string().trim().max(120, 'Keep the organisation name under 120 characters.').optional(),
  jobTitle: z.string().trim().max(120, 'Keep the job title under 120 characters.').optional(),
  bio: z.string().trim().max(600, 'Keep your bio under 600 characters.').optional(),
  interests: z.string().trim().max(300, 'Keep interests under 300 characters.').optional(),
  skills: z.string().trim().max(300, 'Keep skills under 300 characters.').optional(),
  timezone: z.string().min(1, 'Select a time zone.'),
});

type ProfileValues = z.infer<typeof profileSchema>;

const countries = ['Uganda', 'Kenya', 'Rwanda', 'Tanzania', 'Burundi', 'South Sudan', 'DR Congo', 'Other'];
const timezones = ['Africa/Kampala', 'Africa/Nairobi', 'Africa/Kigali', 'Africa/Dar_es_Salaam', 'Africa/Bujumbura', 'Africa/Juba', 'Africa/Lubumbashi'];

export function ProfilePage() {
  useDocumentTitle('Profile and settings');
  const { user, refreshUser } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState('profile');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [visibility, setVisibility] = useState(user?.visibility ?? 'limited');
  const [contactPermission, setContactPermission] = useState(user?.contactPermission ?? false);
  const [commsConsent, setCommsConsent] = useState(true);
  const [syncedUserId, setSyncedUserId] = useState(user?.id);

  if (user && user.id !== syncedUserId) {
    setSyncedUserId(user.id);
    setVisibility(user.visibility);
    setContactPermission(user.contactPermission);
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      country: user?.country ?? '',
      phone: user?.phone ?? '',
      organization: user?.organization ?? '',
      jobTitle: user?.jobTitle ?? '',
      bio: user?.bio ?? '',
      interests: user?.interests.join(', ') ?? '',
      skills: user?.skills.join(', ') ?? '',
      timezone: user?.timezone ?? 'Africa/Kampala',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      country: user.country,
      phone: user.phone ?? '',
      organization: user.organization ?? '',
      jobTitle: user.jobTitle ?? '',
      bio: user.bio ?? '',
      interests: user.interests.join(', '),
      skills: user.skills.join(', '),
      timezone: user.timezone,
    });
  }, [user, reset]);

  if (!user) return null;

  const userId = user.id;
  const teamCount = state.teams.filter((team) => team.memberIds.includes(userId)).length;

  async function saveProfile(values: ProfileValues) {
    await run(
      'profile',
      () =>
        userService.updateProfile(userId, {
          name: values.name,
          country: values.country,
          phone: values.phone || undefined,
          organization: values.organization || undefined,
          jobTitle: values.jobTitle || undefined,
          bio: values.bio || undefined,
          interests: values.interests ? values.interests.split(',').map((entry) => entry.trim()).filter(Boolean) : [],
          skills: values.skills ? values.skills.split(',').map((entry) => entry.trim()).filter(Boolean) : [],
          timezone: values.timezone,
        }),
      { successTitle: 'Profile saved', successDescription: 'Your changes are stored in this browser only.' },
    );
    await refreshUser();
  }

  async function savePrivacy() {
    await run(
      'privacy',
      () => userService.updateProfile(userId, { visibility, contactPermission }),
      { successTitle: 'Privacy settings saved', successDescription: 'Visibility and contact preferences have been updated.' },
    );
    await refreshUser();
  }

  async function changePassword() {
    await run('password', () => new Promise((resolve) => window.setTimeout(resolve, 500)), {
      successTitle: 'Demonstration password change simulated',
      successDescription: 'A production API would require the current password and enforce rate limits.',
    });
  }

  function downloadData() {
    const payload = {
      generatedAt: new Date().toISOString(),
      notice: 'Demonstration export. Data is simulated and local to this browser.',
      user,
      enrolments: state.enrolments.filter((entry) => entry.userId === userId),
      assessments: state.assessments,
      certificates: state.certificates.filter((entry) => entry.participantId === userId),
      teams: state.teams.filter((team) => team.memberIds.includes(userId)),
      notifications: state.notifications.filter((entry) => entry.userId === userId),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `youthrise-demo-export-${userId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Demonstration export downloaded', variant: 'success' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile and settings"
        description="Manage how you appear in the demonstration platform, your contact preferences and account security."
        eyebrow="Account"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardBody className="text-center">
              <Avatar name={user.name} size="lg" tone="navy" className="mx-auto" />
              <h2 className="mt-3 text-lg font-semibold text-ink">{user.name}</h2>
              <p className="mt-0.5 text-xs text-slate">{user.email}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                <Badge variant="navy">{ROLE_LABELS[user.role]}</Badge>
                <Badge variant="outline">{user.country}</Badge>
              </div>
              <div className="mt-5 text-left">
                <ProgressBar value={user.profileComplete} label="Profile completeness" tone="teal" />
                <p className="mt-1.5 text-2xs text-slate">A complete profile helps facilitators and mentors support you.</p>
              </div>
              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-left text-2xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate">Member since</dt>
                  <dd className="whitespace-nowrap font-medium text-ink">{formatDate(user.joinedAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate">Teams</dt>
                  <dd className="font-medium text-ink">{teamCount}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate">Account status</dt>
                  <dd>
                    <Badge variant={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge>
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
          <Alert variant="info" title="Demonstration profile">
            This profile is visible only inside your browser. In production, visibility settings would be enforced by the
            API and reflected in search results and partner views.
          </Alert>
        </div>

        <Card>
          <div className="px-5 pt-4">
            <Tabs
              ariaLabel="Profile settings sections"
              active={tab}
              onChange={setTab}
              items={[
                { id: 'profile', label: 'Profile details' },
                { id: 'privacy', label: 'Privacy & visibility' },
                { id: 'security', label: 'Security' },
                { id: 'data', label: 'Data & account' },
              ]}
            />
          </div>

          <div className="p-5">
            <TabPanel id="profile" active={tab}>
              <form className="space-y-5" onSubmit={handleSubmit(saveProfile)} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="profile-name" error={errors.name?.message} required>
                    <Input id="profile-name" invalid={Boolean(errors.name)} {...register('name')} />
                  </Field>
                  <Field label="Email address" htmlFor="profile-email" hint="Email changes require re-verification.">
                    <Input id="profile-email" value={user.email} readOnly disabled />
                  </Field>
                  <Field label="Country" htmlFor="profile-country" error={errors.country?.message} required>
                    <Select id="profile-country" invalid={Boolean(errors.country)} {...register('country')}>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Phone" htmlFor="profile-phone" error={errors.phone?.message} optional>
                    <Input id="profile-phone" type="tel" invalid={Boolean(errors.phone)} {...register('phone')} />
                  </Field>
                  <Field label="Organisation" htmlFor="profile-org" error={errors.organization?.message} optional>
                    <Input id="profile-org" invalid={Boolean(errors.organization)} {...register('organization')} />
                  </Field>
                  <Field label="Role or job title" htmlFor="profile-title" error={errors.jobTitle?.message} optional>
                    <Input id="profile-title" invalid={Boolean(errors.jobTitle)} {...register('jobTitle')} />
                  </Field>
                </div>

                <Field
                  label="About you"
                  htmlFor="profile-bio"
                  error={errors.bio?.message}
                  hint="Avoid including sensitive personal information. Maximum 600 characters."
                  optional
                >
                  <Textarea id="profile-bio" rows={4} invalid={Boolean(errors.bio)} {...register('bio')} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Interests"
                    htmlFor="profile-interests"
                    error={errors.interests?.message}
                    hint="Separate with commas."
                    optional
                  >
                    <Input id="profile-interests" invalid={Boolean(errors.interests)} {...register('interests')} />
                  </Field>
                  <Field
                    label="Skills"
                    htmlFor="profile-skills"
                    error={errors.skills?.message}
                    hint="Separate with commas. These can appear in the talent showcase if you opt in."
                    optional
                  >
                    <Input id="profile-skills" invalid={Boolean(errors.skills)} {...register('skills')} />
                  </Field>
                </div>

                <Field label="Time zone" htmlFor="profile-timezone" error={errors.timezone?.message} required>
                  <Select id="profile-timezone" {...register('timezone')}>
                    {timezones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone.replace('_', ' ')}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-2xs text-slate">Changes are stored locally in this demonstration.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => reset()} disabled={!isDirty}>
                      Discard changes
                    </Button>
                    <Button type="submit" loading={isPending('profile')} disabled={!isDirty}>
                      Save profile
                    </Button>
                  </div>
                </div>
              </form>
            </TabPanel>

            <TabPanel id="privacy" active={tab}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Profile visibility</h2>
                  <p className="mt-1 max-w-prose text-sm leading-6 text-slate">
                    Control who can find your profile in the talent showcase. Mentors and facilitators assigned to your
                    programme can always see your learning record.
                  </p>
                  <div className="mt-3">
                    <Field label="Who can see my profile?" htmlFor="profile-visibility">
                      <Select
                        id="profile-visibility"
                        value={visibility}
                        onChange={(event) => setVisibility(event.target.value as typeof visibility)}
                      >
                        <option value="public">Public — visible in the talent showcase</option>
                        <option value="limited">Limited — visible to programme staff and approved partners</option>
                        <option value="hidden">Hidden — not discoverable</option>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="rounded-md border border-line p-4">
                  <Switch
                    checked={contactPermission}
                    onChange={setContactPermission}
                    label="Allow approved employers to request contact"
                    description="Your email address is never shown directly. Requests are routed through the platform."
                  />
                </div>

                <div className="rounded-md border border-line p-4">
                  <Switch
                    checked={commsConsent}
                    onChange={setCommsConsent}
                    label="Receive programme updates and newsletters"
                    description="Optional communications. Essential account and safeguarding messages are always sent."
                  />
                </div>

                <Alert variant="warning" title="Consent is not a substitute for visibility">
                  Making your profile public does not automatically permit contact or reuse of your work. Contact
                  permission and visibility are separate settings.
                </Alert>

                <div className="flex justify-end border-t border-line pt-4">
                  <Button onClick={() => void savePrivacy()} loading={isPending('privacy')}>
                    Save privacy settings
                  </Button>
                </div>
              </div>
            </TabPanel>

            <TabPanel id="security" active={tab}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Password</h2>
                  <p className="mt-1 text-sm leading-6 text-slate">
                    Use a unique password. The demonstration does not store or transmit credentials.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Current password" htmlFor="security-current">
                      <Input id="security-current" type="password" autoComplete="current-password" placeholder="••••••••" />
                    </Field>
                    <Field label="New password" htmlFor="security-new" hint="At least 8 characters with mixed case and a number.">
                      <Input id="security-new" type="password" autoComplete="new-password" placeholder="••••••••" />
                    </Field>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button onClick={() => void changePassword()} loading={isPending('password')} iconLeft={<KeyRound className="h-4 w-4" aria-hidden="true" />}>
                      Update password
                    </Button>
                  </div>
                </div>

                <div className="border-t border-line pt-5">
                  <h2 className="text-base font-semibold text-ink">Active session</h2>
                  <dl className="mt-3 space-y-2 rounded-md border border-line bg-canvas/60 p-4 text-[0.8125rem]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate">Device</dt>
                      <dd className="text-ink">This browser · demonstration session</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate">Session expiry</dt>
                      <dd className="text-ink">8 hours after sign-in</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate">Two-factor authentication</dt>
                      <dd className="text-slate">Not configured in demonstration</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-2xs leading-5 text-slate">
                    Production accounts should support two-factor authentication, session revocation and suspicious
                    sign-in alerts.
                  </p>
                </div>
              </div>
            </TabPanel>

            <TabPanel id="data" active={tab}>
              <div className="space-y-6">
                <div className="rounded-md border border-line p-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                    <Download className="h-4 w-4 text-slate" aria-hidden="true" />
                    Download your data
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate">
                    Export a JSON copy of your demonstration profile, enrolments, certificates, teams and notifications.
                  </p>
                  <Button variant="outline" className="mt-3" onClick={downloadData}>
                    Download demonstration export
                  </Button>
                </div>

                <div className="rounded-md border border-line p-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-slate" aria-hidden="true" />
                    Verification and records
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate">
                    Certificates can be checked using the public verification page. This demonstration does not represent
                    accreditation by any real institution.
                  </p>
                  <Link to="/verify" className="mt-2 inline-block text-[0.8125rem] font-semibold text-royal hover:underline">
                    Open certificate verification
                  </Link>
                </div>

                <div className="rounded-md border border-danger-100 bg-danger-50/50 p-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-danger">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete account
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate">
                    A production deletion request would be logged, verified and completed within the period stated in the
                    privacy notice. Some safeguarding and audit records may be retained.
                  </p>
                  <Button variant="danger" className="mt-3" onClick={() => setDeleteOpen(true)}>
                    Request account deletion
                  </Button>
                </div>
              </div>
            </TabPanel>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          toast({
            title: 'Deletion request simulated',
            description: 'No data was deleted. In production this would create a tracked privacy request.',
            variant: 'info',
          });
        }}
        title="Request account deletion?"
        description="This demonstration cannot delete real records. In production, the request would require identity verification and would be handled through the privacy request workflow."
        confirmLabel="Submit request"
        tone="danger"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

const notificationTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'session', label: 'Sessions' },
  { id: 'system', label: 'System' },
];

export function NotificationsPage() {
  useDocumentTitle('Notifications');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const [tab, setTab] = useState('all');
  const [marking, setMarking] = useState(false);

  const notifications = useMemo(() => {
    if (!user) return [];
    const mine = state.notifications
      .filter((notification) => notification.userId === user.id)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (tab === 'unread') return mine.filter((notification) => !notification.read);
    if (tab === 'feedback' || tab === 'session' || tab === 'system') {
      return mine.filter((notification) => notification.kind === tab);
    }
    return mine;
  }, [state.notifications, tab, user]);

  const pagination = usePagination(notifications, 10);
  const unread = user ? state.notifications.filter((entry) => entry.userId === user.id && !entry.read).length : 0;

  if (!user) return null;
  const userId = user.id;

  async function markAll() {
    setMarking(true);
    try {
      await notificationService.markAllRead(userId);
      toast({ title: 'All notifications marked as read', variant: 'success' });
    } catch (error) {
      toast({ title: 'Could not update notifications', description: errorMessage(error), variant: 'error' });
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Programme announcements, mentor feedback, session reminders and account messages."
        eyebrow="Account"
        actions={
          <Button
            variant="outline"
            onClick={() => void markAll()}
            loading={marking}
            disabled={unread === 0}
            iconLeft={<CheckCheck className="h-4 w-4" aria-hidden="true" />}
          >
            Mark all read
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={unread > 0 ? 'info' : 'neutral'} icon={<Bell className="h-3 w-3" aria-hidden="true" />}>
          {unread} unread
        </Badge>
        <span className="text-2xs text-slate">Notifications are simulated and never sent by email.</span>
      </div>

      <Card>
        <div className="px-5 pt-4">
          <Tabs ariaLabel="Notification filters" items={notificationTabs} active={tab} onChange={setTab} />
        </div>
        {notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Bell className="mx-auto h-5 w-5 text-slate" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-ink">Nothing here yet</p>
            <p className="mt-1 text-xs text-slate">
              {tab === 'unread' ? 'You have read all notifications.' : 'New messages will appear here.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {pagination.pageItems.map((notification) => (
              <li key={notification.id} className={notification.read ? '' : 'bg-royal-50/30'}>
                <div className="flex flex-wrap items-start gap-3 px-5 py-4">
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-slate">
                    <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[0.8125rem] font-semibold text-ink">{notification.title}</p>
                      {!notification.read && <Badge variant="info">Unread</Badge>}
                      <span className="text-2xs text-slate">{relativeTime(notification.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-[0.8125rem] leading-6 text-slate">{notification.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-2xs">
                      {notification.href && (
                        <Link
                          to={notification.href}
                          onClick={() => void notificationService.markRead(notification.id)}
                          className="font-semibold text-royal hover:underline"
                        >
                          Open related page
                        </Link>
                      )}
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => void notificationService.markRead(notification.id)}
                          className="font-semibold text-slate hover:text-ink"
                        >
                          Mark as read
                        </button>
                      )}
                      <span className="text-slate-400">{formatDateTime(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-line px-5 py-3">
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.setPage}
            totalLabel={`${pagination.total} notification${pagination.total === 1 ? '' : 's'}`}
          />
        </div>
      </Card>

      <Alert variant="info" title="Notification preferences">
        In production, notification channels and categories would be configurable. Essential safeguarding and account
        messages cannot be disabled. Configure preferences from{' '}
        <Link to="/app/profile" className="font-semibold underline">
          profile settings
        </Link>
        .
      </Alert>
    </div>
  );
}
