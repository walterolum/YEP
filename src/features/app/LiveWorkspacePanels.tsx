import { Award, Check, FolderKanban, Mail, Target, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Select,
  Skeleton,
  ErrorState,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { badgeService } from '@/services/badgeService';
import { programmeService } from '@/services/programmeService';
import { ApiError } from '@/services/apiClient';
import { projectService, teamService } from '@/services/teamService';
import type { BadgeAward, Programme, Project, Team, TeamMemberRole } from '@/types';
import { formatDate } from '@/utils/format';
import { PanelEmpty, errorMessage, useAsyncAction } from '@/features/app/shared';

const THEMES = ['Climate action', 'Digital inclusion', 'Education', 'Health', 'Employment', 'Agriculture'];

const ROLE_LABELS: Record<TeamMemberRole, string> = {
  lead: 'Team lead',
  member: 'Member',
  support: 'Support',
};

function LoadingCard({ label }: { label: string }) {
  return (
    <Card>
      <CardBody className="space-y-3" aria-busy="true" aria-label={label}>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-10 w-32" />
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Live team workspace                                                 */
/* ------------------------------------------------------------------ */

export function LiveTeamPanel() {
  useDocumentTitle('My team');
  const { user } = useAuth();
  const { run, isPending } = useAsyncAction();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ programmeId: '', name: '', theme: THEMES[0] });
  const [formError, setFormError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<TeamMemberRole>('member');

  const load = useCallback(async () => {
    if (!user) return;
    setLoadError(null);
    try {
      const [mine, catalogue] = await Promise.all([
        teamService.listForUser(user.id),
        programmeService.list(),
      ]);
      setTeams(mine);
      setProgrammes(catalogue.filter((programme) => programme.level === 2));
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) return null;

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title="My team" description="Your interdisciplinary project team and shared workspace." eyebrow="Workspace" />
        <Card>
          <ErrorState description={loadError} onRetry={() => void load()} />
        </Card>
      </div>
    );
  }

  if (teams === null) {
    return (
      <div className="space-y-6">
        <PageHeader title="My team" description="Your interdisciplinary project team and shared workspace." eyebrow="Workspace" />
        <LoadingCard label="Loading your team" />
      </div>
    );
  }

  const team = teams[0];

  async function createTeam() {
    if (!form.programmeId) {
      setFormError('Choose a Level Two programme.');
      return;
    }
    if (form.name.trim().length < 2) {
      setFormError('Give your team a name of at least two characters.');
      return;
    }
    setFormError('');
    const created = await run('create-team', () => teamService.create({ ...form, leadId: user!.id }), {
      successTitle: 'Team created',
      successDescription: 'You are the team lead. Invite the rest of your team by email.',
    });
    if (created) {
      setTeams([created]);
      setForm({ programmeId: '', name: '', theme: THEMES[0] });
    }
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My team"
          description="Form a Level Two Impact Project team, then invite the people you will work with."
          eyebrow="Workspace"
        />
        <Card>
          <CardHeader
            title="Start a team"
            description="You must already be enrolled in a Level Two programme. You become the team lead."
          />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Level Two programme" htmlFor="team-programme" required>
                <Select
                  id="team-programme"
                  value={form.programmeId}
                  onChange={(event) => setForm({ ...form, programmeId: event.target.value })}
                >
                  <option value="">Select a programme</option>
                  {programmes.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {programme.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Team name" htmlFor="team-name" required>
                <Input
                  id="team-name"
                  value={form.name}
                  maxLength={120}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Green Lens"
                />
              </Field>
              <Field label="Focus theme" htmlFor="team-theme" required>
                <Select
                  id="team-theme"
                  value={form.theme}
                  onChange={(event) => setForm({ ...form, theme: event.target.value })}
                >
                  {THEMES.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {formError && <p className="text-xs font-medium text-danger" role="alert">{formError}</p>}
            {programmes.length === 0 && (
              <Alert variant="info" title="No Level Two programmes open">
                Enrol in a Level Two programme before forming a team. <Link to="/programmes" className="font-semibold underline">Browse programmes</Link>
              </Alert>
            )}
            <Button onClick={() => void createTeam()} loading={isPending('create-team')}>
              Create team
            </Button>
          </CardBody>
        </Card>
        <Alert variant="info" title="Team size">
          Teams hold up to five people. Every member must be enrolled in the same programme.
        </Alert>
      </div>
    );
  }

  const members = team.members ?? [];
  const myRole = members.find((member) => member.userId === user.id)?.role;
  const canManage = myRole === 'lead';

  async function addMember() {
    if (!memberEmail.trim()) return;
    const updated = await run(
      'add-member',
      () => teamService.addMember(team!.id, { email: memberEmail.trim(), role: memberRole }),
      {
        successTitle: 'Member added',
        successDescription: 'They have been notified and can open the team workspace.',
        errorTitle: 'Member could not be added',
      },
    );
    if (updated) {
      setTeams([updated]);
      setMemberEmail('');
      setMemberRole('member');
    }
  }

  async function changeRole(userId: string, role: TeamMemberRole) {
    const updated = await run(`role-${userId}`, () => teamService.changeMemberRole(team!.id, userId, role), {
      successTitle: 'Role updated',
      errorTitle: 'Role could not be changed',
    });
    if (updated) setTeams([updated]);
  }

  async function removeMember(userId: string) {
    const updated = await run(`remove-${userId}`, () => teamService.removeMember(team!.id, userId), {
      successTitle: 'Member removed',
      errorTitle: 'Member could not be removed',
    });
    if (updated) setTeams([updated]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={team.name}
        description={`${team.theme} · ${members.length} of ${team.capacity} members · Created ${formatDate(team.createdAt)}`}
        eyebrow="Team workspace"
        actions={
          team.projectId ? (
            <Link
              to="/app/project"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700"
            >
              <FolderKanban className="h-4 w-4" aria-hidden="true" />
              Open project
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Team members" description="Roles decide who can add people, change roles and remove members." />
            <CardBody className="space-y-3">
              {members.length === 0 ? (
                <p className="rounded-md bg-canvas p-4 text-xs text-slate">No members have been added yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {members.map((member) => (
                    <li key={member.userId} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-[0.8125rem] font-medium text-ink">
                          {member.fullName}
                          {member.userId === user.id ? ' (you)' : ''}
                        </p>
                        <p className="text-2xs text-slate">
                          {ROLE_LABELS[member.role]} · joined {formatDate(member.joinedAt)}
                        </p>
                      </div>
                      {canManage ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <label htmlFor={`role-${member.userId}`} className="sr-only">
                            Role for {member.fullName}
                          </label>
                          <Select
                            id={`role-${member.userId}`}
                            value={member.role}
                            disabled={isPending(`role-${member.userId}`)}
                            onChange={(event) => void changeRole(member.userId, event.target.value as TeamMemberRole)}
                          >
                            <option value="lead">Team lead</option>
                            <option value="member">Member</option>
                            <option value="support">Support</option>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={isPending(`remove-${member.userId}`)}
                            onClick={() => void removeMember(member.userId)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {canManage && (
            <Card>
              <CardHeader
                title="Add a member"
                description="Enter the email address the person registered with. There is no public participant directory."
              />
              <CardBody className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                  <Field label="Email address" htmlFor="member-email" required>
                    <Input
                      id="member-email"
                      type="email"
                      autoComplete="off"
                      value={memberEmail}
                      onChange={(event) => setMemberEmail(event.target.value)}
                      placeholder="participant@example.org"
                      prefixIcon={<Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                    />
                  </Field>
                  <Field label="Team role" htmlFor="member-role" required>
                    <Select
                      id="member-role"
                      value={memberRole}
                      onChange={(event) => setMemberRole(event.target.value as TeamMemberRole)}
                    >
                      <option value="member">Member</option>
                      <option value="support">Support</option>
                      <option value="lead">Team lead</option>
                    </Select>
                  </Field>
                </div>
                <Button
                  onClick={() => void addMember()}
                  loading={isPending('add-member')}
                  disabled={!memberEmail.trim() || members.length >= team.capacity}
                  iconLeft={<Users className="h-4 w-4" aria-hidden="true" />}
                >
                  Add member
                </Button>
                {members.length >= team.capacity && (
                  <p className="text-xs text-slate">This team is full. Remove someone before adding another member.</p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Team conversation" />
            <CardBody>
              <p className="text-xs leading-5 text-slate">
                Conversation opens once the team workspace is loaded from the server. Messages are shared with your
                team and mentor only.
              </p>
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
/* Live impact project                                                 */
/* ------------------------------------------------------------------ */

export function LiveProjectPanel() {
  useDocumentTitle('Impact project');
  const { user } = useAuth();
  const { run, isPending } = useAsyncAction();
  const [team, setTeam] = useState<Team | null | undefined>(undefined);
  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', problem: '', theme: THEMES[0], summary: '', objectives: '' });
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoadError(null);
    try {
      const teams = await teamService.listForUser(user.id);
      const mine = teams[0] ?? null;
      setTeam(mine);
      if (!mine) {
        setProject(null);
        return;
      }
      try {
        setProject(await projectService.getByTeam(mine.id));
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setProject(null);
          return;
        }
        throw error;
      }
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) return null;

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Impact project" description="Your Level Two team project, milestones and evidence." eyebrow="Workspace" />
        <Card>
          <ErrorState description={loadError} onRetry={() => void load()} />
        </Card>
      </div>
    );
  }

  if (team === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader title="Impact project" description="Your Level Two team project, milestones and evidence." eyebrow="Workspace" />
        <LoadingCard label="Loading your project" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <PageHeader title="Impact project" description="Your Level Two team project, milestones and evidence." eyebrow="Workspace" />
        <Card>
          <PanelEmpty
            title="No project workspace yet"
            description="Form or join a Level Two team first. The project workspace opens once your team exists."
            action={<Link to="/app/team" className="text-sm font-semibold text-royal hover:underline">Go to my team</Link>}
            icon={<FolderKanban className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      </div>
    );
  }

  async function createProject() {
    if (form.title.trim().length < 3) {
      setFormError('Give the project a title of at least three characters.');
      return;
    }
    if (form.problem.trim().length < 15) {
      setFormError('Describe the problem in at least 15 characters.');
      return;
    }
    if (form.summary.trim().length < 15) {
      setFormError('Summarise your approach in at least 15 characters.');
      return;
    }
    setFormError('');
    const created = await run(
      'create-project',
      () =>
        projectService.create(team!.id, {
          title: form.title.trim(),
          problem: form.problem.trim(),
          theme: form.theme,
          summary: form.summary.trim(),
          objectives: form.objectives
            .split('\n')
            .map((objective) => objective.trim())
            .filter(Boolean)
            .slice(0, 8),
        }),
      {
        successTitle: 'Project created',
        successDescription: 'Your mentor can now review the brief.',
        errorTitle: 'Project could not be created',
      },
    );
    if (created) setProject(created);
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Impact project"
          description={`${team.name} · Describe the problem your team will work on.`}
          eyebrow="Level Two impact project"
          actions={
            <Link
              to="/app/team"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Team workspace
            </Link>
          }
        />
        <Card>
          <CardHeader title="Create your project brief" description="Your team owns one Impact Project. This cannot be duplicated." />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project title" htmlFor="project-title" required>
                <Input
                  id="project-title"
                  value={form.title}
                  maxLength={160}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="e.g. Cooler classrooms"
                />
              </Field>
              <Field label="Focus theme" htmlFor="project-theme" required>
                <Select
                  id="project-theme"
                  value={form.theme}
                  onChange={(event) => setForm({ ...form, theme: event.target.value })}
                >
                  {THEMES.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Problem statement" htmlFor="project-problem" hint="What is happening, for whom, and why does it matter?" required>
              <Input
                id="project-problem"
                value={form.problem}
                maxLength={500}
                onChange={(event) => setForm({ ...form, problem: event.target.value })}
              />
            </Field>
            <Field label="Approach" htmlFor="project-summary" hint="How will your team investigate and respond?" required>
              <Input
                id="project-summary"
                value={form.summary}
                maxLength={1000}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
              />
            </Field>
            <Field
              label="Objectives"
              htmlFor="project-objectives"
              hint="One objective per line. Up to eight."
            >
              <Textarea
                id="project-objectives"
                rows={4}
                value={form.objectives}
                onChange={(event) => setForm({ ...form, objectives: event.target.value })}
              />
            </Field>
            {formError && <p className="text-xs font-medium text-danger" role="alert">{formError}</p>}
            <Button onClick={() => void createProject()} loading={isPending('create-project')}>
              Create project
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const approved = project.milestones.filter((milestone) => milestone.status === 'approved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.title}
        description={`${team.name} · ${project.theme}`}
        eyebrow="Level Two impact project"
        actions={
          <Link
            to="/app/team"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Team workspace
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Status</p>
            <p className="mt-1 text-lg font-semibold capitalize text-ink">{project.status.replace('_', ' ')}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Milestones approved</p>
            <p className="mt-1 text-lg font-semibold text-ink">{approved} of {project.milestones.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Objectives</p>
            <p className="mt-1 text-lg font-semibold text-ink">{project.objectives.length}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Project brief" description="Problem statement, approach and objectives" />
        <CardBody className="space-y-4">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Problem</p>
            <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{project.problem}</p>
          </div>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Approach</p>
            <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{project.summary}</p>
          </div>
          {project.objectives.length > 0 && (
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
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Milestones"
          description="Your facilitator publishes the milestone template for this programme."
          action={<Badge variant="outline">{project.milestones.length} planned</Badge>}
        />
        <CardBody>
          {project.milestones.length === 0 ? (
            <p className="rounded-md bg-canvas p-4 text-xs text-slate">
              No milestones have been published yet. You will be notified when the first one opens.
            </p>
          ) : (
            <ol className="space-y-3">
              {project.milestones.map((milestone) => (
                <li key={milestone.id} className="flex items-start gap-3 rounded-md border border-line p-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-line bg-white text-2xs font-semibold text-slate">
                    {milestone.status === 'approved' ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : ''}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.9375rem] font-semibold text-ink">{milestone.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate">{milestone.description}</p>
                  </div>
                  <Badge variant="outline">{milestone.status.replace('_', ' ')}</Badge>
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live recognition badges                                             */
/* ------------------------------------------------------------------ */

export function LiveBadgesPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeAward[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoadError(null);
    try {
      setBadges(await badgeService.catalogue(user.id));
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) return null;

  if (loadError) {
    return (
      <Card>
        <ErrorState description={loadError} onRetry={() => void load()} />
      </Card>
    );
  }

  if (badges === null) {
    return <LoadingCard label="Loading badges" />;
  }

  const earned = badges.filter((badge) => badge.earned);

  return (
    <Card>
      <CardHeader
        title="Recognition badges"
        description={`${earned.length} of ${badges.length} earned. Badges mark smaller milestones alongside certificates.`}
        action={
          <Badge variant={earned.length ? 'success' : 'outline'}>
            <Award className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {earned.length} earned
          </Badge>
        }
      />
      <CardBody>
        <ul className="grid gap-3 sm:grid-cols-3">
          {badges.map((badge) => (
            <li
              key={badge.code}
              className={`rounded-lg border p-4 ${badge.earned ? 'border-success/40 bg-success-50/50' : 'border-line bg-canvas'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[0.8125rem] font-semibold text-ink">{badge.name}</p>
                {badge.earned && <Check className="h-4 w-4 shrink-0 text-success" aria-label="Earned" />}
              </div>
              <p className="mt-1 text-2xs leading-5 text-slate">{badge.description}</p>
              <p className="mt-2 text-2xs text-slate-400">{badge.criteria}</p>
              {badge.earned && badge.awardedAt && (
                <button
                  type="button"
                  className="mt-2 text-2xs font-semibold text-royal hover:underline"
                  onClick={() =>
                    toast({
                      title: badge.name,
                      description: `Awarded ${formatDate(badge.awardedAt as string)}.`,
                      variant: 'success',
                    })
                  }
                >
                  View award date
                </button>
              )}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
