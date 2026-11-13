import { Suspense, lazy } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { RequireAuth, RequireGuest, RequireRole } from '@/app/guards';
import { AppLayout } from '@/app/layouts/AppLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { PublicLayout, ScrollToTop } from '@/app/layouts/PublicLayout';
import { RouteFallback } from '@/app/RouteFallback';
import {
  AccountPendingPage,
  AccountSuspendedPage,
  ForbiddenPage,
  NotFoundPage,
  RouteErrorPage,
  SessionExpiredPage,
  UnauthorizedPage,
} from '@/features/errors/ErrorPages';
import { ROLE_HOME } from '@/types';

type PageComponent = ComponentType<Record<string, never>>;

/**
 * Lazily resolves a named page export. Every route becomes its own chunk, so
 * the public site does not download all seven dashboards on first load.
 */
function lazyNamed(loader: () => Promise<Record<string, unknown>>, name: string) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[name] as PageComponent };
  });
}

/* Public site ------------------------------------------------------- */
const HomePage = lazyNamed(() => import('@/features/public/HomePage'), 'HomePage');
const AboutPage = lazyNamed(() => import('@/features/public/AboutPage'), 'AboutPage');
const HowItWorksPage = lazyNamed(() => import('@/features/public/HowItWorksPage'), 'HowItWorksPage');
const ProgrammesPage = lazyNamed(() => import('@/features/public/ProgrammesPage'), 'ProgrammesPage');
const ProgrammeDetailPage = lazyNamed(
  () => import('@/features/public/ProgrammeDetailPage'),
  'ProgrammeDetailPage',
);
const VirtualExchangePage = lazyNamed(
  () => import('@/features/public/VirtualExchangePage'),
  'VirtualExchangePage',
);
const ImpactProjectsPage = lazyNamed(
  () => import('@/features/public/ImpactProjectsPage'),
  'ImpactProjectsPage',
);
const MentorshipPage = lazyNamed(() => import('@/features/public/MentorshipPage'), 'MentorshipPage');
const ImpactPage = lazyNamed(() => import('@/features/public/ImpactPage'), 'ImpactPage');
const ResponsibleAIPage = lazyNamed(
  () => import('@/features/public/ResponsibleAIPage'),
  'ResponsibleAIPage',
);
const FAQPage = lazyNamed(() => import('@/features/public/FAQPage'), 'FAQPage');
const ContactPage = lazyNamed(() => import('@/features/public/ContactPage'), 'ContactPage');
const PrivacyPage = lazyNamed(() => import('@/features/public/LegalPages'), 'PrivacyPage');
const TermsPage = lazyNamed(() => import('@/features/public/LegalPages'), 'TermsPage');
const AccessibilityPage = lazyNamed(() => import('@/features/public/LegalPages'), 'AccessibilityPage');
const VerifyCertificatePage = lazyNamed(
  () => import('@/features/public/VerifyCertificatePage'),
  'VerifyCertificatePage',
);

/* Authentication ---------------------------------------------------- */
const LoginPage = lazyNamed(() => import('@/features/auth/AuthPages'), 'LoginPage');
const RegisterPage = lazyNamed(() => import('@/features/auth/AuthPages'), 'RegisterPage');
const ForgotPasswordPage = lazyNamed(() => import('@/features/auth/AuthPages'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyNamed(() => import('@/features/auth/AuthPages'), 'ResetPasswordPage');
const VerifyEmailPage = lazyNamed(() => import('@/features/auth/AuthPages'), 'VerifyEmailPage');

/* Shared account routes -------------------------------------------- */
const ProfilePage = lazyNamed(() => import('@/features/app/AccountPages'), 'ProfilePage');
const NotificationsPage = lazyNamed(() => import('@/features/app/AccountPages'), 'NotificationsPage');

/* Participant ------------------------------------------------------- */
const ParticipantOverviewPage = lazyNamed(
  () => import('@/features/app/ParticipantPages'),
  'ParticipantOverviewPage',
);
const ParticipantProgrammesPage = lazyNamed(
  () => import('@/features/app/ParticipantPages'),
  'ParticipantProgrammesPage',
);
const ParticipantLearningPage = lazyNamed(
  () => import('@/features/app/ParticipantPages'),
  'ParticipantLearningPage',
);
const LessonPage = lazyNamed(() => import('@/features/app/ParticipantPages'), 'LessonPage');
const ParticipantTeamPage = lazyNamed(
  () => import('@/features/app/ParticipantWorkspacePages'),
  'ParticipantTeamPage',
);
const ParticipantProjectPage = lazyNamed(
  () => import('@/features/app/ParticipantWorkspacePages'),
  'ParticipantProjectPage',
);
const ParticipantAssessmentsPage = lazyNamed(
  () => import('@/features/app/ParticipantAssessmentPages'),
  'ParticipantAssessmentsPage',
);
const ParticipantCertificatesPage = lazyNamed(
  () => import('@/features/app/ParticipantAssessmentPages'),
  'ParticipantCertificatesPage',
);
const ParticipantSessionsPage = lazyNamed(
  () => import('@/features/app/ParticipantPages'),
  'ParticipantSessionsPage',
);

/* Facilitator ------------------------------------------------------- */
const FacilitatorOverviewPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorOverviewPage',
);
const FacilitatorProgrammesPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorProgrammesPage',
);
const FacilitatorContentPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorContentPage',
);
const FacilitatorCohortsPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorCohortsPage',
);
const FacilitatorSessionsPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorSessionsPage',
);
const FacilitatorTeamsPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorTeamsPage',
);
const FacilitatorAssessmentsPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorAssessmentsPage',
);
const FacilitatorReportsPage = lazyNamed(
  () => import('@/features/app/FacilitatorPages'),
  'FacilitatorReportsPage',
);

/* Mentor ------------------------------------------------------------ */
const MentorOverviewPage = lazyNamed(() => import('@/features/app/MentorPages'), 'MentorOverviewPage');
const MentorTeamsPage = lazyNamed(() => import('@/features/app/MentorPages'), 'MentorTeamsPage');
const MentorReviewsPage = lazyNamed(() => import('@/features/app/MentorPages'), 'MentorReviewsPage');
const MentorMeetingsPage = lazyNamed(() => import('@/features/app/MentorPages'), 'MentorMeetingsPage');

/* University / training partner ------------------------------------ */
const UniversityOverviewPage = lazyNamed(
  () => import('@/features/app/UniversityPages'),
  'UniversityOverviewPage',
);
const UniversityNominationsPage = lazyNamed(
  () => import('@/features/app/UniversityPages'),
  'UniversityNominationsPage',
);
const UniversityCohortPage = lazyNamed(
  () => import('@/features/app/UniversityPages'),
  'UniversityCohortPage',
);
const UniversityReportsPage = lazyNamed(
  () => import('@/features/app/UniversityPages'),
  'UniversityReportsPage',
);

/* Employer ---------------------------------------------------------- */
const EmployerOverviewPage = lazyNamed(
  () => import('@/features/app/EmployerPages'),
  'EmployerOverviewPage',
);
const EmployerTalentPage = lazyNamed(() => import('@/features/app/EmployerPages'), 'EmployerTalentPage');
const EmployerSavedPage = lazyNamed(() => import('@/features/app/EmployerPages'), 'EmployerSavedPage');

/* Partner organisation --------------------------------------------- */
const PartnerOverviewPage = lazyNamed(
  () => import('@/features/app/PartnerPages'),
  'PartnerOverviewPage',
);
const PartnerProgrammesPage = lazyNamed(
  () => import('@/features/app/PartnerPages'),
  'PartnerProgrammesPage',
);
const PartnerShowcasePage = lazyNamed(
  () => import('@/features/app/PartnerPages'),
  'PartnerShowcasePage',
);
const PartnerReportsPage = lazyNamed(() => import('@/features/app/PartnerPages'), 'PartnerReportsPage');

/* Administrator ----------------------------------------------------- */
const AdminOverviewPage = lazyNamed(() => import('@/features/app/AdminPages'), 'AdminOverviewPage');
const AdminUsersPage = lazyNamed(() => import('@/features/app/AdminPages'), 'AdminUsersPage');
const AdminRolesPage = lazyNamed(() => import('@/features/app/AdminPages'), 'AdminRolesPage');
const AdminContentPage = lazyNamed(() => import('@/features/app/AdminPages'), 'AdminContentPage');
const AdminReportsPage = lazyNamed(() => import('@/features/app/AdminPages'), 'AdminReportsPage');
const AdminIncidentsPage = lazyNamed(
  () => import('@/features/app/AdminGovernancePages'),
  'AdminIncidentsPage',
);
const AdminPrivacyPage = lazyNamed(
  () => import('@/features/app/AdminGovernancePages'),
  'AdminPrivacyPage',
);
const AdminAuditPage = lazyNamed(() => import('@/features/app/AdminGovernancePages'), 'AdminAuditPage');
const AdminProgrammesPage = lazyNamed(() => import('@/features/app/AdminManagementPages'), 'AdminProgrammesPage');
const AdminProjectsPage = lazyNamed(() => import('@/features/app/AdminManagementPages'), 'AdminProjectsPage');
const AdminSessionsPage = lazyNamed(() => import('@/features/app/AdminManagementPages'), 'AdminSessionsPage');
const AdminAssessmentsPage = lazyNamed(() => import('@/features/app/AdminManagementPages'), 'AdminAssessmentsPage');
const AdminCertificatesPage = lazyNamed(() => import('@/features/app/AdminManagementPages'), 'AdminCertificatesPage');
const AdminCommunicationsPage = lazyNamed(() => import('@/features/app/AdminManagementPages'), 'AdminCommunicationsPage');

/** Keeps the surrounding layout mounted while the page chunk arrives. */
function page(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

/**
 * The participant home is `/app`, so the index route cannot simply redirect to
 * ROLE_HOME for everyone. Other roles are forwarded to their own workspace.
 */
function AppIndex() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'participant') return page(<ParticipantOverviewPage />);
  return <Navigate to={ROLE_HOME[user.role]} replace />;
}

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <PublicLayout />
      </>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: page(<HomePage />) },
      { path: 'about', element: page(<AboutPage />) },
      { path: 'how-it-works', element: page(<HowItWorksPage />) },
      { path: 'programmes', element: page(<ProgrammesPage />) },
      { path: 'programmes/:programmeId', element: page(<ProgrammeDetailPage />) },
      { path: 'virtual-exchange', element: page(<VirtualExchangePage />) },
      { path: 'impact-projects', element: page(<ImpactProjectsPage />) },
      { path: 'mentorship', element: page(<MentorshipPage />) },
      { path: 'impact', element: page(<ImpactPage />) },
      { path: 'responsible-ai', element: page(<ResponsibleAIPage />) },
      { path: 'faq', element: page(<FAQPage />) },
      { path: 'contact', element: page(<ContactPage />) },
      { path: 'privacy', element: page(<PrivacyPage />) },
      { path: 'terms', element: page(<TermsPage />) },
      { path: 'accessibility', element: page(<AccessibilityPage />) },
      { path: 'verify', element: page(<VerifyCertificatePage />) },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: 'login', element: <RequireGuest>{page(<LoginPage />)}</RequireGuest> },
      { path: 'register', element: <RequireGuest>{page(<RegisterPage />)}</RequireGuest> },
      { path: 'forgot-password', element: <RequireGuest>{page(<ForgotPasswordPage />)}</RequireGuest> },
      { path: 'reset-password', element: <RequireGuest>{page(<ResetPasswordPage />)}</RequireGuest> },
      { path: 'verify-email', element: page(<VerifyEmailPage />) },
    ],
  },
  {
    path: 'app',
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <AppIndex /> },

          /* Shared account routes */
          { path: 'profile', element: page(<ProfilePage />) },
          { path: 'notifications', element: page(<NotificationsPage />) },

          /* Participant */
          {
            element: <RequireRole roles={['participant']} />,
            children: [
              { path: 'programmes', element: page(<ParticipantProgrammesPage />) },
              { path: 'learning', element: page(<ParticipantLearningPage />) },
              { path: 'learning/:programmeId/:lessonId', element: page(<LessonPage />) },
              { path: 'team', element: page(<ParticipantTeamPage />) },
              { path: 'project', element: page(<ParticipantProjectPage />) },
              { path: 'assessments', element: page(<ParticipantAssessmentsPage />) },
              { path: 'certificates', element: page(<ParticipantCertificatesPage />) },
              { path: 'sessions', element: page(<ParticipantSessionsPage />) },
            ],
          },

          /* Facilitator */
          {
            element: <RequireRole roles={['facilitator']} />,
            children: [
              { path: 'facilitator', element: page(<FacilitatorOverviewPage />) },
              { path: 'facilitator/programmes', element: page(<FacilitatorProgrammesPage />) },
              { path: 'facilitator/content', element: page(<FacilitatorContentPage />) },
              { path: 'facilitator/cohorts', element: page(<FacilitatorCohortsPage />) },
              { path: 'facilitator/sessions', element: page(<FacilitatorSessionsPage />) },
              { path: 'facilitator/teams', element: page(<FacilitatorTeamsPage />) },
              { path: 'facilitator/assessments', element: page(<FacilitatorAssessmentsPage />) },
              { path: 'facilitator/reports', element: page(<FacilitatorReportsPage />) },
            ],
          },

          /* Mentor */
          {
            element: <RequireRole roles={['mentor']} />,
            children: [
              { path: 'mentor', element: page(<MentorOverviewPage />) },
              { path: 'mentor/teams', element: page(<MentorTeamsPage />) },
              { path: 'mentor/reviews', element: page(<MentorReviewsPage />) },
              { path: 'mentor/meetings', element: page(<MentorMeetingsPage />) },
            ],
          },

          /* University / training partner */
          {
            element: <RequireRole roles={['university']} />,
            children: [
              { path: 'university', element: page(<UniversityOverviewPage />) },
              { path: 'university/nominations', element: page(<UniversityNominationsPage />) },
              { path: 'university/cohort', element: page(<UniversityCohortPage />) },
              { path: 'university/reports', element: page(<UniversityReportsPage />) },
            ],
          },

          /* Employer */
          {
            element: <RequireRole roles={['employer']} />,
            children: [
              { path: 'employer', element: page(<EmployerOverviewPage />) },
              { path: 'employer/talent', element: page(<EmployerTalentPage />) },
              { path: 'employer/saved', element: page(<EmployerSavedPage />) },
            ],
          },

          /* Partner organisation */
          {
            element: <RequireRole roles={['partner']} />,
            children: [
              { path: 'partner', element: page(<PartnerOverviewPage />) },
              { path: 'partner/programmes', element: page(<PartnerProgrammesPage />) },
              { path: 'partner/showcase', element: page(<PartnerShowcasePage />) },
              { path: 'partner/reports', element: page(<PartnerReportsPage />) },
            ],
          },

          /* Administrator */
          {
            element: <RequireRole roles={['admin']} />,
            children: [
              { path: 'admin', element: page(<AdminOverviewPage />) },
              { path: 'admin/users', element: page(<AdminUsersPage />) },
              { path: 'admin/programmes', element: page(<AdminProgrammesPage />) },
              { path: 'admin/projects', element: page(<AdminProjectsPage />) },
              { path: 'admin/sessions', element: page(<AdminSessionsPage />) },
              { path: 'admin/assessments', element: page(<AdminAssessmentsPage />) },
              { path: 'admin/certificates', element: page(<AdminCertificatesPage />) },
              { path: 'admin/communications', element: page(<AdminCommunicationsPage />) },
              { path: 'admin/roles', element: page(<AdminRolesPage />) },
              { path: 'admin/content', element: page(<AdminContentPage />) },
              { path: 'admin/incidents', element: page(<AdminIncidentsPage />) },
              { path: 'admin/privacy', element: page(<AdminPrivacyPage />) },
              { path: 'admin/audit', element: page(<AdminAuditPage />) },
              { path: 'admin/reports', element: page(<AdminReportsPage />) },
            ],
          },
        ],
      },
    ],
  },
  { path: 'forbidden', element: <ForbiddenPage /> },
  { path: 'unauthorized', element: <UnauthorizedPage /> },
  { path: 'account-pending', element: <AccountPendingPage /> },
  { path: 'account-suspended', element: <AccountSuspendedPage /> },
  { path: 'session-expired', element: <SessionExpiredPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
