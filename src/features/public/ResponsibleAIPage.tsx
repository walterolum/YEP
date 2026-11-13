import { AlertTriangle, ArrowRight, Bot, CheckCircle2, Eye, Fingerprint, LockKeyhole, Scale, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHero, PublicCTA } from '@/components/public/PageHero';
import { Accordion, Alert } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const principles = [
  {
    number: '01',
    icon: Eye,
    title: 'Verify before you rely',
    body: 'Generative AI produces likely text, not verified fact. Participants learn a repeatable verification routine: locate the original source, check an independent report of the same claim, and confirm the date. A fluent answer is treated as a draft.',
  },
  {
    number: '02',
    icon: Scale,
    title: 'Notice bias and representation',
    body: 'AI systems reflect their training data and the choices of the people deploying them. Participants examine whose perspectives are missing, avoid generating images or stories that claim to represent real communities, and do not use AI to make decisions about a person’s access to opportunity.',
  },
  {
    number: '03',
    icon: LockKeyhole,
    title: 'Protect personal data',
    body: 'No personal, confidential or sensitive community data is entered into a tool the programme does not control. This includes names, phone numbers, health information, precise locations and identifiable interview material. Data minimisation applies to AI tools as much as to forms.',
  },
  {
    number: '04',
    icon: UserCheck,
    title: 'Keep human accountability',
    body: 'A person or team remains responsible for any submission, decision or communication. “The tool said so” is not an explanation. Where an AI output influences a decision, the human decision-maker must be able to explain the reasoning and the checks performed.',
  },
  {
    number: '05',
    icon: Fingerprint,
    title: 'Disclose meaningful assistance',
    body: 'When AI materially contributes to work that others will rely on, participants state which tool was used, for what task and what was checked. Disclosure is proportionate: a short note is usually enough. It is not a confession and does not reduce credit for the work.',
  },
];

const faqs = [
  {
    id: 'ai-1',
    question: 'Can participants use AI tools in assessments?',
    answer: 'Only where the assessment instructions explicitly allow it. If allowed, the instructions state which tasks permit assistance and what disclosure is required. Where an assessment is designed to test unaided capability, AI use is not permitted. The demonstration does not enforce this technically; a real assessment design would use appropriate controls and human review.',
  },
  {
    id: 'ai-2',
    question: 'Does YouthRise use AI to grade or reject participants?',
    answer: 'No automated rejection or automated final grading is part of the proposed design. Team formation may use suggestions, but a facilitator reviews and documents the decision. Assessments are reviewed by authorised people against published criteria, with an appeal route.',
  },
  {
    id: 'ai-3',
    question: 'What should I do if I see harmful AI-generated content?',
    answer: 'Report it to the facilitator or through the safety reporting route. Do not reshare the content. The programme team will review the report, restrict access where necessary and record the action taken. Reports are handled by authorised personnel only.',
  },
  {
    id: 'ai-4',
    question: 'Will my data be used to train an AI model?',
    answer: 'This demonstration does not send any data to an AI provider. For a production platform, the data-processing terms would need to state explicitly whether any participant data is used for model training. The default position should be no use of participant data for training without specific, informed consent.',
  },
  {
    id: 'ai-5',
    question: 'How is AI use disclosed in project evidence?',
    answer: 'A short disclosure note is added to the relevant submission: the tool, the task, what was verified and what remains uncertain. If AI was used to draft text, the team must still be able to explain and defend the content. Disclosure is recorded alongside the submission history.',
  },
];

export function ResponsibleAIPage() {
  useDocumentTitle('Responsible AI and digital safety');
  return (
    <>
      <PageHero
        eyebrow="Responsible AI & digital safety"
        title="AI literacy includes the confidence to say no."
        description="YouthRise treats AI as a tool to be understood, questioned and disclosed — not an authority. This page sets out the proposed principles for learning, projects and platform behaviour."
        breadcrumbs={[{ label: 'Responsible AI & safety' }]}
        aside={
          <div className="rounded-lg border border-line bg-white p-4 shadow-xs">
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Core position</p>
            <p className="mt-2 text-sm font-medium leading-6 text-ink">
              No automated rejection. No automated final grading. Human accountability for decisions.
            </p>
            <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-2xs text-teal-700">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Proposed product principle
            </div>
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Principles</p>
            <h2 className="text-display-md font-semibold text-ink">Five rules for responsible use.</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate">
              These principles apply to participants, mentors, facilitators and staff. They are written to be usable in
              a project conversation, not just displayed on a policy page.
            </p>
          </div>
          <ol className="border-y border-line">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <li key={principle.number} className="grid gap-3 border-b border-line py-5 last:border-0 sm:grid-cols-[3.5rem_1fr] sm:gap-5">
                  <span className="text-lg font-semibold tracking-tight text-navy-100">{principle.number}</span>
                  <div>
                    <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                      <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
                      {principle.title}
                    </h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{principle.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-12 lg:py-16" aria-labelledby="boundaries-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Platform boundaries</p>
            <h2 id="boundaries-heading" className="text-display-md font-semibold text-ink">
              What AI will and will not do in YouthRise.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-success-100 bg-white p-5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                <CheckCircle2 className="h-4.5 w-4.5 text-success" aria-hidden="true" />
                Potential uses
              </h3>
              <ul className="mt-3 space-y-2.5">
                {[
                  'Drafting practice feedback that a facilitator reviews before release.',
                  'Suggesting a team composition that a facilitator inspects and can adjust.',
                  'Summarising a long public document with links to the original source.',
                  'Helping a participant find a relevant lesson, with the source shown.',
                  'Detecting likely duplicate content for human review — never automatic sanction.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-[0.8125rem] leading-6 text-slate">
                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-danger-100 bg-white p-5">
              <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                <XCircle className="h-4.5 w-4.5 text-danger" aria-hidden="true" />
                Not permitted
              </h3>
              <ul className="mt-3 space-y-2.5">
                {[
                  'Automatically rejecting a participant from a programme or team.',
                  'Issuing a final grade or certificate without authorised human approval.',
                  'Making safeguarding, disciplinary or privacy decisions.',
                  'Generating images or testimonials that imply real people or communities.',
                  'Sending participant data to a model or provider outside approved terms.',
                  'Presenting generated content as verified evidence without disclosure.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-[0.8125rem] leading-6 text-slate">
                    <XCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16" aria-labelledby="safety-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Digital safety</p>
            <h2 id="safety-heading" className="text-display-md font-semibold text-ink">
              Safety is a route, not a disclaimer.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate">
              Participants can report harmful content, conduct or a privacy concern. Reports are restricted to
              authorised personnel, assigned to a named reviewer and tracked through to resolution. Retaliation is not
              tolerated.
            </p>
            <div className="mt-5">
              <Alert variant="warning" title="In an emergency">
                This demonstration platform is not monitored. If someone is in immediate danger, contact local emergency
                services. A production platform would publish a monitored safeguarding contact and response times.
              </Alert>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { icon: ShieldCheck, title: 'Scoped access', text: 'Safety incident details are not visible to facilitators, mentors or employers by default.' },
                { icon: AlertTriangle, title: 'Severity and escalation', text: 'Reports are triaged by severity, assigned to a reviewer and escalated where required.' },
                { icon: LockKeyhole, title: 'Privacy requests', text: 'Access, correction, restriction and deletion requests have a documented workflow and identity check.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3 rounded-md border border-line p-4">
                    <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal" aria-hidden="true" />
                    <div>
                      <h3 className="text-[0.8125rem] font-semibold text-ink">{item.title}</h3>
                      <p className="mt-0.5 text-xs leading-5 text-slate">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">Common questions</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">AI use in learning and assessment</h2>
            <Accordion items={faqs} className="mt-4" />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline">
                All frequently asked questions
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline">
                Report a concern
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-navy py-10 text-white">
        <div className="container-editorial flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Bot className="mt-0.5 h-5 w-5 shrink-0 text-teal-100" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">This platform does not currently call an AI model.</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-navy-100">
                The responsible AI content is educational. Any future AI feature would require a documented purpose,
                data-processing review, human oversight and an accessible explanation for participants.
              </p>
            </div>
          </div>
          <Link to="/accessibility" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-teal-100 hover:text-white">
            Accessibility statement
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <PublicCTA
        title="Learn to use digital tools with judgement."
        description="Create a demonstration account to explore the responsible AI module, source verification practice and assessment feedback."
        primaryLabel="Join YouthRise"
        secondaryLabel="Explore programmes"
      />
    </>
  );
}
