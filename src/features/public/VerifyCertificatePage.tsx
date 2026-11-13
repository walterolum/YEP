import { AlertCircle, BadgeCheck, Copy, Search, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { PageHero } from '@/components/public/PageHero';
import { Alert, Button, Field, Input, StatusBadge, useToast } from '@/components/ui';
import { certificateService } from '@/services/assessmentService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/format';
import type { Certificate } from '@/types';

const demoCodes = ['YEP-DEMO-4K7Q-2026', 'YEP-DEMO-PEND-2026', 'YEP-DEMO-REVK-2026'];

export function VerifyCertificatePage() {
  useDocumentTitle('Verify a certificate');
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  async function verify(value: string) {
    setLoading(true);
    setError(null);
    setCertificate(null);
    try {
      const result = await certificateService.verify(value);
      setCertificate(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Verification could not be completed.');
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!certificate) return;
    void navigator.clipboard?.writeText(certificate.code);
    toast({ title: 'Code copied', description: 'The demonstration code is on your clipboard.', variant: 'info' });
  }

  return (
    <>
      <PageHero
        eyebrow="Certificate registry"
        title="Verify a YouthRise certificate."
        description="Enter the unique code printed on a certificate to check its current status. This demonstration registry contains sample records only."
        breadcrumbs={[{ label: 'Verify a certificate' }]}
        aside={
          <div className="rounded-lg border border-warning-100 bg-warning-50 p-4 text-xs leading-5 text-warning">
            <p className="font-semibold">Demonstration registry</p>
            <p className="mt-1">
              These records are fictional. A valid result does not represent accreditation, partnership or a real
              qualification.
            </p>
          </div>
        }
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="container-editorial grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
          <div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void verify(code);
              }}
              className="rounded-lg border border-line bg-white p-5 sm:p-6"
              noValidate
            >
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-teal" aria-hidden="true" />
                <h2 className="text-lg font-semibold tracking-tight text-ink">Check a verification code</h2>
              </div>
              <p className="mt-1.5 max-w-xl text-[0.8125rem] leading-6 text-slate">
                Codes are not case-sensitive. Do not enter personal information into this field. Verification does not
                require an account.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                <Field label="Certificate code" htmlFor="certificate-code" className="flex-1" error={error ?? undefined}>
                  <Input
                    id="certificate-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="YEP-DEMO-XXXX-YYYY"
                    autoComplete="off"
                    spellCheck={false}
                    invalid={Boolean(error)}
                    prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                  />
                </Field>
                <Button type="submit" loading={loading} className="sm:mb-0">
                  Verify code
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Try a demonstration code:</span>
                {demoCodes.map((demoCode) => (
                  <button
                    key={demoCode}
                    type="button"
                    onClick={() => {
                      setCode(demoCode);
                      void verify(demoCode);
                    }}
                    className="rounded border border-line bg-canvas px-2 py-1 font-mono text-[0.625rem] text-slate transition hover:border-navy/30 hover:text-ink"
                  >
                    {demoCode}
                  </button>
                ))}
              </div>
            </form>

            <div className="mt-5" aria-live="polite">
              {error && (
                <Alert variant="danger" title="No certificate returned">
                  {error}
                </Alert>
              )}

              {certificate && (
                <div
                  className="overflow-hidden rounded-lg border border-line bg-white"
                  role="status"
                  aria-label="Certificate verification result"
                >
                  <div
                    className={
                      certificate.status === 'valid'
                        ? 'border-b border-success-100 bg-success-50 px-5 py-4'
                        : certificate.status === 'pending'
                          ? 'border-b border-warning-100 bg-warning-50 px-5 py-4'
                          : 'border-b border-danger-100 bg-danger-50 px-5 py-4'
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {certificate.status === 'valid' ? (
                          <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
                        ) : certificate.status === 'pending' ? (
                          <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
                        ) : (
                          <XCircle className="h-5 w-5 text-danger" aria-hidden="true" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {certificate.status === 'valid'
                              ? 'Certificate record found'
                              : certificate.status === 'pending'
                                ? 'Certificate pending'
                                : 'Certificate revoked'}
                          </p>
                          <p className="text-2xs text-slate">Demonstration registry · not a live verification</p>
                        </div>
                      </div>
                      <StatusBadge status={certificate.status} />
                    </div>
                  </div>

                  <div className="p-5">
                    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {[
                        ['Programme', certificate.programmeTitle],
                        ['Level', certificate.level === 1 ? 'Level One' : 'Level Two'],
                        ['Certificate holder', certificate.participantName],
                        ['Issue date', certificate.issueDate ? formatDate(certificate.issueDate) : 'Not issued'],
                        ['Verification code', certificate.code],
                        ['Status', certificate.status],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{label}</dt>
                          <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-5 rounded-md border border-line bg-canvas p-4">
                      <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Verification note</p>
                      <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">{certificate.verificationNote}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={copyCode} iconLeft={<Copy className="h-3.5 w-3.5" aria-hidden="true" />}>
                        Copy code
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCertificate(null);
                          setCode('');
                        }}
                      >
                        Check another code
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!certificate && !error && (
              <div className="mt-6 rounded-lg border border-line bg-canvas p-5">
                <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">What verification returns</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Identity', 'Certificate holder and programme as recorded at issuance.'],
                    ['Status', 'Valid, pending or revoked — with the reason where configured.'],
                    ['Context', 'A note explaining what the record does and does not prove.'],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded border border-line bg-white p-3">
                      <p className="text-2xs font-semibold text-ink">{title}</p>
                      <p className="mt-1 text-2xs leading-5 text-slate">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-line bg-canvas p-5">
              <ShieldCheck className="h-5 w-5 text-teal" aria-hidden="true" />
              <h2 className="mt-2 text-[0.9375rem] font-semibold text-ink">What this check means</h2>
              <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-6 text-slate">
                <li>A record exists in the YouthRise demonstration registry.</li>
                <li>The displayed status reflects the simulated record, not a real institution.</li>
                <li>It does not prove identity, employment eligibility or academic credit.</li>
                <li>It does not expose assessment scores, contact details or a private profile.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <h2 className="text-[0.9375rem] font-semibold text-ink">Report a concern</h2>
              <p className="mt-1.5 text-[0.8125rem] leading-6 text-slate">
                If a certificate appears altered or you suspect misuse, contact the programme team with the code and the
                context where you saw it.
              </p>
              <a href="/contact" className="mt-3 inline-flex text-2xs font-semibold text-royal hover:underline">
                Contact the team
              </a>
            </div>
            <div className="rounded-lg border border-warning-100 bg-warning-50 p-4 text-2xs leading-5 text-warning">
              Demonstration certificate codes are listed on the Impact page. They are not real credentials.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
