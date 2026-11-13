import { ArrowRight, BadgeCheck, CheckCircle2, Compass, Eye, Globe2, GraduationCap, HeartHandshake, LockKeyhole, Scale, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHero, PublicCTA } from '@/components/public/PageHero';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const audiences = [
  { icon: GraduationCap, title: 'Young people aged 18–35', text: 'Seeking practical digital skills, cross-border collaboration and a documented project to show what they can do.' },
  { icon: Compass, title: 'Facilitators and learning designers', text: 'Running cohorts, shaping curriculum, reviewing evidence and forming teams through a transparent human process.' },
  { icon: HeartHandshake, title: 'Mentors', text: 'Supporting a small number of assigned teams with structured feedback, without administrative access to the whole platform.' },
  { icon: Users, title: 'Universities and training partners', text: 'Nominating learners and viewing aggregate participation and completion information within agreed permissions.' },
  { icon: Globe2, title: 'Employers', text: 'Discovering participant-controlled public portfolios and verified certificate status — not private data.' },
  { icon: ShieldCheck, title: 'Partner organizations and administrators', text: 'Following supported programmes, aggregate outcomes, safety, privacy and access governance.' },
];

const outcomes = [
  'Apply digital collaboration and responsible AI practices in practical tasks.',
  'Communicate and work with peers across different countries and contexts.',
  'Define a community problem and gather proportionate, consented evidence.',
  'Plan and test a small intervention with a team and a mentor.',
  'Document outcomes, limitations and learning honestly.',
  'Receive assessment feedback and recognition tied to transparent criteria.',
];

const principles = [
  { icon: Scale, title: 'Dignity and fairness', text: 'Participants are not data points. Interfaces avoid opaque scoring, public ranking and automated rejection.' },
  { icon: Eye, title: 'Evidence over assertion', text: 'Claims need sources, definitions and context. Demonstration data is always labelled.' },
  { icon: LockKeyhole, title: 'Privacy by design', text: 'Collect only what a decision requires. Separate public portfolios from private assessment records.' },
  { icon: BadgeCheck, title: 'Recognition that means something', text: 'Certificates are tied to completion rules and a verification code — not attendance alone.' },
  { icon: Users, title: 'Human judgement', text: 'Team formation, assessment appeals and safety decisions have a named human review step.' },
  { icon: ShieldCheck, title: 'Accessible by default', text: 'Keyboard access, readable contrast, captions and low-bandwidth paths are part of the product, not an afterthought.' },
];

export function AboutPage() {
  useDocumentTitle('About');
  return (
    <>
      <PageHero
        eyebrow="About the project"
        title="A regional platform for youth-led digital impact."
        description="YouthRise is a proposed digital empowerment and virtual exchange platform for young people aged 18-35 in Uganda, Kenya, Rwanda, Tanzania and the wider East African region."
        breadcrumbs={[{ label: 'About' }]}
        aside={
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-line bg-white/90 p-4 text-xs shadow-xs">
            {[
              ['Status', 'Proposed programme'],
              ['Focus', 'Ages 18–35'],
              ['Region', 'East Africa'],
              ['Model', 'Learn → exchange → build'],
              ['Recognition', 'Verifiable certificates'],
              ['Build', 'Demonstration frontend'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{label}</dt>
                <dd className="mt-0.5 font-medium leading-5 text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        }
      />

      <section className="bg-white py-14 lg:py-20" aria-labelledby="mission-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Mission</p>
            <h2 id="mission-heading" className="text-display-md font-semibold text-ink">
              Turn digital access into practical capability and community contribution.
            </h2>
          </div>
          <div className="space-y-5 text-[0.9875rem] leading-7 text-slate">
            <p>
              Young people across East Africa are often described as digitally connected, but access alone does not
              create capability. Many encounter fragmented learning opportunities, limited mentorship and few credible
              ways to show what they can do with what they have learned.
            </p>
            <p>
              YouthRise responds with an integrated model: short digital learning, facilitated cross-border exchange,
              interdisciplinary teamwork, mentor-guided community projects, transparent assessment and verifiable
              recognition. The intended outcome is not a certificate for its own sake, but a participant who can
              explain a problem, work with others, test a response and document what happened.
            </p>
            <p className="rounded-md border-l-2 border-teal bg-teal-50/50 px-4 py-3 text-[0.9375rem] text-ink">
              YouthRise is a proposal. Programme rules, partnerships, accreditation and impact claims are not final. This
              build demonstrates the intended product experience and integration surface.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-14 lg:py-20" aria-labelledby="why-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Why this model</p>
            <h2 id="why-heading" className="text-display-md font-semibold text-ink">
              Three gaps that a connected programme can address.
            </h2>
          </div>
          <div className="mt-9 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Learning without application',
                text: 'Short courses can build awareness but often stop before participants apply the skill in a real team context. YouthRise links each learning stage to an exchange activity and a project decision.',
              },
              {
                number: '02',
                title: 'Connection without structure',
                text: 'Virtual exchange can broaden perspective, but unstructured conversation rarely produces durable collaboration. YouthRise uses working agreements, facilitation and defined milestones.',
              },
              {
                number: '03',
                title: 'Recognition without evidence',
                text: 'Certificates that record attendance alone are difficult to interpret. YouthRise ties recognition to assessed evidence, completion rules and a public verification code.',
              },
            ].map((gap) => (
              <article key={gap.number} className="bg-white p-6">
                <span className="text-2xs font-semibold tracking-[0.14em] text-teal-700">{gap.number}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">{gap.title}</h3>
                <p className="mt-2 text-[0.8125rem] leading-6 text-slate">{gap.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20" aria-labelledby="audience-heading">
        <div className="container-editorial">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow mb-3">Who it serves</p>
              <h2 id="audience-heading" className="text-display-md font-semibold text-ink">
                One programme, seven distinct roles.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate lg:justify-self-end">
              Each role has a different purpose, permission boundary and interface. Participants do not see
              administrative tools; mentors see only assigned teams; employers see only participant-selected public
              portfolios.
            </p>
          </div>
          <ul className="mt-9 grid gap-x-10 sm:grid-cols-2">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <li key={audience.title} className="flex gap-4 border-t border-line py-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold text-ink">{audience.title}</h3>
                    <p className="mt-1 text-[0.8125rem] leading-6 text-slate">{audience.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-navy py-14 text-white lg:py-20" aria-labelledby="outcomes-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow-light mb-3">Intended outcomes</p>
            <h2 id="outcomes-heading" className="text-display-md font-semibold text-white">
              What a participant should be able to do.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-navy-100">
              These are intended learning outcomes for the proposed programme. They are not verified impact results.
            </p>
            <Link
              to="/programmes"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-100 transition hover:text-white"
            >
              Browse proposed programmes
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2.5 rounded-md border border-white/15 bg-white/5 p-4 text-[0.8125rem] leading-6 text-navy-100">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-100" aria-hidden="true" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20" aria-labelledby="principles-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Design principles</p>
            <h2 id="principles-heading" className="text-display-md font-semibold text-ink">
              How the product makes decisions.
            </h2>
          </div>
          <div className="mt-9 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} className="border-t border-line py-5">
                  <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                  <h3 className="mt-3 text-[0.9375rem] font-semibold text-ink">{principle.title}</h3>
                  <p className="mt-1 text-[0.8125rem] leading-6 text-slate">{principle.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-canvas py-14" aria-labelledby="not-heading">
        <div className="container-editorial grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow mb-3">Scope boundaries</p>
            <h2 id="not-heading" className="text-2xl font-semibold tracking-tight text-ink">
              What YouthRise is not.
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              'Not an accredited university qualification or a replacement for formal education.',
              'Not a guarantee of employment, income or funding.',
              'Not a grant-making, donation or financial disbursement platform.',
              'Not a public social network or an open directory of young people.',
              'Not an automated decision system for team placement or assessment appeals.',
              'Not a claim of real partnerships, endorsements or verified impact in this demonstration.',
            ].map((item) => (
              <li key={item} className="flex gap-2.5 border-t border-line pt-3 text-[0.8125rem] leading-6 text-slate">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PublicCTA
        title="Help shape a credible youth digital platform."
        description="Explore the programme model, review the responsible AI approach or create a demonstration account to test the participant and stakeholder workflows."
        primaryLabel="Join YouthRise"
        secondaryLabel="Read about responsible AI"
        secondaryTo="/responsible-ai"
      />
    </>
  );
}
