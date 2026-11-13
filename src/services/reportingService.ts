import { demoDb } from '@/lib/demoDb';
import type { CohortMember } from '@/types';
import { DEMO_MODE, apiRequest, demoDelay } from './apiClient';

function deterministicAttendance(userId: string, programmeId: string) {
  const seed = `${userId}${programmeId}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 58 + (seed % 43);
}

export const reportingService = {
  async getCohortMembers(): Promise<CohortMember[]> {
    if (DEMO_MODE) {
      const state = demoDb.getState();
      const members = state.enrolments.map((enrolment) => ({
        userId: enrolment.userId,
        enrolmentId: enrolment.id,
        programmeId: enrolment.programmeId,
        progress: enrolment.progress,
        attendance: deterministicAttendance(enrolment.userId, enrolment.programmeId),
        completion:
          enrolment.progress >= 100
            ? ('completed' as const)
            : enrolment.progress === 0
              ? ('not_started' as const)
              : enrolment.progress < 35
                ? ('at_risk' as const)
                : ('on_track' as const),
        enrolledAt: enrolment.enrolledAt,
      }));
      return demoDelay(members, 200);
    }
    return apiRequest<CohortMember[]>('/reports/cohort-members');
  },

  async getProgrammeParticipation() {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb.getState().programmes.map((programme) => ({
          id: programme.id,
          name: programme.title,
          shortName: programme.title.split(' ').slice(0, 2).join(' '),
          enrolled: programme.enrolledCount,
          capacity: programme.capacity,
          level: programme.level,
        })),
        200,
      );
    }
    return apiRequest('/reports/programme-participation');
  },

  async getAttendance() {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb.getState().sessions.map((session) => ({
          id: session.id,
          name: session.title,
          registered: session.registeredCount,
          capacity: session.capacity,
          status: session.status,
        })),
        180,
      );
    }
    return apiRequest('/reports/attendance');
  },

  async getCompletionBuckets() {
    if (DEMO_MODE) {
      const state = demoDb.getState();
      const buckets = [
        { label: '0–25%', min: 0, max: 25, learners: 0 },
        { label: '26–50%', min: 26, max: 50, learners: 0 },
        { label: '51–75%', min: 51, max: 75, learners: 0 },
        { label: '76–100%', min: 76, max: 100, learners: 0 },
      ];
      state.enrolments.forEach((enrolment) => {
        const bucket = buckets.find((entry) => enrolment.progress >= entry.min && enrolment.progress <= entry.max);
        if (bucket) bucket.learners += 1;
      });
      return demoDelay(buckets, 180);
    }
    return apiRequest('/reports/completion-buckets');
  },

  async getFacilitatorSummary() {
    if (DEMO_MODE) {
      const state = demoDb.getState();
      const activeProgrammes = state.programmes.filter((programme) => programme.status !== 'closed').length;
      const pendingReviews = state.submissions.filter(
        (submission) => submission.status === 'submitted' || submission.status === 'under_review',
      ).length;
      const activeTeams = state.teams.length;
      const averageCompletion = Math.round(
        state.enrolments.reduce((sum, enrolment) => sum + enrolment.progress, 0) /
          Math.max(1, state.enrolments.length),
      );
      return demoDelay(
        { activeProgrammes, pendingReviews, activeTeams, averageCompletion },
        180,
      );
    }
    return apiRequest('/reports/facilitator-summary');
  },

  async getAdminSummary() {
    if (DEMO_MODE) {
      const state = demoDb.getState();
      return demoDelay(
        {
          users: state.users.length,
          activeProgrammes: state.programmes.filter((programme) => programme.status !== 'closed').length,
          activeCohorts: new Set(state.enrolments.map((enrolment) => enrolment.programmeId)).size,
          pendingApprovals:
            state.nominations.filter((nomination) => nomination.status === 'nominated').length +
            state.privacyRequests.filter((request) => request.status !== 'completed').length,
          openIncidents: state.incidents.filter((incident) => incident.status !== 'resolved').length,
          certificatesIssued: state.certificates.filter((certificate) => certificate.status === 'valid').length,
        },
        180,
      );
    }
    return apiRequest('/admin/summary');
  },
};
