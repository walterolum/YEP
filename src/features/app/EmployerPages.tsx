import {
  Award,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  Field,
  Select,
  StatCard,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { employerService } from '@/services/partnerService';
import type { TalentProfile } from '@/types';
import { titleCase } from '@/utils/format';
import { FilterToolbar, PanelEmpty, useAsyncAction } from '@/features/app/shared';

function useEmployerScope() {
  const { user } = useAuth();
  const state = useDemoData();
  const profiles = state.talentProfiles.filter((profile) => profile.visibility !== 'hidden');
  const saved = state.savedTalent;
  return { user, state, profiles, saved };
}

function TalentCard({
  profile,
  name,
  saved,
  onOpen,
  onToggleSaved,
  pending,
}: {
  profile: TalentProfile;
  name: string;
  saved: boolean;
  onOpen: () => void;
  onToggleSaved: () => void;
  pending: boolean;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar name={name} size="md" tone="navy" />
            <div className="min-w-0">
              <p className="truncate text-[0.9375rem] font-semibold text-ink">{profile.headline}</p>
              <p className="mt-0.5 text-2xs text-slate">{profile.country} · {titleCase(profile.availability)}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <StatusBadge status={profile.certificateStatus} />
                <Badge variant={profile.contactPermission ? 'info' : 'neutral'}>
                  {profile.contactPermission ? 'Open to contact' : 'No direct contact'}
                </Badge>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleSaved}
            disabled={pending}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${profile.headline} from saved profiles` : `Save ${profile.headline}`}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition ${
              saved ? 'border-royal bg-royal-50 text-royal' : 'border-line bg-white text-slate hover:text-ink'
            } disabled:opacity-50`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate">{profile.projectSummary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline">{skill}</Badge>
          ))}
          {profile.skills.length > 4 && <Badge variant="neutral">+{profile.skills.length - 4}</Badge>}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="text-2xs text-slate">{profile.portfolioItems.length} portfolio items</span>
          <Button size="sm" variant="outline" onClick={onOpen}>View profile</Button>
        </div>
      </CardBody>
    </Card>
  );
}

function TalentDialog({
  profile,
  saved,
  onClose,
  onToggleSaved,
  onRequest,
}: {
  profile: TalentProfile | null;
  saved: boolean;
  onClose: () => void;
  onToggleSaved: () => void;
  onRequest: () => void;
}) {
  if (!profile) return null;
  return (
    <Dialog
      open={Boolean(profile)}
      onClose={onClose}
      title={profile.headline}
      description={`${profile.country} · Availability: ${titleCase(profile.availability)}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={onToggleSaved} iconLeft={<Bookmark className="h-4 w-4" aria-hidden="true" />}>
            {saved ? 'Remove from saved' : 'Save profile'}
          </Button>
          <Button onClick={onRequest} disabled={!profile.contactPermission} iconLeft={<ExternalLink className="h-4 w-4" aria-hidden="true" />}>
            Request introduction
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={profile.certificateStatus} />
          <Badge variant={profile.contactPermission ? 'info' : 'neutral'}>
            {profile.contactPermission ? 'Open to contact requests' : 'Contact not permitted'}
          </Badge>
          <Badge variant="outline">Visibility: {titleCase(profile.visibility)}</Badge>
        </div>

        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Project summary</p>
          <p className="mt-1.5 text-sm leading-6 text-slate">{profile.projectSummary}</p>
        </div>

        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Skills</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
          </div>
        </div>

        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Portfolio</p>
          {profile.portfolioItems.length === 0 ? (
            <p className="mt-1.5 text-xs text-slate">No portfolio items have been shared.</p>
          ) : (
            <ul className="mt-2 space-y-2.5">
              {profile.portfolioItems.map((item) => (
                <li key={item.title} className="rounded-md border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-ink">{item.title}</p>
                    <Badge variant="neutral">{item.theme}</Badge>
                  </div>
                  <p className="mt-1 text-2xs leading-5 text-slate">{item.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-md bg-canvas p-3">
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Certificate</p>
          {profile.certificateCode ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <code className="font-mono text-xs font-semibold text-ink">{profile.certificateCode}</code>
              <Link to={`/verify?code=${encodeURIComponent(profile.certificateCode)}`} className="text-2xs font-semibold text-royal hover:underline">
                Verify in registry
              </Link>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate">No certificate has been shared on this profile.</p>
          )}
        </div>

        {!profile.contactPermission && (
          <Alert variant="warning" title="Contact not permitted">
            This person has not consented to employer contact. Do not attempt to find alternative contact details.
            Saving the profile is still allowed for your own shortlist.
          </Alert>
        )}
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export function EmployerOverviewPage() {
  useDocumentTitle('Employer overview');
  const { user, state, profiles, saved } = useEmployerScope();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [detail, setDetail] = useState<TalentProfile | null>(null);
  const [requestFor, setRequestFor] = useState<TalentProfile | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;
  const userId = user.id;

  const skillCounts = new Map<string, number>();
  profiles.forEach((profile) => profile.skills.forEach((skill) => skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1)));
  const skillData = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill, count]) => ({ skill: skill.length > 18 ? `${skill.slice(0, 16)}…` : skill, count }));

  const savedProfiles = profiles.filter((profile) => saved.includes(profile.userId));

  async function toggleSaved(profile: TalentProfile) {
    await run(
      `save-${profile.userId}`,
      () => employerService.toggleSaved(profile.userId, !saved.includes(profile.userId)),
      {
        successTitle: saved.includes(profile.userId) ? 'Removed from saved profiles' : 'Profile saved',
        successDescription: 'Saved profiles are private to your employer account in this demonstration.',
      },
    );
  }

  async function requestIntroduction() {
    if (!requestFor) return;
    if (note.trim().length < 20) {
      setError('Write at least 20 characters about the opportunity so the request is meaningful.');
      return;
    }
    setError('');
    const result = await run(
      'introduction',
      () => employerService.requestIntroduction(userId, requestFor.userId, note.trim()),
      {
        successTitle: 'Introduction request recorded',
        successDescription: 'The participant would receive a notification in production. No contact details are exchanged automatically.',
        onSuccess: () => {
          setRequestFor(null);
          setNote('');
        },
      },
    );
    if (result) toast({ title: 'Respect the response', description: 'A request is not consent. If there is no response, do not follow up outside the platform.', variant: 'info' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent overview"
        description={`A consented view of demonstration talent profiles for ${user.organization}.`}
        eyebrow="Employer workspace"
        actions={
          <Link
            to="/app/employer/talent"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search talent
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visible profiles" value={profiles.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} hint="Only profiles shared with employers" />
        <StatCard label="Verified certificates" value={profiles.filter((profile) => profile.certificateStatus === 'verified').length} icon={<Award className="h-4 w-4" aria-hidden="true" />} hint="Demonstration registry" />
        <StatCard label="Saved profiles" value={saved.length} icon={<Bookmark className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Open to opportunities" value={profiles.filter((profile) => profile.availability === 'open').length} icon={<Briefcase className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Skills across visible profiles" description="Counts are small; avoid drawing conclusions about the wider talent pool." />
          <CardBody>
            {skillData.length === 0 ? (
              <PanelEmpty title="No profiles" description="Profiles appear when participants opt in to the employer showcase." />
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="skill" width={124} interval={0} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="count" name="Visible profiles" fill="#0f766e" radius={[0, 3, 3, 0]} maxBarSize={22} />
                  </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-2xs leading-5 text-slate">
                  n = {profiles.length} visible profile{profiles.length === 1 ? '' : 's'}. Counts this small are
                  illustrative and should not be read as a measure of the wider talent pool.
                </p>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Saved profiles" description="Your private shortlist" action={<Link to="/app/employer/saved" className="text-xs font-semibold text-royal hover:underline">View all</Link>} />
          <CardBody>
            {savedProfiles.length === 0 ? (
              <PanelEmpty title="No saved profiles" description="Save a profile from the talent showcase to keep it here." icon={<Bookmark className="h-5 w-5" aria-hidden="true" />} />
            ) : (
              <ul className="space-y-3.5">
                {savedProfiles.slice(0, 4).map((profile) => (
                  <li key={profile.userId} className="flex items-start justify-between gap-3 border-b border-line/70 pb-3.5 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-[0.8125rem] font-semibold text-ink">{profile.headline}</p>
                      <p className="mt-0.5 text-2xs text-slate">{profile.country}</p>
                      <p className="mt-0.5 text-2xs text-slate">{profile.skills.slice(0, 3).join(', ')}</p>
                    </div>
                    <StatusBadge status={profile.certificateStatus} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent profiles" description="Participants who have opted into the employer showcase." />
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-2">
            {profiles.slice(0, 4).map((profile) => (
              <TalentCard
                key={profile.userId}
                profile={profile}
                name={state.users.find((entry) => entry.id === profile.userId)?.name ?? 'Participant'}
                saved={saved.includes(profile.userId)}
                onOpen={() => setDetail(profile)}
                onToggleSaved={() => void toggleSaved(profile)}
                pending={isPending(`save-${profile.userId}`)}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      <Alert variant="info" title="Responsible talent discovery">
        Profiles are opt-in. Visibility and contact permission are controlled by the participant and can change. Do not
        use this showcase to infer protected characteristics, and do not contact anyone outside the platform without
        explicit consent.
      </Alert>

      <TalentDialog
        profile={detail}
        saved={detail ? saved.includes(detail.userId) : false}
        onClose={() => setDetail(null)}
        onToggleSaved={() => detail && void toggleSaved(detail)}
        onRequest={() => {
          if (!detail) return;
          setRequestFor(detail);
          setNote('');
          setError('');
        }}
      />

      <Dialog
        open={Boolean(requestFor)}
        onClose={() => setRequestFor(null)}
        title="Request an introduction"
        description={requestFor ? `${requestFor.headline} · ${requestFor.country}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setRequestFor(null)}>Cancel</Button>
            <Button onClick={() => void requestIntroduction()} loading={isPending('introduction')}>Send request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info" title="What happens next">
            The participant receives a notification with your organisation name and note. They choose whether to
            respond. Contact details are not shared automatically.
          </Alert>
          <Field label="Message to the participant" htmlFor="intro-note" required error={error} hint="Describe the opportunity, location and any flexibility. Do not request personal documents.">
            <Textarea
              id="intro-note"
              rows={5}
              value={note}
              onChange={(event) => { setNote(event.target.value); setError(''); }}
              placeholder="We are a small organisation working on…"
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Talent showcase                                                     */
/* ------------------------------------------------------------------ */

export function EmployerTalentPage() {
  useDocumentTitle('Talent showcase');
  const { user, state, profiles, saved } = useEmployerScope();
  const { run, isPending } = useAsyncAction();
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('all');
  const [certificate, setCertificate] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [detail, setDetail] = useState<TalentProfile | null>(null);
  const [requestFor, setRequestFor] = useState<TalentProfile | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;
  const userId = user.id;

  const skills = [...new Set(profiles.flatMap((profile) => profile.skills))].sort();

  const filtered = profiles
    .filter((profile) =>
      `${profile.headline} ${profile.projectSummary} ${profile.skills.join(' ')} ${profile.country}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .filter((profile) => (skill === 'all' ? true : profile.skills.includes(skill)))
    .filter((profile) => (certificate === 'all' ? true : profile.certificateStatus === certificate))
    .filter((profile) => (availability === 'all' ? true : profile.availability === availability));

  async function toggleSaved(profile: TalentProfile) {
    await run(`save-${profile.userId}`, () => employerService.toggleSaved(profile.userId, !saved.includes(profile.userId)), {
      successTitle: saved.includes(profile.userId) ? 'Removed from saved profiles' : 'Profile saved',
    });
  }

  async function requestIntroduction() {
    if (!requestFor) return;
    if (note.trim().length < 20) {
      setError('Write at least 20 characters about the opportunity.');
      return;
    }
    setError('');
    await run('introduction', () => employerService.requestIntroduction(userId, requestFor.userId, note.trim()), {
      successTitle: 'Introduction request recorded',
      successDescription: 'The participant would be notified in production.',
      onSuccess: () => {
        setRequestFor(null);
        setNote('');
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent showcase"
        description="Search demonstration profiles shared by participants. Certificate verification links check the demonstration registry only."
        eyebrow="Talent discovery"
        actions={
          <Link to="/app/employer/saved" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas">
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            Saved profiles
          </Link>
        }
      />

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search skills, projects or headline"
        resultLabel={`${filtered.length} of ${profiles.length} profiles`}
        onReset={() => {
          setQuery('');
          setSkill('all');
          setCertificate('all');
          setAvailability('all');
        }}
      >
        <Select value={skill} onChange={(event) => setSkill(event.target.value)} aria-label="Filter by skill">
          <option value="all">All skills</option>
          {skills.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
        </Select>
        <Select value={certificate} onChange={(event) => setCertificate(event.target.value)} aria-label="Filter by certificate status">
          <option value="all">All certificate statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="none">No certificate</option>
        </Select>
        <Select value={availability} onChange={(event) => setAvailability(event.target.value)} aria-label="Filter by availability">
          <option value="all">All availability</option>
          <option value="open">Open to opportunities</option>
          <option value="not_looking">Not looking</option>
          <option value="undisclosed">Undisclosed</option>
        </Select>
      </FilterToolbar>

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No profiles match"
            description="Try a broader search or reset the filters. Only opted-in profiles appear here."
            action={<Button variant="outline" onClick={() => { setQuery(''); setSkill('all'); setCertificate('all'); setAvailability('all'); }}>Reset filters</Button>}
            icon={<Search className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((profile) => (
            <TalentCard
              key={profile.userId}
              profile={profile}
              name={state.users.find((entry) => entry.id === profile.userId)?.name ?? 'Participant'}
              saved={saved.includes(profile.userId)}
              onOpen={() => setDetail(profile)}
              onToggleSaved={() => void toggleSaved(profile)}
              pending={isPending(`save-${profile.userId}`)}
            />
          ))}
        </div>
      )}

      <Alert variant="warning" title="No guaranteed outcomes">
        A profile or certificate does not guarantee suitability for a role. Hiring decisions remain with your
        organisation and must follow applicable employment law. YouthRise does not endorse individual candidates.
      </Alert>

      <TalentDialog
        profile={detail}
        saved={detail ? saved.includes(detail.userId) : false}
        onClose={() => setDetail(null)}
        onToggleSaved={() => detail && void toggleSaved(detail)}
        onRequest={() => {
          if (!detail) return;
          setRequestFor(detail);
          setNote('');
          setError('');
        }}
      />

      <Dialog
        open={Boolean(requestFor)}
        onClose={() => setRequestFor(null)}
        title="Request an introduction"
        description={requestFor ? `${requestFor.headline} · ${requestFor.country}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setRequestFor(null)}>Cancel</Button>
            <Button onClick={() => void requestIntroduction()} loading={isPending('introduction')}>Send request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Message to the participant" htmlFor="talent-intro-note" required error={error} hint="Do not ask for identity documents, date of birth or other sensitive data.">
            <Textarea
              id="talent-intro-note"
              rows={5}
              value={note}
              onChange={(event) => { setNote(event.target.value); setError(''); }}
              placeholder="Describe the role or project and how to learn more…"
            />
          </Field>
          <Alert variant="info" title="Consent">
            The participant can decline or ignore this request. Do not use saved profile data to contact them elsewhere.
          </Alert>
        </div>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Saved profiles                                                      */
/* ------------------------------------------------------------------ */

export function EmployerSavedPage() {
  useDocumentTitle('Saved profiles');
  const { state, profiles, saved } = useEmployerScope();
  const { run, isPending } = useAsyncAction();
  const [detail, setDetail] = useState<TalentProfile | null>(null);
  const [requestFor, setRequestFor] = useState<TalentProfile | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const savedProfiles = profiles.filter((profile) => saved.includes(profile.userId));

  async function toggleSaved(profile: TalentProfile) {
    await run(`save-${profile.userId}`, () => employerService.toggleSaved(profile.userId, false), {
      successTitle: 'Removed from saved profiles',
    });
  }

  async function requestIntroduction() {
    if (!requestFor || !user) return;
    if (note.trim().length < 20) {
      setError('Write at least 20 characters about the opportunity.');
      return;
    }
    setError('');
    await run('introduction', () => employerService.requestIntroduction(user.id, requestFor.userId, note.trim()), {
      successTitle: 'Introduction request recorded',
      successDescription: 'The participant would be notified in production.',
      onSuccess: () => {
        setRequestFor(null);
        setNote('');
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved profiles"
        description="Your private shortlist. Removing a profile does not notify the participant."
        eyebrow="Talent discovery"
        actions={
          <Link to="/app/employer/talent" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700">
            <Search className="h-4 w-4" aria-hidden="true" />
            Find more talent
          </Link>
        }
      />

      {savedProfiles.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No saved profiles"
            description="Save profiles from the talent showcase to build a shortlist. Saved profiles are visible only to you."
            action={<Link to="/app/employer/talent" className="text-sm font-semibold text-royal hover:underline">Browse talent</Link>}
            icon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {savedProfiles.map((profile) => (
            <TalentCard
              key={profile.userId}
              profile={profile}
              name={state.users.find((entry) => entry.id === profile.userId)?.name ?? 'Participant'}
              saved
              onOpen={() => setDetail(profile)}
              onToggleSaved={() => void toggleSaved(profile)}
              pending={isPending(`save-${profile.userId}`)}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader title="Shortlist hygiene" />
        <CardBody className="space-y-2.5 text-xs leading-5 text-slate">
          <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />Keep a record of why a profile was saved and remove profiles you no longer need.</p>
          <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />Do not share screenshots or exported profile data outside your organisation.</p>
          <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />If a participant withdraws visibility, remove them from local records and stop contact.</p>
        </CardBody>
      </Card>

      <TalentDialog
        profile={detail}
        saved={detail ? saved.includes(detail.userId) : false}
        onClose={() => setDetail(null)}
        onToggleSaved={() => detail && void toggleSaved(detail)}
        onRequest={() => {
          if (!detail) return;
          setRequestFor(detail);
          setNote('');
          setError('');
        }}
      />

      <Dialog
        open={Boolean(requestFor)}
        onClose={() => setRequestFor(null)}
        title="Request an introduction"
        description={requestFor ? `${requestFor.headline} · ${requestFor.country}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setRequestFor(null)}>Cancel</Button>
            <Button onClick={() => void requestIntroduction()} loading={isPending('introduction')}>Send request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Message to the participant" htmlFor="saved-intro-note" required error={error}>
            <Textarea
              id="saved-intro-note"
              rows={5}
              value={note}
              onChange={(event) => { setNote(event.target.value); setError(''); }}
              placeholder="Describe the opportunity and next step…"
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
