import { ArrowUpRight, BarChart3, CheckCircle2, FileCheck2, Layers, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoNote, PageHero, PublicCTA } from '@/components/public/PageHero';
import { Badge, Card, CardBody, CardHeader } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const stories = [
  {
    theme: 'Climate action',
    title: 'Solar-aware school energy tracker',
    team: 'Kampala Green Grid · fictional team',
    problem: 'Two schools could not tell whether their solar installation was meeting daytime demand.',
    approach: 'A five-minute daily recording routine and a one-page weekly summary tested with school staff.',
    status: 'In progress in the demonstration workspace',
    learning: 'The team found that the recording routine had to fit an existing staff handover, not create a new one.',
  },
  {
    theme: 'Health',
    title: 'Community water point reporting',
    team: 'Maji Data Collective · fictional team',
    problem: 'Residents reported broken water points through several informal channels, making repairs hard to track.',
    approach: 'A reporting routine and a public status board designed to avoid household-level data.',
    status: 'Prototype stage in the demonstration workspace',
    learning: 'The committee needed a simple way to keep the board current after the pilot ended.',
  },
  {
    theme: 'Employment',
    title: 'Digital skills bridge for market traders',
    team: 'Skills Bridge · fictional team',
    problem: 'Generic digital training did not match the tools traders used for pricing, payments and stock.',
    approach: 'A trader-led curriculum starting from real market tasks and measuring confidence, not attendance alone.',
    status: 'Revision requested in the demonstration workspace',
    learning: 'The first scope was too broad; the team narrowed it to two digital tasks with direct evidence.',
  },
];

export function ImpactPage() {
  useDocumentTitle('Impact and stories');
  return (
    <>
      <PageHero
        eyebrow="Impact and reporting"
        title="Credible reporting starts with what you refuse to claim."
        description="This demonstration does not present invented impact figures. It shows the reporting structure, verification requirements and the kind of project story YouthRise intends to document."
        breadcrumbs={[{ label: 'Impact & stories' }]}
        aside={
          <div className="rounded-lg border border-warning-100 bg-warning-50 p-4 text-xs leading-5 text-warning">
            <p className="font-semibold uppercase tracking-[0.08em]">Demonstration data</p>
            <p className="mt-1.5">
              No verified impact statistics, participant testimonials or partner endorsements are displayed in this
              build.
            </p>
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Reporting commitment</p>
            <h2 className="text-display-md font-semibold text-ink">What will be measured — and how.</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate">
              A platform that records learning and projects has a responsibility to report honestly. The reporting model
              separates participation, completion, assessment and post-programme outcomes, and labels each source.
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                icon: FileCheck2,
                title: 'Source before statistic',
                text: 'Every published indicator will name its source, definition, collection period and responsible owner.',
              },
              {
                icon: Layers,
                title: 'Aggregate before individual',
                text: 'Public reporting uses cohort-level aggregates. Individual assessment records and private profiles stay inside authorised workspaces.',
              },
              {
                icon: LockKeyhole,
                title: 'Consent before story',
                text: 'Participant stories require specific consent for the quoted text, name or anonymisation and the channels where it will appear.',
              },
              {
                icon: ShieldCheck,
                title: 'Correction is part of the process',
                text: 'Published figures will carry a correction route and a version note when a definition or number changes.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 rounded-lg border border-line p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                  <div>
                    <h3 className="text-[0.9375rem] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-[0.8125rem] leading-6 text-slate">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-12 lg:py-16" aria-labelledby="sample-heading">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Sample reporting view</p>
              <h2 id="sample-heading" className="text-2xl font-semibold tracking-tight text-ink">
                Indicators awaiting a verified source
              </h2>
            </div>
            <Badge variant="warning">Illustrative structure</Badge>
          </div>
          <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
            <table className="data-table">
              <caption className="sr-only">Reporting indicators and their verification status in this demonstration</caption>
              <thead>
                <tr>
                  <th scope="col">Indicator</th>
                  <th scope="col">Definition</th>
                  <th scope="col">Source required</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Enrolment', 'Eligible participants with a confirmed enrolment', 'Registration and eligibility record', 'Awaiting verified data'],
                  ['Module completion', 'Participants completing all required modules', 'Learning record with completion rules', 'Awaiting verified data'],
                  ['Session attendance', 'Registered participants attending at least five sessions', 'Attendance record and make-up activity', 'Awaiting verified data'],
                  ['Project completion', 'Teams with all five milestones approved', 'Assessment and approval record', 'Awaiting verified data'],
                  ['Certificate issuance', 'Certificates issued under configured completion rules', 'Certificate registry and approval log', 'Awaiting verified data'],
                ].map((row) => (
                  <tr key={row[0]}>
                    <td className="font-medium">{row[0]}</td>
                    <td className="text-slate">{row[1]}</td>
                    <td className="text-slate">{row[2]}</td>
                    <td>
                      <span className="text-2xs font-semibold text-warning">{row[3]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-2xs text-slate">
            No numerical values are shown because no verified data source exists in this demonstration. Empty values are
            preferable to fabricated figures.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16" aria-labelledby="stories-heading">
        <div className="container-editorial">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Example project stories</p>
            <h2 id="stories-heading" className="text-display-md font-semibold text-ink">
              The shape of a project story.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate">
              These fictional examples show the fields YouthRise would use to document a project: the problem, the approach,
              the current status and the learning. They are not impact claims.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {stories.map((story) => (
              <article key={story.title} className="rounded-lg border border-line bg-white">
                <div className="border-b border-line p-5">
                  <Badge variant="warning">Fictional example</Badge>
                  <p className="mt-2 text-2xs font-semibold uppercase tracking-[0.08em] text-teal-700">{story.theme}</p>
                  <h3 className="mt-1.5 text-[1.0625rem] font-semibold leading-6 text-ink">{story.title}</h3>
                  <p className="mt-1 text-2xs text-slate">{story.team}</p>
                </div>
                <dl className="space-y-3 p-5 text-[0.8125rem] leading-6">
                  {[
                    ['Problem', story.problem],
                    ['Approach', story.approach],
                    ['Status', story.status],
                    ['Learning', story.learning],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{label}</dt>
                      <dd className="mt-0.5 text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-12 lg:py-16" aria-labelledby="verification-heading">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow mb-3">Certificate verification</p>
            <h2 id="verification-heading" className="text-display-md font-semibold text-ink">
              A certificate should be checkable in under a minute.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate">
              Each issued certificate is intended to carry a unique verification code. The public verification page
              returns the certificate status, programme, issue date and holder name as configured. Revoked certificates
              show a clear revocation state.
            </p>
            <div className="mt-5 space-y-2.5">
              {[
                'No account required to verify a code.',
                'No personal profile or assessment record exposed.',
                'A pending certificate is distinguishable from a valid one.',
                'A revoked certificate explains the state without implying misconduct.',
              ].map((item) => (
                <p key={item} className="flex gap-2 text-[0.8125rem] leading-6 text-ink">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  {item}
                </p>
              ))}
            </div>
            <Link
              to="/verify"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
            >
              Try the verification page
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <Card>
            <CardHeader
              title="Demonstration registry"
              description="Sample codes available in this build"
              action={<Badge variant="warning">Demo</Badge>}
            />
            <CardBody className="space-y-3 text-xs">
              {[
                ['YEP-DEMO-4K7Q-2026', 'Valid · issued certificate'],
                ['YEP-DEMO-PEND-2026', 'Pending · completion rules not met'],
                ['YEP-DEMO-REVK-2026', 'Revoked · demonstration state'],
              ].map(([code, state]) => (
                <div key={code} className="flex items-center justify-between gap-3 rounded border border-line px-3 py-2">
                  <code className="font-mono text-[0.6875rem] text-ink">{code}</code>
                  <span className="text-2xs text-slate">{state}</span>
                </div>
              ))}
              <p className="pt-1 text-2xs leading-5 text-slate">
                These codes exist only inside the demonstration environment. They do not verify any real person or
                institution.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-editorial grid gap-6 sm:grid-cols-3">
          {[
            { icon: BarChart3, title: 'Cohort reporting', text: 'Aggregate participation, completion and assessment indicators for authorised staff.' },
            { icon: Layers, title: 'Partner reporting', text: 'Privacy-preserving summaries for approved partner organizations; no private assessment records.' },
            { icon: FileCheck2, title: 'Public reporting', text: 'A future verified impact page, with sources, definitions, dates and corrections.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="border-t border-line pt-4">
                <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                <h3 className="mt-2 text-[0.9375rem] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-[0.8125rem] leading-6 text-slate">{item.text}</p>
              </div>
            );
          })}
        </div>
        <div className="container-editorial mt-8">
          <DemoNote>
            The project stories, team names and certificate codes on this page are fictional demonstration content.
            Future verified reporting will be published separately and labelled with its source.
          </DemoNote>
        </div>
      </section>

      <PublicCTA
        title="Build evidence, not just outputs."
        description="Explore the project workspace and assessment workflow, or read how YouthRise approaches responsible AI and digital safety."
        primaryLabel="Join YouthRise"
        secondaryLabel="Responsible AI & safety"
        secondaryTo="/responsible-ai"
      />
    </>
  );
}
