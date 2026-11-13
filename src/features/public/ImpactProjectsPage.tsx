import { ArrowUpRight, BadgeCheck, FileCheck2, Flag, Layers, MessageSquare, ShieldCheck, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoNote, PageHero, PublicCTA } from '@/components/public/PageHero';
import { ProjectShowcase } from '@/components/public/ProjectShowcase';
import { Badge, StatusBadge } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const milestones = [
  {
    number: '01',
    title: 'Problem framing and scope',
    text: 'Name the community problem, the group affected and the decision the project will inform. Define what is in and out of scope.',
    evidence: 'A short problem statement and stakeholder map with personal details removed.',
    status: 'approved',
  },
  {
    number: '02',
    title: 'Stakeholder evidence',
    text: 'Gather proportionate, consented evidence from people affected by the problem. Distinguish what you observed from what you assume.',
    evidence: 'An anonymised summary of conversations, consent records and stated limitations.',
    status: 'under_review',
  },
  {
    number: '03',
    title: 'Prototype v1',
    text: 'Test a practical response with at least one stakeholder group. Record what changed and what did not work.',
    evidence: 'A prototype description, test notes and a short reflection on feasibility.',
    status: 'in_progress',
  },
  {
    number: '04',
    title: 'Evidence pack',
    text: 'Compile results, limitations and consent records in a form another person could review and understand.',
    evidence: 'A structured evidence pack with an honest account of what could not be verified.',
    status: 'not_started',
  },
  {
    number: '05',
    title: 'Final showcase',
    text: 'Present the project story, evidence and learning to peers, mentors and partners in a five-minute format.',
    evidence: 'Showcase materials and a short team reflection on what they would do differently.',
    status: 'not_started',
  },
];

const themes = [
  { title: 'Agriculture', question: 'How might smallholder farmers access timely, low-cost crop advice?' },
  { title: 'Education', question: 'How can learners with limited connectivity access quality learning materials?' },
  { title: 'Health', question: 'How can a community committee track water point repairs without exposing household data?' },
  { title: 'Climate action', question: 'How can a school understand and reduce its daytime energy use?' },
  { title: 'Employment', question: 'What digital skills do market traders actually need for their daily work?' },
  { title: 'Digital inclusion', question: 'How can public service information be made accessible in plain language?' },
];

const formation = [
  { title: 'Eligibility review', text: 'Facilitators check programme completion, availability and any declared support needs against published criteria.' },
  { title: 'Skills and interest mapping', text: 'Participant-declared skills and interests are reviewed alongside team diversity preferences. No automated rejection is used.' },
  { title: 'Proposed composition', text: 'The system may suggest a composition, but it shows its reasoning and warnings. A facilitator inspects and can adjust it.' },
  { title: 'Human approval and appeal', text: 'A facilitator documents the decision and any override. Participants can review the placement and submit an appeal.' },
];

export function ImpactProjectsPage() {
  useDocumentTitle('Level Two impact projects');

  return (
    <>
      <PageHero
        eyebrow="Level Two · Community impact"
        title="A project is an argument supported by evidence."
        description="Interdisciplinary teams work with a mentor through five documented milestones, from problem framing to a final showcase. Team placement includes a transparent human review."
        breadcrumbs={[{ label: 'Impact projects' }]}
        aside={
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line text-center shadow-xs">
            {[
              ['05', 'milestones'],
              ['12', 'weeks'],
              ['1', 'assigned mentor'],
            ].map(([value, label]) => (
              <div key={label} className="bg-white px-3 py-4">
                <p className="text-xl font-semibold text-navy">{value}</p>
                <p className="mt-0.5 text-2xs text-slate">{label}</p>
              </div>
            ))}
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial">
          <DemoNote className="mb-8">
            All projects, teams and milestone states shown are fictional demonstrations. No community outcome, partner
            endorsement or verified impact is claimed.
          </DemoNote>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow mb-3">The milestone framework</p>
              <h2 className="text-display-md font-semibold text-ink">Five stages. No skipped evidence.</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate">
                Each milestone describes a change in the work, not just a task completed. A mentor reviews the evidence
                against a published rubric and either approves it or requests a specific revision.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {['Draft', 'Submitted', 'Under review', 'Revision required', 'Approved'].map((status) => (
                  <StatusBadge key={status} status={status.toLowerCase().replace(' ', '_')} label={status} />
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-line bg-canvas p-4">
                <p className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink">
                  <Flag className="h-4 w-4 text-teal" aria-hidden="true" />
                  What a revision request means
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate">
                  A revision request names what needs to change and why. It is a normal part of the process. Participants
                  can respond with a revised submission and see the full review history.
                </p>
              </div>
            </div>

            <ol className="border-y border-line">
              {milestones.map((milestone) => (
                <li key={milestone.number} className="grid gap-3 border-b border-line py-5 last:border-0 sm:grid-cols-[3.5rem_1fr] sm:gap-5">
                  <span className="text-lg font-semibold tracking-tight text-navy-100">{milestone.number}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[0.9375rem] font-semibold text-ink">{milestone.title}</h3>
                      <StatusBadge status={milestone.status} />
                    </div>
                    <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{milestone.text}</p>
                    <p className="mt-2 flex gap-1.5 text-2xs leading-5 text-teal-700">
                      <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        <span className="font-semibold">Evidence: </span>
                        {milestone.evidence}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-navy py-12 text-white lg:py-16" aria-labelledby="formation-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow-light mb-3">Team formation</p>
            <h2 id="formation-heading" className="text-display-md font-semibold text-white">
              Suggested by software. Approved by a person.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-navy-100">
              Team composition affects who gets to contribute. YouthRise does not use an opaque algorithm to reject
              participants. Facilitators review programme criteria, declared skills, interests and diversity preferences,
              then document their decision.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-md border border-teal-100/30 bg-white/5 p-3.5 text-xs text-navy-100">
              <ShieldCheck className="h-4 w-4 shrink-0 text-teal-100" aria-hidden="true" />
              Conflict warnings and overrides are visible to authorised staff and recorded in the audit trail.
            </div>
          </div>
          <ol className="space-y-0">
            {formation.map((step, index) => (
              <li key={step.title} className="grid gap-3 border-t border-white/15 py-4 last:border-b sm:grid-cols-[2rem_1fr] sm:gap-4">
                <span className="text-2xs font-semibold text-teal-100">0{index + 1}</span>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-[0.8125rem] leading-6 text-navy-100">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16" aria-labelledby="themes-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Project themes</p>
            <h2 id="themes-heading" className="text-display-md font-semibold text-ink">
              Start from a question, not a solution.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate">
              Teams can propose a question within a supported theme. The examples below are illustrative prompts, not
              assigned project briefs.
            </p>
          </div>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme, index) => (
              <li key={theme.title} className="bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xs font-semibold uppercase tracking-[0.1em] text-teal-700">{theme.title}</span>
                  <span className="text-2xs text-slate-300">0{index + 1}</span>
                </div>
                <p className="mt-3 text-[0.875rem] leading-6 text-ink">{theme.question}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-12 lg:py-16" aria-labelledby="workspace-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow mb-3">Inside the workspace</p>
            <h2 id="workspace-heading" className="text-display-md font-semibold text-ink">
              One place for the project, the evidence and the feedback.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate">
              The project workspace keeps the problem statement, objectives, milestones, files and review status
              together. Participants can see what has been submitted, what is under review and what needs revision.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Target, text: 'Problem statement and objectives' },
                { icon: Layers, text: 'Milestones, deadlines and progress' },
                { icon: FileCheck2, text: 'Evidence submission and history' },
                { icon: MessageSquare, text: 'Mentor comments and revision requests' },
                { icon: Users, text: 'Team members and assigned mentor' },
                { icon: BadgeCheck, text: 'Review status and approval record' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text} className="flex items-center gap-2.5 rounded-md border border-line bg-white px-3.5 py-2.5 text-[0.8125rem] text-ink">
                    <Icon className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    {item.text}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-line bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Example workspace</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">Solar-aware school energy tracker</p>
              </div>
              <Badge variant="warning">Fictional</Badge>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-semibold text-ink">Milestone 2 · Stakeholder evidence</span>
                <StatusBadge status="under_review" />
              </div>
              <div className="mt-4 space-y-2">
                {[
                  ['Problem framing', 'approved'],
                  ['Stakeholder evidence', 'under_review'],
                  ['Prototype v1', 'in_progress'],
                  ['Evidence pack', 'not_started'],
                  ['Final showcase', 'not_started'],
                ].map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded border border-line px-3 py-2">
                    <span className="text-2xs text-ink">{label}</span>
                    <StatusBadge status={status} />
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-teal-100 bg-teal-50/60 p-3">
                <p className="text-2xs font-semibold text-teal-700">Mentor comment</p>
                <p className="mt-1 text-2xs leading-5 text-ink">
                  “Add one sentence on what you could not verify. That will make the evidence pack stronger.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16" aria-labelledby="examples-heading">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Example projects</p>
              <h2 id="examples-heading" className="text-2xl font-semibold tracking-tight text-ink">
                Demonstration project themes
              </h2>
            </div>
            <Link to="/impact" className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-royal hover:underline">
              Reporting approach
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6">
            <ProjectShowcase />
          </div>
        </div>
      </section>

      <PublicCTA
        title="Build something that can be examined."
        description="Create a demonstration account to explore the project workspace, milestone review states, evidence submission and mentor feedback."
        primaryLabel="Join YouthRise"
        secondaryLabel="Read about mentorship"
        secondaryTo="/mentorship"
      />
    </>
  );
}
