import { ArrowRight, CalendarClock, CheckCircle2, Clock, MessageSquare, Mic, ShieldCheck, Users, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoNote, PageHero, PublicCTA } from '@/components/public/PageHero';
import { Badge, Card, CardBody, CardHeader, StatusBadge } from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateTime } from '@/utils/format';

const expectations = [
  'Join at least five of the eight live sessions where the programme requires attendance.',
  'Prepare using the short pre-session materials; they are designed to take under 20 minutes.',
  'Contribute to the group working agreement and respect the facilitation format.',
  'Use the chat or hand-raise feature rather than speaking over others.',
  'Avoid sharing another participant’s personal information, screenshots or contact details outside the session.',
  'Complete the reflection task after the exchange; attendance alone does not complete Level One.',
];

const stages = [
  {
    title: 'Before the session',
    items: ['Review the session description and local start time', 'Test microphone or plan to use text chat', 'Read the short preparation prompt', 'Submit any accessibility or interpretation request in advance'],
  },
  {
    title: 'During the session',
    items: ['Join five minutes early', 'Use the shared working agreement', 'Contribute through speech, chat or written prompts', 'Note one question you want to follow up'],
  },
  {
    title: 'After the session',
    items: ['Review the summary and materials', 'Complete the short reflection', 'Continue the discussion in the cohort area', 'Flag any safety or access concern to the facilitator'],
  },
];

export function VirtualExchangePage() {
  useDocumentTitle('Level One virtual exchange');
  const state = useDemoData();
  const upcoming = state.sessions
    .filter((session) => session.status === 'upcoming')
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Level One · Virtual exchange"
        title="Collaboration begins with listening across difference."
        description="Facilitated online sessions connect young people across East Africa for structured intercultural learning, peer exchange and collaborative problem scoping."
        breadcrumbs={[{ label: 'Virtual exchange' }]}
        aside={
          <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Next demonstration session</p>
            <p className="mt-2 text-sm font-semibold leading-5 text-ink">Welcome circle: meet your exchange cohort</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-2xs text-slate">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              4 November 2026 · 16:00 EAT
            </p>
            <Link to="/login" className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-royal hover:underline">
              Sign in to register
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <div className="prose-brand max-w-none">
            <DemoNote className="mb-7">
              Session dates, attendance figures and meeting links are demonstration data. Live sessions would be hosted
              on an external meeting service; this platform does not host video.
            </DemoNote>
            <h2 className="!mt-0">What the exchange is — and is not</h2>
            <p>
              The exchange is a structured learning activity, not an open video call. Each session has a purpose, a
              preparation prompt, a facilitation plan and a follow-up task. Participants are grouped across countries and
              disciplines so that the conversation includes more than one context.
            </p>
            <p>
              Sessions are designed to work on a modest connection. Text chat, captions and transcripts are treated as
              first-class participation routes. A participant who cannot use video should still be able to contribute and
              complete the programme.
            </p>
            <h2>Participation expectations</h2>
            <ul>
              {expectations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2>Attendance and completion</h2>
            <p>
              The facilitator records attendance after each session. Attendance is one input into completion, not the
              whole decision: the reflection task, knowledge checks and any programme-specific requirements also apply.
              Where a participant misses a session for a valid reason, the materials and a make-up activity are provided
              where the programme permits.
            </p>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader title="Session facts" />
              <CardBody className="space-y-3 text-xs">
                {[
                  ['Format', 'Facilitated online session'],
                  ['Duration', '60–90 minutes'],
                  ['Platform', 'External meeting link'],
                  ['Group size', 'Up to 60 participants'],
                  ['Participation', 'Speech, chat or written prompts'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-b border-line/70 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate">{label}</span>
                    <span className="text-right font-medium text-ink">{value}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <ShieldCheck className="h-4.5 w-4.5 text-teal-700" aria-hidden="true" />
              <h2 className="mt-2 text-[0.8125rem] font-semibold text-teal-700">Safety first</h2>
              <p className="mt-1 text-xs leading-5 text-teal-700">
                Participants can report a concern during or after a session. Reports are restricted to authorised
                facilitators and administrators. Retaliation is not tolerated.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-12 lg:py-16" aria-labelledby="session-structure-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Session structure</p>
            <h2 id="session-structure-heading" className="text-display-md font-semibold text-ink">
              Prepared, facilitated, followed up.
            </h2>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
            {stages.map((stage, index) => (
              <div key={stage.title} className="bg-white p-6">
                <span className="text-2xs font-semibold tracking-[0.12em] text-teal-700">0{index + 1}</span>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">{stage.title}</h3>
                <ul className="mt-3 space-y-2">
                  {stage.items.map((item) => (
                    <li key={item} className="flex gap-2 text-[0.8125rem] leading-6 text-slate">
                      <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16" aria-labelledby="upcoming-heading">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Demonstration calendar</p>
              <h2 id="upcoming-heading" className="text-2xl font-semibold tracking-tight text-ink">
                Upcoming exchange sessions
              </h2>
            </div>
            <Badge variant="warning">Sample schedule</Badge>
          </div>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {upcoming.map((session) => (
              <article key={session.id} className="grid gap-4 py-5 sm:grid-cols-[9rem_1fr_auto] sm:items-start sm:gap-6">
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-teal-700">EAT (UTC+3)</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{formatDateTime(session.startsAt).split(',')[1] ?? formatDateTime(session.startsAt)}</p>
                  <p className="mt-0.5 text-2xs text-slate">{formatDateTime(session.startsAt).split(',')[0]}</p>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[0.9375rem] font-semibold text-ink">{session.title}</h3>
                    <StatusBadge status={session.status} />
                  </div>
                  <p className="mt-1.5 max-w-2xl text-[0.8125rem] leading-6 text-slate">{session.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-slate">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {session.durationMins} minutes
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {session.registeredCount} of {session.capacity} registered (demo)
                    </span>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-line px-3 text-2xs font-semibold text-ink transition hover:border-navy/30 sm:self-center"
                >
                  Sign in to register
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-3 text-2xs text-slate">
            Registration, cancellation and attendance records are available in the participant workspace. Meeting links
            are only shown to registered participants where configured.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-canvas py-12 lg:py-16" aria-labelledby="access-heading">
        <div className="container-editorial grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: WifiOff,
              title: 'Low-bandwidth participation',
              text: 'Join by audio or text. Session summaries and transcripts are added afterwards where consent allows. No large downloads are required before a session.',
            },
            {
              icon: Mic,
              title: 'Accessible communication',
              text: 'Captions are enabled where the meeting platform supports them. Participants can request interpretation or a written alternative in advance.',
            },
            {
              icon: MessageSquare,
              title: 'Asynchronous discussion',
              text: 'Each cohort has a discussion area for questions, follow-up and materials. Facilitators respond within the published working hours.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-lg border border-line bg-white p-5">
                <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                <h3 className="mt-3 text-[0.9375rem] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <PublicCTA
        title="Join an exchange cohort."
        description="Create a demonstration account to see session registration, attendance status, materials and the cohort discussion area."
        primaryLabel="Join YouthRise"
        secondaryLabel="See how it works"
        secondaryTo="/how-it-works"
      />
    </>
  );
}
