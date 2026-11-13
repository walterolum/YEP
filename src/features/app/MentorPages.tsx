import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  MessageSquare,
  Network,
  Plus,
  Send,
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
  Input,
  ProgressBar,
  Select,
  StatCard,
  StatusBadge,
  Tabs,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { mentorService, projectService, teamService } from '@/services/teamService';
import type { Submission, Team } from '@/types';
import { formatDate, formatDateTime, formatDueDate, percent, relativeTime } from '@/utils/format';
import { PanelEmpty, PersonCell, useAsyncAction } from '@/features/app/shared';

function useMentorScope() {
  const { user } = useAuth();
  const state = useDemoData();
  const userId = user?.id ?? '';
  const teams = state.teams.filter((team) => team.mentorId === userId);
  const teamIds = new Set(teams.map((team) => team.id));
  const projects = state.projects.filter((project) => teamIds.has(project.teamId));
  const submissions = state.submissions.filter((submission) => teamIds.has(submission.teamId));
  const feedback = state.mentorFeedback.filter((entry) => teamIds.has(entry.teamId));
  const programmeIds = new Set(teams.map((team) => team.programmeId));
  const sessions = state.sessions.filter((session) => programmeIds.has(session.programmeId));
  return { user, userId, state, teams, projects, submissions, feedback, sessions };
}

function teamProject(state: ReturnType<typeof useDemoData>, teamId: string) {
  return state.projects.find((project) => project.teamId === teamId);
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export function MentorOverviewPage() {
  useDocumentTitle('Mentor overview');
  const { user, state, teams, projects, submissions, feedback, sessions } = useMentorScope();

  if (!user) return null;

  const pending = submissions.filter(
    (submission) => submission.status === 'submitted' || submission.status === 'under_review',
  );
  const unresolved = feedback.filter((entry) => !entry.resolved);
  const learners = new Set(teams.flatMap((team) => team.memberIds));
  const upcoming = sessions
    .filter((session) => session.status === 'upcoming')
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

  const progressData = teams.map((team) => {
    const project = projects.find((entry) => entry.teamId === team.id);
    const approved = project?.milestones.filter((milestone) => milestone.status === 'approved').length ?? 0;
    return {
      name: team.name.length > 18 ? `${team.name.slice(0, 16)}…` : team.name,
      approved,
      total: project?.milestones.length ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        description="Your assigned teams, project reviews and feedback. Demonstration data only."
        eyebrow="Mentor workspace"
        actions={
          <Link
            to="/app/mentor/reviews"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700"
          >
            <FileCheck2 className="h-4 w-4" aria-hidden="true" />
            Open review queue
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned teams" value={teams.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Learners supported" value={learners.size} icon={<Network className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Reviews waiting" value={pending.length} icon={<FileCheck2 className="h-4 w-4" aria-hidden="true" />} hint={pending.length ? 'Aim to respond within 5 working days' : 'Queue is clear'} />
        <StatCard label="Open feedback" value={unresolved.length} icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />} hint={`${feedback.length} notes in total`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Milestone progress by team" description="Approved milestones against each project plan." />
          <CardBody>
            {progressData.length === 0 ? (
              <PanelEmpty title="No teams assigned" description="A facilitator will assign teams once Level Two placement is confirmed." />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="approved" name="Approved milestones" fill="#1e4fd8" radius={[3, 3, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="total" name="Planned milestones" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Upcoming sessions"
            description="Sessions in your teams' programmes"
            action={<Link to="/app/mentor/meetings" className="text-xs font-semibold text-royal hover:underline">Meetings</Link>}
          />
          <CardBody>
            {upcoming.length === 0 ? (
              <PanelEmpty title="No upcoming sessions" description="Check back when facilitators publish the next exchange schedule." />
            ) : (
              <ul className="space-y-3.5">
                {upcoming.slice(0, 4).map((session) => (
                  <li key={session.id} className="border-b border-line/70 pb-3.5 last:border-0 last:pb-0">
                    <p className="text-[0.8125rem] font-semibold leading-5 text-ink">{session.title}</p>
                    <p className="mt-1 text-2xs text-slate">{formatDateTime(session.startsAt)}</p>
                    <p className="mt-1 text-2xs text-slate">{state.programmes.find((programme) => programme.id === session.programmeId)?.title}</p>
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
            description="Evidence submitted by your teams."
            action={<Badge variant={pending.length ? 'warning' : 'success'}>{pending.length} waiting</Badge>}
          />
          <CardBody>
            {pending.length === 0 ? (
              <PanelEmpty title="Nothing to review" description="You have responded to every submission." icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />} />
            ) : (
              <ul className="space-y-3">
                {pending.map((submission) => {
                  const team = teams.find((entry) => entry.id === submission.teamId);
                  return (
                    <li key={submission.id} className="rounded-md border border-line p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[0.8125rem] font-semibold text-ink">{submission.title}</p>
                        <StatusBadge status={submission.status} />
                      </div>
                      <p className="mt-1 text-2xs text-slate">{team?.name} · Submitted {relativeTime(submission.submittedAt)}</p>
                      <Link to="/app/mentor/reviews" className="mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-royal hover:underline">
                        Review now <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Teams at a glance" description="Latest activity and project status." action={<Link to="/app/mentor/teams" className="text-xs font-semibold text-royal hover:underline">All teams</Link>} />
          <CardBody>
            {teams.length === 0 ? (
              <PanelEmpty title="No teams yet" description="Teams appear here when a facilitator assigns you." />
            ) : (
              <ul className="space-y-3.5">
                {teams.map((team) => {
                  const project = teamProject(state, team.id);
                  return (
                    <li key={team.id} className="flex items-start justify-between gap-3 border-b border-line/70 pb-3.5 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-[0.8125rem] font-semibold text-ink">{team.name}</p>
                        <p className="mt-0.5 text-2xs text-slate">{team.memberIds.length} members · {project?.milestones.length ?? 0} milestones</p>
                        <p className="mt-0.5 text-2xs text-slate">{team.messages.length} team messages</p>
                      </div>
                      {project ? <StatusBadge status={project.status} /> : <Badge variant="neutral">No project</Badge>}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Alert variant="info" title="Mentor boundaries">
        Mentors provide structured feedback and project guidance. They do not grade participation, make safeguarding
        decisions alone, or act as an employer. Escalate any welfare or safety concern through the reporting route.
      </Alert>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teams                                                               */
/* ------------------------------------------------------------------ */

export function MentorTeamsPage() {
  useDocumentTitle('Assigned teams');
  const { state, teams, projects } = useMentorScope();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [detail, setDetail] = useState<Team | null>(null);
  const [message, setMessage] = useState('');

  async function sendMessage(team: Team) {
    if (!message.trim()) return;
    const result = await run(
      'message',
      () => teamService.postMessage(team.id, team.mentorId, message.trim()),
      {
        successTitle: 'Message posted',
        successDescription: 'The team can see this in their shared workspace in this demonstration.',
        onSuccess: () => setMessage(''),
      },
    );
    if (result) toast({ title: 'Note shared', description: 'Keep messages specific and constructive.', variant: 'info' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned teams"
        description="The Level Two teams you support, their members and current project status."
        eyebrow="Mentorship"
      />

      {teams.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No teams assigned"
            description="Facilitators assign mentors after team formation. Contact the programme team if you expected a placement."
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {teams.map((team) => {
            const project = projects.find((entry) => entry.teamId === team.id);
            const approved = project?.milestones.filter((milestone) => milestone.status === 'approved').length ?? 0;
            const next = project?.milestones.find((milestone) => milestone.status !== 'approved');
            return (
              <Card key={team.id}>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{team.theme}</Badge>
                    <Badge variant="neutral">{team.memberIds.length} members</Badge>
                    {project && <StatusBadge status={project.status} />}
                  </div>
                  <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{team.name}</h2>
                  <p className="mt-0.5 text-2xs text-slate">
                    {state.programmes.find((programme) => programme.id === team.programmeId)?.title}
                  </p>
                  <div className="mt-3">
                    <ProgressBar
                      value={project ? percent(approved, Math.max(1, project.milestones.length)) : 0}
                      label={`${approved} of ${project?.milestones.length ?? 0} milestones approved`}
                    />
                  </div>
                  <p className="mt-2 text-2xs text-slate">
                    {next ? `Next: ${next.title} · ${formatDueDate(next.dueAt)}` : 'All planned milestones approved'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                    <Button size="sm" variant="outline" onClick={() => { setDetail(team); setMessage(''); }}>
                      View team
                    </Button>
                    <Link to="/app/mentor/reviews" className="inline-flex min-h-9 items-center rounded-md px-3 text-xs font-semibold text-royal hover:bg-royal-50">
                      Reviews
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Alert variant="info" title="Team communication">
        Keep project communication in the platform where possible. Do not ask participants to share personal contact
        details, identity documents or health information.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.name ?? 'Team'}
        description={detail ? `${detail.memberIds.length} members · ${detail.theme}` : undefined}
        size="lg"
        footer={<Button variant="outline" onClick={() => setDetail(null)}>Close</Button>}
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

            {(() => {
              const project = projects.find((entry) => entry.teamId === detail.id);
              if (!project) return <Alert variant="warning" title="No project linked">The facilitator has not linked a project to this team yet.</Alert>;
              return (
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Milestones</p>
                  <ol className="mt-2 space-y-2">
                    {project.milestones.map((milestone) => (
                      <li key={milestone.id} className="flex items-start justify-between gap-3 rounded-md border border-line p-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-ink">{milestone.title}</p>
                          <p className="mt-0.5 text-2xs text-slate">{formatDueDate(milestone.dueAt)}</p>
                        </div>
                        <StatusBadge status={milestone.status} />
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })()}

            <div className="border-t border-line pt-4">
              <Field label="Post a note to the team" htmlFor="mentor-message" hint="Visible in the team workspace. Do not include personal data.">
                <Textarea id="mentor-message" rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="A short encouragement, a question or a suggested next step…" />
              </Field>
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={() => void sendMessage(detail)}
                  loading={isPending('message')}
                  disabled={!message.trim()}
                  iconLeft={<Send className="h-4 w-4" aria-hidden="true" />}
                >
                  Post note
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project reviews                                                     */
/* ------------------------------------------------------------------ */

export function MentorReviewsPage() {
  useDocumentTitle('Project reviews');
  const { userId, state, teams, submissions } = useMentorScope();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState('waiting');
  const [detail, setDetail] = useState<Submission | null>(null);
  const [decision, setDecision] = useState<'approved' | 'revision'>('approved');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const waiting = submissions.filter((submission) => submission.status === 'submitted' || submission.status === 'under_review');
  const reviewed = submissions.filter((submission) => submission.status === 'approved' || submission.status === 'revision');
  const filtered = tab === 'waiting' ? waiting : tab === 'reviewed' ? reviewed : submissions;

  function openReview(submission: Submission) {
    setDetail(submission);
    setDecision(submission.status === 'revision' ? 'revision' : 'approved');
    setScore(submission.score ? String(submission.score) : '');
    setFeedback(submission.feedback ?? '');
    setError('');
  }

  async function submitReview() {
    if (!detail) return;
    const max = detail.maxScore ?? 20;
    const numeric = score ? Number(score) : undefined;
    if (decision === 'approved' && (numeric === undefined || !Number.isFinite(numeric))) {
      setError('Enter a score before approving this milestone.');
      return;
    }
    if (numeric !== undefined && (!Number.isFinite(numeric) || numeric < 0 || numeric > max)) {
      setError(`Enter a score between 0 and ${max}.`);
      return;
    }
    if (feedback.trim().length < 15) {
      setError('Write at least 15 characters of feedback. A revision request must say what to change.');
      return;
    }
    setError('');
    const result = await run(
      'review',
      () =>
        projectService.reviewSubmission(detail.id, userId, {
          status: decision,
          score: numeric,
          feedback: feedback.trim(),
        }),
      {
        successTitle: decision === 'approved' ? 'Milestone approved' : 'Revision requested',
        successDescription:
          decision === 'approved'
            ? 'The team and facilitator would be notified in production.'
            : 'The team can revise and resubmit. Be specific about what needs to change.',
        onSuccess: () => setDetail(null),
      },
    );
    if (result === undefined) return;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project reviews"
        description="Review milestone evidence against the programme rubric. Approval and revision requests are recorded in this demonstration."
        eyebrow="Mentorship"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Waiting for review" value={waiting.length} icon={<FileCheck2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Reviewed" value={reviewed.length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Teams" value={teams.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <Tabs
        ariaLabel="Review filters"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'waiting', label: 'Waiting', count: waiting.length },
          { id: 'reviewed', label: 'Reviewed', count: reviewed.length },
          { id: 'all', label: 'All', count: submissions.length },
        ]}
      />

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty
            title={tab === 'waiting' ? 'No reviews waiting' : 'No reviews in this view'}
            description={tab === 'waiting' ? 'Your review queue is clear.' : 'Try a different filter.'}
            icon={<FileCheck2 className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((submission) => {
            const team = teams.find((entry) => entry.id === submission.teamId);
            const project = state.projects.find((entry) => entry.id === submission.projectId);
            const milestone = project?.milestones.find((entry) => entry.id === submission.milestoneId);
            return (
              <Card key={submission.id}>
                <CardBody>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={submission.status} />
                        <Badge variant="outline">{team?.name ?? 'Team'}</Badge>
                        {milestone && <Badge variant="neutral">{formatDueDate(milestone.dueAt)}</Badge>}
                      </div>
                      <h2 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-ink">{submission.title}</h2>
                      <p className="mt-1 text-2xs text-slate">
                        Submitted {formatDateTime(submission.submittedAt)} · {submission.fileName}
                      </p>
                      <p className="mt-2 max-w-3xl rounded-md bg-canvas p-3 text-xs leading-5 text-slate">{submission.note}</p>
                      {submission.status === 'revision' && submission.revisionRequested && (
                        <p className="mt-2 text-2xs text-danger"><span className="font-semibold">Revision requested: </span>{submission.revisionRequested}</p>
                      )}
                      {submission.status === 'approved' && submission.feedback && (
                        <p className="mt-2 text-2xs text-slate"><span className="font-semibold text-ink">Feedback: </span>{submission.feedback}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                      {submission.status === 'submitted' || submission.status === 'under_review' ? (
                        <Button size="sm" onClick={() => openReview(submission)}>Review submission</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => openReview(submission)}>View review</Button>
                      )}
                      {submission.status === 'approved' && (
                        <Badge variant="success" icon={<Check className="h-3 w-3" aria-hidden="true" />}>
                          {submission.score}/{submission.maxScore ?? 20}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Alert variant="warning" title="Feedback standards">
        Feedback should name what works, what needs to change and why. Avoid comments about a person's background,
        accent or confidence. A revision request is not a rejection.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `Review: ${detail.title}` : 'Review submission'}
        description={detail ? `${detail.fileName} · submitted ${formatDate(detail.submittedAt)}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>Cancel</Button>
            <Button onClick={() => void submitReview()} loading={isPending('review')}>
              {decision === 'approved' ? 'Approve milestone' : 'Request revision'}
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="rounded-md border border-line bg-canvas p-3.5">
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Team note</p>
              <p className="mt-1.5 text-xs leading-5 text-slate">{detail.note}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-2xs text-slate">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {detail.fileName}
              </p>
            </div>

            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Decision</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('approved')}
                  aria-pressed={decision === 'approved'}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                    decision === 'approved' ? 'border-success bg-success-50 text-success' : 'border-line bg-white text-slate hover:text-ink'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('revision')}
                  aria-pressed={decision === 'revision'}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                    decision === 'revision' ? 'border-warning bg-warning-50 text-warning' : 'border-line bg-white text-slate hover:text-ink'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Request revision
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <Field label={`Score (0–${detail.maxScore ?? 20})`} htmlFor="review-score" required={decision === 'approved'} error={error}>
                <Input
                  id="review-score"
                  type="number"
                  min={0}
                  max={detail.maxScore ?? 20}
                  value={score}
                  onChange={(event) => { setScore(event.target.value); setError(''); }}
                />
              </Field>
              <Field label="Feedback to the team" htmlFor="review-feedback" required hint="Be specific about what to keep and what to change.">
                <Textarea
                  id="review-feedback"
                  rows={5}
                  value={feedback}
                  onChange={(event) => { setFeedback(event.target.value); setError(''); }}
                  placeholder="What is strong? What evidence is missing? What should the team do next?"
                />
              </Field>
            </div>

            {detail.status === 'approved' || detail.status === 'revision' ? (
              <Alert variant="warning" title="This submission has already been reviewed">
                Saving again replaces the previous decision and feedback in this demonstration.
              </Alert>
            ) : null}
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Meetings & feedback                                                 */
/* ------------------------------------------------------------------ */

export function MentorMeetingsPage() {
  useDocumentTitle('Meetings and feedback');
  const { userId, state, teams, feedback, sessions } = useMentorScope();
  const { run, isPending } = useAsyncAction();
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const upcoming = sessions
    .filter((session) => session.status === 'upcoming')
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

  async function addNote() {
    if (!teamId) {
      setError('Choose a team.');
      return;
    }
    if (body.trim().length < 15) {
      setError('Write at least 15 characters so the note is useful.');
      return;
    }
    setError('');
    const result = await run('feedback', () => mentorService.addFeedback(teamId, userId, body.trim()), {
      successTitle: 'Feedback note added',
      successDescription: 'Recorded against the team in this demonstration.',
      onSuccess: () => {
        setOpen(false);
        setBody('');
      },
    });
    if (result === undefined) return;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings and feedback"
        description="A log of your feedback notes and the sessions your teams are attending."
        eyebrow="Mentorship"
        actions={
          <Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Log feedback
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Feedback log"
            description={`${feedback.length} notes · ${feedback.filter((entry) => !entry.resolved).length} open`}
          />
          <CardBody>
            {feedback.length === 0 ? (
              <PanelEmpty
                title="No feedback recorded"
                description="Log a note after a check-in or project review so the team has a record."
                action={<Button variant="outline" onClick={() => setOpen(true)}>Log feedback</Button>}
                icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
              />
            ) : (
              <ul className="space-y-4">
                {feedback.map((entry) => {
                  const team = teams.find((item) => item.id === entry.teamId);
                  const author = state.users.find((item) => item.id === entry.authorId);
                  return (
                    <li key={entry.id} className="border-b border-line/70 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{team?.name ?? 'Team'}</Badge>
                          {entry.milestoneId && <Badge variant="neutral">Milestone note</Badge>}
                        </div>
                        <Badge variant={entry.resolved ? 'success' : 'warning'}>{entry.resolved ? 'Resolved' : 'Open'}</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate">{entry.body}</p>
                      <p className="mt-1.5 text-2xs text-slate">
                        {author?.name ?? 'Mentor'} · {relativeTime(entry.createdAt)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Upcoming sessions" description="Open sessions in your teams' programmes." />
            <CardBody>
              {upcoming.length === 0 ? (
                <p className="text-xs text-slate">No upcoming sessions are scheduled.</p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.slice(0, 4).map((session) => (
                    <li key={session.id} className="border-b border-line/70 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs font-semibold leading-5 text-ink">{session.title}</p>
                      <p className="mt-0.5 text-2xs text-slate">{formatDateTime(session.startsAt)}</p>
                      <p className="mt-0.5 text-2xs text-slate">{session.registeredCount}/{session.capacity} registered</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Meeting guidance" />
            <CardBody className="space-y-2.5 text-xs leading-5 text-slate">
              <p>Agree a clear purpose and time limit for each check-in. Keep notes factual and share them with the team.</p>
              <p>Use the platform's messaging where possible. Do not ask for personal contact details.</p>
              <p>If a participant discloses a safety concern, follow the escalation route rather than handling it alone.</p>
              <Link to="/responsible-ai" className="inline-flex items-center gap-1 text-xs font-semibold text-royal hover:underline">
                Responsible practice <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Programme sessions overview" description="All sessions in your teams' programmes, including past sessions." />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <caption className="sr-only">Sessions in mentored programme</caption>
              <thead>
                <tr>
                  <th scope="col">Session</th>
                  <th scope="col">Programme</th>
                  <th scope="col">When</th>
                  <th scope="col">Status</th>
                  <th scope="col">Registered</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="font-medium text-ink">{session.title}</td>
                    <td className="text-xs text-slate">{state.programmes.find((programme) => programme.id === session.programmeId)?.title}</td>
                    <td className="text-xs text-slate">{formatDateTime(session.startsAt)}</td>
                    <td><StatusBadge status={session.status} /></td>
                    <td className="text-xs text-ink">{session.registeredCount}/{session.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Alert variant="info" title="No calendar integration">
        This demonstration does not schedule calendar invitations or create meeting links. In production, mentor
        check-ins would be recorded with consent and a clear retention period.
      </Alert>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Log feedback"
        description="Record a note after a check-in, review or meeting."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => void addNote()} loading={isPending('feedback')}>Save note</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Team" htmlFor="feedback-team" required error={error}>
            <Select id="feedback-team" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
              <option value="">Choose a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Note" htmlFor="feedback-body" required hint="Do not include personal data about third parties.">
            <Textarea
              id="feedback-body"
              rows={5}
              value={body}
              onChange={(event) => { setBody(event.target.value); setError(''); }}
              placeholder="What did you discuss, what was agreed and what happens next?"
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
