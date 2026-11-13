import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Compass,
  Eye,
  FileCheck2,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Layers,
  LockKeyhole,
  Quote,
  Scale,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroVisual } from '@/components/public/HeroVisual';
import { ProjectShowcase } from '@/components/public/ProjectShowcase';
import { PublicCTA } from '@/components/public/PageHero';
import { Reveal } from '@/components/visuals/Reveal';
import { buttonStyles } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';

const stakeholderGroups = [
  'Participants',
  'Facilitators',
  'Mentors',
  'Universities',
  'Employers',
  'Partner organizations',
  'Administrators',
];

const pillars = [
  {
    icon: Bot,
    title: 'Learn practical digital skills',
    description:
      'Short, low-bandwidth modules on collaboration tools, source verification, privacy and responsible AI — designed to be used, not just completed.',
    to: '/programmes',
    linkLabel: 'Explore learning',
  },
  {
    icon: Globe2,
    title: 'Exchange across borders',
    description:
      'Facilitated virtual sessions connect young people from different countries and contexts to practise respectful, structured collaboration.',
    to: '/virtual-exchange',
    linkLabel: 'See Level One',
  },
  {
    icon: Users,
    title: 'Build a community project',
    description:
      'Interdisciplinary teams work with a mentor through five documented milestones, from problem framing to an assessed public showcase.',
    to: '/impact-projects',
    linkLabel: 'See Level Two',
  },
];

const howSteps = [
  {
    icon: UserCheck,
    title: 'Join and confirm',
    text: 'Create an account, confirm your email and complete the participation basics.',
  },
  {
    icon: ClipboardCheck,
    title: 'Learn at your pace',
    text: 'Work through practical modules with knowledge checks and reflection tasks.',
  },
  {
    icon: Globe2,
    title: 'Exchange with peers',
    text: 'Join facilitated sessions, agree a working contract and scope a shared question.',
  },
  {
    icon: BadgeCheck,
    title: 'Build and be recognised',
    text: 'Document a team project, receive rubric-based feedback and earn verifiable recognition.',
  },
];

const featuredProgrammes = [
  {
    id: 'prog-digital-foundations',
    title: 'Digital Foundations & Responsible AI',
    level: 'Level One',
    duration: '6 weeks',
    mode: 'Online · asynchronous + 2 live sessions',
    summary:
      'Build confidence with digital collaboration, source verification, privacy habits and accountable AI use.',
    icon: Bot,
    tone: 'cyan',
  },
  {
    id: 'prog-virtual-exchange',
    title: 'East Africa Virtual Exchange',
    level: 'Level One',
    duration: '8 weeks',
    mode: 'Facilitated live sessions + async work',
    summary:
      'Meet peers across borders, practise intercultural collaboration and scope a shared community question.',
    icon: Globe2,
    tone: 'blue',
  },
  {
    id: 'prog-impact-lab',
    title: 'Community Impact Lab',
    level: 'Level Two',
    duration: '12 weeks',
    mode: 'Team-based · hybrid with local fieldwork',
    summary:
      'Work with a mentor and an interdisciplinary team to design, test and document a community project.',
    icon: Users,
    tone: 'teal',
  },
] as const;

const toneStyles = {
  cyan: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
  blue: 'bg-royal-50 text-royal ring-royal-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
};

const opportunities = [
  {
    icon: Bot,
    title: 'Digital skills and responsible AI literacy',
    description:
      'Practical, non-technical learning on collaboration tools, source verification, privacy and accountable AI use.',
  },
  {
    icon: Globe2,
    title: 'Cross-border virtual exchange',
    description:
      'Facilitated online sessions that connect young people across East Africa for structured, respectful collaboration.',
  },
  {
    icon: Users,
    title: 'Interdisciplinary teamwork',
    description:
      'Work with people from different disciplines and contexts on a shared community question.',
  },
  {
    icon: Compass,
    title: 'Mentorship and guided project development',
    description:
      'Mentors review milestones, ask useful questions and help teams improve without taking over the work.',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessments and constructive feedback',
    description:
      'Transparent rubrics, written feedback and a revision process that treats improvement as part of learning.',
  },
  {
    icon: BadgeCheck,
    title: 'Verifiable achievement certificates',
    description:
      'Recognition linked to completion rules, with a verification code and a public authenticity check.',
  },
];

const steps = [
  { title: 'Register', text: 'Create an account, confirm your email and complete the participation basics.' },
  { title: 'Learn', text: 'Work through short, low-bandwidth modules at your own pace.' },
  { title: 'Exchange', text: 'Join facilitated sessions with peers from other countries and contexts.' },
  { title: 'Collaborate', text: 'Agree on a shared question, roles and a working agreement.' },
  { title: 'Build', text: 'Develop a community project through five documented milestones.' },
  { title: 'Get assessed', text: 'Submit evidence, receive rubric-based feedback and revise where needed.' },
  { title: 'Earn recognition', text: 'Receive a certificate when the configured completion rules are met.' },
];

const aiPrinciples = [
  {
    icon: Eye,
    title: 'Verify before you rely',
    text: 'Generated content is treated as a draft. Names, numbers, dates and quotations are checked against original sources.',
  },
  {
    icon: Scale,
    title: 'Notice bias and representation',
    text: 'Participants examine whose perspectives are missing and avoid using AI to speak for communities.',
  },
  {
    icon: LockKeyhole,
    title: 'Protect personal data',
    text: 'No personal, confidential or sensitive community information is entered into tools the programme does not control.',
  },
  {
    icon: UserCheck,
    title: 'Keep human accountability',
    text: 'People remain responsible for decisions and submissions. “The tool said so” is not an explanation.',
  },
  {
    icon: ShieldCheck,
    title: 'Disclose meaningful assistance',
    text: 'When AI materially contributes to work others rely on, participants state the tool, the task and what was checked.',
  },
];

const reportingPrinciples = [
  {
    icon: FileCheck2,
    title: 'Verified before published',
    text: 'A figure is published only when its source, definition and collection period are documented and reviewed.',
  },
  {
    icon: BarChart3,
    title: 'Aggregate by default',
    text: 'Public reporting uses aggregate indicators. Individual assessment records and private profiles are not exposed.',
  },
  {
    icon: Layers,
    title: 'Samples clearly labelled',
    text: 'Development and demonstration views are marked as illustrative. They are never presented as programme results.',
  },
];

const faqs = [
  {
    question: 'Is YouthRise an accredited qualification?',
    answer:
      'No. YouthRise is a proposed programme and this build is a demonstration. No accreditation, partnership or endorsement is implied. Recognition is designed around transparent completion criteria; any formal accreditation would need separate validation.',
  },
  {
    question: 'Who can take part?',
    answer:
      'The proposed programme is designed for young people aged 18–35, with an initial focus on Uganda, Kenya, Rwanda, Tanzania and the wider East African Community. Eligibility and capacity requirements differ between Level One and Level Two.',
  },
  {
    question: 'How much time does it take?',
    answer:
      'Level One is designed around 3–4 hours per week over 6–8 weeks. Level Two is a 12-week team project with an expected commitment of 5–6 hours per week, including mentor check-ins and local fieldwork.',
  },
  {
    question: 'Is there a fee?',
    answer:
      'No fee is represented in this demonstration. A production programme would publish its fee, scholarship and sponsorship policy before applications opened.',
  },
  {
    question: 'How does certificate verification work?',
    answer:
      'Each certificate is designed to carry a unique code and a public verification page that checks status without exposing private assessment records. This build includes demonstration codes so the flow can be tested end to end.',
  },
];

export function HomePage() {
  useDocumentTitle('Learn together. Build solutions.');

  return (
    <>
      {/* Hero ---------------------------------------------------------- */}
      <section className="surface-dark relative overflow-hidden">
        <div className="absolute inset-0 grid-paper-dark opacity-50" aria-hidden="true" />
        <div className="container-editorial relative grid gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow-light mb-5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
              </span>
              Proposed programme · East Africa · ages 18–35
            </p>
            <h1 className="text-display-xl font-semibold text-white">
              Learn together.
              <br />
              Build solutions.
              <br />
              <span className="text-cyan-200">Create lasting impact.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-8 text-navy-100">
              YouthRise brings together digital learning, facilitated virtual exchange, mentorship and collaborative community
              projects — so young people can turn practical skills into documented, real-world impact.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className={buttonStyles({ variant: 'electric', size: 'lg' })}>
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/programmes"
                className={buttonStyles({
                  variant: 'outline',
                  size: 'lg',
                  className: 'border-white/20 bg-white/5 text-white hover:border-cyan/50 hover:bg-white/10',
                })}
              >
                Explore programmes
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-6 text-xs">
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-[0.1em] text-cyan-200/80">Who it is for</dt>
                <dd className="mt-1 font-medium text-white">Young people aged 18–35</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-[0.1em] text-cyan-200/80">Proposed reach</dt>
                <dd className="mt-1 font-medium text-white">Uganda, Kenya, Rwanda, Tanzania &amp; wider EAC</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-[0.1em] text-cyan-200/80">Participation</dt>
                <dd className="mt-1 font-medium text-white">Level One learning → Level Two projects</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-[0.1em] text-cyan-200/80">Status</dt>
                <dd className="mt-1 font-medium text-white">Proposed programme · demonstration build</dd>
              </div>
            </dl>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Stakeholder strip --------------------------------------------- */}
      <section className="border-y border-line bg-canvas" aria-label="Stakeholder groups">
        <div className="container-editorial flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="shrink-0 text-2xs font-semibold uppercase tracking-[0.12em] text-slate">
            Designed around seven roles
          </p>
          <ul className="flex flex-wrap gap-2">
            {stakeholderGroups.map((group) => (
              <li
                key={group}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-2xs font-medium text-ink"
              >
                <span className="h-1 w-1 rounded-full bg-teal-400" aria-hidden="true" />
                {group}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What YouthRise is --------------------------------------------------- */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="what-heading">
        <div className="container-editorial">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <Reveal>
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
                What YouthRise is
              </p>
              <h2 id="what-heading" className="text-display-md font-semibold text-ink">
                A connected pathway from learning to community impact.
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="max-w-xl text-[0.9875rem] leading-7 text-slate lg:justify-self-end">
                Many young people have ambition, ideas and local knowledge, but limited access to structured digital
                learning, professional networks and a credible way to document what they can do. YouthRise is designed to close
                that gap through one coherent journey: learn, exchange, build and be recognised.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={index * 90} className="h-full">
                  <article className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-canvas/60 p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-royal shadow-xs ring-1 ring-line">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-[2rem] font-semibold leading-none tracking-tight text-line">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-card font-semibold text-ink">{pillar.title}</h3>
                    <p className="mt-2 text-[0.8125rem] leading-6 text-slate">{pillar.description}</p>
                    <Link
                      to={pillar.to}
                      className="mt-5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-royal transition group-hover:gap-2"
                    >
                      {pillar.linkLabel}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works -------------------------------------------------- */}
      <section className="surface-dark py-16 lg:py-24" aria-labelledby="how-heading">
        <div className="container-editorial relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <p className="eyebrow-light mb-3">
                <span className="h-px w-6 bg-cyan-300" aria-hidden="true" />
                How YouthRise works
              </p>
              <h2 id="how-heading" className="max-w-2xl text-display-md font-semibold text-white">
                Four stages. One supported journey.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 transition hover:text-white"
              >
                See eligibility and completion rules
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="h-full">
                  <Reveal delay={index * 80} className="h-full">
                    <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10 text-cyan-300 ring-1 ring-cyan/20">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="font-mono text-2xs font-semibold tracking-[0.18em] text-cyan-200/60">
                          0{index + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[0.9375rem] font-semibold text-white">{step.title}</h3>
                      <p className="mt-1.5 text-[0.8125rem] leading-6 text-navy-100">{step.text}</p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 flex items-center gap-2 text-2xs text-navy-200">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
            Progression is subject to eligibility, capacity and completion criteria — not automatic.
          </p>
        </div>
      </section>

      {/* Featured programmes ------------------------------------------ */}
      <section className="bg-canvas py-16 lg:py-24" aria-labelledby="programmes-heading">
        <div className="container-editorial">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
                Featured learning
              </p>
              <h2 id="programmes-heading" className="max-w-2xl text-display-md font-semibold text-ink">
                Programmes designed around what people can do.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <Link
                to="/programmes"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
              >
                View all programmes
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featuredProgrammes.map((programme, index) => {
              const Icon = programme.icon;
              return (
                <Reveal key={programme.id} delay={index * 90} className="h-full">
                  <Link
                    to={`/programmes/${programme.id}`}
                    className="card-lift group flex h-full flex-col rounded-2xl border border-line bg-white p-6 hover:border-cyan-200"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-slate">
                        {programme.level}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-slate">
                        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                        {programme.duration}
                      </span>
                    </div>
                    <span
                      className={`mt-6 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${toneStyles[programme.tone]}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-card font-semibold leading-6 text-ink">{programme.title}</h3>
                    <p className="mt-2 text-[0.8125rem] leading-6 text-slate">{programme.summary}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-2xs">
                      <span className="text-slate">{programme.mode}</span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-royal transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-4 text-2xs leading-5 text-slate">
            Programme outlines, dates and participation figures shown in the demonstration workspace are illustrative.
            They are not confirmed offers or verified enrolment data.
          </p>
        </div>
      </section>

      {/* Two connected levels ----------------------------------------- */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="programme-model-heading">
        <div className="container-editorial">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
                The programme model
              </p>
              <h2 id="programme-model-heading" className="text-display-md font-semibold text-ink">
                One platform.
                <br />
                Two connected levels.
              </h2>
              <p className="mt-4 max-w-md text-[0.9875rem] leading-7 text-slate">
                Learning leads to exchange, exchange leads to collaboration, and collaboration leads to a documented
                community project. Progression is subject to eligibility and completion criteria — not automatic.
              </p>
              <Link
                to="/how-it-works"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
              >
                See eligibility and completion rules
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Reveal>

            <div className="space-y-5">
              <Reveal delay={60}>
                <article className="relative overflow-hidden rounded-2xl border border-line bg-canvas/60 p-6 sm:p-7">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-royal/70" aria-hidden="true" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-royal-100 bg-royal-50 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-royal">
                      Level One
                    </span>
                    <span className="text-2xs text-slate">6–8 weeks · foundational</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
                    Digital learning and virtual exchange
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate">
                    Short, practical modules build digital confidence and responsible AI literacy. Facilitated exchange
                    sessions then connect participants across borders to practise collaboration on a shared question.
                  </p>
                  <ul className="mt-5 grid gap-2 text-[0.8125rem] text-ink sm:grid-cols-2">
                    {['Self-paced modules', 'Live facilitated sessions', 'Knowledge checks & reflection', 'Completion record'].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                  <Link
                    to="/virtual-exchange"
                    className="mt-5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-royal hover:underline"
                  >
                    Explore Level One
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>

              <Reveal delay={120}>
                <article className="relative overflow-hidden rounded-2xl border border-line bg-canvas/60 p-6 sm:p-7">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-teal/70" aria-hidden="true" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-teal-700">
                      Level Two
                    </span>
                    <span className="text-2xs text-slate">10–12 weeks · team-based</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
                    Team-based community impact projects
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate">
                    Interdisciplinary teams work with a mentor through five milestones: problem framing, stakeholder
                    evidence, a prototype, an evidence pack and a final showcase. Team placement includes a human review.
                  </p>
                  <ul className="mt-5 grid gap-2 text-[0.8125rem] text-ink sm:grid-cols-2">
                    {['Human-reviewed team placement', 'Assigned mentor', 'Five documented milestones', 'Assessed showcase'].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                  <Link
                    to="/impact-projects"
                    className="mt-5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-royal hover:underline"
                  >
                    Explore Level Two
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities ------------------------------------------------- */}
      <section className="border-y border-line bg-canvas py-16 lg:py-24" aria-labelledby="opportunities-heading">
        <div className="container-editorial">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <Reveal>
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
                What participants gain
              </p>
              <h2 id="opportunities-heading" className="text-display-md font-semibold text-ink">
                Practical capability, not just completion.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="max-w-xl text-[0.9875rem] leading-7 text-slate lg:justify-self-end">
                Each part of YouthRise is designed to produce something a participant can use, explain or show: a verified
                source, a working agreement, a project decision, a piece of evidence, a completed assessment.
              </p>
            </Reveal>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity, index) => {
              const Icon = opportunity.icon;
              return (
                <li key={opportunity.title} className="h-full">
                  <Reveal delay={index * 60} className="h-full">
                    <article className="card-lift flex h-full gap-4 rounded-2xl border border-line bg-white p-5">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-teal-700">
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-[0.9375rem] font-semibold leading-6 text-ink">{opportunity.title}</h3>
                        <p className="mt-1 text-[0.8125rem] leading-6 text-slate">{opportunity.description}</p>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Mentorship ---------------------------------------------------- */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="mentorship-heading">
        <div className="container-editorial grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">
              <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
              Mentorship
            </p>
            <h2 id="mentorship-heading" className="text-display-md font-semibold text-ink">
              A mentor asks better questions — and documents the answer.
            </h2>
            <p className="mt-4 max-w-lg text-[0.9875rem] leading-7 text-slate">
              Mentors are assigned to teams, not to individual administrative control. They review milestone evidence,
              comment against the rubric, request specific revisions and record whether previous feedback was addressed.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Structured review against published criteria',
                'Written feedback that names a next action',
                'A visible revision history, not an opaque rejection',
                'Scheduled check-ins with a record of what changed',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-[0.8125rem] leading-6 text-ink">
                  <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/mentorship"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
            >
              How mentorship works
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-line bg-canvas/60 px-5 py-3.5">
                  <div>
                    <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Milestone review · demo</p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">Stakeholder evidence</p>
                  </div>
                  <span className="rounded-full border border-warning-100 bg-warning-50 px-2.5 py-0.5 text-2xs font-semibold text-warning">
                    Under review
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  <div className="rounded-xl border border-line bg-canvas/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-ink">Evidence summary</p>
                      <span className="text-2xs text-slate">6 conversations</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {[
                        ['Consent recorded', '8 / 8'],
                        ['Names removed', '6 / 6'],
                        ['Limitations stated', '1 note'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-2xs">
                          <span className="text-slate">{label}</span>
                          <span className="font-semibold text-ink">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                        GM
                      </span>
                      <div>
                        <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-teal-700">Mentor comment</p>
                        <p className="text-2xs text-slate">Grace Mwangi · mentor · 27 Oct 2026</p>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[0.8125rem] leading-6 text-ink">
                      “Add one sentence on what you could not verify. That will make the evidence pack stronger.”
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                    <span className="text-2xs text-slate">Next action: revise note and resubmit</span>
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold text-royal">
                      View history
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-2xs text-slate">Illustrative interface with fictional demonstration data.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Responsible AI ------------------------------------------------ */}
      <section className="surface-dark py-16 lg:py-24" aria-labelledby="ai-heading">
        <div className="container-editorial relative grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow-light mb-3">
              <span className="h-px w-6 bg-cyan-300" aria-hidden="true" />
              Digital skills &amp; responsible AI
            </p>
            <h2 id="ai-heading" className="text-display-md font-semibold text-white">
              AI literacy is a participation skill.
            </h2>
            <p className="mt-4 max-w-md text-[0.9875rem] leading-7 text-navy-100">
              YouthRise treats AI as a tool to be understood, questioned and disclosed — not an authority. These principles
              shape learning content, project evidence and platform behaviour.
            </p>
            <Link
              to="/responsible-ai"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 transition hover:text-white"
            >
              Read the responsible AI and safety approach
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {aiPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              const isWide = index === aiPrinciples.length - 1;
              return (
                <Reveal
                  key={principle.title}
                  delay={index * 60}
                  className={cn('h-full', isWide && 'sm:col-span-2')}
                >
                  <article
                    className={cn(
                      'flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5',
                      isWide && 'sm:flex-row sm:items-start sm:gap-4',
                    )}
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h3
                        className={cn(
                          'mt-3.5 text-[0.9375rem] font-semibold text-white',
                          isWide && 'sm:mt-0',
                        )}
                      >
                        {principle.title}
                      </h3>
                      <p className="mt-1 text-[0.8125rem] leading-6 text-navy-100">{principle.text}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Participant journey ------------------------------------------ */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="journey-heading">
        <div className="container-editorial">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
                The participant journey
              </p>
              <h2 id="journey-heading" className="max-w-2xl text-display-md font-semibold text-ink">
                Seven steps from interest to recognition.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
              >
                Full journey details
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <ol className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="h-full">
                <Reveal delay={index * 50} className="h-full">
                  <div className="relative h-full border-t border-line pt-5">
                    <span className="absolute -top-3 left-0 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-line bg-white px-1.5 text-2xs font-semibold text-royal">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{step.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
            <li>
              <Reveal delay={350}>
                <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                  <Sparkles className="h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <p className="text-xs leading-5 text-ink">
                    Each step has a clear status and next action in the participant workspace.
                  </p>
                </div>
              </Reveal>
            </li>
          </ol>
        </div>
      </section>

      {/* Community showcases ------------------------------------------ */}
      <section className="border-y border-line bg-canvas py-16 lg:py-24" aria-labelledby="projects-heading">
        <div className="container-editorial">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <Reveal>
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
                Community project showcases
              </p>
              <h2 id="projects-heading" className="text-display-md font-semibold text-ink">
                Projects grounded in real community questions.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="max-w-lg text-sm leading-7 text-slate lg:justify-self-end">
                Teams choose a question that matters in their context, gather proportionate evidence and test a practical
                response. The examples below demonstrate the workspace and are not real projects.
              </p>
            </Reveal>
          </div>
          <div className="mt-9">
            <ProjectShowcase />
          </div>
        </div>
      </section>

      {/* Reporting and trust ------------------------------------------ */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="reporting-heading">
        <div className="container-editorial">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <Reveal>
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
                Impact and reporting
              </p>
              <h2 id="reporting-heading" className="text-display-md font-semibold text-ink">
                A place for verified outcomes — when they exist.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="max-w-lg text-sm leading-7 text-slate lg:justify-self-end">
                This demonstration does not present fabricated impact figures. The reporting area is designed around
                verification, aggregation and explicit labelling of sample data.
              </p>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {reportingPrinciples.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Reveal key={principle.title} delay={index * 70} className="h-full">
                  <div className="card-lift h-full rounded-2xl border border-line bg-canvas/50 p-5">
                    <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                    <h3 className="mt-3 text-[0.9375rem] font-semibold text-ink">{principle.title}</h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{principle.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-line bg-canvas/50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Illustrative reporting view</p>
                  <h3 className="mt-1 text-base font-semibold text-ink">What verified reporting will require</h3>
                </div>
                <span className="rounded-full border border-warning-100 bg-warning-50 px-2.5 py-0.5 text-2xs font-semibold text-warning">
                  Sample only
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ['Enrolled', '—'],
                  ['Completing', '—'],
                  ['Projects', '—'],
                  ['Certificates', '—'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-line bg-white p-3">
                    <dd className="text-xl font-semibold text-slate-300">{value}</dd>
                    <dt className="mt-1 text-2xs text-slate">{label}</dt>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-2xs leading-5 text-slate">
                Figures are deliberately withheld until a verified data source is available. This avoids presenting
                invented impact as fact.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-canvas/50 p-5 sm:p-6">
              <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Participant stories</p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    quote: 'I want to use data to make decisions that actually help my community, not just produce another report.',
                    name: 'Illustrative profile A',
                    role: 'Participant · Uganda · fictional',
                  },
                  {
                    quote: 'The exchange made me realise how much I assume about other people’s working context.',
                    name: 'Illustrative profile B',
                    role: 'Participant · Kenya · fictional',
                  },
                ].map((story) => (
                  <figure key={story.name} className="border-l-2 border-teal-100 pl-3.5">
                    <Quote className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
                    <blockquote className="mt-1 text-[0.8125rem] leading-6 text-ink">{story.quote}</blockquote>
                    <figcaption className="mt-1 text-2xs text-slate">
                      <span className="font-semibold text-ink">{story.name}</span> · {story.role}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-4 text-2xs leading-5 text-slate">
                Fictional demonstration content. Not a testimonial or verified participant outcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner opportunities ---------------------------------------- */}
      <section className="border-y border-line bg-canvas py-16 lg:py-20" aria-labelledby="audiences-heading">
        <div className="container-editorial">
          <div className="grid gap-8 rounded-3xl border border-line bg-white p-6 shadow-xs sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="eyebrow mb-3">For institutions and partners</p>
              <h2 id="audiences-heading" className="text-2xl font-semibold tracking-tight text-ink">
                Designed for scrutiny, not just demonstration.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate">
                Universities, employers and partner organizations receive separate, permission-scoped workspaces.
                Nominations are not acceptance. Talent profiles are participant-controlled. Aggregate reporting never
                exposes private assessment records.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
              >
                Discuss a collaboration
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: GraduationCap, title: 'Universities', text: 'Nominate learners and view aggregate cohort outcomes.' },
                { icon: HeartHandshake, title: 'Employers', text: 'Discover consented public portfolios and verified certificates.' },
                { icon: Users, title: 'Partner organizations', text: 'Follow supported programmes and approved showcases.' },
                { icon: ShieldCheck, title: 'Administration', text: 'Govern access, safety, privacy and audit trails.' },
              ].map((audience, index) => {
                const Icon = audience.icon;
                return (
                  <Reveal key={audience.title} delay={index * 60} className="h-full">
                    <div className="h-full rounded-xl border border-line bg-canvas/50 p-4">
                      <Icon className="h-4 w-4 text-teal" aria-hidden="true" />
                      <p className="mt-2 text-[0.8125rem] font-semibold text-ink">{audience.title}</p>
                      <p className="mt-1 text-2xs leading-5 text-slate">{audience.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-2xs text-slate">
            All named institutions, organizations and individuals in this demonstration are fictional or clearly marked
            as examples. No partnership or endorsement is implied.
          </p>
        </div>
      </section>

      {/* FAQ ----------------------------------------------------------- */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="faq-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-3">
              <span className="h-px w-6 bg-teal-400" aria-hidden="true" />
              Questions
            </p>
            <h2 id="faq-heading" className="text-display-md font-semibold text-ink">
              What to know before you join.
            </h2>
            <p className="mt-4 max-w-sm text-[0.9875rem] leading-7 text-slate">
              These answers describe the proposed programme and the limits of this demonstration build.
            </p>
            <Link
              to="/faq"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
            >
              Read all frequently asked questions
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <div className="divide-y divide-line border-y border-line">
              {faqs.map((faq) => (
                <details key={faq.question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[0.9375rem] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-slate transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="pb-4 pr-8 text-[0.8125rem] leading-6 text-slate">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <PublicCTA />
    </>
  );
}
