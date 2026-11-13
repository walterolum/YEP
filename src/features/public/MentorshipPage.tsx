import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, Clock, HeartHandshake, MessageSquare, ShieldCheck, Users, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHero, PublicCTA } from '@/components/public/PageHero';
import { buttonStyles } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const cycle = [
  { title: 'Receive an assignment', text: 'Mentors are matched to teams by the programme team. The assignment includes the project theme, team composition and milestone dates.' },
  { title: 'Read the evidence', text: 'Review the submitted document, the milestone criteria and the team’s previous feedback before commenting.' },
  { title: 'Give structured feedback', text: 'Name what works, what needs to change and one specific next action. Use the rubric where the programme requires it.' },
  { title: 'Follow up', text: 'Record whether the team addressed previous comments. Escalate a concern to the facilitator rather than managing it alone.' },
];

const canAccess = [
  'Assigned teams and their approved member profiles',
  'Project documents and milestone evidence',
  'Submission history and review criteria',
  'Team discussion area for assigned teams',
  'Meeting scheduling and feedback records',
];

const cannotAccess = [
  'Unassigned teams or the full participant directory',
  'Private assessment scores outside assigned criteria',
  'Administrative user management or role assignment',
  'Safety incident records or privacy requests',
  'Participant contact details without consent',
];

export function MentorshipPage() {
  useDocumentTitle('Mentorship');
  return (
    <>
      <PageHero
        eyebrow="Mentorship"
        title="Guidance with a boundary around it."
        description="Mentors help teams improve their thinking, evidence and project decisions. They work within scoped permissions and document their feedback so participants know what to do next."
        breadcrumbs={[{ label: 'Mentorship' }]}
        aside={
          <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Proposed commitment</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-navy">3–4 hrs / month</p>
            <p className="mt-1 text-xs leading-5 text-slate">Per assigned team, across a 10–12 week project cycle.</p>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
              <span className="rounded border border-teal-100 bg-teal-50 px-2 py-0.5 text-2xs font-semibold text-teal-700">Scoped access</span>
              <span className="rounded border border-line bg-canvas px-2 py-0.5 text-2xs font-semibold text-slate">Approved role</span>
            </div>
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">The mentor role</p>
            <h2 className="text-display-md font-semibold text-ink">Not a second project manager.</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate">
              Mentors bring perspective and ask useful questions. They do not take over the team’s work, make decisions
              for the team or replace the facilitator’s assessment role. Their value is in helping a team see what it has
              not yet examined.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Help a team test its assumptions and evidence.',
                'Ask about who is affected and who is missing from the conversation.',
                'Review milestone submissions against published criteria.',
                'Name a specific next action rather than offering general praise or criticism.',
                'Flag safeguarding, privacy or access concerns to the facilitator.',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-[0.8125rem] leading-6 text-ink">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ol className="border-y border-line">
            {cycle.map((step, index) => (
              <li key={step.title} className="grid gap-3 border-b border-line py-5 last:border-0 sm:grid-cols-[2.5rem_1fr] sm:gap-4">
                <span className="text-2xs font-semibold text-teal-700">0{index + 1}</span>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-[0.8125rem] leading-6 text-slate">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-12 lg:py-16" aria-labelledby="permissions-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Permissions</p>
            <h2 id="permissions-heading" className="text-display-md font-semibold text-ink">
              Access is limited to the assigned work.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate">
              Mentors do not receive unrestricted administrative permissions. The backend must enforce these boundaries
              independently of the interface.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-success-100 bg-white p-5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                <ShieldCheck className="h-4.5 w-4.5 text-success" aria-hidden="true" />
                Can access
              </h3>
              <ul className="mt-3 space-y-2.5">
                {canAccess.map((item) => (
                  <li key={item} className="flex gap-2 text-[0.8125rem] leading-6 text-slate">
                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                <XCircle className="h-4.5 w-4.5 text-slate" aria-hidden="true" />
                Cannot access
              </h3>
              <ul className="mt-3 space-y-2.5">
                {cannotAccess.map((item) => (
                  <li key={item} className="flex gap-2 text-[0.8125rem] leading-6 text-slate">
                    <XCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16" aria-labelledby="support-heading">
        <div className="container-editorial grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow mb-3">Becoming a mentor</p>
            <h2 id="support-heading" className="text-display-md font-semibold text-ink">
              Approved, onboarded and supported.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate">
              Mentor accounts are created through an authorised approval or invitation workflow. Selecting “mentor” on a
              public registration form does not grant the role.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: ClipboardCheck, title: 'Application review', text: 'Experience, availability and safeguarding checks.' },
                { icon: CalendarCheck, title: 'Onboarding', text: 'Programme model, rubric, boundaries and reporting routes.' },
                { icon: Users, title: 'Team assignment', text: 'A small number of teams matched to experience and theme.' },
                { icon: HeartHandshake, title: 'Ongoing support', text: 'A named programme contact and a feedback channel.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-md border border-line p-4">
                    <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
                    <h3 className="mt-2 text-[0.8125rem] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-2xs leading-5 text-slate">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-canvas p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
              <h3 className="text-[0.9375rem] font-semibold text-ink">A typical review</h3>
            </div>
            <div className="mt-4 space-y-3 text-2xs">
              <div className="rounded border border-line bg-white p-3">
                <p className="font-semibold text-ink">Submission</p>
                <p className="mt-0.5 text-slate">Stakeholder evidence summary · 6 conversations · names removed</p>
              </div>
              <div className="rounded border border-teal-100 bg-teal-50 p-3">
                <p className="font-semibold text-teal-700">Mentor feedback</p>
                <p className="mt-1 leading-5 text-ink">
                  “The summary is clear. Add one sentence on what you could not verify, and explain how the consent
                  records will be stored after the project.”
                </p>
                <p className="mt-1.5 text-slate">Next action: revise and resubmit · demo</p>
              </div>
              <div className="flex items-center gap-1.5 text-slate">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Feedback target: within three working days where possible
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-canvas py-12">
        <div className="container-editorial flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow mb-2">Mentor interest</p>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Interested in mentoring a YouthRise team?</h2>
            <p className="mt-1 max-w-xl text-[0.8125rem] leading-6 text-slate">
              This is a proposed programme. The contact form records a demonstration enquiry only and does not create a
              mentor account or commitment.
            </p>
          </div>
          <Link to="/contact?subject=mentor" className={buttonStyles({ size: 'md' })}>
            Register mentor interest
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <PublicCTA
        title="See the mentor workspace."
        description="Use the demonstration mentor account to explore assigned teams, project reviews, feedback history and meeting scheduling."
        primaryLabel="Join YouthRise"
        secondaryLabel="Read responsible AI"
        secondaryTo="/responsible-ai"
      />
    </>
  );
}
