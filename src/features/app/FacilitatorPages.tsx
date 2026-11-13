import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Library,
  Network,
  Plus,
  Search,
  Users,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  Dialog,
  Field,
  Input,
  Pagination,
  ProgressBar,
  Select,
  StatCard,
  StatusBadge,
  Tabs,
  Textarea,
  useToast,
} from '@/components/ui';
import type { Column } from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { facilitatorService } from '@/services/facilitatorService';
import { sessionService } from '@/services/sessionService';
import type { Assessment, CohortMember, Programme, Team } from '@/types';
import { formatDate, formatDateTime, formatDueDate, percent, titleCase } from '@/utils/format';
import { FilterToolbar, PanelEmpty, PersonCell, useAsyncAction, usePagination } from '@/features/app/shared';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function useFacilitatorScope() {
  const { user } = useAuth();
  const state = useDemoData();
  const userId = user?.id ?? '';
  const programmes = state.programmes.filter((programme) => programme.facilitatorId === userId);
  const programmeIds = new Set(programmes.map((programme) => programme.id));
  const enrolments = state.enrolments.filter((enrolment) => programmeIds.has(enrolment.programmeId));
  const teams = state.teams.filter((team) => programmeIds.has(team.programmeId));
  const sessions = state.sessions.filter((session) => programmeIds.has(session.programmeId));
  const assessments = state.assessments.filter((assessment) => programmeIds.has(assessment.programmeId));
  return { user, userId, state, programmes, programmeIds, enrolments, teams, sessions, assessments };
}

function programmeName(programmes: Programme[], programmeId: string) {
  return programmes.find((programme) => programme.id === programmeId)?.title ?? 'Programme';
}

function completionStatus(progress: number): CohortMember['completion'] {
  if (progress >= 100) return 'completed';
  if (progress === 0) return 'not_started';
  if (progress < 35) return 'at_risk';
  return 'on_track';
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell);
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(','),
    )
    .join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export function FacilitatorOverviewPage() {
  useDocumentTitle('Facilitator overview');
  const { user, state, programmes, enrolments, teams, sessions } = useFacilitatorScope();
  const [period, setPeriod] = useState('all');

  if (!user) return null;

  const pendingReviews = state.submissions.filter(
    (submission) =>
      (submission.status === 'submitted' || submission.status === 'under_review') &&
      teams.some((team) => team.id === submission.teamId),
  );
  const upcomingSessions = sessions
    .filter((session) => session.status === 'upcoming')
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const atRisk = enrolments
    .filter((enrolment) => enrolment.progress > 0 && enrolment.progress < 35)
    .map((enrolment) => ({
      enrolment,
      user: state.users.find((entry) => entry.id === enrolment.userId),
      programme: programmes.find((programme) => programme.id === enrolment.programmeId),
    }))
    .filter((entry) => entry.user);

  const completionData = programmes.map((programme) => {
    const members = enrolments.filter((enrolment) => enrolment.programmeId === programme.id);
    const average = members.length
      ? Math.round(members.reduce((sum, enrolment) => sum + enrolment.progress, 0) / members.length)
      : 0;
    return {
      name: programme.title.length > 18 ? `${programme.title.slice(0, 16)}…` : programme.title,
      completion: average,
      enrolled: members.length,
    };
  });

  const averageCompletion = enrolments.length
    ? Math.round(enrolments.reduce((sum, enrolment) => sum + enrolment.progress, 0) / enrolments.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good day, ${user.name.split(' ')[0]}`}
        description="Your programmes, cohorts and review queue. All figures below are demonstration data."
        eyebrow="Facilitator workspace"
        actions={
          <Link
            to="/app/facilitator/sessions"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Schedule a session
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active programmes"
          value={programmes.filter((programme) => programme.status !== 'closed').length}
          icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
          hint={`${programmes.length} in total`}
        />
        <StatCard
          label="Learners enrolled"
          value={enrolments.length}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
          hint={`Average completion ${averageCompletion}%`}
        />
        <StatCard
          label="Teams in progress"
          value={teams.length}
          icon={<Network className="h-4 w-4" aria-hidden="true" />}
          hint={`${teams.filter((team) => team.memberIds.length >= team.capacity).length} at full capacity`}
        />
        <StatCard
          label="Reviews waiting"
          value={pendingReviews.length}
          icon={<FileCheck2 className="h-4 w-4" aria-hidden="true" />}
          hint={pendingReviews.length ? 'Evidence or assessments' : 'Queue is clear'}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Average completion by programme"
            description="Percentage of lessons completed across enrolled learners. Demonstration figures."
            action={
              <Select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Reporting period"
                className="w-36"
              >
                <option value="all">All time</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </Select>
            }
          />
          <CardBody>
            {completionData.length === 0 ? (
              <PanelEmpty title="No programme data" description="Create a programme to start tracking completion." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} unit="%" />
                    <ChartTooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                      formatter={(value) => [`${value}%`, 'Average completion']}
                    />
                    <Bar dataKey="completion" fill="#1e4fd8" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {period !== 'all' && (
              <p className="mt-2 text-2xs text-slate">
                Period filtering is a demonstration control; the seeded dataset is not date-restricted.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Upcoming sessions"
            description={`${upcomingSessions.length} scheduled`}
            action={<Link to="/app/facilitator/sessions" className="text-xs font-semibold text-royal hover:underline">View all</Link>}
          />
          <CardBody>
            {upcomingSessions.length === 0 ? (
              <PanelEmpty title="No upcoming sessions" description="Schedule a session for one of your cohorts." />
            ) : (
              <ul className="space-y-3.5">
                {upcomingSessions.slice(0, 4).map((session) => (
                  <li key={session.id} className="border-b border-line/70 pb-3.5 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[0.8125rem] font-semibold leading-5 text-ink">{session.title}</p>
                      <Badge variant="outline">{session.registeredCount}/{session.capacity}</Badge>
                    </div>
                    <p className="mt-1 text-2xs text-slate">{formatDateTime(session.startsAt)}</p>
                    <p className="mt-1 text-2xs text-slate">{programmeName(programmes, session.programmeId)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Review queue"
            description="Milestone evidence submitted by teams you facilitate."
            action={<Badge variant={pendingReviews.length ? 'warning' : 'success'}>{pendingReviews.length} waiting</Badge>}
          />
          <CardBody>
            {pendingReviews.length === 0 ? (
              <PanelEmpty title="Nothing waiting" description="All submitted evidence has been reviewed." icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} />
            ) : (
              <ul className="space-y-3">
                {pendingReviews.slice(0, 5).map((submission) => {
                  const team = teams.find((entry) => entry.id === submission.teamId);
                  return (
                    <li key={submission.id} className="flex items-start justify-between gap-3 rounded-md border border-line p-3">
                      <div className="min-w-0">
                        <p className="truncate text-[0.8125rem] font-semibold text-ink">{submission.title}</p>
                        <p className="mt-0.5 text-2xs text-slate">{team?.name ?? 'Team'} · {formatDate(submission.submittedAt)}</p>
                        <p className="mt-1 truncate text-2xs text-slate">{submission.fileName}</p>
                      </div>
                      <StatusBadge status={submission.status} />
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-2xs text-slate">
              Mentors review milestone evidence. Facilitators can monitor the queue and follow up with assigned mentors.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Learners needing support"
            description="Progress below 35% after starting. Use this as a prompt for a check-in, not an automated judgement."
            action={<Badge variant={atRisk.length ? 'warning' : 'success'}>{atRisk.length}</Badge>}
          />
          <CardBody>
            {atRisk.length === 0 ? (
              <PanelEmpty title="No learners flagged" description="No learner is currently below the support threshold." />
            ) : (
              <ul className="space-y-3">
                {atRisk.slice(0, 5).map(({ enrolment, user: learner, programme }) => (
                  <li key={enrolment.id} className="flex items-center justify-between gap-3">
                    <PersonCell user={learner} hint={`${programme?.title ?? 'Programme'} · ${enrolment.progress}%`} />
                    <Link
                      to={`/app/facilitator/cohorts?programme=${enrolment.programmeId}`}
                      className="shrink-0 text-2xs font-semibold text-royal hover:underline"
                    >
                      Cohort
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Alert variant="info" title="Demonstration workspace">
        This dashboard uses seeded demonstration data. Actions update your browser only. In production, figures would
        come from aggregate reporting endpoints with role-based access and no unnecessary personal data.
      </Alert>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Programmes                                                          */
/* ------------------------------------------------------------------ */

const emptyProgrammeForm = {
  title: '',
  summary: '',
  description: '',
  level: '1' as '1' | '2',
  theme: 'Digital skills',
  durationWeeks: '6',
  commitment: '4–5 hours per week',
  mode: 'Online, facilitated',
  capacity: '40',
  startsAt: '',
  endsAt: '',
  cohort: '',
  status: 'draft' as Programme['status'],
  eligibility: '',
  outcomes: '',
  skills: '',
};

export function FacilitatorProgrammesPage() {
  useDocumentTitle('Programmes');
  const { user, programmes, enrolments } = useFacilitatorScope();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyProgrammeForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<Programme | null>(null);

  if (!user) return null;
  const userId = user.id;

  const filtered = programmes
    .filter((programme) => (status === 'all' ? true : programme.status === status))
    .filter((programme) => `${programme.title} ${programme.theme} ${programme.cohort}`.toLowerCase().includes(query.trim().toLowerCase()));

  function validate() {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 4) next.title = 'Enter a programme title of at least 4 characters.';
    if (form.summary.trim().length < 20) next.summary = 'Write a short summary of at least 20 characters.';
    if (!form.startsAt) next.startsAt = 'Choose a start date.';
    if (!form.endsAt) next.endsAt = 'Choose an end date.';
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      next.endsAt = 'The end date must be after the start date.';
    }
    if (Number(form.capacity) < 5) next.capacity = 'Capacity must be at least 5.';
    if (!form.cohort.trim()) next.cohort = 'Name the cohort so learners can identify it.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function create() {
    if (!validate()) return;
    const result = await run(
      'create-programme',
      () =>
        facilitatorService.createProgramme(
          {
            title: form.title.trim(),
            summary: form.summary.trim(),
            description: form.description.trim() || form.summary.trim(),
            level: form.level === '2' ? 2 : 1,
            theme: form.theme.trim() || 'Digital skills',
            durationWeeks: Math.max(1, Number(form.durationWeeks) || 6),
            commitment: form.commitment.trim(),
            mode: form.mode.trim(),
            eligibility: form.eligibility.split(',').map((entry) => entry.trim()).filter(Boolean),
            outcomes: form.outcomes.split(',').map((entry) => entry.trim()).filter(Boolean),
            skills: form.skills.split(',').map((entry) => entry.trim()).filter(Boolean),
            capacity: Math.max(5, Number(form.capacity) || 40),
            status: form.status,
            startsAt: new Date(form.startsAt).toISOString(),
            endsAt: new Date(form.endsAt).toISOString(),
            cohort: form.cohort.trim(),
          },
          userId,
        ),
      {
        successTitle: 'Programme created',
        successDescription: 'Saved as a demonstration record. It is not published to learners until its status is open.',
        onSuccess: () => {
          setOpen(false);
          setForm(emptyProgrammeForm);
        },
      },
    );
    if (result) toast({ title: 'Draft saved', description: 'Add learning modules before opening enrolment.', variant: 'info' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programmes"
        description="Design and manage the programmes you facilitate. New programmes start as drafts."
        eyebrow="Programme design"
        actions={
          <Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}>
            New programme
          </Button>
        }
      />

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search programmes"
        resultLabel={`${filtered.length} of ${programmes.length} programmes`}
        onReset={() => {
          setQuery('');
          setStatus('all');
        }}
      >
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="waitlist">Waitlist</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </Select>
      </FilterToolbar>

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No programmes match"
            description="Adjust the filters or create a new programme."
            action={<Button variant="outline" onClick={() => { setQuery(''); setStatus('all'); }}>Reset filters</Button>}
            icon={<GraduationCap className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((programme) => {
            const enrolled = enrolments.filter((enrolment) => enrolment.programmeId === programme.id).length;
            const fill = percent(enrolled, programme.capacity);
            return (
              <Card key={programme.id}>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={programme.status} />
                    <Badge variant="outline">Level {programme.level}</Badge>
                    <Badge variant="neutral">{programme.cohort}</Badge>
                  </div>
                  <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{programme.title}</h2>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate">{programme.summary}</p>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-2xs text-slate">
                    <div>
                      <p className="font-semibold uppercase tracking-[0.08em]">Learners</p>
                      <p className="mt-0.5 text-sm font-semibold text-ink">{enrolled}/{programme.capacity}</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-[0.08em]">Modules</p>
                      <p className="mt-0.5 text-sm font-semibold text-ink">{programme.moduleCount}</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-[0.08em]">Weeks</p>
                      <p className="mt-0.5 text-sm font-semibold text-ink">{programme.durationWeeks}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={fill} label={`${fill}% of places filled`} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                    <p className="text-2xs text-slate">
                      {formatDate(programme.startsAt)} – {formatDate(programme.endsAt)}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setDetail(programme)}>
                      Manage
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create a programme"
        description="New programmes are saved as drafts in this demonstration."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} loading={isPending('create-programme')}>Save draft</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Programme title" htmlFor="prog-title" required error={errors.title}>
            <Input id="prog-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Digital Foundations — Cohort 5" />
          </Field>
          <Field label="Short summary" htmlFor="prog-summary" required error={errors.summary} hint="Shown in the public catalogue. Do not promise outcomes you cannot deliver.">
            <Textarea id="prog-summary" rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Level" htmlFor="prog-level" required>
              <Select id="prog-level" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value as '1' | '2' })}>
                <option value="1">Level One</option>
                <option value="2">Level Two</option>
              </Select>
            </Field>
            <Field label="Theme" htmlFor="prog-theme">
              <Input id="prog-theme" value={form.theme} onChange={(event) => setForm({ ...form, theme: event.target.value })} />
            </Field>
            <Field label="Cohort name" htmlFor="prog-cohort" required error={errors.cohort}>
              <Input id="prog-cohort" value={form.cohort} onChange={(event) => setForm({ ...form, cohort: event.target.value })} placeholder="e.g. Cohort 5 · 2027" />
            </Field>
            <Field label="Capacity" htmlFor="prog-capacity" required error={errors.capacity}>
              <Input id="prog-capacity" type="number" min={5} max={500} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            </Field>
            <Field label="Start date" htmlFor="prog-start" required error={errors.startsAt}>
              <Input id="prog-start" type="date" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
            </Field>
            <Field label="End date" htmlFor="prog-end" required error={errors.endsAt}>
              <Input id="prog-end" type="date" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} />
            </Field>
            <Field label="Duration (weeks)" htmlFor="prog-weeks">
              <Input id="prog-weeks" type="number" min={1} max={52} value={form.durationWeeks} onChange={(event) => setForm({ ...form, durationWeeks: event.target.value })} />
            </Field>
            <Field label="Status" htmlFor="prog-status">
              <Select id="prog-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Programme['status'] })}>
                <option value="draft">Draft</option>
                <option value="open">Open for enrolment</option>
                <option value="waitlist">Waitlist</option>
                <option value="closed">Closed</option>
              </Select>
            </Field>
            <Field label="Commitment" htmlFor="prog-commitment">
              <Input id="prog-commitment" value={form.commitment} onChange={(event) => setForm({ ...form, commitment: event.target.value })} />
            </Field>
            <Field label="Mode" htmlFor="prog-mode">
              <Input id="prog-mode" value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })} />
            </Field>
          </div>
          <Field label="Eligibility criteria" htmlFor="prog-eligibility" hint="Comma-separated. Be specific and non-discriminatory." optional>
            <Input id="prog-eligibility" value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} placeholder="Aged 18–30, based in East Africa, able to commit 5 hours a week" />
          </Field>
          <Field label="Learning outcomes" htmlFor="prog-outcomes" hint="Comma-separated. Avoid guaranteeing employment." optional>
            <Input id="prog-outcomes" value={form.outcomes} onChange={(event) => setForm({ ...form, outcomes: event.target.value })} placeholder="Verify online information, collaborate across borders, plan a small project" />
          </Field>
          <Field label="Skills" htmlFor="prog-skills" hint="Comma-separated." optional>
            <Input id="prog-skills" value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Research, digital collaboration, responsible AI" />
          </Field>
          <Alert variant="info" title="Before opening enrolment">
            Add at least one published module, confirm facilitator cover and check that any partner claim is accurate.
            This demonstration does not send invitations or publish to the public site.
          </Alert>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.title ?? 'Programme'}
        description={detail ? `${detail.cohort} · Level ${detail.level}` : undefined}
        size="lg"
        footer={<Button variant="outline" onClick={() => setDetail(null)}>Close</Button>}
      >
        {detail && (
          <div className="space-y-4 text-sm leading-6 text-slate">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={detail.status} />
              <Badge variant="outline">{detail.mode}</Badge>
              <Badge variant="neutral">{detail.commitment}</Badge>
            </div>
            <p>{detail.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Dates</p>
                <p className="mt-1 text-xs text-ink">{formatDate(detail.startsAt)} – {formatDate(detail.endsAt)}</p>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Enrolment</p>
                <p className="mt-1 text-xs text-ink">{detail.enrolledCount} of {detail.capacity} places</p>
              </div>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Eligibility</p>
              <ul className="mt-1.5 space-y-1">
                {detail.eligibility.map((item) => (
                  <li key={item} className="flex gap-2 text-xs"><Check className="mt-1 h-3 w-3 shrink-0 text-teal" aria-hidden="true" />{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Outcomes</p>
              <ul className="mt-1.5 space-y-1">
                {detail.outcomes.map((item) => (
                  <li key={item} className="flex gap-2 text-xs"><Check className="mt-1 h-3 w-3 shrink-0 text-teal" aria-hidden="true" />{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line pt-3">
              <Link to="/app/facilitator/content" className="text-xs font-semibold text-royal hover:underline">Manage learning content</Link>
              <Link to={`/app/facilitator/cohorts?programme=${detail.id}`} className="text-xs font-semibold text-royal hover:underline">View cohort</Link>
              <Link to="/app/facilitator/sessions" className="text-xs font-semibold text-royal hover:underline">Schedule a session</Link>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Learning content                                                    */
/* ------------------------------------------------------------------ */

export function FacilitatorContentPage() {
  useDocumentTitle('Learning content');
  const { state, programmes } = useFacilitatorScope();
  const { run, isPending } = useAsyncAction();
  const [programmeId, setProgrammeId] = useState('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [preview, setPreview] = useState<{ title: string; summary: string; lessons: { title: string; type: string; durationMins: number }[] } | null>(null);

  const programmeIds = new Set(programmes.map((programme) => programme.id));
  const modules = state.modules
    .filter((module) => programmeIds.has(module.programmeId))
    .filter((module) => (programmeId === 'all' ? true : module.programmeId === programmeId))
    .filter((module) => (status === 'all' ? true : module.status === status))
    .filter((module) => `${module.title} ${module.summary}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.order - b.order);

  async function setModuleStatus(moduleId: string, next: 'draft' | 'published' | 'archived') {
    await run(
      `module-${moduleId}`,
      () => facilitatorService.updateModuleStatus(moduleId, next),
      {
        successTitle: next === 'published' ? 'Module published' : next === 'archived' ? 'Module archived' : 'Module moved to draft',
        successDescription: 'Learners see published modules only. This change is stored in your browser.',
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning content"
        description="Modules and lessons across your programmes. Publishing is a deliberate step; drafts stay hidden from learners."
        eyebrow="Programme design"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Modules" value={modules.length} icon={<Library className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Published" value={modules.filter((module) => module.status === 'published').length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Lessons" value={modules.reduce((sum, module) => sum + module.lessons.length, 0)} icon={<BookOpen className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search modules"
        resultLabel={`${modules.length} modules`}
        onReset={() => {
          setQuery('');
          setStatus('all');
          setProgrammeId('all');
        }}
      >
        <Select value={programmeId} onChange={(event) => setProgrammeId(event.target.value)} aria-label="Filter by programme">
          <option value="all">All programmes</option>
          {programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>{programme.title}</option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by content status">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </FilterToolbar>

      {modules.length === 0 ? (
        <Card>
          <PanelEmpty title="No modules found" description="Try another programme or status. Module authoring is not included in this demonstration." icon={<Library className="h-5 w-5" aria-hidden="true" />} />
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardBody>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={module.status} />
                      <Badge variant="outline">Module {module.order}</Badge>
                      <Badge variant="neutral">{module.lessons.length} lessons</Badge>
                      <Badge variant="neutral">{module.durationMins} min</Badge>
                    </div>
                    <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{module.title}</h2>
                    <p className="mt-0.5 text-2xs text-slate">{programmeName(programmes, module.programmeId)}</p>
                    <p className="mt-1.5 text-xs leading-5 text-slate">{module.summary}</p>
                    <details className="mt-3 rounded-md border border-line bg-canvas/60 p-3">
                      <summary className="cursor-pointer text-xs font-semibold text-ink">Lesson outline</summary>
                      <ul className="mt-2 space-y-1.5">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-start justify-between gap-3 text-2xs text-slate">
                            <span className="flex min-w-0 items-start gap-1.5">
                              <FileText className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{lesson.title}</span>
                            </span>
                            <span className="shrink-0">{titleCase(lesson.type)} · {lesson.durationMins} min</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreview({ title: module.title, summary: module.summary, lessons: module.lessons })}
                    >
                      Preview
                    </Button>
                    {module.status !== 'published' ? (
                      <Button size="sm" onClick={() => void setModuleStatus(module.id, 'published')} loading={isPending(`module-${module.id}`)}>
                        Publish
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => void setModuleStatus(module.id, 'draft')} loading={isPending(`module-${module.id}`)}>
                        Unpublish
                      </Button>
                    )}
                    {module.status !== 'archived' && (
                      <Button size="sm" variant="ghost" onClick={() => void setModuleStatus(module.id, 'archived')} loading={isPending(`module-${module.id}`)}>
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Alert variant="warning" title="Content review">
        Published content should be reviewed for accuracy, accessibility and respectful representation before release.
        This demonstration does not include a full authoring or version-history workflow.
      </Alert>

      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? 'Module preview'}
        description="Learner-facing outline in this demonstration."
        size="lg"
        footer={<Button variant="outline" onClick={() => setPreview(null)}>Close</Button>}
      >
        {preview && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate">{preview.summary}</p>
            <ol className="divide-y divide-line rounded-md border border-line">
              {preview.lessons.map((lesson, index) => (
                <li key={lesson.title} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-royal-50 text-2xs font-semibold text-royal">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{lesson.title}</p>
                    <p className="text-2xs text-slate">{titleCase(lesson.type)} · {lesson.durationMins} minutes</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cohorts                                                             */
/* ------------------------------------------------------------------ */

export function FacilitatorCohortsPage() {
  useDocumentTitle('Cohorts');
  const { state, programmes, enrolments } = useFacilitatorScope();
  const { toast } = useToast();
  const [programmeId, setProgrammeId] = useState('all');
  const [query, setQuery] = useState('');
  const [completion, setCompletion] = useState('all');
  const [sort, setSort] = useState('progress-asc');

  const rows: CohortMember[] = enrolments
    .filter((enrolment) => (programmeId === 'all' ? true : enrolment.programmeId === programmeId))
    .map((enrolment) => ({
      userId: enrolment.userId,
      enrolmentId: enrolment.id,
      programmeId: enrolment.programmeId,
      progress: enrolment.progress,
      attendance: 58 + ((enrolment.userId.charCodeAt(2) + enrolment.programmeId.length) % 43),
      completion: completionStatus(enrolment.progress),
      enrolledAt: enrolment.enrolledAt,
    }))
    .filter((row) => {
      const learner = state.users.find((user) => user.id === row.userId);
      const matchesQuery = `${learner?.name ?? ''} ${learner?.country ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCompletion = completion === 'all' ? true : row.completion === completion;
      return matchesQuery && matchesCompletion;
    })
    .sort((a, b) => {
      if (sort === 'progress-asc') return a.progress - b.progress;
      if (sort === 'progress-desc') return b.progress - a.progress;
      if (sort === 'attendance-asc') return a.attendance - b.attendance;
      return a.enrolledAt.localeCompare(b.enrolledAt);
    });

  const pagination = usePagination(rows, 10);

  function exportRows() {
    downloadCsv('youthrise-demo-cohort.csv', [
      ['Learner', 'Country', 'Programme', 'Progress %', 'Attendance %', 'Status', 'Enrolled'],
      ...rows.map((row) => {
        const learner = state.users.find((user) => user.id === row.userId);
        return [
          learner?.name ?? 'Unknown',
          learner?.country ?? '',
          programmeName(programmes, row.programmeId),
          row.progress,
          row.attendance,
          titleCase(row.completion),
          formatDate(row.enrolledAt),
        ];
      }),
    ]);
    toast({
      title: 'Cohort CSV exported',
      description: 'The file contains demonstration data only and stays in your browser.',
      variant: 'success',
    });
  }

  const columns: Column<CohortMember>[] = [
    {
      key: 'learner',
      header: 'Learner',
      render: (row) => {
        const learner = state.users.find((user) => user.id === row.userId);
        return <PersonCell user={learner} hint={learner?.country} />;
      },
    },
    {
      key: 'programme',
      header: 'Programme',
      render: (row) => <span className="text-xs text-slate">{programmeName(programmes, row.programmeId)}</span>,
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <div className="w-32">
          <ProgressBar value={row.progress} label={`${row.progress}%`} />
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (row) => <span className="text-xs text-ink">{row.attendance}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.completion} />,
    },
    {
      key: 'enrolled',
      header: 'Enrolled',
      render: (row) => <span className="text-2xs text-slate">{formatDate(row.enrolledAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohorts"
        description="Monitor progress and attendance across your programmes. Attendance is derived from demonstration data."
        eyebrow="Programme design"
        actions={
          <Button variant="outline" onClick={exportRows} iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}>
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Learners" value={rows.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="On track" value={rows.filter((row) => row.completion === 'on_track').length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="At risk" value={rows.filter((row) => row.completion === 'at_risk').length} icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Completed" value={rows.filter((row) => row.completion === 'completed').length} icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search learners"
        resultLabel={`${rows.length} learners`}
        onReset={() => {
          setQuery('');
          setCompletion('all');
          setProgrammeId('all');
          setSort('progress-asc');
        }}
      >
        <Select value={programmeId} onChange={(event) => setProgrammeId(event.target.value)} aria-label="Filter by programme">
          <option value="all">All programmes</option>
          {programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>{programme.title}</option>
          ))}
        </Select>
        <Select value={completion} onChange={(event) => setCompletion(event.target.value)} aria-label="Filter by completion status">
          <option value="all">All statuses</option>
          <option value="on_track">On track</option>
          <option value="at_risk">At risk</option>
          <option value="completed">Completed</option>
          <option value="not_started">Not started</option>
        </Select>
        <Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort learners">
          <option value="progress-asc">Progress: low to high</option>
          <option value="progress-desc">Progress: high to low</option>
          <option value="attendance-asc">Attendance: low to high</option>
          <option value="enrolled">Recently enrolled</option>
        </Select>
      </FilterToolbar>

      <Card>
        <CardBody className="p-0">
          <DataTable
            rows={pagination.pageItems}
            columns={columns}
            getRowKey={(row) => row.enrolmentId}
            caption="Cohort members with progress and attendance"
            emptyState={<PanelEmpty title="No learners match" description="Try a different programme or status filter." />}
          />
        </CardBody>
        <div className="border-t border-line px-5 py-3">
          <Pagination page={pagination.page} pageCount={pagination.pageCount} onChange={pagination.setPage} totalLabel={`${rows.length} learners`} />
        </div>
      </Card>

      <Alert variant="info" title="Using progress data responsibly">
        Progress is a prompt for support, not a measure of a young person's worth. Avoid comparing learners publicly and
        do not export personal data outside approved systems. CSV export here stays on your device.
      </Alert>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

export function FacilitatorSessionsPage() {
  useDocumentTitle('Virtual sessions');
  const { user, userId, programmes, sessions } = useFacilitatorScope();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [tab, setTab] = useState('upcoming');
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<(typeof sessions)[number] | null>(null);
  const [form, setForm] = useState({
    title: '',
    programmeId: programmes[0]?.id ?? '',
    startsAt: '',
    durationMins: '60',
    capacity: '30',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const filtered = sessions
    .filter((session) => (tab === 'all' ? true : session.status === tab))
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

  function validate() {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 5) next.title = 'Enter a session title.';
    if (!form.programmeId) next.programmeId = 'Choose a programme.';
    if (!form.startsAt) next.startsAt = 'Choose a date and time.';
    if (Number(form.durationMins) < 15) next.durationMins = 'Sessions must run for at least 15 minutes.';
    if (Number(form.capacity) < 2) next.capacity = 'Allow at least two places.';
    if (form.description.trim().length < 20) next.description = 'Add a short description so learners know what to expect.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function create() {
    if (!validate()) return;
    const result = await run(
      'create-session',
      () =>
        sessionService.create({
          title: form.title.trim(),
          programmeId: form.programmeId,
          startsAt: new Date(form.startsAt).toISOString(),
          durationMins: Math.max(15, Number(form.durationMins)),
          timezone: 'Africa/Kampala',
          facilitatorId: userId,
          capacity: Math.max(2, Number(form.capacity)),
          description: form.description.trim(),
        }),
      {
        successTitle: 'Session scheduled',
        successDescription: 'Learners in the programme can now register. No meeting link is created in this demonstration.',
        onSuccess: () => {
          setOpen(false);
          setForm({ title: '', programmeId: programmes[0]?.id ?? '', startsAt: '', durationMins: '60', capacity: '30', description: '' });
        },
      },
    );
    if (result) toast({ title: 'Reminder', description: 'Add a facilitator prep note before the session.', variant: 'info' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Virtual sessions"
        description="Schedule and track Level One exchange sessions. Times are stored in UTC and displayed in East Africa Time."
        eyebrow="Delivery"
        actions={
          <Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Schedule session
          </Button>
        }
      />

      <Tabs
        ariaLabel="Session status"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'upcoming', label: 'Upcoming', count: sessions.filter((session) => session.status === 'upcoming').length },
          { id: 'completed', label: 'Completed', count: sessions.filter((session) => session.status === 'completed').length },
          { id: 'cancelled', label: 'Cancelled', count: sessions.filter((session) => session.status === 'cancelled').length },
          { id: 'all', label: 'All', count: sessions.length },
        ]}
      />

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No sessions in this view"
            description="Schedule a session or choose a different status."
            action={<Button variant="outline" onClick={() => setTab('all')}>Show all sessions</Button>}
            icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((session) => (
            <Card key={session.id}>
              <CardBody>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={session.status} />
                      <Badge variant="outline">{programmeName(programmes, session.programmeId)}</Badge>
                      <Badge variant="neutral">{session.durationMins} min</Badge>
                    </div>
                    <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{session.title}</h2>
                    <p className="mt-1 text-2xs text-slate">{formatDateTime(session.startsAt)} · {session.timezone}</p>
                    <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate">{session.description}</p>
                    <div className="mt-2.5">
                      <ProgressBar
                        value={percent(session.registeredCount, session.capacity)}
                        label={`${session.registeredCount} of ${session.capacity} places registered`}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
                    <Button size="sm" variant="outline" onClick={() => setDetail(session)}>Details</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toast({
                          title: 'Demonstration only',
                          description: 'Creating a meeting link requires the production video integration.',
                          variant: 'info',
                        })
                      }
                    >
                      Meeting link
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Alert variant="info" title="Meeting links and recordings">
        Production sessions would use a time-limited link for registered learners. Recordings, transcripts and
        attendance reports must follow the platform's consent and retention rules.
      </Alert>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule a virtual session"
        description="Creates a demonstration session for one of your programmes."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} loading={isPending('create-session')}>Schedule session</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Session title" htmlFor="session-title" required error={errors.title}>
            <Input id="session-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Cross-border collaboration lab" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Programme" htmlFor="session-programme" required error={errors.programmeId}>
              <Select id="session-programme" value={form.programmeId} onChange={(event) => setForm({ ...form, programmeId: event.target.value })}>
                <option value="">Choose a programme</option>
                {programmes.map((programme) => (
                  <option key={programme.id} value={programme.id}>{programme.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date and time (EAT)" htmlFor="session-start" required error={errors.startsAt}>
              <Input id="session-start" type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
            </Field>
            <Field label="Duration (minutes)" htmlFor="session-duration" required error={errors.durationMins}>
              <Input id="session-duration" type="number" min={15} max={240} value={form.durationMins} onChange={(event) => setForm({ ...form, durationMins: event.target.value })} />
            </Field>
            <Field label="Places" htmlFor="session-capacity" required error={errors.capacity}>
              <Input id="session-capacity" type="number" min={2} max={500} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            </Field>
          </div>
          <Field label="Description" htmlFor="session-description" required error={errors.description} hint="Say what learners will do, what to prepare and whether the session is recorded.">
            <Textarea id="session-description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <Alert variant="warning" title="Safeguarding">
            Do not include personal contact details in the description. Any recording needs explicit consent and a
            clear retention period.
          </Alert>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.title ?? 'Session details'}
        description={detail ? formatDateTime(detail.startsAt) : undefined}
        size="lg"
        footer={<Button variant="outline" onClick={() => setDetail(null)}>Close</Button>}
      >
        {detail && (
          <div className="space-y-4 text-sm leading-6 text-slate">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={detail.status} />
              <Badge variant="outline">{programmeName(programmes, detail.programmeId)}</Badge>
            </div>
            <p>{detail.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Registered</p>
                <p className="mt-1 text-xs text-ink">{detail.registeredCount} of {detail.capacity}</p>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Duration</p>
                <p className="mt-1 text-xs text-ink">{detail.durationMins} minutes</p>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Time zone</p>
                <p className="mt-1 text-xs text-ink">{detail.timezone}</p>
              </div>
            </div>
            {detail.materials?.length ? (
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Materials</p>
                <ul className="mt-1.5 space-y-1">
                  {detail.materials.map((material) => (
                    <li key={material.label} className="flex items-center gap-2 text-xs">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      {material.label}
                      <Badge variant="neutral">{material.kind}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Alert variant="info" title="Production integration required">
              Attendance, recordings and calendar invitations are not generated in this demonstration.
            </Alert>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teams                                                               */
/* ------------------------------------------------------------------ */

export function FacilitatorTeamsPage() {
  useDocumentTitle('Team formation');
  const { state, programmes, teams } = useFacilitatorScope();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState('all');
  const [detail, setDetail] = useState<Team | null>(null);
  const [mentorDraft, setMentorDraft] = useState('');

  const mentors = state.users.filter((entry) => entry.role === 'mentor');

  const filtered = teams.filter((team) => {
    if (tab === 'unassigned') return !team.mentorId || !mentors.some((mentor) => mentor.id === team.mentorId);
    if (tab === 'full') return team.memberIds.length >= team.capacity;
    return true;
  });

  async function assignMentor(team: Team) {
    if (!mentorDraft) return;
    await run(
      `mentor-${team.id}`,
      () => facilitatorService.assignMentor(team.id, mentorDraft),
      {
        successTitle: 'Mentor assigned',
        successDescription: 'The mentor will see this team in their workspace. In production they would be notified.',
        onSuccess: () => {
          setDetail(null);
          setMentorDraft('');
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team formation"
        description="Review Level Two teams, confirm mentor cover and check project progress. Team formation always includes a human review step."
        eyebrow="Delivery"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Teams" value={teams.length} icon={<Network className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Full teams" value={teams.filter((team) => team.memberIds.length >= team.capacity).length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Without mentor" value={teams.filter((team) => !team.mentorId).length} icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <Tabs
        ariaLabel="Team filters"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'All teams', count: teams.length },
          { id: 'full', label: 'At capacity', count: teams.filter((team) => team.memberIds.length >= team.capacity).length },
          { id: 'unassigned', label: 'Mentor needed', count: teams.filter((team) => !team.mentorId).length },
        ]}
      />

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty title="No teams in this view" description="Teams are created during Level Two onboarding after facilitator review." icon={<Network className="h-5 w-5" aria-hidden="true" />} />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((team) => {
            const mentor = state.users.find((entry) => entry.id === team.mentorId);
            const project = state.projects.find((entry) => entry.teamId === team.id);
            const approved = project?.milestones.filter((milestone) => milestone.status === 'approved').length ?? 0;
            return (
              <Card key={team.id}>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{team.theme}</Badge>
                    <Badge variant="neutral">{team.memberIds.length}/{team.capacity} members</Badge>
                    {!mentor && <Badge variant="warning">Mentor needed</Badge>}
                  </div>
                  <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{team.name}</h2>
                  <p className="mt-0.5 text-2xs text-slate">{programmeName(programmes, team.programmeId)} · Created {formatDate(team.createdAt)}</p>
                  <div className="mt-3 rounded-md bg-canvas p-3">
                    <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Mentor</p>
                    <div className="mt-1.5">
                      {mentor ? <PersonCell user={mentor} hint={mentor.organization} /> : <p className="text-xs text-slate">Not assigned</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-2xs text-slate">
                    <span>{project ? `${approved}/${project.milestones.length} milestones approved` : 'No linked project'}</span>
                    <span>{team.messages.length} messages</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                    <Button size="sm" variant="outline" onClick={() => { setDetail(team); setMentorDraft(team.mentorId); }}>
                      Review team
                    </Button>
                    <Link to="/app/facilitator/cohorts" className="inline-flex min-h-9 items-center rounded-md px-3 text-xs font-semibold text-royal hover:bg-royal-50">
                      View learners
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Alert variant="info" title="Human review">
        Placement proposals should be reviewed for group balance, accessibility needs and any concern a participant has
        raised. This demonstration does not automate placement decisions.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.name ?? 'Team review'}
        description={detail ? `${programmeName(programmes, detail.programmeId)} · ${detail.memberIds.length} members` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            <Button onClick={() => detail && void assignMentor(detail)} loading={isPending(`mentor-${detail?.id ?? ''}`)} disabled={!mentorDraft}>
              Save mentor
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Members</p>
              <ul className="mt-2 space-y-2">
                {detail.memberIds.map((memberId) => {
                  const member = state.users.find((entry) => entry.id === memberId);
                  return (
                    <li key={memberId} className="flex items-center justify-between gap-3 rounded-md border border-line p-2.5">
                      <PersonCell user={member} hint={member?.skills.slice(0, 2).join(', ')} />
                      <span className="text-2xs text-slate">{member?.country}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Field label="Assigned mentor" htmlFor="team-mentor" hint="Changing the mentor updates this demonstration record only.">
              <Select id="team-mentor" value={mentorDraft} onChange={(event) => setMentorDraft(event.target.value)}>
                <option value="">Unassigned</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>{mentor.name} · {mentor.organization}</option>
                ))}
              </Select>
            </Field>
            <Alert variant="warning" title="Check capacity">
              Mentors should not be assigned more teams than their agreed capacity. Confirm availability before saving.
            </Alert>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

export function FacilitatorAssessmentsPage() {
  useDocumentTitle('Assessments');
  const { state, programmes, assessments } = useFacilitatorScope();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState<Assessment | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const filtered = assessments
    .filter((assessment) => (tab === 'all' ? true : assessment.status === tab))
    .filter((assessment) => `${assessment.title} ${assessment.description}`.toLowerCase().includes(query.trim().toLowerCase()));

  async function submitGrade() {
    if (!grade) return;
    const numeric = Number(score);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > grade.maxScore) {
      setError(`Enter a score between 0 and ${grade.maxScore}.`);
      return;
    }
    if (feedback.trim().length < 10) {
      setError('Add feedback of at least 10 characters so the learner knows what to improve.');
      return;
    }
    setError('');
    const result = await run('grade', () => facilitatorService.gradeAssessment(grade.id, numeric, feedback.trim()), {
      successTitle: 'Assessment graded',
      successDescription: 'The learner would receive a notification in production.',
      onSuccess: () => {
        setGrade(null);
        setScore('');
        setFeedback('');
      },
    });
    if (result === undefined) return;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Review submitted assessments and record scores against the published rubric. Grading is a demonstration action."
        eyebrow="Delivery"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessments" value={assessments.length} icon={<ClipboardCheck className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Awaiting grading" value={assessments.filter((assessment) => assessment.status === 'submitted').length} icon={<FileCheck2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Graded" value={assessments.filter((assessment) => assessment.status === 'graded').length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Locked" value={assessments.filter((assessment) => assessment.status === 'locked').length} icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <Tabs
        ariaLabel="Assessment status"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'All', count: assessments.length },
          { id: 'submitted', label: 'Submitted', count: assessments.filter((assessment) => assessment.status === 'submitted').length },
          { id: 'graded', label: 'Graded', count: assessments.filter((assessment) => assessment.status === 'graded').length },
          { id: 'available', label: 'Available', count: assessments.filter((assessment) => assessment.status === 'available').length },
          { id: 'locked', label: 'Locked', count: assessments.filter((assessment) => assessment.status === 'locked').length },
        ]}
      />

      <div className="max-w-md">
        <label htmlFor="assessment-search" className="sr-only">Search assessments</label>
        <Input
          id="assessment-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search assessments"
          prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty title="No assessments in this view" description="Try another status or clear the search." icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />} />
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <DataTable
              rows={filtered}
              getRowKey={(assessment) => assessment.id}
              caption="Assessments across facilitated programmes"
              columns={[
                {
                  key: 'title',
                  header: 'Assessment',
                  render: (assessment) => (
                    <div>
                      <p className="text-[0.8125rem] font-semibold text-ink">{assessment.title}</p>
                      <p className="mt-0.5 text-2xs text-slate">{programmeName(programmes, assessment.programmeId)} · {titleCase(assessment.type)}</p>
                    </div>
                  ),
                },
                {
                  key: 'due',
                  header: 'Due',
                  render: (assessment) => <span className="text-xs text-slate">{formatDueDate(assessment.dueAt)}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (assessment) => <StatusBadge status={assessment.status} />,
                },
                {
                  key: 'score',
                  header: 'Score',
                  render: (assessment) =>
                    assessment.status === 'graded' ? (
                      <span className="text-xs font-semibold text-ink">{assessment.score}/{assessment.maxScore}</span>
                    ) : (
                      <span className="text-xs text-slate">—</span>
                    ),
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (assessment) => (
                    <Button
                      size="sm"
                      variant={assessment.status === 'submitted' ? 'primary' : 'outline'}
                      onClick={() => {
                        setGrade(assessment);
                        setScore(assessment.score ? String(assessment.score) : '');
                        setFeedback(assessment.feedback ?? '');
                        setError('');
                      }}
                    >
                      {assessment.status === 'submitted' ? 'Grade' : 'Review'}
                    </Button>
                  ),
                },
              ]}
            />
          </CardBody>
        </Card>
      )}

      <Dialog
        open={Boolean(grade)}
        onClose={() => setGrade(null)}
        title={grade?.title ?? 'Assessment'}
        description={grade ? `${programmeName(programmes, grade.programmeId)} · ${grade.maxScore} marks` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setGrade(null)}>Close</Button>
            <Button onClick={() => void submitGrade()} loading={isPending('grade')}>Save grade</Button>
          </>
        }
      >
        {grade && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate">{grade.description}</p>
            <div className="rounded-md border border-line bg-canvas p-3">
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Marking criteria</p>
              <ul className="mt-1.5 space-y-1">
                {grade.criteria.map((criterion) => (
                  <li key={criterion.id} className="flex items-start justify-between gap-3 text-xs text-slate">
                    <span>{criterion.label}</span>
                    <span className="shrink-0 font-semibold text-ink">{criterion.maxScore}</span>
                  </li>
                ))}
              </ul>
            </div>
            {grade.status === 'submitted' ? (
              <Alert variant="info" title="Submission received">
                {state.assessmentSubmissions[grade.id]
                  ? `Submitted ${formatDateTime(state.assessmentSubmissions[grade.id].submittedAt)}.`
                  : 'The submission is stored against the learner account.'}
              </Alert>
            ) : (
              <Alert variant="warning" title="Existing grade">
                Saving again replaces the recorded score and feedback in this demonstration.
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <Field label={`Score (0–${grade.maxScore})`} htmlFor="grade-score" required error={error}>
                <Input
                  id="grade-score"
                  type="number"
                  min={0}
                  max={grade.maxScore}
                  value={score}
                  onChange={(event) => { setScore(event.target.value); setError(''); }}
                />
              </Field>
              <Field label="Feedback" htmlFor="grade-feedback" required hint="Be specific, respectful and actionable.">
                <Textarea
                  id="grade-feedback"
                  rows={4}
                  value={feedback}
                  onChange={(event) => { setFeedback(event.target.value); setError(''); }}
                  placeholder="What was strong, what needs work, and what to do next…"
                />
              </Field>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export function FacilitatorReportsPage() {
  useDocumentTitle('Reports');
  const { programmes, enrolments, teams, sessions } = useFacilitatorScope();
  const { toast } = useToast();

  const participation = programmes.map((programme) => ({
    name: programme.title.length > 16 ? `${programme.title.slice(0, 14)}…` : programme.title,
    enrolled: enrolments.filter((enrolment) => enrolment.programmeId === programme.id).length,
    capacity: programme.capacity,
  }));

  const buckets = [
    { label: '0–25%', min: 0, max: 25 },
    { label: '26–50%', min: 26, max: 50 },
    { label: '51–75%', min: 51, max: 75 },
    { label: '76–100%', min: 76, max: 100 },
  ].map((bucket) => ({
    ...bucket,
    learners: enrolments.filter((enrolment) => enrolment.progress >= bucket.min && enrolment.progress <= bucket.max).length,
  }));

  const attendance = sessions
    .slice(0, 8)
    .map((session) => ({
      name: session.title.length > 14 ? `${session.title.slice(0, 12)}…` : session.title,
      registered: session.registeredCount,
      capacity: session.capacity,
    }));

  function exportReport() {
    downloadCsv('youthrise-demo-facilitator-report.csv', [
      ['Programme', 'Level', 'Enrolled', 'Capacity', 'Teams', 'Average completion %'],
      ...programmes.map((programme) => {
        const members = enrolments.filter((enrolment) => enrolment.programmeId === programme.id);
        const average = members.length
          ? Math.round(members.reduce((sum, enrolment) => sum + enrolment.progress, 0) / members.length)
          : 0;
        return [
          programme.title,
          programme.level,
          members.length,
          programme.capacity,
          teams.filter((team) => team.programmeId === programme.id).length,
          average,
        ];
      }),
    ]);
    toast({
      title: 'Report exported',
      description: 'Demonstration data only. No learner names are included in this aggregate export.',
      variant: 'success',
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Aggregate programme participation and completion. Reports use demonstration data and exclude personal contact details."
        eyebrow="Insight"
        actions={
          <Button variant="outline" onClick={exportReport} iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}>
            Export aggregate CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolments" value={enrolments.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Teams" value={teams.length} icon={<Network className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Sessions" value={sessions.length} icon={<Video className="h-4 w-4" aria-hidden="true" />} />
        <StatCard
          label="Average completion"
          value={`${enrolments.length ? Math.round(enrolments.reduce((sum, enrolment) => sum + enrolment.progress, 0) / enrolments.length) : 0}%`}
          icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Participation against capacity" description="Enrolled learners compared with advertised places." />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participation} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="enrolled" name="Enrolled" fill="#1e4fd8" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="capacity" name="Capacity" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Completion distribution" description="Learners grouped by percentage of lessons completed." />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(value) => [value, 'Learners']} />
                  <Bar dataKey="learners" name="Learners" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Session registration" description="Registered places for recent sessions. Attendance is not captured in this demonstration." />
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="registered" name="Registered" fill="#1e4fd8" radius={[3, 3, 0, 0]} maxBarSize={24} />
                <Bar dataKey="capacity" name="Places" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Programme summary" description="Aggregate figures with no learner-level personal data." />
        <CardBody className="p-0">
          <DataTable
            rows={programmes}
            getRowKey={(programme) => programme.id}
            caption="Programme-level aggregate report"
            columns={[
              {
                key: 'programme',
                header: 'Programme',
                render: (programme) => (
                  <div>
                    <p className="text-[0.8125rem] font-semibold text-ink">{programme.title}</p>
                    <p className="text-2xs text-slate">{programme.cohort}</p>
                  </div>
                ),
              },
              {
                key: 'enrolled',
                header: 'Enrolled',
                render: (programme) => <span className="text-xs text-ink">{enrolments.filter((enrolment) => enrolment.programmeId === programme.id).length}</span>,
              },
              {
                key: 'teams',
                header: 'Teams',
                render: (programme) => <span className="text-xs text-ink">{teams.filter((team) => team.programmeId === programme.id).length}</span>,
              },
              {
                key: 'completion',
                header: 'Average completion',
                render: (programme) => {
                  const members = enrolments.filter((enrolment) => enrolment.programmeId === programme.id);
                  const average = members.length
                    ? Math.round(members.reduce((sum, enrolment) => sum + enrolment.progress, 0) / members.length)
                    : 0;
                  return <span className="text-xs font-semibold text-ink">{average}%</span>;
                },
              },
            ]}
          />
        </CardBody>
      </Card>

      <Alert variant="info" title="Reporting limitations">
        These charts are generated from the seeded demonstration dataset. A production reporting service would define
        aggregation windows, suppression rules for small groups, and access controls for each role.
      </Alert>

      <div className="flex flex-wrap gap-3">
        <Link to="/app/facilitator/cohorts" className="text-xs font-semibold text-royal hover:underline">
          View learner-level cohort data
        </Link>
        <Link to="/app/facilitator/assessments" className="text-xs font-semibold text-royal hover:underline">
          Review assessments
        </Link>
        <Link to="/app/profile" className="text-xs font-semibold text-royal hover:underline">
          Profile and settings
        </Link>
      </div>
    </div>
  );
}
