import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  Layers,
  Plus,
  Send,
  UserPlus,
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
import { nominationService } from '@/services/partnerService';
import type { CohortMember, Nomination } from '@/types';
import { formatDate, percent, titleCase } from '@/utils/format';
import { FilterToolbar, PanelEmpty, PersonCell, useAsyncAction, usePagination } from '@/features/app/shared';

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

function useInstitutionNominations() {
  const { user } = useAuth();
  const state = useDemoData();
  const institution = user?.organization ?? '';
  const nominations = state.nominations.filter((nomination) => nomination.institution === institution);
  return { user, state, institution, nominations };
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export function UniversityOverviewPage() {
  useDocumentTitle('Institution overview');
  const { user } = useInstitutionNominations();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumb (Image 3) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Citizen Scholars Program &mdash; {user.organization || 'Dev Sandbox'}
          </p>
        </div>
        <Link
          to="/app/university/nominations"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Nominate Student
        </Link>
      </div>

      {/* 2. Top Grid: Quick Actions (6 tiles) + Priority Queue (Image 3) */}
      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.9fr]">
        {/* Quick Actions 6-tile Grid */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
            <span className="text-2xs text-slate-400 font-medium">Most-used workflows</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tile 1: Add Student */}
            <Link
              to="/app/university/nominations"
              className="group rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex items-center gap-2 text-blue-600">
                <UserPlus className="h-4.5 w-4.5" />
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Add Student</span>
              </div>
              <p className="mt-1.5 text-2xs text-slate-500">Create a student profile</p>
            </Link>

            {/* Tile 2: Students */}
            <Link
              to="/app/university/nominations"
              className="group rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <div className="flex items-center gap-2 text-emerald-600">
                <Users className="h-4.5 w-4.5" />
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Students</span>
              </div>
              <p className="mt-1.5 text-2xs text-slate-500">Search and update records</p>
            </Link>

            {/* Tile 3: CEL Experiences */}
            <Link
              to="/app/university/reports"
              className="group rounded-xl border border-purple-100 bg-purple-50/40 p-3.5 transition hover:border-purple-300 hover:bg-purple-50"
            >
              <div className="flex items-center gap-2 text-purple-600">
                <Send className="h-4.5 w-4.5" />
                <span className="text-xs font-bold text-slate-900 group-hover:text-purple-600">CEL Experiences</span>
              </div>
              <p className="mt-1.5 text-2xs text-slate-500">Review approvals and forms</p>
            </Link>

            {/* Tile 4: Manage Cohorts */}
            <Link
              to="/app/university/reports"
              className="group rounded-xl border border-teal-100 bg-teal-50/40 p-3.5 transition hover:border-teal-300 hover:bg-teal-50"
            >
              <div className="flex items-center gap-2 text-teal-600">
                <Layers className="h-4.5 w-4.5" />
                <span className="text-xs font-bold text-slate-900 group-hover:text-teal-600">Manage Cohorts</span>
              </div>
              <p className="mt-1.5 text-2xs text-slate-500">Deadlines and settings</p>
            </Link>

            {/* Tile 5: New Campaign */}
            <Link
              to="/app/notifications"
              className="group rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 transition hover:border-amber-300 hover:bg-amber-50"
            >
              <div className="flex items-center gap-2 text-amber-600">
                <Send className="h-4.5 w-4.5" />
                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600">New Campaign</span>
              </div>
              <p className="mt-1.5 text-2xs text-slate-500">Send a targeted update</p>
            </Link>

            {/* Tile 6: View Reports */}
            <Link
              to="/app/university/reports"
              className="group rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex items-center gap-2 text-indigo-600">
                <BarChart3 className="h-4.5 w-4.5" />
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">View Reports</span>
              </div>
              <p className="mt-1.5 text-2xs text-slate-500">Program-level metrics</p>
            </Link>
          </div>
        </div>

        {/* Priority Queue Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Priority Queue</h2>
              <span className="text-2xs font-semibold text-slate-500">16 students</span>
            </div>

            <ul className="mt-3.5 space-y-3">
              <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs">
                <span className="font-medium text-slate-700">Orientation Pending</span>
                <span className="font-bold text-slate-900">0</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs">
                <span className="font-medium text-slate-700">CEL Not Approved</span>
                <span className="font-bold text-amber-600">12</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs">
                <span className="font-medium text-slate-700">Exit Interview Pending</span>
                <span className="font-bold text-blue-600">16</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-center text-2xs text-slate-500 font-medium">
            No upcoming deadlines
          </div>
        </div>
      </div>

      {/* 3. Metrics Row: 5 Cards matching Image 3 */}
      <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {/* Card 1: Total Students */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users className="h-4 w-4" />
          </span>
          <p className="text-2xl font-black text-slate-900 mt-3">355</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">Total Students</p>
          <p className="text-2xs text-slate-400 mt-1">+10 in Dev Sandbox</p>
        </div>

        {/* Card 2: Active */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-4 w-4" />
          </span>
          <p className="text-2xl font-black text-slate-900 mt-3">154</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">Active</p>
          <p className="text-2xs text-slate-400 mt-1">In progress</p>
        </div>

        {/* Card 3: Completed */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <p className="text-2xl font-black text-slate-900 mt-3">106</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">Completed</p>
          <p className="text-2xs text-slate-400 mt-1">All requirements done</p>
        </div>

        {/* Card 4: Incomplete / Inactive */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle className="h-4 w-4" />
          </span>
          <p className="text-2xl font-black text-slate-900 mt-3">95</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">Incomplete / Inactive</p>
          <p className="text-2xs text-slate-400 mt-1">Did not finish</p>
        </div>

        {/* Card 5: Needs Attention */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <p className="text-2xl font-black text-slate-900 mt-3">16</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">Needs Attention</p>
          <p className="text-2xs text-slate-400 mt-1">Unique students in current</p>
        </div>
      </div>

      {/* 4. Bottom Grid: CEL Approval Status (Multi-tier bar) + Cohort Overview (Image 3) */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        {/* CEL Approval Status */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">CEL Approval Status</h2>
            </div>
            <span className="text-2xs text-slate-400 font-medium">255 records &middot; 82% approved vs active</span>
          </div>

          {/* Segmented Color Bar */}
          <div className="mt-5">
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
              <div className="bg-emerald-500 h-full" style={{ width: '49%' }} title="Form Approved (49%)" />
              <div className="bg-blue-500 h-full" style={{ width: '31%' }} title="Needs Form (31%)" />
              <div className="bg-amber-500 h-full" style={{ width: '15%' }} title="Verbal Approval (15%)" />
              <div className="bg-slate-400 h-full" style={{ width: '5%' }} title="No CEL Plan (5%)" />
            </div>

            <ul className="mt-5 space-y-2.5">
              <li className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  CEL Form Approved
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">126</span>
                  <span className="text-2xs text-slate-400 w-8 text-right">49%</span>
                </div>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  CEL Needs Form
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">78</span>
                  <span className="text-2xs text-slate-400 w-8 text-right">31%</span>
                </div>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  CEL Verbal Approval
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">37</span>
                  <span className="text-2xs text-slate-400 w-8 text-right">15%</span>
                </div>
              </li>
              <li className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                  No CEL Plan
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">14</span>
                  <span className="text-2xs text-slate-400 w-8 text-right">5%</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Cohort Overview Bars */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Cohort Overview</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {[
              { cohort: 'Fall 2022', cel: 4, completed: 4, total: 4, pct: 100 },
              { cohort: 'Spring 2023', cel: 9, completed: 9, total: 9, pct: 100 },
              { cohort: 'Fall 2023', cel: 8, completed: 8, total: 8, pct: 100 },
              { cohort: 'Spring 2024', cel: 14, completed: 14, total: 14, pct: 100 },
              { cohort: 'Fall 2024', cel: 2, completed: 2, total: 2, pct: 100 },
              { cohort: 'Spring 2025', cel: 25, completed: 25, total: 25, pct: 100 },
            ].map((item) => (
              <div key={item.cohort}>
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-semibold text-slate-800">{item.cohort}</span>
                  <span className="text-slate-400 font-medium">
                    {item.cel} CEL &middot; {item.completed} completed &middot; {item.total} total
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nominations                                                         */
/* ------------------------------------------------------------------ */

export function UniversityNominationsPage() {
  useDocumentTitle('Nominations');
  const { user, state, institution, nominations } = useInstitutionNominations();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ learnerName: '', learnerEmail: '', programmeId: '', note: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = nominations
    .filter((nomination) => (tab === 'all' ? true : nomination.status === tab))
    .filter((nomination) => `${nomination.learnerName} ${nomination.learnerEmail}`.toLowerCase().includes(query.trim().toLowerCase()));
  const pagination = usePagination(filtered, 8);

  if (!user) return null;

  function validate() {
    const next: Record<string, string> = {};
    if (form.learnerName.trim().length < 3) next.learnerName = 'Enter the learner’s full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.learnerEmail.trim())) next.learnerEmail = 'Enter a valid email address.';
    if (!form.programmeId) next.programmeId = 'Choose a programme.';
    if (form.note.trim().length > 300) next.note = 'Keep the note under 300 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function create() {
    if (!validate()) return;
    const result = await run(
      'nominate',
      () =>
        nominationService.create({
          institution,
          learnerName: form.learnerName.trim(),
          learnerEmail: form.learnerEmail.trim(),
          programmeId: form.programmeId,
          note: form.note.trim() || undefined,
        }),
      {
        successTitle: 'Nomination recorded',
        successDescription: 'In production, the learner would receive an invitation and must consent before any record is shared.',
        onSuccess: () => {
          setOpen(false);
          setForm({ learnerName: '', learnerEmail: '', programmeId: '', note: '' });
        },
      },
    );
    if (result) toast({ title: 'Consent reminder', description: 'A nomination is not an enrolment. The learner must register and accept the privacy notice.', variant: 'info' });
  }

  const columns: Column<Nomination>[] = [
    {
      key: 'learner',
      header: 'Learner',
      render: (nomination) => (
        <div>
          <p className="text-[0.8125rem] font-semibold text-ink">{nomination.learnerName}</p>
          <p className="text-2xs text-slate">{nomination.learnerEmail}</p>
        </div>
      ),
    },
    {
      key: 'programme',
      header: 'Programme',
      render: (nomination) => <span className="text-xs text-slate">{state.programmes.find((programme) => programme.id === nomination.programmeId)?.title}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (nomination) => <StatusBadge status={nomination.status} />,
    },
    {
      key: 'date',
      header: 'Nominated',
      render: (nomination) => <span className="text-2xs text-slate">{formatDate(nomination.nominatedAt)}</span>,
    },
    {
      key: 'note',
      header: 'Note',
      render: (nomination) => <span className="text-2xs text-slate">{nomination.note ?? '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nominations"
        description="Nominate learners for a programme. A nomination records interest; it does not guarantee a place or create an account."
        eyebrow="Institution"
        actions={
          <Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Nominate a learner
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={nominations.length} icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Awaiting response" value={nominations.filter((nomination) => nomination.status === 'invited' || nomination.status === 'nominated').length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Registered" value={nominations.filter((nomination) => nomination.status === 'registered').length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Accepted" value={nominations.filter((nomination) => nomination.status === 'accepted').length} icon={<Award className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <Tabs
        ariaLabel="Nomination status"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'All', count: nominations.length },
          { id: 'nominated', label: 'Nominated', count: nominations.filter((nomination) => nomination.status === 'nominated').length },
          { id: 'invited', label: 'Invited', count: nominations.filter((nomination) => nomination.status === 'invited').length },
          { id: 'registered', label: 'Registered', count: nominations.filter((nomination) => nomination.status === 'registered').length },
          { id: 'accepted', label: 'Accepted', count: nominations.filter((nomination) => nomination.status === 'accepted').length },
          { id: 'declined', label: 'Declined', count: nominations.filter((nomination) => nomination.status === 'declined').length },
        ]}
      />

      <div className="max-w-md">
        <label htmlFor="nomination-search" className="sr-only">Search nominations</label>
        <Input
          id="nomination-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by learner name or email"
        />
      </div>

      <Card>
        <CardBody className="p-0">
          <DataTable
            rows={pagination.pageItems}
            columns={columns}
            getRowKey={(nomination) => nomination.id}
            caption="Learner nominations submitted by this institution"
            emptyState={<PanelEmpty title="No nominations in this view" description="Try another status or nominate a learner." action={<Button variant="outline" onClick={() => setTab('all')}>Show all</Button>} />}
          />
        </CardBody>
        <div className="border-t border-line px-5 py-3">
          <Pagination page={pagination.page} pageCount={pagination.pageCount} onChange={pagination.setPage} totalLabel={`${filtered.length} nominations`} />
        </div>
      </Card>

      <Alert variant="info" title="Data minimisation">
        Only collect the information needed to invite a learner. Do not upload student numbers, transcripts or identity
        documents in this demonstration. In production, verification would happen through an approved institutional
        process with the learner's consent.
      </Alert>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nominate a learner"
        description={`Institution: ${institution}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void create()} loading={isPending('nominate')}>Record nomination</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Learner name" htmlFor="nomination-name" required error={errors.learnerName}>
              <Input id="nomination-name" value={form.learnerName} onChange={(event) => setForm({ ...form, learnerName: event.target.value })} />
            </Field>
            <Field label="Learner email" htmlFor="nomination-email" required error={errors.learnerEmail}>
              <Input id="nomination-email" type="email" value={form.learnerEmail} onChange={(event) => setForm({ ...form, learnerEmail: event.target.value })} placeholder="name@example.edu" />
            </Field>
          </div>
          <Field label="Programme" htmlFor="nomination-programme" required error={errors.programmeId}>
            <Select id="nomination-programme" value={form.programmeId} onChange={(event) => setForm({ ...form, programmeId: event.target.value })}>
              <option value="">Choose a programme</option>
              {state.programmes.filter((programme) => programme.status !== 'draft').map((programme) => (
                <option key={programme.id} value={programme.id}>{programme.title} · Level {programme.level}</option>
              ))}
            </Select>
          </Field>
          <Field label="Note to the programme team" htmlFor="nomination-note" error={errors.note} hint="Do not include sensitive information about the learner." optional>
            <Textarea id="nomination-note" rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          </Field>
          <Alert variant="warning" title="Consent and accuracy">
            Confirm that the learner knows you are sharing their name and email for this purpose. Nominations that are
            inaccurate or submitted without consent should be withdrawn.
          </Alert>
        </div>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cohort                                                              */
/* ------------------------------------------------------------------ */

export function UniversityCohortPage() {
  useDocumentTitle('Cohort overview');
  const { state } = useInstitutionNominations();
  const [programmeId, setProgrammeId] = useState('all');
  const [query, setQuery] = useState('');
  const [completion, setCompletion] = useState('all');
  const { toast } = useToast();

  const participants = state.users.filter((entry) => entry.role === 'participant');
  const rows: CohortMember[] = state.enrolments
    .filter((enrolment) => participants.some((participant) => participant.id === enrolment.userId))
    .filter((enrolment) => (programmeId === 'all' ? true : enrolment.programmeId === programmeId))
    .map((enrolment) => ({
      userId: enrolment.userId,
      enrolmentId: enrolment.id,
      programmeId: enrolment.programmeId,
      progress: enrolment.progress,
      attendance: 58 + ((enrolment.userId.charCodeAt(2) + enrolment.programmeId.length) % 43),
      completion: (enrolment.progress >= 100 ? 'completed' : enrolment.progress === 0 ? 'not_started' : enrolment.progress < 35 ? 'at_risk' : 'on_track') as CohortMember['completion'],
      enrolledAt: enrolment.enrolledAt,
    }))
    .filter((row) => {
      const learner = state.users.find((entry) => entry.id === row.userId);
      return `${learner?.name ?? ''} ${learner?.country ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
    })
    .filter((row) => (completion === 'all' ? true : row.completion === completion));
  const pagination = usePagination(rows, 10);

  function exportRows() {
    downloadCsv('youthrise-demo-institution-cohort.csv', [
      ['Learner', 'Programme', 'Progress %', 'Completion', 'Enrolled'],
      ...rows.map((row) => [
        state.users.find((entry) => entry.id === row.userId)?.name ?? 'Unknown',
        state.programmes.find((programme) => programme.id === row.programmeId)?.title ?? '',
        row.progress,
        titleCase(row.completion),
        formatDate(row.enrolledAt),
      ]),
    ]);
    toast({
      title: 'Cohort export ready',
      description: 'This file contains demonstration learner names. Handle it as personal data.',
      variant: 'success',
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort overview"
        description="Programme participation across the demonstration dataset. Institution-specific mapping is not available in this build."
        eyebrow="Institution"
        actions={
          <Button variant="outline" onClick={exportRows} iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}>
            Export CSV
          </Button>
        }
      />

      <Alert variant="warning" title="Read-only demonstration view">
        The demonstration cannot verify which learners belong to your institution. In production this page would be
        scoped to consented, verified learners only, with access logging.
      </Alert>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search learners"
        resultLabel={`${rows.length} enrolments`}
        onReset={() => {
          setQuery('');
          setProgrammeId('all');
          setCompletion('all');
        }}
      >
        <Select value={programmeId} onChange={(event) => setProgrammeId(event.target.value)} aria-label="Filter by programme">
          <option value="all">All programmes</option>
          {state.programmes.map((programme) => (
            <option key={programme.id} value={programme.id}>{programme.title}</option>
          ))}
        </Select>
        <Select value={completion} onChange={(event) => setCompletion(event.target.value)} aria-label="Filter by completion">
          <option value="all">All statuses</option>
          <option value="on_track">On track</option>
          <option value="at_risk">At risk</option>
          <option value="completed">Completed</option>
          <option value="not_started">Not started</option>
        </Select>
      </FilterToolbar>

      <Card>
        <CardBody className="p-0">
          <DataTable
            rows={pagination.pageItems}
            getRowKey={(row) => row.enrolmentId}
            caption="Learner enrolments, progress and certificate status"
            emptyState={<PanelEmpty title="No learners match" description="Try another programme or status." />}
            columns={[
              {
                key: 'learner',
                header: 'Learner',
                render: (row) => {
                  const learner = state.users.find((entry) => entry.id === row.userId);
                  return <PersonCell user={learner} hint={learner?.country} />;
                },
              },
              {
                key: 'programme',
                header: 'Programme',
                render: (row) => <span className="text-xs text-slate">{state.programmes.find((programme) => programme.id === row.programmeId)?.title}</span>,
              },
              {
                key: 'progress',
                header: 'Progress',
                render: (row) => <div className="w-32"><ProgressBar value={row.progress} label={`${row.progress}%`} /></div>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <StatusBadge status={row.completion} />,
              },
              {
                key: 'certificate',
                header: 'Certificate',
                render: (row) => {
                  const certificate = state.certificates.find(
                    (entry) => entry.participantId === row.userId && entry.programmeId === row.programmeId,
                  );
                  return certificate ? <StatusBadge status={certificate.status} /> : <Badge variant="neutral">Not issued</Badge>;
                },
              },
              {
                key: 'enrolled',
                header: 'Enrolled',
                render: (row) => <span className="text-2xs text-slate">{formatDate(row.enrolledAt)}</span>,
              },
            ]}
          />
        </CardBody>
        <div className="border-t border-line px-5 py-3">
          <Pagination page={pagination.page} pageCount={pagination.pageCount} onChange={pagination.setPage} totalLabel={`${rows.length} enrolments`} />
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export function UniversityReportsPage() {
  useDocumentTitle('Outcome reports');
  const { state, nominations } = useInstitutionNominations();
  const { toast } = useToast();

  const participation = state.programmes.map((programme) => {
    const enrolments = state.enrolments.filter((enrolment) => enrolment.programmeId === programme.id);
    return {
      name: programme.title.length > 16 ? `${programme.title.slice(0, 14)}…` : programme.title,
      enrolled: enrolments.length,
      capacity: programme.capacity,
      average: enrolments.length
        ? Math.round(enrolments.reduce((sum, enrolment) => sum + enrolment.progress, 0) / enrolments.length)
        : 0,
    };
  });

  function exportReport() {
    downloadCsv('youthrise-demo-institution-report.csv', [
      ['Programme', 'Level', 'Enrolled', 'Capacity', 'Average completion %'],
      ...participation.map((row) => [row.name, '', row.enrolled, row.capacity, row.average]),
      [],
      ['Nomination status', 'Count'],
      ...['nominated', 'invited', 'registered', 'accepted', 'declined'].map((status) => [
        titleCase(status),
        nominations.filter((nomination) => nomination.status === status).length,
      ]),
    ]);
    toast({ title: 'Report exported', description: 'Aggregate demonstration data only.', variant: 'success' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outcome reports"
        description="Aggregate participation and nomination data. No verified employment or progression outcomes are claimed."
        eyebrow="Institution"
        actions={
          <Button variant="outline" onClick={exportReport} iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}>
            Export report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Nominations" value={nominations.length} icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Enrolments" value={state.enrolments.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Programmes" value={state.programmes.length} icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Valid certificates" value={state.certificates.filter((certificate) => certificate.status === 'valid').length} icon={<Award className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <Card>
        <CardHeader title="Participation and completion" description="Enrolment and average lesson completion by programme." />
        <CardBody>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participation} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="enrolled" name="Enrolled" fill="#1e4fd8" radius={[3, 3, 0, 0]} maxBarSize={26} />
                <Bar dataKey="capacity" name="Capacity" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={26} />
                <Bar dataKey="average" name="Avg completion %" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Nomination outcomes" description="Current status of your institution's nominations." />
          <CardBody>
            <ul className="space-y-2.5">
              {['nominated', 'invited', 'registered', 'accepted', 'declined'].map((status) => {
                const count = nominations.filter((nomination) => nomination.status === status).length;
                return (
                  <li key={status}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate">{titleCase(status)}</span>
                      <span className="font-semibold text-ink">{count}</span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar value={percent(count, Math.max(1, nominations.length))} label={`${percent(count, Math.max(1, nominations.length))}% of nominations`} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What these reports can and cannot show" />
          <CardBody className="space-y-3 text-xs leading-5 text-slate">
            <p><span className="font-semibold text-ink">Can show:</span> participation, module completion, assessment completion and certificate status for consented learners.</p>
            <p><span className="font-semibold text-ink">Cannot show:</span> verified employment, salary outcomes or progression to further study. Those claims require a separate, consented tracer study.</p>
            <p>Small groups should be suppressed in production to avoid identifying individuals. This demonstration does not implement suppression.</p>
            <Link to="/impact" className="inline-flex items-center gap-1 font-semibold text-royal hover:underline">
              How YouthRise frames impact <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </CardBody>
        </Card>
      </div>

      <Alert variant="warning" title="No verified outcome claims">
        The platform must not imply accreditation, credit transfer or employment outcomes without evidence and consent.
        These charts are illustrative and must not be cited externally.
      </Alert>
    </div>
  );
}
