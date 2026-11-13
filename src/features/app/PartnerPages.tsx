import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  FolderKanban,
  GraduationCap,
  Layers,
  Target,
  Users,
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
  Dialog,
  Field,
  ProgressBar,
  Select,
  StatCard,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { partnerService } from '@/services/partnerService';
import type { Programme, Project } from '@/types';
import { formatDate, formatDueDate, percent } from '@/utils/format';
import { FilterToolbar, PanelEmpty, useAsyncAction } from '@/features/app/shared';

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

export function PartnerOverviewPage() {
  useDocumentTitle('Partner overview');
  const { user } = useAuth();
  const state = useDemoData();

  if (!user) return null;

  const participants = state.users.filter((entry) => entry.role === 'participant');
  const projects = state.projects;
  const participation = state.programmes.slice(0, 4).map((programme) => ({
    name: programme.title.length > 16 ? `${programme.title.slice(0, 14)}…` : programme.title,
    enrolled: state.enrolments.filter((enrolment) => enrolment.programmeId === programme.id).length,
    capacity: programme.capacity,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner overview"
        description={`Programme and project overview for ${user.organization}. No partnership, funding or endorsement is implied by this demonstration.`}
        eyebrow="Partner workspace"
        actions={
          <Link
            to="/app/partner/reports"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Impact reports
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Programmes in catalogue" value={state.programmes.length} icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Demonstration participants" value={participants.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Level Two projects" value={projects.length} icon={<FolderKanban className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Valid certificates" value={state.certificates.filter((certificate) => certificate.status === 'valid').length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} hint="Demonstration registry" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Programme participation" description="Enrolment against capacity across the demonstration catalogue." />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participation} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="enrolled" name="Enrolled participants" fill="#1e4fd8" radius={[3, 3, 0, 0]} maxBarSize={26} />
                  <Bar dataKey="capacity" name="Planned capacity" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What a partner can see" />
          <CardBody className="space-y-3 text-xs leading-5 text-slate">
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />Aggregate participation and completion for programmes they support.</p>
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />Project summaries that participants have chosen to publish.</p>
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />Certificate counts from the verification registry.</p>
            <p className="flex gap-2"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />They do not see learner contact details, assessment responses or safeguarding case notes.</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Project showcase highlights" description="Published team projects. These are demonstrations, not funded or endorsed partnerships." action={<Link to="/app/partner/showcase" className="text-xs font-semibold text-royal hover:underline">Open showcase</Link>} />
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.slice(0, 2).map((project) => {
              const team = state.teams.find((entry) => entry.id === project.teamId);
              return (
                <div key={project.id} className="rounded-md border border-line p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{project.theme}</Badge>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="mt-2 text-[0.9375rem] font-semibold text-ink">{project.title}</p>
                  <p className="mt-0.5 text-2xs text-slate">{team?.name}</p>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate">{project.summary}</p>
                  <Link to="/app/partner/showcase" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-royal hover:underline">
                    Read project <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Alert variant="warning" title="No implied partnership">
        This workspace does not represent a real funding relationship, endorsement or memorandum of understanding.
        Any production partner view would be provisioned only after a signed agreement and a data-sharing review.
      </Alert>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Programmes                                                          */
/* ------------------------------------------------------------------ */

export function PartnerProgrammesPage() {
  useDocumentTitle('Supported programmes');
  const { user } = useAuth();
  const state = useDemoData();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [detail, setDetail] = useState<Programme | null>(null);
  const [briefing, setBriefing] = useState<Programme | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;
  const userId = user.id;

  const filtered = state.programmes
    .filter((programme) => (level === 'all' ? true : String(programme.level) === level))
    .filter((programme) => (status === 'all' ? true : programme.status === status))
    .filter((programme) => `${programme.title} ${programme.theme} ${programme.summary}`.toLowerCase().includes(query.trim().toLowerCase()));

  async function requestBriefing() {
    if (!briefing) return;
    if (note.trim().length < 15) {
      setError('Add a short note about your interest so the programme team can respond usefully.');
      return;
    }
    setError('');
    const result = await run(
      'briefing',
      () => partnerService.requestBriefing(userId, briefing.id, note.trim()),
      {
        successTitle: 'Briefing request recorded',
        successDescription: 'The programme team would be notified in production. This is not a funding commitment.',
        onSuccess: () => {
          setBriefing(null);
          setNote('');
        },
      },
    );
    if (result) toast({ title: 'No commitment created', description: 'A briefing request does not create a partnership, funding agreement or endorsement.', variant: 'info' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programme portfolio"
        description="The demonstration programme catalogue. Support relationships are not modelled in this build."
        eyebrow="Programme support"
      />

      <Alert variant="info" title="Catalogue, not a partnership list">
        These programmes are seeded for demonstration. A real partner view would show only programmes covered by a
        signed agreement, with the scope of support and reporting obligations made explicit.
      </Alert>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search programmes"
        resultLabel={`${filtered.length} of ${state.programmes.length} programmes`}
        onReset={() => {
          setQuery('');
          setLevel('all');
          setStatus('all');
        }}
      >
        <Select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Filter by level">
          <option value="all">All levels</option>
          <option value="1">Level One</option>
          <option value="2">Level Two</option>
        </Select>
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
          <PanelEmpty title="No programmes match" description="Try a different level, status or search term." icon={<GraduationCap className="h-5 w-5" aria-hidden="true" />} />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((programme) => (
            <Card key={programme.id}>
              <CardBody>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={programme.status} />
                  <Badge variant="outline">Level {programme.level}</Badge>
                  <Badge variant="neutral">{programme.theme}</Badge>
                </div>
                <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{programme.title}</h2>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate">{programme.summary}</p>
                <div className="mt-3">
                  <ProgressBar
                    value={percent(programme.enrolledCount, programme.capacity)}
                    label={`${programme.enrolledCount} of ${programme.capacity} places`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <p className="text-2xs text-slate">{programme.cohort} · {programme.durationWeeks} weeks</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDetail(programme)}>Overview</Button>
                    <Button size="sm" onClick={() => { setBriefing(programme); setNote(''); setError(''); }}>Request briefing</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

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
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Participation</p>
                <p className="mt-1 text-xs text-ink">{detail.enrolledCount} of {detail.capacity} places</p>
              </div>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Outcomes</p>
              <ul className="mt-1.5 space-y-1">
                {detail.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2 text-xs"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />{outcome}</li>
                ))}
              </ul>
            </div>
            <Alert variant="info" title="No endorsement">
              Describing a programme does not imply that your organisation funds, endorses or accredits it.
            </Alert>
          </div>
        )}
      </Dialog>

      <Dialog
        open={Boolean(briefing)}
        onClose={() => setBriefing(null)}
        title="Request a programme briefing"
        description={briefing?.title}
        footer={
          <>
            <Button variant="outline" onClick={() => setBriefing(null)}>Cancel</Button>
            <Button onClick={() => void requestBriefing()} loading={isPending('briefing')}>Send request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="info" title="What this does">
            Records a demonstration request for the programme team. It does not create a funding relationship,
            partnership or commitment of any kind.
          </Alert>
          <Field label="Your interest" htmlFor="briefing-note" required error={error} hint="For example: thematic fit, geography, or the type of support you are exploring.">
            <Textarea
              id="briefing-note"
              rows={5}
              value={note}
              onChange={(event) => { setNote(event.target.value); setError(''); }}
              placeholder="We are exploring support for digital skills in…"
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project showcase                                                    */
/* ------------------------------------------------------------------ */

export function PartnerShowcasePage() {
  useDocumentTitle('Project showcase');
  const state = useDemoData();
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('all');
  const [detail, setDetail] = useState<Project | null>(null);

  const themes = [...new Set(state.projects.map((project) => project.theme))].sort();
  const filtered = state.projects
    .filter((project) => (theme === 'all' ? true : project.theme === theme))
    .filter((project) => `${project.title} ${project.summary} ${project.problem}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project showcase"
        description="Level Two team projects shared for learning and demonstration. Publication does not imply partner endorsement."
        eyebrow="Programme support"
      />

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search projects"
        resultLabel={`${filtered.length} of ${state.projects.length} projects`}
        onReset={() => {
          setQuery('');
          setTheme('all');
        }}
      >
        <Select value={theme} onChange={(event) => setTheme(event.target.value)} aria-label="Filter by theme">
          <option value="all">All themes</option>
          {themes.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
        </Select>
      </FilterToolbar>

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty title="No projects match" description="Try another theme or clear the search." icon={<Layers className="h-5 w-5" aria-hidden="true" />} />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((project) => {
            const team = state.teams.find((entry) => entry.id === project.teamId);
            const mentor = state.users.find((entry) => entry.id === team?.mentorId);
            const approved = project.milestones.filter((milestone) => milestone.status === 'approved').length;
            return (
              <Card key={project.id}>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{project.theme}</Badge>
                    <StatusBadge status={project.status} />
                  </div>
                  <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{project.title}</h2>
                  <p className="mt-0.5 text-2xs text-slate">{team?.name} · Mentor: {mentor?.name ?? 'Unassigned'}</p>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate">{project.summary}</p>
                  <div className="mt-3">
                    <ProgressBar value={percent(approved, Math.max(1, project.milestones.length))} label={`${approved} of ${project.milestones.length} milestones approved`} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <span className="text-2xs text-slate">{project.resources.length} shared resources</span>
                    <Button size="sm" variant="outline" onClick={() => setDetail(project)}>Read project</Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Alert variant="info" title="Participant consent">
        Project summaries are shown only where participants have agreed to share them. Production would allow a team to
        withdraw a project from the showcase at any time.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.title ?? 'Project'}
        description={detail ? `${detail.theme} · ${state.teams.find((team) => team.id === detail.teamId)?.name ?? 'Team'}` : undefined}
        size="lg"
        footer={<Button variant="outline" onClick={() => setDetail(null)}>Close</Button>}
      >
        {detail && (
          <div className="space-y-4 text-sm leading-6 text-slate">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={detail.status} />
              <Badge variant="outline">{detail.theme}</Badge>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Problem</p>
              <p className="mt-1.5 text-xs leading-5 text-slate">{detail.problem}</p>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Approach</p>
              <p className="mt-1.5 text-xs leading-5 text-slate">{detail.summary}</p>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Objectives</p>
              <ul className="mt-1.5 space-y-1">
                {detail.objectives.map((objective) => (
                  <li key={objective} className="flex gap-2 text-xs"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />{objective}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Milestones</p>
              <ul className="mt-1.5 space-y-1.5">
                {detail.milestones.map((milestone) => (
                  <li key={milestone.id} className="flex items-center justify-between gap-3 rounded-md border border-line p-2.5">
                    <span className="text-xs text-ink">{milestone.title}</span>
                    <StatusBadge status={milestone.status} />
                  </li>
                ))}
              </ul>
            </div>
            {detail.milestones.length > 0 && detail.milestones[detail.milestones.length - 1]?.dueAt ? (
              <p className="text-2xs text-slate">
                Latest milestone due {formatDueDate(detail.milestones[detail.milestones.length - 1].dueAt)}.
                This is a demonstration project, not a funded or evaluated intervention.
              </p>
            ) : (
              <p className="text-2xs text-slate">
                This is a demonstration project, not a funded or evaluated intervention.
              </p>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Impact reports                                                      */
/* ------------------------------------------------------------------ */

export function PartnerReportsPage() {
  useDocumentTitle('Impact reports');
  const state = useDemoData();
  const { toast } = useToast();

  const participation = state.programmes.map((programme) => ({
    name: programme.title.length > 16 ? `${programme.title.slice(0, 14)}…` : programme.title,
    enrolled: state.enrolments.filter((enrolment) => enrolment.programmeId === programme.id).length,
    capacity: programme.capacity,
  }));

  const buckets = [
    { label: '0–25%', min: 0, max: 25 },
    { label: '26–50%', min: 26, max: 50 },
    { label: '51–75%', min: 51, max: 75 },
    { label: '76–100%', min: 76, max: 100 },
  ].map((bucket) => ({
    ...bucket,
    learners: state.enrolments.filter((enrolment) => enrolment.progress >= bucket.min && enrolment.progress <= bucket.max).length,
  }));

  function exportReport() {
    downloadCsv('youthrise-demo-partner-impact-report.csv', [
      ['Indicator', 'Value', 'Note'],
      ['Programmes', state.programmes.length, 'Demonstration catalogue'],
      ['Enrolments', state.enrolments.length, 'Seeded demonstration records'],
      ['Projects', state.projects.length, 'Level Two demonstration projects'],
      ['Valid certificates', state.certificates.filter((certificate) => certificate.status === 'valid').length, 'Demonstration registry only'],
      [],
      ['Programme', 'Enrolled', 'Capacity', 'Average completion %'],
      ...state.programmes.map((programme) => {
        const members = state.enrolments.filter((enrolment) => enrolment.programmeId === programme.id);
        const average = members.length
          ? Math.round(members.reduce((sum, enrolment) => sum + enrolment.progress, 0) / members.length)
          : 0;
        return [programme.title, members.length, programme.capacity, average];
      }),
    ]);
    toast({
      title: 'Impact report exported',
      description: 'Aggregate demonstration data only. Do not cite externally as verified impact.',
      variant: 'success',
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impact reports"
        description="Aggregate programme and project indicators. These are demonstration figures, not evaluated outcomes."
        eyebrow="Programme support"
        actions={
          <Button variant="outline" onClick={exportReport} iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}>
            Export report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Programmes" value={state.programmes.length} icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Enrolments" value={state.enrolments.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Projects" value={state.projects.length} icon={<FolderKanban className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Certificates" value={state.certificates.filter((certificate) => certificate.status === 'valid').length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Participation" description="Enrolment against capacity by programme." />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participation} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="enrolled" name="Enrolled participants" fill="#1e4fd8" radius={[3, 3, 0, 0]} maxBarSize={26} />
                  <Bar dataKey="capacity" name="Planned capacity" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Completion distribution" description="Learners by percentage of lessons completed." />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="learners" name="Learners" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Programme indicators" description="Aggregate table with no learner-level personal data." />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <caption className="sr-only">Aggregate programme indicators</caption>
              <thead>
                <tr>
                  <th scope="col">Programme</th>
                  <th scope="col">Level</th>
                  <th scope="col">Enrolled</th>
                  <th scope="col">Capacity</th>
                  <th scope="col">Average completion</th>
                  <th scope="col">Projects</th>
                </tr>
              </thead>
              <tbody>
                {state.programmes.map((programme) => {
                  const members = state.enrolments.filter((enrolment) => enrolment.programmeId === programme.id);
                  const average = members.length
                    ? Math.round(members.reduce((sum, enrolment) => sum + enrolment.progress, 0) / members.length)
                    : 0;
                  return (
                    <tr key={programme.id}>
                      <td className="font-medium text-ink">{programme.title}</td>
                      <td className="text-xs text-slate">Level {programme.level}</td>
                      <td className="text-xs text-ink">{members.length}</td>
                      <td className="text-xs text-ink">{programme.capacity}</td>
                      <td className="text-xs font-semibold text-ink">{average}%</td>
                      <td className="text-xs text-ink">{state.teams.filter((team) => team.programmeId === programme.id).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Reporting limits" />
        <CardBody className="space-y-3 text-xs leading-5 text-slate">
          <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />These indicators describe activity, not impact. Completion is not the same as learning, employment or wellbeing.</p>
          <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />No tracer study, control group or independent evaluation has been conducted.</p>
          <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />Production reports should suppress small groups and document the data source and collection period.</p>
        </CardBody>
      </Card>

      <Alert variant="warning" title="Do not cite as verified impact">
        The demonstration does not include real participation, completion or employment data. Any external use of these
        figures would misrepresent the project.
      </Alert>

      <div className="flex flex-wrap gap-3">
        <Link to="/app/partner/showcase" className="text-xs font-semibold text-royal hover:underline">Project showcase</Link>
        <Link to="/app/partner/programmes" className="text-xs font-semibold text-royal hover:underline">Programme portfolio</Link>
        <Link to="/impact" className="text-xs font-semibold text-royal hover:underline">Public impact approach</Link>
      </div>
    </div>
  );
}
