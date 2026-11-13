import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Check,
  Clock,
  Download,
  FileText,
  FolderKanban,
  Send,
  Target,
  Users,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Checkbox,
  Dialog,
  Field,
  FileUpload,
  Input,
  Pagination,
  StatCard,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DEMO_MODE } from '@/services/apiClient';
import { projectService, teamService } from '@/services/teamService';
import { sessionService } from '@/services/sessionService';
import type { ExchangeSession } from '@/types';
import { formatDate, formatDateTime, formatDueDate, relativeTime } from '@/utils/format';
import { PanelEmpty, PersonCell, useAsyncAction, usePagination } from '@/features/app/shared';
import { LiveProjectPanel, LiveTeamPanel } from '@/features/app/LiveWorkspacePanels';

function downloadCalendar(session: ExchangeSession) {
  const start = new Date(session.startsAt);
  const end = new Date(start.getTime() + session.durationMins * 60000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YouthRise Demonstration//Virtual Exchange//EN',
    'BEGIN:VEVENT',
    `UID:${session.id}@yep.demo`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${session.title} (YouthRise demonstration)`,
    `DESCRIPTION:${session.description.replace(/\n/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${session.id}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Virtual exchange                                                    */
/* ------------------------------------------------------------------ */

export function ParticipantExchangePage() {
  useDocumentTitle('Virtual exchange');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState('upcoming');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<ExchangeSession | null>(null);

  const userId = user?.id ?? '';

  const registrations = Object.entries(state.sessionRegistrations)
    .filter(([, users]) => users.includes(userId))
    .map(([id]) => id);
  const enrolments = state.enrolments.filter((enrolment) => enrolment.userId === userId);
  const relevant = state.sessions.filter(
    (session) =>
      enrolments.some((enrolment) => enrolment.programmeId === session.programmeId) ||
      state.sessionRegistrations[session.id]?.includes(userId),
  );
  const filtered = relevant
    .filter((session) => (tab === 'all' ? true : session.status === tab))
    .filter((session) => `${session.title} ${session.description}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const pagination = usePagination(filtered, 6);

  if (!user) return null;

  async function register(session: ExchangeSession) {
    await run(`register-${session.id}`, () => sessionService.register(session.id, userId), {
      successTitle: 'Registration confirmed',
      successDescription: `${session.title} has been added to your demonstration schedule.`,
    });
  }

  async function cancel(session: ExchangeSession) {
    await run(`cancel-${session.id}`, () => sessionService.cancel(session.id, userId), {
      successTitle: 'Registration cancelled',
      successDescription: 'Your place has been released in the demonstration schedule.',
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Virtual exchange"
        description="Facilitated cross-border sessions for your enrolled programmes. Times are shown in East Africa Time."
        eyebrow="Level One exchange"
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Session filters">
          {[
            { id: 'upcoming', label: 'Upcoming', count: relevant.filter((session) => session.status === 'upcoming').length },
            { id: 'completed', label: 'Completed', count: relevant.filter((session) => session.status === 'completed').length },
            { id: 'all', label: 'All sessions', count: undefined },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[0.8125rem] font-semibold transition ${
                tab === item.id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-slate hover:text-ink'
              }`}
            >
              {item.label}
              {typeof item.count === 'number' && (
                <span className={`rounded px-1.5 py-0.5 text-2xs ${tab === item.id ? 'bg-white/15 text-white' : 'bg-canvas text-slate'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <label htmlFor="exchange-search" className="sr-only">Search sessions</label>
          <Input
            id="exchange-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sessions"
            prefixIcon={<Video className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No sessions in this view"
            description={tab === 'upcoming' ? 'No upcoming sessions are scheduled for your programmes yet.' : 'Try a different filter or clear the search.'}
            action={query ? <Button variant="outline" onClick={() => setQuery('')}>Clear search</Button> : undefined}
            icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {pagination.pageItems.map((session) => {
            const registered = registrations.includes(session.id);
            const programme = state.programmes.find((entry) => entry.id === session.programmeId);
            const facilitator = state.users.find((entry) => entry.id === session.facilitatorId);
            return (
              <Card key={session.id}>
                <CardBody>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={session.status} />
                        <Badge variant="outline">{programme?.title ?? 'Programme session'}</Badge>
                        {registered && <Badge variant="success" icon={<Check className="h-3 w-3" aria-hidden="true" />}>Registered</Badge>}
                      </div>
                      <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">{session.title}</h2>
                      <p className="mt-1.5 max-w-3xl text-[0.8125rem] leading-6 text-slate">{session.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-2xs text-slate">
                        <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />{formatDateTime(session.startsAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{session.durationMins} minutes</span>
                        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" aria-hidden="true" />{session.registeredCount} of {session.capacity} places</span>
                      </div>
                      {facilitator && (
                        <div className="mt-3">
                          <PersonCell user={facilitator} hint="Facilitator" />
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                      {session.status === 'upcoming' && (
                        registered ? (
                          <Button variant="outline" size="sm" onClick={() => void cancel(session)} loading={isPending(`cancel-${session.id}`)}>
                            Cancel registration
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => void register(session)} loading={isPending(`register-${session.id}`)}>
                            Register
                          </Button>
                        )
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setDetail(session)}>
                        View details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          downloadCalendar(session);
                          toast({ title: 'Calendar file downloaded', description: 'The .ics file uses the session time in UTC.', variant: 'success' });
                        }}
                        iconLeft={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
                      >
                        Add to calendar
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          <Pagination page={pagination.page} pageCount={pagination.pageCount} onChange={pagination.setPage} totalLabel={`${pagination.total} sessions`} />
        </div>
      )}

      <Alert variant="info" title="How live sessions work">
        Sessions would run on an external meeting service. Registration records interest; it does not create a meeting
        account. Recordings and transcripts are shared only where consent allows. External links are disabled in this
        demonstration.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.title ?? 'Session details'}
        description={detail ? `${formatDateTime(detail.startsAt)} · ${detail.durationMins} minutes` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            {detail && detail.status === 'upcoming' && (
              registrations.includes(detail.id) ? (
                <Button variant="outline" onClick={() => void cancel(detail)} loading={isPending(`cancel-${detail.id}`)}>Cancel registration</Button>
              ) : (
                <Button onClick={() => void register(detail)} loading={isPending(`register-${detail.id}`)}>Register</Button>
              )
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4 text-sm leading-6 text-slate">
            <p>{detail.description}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-canvas p-3">
                <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Time zone</dt>
                <dd className="mt-1 text-ink">{detail.timezone}</dd>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Places</dt>
                <dd className="mt-1 text-ink">{detail.registeredCount} of {detail.capacity} represented</dd>
              </div>
            </dl>
            {detail.materials?.length ? (
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Materials</p>
                <ul className="mt-2 space-y-1.5">
                  {detail.materials.map((material) => (
                    <li key={material.label}>
                      <button
                        type="button"
                        onClick={() => toast({ title: 'Demonstration material', description: 'Files are placeholders in this build.', variant: 'info' })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        {material.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Alert variant="warning" title="External meeting link">
              The demonstration does not open external meeting links. In production, only registered participants would
              receive a time-limited join link.
            </Alert>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Team workspace                                                      */
/* ------------------------------------------------------------------ */

export function ParticipantTeamPage() {
  useDocumentTitle('My team');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const { run, isPending } = useAsyncAction();
  const [message, setMessage] = useState('');

  if (!DEMO_MODE) return <LiveTeamPanel />;
  if (!user) return null;
  const userId = user.id;

  const team = state.teams.find((entry) => entry.memberIds.includes(userId));
  const project = team ? state.projects.find((entry) => entry.teamId === team.id) : undefined;
  const mentor = team ? state.users.find((entry) => entry.id === team.mentorId) : undefined;

  if (!team) {
    return (
      <div className="space-y-6">
        <PageHeader title="My team" description="Your interdisciplinary project team and shared workspace." eyebrow="Workspace" />
        <Card>
          <PanelEmpty
            title="No team placement yet"
            description="Facilitators form Level Two teams using programme criteria and a human review step. You will be notified when a placement is proposed."
            action={<Link to="/impact-projects" className="text-sm font-semibold text-royal hover:underline">How team formation works</Link>}
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
        <Alert variant="info" title="Placement review">
          Team formation is not automated. Participants can review a proposed placement and raise a concern before the
          team is confirmed.
        </Alert>
      </div>
    );
  }

  const members = team.memberIds
    .map((id) => state.users.find((entry) => entry.id === id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  async function sendMessage() {
    if (!message.trim()) return;
    const body = message.trim();
    const result = await run('message', () => teamService.postMessage(team!.id, userId, body), {
      errorTitle: 'Message could not be sent',
    });
    if (result !== undefined) {
      setMessage('');
      toast({ title: 'Message posted', description: 'Visible to your team and mentor in this browser.', variant: 'success' });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        description={`${team.theme} · ${members.length} of ${team.capacity} members · Created ${formatDate(team.createdAt)}`}
        eyebrow="Team workspace"
        actions={
          project ? (
            <Link to="/app/project" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700">
              <FolderKanban className="h-4 w-4" aria-hidden="true" />
              Open project
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Team conversation" description="A shared space for coordination. Be respectful and avoid sharing personal data." />
            <CardBody>
              {team.messages.length === 0 ? (
                <p className="rounded-md bg-canvas p-4 text-xs text-slate">No messages yet. Start with a short introduction or a question.</p>
              ) : (
                <ul className="space-y-4">
                  {team.messages.map((entry) => {
                    const author = state.users.find((person) => person.id === entry.authorId);
                    return (
                      <li key={entry.id} className="flex gap-3">
                        <Avatar name={author?.name ?? 'Team member'} size="sm" tone={entry.authorId === userId ? 'royal' : 'navy'} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <p className="text-[0.8125rem] font-semibold text-ink">{author?.name ?? 'Team member'}</p>
                            <p className="text-2xs text-slate-400">{relativeTime(entry.sentAt)}</p>
                          </div>
                          <p className="mt-1 rounded-md rounded-tl-none bg-canvas px-3.5 py-2.5 text-[0.8125rem] leading-6 text-ink">{entry.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-5 border-t border-line pt-4">
                <Field label="Post a message" htmlFor="team-message" hint="Do not share passwords, health information or personal contact details.">
                  <Textarea
                    id="team-message"
                    rows={3}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Share an update, ask a question or propose a next step…"
                  />
                </Field>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-2xs text-slate">{message.length}/1000 characters</p>
                  <Button
                    onClick={() => void sendMessage()}
                    loading={isPending('message')}
                    disabled={!message.trim() || message.length > 1000}
                    iconLeft={<Send className="h-4 w-4" aria-hidden="true" />}
                  >
                    Post message
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Project snapshot" description={project?.title ?? 'No linked project'} action={project ? <StatusBadge status={project.status} /> : undefined} />
            <CardBody>
              {project ? (
                <>
                  <p className="text-[0.8125rem] leading-6 text-slate">{project.summary}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md bg-canvas p-3">
                      <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Milestones approved</p>
                      <p className="mt-1 text-lg font-semibold text-ink">{project.milestones.filter((milestone) => milestone.status === 'approved').length} of {project.milestones.length}</p>
                    </div>
                    <div className="rounded-md bg-canvas p-3">
                      <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Next due</p>
                      <p className="mt-1 text-lg font-semibold text-ink">
                        {formatDueDate(project.milestones.find((milestone) => milestone.status !== 'approved')?.dueAt ?? project.milestones[project.milestones.length - 1].dueAt)}
                      </p>
                    </div>
                  </div>
                  <Link to="/app/project" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-royal hover:underline">
                    Go to project workspace <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <p className="text-xs text-slate">Your team has not been linked to a project yet.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Members" description={`${members.length} of ${team.capacity} places filled`} />
            <CardBody className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-start gap-2.5">
                  <Avatar name={member.name} size="sm" tone={member.id === userId ? 'royal' : 'navy'} />
                  <div className="min-w-0">
                    <p className="truncate text-[0.8125rem] font-medium text-ink">{member.name}{member.id === userId ? ' (you)' : ''}</p>
                    <p className="text-2xs text-slate">{member.country} · {member.skills.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              ))}
              {members.length < team.capacity && (
                <p className="rounded bg-canvas p-2.5 text-2xs leading-5 text-slate">
                  {team.capacity - members.length} place{team.capacity - members.length === 1 ? '' : 's'} remain. Facilitators confirm any additions.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Mentor" />
            <CardBody>
              {mentor ? (
                <div>
                  <PersonCell user={mentor} hint={mentor.jobTitle} />
                  <p className="mt-3 text-xs leading-5 text-slate">{mentor.bio ?? 'Supports the team with structured feedback and project reviews.'}</p>
                  <p className="mt-2 text-2xs text-slate">{mentor.organization}</p>
                </div>
              ) : (
                <p className="text-xs text-slate">A mentor will be assigned before the first project review.</p>
              )}
            </CardBody>
          </Card>

          <Alert variant="info" title="Team safety">
            Keep communication inside the platform where possible. Report concerning behaviour through the support route.
          </Alert>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Impact project                                                      */
/* ------------------------------------------------------------------ */

export function ParticipantProjectPage() {
  useDocumentTitle('Impact project');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const { run, isPending } = useAsyncAction();
  const [submitFor, setSubmitFor] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [fileError, setFileError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!DEMO_MODE) return <LiveProjectPanel />;
  if (!user) return null;
  const userId = user.id;

  const team = state.teams.find((entry) => entry.memberIds.includes(userId));
  const project = team ? state.projects.find((entry) => entry.teamId === team.id) : undefined;

  if (!team || !project) {
    return (
      <div className="space-y-6">
        <PageHeader title="Impact project" description="Your Level Two team project, milestones and evidence." eyebrow="Workspace" />
        <Card>
          <PanelEmpty
            title="No project workspace yet"
            description="Once a facilitator confirms your team placement and links a project, milestones and evidence submission will appear here."
            action={<Link to="/app/team" className="text-sm font-semibold text-royal hover:underline">View team status</Link>}
            icon={<FolderKanban className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      </div>
    );
  }

  const mentor = state.users.find((entry) => entry.id === team.mentorId);
  const approved = project.milestones.filter((milestone) => milestone.status === 'approved').length;
  const current = project.milestones.find((milestone) => milestone.status !== 'approved');
  const selectedMilestone = project.milestones.find((milestone) => milestone.id === submitFor);
  const selectedSubmission = selectedMilestone
    ? state.submissions.find((submission) => submission.milestoneId === selectedMilestone.id)
    : undefined;

  async function startMilestone(milestoneId: string) {
    await run(`start-${milestoneId}`, () => projectService.updateMilestone(team!.id, milestoneId, 'in_progress'), {
      successTitle: 'Milestone started',
      successDescription: 'You can now prepare and submit evidence.',
    });
  }

  async function submitEvidence() {
    if (!file) {
      setFileError('Select a file to submit.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('The demonstration accepts files up to 10 MB.');
      return;
    }
    if (!confirmed) {
      setFileError('Confirm that the evidence contains no unnecessary personal data.');
      return;
    }
    if (!submitFor) return;
    setFileError('');
    const result = await run(
      'submit-evidence',
      () => projectService.submitEvidence(team!.id, submitFor, file.name, note, userId, file),
      {
        successTitle: 'Evidence submitted',
        successDescription: 'Your mentor will review the submission. A revision request is a normal part of the process.',
      },
    );
    if (result) {
      setSubmitFor(null);
      setFile(null);
      setNote('');
      setConfirmed(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.title}
        description={`${team.name} · ${project.theme} · Mentor: ${mentor?.name ?? 'Unassigned'}`}
        eyebrow="Level Two impact project"
        actions={<Link to="/app/team" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"><Users className="h-4 w-4" aria-hidden="true" />Team workspace</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Project status" value={<StatusBadge status={project.status} />} icon={<FolderKanban className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Milestones approved" value={`${approved}/${project.milestones.length}`} icon={<Check className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Current milestone" value={current ? current.title.split(' ').slice(0, 2).join(' ') : 'Complete'} hint={current ? formatDueDate(current.dueAt) : 'All milestones approved'} icon={<Target className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Team members" value={team.memberIds.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_21rem]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Project brief" description="Problem statement and objectives" />
            <CardBody className="space-y-4">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Problem</p>
                <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{project.problem}</p>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Approach</p>
                <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{project.summary}</p>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Objectives</p>
                <ul className="mt-2 space-y-1.5">
                  {project.objectives.map((objective) => (
                    <li key={objective} className="flex gap-2 text-[0.8125rem] leading-6 text-slate">
                      <Target className="mt-1.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Milestones and evidence"
              description="Each milestone is reviewed by your mentor against the programme rubric."
              action={<Badge variant="outline">{approved} of {project.milestones.length} approved</Badge>}
            />
            <CardBody>
              <ol className="space-y-0">
                {project.milestones.map((milestone, index) => {
                  const submission = state.submissions.find((entry) => entry.milestoneId === milestone.id);
                  const isCurrent = current?.id === milestone.id;
                  return (
                    <li key={milestone.id} className="relative flex gap-3.5 pb-6 last:pb-0">
                      {index < project.milestones.length - 1 && <span className="absolute left-[0.6875rem] top-7 h-full w-px bg-line" aria-hidden="true" />}
                      <span className={`relative z-10 mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${milestone.status === 'approved' ? 'border-success bg-success-50 text-success' : milestone.status === 'revision' ? 'border-danger bg-danger-50 text-danger' : isCurrent ? 'border-royal bg-royal-50 text-royal' : 'border-line bg-white text-slate'}`}>
                        {milestone.status === 'approved' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <span className="text-2xs font-semibold">{index + 1}</span>}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[0.9375rem] font-semibold text-ink">{milestone.title}</h3>
                          <StatusBadge status={milestone.status} />
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate">{milestone.description}</p>
                        <p className="mt-1.5 text-2xs text-slate">{formatDueDate(milestone.dueAt)}</p>
                        {milestone.feedback && (
                          <div className="mt-2 rounded-md border border-line bg-canvas p-2.5 text-2xs leading-5 text-slate">
                            <span className="font-semibold text-ink">Mentor feedback: </span>
                            {milestone.feedback}
                          </div>
                        )}
                        {milestone.evidence && (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-2xs text-slate">
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                            {milestone.evidence}
                          </p>
                        )}
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {milestone.status === 'not_started' && (
                            <Button size="sm" variant="outline" onClick={() => void startMilestone(milestone.id)} loading={isPending(`start-${milestone.id}`)}>
                              Start milestone
                            </Button>
                          )}
                          {(milestone.status === 'in_progress' || milestone.status === 'revision') && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSubmitFor(milestone.id);
                                setFile(null);
                                setNote('');
                                setFileError('');
                                setConfirmed(false);
                              }}
                            >
                              {milestone.status === 'revision' ? 'Revise and resubmit' : 'Submit evidence'}
                            </Button>
                          )}
                          {submission && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                toast({
                                  title: submission.title,
                                  description: `${submission.fileName} · ${submission.status.replace('_', ' ')}${submission.score ? ` · ${submission.score}/${submission.maxScore}` : ''}`,
                                  variant: 'info',
                                })
                              }
                            >
                              View submission
                            </Button>
                          )}
                          {milestone.status === 'submitted' && <Badge variant="info">Awaiting mentor review</Badge>}
                          {milestone.status === 'under_review' && <Badge variant="warning">Under review</Badge>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Submission guidance" />
            <CardBody className="space-y-3 text-xs leading-5 text-slate">
              <p>Evidence should be relevant, verifiable and proportionate. Remove names and contact details unless they are necessary.</p>
              <p>Accepted in this demonstration: PDF, DOC, DOCX, PNG or JPG up to 10 MB. Files are not uploaded to a server.</p>
              <p>A revision request is not a rejection. Respond to the specific feedback and resubmit.</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Project resources" description={`${project.resources.length} shared items`} />
            <CardBody>
              {project.resources.length === 0 ? (
                <p className="text-xs text-slate">No resources shared yet.</p>
              ) : (
                <ul className="space-y-2.5">
                  {project.resources.map((resource) => (
                    <li key={resource.label} className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-5 text-ink">{resource.label}</p>
                        <p className="text-2xs text-slate">{resource.kind} · {resource.addedBy} · {formatDate(resource.date)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Mentor" />
            <CardBody>
              {mentor ? (
                <div>
                  <PersonCell user={mentor} hint={mentor.jobTitle} />
                  <p className="mt-2 text-2xs leading-5 text-slate">Feedback appears against each milestone after review.</p>
                  <Link to="/app/team" className="mt-2 inline-block text-xs font-semibold text-royal hover:underline">Message in team space</Link>
                </div>
              ) : (
                <p className="text-xs text-slate">No mentor assigned.</p>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>

      <Dialog
        open={Boolean(submitFor)}
        onClose={() => setSubmitFor(null)}
        title={selectedMilestone ? `Submit evidence: ${selectedMilestone.title}` : 'Submit evidence'}
        description="Upload one file and add a short note for your mentor."
        footer={
          <>
            <Button variant="outline" onClick={() => setSubmitFor(null)}>Cancel</Button>
            <Button onClick={() => void submitEvidence()} loading={isPending('submit-evidence')}>Submit for review</Button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedSubmission?.status === 'revision' && selectedSubmission.revisionRequested && (
            <Alert variant="warning" title="Revision requested">
              {selectedSubmission.revisionRequested}
            </Alert>
          )}
          <FileUpload
            label="Choose a file or drag it here"
            hint="PDF, DOC, DOCX, PNG or JPG up to 10 MB. Demonstration files are not uploaded."
            fileName={file?.name}
            onFile={(nextFile) => {
              setFile(nextFile);
              setFileError('');
            }}
            onClear={() => setFile(null)}
            error={fileError}
          />
          <Field label="Note for your mentor" htmlFor="evidence-note" hint="Explain what the evidence shows and any limitations." optional>
            <Textarea
              id="evidence-note"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Summarise the evidence and what you could not verify…"
            />
          </Field>
          <Checkbox
            label="I confirm this evidence contains no unnecessary personal or sensitive data."
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
        </div>
      </Dialog>
    </div>
  );
}
