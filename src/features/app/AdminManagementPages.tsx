import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Plus,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
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
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { demoDb } from '@/lib/demoDb';
import type { Assessment, User } from '@/types';
import { formatDate, formatDateTime } from '@/utils/format';
import { usePagination } from '@/features/app/shared';

/* ------------------------------------------------------------------ */
/* 4C. Programme Management                                            */
/* ------------------------------------------------------------------ */

export function AdminProgrammesPage() {
  useDocumentTitle('Programme Management');
  const state = useDemoData();
  const { toast } = useToast();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newProg, setNewProg] = useState({
    title: '',
    summary: '',
    description: '',
    level: 1 as 1 | 2,
    theme: 'Digital skills',
    durationWeeks: 6,
    commitment: '4 hours / week',
    mode: 'Online virtual exchange',
    capacity: 60,
    cohort: 'Cohort 2026-A',
  });

  const filtered = state.programmes.filter((prog) => {
    if (tab === 'level1') return prog.level === 1;
    if (tab === 'level2') return prog.level === 2;
    if (tab === 'open') return prog.status === 'open';
    return true;
  }).filter((prog) => `${prog.title} ${prog.theme} ${prog.cohort}`.toLowerCase().includes(query.toLowerCase()));

  const pagination = usePagination(filtered, 6);

  function handleCreateProgramme() {
    if (!newProg.title.trim()) {
      toast({ title: 'Validation error', description: 'Please provide a programme title.', variant: 'error' });
      return;
    }
    demoDb.createProgramme(
      {
        ...newProg,
        status: 'open',
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + newProg.durationWeeks * 7 * 24 * 3600 * 1000).toISOString(),
        eligibility: ['Aged 18–35', 'Resident in Uganda / East Africa', 'Access to smartphone or laptop'],
        outcomes: ['Digital skills certification', 'Teamwork portfolio', 'Impact project readiness'],
        skills: ['Digital Literacy', 'Communication', 'Collaboration'],
      },
      'u-admin',
    );
    toast({ title: 'Programme created', description: `${newProg.title} has been added to the catalogue.` });
    setCreateOpen(false);
    setNewProg({
      title: '',
      summary: '',
      description: '',
      level: 1,
      theme: 'Digital skills',
      durationWeeks: 6,
      commitment: '4 hours / week',
      mode: 'Online virtual exchange',
      capacity: 60,
      cohort: 'Cohort 2026-A',
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programme Management"
        eyebrow="Administrator portal"
        description="Configure learning curricula, define capacity, set eligibility criteria and monitor participant progress."
        actions={
          <Button variant="primary" iconLeft={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Create Programme
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Programmes" value={state.programmes.length} icon={<GraduationCap className="h-4 w-4" />} />
        <StatCard label="Level One Tracks" value={state.programmes.filter((p) => p.level === 1).length} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label="Level Two Opportunities" value={state.programmes.filter((p) => p.level === 2).length} icon={<Rocket className="h-4 w-4" />} />
        <StatCard label="Active Enrolments" value={state.enrolments.length} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          ariaLabel="Programme levels"
          active={tab}
          onChange={setTab}
          items={[
            { id: 'all', label: 'All Programmes', count: state.programmes.length },
            { id: 'level1', label: 'Level 1 Virtual Exchange', count: state.programmes.filter((p) => p.level === 1).length },
            { id: 'level2', label: 'Level 2 Impact Lab', count: state.programmes.filter((p) => p.level === 2).length },
            { id: 'open', label: 'Open for Enrolment', count: state.programmes.filter((p) => p.status === 'open').length },
          ]}
        />
        <div className="relative w-full max-w-xs">
          <Input
            placeholder="Search programmes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            prefixIcon={<Search className="h-4 w-4 text-slate-400" />}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {pagination.pageItems.map((prog) => {
          const enrolled = state.enrolments.filter((e) => e.programmeId === prog.id).length;
          const capPercent = Math.min(100, Math.round((enrolled / (prog.capacity || 1)) * 100));
          return (
            <Card key={prog.id} className="flex flex-col justify-between hover:shadow-md transition">
              <CardHeader
                title={prog.title}
                description={`${prog.cohort} · Level ${prog.level}`}
                action={<Badge variant={prog.level === 1 ? 'info' : 'teal'}>Level {prog.level}</Badge>}
              />
              <CardBody className="space-y-4 text-xs">
                <p className="line-clamp-3 text-slate-600 leading-relaxed">{prog.summary}</p>
                <div>
                  <div className="flex items-center justify-between text-2xs text-slate-500 mb-1">
                    <span>Enrolment capacity ({enrolled} / {prog.capacity})</span>
                    <span className="font-bold text-slate-800">{capPercent}%</span>
                  </div>
                  <ProgressBar value={capPercent} label="Capacity meter" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{prog.theme}</Badge>
                  <Badge variant="outline">{prog.durationWeeks} weeks</Badge>
                  <Badge variant="outline">{prog.commitment}</Badge>
                </div>
              </CardBody>
              <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
                <span className="text-2xs font-bold text-emerald-600 uppercase tracking-wider">{prog.status}</span>
                <Link
                  to={`/programmes/${prog.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  View Details &rarr;
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Pagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        onChange={pagination.setPage}
        totalLabel={`${pagination.total} programmes`}
      />

      {/* Create Programme Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Programme">
        <div className="space-y-4 text-xs">
          <Field label="Programme Title" required>
            <Input
              value={newProg.title}
              onChange={(e) => setNewProg({ ...newProg, title: e.target.value })}
              placeholder="e.g. AI Literacy & Data Ethics for East Africa"
            />
          </Field>
          <Field label="Brief Summary" required>
            <Input
              value={newProg.summary}
              onChange={(e) => setNewProg({ ...newProg, summary: e.target.value })}
              placeholder="1-2 sentences explaining the programme core objective"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Programme Level">
              <Select
                value={String(newProg.level)}
                onChange={(e) => setNewProg({ ...newProg, level: Number(e.target.value) as 1 | 2 })}
              >
                <option value="1">Level 1: Virtual Exchange</option>
                <option value="2">Level 2: Impact Project Lab</option>
              </Select>
            </Field>
            <Field label="Thematic Category">
              <Select
                value={newProg.theme}
                onChange={(e) => setNewProg({ ...newProg, theme: e.target.value })}
              >
                <option value="Digital skills">Digital skills</option>
                <option value="Responsible AI">Responsible AI</option>
                <option value="Climate action">Climate action</option>
                <option value="Agriculture">Agriculture & Food</option>
                <option value="Health">Community Health</option>
                <option value="Employment">Youth Employment</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Duration (Weeks)">
              <Input
                type="number"
                value={newProg.durationWeeks}
                onChange={(e) => setNewProg({ ...newProg, durationWeeks: Number(e.target.value) })}
              />
            </Field>
            <Field label="Capacity (Students)">
              <Input
                type="number"
                value={newProg.capacity}
                onChange={(e) => setNewProg({ ...newProg, capacity: Number(e.target.value) })}
              />
            </Field>
            <Field label="Cohort Name">
              <Input
                value={newProg.cohort}
                onChange={(e) => setNewProg({ ...newProg, cohort: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateProgramme}>Save & Publish Programme</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
export function AdminProjectsPage() {
  useDocumentTitle('Impact Projects');
  const state = useDemoData();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Employment', label: 'Employment & Livelihoods' },
    { id: 'Education', label: 'Education & Learning' },
    { id: 'Agriculture', label: 'Agriculture & Food Systems' },
    { id: 'Health', label: 'Community Health' },
    { id: 'Climate change', label: 'Climate & Renewable Energy' },
    { id: 'Digital inclusion', label: 'Digital Inclusion' },
  ];

  const filtered = state.projects.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.theme.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impact Project Management"
        eyebrow="Youth Innovation"
        description="Review community project proposals across Uganda and East Africa, monitor milestones, review submissions, and evaluate impact outcomes."
      />

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedCategory === c.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((proj) => {
          const team = state.teams.find((t) => t.id === proj.teamId);
          const approvedCount = proj.milestones.filter((m) => m.status === 'approved').length;
          const progressVal = Math.round((approvedCount / (proj.milestones.length || 1)) * 100);

          return (
            <Card key={proj.id} className="flex flex-col justify-between">
              <CardHeader
                title={proj.title}
                description={team?.name ?? 'Assigned Team'}
                action={<Badge variant={proj.status === 'active' ? 'teal' : 'warning'}>{proj.status}</Badge>}
              />
              <CardBody className="space-y-3 text-xs">
                <p className="line-clamp-3 text-slate-600">{proj.summary}</p>
                <div>
                  <div className="flex justify-between text-2xs text-slate-500 mb-1">
                    <span>Milestones Approved ({approvedCount}/{proj.milestones.length})</span>
                    <span className="font-bold text-slate-800">{progressVal}%</span>
                  </div>
                  <ProgressBar value={progressVal} label="Milestones" />
                </div>
              </CardBody>
              <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 p-4">
                <Badge variant="outline">{proj.theme}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast({ title: 'Project Details', description: `Opening review for ${proj.title}.` })}
                >
                  Review Proposal
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4G. Session & Event Management                                      */
/* ------------------------------------------------------------------ */

export function AdminSessionsPage() {
  useDocumentTitle('Session & Event Management');
  const state = useDemoData();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [sessionDraft, setSessionDraft] = useState({
    title: '',
    programmeId: state.programmes[0]?.id ?? '',
    durationMins: 60,
    capacity: 50,
    description: '',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Session & Event Management"
        eyebrow="Live Virtual Workshops"
        description="Schedule webinars, workshops and cross-border exchange sessions. Track student attendance and upload presentation resources."
        actions={
          <Button variant="primary" iconLeft={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Schedule Session
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Scheduled Sessions" value={state.sessions.length} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="Upcoming Sessions" value={state.sessions.filter((s) => s.status === 'upcoming').length} icon={<Video className="h-4 w-4" />} />
        <StatCard label="Completed Sessions" value={state.sessions.filter((s) => s.status === 'completed').length} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="space-y-3">
        {state.sessions.map((ses) => (
          <div key={ses.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold">
                <Video className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{ses.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(ses.startsAt)} · {ses.durationMins} mins · Capacity {ses.capacity} learners</p>
                <p className="mt-2 text-xs text-slate-600 max-w-xl">{ses.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={ses.status === 'upcoming' ? 'info' : 'outline'}>{ses.status}</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast({ title: 'Attendance Record', description: `Attendance confirmed for ${ses.title}.` })}
              >
                Manage Attendance
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Session Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule New Virtual Session">
        <div className="space-y-4 text-xs">
          <Field label="Session Title" required>
            <Input
              value={sessionDraft.title}
              onChange={(e) => setSessionDraft({ ...sessionDraft, title: e.target.value })}
              placeholder="e.g. Workshop: Generative AI for East African Agritech"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration (Minutes)">
              <Input
                type="number"
                value={sessionDraft.durationMins}
                onChange={(e) => setSessionDraft({ ...sessionDraft, durationMins: Number(e.target.value) })}
              />
            </Field>
            <Field label="Capacity">
              <Input
                type="number"
                value={sessionDraft.capacity}
                onChange={(e) => setSessionDraft({ ...sessionDraft, capacity: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Description & Objectives">
            <Textarea
              value={sessionDraft.description}
              onChange={(e) => setSessionDraft({ ...sessionDraft, description: e.target.value })}
              placeholder="Provide agenda and key learning outcomes..."
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                toast({ title: 'Session Scheduled', description: `${sessionDraft.title} is now scheduled and published.` });
                setCreateOpen(false);
              }}
            >
              Publish Session
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4H. Assessment Management                                           */
/* ------------------------------------------------------------------ */

export function AdminAssessmentsPage() {
  useDocumentTitle('Assessment Management');
  const state = useDemoData();
  const { toast } = useToast();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [gradingScore, setGradingScore] = useState(90);
  const [gradingFeedback, setGradingFeedback] = useState('Outstanding structured response and clear contextual evidence.');

  function submitGrade() {
    if (!selectedAssessment) return;
    demoDb.gradeAssessment(selectedAssessment.id, gradingScore, gradingFeedback);
    toast({ title: 'Grade Published', description: `Assessment scored at ${gradingScore}% with feedback.` });
    setSelectedAssessment(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Management"
        eyebrow="Evaluation & Grading"
        description="Review participant submissions, grade quizzes and reflective assignments, set deadlines and publish official scores."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Assessments" value={state.assessments.length} icon={<ClipboardCheck className="h-4 w-4" />} />
        <StatCard label="Pending Grading" value={state.assessments.filter((a) => a.status === 'submitted').length} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Graded & Published" value={state.assessments.filter((a) => a.status === 'graded').length} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader title="Participant Submissions Queue" description="Select a submission to review answers, assign scores and provide direct feedback." />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-slate-500">
                <tr>
                  <th className="p-3.5">Assessment Title</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{a.title}</td>
                    <td className="p-3.5 capitalize text-slate-600">{a.type}</td>
                    <td className="p-3.5"><StatusBadge status={a.status} /></td>
                    <td className="p-3.5 font-bold text-slate-700">{a.score !== undefined ? `${a.score}%` : '—'}</td>
                    <td className="p-3.5 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(a)}>
                        {a.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Grading Dialog */}
      <Dialog open={Boolean(selectedAssessment)} onClose={() => setSelectedAssessment(null)} title={`Grade: ${selectedAssessment?.title ?? ''}`}>
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">{selectedAssessment?.description}</p>
          <Field label="Score Percentage (0 - 100)">
            <Input
              type="number"
              min="0"
              max="100"
              value={gradingScore}
              onChange={(e) => setGradingScore(Number(e.target.value))}
            />
          </Field>
          <Field label="Administrator Evaluation & Feedback">
            <Textarea
              rows={3}
              value={gradingFeedback}
              onChange={(e) => setGradingFeedback(e.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedAssessment(null)}>Cancel</Button>
            <Button variant="primary" onClick={submitGrade}>Publish Grade</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4I. Certificate Management                                          */
/* ------------------------------------------------------------------ */

export function AdminCertificatesPage() {
  useDocumentTitle('Certificate Management');
  const state = useDemoData();
  const { toast } = useToast();

  const eligibleParticipants = state.users.filter((u) => u.role === 'participant' && u.profileComplete >= 80);

  function handleIssue(participant: User) {
    const code = demoDb.issueCertificate(state.programmes[0]?.id ?? 'prog-digital-foundations', participant.id);
    toast({ title: 'Certificate Issued', description: `Issued certificate ${code} for ${participant.name}.` });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate Management"
        eyebrow="Accreditation & Recognition"
        description="Verify curriculum completion, generate unique verifiable certificate IDs and manage the public verification registry."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Issued Certificates" value={state.certificates.length} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Eligible for Issuance" value={eligibleParticipants.length} icon={<UserCheck className="h-4 w-4" />} />
        <StatCard label="Verification Queries" value={142} icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader
          title="Eligible Participants for Certificate Issuance"
          description="Youth who have satisfied all Level One module requirements and passed the final assessment."
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-slate-500">
                <tr>
                  <th className="p-3.5">Learner Name</th>
                  <th className="p-3.5">Country</th>
                  <th className="p-3.5">Completion</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eligibleParticipants.map((learner) => {
                  const existingCert = state.certificates.find((c) => c.participantId === learner.id);
                  return (
                    <tr key={learner.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{learner.name}</td>
                      <td className="p-3.5 text-slate-600">{learner.country}</td>
                      <td className="p-3.5 font-bold text-emerald-600">{learner.profileComplete}% Completed</td>
                      <td className="p-3.5 text-right">
                        {existingCert ? (
                          <span className="font-mono text-2xs font-bold text-blue-600">{existingCert.code} (Issued)</span>
                        ) : (
                          <Button size="sm" variant="primary" onClick={() => handleIssue(learner)}>
                            Issue Certificate
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4J. Communication Management                                        */
/* ------------------------------------------------------------------ */

export function AdminCommunicationsPage() {
  useDocumentTitle('Communication Management');
  const state = useDemoData();
  const { toast } = useToast();
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'participant' | 'admin'>('all');
  const [priority, setPriority] = useState<'normal' | 'important' | 'critical'>('normal');

  function handleSendBroadcast() {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      toast({ title: 'Validation error', description: 'Enter title and announcement body.', variant: 'error' });
      return;
    }
    demoDb.addAnnouncement({
      title: broadcastTitle,
      content: broadcastBody,
      targetRole,
      priority,
      authorName: 'Peter Ssemakula (Administrator)',
    });
    toast({ title: 'Announcement Published', description: 'Broadcast sent to all authorized users.' });
    setBroadcastTitle('');
    setBroadcastBody('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Management"
        eyebrow="Announcements & Broadcasts"
        description="Publish platform-wide announcements, broadcast cohort reminders and manage real-time system alerts."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Create Broadcast Announcement" description="Send a notification and portal announcement." />
          <CardBody className="space-y-4 text-xs">
            <Field label="Announcement Title" required>
              <Input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Welcome Cohort 2026 Virtual Exchange"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target Audience">
                <Select value={targetRole} onChange={(e) => setTargetRole(e.target.value as any)}>
                  <option value="all">All Users</option>
                  <option value="participant">Participants Only</option>
                  <option value="admin">Administrators Only</option>
                </Select>
              </Field>
              <Field label="Priority Level">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="critical">Critical</option>
                </Select>
              </Field>
            </div>
            <Field label="Announcement Content" required>
              <Textarea
                rows={4}
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="Write your announcement details here..."
              />
            </Field>
            <Button variant="primary" iconLeft={<Send className="h-4 w-4" />} onClick={handleSendBroadcast}>
              Publish Announcement
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent Announcements" description="Live announcements visible to users." />
          <CardBody className="space-y-3">
            {(state.announcements ?? []).map((ann) => (
              <div key={ann.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{ann.title}</span>
                  <Badge variant={ann.priority === 'important' ? 'warning' : 'outline'}>{ann.priority}</Badge>
                </div>
                <p className="mt-1 text-slate-600 line-clamp-2">{ann.content}</p>
                <div className="mt-2 flex items-center justify-between text-2xs text-slate-400">
                  <span>{ann.authorName}</span>
                  <span>{formatDate(ann.publishedAt)}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

