import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '@/components/public/PageHero';
import { DemoNote } from '@/components/public/PageHero';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

function LegalPage({
  eyebrow,
  title,
  description,
  breadcrumb,
  sections,
  titleKey,
}: {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumb: string;
  sections: LegalSection[];
  titleKey: string;
}) {
  useDocumentTitle(titleKey);
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} breadcrumbs={[{ label: breadcrumb }]} />
      <section className="bg-white py-10 lg:py-14">
        <div className="container-editorial grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
          <aside>
            <div className="lg:sticky lg:top-28">
              <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">On this page</p>
              <nav aria-label="On this page" className="mt-3">
                <ol className="space-y-2 border-l border-line">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block border-l-2 border-transparent pl-3 text-xs leading-5 text-slate transition hover:border-teal hover:text-ink"
                      >
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="mt-5 rounded-md border border-line bg-canvas p-3 text-2xs leading-5 text-slate">
                Last updated: 28 October 2026. This is a demonstration document, not legal advice.
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <DemoNote className="mb-8">
              This policy describes the proposed production approach. The demonstration build stores simulated account
              and activity data in your browser. No real personal data is sent to a YouthRise service.
            </DemoNote>
            <div className="max-w-prose space-y-9">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="text-lg font-semibold tracking-tight text-ink">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="prose-brand mt-2">{section.body}</div>
                </section>
              ))}
            </div>
            <div className="mt-10 border-t border-line pt-5 text-xs text-slate">
              Questions about this document?{' '}
              <Link to="/contact" className="link-underline">
                Contact the programme team
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function PrivacyPage() {
  const sections: LegalSection[] = [
    {
      id: 'scope',
      title: 'Scope of this notice',
      body: (
        <>
          <p>
            This notice explains how the proposed YouthRise platform would handle personal data in accordance with
            applicable data protection legislation in East Africa, with specific alignment to the{' '}
            <strong>Uganda Data Protection and Privacy Act, 2019</strong> and the{' '}
            <strong>Data Protection and Privacy Regulations, 2021</strong>.
          </p>
          <p>
            It covers all user roles: participants, facilitators, mentors, university/training partners, employers,
            partner organizations and platform administrators.
          </p>
          <p>
            YouthRise is a demonstration and proposal platform. In this build, all data is simulated in your browser
            and no live server transmits or persists personal data.
          </p>
        </>
      ),
    },
    {
      id: 'uganda-dppa',
      title: 'Uganda Data Protection and Privacy Act, 2019 (DPPA)',
      body: (
        <>
          <p>
            The platform's data governance architecture is engineered around the statutory principles articulated in
            Section 3 of the Uganda Data Protection and Privacy Act, 2019:
          </p>
          <ul>
            <li>
              <strong>Accountability:</strong> The platform records an immutable audit log of sensitive administrative,
              data-access and grading actions.
            </li>
            <li>
              <strong>Lawfulness and Fairness:</strong> Personal data is collected only with informed, unambiguous consent
              (Section 7 &amp; 8) or under legitimate contract obligations.
            </li>
            <li>
              <strong>Purpose Specification:</strong> Data is collected solely for specified educational, exchange,
              mentorship and certification purposes and not further processed incompatibly.
            </li>
            <li>
              <strong>Data Minimisation:</strong> Only the minimum information necessary for platform participation and
              learning outcomes is requested.
            </li>
            <li>
              <strong>Data Quality &amp; Accuracy:</strong> Users maintain direct control over their profiles to correct
              and update records at any time.
            </li>
            <li>
              <strong>Storage Limitation:</strong> Clear retention periods are defined for each category of record, with
              archival and deletion workflows.
            </li>
            <li>
              <strong>Security Integrity:</strong> Technical safeguards include encrypted transport (TLS 1.3), HttpOnly
              SameSite cookies, CSRF protection, and bcrypt password hashing (cost factor 12).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'pdpo',
      title: 'Registration with the Personal Data Protection Office (PDPO)',
      body: (
        <>
          <p>
            Under Section 4 of the Uganda Data Protection and Privacy Act, 2019 and Regulation 13 of the Data Protection
            and Privacy Regulations, 2021, every data collector, data processor, and data controller operating in Uganda
            must register with the <strong>Personal Data Protection Office (PDPO)</strong> established under the
            National Information Technology Authority, Uganda (NITA-U).
          </p>
          <p>
            Prior to any commercial or operational deployment, the legal entity operating YouthRise will register as a
            Data Controller and Data Processor with the PDPO, appoint a designated Data Protection Officer (DPO), and
            conduct formal Data Protection Impact Assessments (DPIA) for features involving youth portfolio showcase
            and automated assessments.
          </p>
        </>
      ),
    },
    {
      id: 'demo',
      title: 'Demonstration data & local storage',
      body: (
        <>
          <p>
            In this demonstration build, all accounts, enrolments, messages and submissions are simulated. State is
            stored exclusively in your browser’s <code>localStorage</code> under <code>yep.demo.state.v1</code>, and session
            tokens in <code>sessionStorage</code> under <code>yep.demo.session.v1</code>.
          </p>
          <p>
            No real authentication server or third-party tracking script is loaded. You can reset all state at any time
            using “Reset demo data” in the top workspace banner or by clearing browser site data.
          </p>
        </>
      ),
    },
    {
      id: 'collect',
      title: 'Information a production platform collects',
      body: (
        <ul>
          <li><strong>Identity &amp; Account Details:</strong> Name, email address, country, optional phone number, bio, and time zone.</li>
          <li><strong>Participation &amp; Academic Records:</strong> Programme enrolments, module progression, lesson completion timestamps, session attendance.</li>
          <li><strong>Project &amp; Team Collaboration:</strong> Team membership, project milestone drafts, evidence files, and mentor feedback notes.</li>
          <li><strong>Assessments &amp; Certification:</strong> Rubric evaluations, assessor grades, written feedback, and issued certificate verification hashes.</li>
          <li><strong>Safety &amp; Compliance Records:</strong> Incident reports, safeguarding notes, and privacy rights requests restricted strictly to authorised compliance officers.</li>
          <li><strong>Security &amp; Audit Logs:</strong> Access timestamps, IP addresses (hashed), actor roles, and authentication outcomes.</li>
        </ul>
      ),
    },
    {
      id: 'purposes',
      title: 'Lawful basis and purposes of processing',
      body: (
        <>
          <p>Processing is conducted under documented lawful grounds pursuant to Section 7 of the DPPA:</p>
          <ul>
            <li><strong>Contract Performance:</strong> Delivering educational modules, facilitating virtual exchange sessions, and evaluating coursework.</li>
            <li><strong>Explicit Consent:</strong> Sharing selected portfolio projects on the employer talent showcase, or sending optional programme notifications. Consent may be revoked at any time.</li>
            <li><strong>Safeguarding &amp; Security:</strong> Protecting participants from online abuse, investigating incidents, and operating role-based access control.</li>
            <li><strong>Legal &amp; Audit Compliance:</strong> Meeting statutory reporting, grant transparency, and accounting standards.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'visibility',
      title: 'Data visibility and third-party disclosure',
      body: (
        <>
          <p>
            YouthRise does not sell, monetise, or disclose personal data to third parties for commercial advertising.
            Data sharing follows strict least-privilege boundaries:
          </p>
          <ul>
            <li>Assessment results are accessible only to the participant, the assigned facilitator, and platform administrators.</li>
            <li>Mentors see only the teams and milestones they have been assigned to evaluate.</li>
            <li>Employers can browse talent profiles only when the participant explicitly toggles visibility to “Public” and opts in to contact requests.</li>
            <li>Institutional partners receive aggregate, anonymised outcome reports with individual identity markers stripped.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Your statutory data subject rights',
      body: (
        <>
          <p>
            Under Sections 24 through 28 of the Uganda Data Protection and Privacy Act, 2019, users have enforceable
            rights regarding their personal information:
          </p>
          <ul>
            <li><strong>Right to Access (Section 24):</strong> Request confirmation and an export copy of all personal data held about you.</li>
            <li><strong>Right to Rectification (Section 25):</strong> Request prompt correction of inaccurate, misleading, or outdated personal information.</li>
            <li><strong>Right to Erasure / Deletion (Section 26):</strong> Request deletion of personal records where there is no lawful justification for retention.</li>
            <li><strong>Right to Restrict Processing (Section 27):</strong> Limit how your data is processed while a dispute or objection is investigated.</li>
            <li><strong>Right to Object to Automated Profiling (Section 28):</strong> Request human intervention for automated assessment or eligibility recommendations.</li>
            <li><strong>Right to Complain:</strong> Lodge a complaint with the Personal Data Protection Office (PDPO) at <a href="https://www.pdpo.go.ug" target="_blank" rel="noreferrer" className="link-underline">www.pdpo.go.ug</a>.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention',
      title: 'Data retention and erasure policy',
      body: (
        <p>
          Records are retained only for as long as necessary to achieve the educational and verification purposes.
          Inactive participant accounts are flagged after 24 months, with notification before secure anonymisation.
          Certificate verification hashes are retained permanently to ensure public validity checks remain reliable.
          Deletion requests are processed within 14 statutory days, informing the user of what records have been
          erased and what must be retained under statutory safeguarding rules.
        </p>
      ),
    },
    {
      id: 'security',
      title: 'Security and breach notification procedures',
      body: (
        <p>
          Security controls are aligned with Section 20 of the DPPA and NITA-U standards: AES-256 data storage
          encryption, TLS 1.3 encrypted transport, HttpOnly session cookies, Spring Security role validation on all
          endpoints, and continuous audit logging. In the event of a verified data breach, the platform will notify
          the Personal Data Protection Office (PDPO) and affected data subjects without undue delay pursuant to
          Section 23 of the DPPA.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'Data protection officer and contact',
      body: (
        <>
          <p>
            Enquiries, access requests, and privacy complaints may be submitted through the{' '}
            <Link to="/contact?subject=privacy" className="link-underline">Contact form</Link> or by email to{' '}
            <strong>privacy@youthrise.example</strong>.
          </p>
          <p>
            Regulatory authority: Personal Data Protection Office (PDPO), National Information Technology Authority –
            Uganda (NITA-U), Palm Courts, Plot 7A Rotary Avenue (Lugogo Bypass), Kampala, Uganda.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Privacy & Compliance"
      title="Privacy policy and data protection"
      description="How YouthRise collects, protects and handles personal data under the Uganda Data Protection and Privacy Act, 2019."
      breadcrumb="Privacy"
      titleKey="Privacy policy"
      sections={sections}
    />
  );
}

export function TermsPage() {
  const sections: LegalSection[] = [
    {
      id: 'acceptance',
      title: 'Acceptance',
      body: (
        <p>
          By using this demonstration interface, you acknowledge that it is a proposed product build. These terms are
          illustrative and do not create a contract with a real YouthRise entity. A production service would require accepted
          terms before account creation.
        </p>
      ),
    },
    {
      id: 'status',
      title: 'Status of the programme',
      body: (
        <p>
          YouthRise is proposed. Programme titles, dates, eligibility rules, partner organizations, certificates and impact
          statements shown in this build are demonstration content unless explicitly marked as verified. No accreditation,
          partnership or employment outcome is promised.
        </p>
      ),
    },
    {
      id: 'accounts',
      title: 'Accounts and eligibility',
      body: (
        <>
          <p>
            Participants must be aged 18–35 and meet the published eligibility criteria for the relevant programme.
            Information provided at registration must be accurate.
          </p>
          <p>
            Privileged roles are granted only through an authorised approval or invitation process. Attempting to access
            a role or record without authorisation is prohibited. Accounts may be suspended where necessary to protect
            participants, staff or the platform.
          </p>
        </>
      ),
    },
    {
      id: 'use',
      title: 'Acceptable use',
      body: (
        <ul>
          <li>Do not harass, threaten, discriminate against or impersonate another person.</li>
          <li>Do not upload malware, attempt to gain unauthorised access or disrupt the service.</li>
          <li>Do not share another participant’s personal information without permission.</li>
          <li>Do not submit fabricated evidence or misrepresent another person’s work.</li>
          <li>Do not use the platform to send spam or unrelated commercial content.</li>
          <li>Follow the programme’s safeguarding, privacy and responsible AI guidance.</li>
        </ul>
      ),
    },
    {
      id: 'learning',
      title: 'Learning, assessment and projects',
      body: (
        <p>
          Assessment decisions are made against published criteria by authorised people. Feedback may include a revision
          request. Appeal routes are available where configured and should be used in good faith. Team participation
          involves shared work; attribution and consent expectations apply to project evidence.
        </p>
      ),
    },
    {
      id: 'certificates',
      title: 'Certificates and recognition',
      body: (
        <p>
          A certificate records the programme and completion status defined by YouthRise. It is not an academic qualification,
          professional licence or guarantee of employment unless a specific statement says otherwise. A certificate may
          be revoked if issued in error or if completion requirements were not met. The verification page shows the
          current status.
        </p>
      ),
    },
    {
      id: 'ip',
      title: 'Intellectual property',
      body: (
        <p>
          Participants retain ownership of their original project work, subject to any programme-specific agreement.
          YouthRise would receive a limited licence to review, assess, archive and showcase work where the participant has
          consented. Third-party content must be used with permission or an appropriate licence.
        </p>
      ),
    },
    {
      id: 'third-party',
      title: 'Third-party services',
      body: (
        <p>
          Live sessions may use an external meeting service. Following a meeting link is subject to that provider’s terms
          and privacy notice. YouthRise does not host live video in this build and is not responsible for a third-party
          service’s availability or practices.
        </p>
      ),
    },
    {
      id: 'disclaimer',
      title: 'Disclaimers and limitation',
      body: (
        <p>
          This demonstration is provided “as is” for evaluation. It may contain incomplete features or simulated data. A
          production service would include appropriate service levels, disclaimers and liability terms reviewed by
          qualified counsel. Nothing in these illustrative terms excludes liability that cannot lawfully be excluded.
        </p>
      ),
    },
    {
      id: 'ucc-assessment',
      title: 'Uganda Communications Commission (UCC) regulatory assessment',
      body: (
        <>
          <p>
            YouthRise has been evaluated against the regulatory mandates of the{' '}
            <strong>Uganda Communications Commission (UCC)</strong> established under the Uganda Communications Act, 2013:
          </p>
          <ul>
            <li>
              <strong>Platform Nature:</strong> YouthRise operates as an application software platform and educational portal
              for digital skills development, project documentation, and structured virtual exchange.
            </li>
            <li>
              <strong>Non-Carrier Status:</strong> The platform does not operate a public telecommunications transmission
              network, does not provide internet access connectivity, and does not conduct public radio or television
              broadcasting. It is therefore not subject to public telecommunications carrier or broadcasting operator licensing.
            </li>
            <li>
              <strong>Consumer Protection &amp; Content Standards:</strong> The platform adheres to UCC standards concerning
              fair consumer terms, digital safety for young users, prevention of misleading claims, and prompt resolution of
              consumer complaints.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'nitau-compliance',
      title: 'NITA-U standards & electronic transactions',
      body: (
        <>
          <p>
            In alignment with guidelines issued by the <strong>National Information Technology Authority – Uganda (NITA-U)</strong>:
          </p>
          <ul>
            <li>
              <strong>Electronic Transactions Act, 2011:</strong> Digital records, electronic signatures, and online consent
              mechanisms implemented in YouthRise comply with the legal validity requirements of Ugandan electronic law.
            </li>
            <li>
              <strong>Information Security Standards:</strong> System design follows NITA-U national standards for data
              classification, credential security, role separation, and vulnerability mitigation.
            </li>
            <li>
              <strong>Transparency Statement:</strong> YouthRise does not claim formal UCC approval, NITA-U certification,
              or official government endorsement. Formal compliance filings will be completed with statutory authorities
              prior to production launch.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      title: 'Changes and governing law',
      body: (
        <p>
          These terms may be updated as the product and programme rules develop. The governing law of the platform
          is the laws of the Republic of Uganda, with submission to the jurisdiction of competent courts in Kampala,
          Uganda.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of use"
      description="Illustrative terms for a proposed youth learning and collaboration platform. Not a live contractual agreement."
      breadcrumb="Terms"
      titleKey="Terms of use"
      sections={sections}
    />
  );
}

export function AccessibilityPage() {
  const sections: LegalSection[] = [
    {
      id: 'commitment',
      title: 'Our commitment',
      body: (
        <p>
          YouthRise aims to be usable by young people with a wide range of abilities, devices and connection speeds. We treat
          accessibility as a product requirement: it affects navigation, forms, assessment, project evidence and
          recognition.
        </p>
      ),
    },
    {
      id: 'standard',
      title: 'Target standard',
      body: (
        <p>
          The interface targets WCAG 2.2 Level AA practices. This is a target, not a certification. A production
          programme would commission independent testing and publish a conformance report with known exceptions.
        </p>
      ),
    },
    {
      id: 'measures',
      title: 'Measures in this build',
      body: (
        <ul>
          <li>Semantic landmarks, headings and skip links.</li>
          <li>Full keyboard access to navigation, forms, dialogs, tabs and accordions.</li>
          <li>Visible focus indicators and logical focus management in dialogs.</li>
          <li>Labelled form controls, inline error messages and screen-reader announcements.</li>
          <li>Colour combinations designed for AA contrast; status is never conveyed by colour alone.</li>
          <li>Reduced-motion support and restrained animation.</li>
          <li>Responsive layouts tested from 320px upwards, with mobile-specific navigation.</li>
          <li>Text alternatives for meaningful graphics; decorative elements hidden from assistive technology.</li>
          <li>Charts paired with captions, summaries and accessible labels.</li>
          <li>Plain-language content and consistent interaction patterns.</li>
        </ul>
      ),
    },
    {
      id: 'limitations',
      title: 'Known limitations',
      body: (
        <>
          <p>This demonstration has not undergone an independent accessibility audit. Known limitations include:</p>
          <ul>
            <li>Third-party meeting platforms may have their own caption and keyboard limitations.</li>
            <li>User-uploaded documents may not be accessible unless participants follow guidance.</li>
            <li>Some complex data tables collapse into simplified lists on small screens, which may omit secondary detail.</li>
            <li>Automated checks cannot detect every barrier; manual testing with assistive technology is still required.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'testing',
      title: 'Testing approach',
      body: (
        <p>
          The build is tested with keyboard navigation, responsive viewport checks and automated component tests for core
          journeys. A production programme should add testing with screen-reader users, participants with low vision,
          cognitive accessibility specialists and people using low-end devices and intermittent connectivity.
        </p>
      ),
    },
    {
      id: 'feedback',
      title: 'Feedback and alternative formats',
      body: (
        <p>
          If a page, form or document is difficult to use, contact the programme team and describe the barrier. In a
          production service, alternative formats and a monitored response time would be provided. This demonstration
          cannot respond to real requests.
        </p>
      ),
    },
    {
      id: 'ongoing',
      title: 'Ongoing improvement',
      body: (
        <p>
          Accessibility findings would be tracked as product issues, prioritised by impact and reviewed with participants.
          Training materials and assessment instructions would be checked for plain language and accessible formatting
          before publication.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Accessibility"
      title="Accessibility statement"
      description="The accessibility measures in this build, the standard we target and the limitations we have not yet resolved."
      breadcrumb="Accessibility"
      titleKey="Accessibility statement"
      sections={sections}
    />
  );
}
