import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHero, DemoNote } from '@/components/public/PageHero';
import { Badge, Button, Card, CardBody, CardHeader, ProgressBar, StatusBadge, useToast } from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuth } from '@/app/providers/AuthProvider';
import { programmeService } from '@/services/programmeService';
import { formatDate, pluralise } from '@/utils/format';

export function ProgrammeDetailPage() {
  const { programmeId } = useParams();
  const state = useDemoData();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const programme = state.programmes.find((entry) => entry.id === programmeId);
  const modules = state.modules.filter((module) => module.programmeId === programmeId);
  const enrolment = user ? state.enrolments.find((entry) => entry.programmeId === programmeId && entry.userId === user.id) : undefined;

  useDocumentTitle(programme?.title ?? 'Programme');

  if (!programme) {
    return (
      <div className="container-editorial py-20 text-center">
        <p className="eyebrow justify-center">Programme not found</p>
        <h1 className="mt-3 text-display-md font-semibold text-ink">That programme is not in the demonstration catalogue.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate">
          The programme may have been removed or the link may be incorrect. Browse the current demonstration catalogue to
          continue.
        </p>
        <Link to="/programmes" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to programmes
        </Link>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);

  async function handleEnrol() {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/programmes/${programme?.id ?? ''}`)}`);
      return;
    }
    if (user.role !== 'participant') {
      toast({ title: 'Participant accounts can enrol', description: 'This demonstration role is not a participant account.', variant: 'warning' });
      return;
    }
    setEnrolling(true);
    try {
      await programmeService.enrol(programme!.id, user.id);
      toast({ title: 'Enrolment recorded', description: 'This is a demonstration enrolment stored in your browser.', variant: 'success' });
      navigate('/app/programmes');
    } catch (error) {
      toast({
        title: 'Enrolment could not be completed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
      });
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow={`${programme.level === 1 ? 'Level One' : 'Level Two'} · ${programme.theme}`}
        title={programme.title}
        description={programme.summary}
        breadcrumbs={[{ label: 'Programmes', to: '/programmes' }, { label: programme.title }]}
        aside={
          <div className="w-full rounded-lg border border-line bg-white p-5 shadow-xs lg:w-72">
            <div className="flex flex-wrap gap-2">
              <Badge variant={programme.level === 1 ? 'info' : 'teal'}>{programme.level === 1 ? 'Level One' : 'Level Two'}</Badge>
              <StatusBadge status={programme.status} />
            </div>
            <dl className="mt-4 space-y-2.5 text-xs">
              {[
                ['Starts', formatDate(programme.startsAt)],
                ['Ends', formatDate(programme.endsAt)],
                ['Duration', `${programme.durationWeeks} weeks`],
                ['Commitment', programme.commitment],
                ['Format', programme.mode],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-slate">{label}</dt>
                  <dd className="max-w-[10rem] text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-line pt-4">
              {enrolment ? (
                <>
                  <div className="mb-2 flex items-center justify-between text-2xs">
                    <span className="font-semibold text-ink">Enrolment recorded</span>
                    <StatusBadge status={enrolment.status} />
                  </div>
                  <ProgressBar value={enrolment.progress} label="Programme progress" />
                  <Link
                    to={`/app/learning/${programme.id}`}
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-md bg-royal px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal-700"
                  >
                    Continue learning
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </>
              ) : programme.status === 'closed' ? (
                <div className="rounded-md border border-line bg-canvas p-3 text-2xs leading-5 text-slate">
                  This proposed cohort is closed. Browse other programmes or register your interest for a future cohort.
                </div>
              ) : (
                <Button onClick={() => void handleEnrol()} loading={enrolling} fullWidth>
                  {programme.status === 'waitlist' ? 'Join the waitlist' : 'Enrol in this programme'}
                </Button>
              )}
              {!user && programme.status !== 'closed' && (
                <p className="mt-2 text-center text-2xs text-slate">You will be asked to sign in or create an account.</p>
              )}
            </div>
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <div className="min-w-0">
            <DemoNote className="mb-8">
              This is a proposed programme outline. Dates, capacity and curriculum are demonstration data and are not a
              confirmed offer.
            </DemoNote>

            <div className="prose-brand max-w-none">
              <h2 className="!mt-0">About this programme</h2>
              <p>{programme.description}</p>

              <h2>What you will be able to do</h2>
              <ul>
                {programme.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>

              <h2>Eligibility</h2>
              <ul>
                {programme.eligibility.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow mb-2">Curriculum</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">Modules and lessons</h2>
                </div>
                <p className="text-2xs text-slate">
                  {pluralise(modules.length, 'module')} · {pluralise(totalLessons, 'lesson')}
                </p>
              </div>

              {modules.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-line bg-canvas p-6">
                  <BookOpen className="h-5 w-5 text-slate" aria-hidden="true" />
                  <h3 className="mt-3 text-[0.9375rem] font-semibold text-ink">Curriculum outline being finalised</h3>
                  <p className="mt-1 max-w-lg text-[0.8125rem] leading-6 text-slate">
                    No published modules are attached to this proposed programme in the demonstration environment. The
                    programme can still be browsed, but the learning centre will show an empty state.
                  </p>
                </div>
              ) : (
                <ol className="mt-5 space-y-3">
                  {modules.map((module) => (
                    <li key={module.id} className="rounded-lg border border-line bg-white">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xs font-semibold text-slate">MODULE {String(module.order).padStart(2, '0')}</span>
                            <StatusBadge status={module.status} />
                          </div>
                          <h3 className="mt-1.5 text-[0.9375rem] font-semibold text-ink">{module.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-slate">{module.summary}</p>
                        </div>
                        <div className="flex items-center gap-3 text-2xs text-slate">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                            {pluralise(module.lessons.length, 'lesson')}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {module.durationMins} min
                          </span>
                        </div>
                      </div>
                      <ul className="divide-y divide-line/70">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center justify-between gap-4 px-5 py-3">
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-100" aria-hidden="true" />
                              <span className="truncate text-[0.8125rem] text-ink">{lesson.title}</span>
                            </span>
                            <span className="shrink-0 text-2xs capitalize text-slate">
                              {lesson.type} · {lesson.durationMins} min
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader title="Assessment" description="How completion is judged" />
                <CardBody className="text-[0.8125rem] leading-6 text-slate">
                  Knowledge checks, a reflection task and, at Level Two, milestone evidence assessed against a published
                  rubric. Feedback is written and revision requests name a specific next action.
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Recognition" description="What completion may record" />
                <CardBody className="text-[0.8125rem] leading-6 text-slate">
                  A demonstration certificate with a verification code, issued only when configured completion rules are
                  met and approved. No accreditation or employment outcome is claimed.
                </CardBody>
              </Card>
            </div>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader title="At a glance" />
              <CardBody className="space-y-3 text-xs">
                {[
                  { icon: CalendarDays, label: 'Cohort', value: programme.cohort },
                  { icon: Clock, label: 'Duration', value: `${programme.durationWeeks} weeks` },
                  { icon: MapPin, label: 'Format', value: programme.mode },
                  { icon: Users, label: 'Places', value: `${programme.enrolledCount} / ${programme.capacity} represented` },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-2.5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate" aria-hidden="true" />
                      <div>
                        <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{item.label}</p>
                        <p className="mt-0.5 leading-5 text-ink">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Skills developed" />
              <CardBody className="flex flex-wrap gap-1.5">
                {programme.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </CardBody>
            </Card>

            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <h2 className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-teal-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Progression
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-teal-700">
                {programme.level === 1
                  ? 'Completion of Level One requirements is the normal route into Level Two impact projects.'
                  : 'Level Two requires Level One completion and a confirmed team placement through facilitator review.'}
              </p>
            </div>

            <p className="text-2xs leading-5 text-slate">
              Partner logos, accreditation statements and verified statistics are intentionally absent from this
              demonstration.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
