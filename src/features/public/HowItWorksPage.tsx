import { ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, GraduationCap, Layers, LifeBuoy, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHero, PublicCTA } from '@/components/public/PageHero';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const journey = [
  {
    step: '01',
    title: 'Register and verify',
    text: 'Create an account with your name, email, country and participation interests. Confirm your email address. You choose whether to receive optional communications.',
    detail: 'No privileged role is available through self-registration.',
  },
  {
    step: '02',
    title: 'Complete Level One learning',
    text: 'Work through short modules on digital collaboration, responsible AI, privacy and project planning. Lessons save your place and can be completed offline where materials are downloaded.',
    detail: 'Knowledge checks are formative and can be retaken where configured.',
  },
  {
    step: '03',
    title: 'Join a virtual exchange',
    text: 'Attend facilitated sessions with peers from other countries. Prepare using the session materials, contribute to a working agreement and complete the reflection task.',
    detail: 'Live sessions use an external meeting service; YouthRise stores the link, materials and attendance record.',
  },
  {
    step: '04',
    title: 'Apply for Level Two',
    text: 'Complete the eligibility reflection and confirm your availability. Facilitators review programme criteria, skills, interests and team diversity. You can review and appeal a proposed placement.',
    detail: 'Team formation is human-reviewed. There is no opaque automated rejection.',
  },
  {
    step: '05',
    title: 'Work through five milestones',
    text: 'With your team and mentor, define the problem, gather stakeholder evidence, test a prototype, compile an evidence pack and prepare a showcase.',
    detail: 'Each submission moves through Draft, Submitted, Under Review, Revision Required and Approved.',
  },
  {
    step: '06',
    title: 'Be assessed and revise',
    text: 'Facilitators and mentors apply published rubrics, record written feedback and request specific revisions where needed. You can respond to feedback and resubmit.',
    detail: 'Appeals are reviewed by someone who did not assess the original submission.',
  },
  {
    step: '07',
    title: 'Earn verifiable recognition',
    text: 'When the configured completion rules are met and approved, a certificate is issued with a unique verification code and a public authenticity check.',
    detail: 'Certificates record participation and assessed completion; they do not guarantee employment.',
  },
];

const eligibility = [
  'Aged 18–35 at the time of enrolment.',
  'Resident in Uganda, Kenya, Rwanda, Tanzania or another East African Community country.',
  'Access to a smartphone, tablet or computer and intermittent internet.',
  'Commitment to the participation, safety and privacy guidelines.',
  'For Level Two: completion of Level One requirements and confirmed team placement.',
];

export function HowItWorksPage() {
  useDocumentTitle('How it works');
  return (
    <>
      <PageHero
        eyebrow="Participant journey"
        title="From first sign-in to a documented community project."
        description="YouthRise connects learning, exchange, mentorship, assessment and recognition in one sequence. Each stage has a clear purpose, a visible status and a next action."
        breadcrumbs={[{ label: 'How it works' }]}
        aside={
          <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Typical commitment</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-navy">3–6 hrs / week</p>
            <p className="mt-1 text-xs leading-5 text-slate">
              Varies by level. Level One is largely asynchronous; Level Two includes team and mentor time.
            </p>
            <div className="mt-3 border-t border-line pt-3 text-2xs text-slate">
              Proposed programme · eligibility applies
            </div>
          </div>
        }
      />

      <section className="bg-white py-14 lg:py-20" aria-labelledby="journey-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">The sequence</p>
            <h2 id="journey-heading" className="text-display-md font-semibold text-ink">
              Seven stages, each with evidence.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate">
              Progression is not automatic. Each stage has completion criteria, and Level Two requires a confirmed team
              placement.
            </p>
          </div>

          <ol className="mt-10 space-y-0">
            {journey.map((item) => (
              <li key={item.step} className="grid gap-4 border-t border-line py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6">
                <div className="flex items-start gap-3 sm:block">
                  <span className="text-2xl font-semibold leading-none tracking-tight text-navy-100">{item.step}</span>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:gap-10">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-ink">{item.title}</h3>
                    <p className="mt-2 max-w-2xl text-[0.9375rem] leading-7 text-slate">{item.text}</p>
                  </div>
                  <p className="rounded-md border-l-2 border-teal-100 bg-teal-50/40 px-3.5 py-2.5 text-xs leading-5 text-teal-700">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-14 lg:py-20" aria-labelledby="eligibility-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Eligibility</p>
            <h2 id="eligibility-heading" className="text-display-md font-semibold text-ink">
              Who can take part.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate">
              These are proposed baseline criteria. Individual programmes may add requirements, and capacity is
              limited. Nomination by a partner does not replace registration or eligibility checks.
            </p>
            <ul className="mt-6 space-y-3">
              {eligibility.map((item) => (
                <li key={item} className="flex gap-2.5 text-[0.875rem] leading-6 text-ink">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-md border border-warning-100 bg-warning-50 p-4 text-xs leading-5 text-warning">
              <strong className="font-semibold">Demonstration note:</strong> registration and eligibility in this build
              are simulated. No real identity, student status or residency verification is performed.
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
                <h3 className="text-[0.9375rem] font-semibold text-ink">Assessment and completion</h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-6 text-slate">
                <li>Assessment criteria are shown before submission where the programme permits.</li>
                <li>Feedback is written and linked to specific criteria.</li>
                <li>A revision request names what needs to change; it is not a rejection.</li>
                <li>Certificate issuance follows configured completion rules and authorised approval.</li>
                <li>Reassessment and appeal information is available where configured.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
                <h3 className="text-[0.9375rem] font-semibold text-ink">Low-bandwidth participation</h3>
              </div>
              <p className="mt-3 text-[0.8125rem] leading-6 text-slate">
                Lessons are text-first and downloadable. Session recordings and transcripts are added after the event
                where consent allows. Live video is not required to complete most learning activities.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
                <h3 className="text-[0.9375rem] font-semibold text-ink">Support and appeals</h3>
              </div>
              <p className="mt-3 text-[0.8125rem] leading-6 text-slate">
                Participants can contact a facilitator, request accessibility adjustments, report a safety concern or
                appeal an assessment decision through a documented route. Personal data is restricted to authorised
                staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20" aria-labelledby="levels-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Programme structure</p>
            <h2 id="levels-heading" className="text-display-md font-semibold text-ink">
              Learning first. Projects second.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article className="rounded-lg border border-line p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded border border-royal-100 bg-royal-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.08em] text-royal">
                  Level One
                </span>
                <GraduationCap className="h-5 w-5 text-royal" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">Digital learning and virtual exchange</h3>
              <p className="mt-2 text-sm leading-6 text-slate">
                Build digital collaboration and AI literacy, then practise them in facilitated exchange sessions with
                peers across the region.
              </p>
              <ul className="mt-4 space-y-2 text-[0.8125rem] text-ink">
                {['Short asynchronous modules', 'Two or more live exchange sessions', 'Reflection and knowledge checks', 'Completion record'].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/virtual-exchange" className="mt-5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-royal hover:underline">
                Level One details
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
            <article className="rounded-lg border border-line p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded border border-teal-100 bg-teal-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.08em] text-teal-700">
                  Level Two
                </span>
                <Layers className="h-5 w-5 text-teal" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">Team-based community impact</h3>
              <p className="mt-2 text-sm leading-6 text-slate">
                Join an interdisciplinary team, work with a mentor and develop a community project through five
                documented milestones.
              </p>
              <ul className="mt-4 space-y-2 text-[0.8125rem] text-ink">
                {['Human-reviewed team placement', 'Assigned mentor and review cycle', 'Five milestones with evidence', 'Final showcase and recognition'].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/impact-projects" className="mt-5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-royal hover:underline">
                Level Two details
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
          </div>
          <div className="mt-8 flex flex-col items-start gap-3 rounded-lg border border-line bg-canvas p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-[0.8125rem] text-slate">
              <FileCheck2 className="h-4 w-4 text-teal" aria-hidden="true" />
              Completion is assessed against published criteria — not attendance alone.
            </p>
            <Link to="/programmes" className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-royal hover:underline">
              Browse programmes
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <PublicCTA
        title="See the participant workspace for yourself."
        description="Create a demonstration account to explore learning progress, exchange sessions, team collaboration and the project workspace."
        primaryLabel="Create an account"
        secondaryLabel="Browse programmes"
      />
    </>
  );
}
