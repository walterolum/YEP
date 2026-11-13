import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { DEMO_PASSWORD } from '@/lib/demoAccounts';
import { authService } from '@/services/authService';
import { AdminOverviewPage } from '@/features/app/AdminPages';
import { EmployerOverviewPage } from '@/features/app/EmployerPages';
import { FacilitatorOverviewPage } from '@/features/app/FacilitatorPages';
import { MentorOverviewPage } from '@/features/app/MentorPages';
import { ParticipantOverviewPage } from '@/features/app/ParticipantPages';
import { PartnerOverviewPage } from '@/features/app/PartnerPages';
import { UniversityOverviewPage } from '@/features/app/UniversityPages';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/features/auth/AuthPages';
import { AboutPage } from '@/features/public/AboutPage';
import { ContactPage } from '@/features/public/ContactPage';
import { FAQPage } from '@/features/public/FAQPage';
import { HomePage } from '@/features/public/HomePage';
import { HowItWorksPage } from '@/features/public/HowItWorksPage';
import { ImpactPage } from '@/features/public/ImpactPage';
import { ImpactProjectsPage } from '@/features/public/ImpactProjectsPage';
import { AccessibilityPage, PrivacyPage, TermsPage } from '@/features/public/LegalPages';
import { MentorshipPage } from '@/features/public/MentorshipPage';
import { ProgrammesPage } from '@/features/public/ProgrammesPage';
import { ResponsibleAIPage } from '@/features/public/ResponsibleAIPage';
import { VerifyCertificatePage } from '@/features/public/VerifyCertificatePage';
import { VirtualExchangePage } from '@/features/public/VirtualExchangePage';

function renderPage(element: ReactElement, path = '/') {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </AppProviders>,
  );
}

/**
 * Render-level smoke tests. They catch missing exports, provider mistakes and
 * crashes in top-level page code that unit tests on stores and guards cannot.
 */
describe('public pages render', () => {
  const pages: [string, ReactElement][] = [
    ['Home', <HomePage key="home" />],
    ['About', <AboutPage key="about" />],
    ['How it works', <HowItWorksPage key="how-it-works" />],
    ['Programmes', <ProgrammesPage key="programmes" />],
    ['Virtual exchange', <VirtualExchangePage key="virtual-exchange" />],
    ['Impact projects', <ImpactProjectsPage key="impact-projects" />],
    ['Mentorship', <MentorshipPage key="mentorship" />],
    ['Impact and stories', <ImpactPage key="impact" />],
    ['Responsible AI', <ResponsibleAIPage key="responsible-ai" />],
    ['FAQ', <FAQPage key="faq" />],
    ['Contact', <ContactPage key="contact" />],
    ['Privacy', <PrivacyPage key="privacy" />],
    ['Terms', <TermsPage key="terms" />],
    ['Accessibility', <AccessibilityPage key="accessibility" />],
  ];

  it.each(pages)('renders %s with a single top-level heading', async (_name, element) => {
    renderPage(element);
    const headings = await screen.findAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim().length).toBeGreaterThan(0);
  });

  it('renders certificate verification with the code form', async () => {
    renderPage(<VerifyCertificatePage />, '/verify');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/verif/i);
    expect(screen.getByLabelText(/certificate code/i)).toBeInTheDocument();
  });
});

describe('role dashboards render', () => {
  const dashboards: [string, string, ReactElement][] = [
    ['participant', 'amara@yep.demo', <ParticipantOverviewPage key="participant" />],
    ['facilitator', 'daniel@yep.demo', <FacilitatorOverviewPage key="facilitator" />],
    ['mentor', 'grace@yep.demo', <MentorOverviewPage key="mentor" />],
    ['university', 'sarah@yep.demo', <UniversityOverviewPage key="university" />],
    ['employer', 'tom@yep.demo', <EmployerOverviewPage key="employer" />],
    ['partner', 'irene@yep.demo', <PartnerOverviewPage key="partner" />],
    ['administrator', 'admin@yep.demo', <AdminOverviewPage key="admin" />],
  ];

  it.each(dashboards)('renders the %s overview for the matching account', async (_role, email, element) => {
    await authService.login(email, DEMO_PASSWORD);
    renderPage(element, '/app');
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.textContent?.trim().length).toBeGreaterThan(0);
  });
});

describe('authentication pages render', () => {
  it('renders sign in with email and password fields', async () => {
    renderPage(<LoginPage />, '/login');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/welcome back/i);
    expect(screen.getByLabelText(/^Email address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
  });

  it('renders registration', async () => {
    renderPage(<RegisterPage />, '/register');
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('renders password recovery', async () => {
    renderPage(<ForgotPasswordPage />, '/forgot-password');
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders the reset form with a token in the query string', async () => {
    renderPage(<ResetPasswordPage />, '/reset-password?token=demo-reset-token');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0);
  });

  it('renders email verification', async () => {
    renderPage(<VerifyEmailPage />, '/verify-email');
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
