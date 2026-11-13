import { ArrowRight, CircleHelp, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero, PublicCTA } from '@/components/public/PageHero';
import { Accordion, Badge, Button, EmptyState, Input } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';

const categories = ['All', 'Eligibility', 'Learning', 'Projects', 'Assessment', 'Data & safety', 'Platform'] as const;

const faqs = [
  {
    id: 'q-1',
    category: 'Eligibility',
    question: 'Who can join YouthRise?',
    answer:
      'The proposed programme is for young people aged 18–35 living in Uganda, Kenya, Rwanda, Tanzania or another East African Community country. Individual programmes may add requirements such as prior learning or availability. Capacity is limited, and meeting the baseline criteria does not guarantee a place.',
  },
  {
    id: 'q-2',
    category: 'Eligibility',
    question: 'Does a university nomination guarantee a place?',
    answer:
      'No. A nomination from a university or training partner is an introduction, not an acceptance. A nominated learner must still register, confirm their eligibility and complete any programme-specific steps. The institution dashboard clearly separates nomination from registration and acceptance.',
  },
  {
    id: 'q-3',
    category: 'Eligibility',
    question: 'Can I choose to be a facilitator, mentor or administrator when I register?',
    answer:
      'No. Public registration creates a participant account only. Facilitator, mentor, university representative, employer, partner representative and administrator roles are granted through an authorised approval or invitation workflow. This prevents privilege escalation through a registration form.',
  },
  {
    id: 'q-4',
    category: 'Learning',
    question: 'How much time does Level One take?',
    answer:
      'The proposed Level One programmes require roughly three to four hours per week across six to eight weeks, including short asynchronous lessons and at least one live exchange session. Lessons are designed to be completed in 10–20 minute blocks and save your place.',
  },
  {
    id: 'q-5',
    category: 'Learning',
    question: 'What if my internet connection is unreliable?',
    answer:
      'Learning is text-first and materials are downloadable where the programme permits. Live sessions can be joined by audio or text chat, and summaries or transcripts are added afterwards where consent allows. A participant should not need to stream large video files to complete the core learning.',
  },
  {
    id: 'q-6',
    category: 'Learning',
    question: 'Are live sessions recorded?',
    answer:
      'Recording depends on the programme and the consent of participants. Where a session is recorded, the purpose, storage period and access are explained in advance. Participants can ask a question without being recorded, and recordings are not published publicly.',
  },
  {
    id: 'q-7',
    category: 'Projects',
    question: 'How are Level Two teams formed?',
    answer:
      'Facilitators review eligibility, declared skills, interests, availability and team diversity preferences. Software may suggest a composition, but a facilitator inspects the proposal, sees conflict warnings, can make adjustments and documents any override. Participants can review their placement and submit an appeal. There is no opaque automated rejection.',
  },
  {
    id: 'q-8',
    category: 'Projects',
    question: 'Can I choose my own team or project?',
    answer:
      'The proposed model assigns teams through a reviewed process so that projects are interdisciplinary and not limited to existing networks. Participants can state preferences and propose a project question within a supported theme. The facilitator considers these alongside programme criteria.',
  },
  {
    id: 'q-9',
    category: 'Projects',
    question: 'What evidence does a project need?',
    answer:
      'Each milestone has a defined evidence expectation, such as a problem statement, an anonymised stakeholder summary, prototype notes or a final evidence pack. Evidence should be relevant, proportionate and consented. Personal data should be removed unless it is necessary and authorised.',
  },
  {
    id: 'q-10',
    category: 'Assessment',
    question: 'How is my work assessed?',
    answer:
      'Assessments use published criteria and written feedback. A mentor or facilitator reviews submissions against the rubric. A revision request names what needs to change and why. The submission history shows the original version, the feedback and the revised submission.',
  },
  {
    id: 'q-11',
    category: 'Assessment',
    question: 'Can I appeal an assessment decision?',
    answer:
      'Yes, where the programme configures an appeal route. The proposed process requires the appeal to be reviewed by someone who did not assess the original submission. The participant is informed of the outcome and the reason. Appeal information should be available before submission, not only after a dispute.',
  },
  {
    id: 'q-12',
    category: 'Assessment',
    question: 'What does a certificate prove?',
    answer:
      'A YouthRise certificate is intended to record participation and assessed completion of a defined programme. It does not guarantee employment, income or academic credit, and it is not an accredited university qualification unless a specific accreditation statement says so. Each certificate carries a verification code and a public status check.',
  },
  {
    id: 'q-13',
    category: 'Data & safety',
    question: 'What personal data does YouthRise collect?',
    answer:
      'The proposed minimum is the information needed to create an account, confirm eligibility, deliver learning and issue recognition: name, email, country, participation interests and programme records. Optional communications consent is separate. The demonstration stores simulated data in your browser only.',
  },
  {
    id: 'q-14',
    category: 'Data & safety',
    question: 'Who can see my profile and assessment results?',
    answer:
      'Your private assessment records are visible to you and authorised programme staff. Mentors see assigned teams and relevant criteria. Employers see only participant-selected public portfolio information; they do not see private assessment records or contact details without permission. Administrators have scoped access governed by audit.',
  },
  {
    id: 'q-15',
    category: 'Data & safety',
    question: 'How do I report a safety concern or request my data?',
    answer:
      'Use the contact route or the report action in the relevant workspace. Safety reports are restricted to authorised personnel and assigned to a named reviewer. Privacy requests have a separate workflow with identity verification. In this demonstration, no real report is sent or processed.',
  },
  {
    id: 'q-16',
    category: 'Platform',
    question: 'Is this a real, live platform?',
    answer:
      'This build is a demonstration frontend. Accounts, programmes, teams, submissions, certificates and partner organizations are simulated. No real partnership, accreditation or impact claim is implied. The interface is structured for integration with a Java Spring Boot API, but no production backend is connected here.',
  },
  {
    id: 'q-17',
    category: 'Platform',
    question: 'Is YouthRise free to participants?',
    answer:
      'The proposed programme does not represent a participant fee in this demonstration. Any future fee, sponsorship or cost-recovery model would need to be stated clearly before registration. This build does not process payments or donations.',
  },
  {
    id: 'q-18',
    category: 'Platform',
    question: 'How accessible is the platform?',
    answer:
      'The interface targets WCAG 2.2 AA practices: semantic HTML, keyboard navigation, visible focus, labelled controls, accessible validation messages, reduced-motion support and responsive layouts. The accessibility statement lists measures and known limitations. Alternative formats can be requested through the contact route.',
  },
];

export function FAQPage() {
  useDocumentTitle('Frequently asked questions');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');

  const filtered = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory = category === 'All' || faq.category === category;
      const matchesQuery = !normalised || `${faq.question} ${faq.answer}`.toLowerCase().includes(normalised);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <>
      <PageHero
        eyebrow="Frequently asked questions"
        title="Clear answers before you commit."
        description="Questions about eligibility, learning, projects, assessment, data and the status of this demonstration build."
        breadcrumbs={[{ label: 'FAQ' }]}
        aside={
          <div className="rounded-lg border border-line bg-white p-4 text-xs shadow-xs">
            <CircleHelp className="h-5 w-5 text-teal" aria-hidden="true" />
            <p className="mt-2 font-semibold text-ink">Still have a question?</p>
            <p className="mt-1 leading-5 text-slate">Use the contact form for programme, access or partnership enquiries.</p>
            <Link to="/contact" className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-royal hover:underline">
              Contact the team
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        }
      />

      <section className="bg-white py-10 lg:py-14">
        <div className="container-editorial grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
          <aside>
            <div className="lg:sticky lg:top-28">
              <label htmlFor="faq-search" className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">
                Search questions
              </label>
              <div className="mt-2">
                <Input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the FAQ"
                  prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                  suffix={
                    query ? (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-slate hover:bg-canvas hover:text-ink"
                        aria-label="Clear search"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : undefined
                  }
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter questions by category">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-2xs font-semibold transition',
                      category === item
                        ? 'border-navy bg-navy text-white'
                        : 'border-line bg-white text-slate hover:border-navy/30 hover:text-ink',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-md border border-warning-100 bg-warning-50 p-3 text-2xs leading-5 text-warning">
                Answers describe a proposed programme. This demonstration does not create real eligibility, enrolment or
                certification records.
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Questions and answers</h2>
                <p className="mt-1 text-xs text-slate" aria-live="polite">
                  {filtered.length} question{filtered.length === 1 ? '' : 's'} shown
                </p>
              </div>
              <Badge variant="outline">{category}</Badge>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={<Search className="h-5 w-5" aria-hidden="true" />}
                title="No questions match your search"
                description="Try a different word, clear the search or choose another category."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery('');
                      setCategory('All');
                    }}
                  >
                    Reset search
                  </Button>
                }
                className="mt-4 rounded-lg border border-line"
              />
            ) : (
              <Accordion
                className="mt-4"
                items={filtered.map((faq) => ({
                  id: faq.id,
                  question: faq.question,
                  answer: (
                    <div>
                      <p>{faq.answer}</p>
                      <p className="mt-2 text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{faq.category}</p>
                    </div>
                  ),
                }))}
              />
            )}

            <div className="mt-8 rounded-lg border border-line bg-canvas p-5">
              <h2 className="text-base font-semibold text-ink">Need something more specific?</h2>
              <p className="mt-1.5 max-w-xl text-[0.8125rem] leading-6 text-slate">
                Programme enquiries, accessibility requests and partnership questions go through the contact form. Safety
                concerns should use the reporting route in the relevant workspace or the contact form in this
                demonstration.
              </p>
              <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline">
                Go to contact
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicCTA
        title="Explore before you register."
        description="Read the programme model, the virtual exchange approach and the responsible AI principles — then create a demonstration account when you are ready."
        primaryLabel="Create an account"
        secondaryLabel="Read how it works"
        secondaryTo="/how-it-works"
      />
    </>
  );
}
