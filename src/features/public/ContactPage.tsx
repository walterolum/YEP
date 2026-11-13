import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Clock, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { PageHero } from '@/components/public/PageHero';
import { Alert, Button, Checkbox, Field, Input, Select, Textarea } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name (at least 2 characters).'),
  email: z.string().trim().email('Enter a valid email address.'),
  reason: z.string().min(1, 'Choose a reason for your enquiry.'),
  message: z
    .string()
    .trim()
    .min(20, 'Please provide at least 20 characters so we can route your enquiry.')
    .max(2000, 'Please keep your message under 2,000 characters.'),
  consent: z.boolean().refine((value) => value === true, {
    message: 'Please acknowledge the privacy notice before submitting.',
  }),
});

type ContactValues = z.infer<typeof contactSchema>;

const reasonFromSubject: Record<string, string> = {
  mentor: 'mentor',
  partnership: 'partnership',
  accessibility: 'accessibility',
  programme: 'programme',
};

function createTicketReference(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return `YEP-DEMO-${code}`;
}

export function ContactPage() {
  useDocumentTitle('Contact');
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject') ?? '';
  const [reference, setReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      reason: reasonFromSubject[subject] ?? '',
      message: '',
      consent: false,
    },
  });

  async function onSubmit() {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    setReference(createTicketReference());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startAnother() {
    setReference(null);
    reset();
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the programme team."
        description="Use this form for programme, access, partnership or accessibility enquiries. This is a demonstration form: submissions are simulated and no message is sent."
        breadcrumbs={[{ label: 'Contact' }]}
        aside={
          <div className="rounded-lg border border-line bg-white p-4 text-xs shadow-xs">
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">Demonstration contact</p>
            <p className="mt-2 flex items-center gap-1.5 font-medium text-ink">
              <Mail className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              hello@youthrise.example
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-slate">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Proposed response: 3 working days
            </p>
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            {reference ? (
              <div className="rounded-lg border border-success-100 bg-success-50 p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-success">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Demonstration message recorded</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate">
                  No message was sent to a real inbox. In a production build, the API would return a reference and route
                  the enquiry to the appropriate team.
                </p>
                <dl className="mt-5 grid gap-3 rounded-md border border-success-100 bg-white p-4 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Reference</dt>
                    <dd className="mt-1 font-mono text-[0.8125rem] font-semibold text-ink">{reference}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Status</dt>
                    <dd className="mt-1 font-medium text-ink">Simulated · not delivered</dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={startAnother} variant="outline">
                    Send another message
                  </Button>
                  <a href="/" className="inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-royal hover:underline">
                    Back to home
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div>
                  <p className="eyebrow mb-2">Enquiry form</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">How can we help?</h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate">
                    Fields marked with an asterisk are required. Do not include passwords, health information or other
                    sensitive personal data.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="contact-name" required error={errors.name?.message}>
                    <Input
                      id="contact-name"
                      autoComplete="name"
                      invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      {...register('name')}
                    />
                  </Field>
                  <Field label="Email address" htmlFor="contact-email" required error={errors.email?.message}>
                    <Input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      {...register('email')}
                    />
                  </Field>
                </div>

                <Field label="Reason for enquiry" htmlFor="contact-reason" required error={errors.reason?.message}>
                  <Select
                    id="contact-reason"
                    invalid={Boolean(errors.reason)}
                    aria-describedby={errors.reason ? 'contact-reason-error' : undefined}
                    {...register('reason')}
                  >
                    <option value="">Select a reason</option>
                    <option value="programme">Programme or eligibility question</option>
                    <option value="mentor">Mentor interest</option>
                    <option value="partnership">Partnership or institutional enquiry</option>
                    <option value="accessibility">Accessibility or alternative format</option>
                    <option value="safety">Safety or privacy concern</option>
                    <option value="other">Something else</option>
                  </Select>
                </Field>

                <Field
                  label="Message"
                  htmlFor="contact-message"
                  required
                  hint="20–2,000 characters. Please describe the decision or support you need."
                  error={errors.message?.message}
                >
                  <Textarea
                    id="contact-message"
                    rows={7}
                    invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-hint'}
                    {...register('message')}
                  />
                </Field>

                <Checkbox
                  id="contact-consent"
                  label={
                    <>
                      I have read the{' '}
                      <a href="/privacy" className="font-semibold text-royal underline-offset-2 hover:underline">
                        privacy notice
                      </a>{' '}
                      and understand that this demonstration does not send or store a real enquiry.
                    </>
                  }
                  error={errors.consent?.message}
                  {...register('consent')}
                />

                <Alert variant="warning">
                  In this demonstration, the form simulates a successful submission after a short delay. Nothing leaves
                  your browser.
                </Alert>

                <div className="flex flex-wrap items-center gap-4">
                  <Button type="submit" loading={isSubmitting} size="lg">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    Submit demonstration enquiry
                  </Button>
                  <p className="text-2xs text-slate">No account required.</p>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-line bg-canvas p-5">
              <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                <ShieldCheck className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
                Before you send
              </h2>
              <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-6 text-slate">
                <li>Do not include passwords, verification codes or financial information.</li>
                <li>Do not include health information or another person’s contact details.</li>
                <li>For a safeguarding concern, use the reporting route in the relevant workspace.</li>
                <li>This demonstration is not monitored and cannot respond to emergencies.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-line bg-white p-5">
              <h2 className="text-[0.9375rem] font-semibold text-ink">Accessibility</h2>
              <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">
                If the form is difficult to use, an alternative format can be requested. In a production platform this
                route would be monitored and an accessible response provided.
              </p>
              <p className="mt-2 text-2xs font-medium text-teal-700">Email subject: “Accessibility request”</p>
            </div>

            <div className="rounded-lg border border-warning-100 bg-warning-50 p-4 text-xs leading-5 text-warning">
              <p className="font-semibold">Demonstration notice</p>
              <p className="mt-1">
                Contact details, response times and organisational routing are illustrative. No real partnership,
                programme team or support desk is represented.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
