import {
  ArrowRight,
  Award,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileText,
  Lock,
  Printer,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Dialog,
  Field,
  Pagination,
  ProgressBar,
  Select,
  StatCard,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DEMO_MODE } from '@/services/apiClient';
import { assessmentService } from '@/services/assessmentService';
import type { Assessment, Certificate } from '@/types';
import { formatDate, formatDateTime, formatDueDate, percent, titleCase } from '@/utils/format';
import { FilterToolbar, PanelEmpty, useAsyncAction, usePagination } from '@/features/app/shared';
import { LiveBadgesPanel } from '@/features/app/LiveWorkspacePanels';

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

const assessmentTypeLabel: Record<Assessment['type'], string> = {
  quiz: 'Knowledge check',
  reflection: 'Written reflection',
  project: 'Project assessment',
  final: 'Final assessment',
};

export function ParticipantAssessmentsPage() {
  useDocumentTitle('Assessments');
  const { user } = useAuth();
  const state = useDemoData();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [detail, setDetail] = useState<Assessment | null>(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const userId = user?.id ?? '';

  const programmeIds = state.enrolments
    .filter((enrolment) => enrolment.userId === userId)
    .map((enrolment) => enrolment.programmeId);
  const assessments = state.assessments
    .filter((assessment) => programmeIds.includes(assessment.programmeId))
    .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));

  const filtered = assessments
    .filter((assessment) => {
      if (tab === 'all') return true;
      if (tab === 'open') return assessment.status === 'available' || assessment.status === 'reopened';
      if (tab === 'submitted') return assessment.status === 'submitted';
      if (tab === 'graded') return assessment.status === 'graded';
      return assessment.status === 'locked';
    })
    .filter((assessment) => (type === 'all' ? true : assessment.type === type))
    .filter((assessment) =>
      `${assessment.title} ${assessment.description}`.toLowerCase().includes(query.trim().toLowerCase()),
    );
  const pagination = usePagination(filtered, 6);

  if (!user) return null;

  const graded = assessments.filter((assessment) => assessment.status === 'graded');
  const average = graded.length
    ? Math.round(
        graded.reduce((total, assessment) => total + percent(assessment.score ?? 0, assessment.maxScore), 0) /
          graded.length,
      )
    : 0;
  const open = assessments.filter((assessment) => assessment.status === 'available' || assessment.status === 'reopened');
  const nextDue = open[0];

  const programmeTitle = (programmeId: string) =>
    state.programmes.find((programme) => programme.id === programmeId)?.title ?? 'Programme';

  function openDetail(assessment: Assessment) {
    setDetail(assessment);
    setResponse('');
    setError('');
  }

  async function submit() {
    if (!detail) return;
    if (response.trim().length < 40) {
      setError('Write at least 40 characters so your facilitator has enough to assess.');
      return;
    }
    setError('');
    const result = await run('submit-assessment', () => assessmentService.submit(detail.id, userId, response.trim()), {
      successTitle: 'Assessment submitted',
      successDescription: 'Your facilitator will review this submission. A demonstration grade is not generated automatically.',
    });
    if (result !== undefined) {
      setDetail(null);
      setResponse('');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Checks, reflections and project assessments for your enrolled programmes. Demonstration grades are illustrative only."
        eyebrow="Learning"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open assessments" value={open.length} icon={<ClipboardCheck className="h-4 w-4" aria-hidden="true" />} hint={nextDue ? formatDueDate(nextDue.dueAt) : 'Nothing due'} />
        <StatCard label="Submitted" value={assessments.filter((assessment) => assessment.status === 'submitted').length} icon={<FileText className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Graded" value={graded.length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Average score" value={graded.length ? `${average}%` : '—'} icon={<Target className="h-4 w-4" aria-hidden="true" />} hint={graded.length ? 'Across graded assessments' : 'No grades yet'} />
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Assessment filters">
        {[
          { id: 'all', label: 'All', count: assessments.length },
          { id: 'open', label: 'Open', count: open.length },
          { id: 'submitted', label: 'Submitted', count: assessments.filter((assessment) => assessment.status === 'submitted').length },
          { id: 'graded', label: 'Graded', count: graded.length },
          { id: 'locked', label: 'Locked', count: assessments.filter((assessment) => assessment.status === 'locked').length },
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
            <span className={`rounded px-1.5 py-0.5 text-2xs ${tab === item.id ? 'bg-white/15 text-white' : 'bg-canvas text-slate'}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search assessments"
        resultLabel={`${filtered.length} of ${assessments.length} assessments`}
        onReset={() => {
          setQuery('');
          setType('all');
          setTab('all');
        }}
      >
        <Select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by assessment type">
          <option value="all">All types</option>
          <option value="quiz">Knowledge check</option>
          <option value="reflection">Written reflection</option>
          <option value="project">Project assessment</option>
          <option value="final">Final assessment</option>
        </Select>
      </FilterToolbar>

      {filtered.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No assessments in this view"
            description="Try a different filter. Assessments appear once you are enrolled in a programme."
            action={<Button variant="outline" onClick={() => { setTab('all'); setType('all'); setQuery(''); }}>Reset filters</Button>}
            icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {pagination.pageItems.map((assessment) => {
            const isGraded = assessment.status === 'graded';
            const scorePercent = isGraded ? percent(assessment.score ?? 0, assessment.maxScore) : 0;
            return (
              <Card key={assessment.id}>
                <CardBody>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={assessment.status} />
                        <Badge variant="outline">{assessmentTypeLabel[assessment.type]}</Badge>
                        <Badge variant="neutral">{assessment.maxScore} marks</Badge>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">{assessment.title}</h2>
                      <p className="mt-1 text-2xs text-slate">{programmeTitle(assessment.programmeId)}</p>
                      <p className="mt-1.5 max-w-3xl text-[0.8125rem] leading-6 text-slate">{assessment.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-2xs text-slate">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                          {assessment.status === 'graded' ? `Submitted ${formatDate(assessment.submittedAt)}` : formatDueDate(assessment.dueAt)}
                        </span>
                        {assessment.status === 'graded' && (
                          <span className="inline-flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5" aria-hidden="true" />
                            {assessment.score} of {assessment.maxScore} ({scorePercent}%)
                          </span>
                        )}
                        {assessment.status === 'locked' && (
                          <span className="inline-flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            Unlocks after all modules are complete
                          </span>
                        )}
                      </div>
                      {isGraded && (
                        <div className="mt-3 max-w-md">
                          <ProgressBar value={scorePercent} label={`Score ${scorePercent}%`} />
                        </div>
                      )}
                      {isGraded && assessment.feedback && (
                        <div className="mt-3 rounded-md border border-line bg-canvas p-3 text-xs leading-5 text-slate">
                          <span className="font-semibold text-ink">Feedback: </span>
                          {assessment.feedback}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                      {assessment.status === 'available' || assessment.status === 'reopened' ? (
                        <Button size="sm" onClick={() => openDetail(assessment)}>
                          Start assessment
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => openDetail(assessment)}>
                          View details
                        </Button>
                      )}
                      <Link
                        to="/app/learning"
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-royal transition hover:bg-royal-50"
                      >
                        Learning centre
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          <Pagination page={pagination.page} pageCount={pagination.pageCount} onChange={pagination.setPage} totalLabel={`${pagination.total} assessments`} />
        </div>
      )}

      <Alert variant="info" title="Assessment integrity">
        In production, submissions are timestamped and stored against your account. AI assistance is permitted only
        where an assessment says so, and must be disclosed. This demonstration does not send your response anywhere.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.title ?? 'Assessment'}
        description={detail ? `${assessmentTypeLabel[detail.type]} · ${detail.maxScore} marks · ${programmeTitle(detail.programmeId)}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>
              Close
            </Button>
            {detail && (detail.status === 'available' || detail.status === 'reopened') && (
              <Button onClick={() => void submit()} loading={isPending('submit-assessment')}>
                Submit assessment
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate">{detail.description}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Status</p>
                <div className="mt-1.5"><StatusBadge status={detail.status} /></div>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Due</p>
                <p className="mt-1.5 text-xs font-medium text-ink">{formatDateTime(detail.dueAt)}</p>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Marks</p>
                <p className="mt-1.5 text-xs font-medium text-ink">
                  {detail.status === 'graded' ? `${detail.score} of ${detail.maxScore}` : detail.maxScore}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Instructions</h3>
              <ul className="mt-2 space-y-1.5">
                {detail.instructions.map((instruction) => (
                  <li key={instruction} className="flex gap-2 text-[0.8125rem] leading-6 text-slate">
                    <Check className="mt-1.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Marking criteria</h3>
              <div className="mt-2 overflow-hidden rounded-md border border-line">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Assessment marking criteria and maximum marks</caption>
                  <thead className="bg-canvas text-2xs uppercase tracking-[0.06em] text-slate">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-semibold">Criterion</th>
                      <th scope="col" className="px-3 py-2 font-semibold">What is assessed</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {detail.criteria.map((criterion) => (
                      <tr key={criterion.id}>
                        <td className="px-3 py-2 font-medium text-ink">{criterion.label}</td>
                        <td className="px-3 py-2 leading-5 text-slate">{criterion.description}</td>
                        <td className="px-3 py-2 text-right text-ink">{criterion.maxScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {detail.status === 'graded' && (
              <>
                <div className="rounded-md border border-success-100 bg-success-50 p-3.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Graded {detail.score} of {detail.maxScore} ({percent(detail.score ?? 0, detail.maxScore)}%)
                  </p>
                  {detail.feedback && <p className="mt-1.5 text-xs leading-5 text-slate">{detail.feedback}</p>}
                </div>
                <p className="text-2xs text-slate">
                  Submitted {formatDateTime(detail.submittedAt)}. This assessment cannot be retaken.
                </p>
              </>
            )}

            {detail.status === 'submitted' && (
              <Alert variant="info" title="Awaiting review">
                Your submission is with your facilitator. You will receive a notification when feedback is available.
              </Alert>
            )}

            {detail.status === 'locked' && (
              <Alert variant="warning" title="This assessment is locked">
                Complete all modules in the programme and any prerequisite assessments to unlock it. Locked
                assessments cannot be started early.
              </Alert>
            )}

            {(detail.status === 'available' || detail.status === 'reopened') && (
              <Field
                label="Your response"
                htmlFor="assessment-response"
                hint="Minimum 40 characters in this demonstration. Do not include personal data about other people."
                error={error}
              >
                <Textarea
                  id="assessment-response"
                  rows={8}
                  value={response}
                  onChange={(event) => {
                    setResponse(event.target.value);
                    setError('');
                  }}
                  placeholder="Structure your response against the criteria above…"
                />
                <p className="mt-1 text-2xs text-slate">{response.trim().length} characters</p>
              </Field>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Certificates                                                        */
/* ------------------------------------------------------------------ */

export function ParticipantCertificatesPage() {
  useDocumentTitle('Certificates');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const [detail, setDetail] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState('');

  if (!user) return null;

  const certificates = state.certificates.filter((certificate) => certificate.participantId === user.id);
  const valid = certificates.filter((certificate) => certificate.status === 'valid');
  const pending = certificates.filter((certificate) => certificate.status === 'pending');

  async function copyCode(certificate: Certificate) {
    try {
      await navigator.clipboard.writeText(certificate.code);
      setCopied(certificate.code);
      toast({ title: 'Verification code copied', description: certificate.code, variant: 'success' });
      window.setTimeout(() => setCopied(''), 2000);
    } catch {
      toast({
        title: 'Copy is unavailable',
        description: `Select the code manually: ${certificate.code}`,
        variant: 'warning',
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Participation records for completed programmes. Certificates are demonstration records and are not accredited by any real institution."
        eyebrow="Recognition"
        actions={
          <Link
            to="/verify"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Verify a certificate
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Valid certificates" value={valid.length} icon={<Award className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Pending" value={pending.length} icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />} hint={pending.length ? 'Completion rules not yet met' : 'None pending'} />
        <StatCard label="Total records" value={certificates.length} icon={<FileText className="h-4 w-4" aria-hidden="true" />} />
      </div>

      {!DEMO_MODE && <LiveBadgesPanel />}

      {certificates.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No certificates yet"
            description="A certificate is issued only after all completion rules for a programme are approved. You can track progress in the learning centre."
            action={<Link to="/app/learning" className="text-sm font-semibold text-royal hover:underline">Go to learning centre</Link>}
            icon={<Award className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {certificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={certificate.status} />
                      <Badge variant="outline">Level {certificate.level}</Badge>
                    </div>
                    <h2 className="mt-2 text-[0.9375rem] font-semibold leading-6 tracking-tight text-ink">{certificate.programmeTitle}</h2>
                    <p className="mt-1 text-2xs text-slate">
                      {certificate.status === 'valid' ? `Issued ${formatDate(certificate.issueDate)}` : 'Issue date pending completion'}
                    </p>
                  </div>
                  <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${certificate.status === 'valid' ? 'bg-success-50 text-success' : certificate.status === 'pending' ? 'bg-warning-50 text-warning' : 'bg-danger-50 text-danger'}`}>
                    <Award className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-3 rounded-md bg-canvas px-3 py-2.5">
                  <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Verification code</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <code className="font-mono text-xs font-semibold text-ink">{certificate.code}</code>
                    <button
                      type="button"
                      onClick={() => void copyCode(certificate)}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-2xs font-semibold text-royal hover:bg-white"
                    >
                      {copied === certificate.code ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
                      {copied === certificate.code ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-2xs leading-5 text-slate">{certificate.verificationNote}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetail(certificate)}>
                    View certificate
                  </Button>
                  <Link
                    to={`/verify?code=${encodeURIComponent(certificate.code)}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-royal transition hover:bg-royal-50"
                  >
                    Verify
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Alert variant="warning" title="What these records mean">
        YouthRise is a proposed programme. These demonstration certificates do not represent accreditation, credit, a
        qualification, or a partnership with any named institution. A production certificate would carry an
        issuer signature, an issue date and a registry entry that can be checked independently.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Certificate preview"
        description="Demonstration record. Not an accredited qualification."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            {detail && (
              <>
                <Button variant="outline" onClick={() => void copyCode(detail)} iconLeft={<Copy className="h-4 w-4" aria-hidden="true" />}>
                  Copy code
                </Button>
                <Button
                  onClick={() => {
                    window.print();
                    toast({ title: 'Print dialog opened', description: 'Choose “Save as PDF” to keep a copy.', variant: 'info' });
                  }}
                  iconLeft={<Printer className="h-4 w-4" aria-hidden="true" />}
                >
                  Print / save PDF
                </Button>
              </>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-navy/15 bg-white p-6 text-center">
              <p className="text-2xs font-semibold uppercase tracking-[0.2em] text-royal">YouthRise</p>
              <p className="mt-1 text-2xs uppercase tracking-[0.12em] text-slate">Demonstration certificate</p>
              <div className="mx-auto mt-4 h-px w-16 bg-teal" aria-hidden="true" />
              <p className="mt-4 text-xs text-slate">This certifies that</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-navy">{detail.participantName}</p>
              <p className="mt-3 text-xs text-slate">participated in</p>
              <p className="mx-auto mt-1 max-w-sm text-[0.9375rem] font-semibold leading-6 text-ink">{detail.programmeTitle}</p>
              <p className="mt-3 text-2xs text-slate">Level {detail.level} · {detail.status === 'valid' ? `Issued ${formatDate(detail.issueDate)}` : 'Not yet issued'}</p>
              <div className="mx-auto mt-5 max-w-xs rounded border border-line bg-canvas px-3 py-2">
                <p className="text-2xs uppercase tracking-[0.08em] text-slate">Verification code</p>
                <code className="font-mono text-xs font-semibold text-ink">{detail.code}</code>
              </div>
              <p className="mx-auto mt-4 max-w-md text-[0.6875rem] leading-5 text-slate">
                This is a demonstration artefact generated for a capstone project. It is not issued by, endorsed by, or
                affiliated with any real awarding body, university or employer.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Status</p>
                <div className="mt-1.5"><StatusBadge status={detail.status} /></div>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Level</p>
                <p className="mt-1.5 text-xs font-medium text-ink">Level {detail.level}</p>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Record type</p>
                <p className="mt-1.5 text-xs font-medium text-ink">{titleCase(detail.status === 'valid' ? 'participation' : detail.status)}</p>
              </div>
            </div>

            <Alert variant="info" title="Verification note">
              {detail.verificationNote}
            </Alert>
          </div>
        )}
      </Dialog>
    </div>
  );
}

