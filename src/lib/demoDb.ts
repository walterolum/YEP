import { createDemoState, type DemoState } from '@/lib/demoData';
import type {
  Announcement,
  AppNotification,
  AssignmentSubmission,
  Certificate,
  ExchangeSession,
  Incident,
  MilestoneStatus,
  Nomination,
  PrivacyRequest,
  Programme,
  Project,
  Role,
  Submission,
  Team,
  TeamMemberRole,
  User,
} from '@/types';

const STORAGE_KEY = 'yep.demo.state.v1';

function loadState(): DemoState {
  if (typeof window === 'undefined') return createDemoState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDemoState();
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed.users || !parsed.programmes) return createDemoState();
    return parsed;
  } catch {
    return createDemoState();
  }
}

let state: DemoState = loadState();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private browsing. The demo still works in memory.
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function update(updater: (draft: DemoState) => DemoState) {
  state = updater(state);
  persist();
  emit();
}

export function subscribeDemo(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoState(): DemoState {
  return state;
}

export function resetDemoData() {
  state = createDemoState();
  persist();
  emit();
}

export function clearDemoStorage() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function getProgressKey(userId: string, programmeId: string) {
  return `${userId}:${programmeId}`;
}

export const demoDb = {
  getState: getDemoState,

  enrol(programmeId: string, userId: string) {
    update((draft) => {
      const existing = draft.enrolments.find((item) => item.programmeId === programmeId && item.userId === userId);
      if (existing) return draft;
      const programme = draft.programmes.find((item) => item.id === programmeId);
      if (!programme) return draft;
      draft.enrolments.push({
        id: `en-${Date.now()}`,
        programmeId,
        userId,
        status: programme.status === 'waitlist' ? 'waitlisted' : 'active',
        progress: 0,
        enrolledAt: new Date().toISOString(),
      });
      draft.programmes = draft.programmes.map((item) =>
        item.id === programmeId ? { ...item, enrolledCount: item.enrolledCount + 1 } : item,
      );
      return { ...draft };
    });
  },

  completeLesson(programmeId: string, userId: string, lessonId: string) {
    update((draft) => {
      const key = getProgressKey(userId, programmeId);
      const completed = new Set(draft.progress[key] ?? []);
      completed.add(lessonId);
      draft.progress[key] = Array.from(completed);

      const programmeModules = draft.modules.filter((module) => module.programmeId === programmeId);
      const total = programmeModules.reduce((sum, module) => sum + module.lessons.length, 0);
      const nextProgress = total ? Math.round((completed.size / total) * 100) : 0;
      draft.enrolments = draft.enrolments.map((enrolment) =>
        enrolment.userId === userId && enrolment.programmeId === programmeId
          ? { ...enrolment, progress: nextProgress, lastLessonId: lessonId }
          : enrolment,
      );
      return { ...draft };
    });
  },

  registerSession(sessionId: string, userId: string) {
    update((draft) => {
      const registered = draft.sessionRegistrations[sessionId] ?? [];
      if (registered.includes(userId)) return draft;
      draft.sessionRegistrations[sessionId] = [...registered, userId];
      draft.sessions = draft.sessions.map((session) =>
        session.id === sessionId ? { ...session, registeredCount: session.registeredCount + 1 } : session,
      );
      return { ...draft };
    });
  },

  cancelSession(sessionId: string, userId: string) {
    update((draft) => {
      const registered = draft.sessionRegistrations[sessionId] ?? [];
      if (!registered.includes(userId)) return draft;
      draft.sessionRegistrations[sessionId] = registered.filter((id) => id !== userId);
      draft.sessions = draft.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, registeredCount: Math.max(0, session.registeredCount - 1) }
          : session,
      );
      return { ...draft };
    });
  },

  createSession(payload: Omit<ExchangeSession, 'id' | 'registeredCount' | 'status'>) {
    const session: ExchangeSession = {
      ...payload,
      id: `ses-${Date.now()}`,
      registeredCount: 0,
      status: 'upcoming',
    };
    update((draft) => ({ ...draft, sessions: [session, ...draft.sessions] }));
    return session;
  },

  postTeamMessage(teamId: string, authorId: string, body: string) {
    update((draft) => {
      draft.teams = draft.teams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              messages: [
                ...team.messages,
                { id: `msg-${Date.now()}`, authorId, body, sentAt: new Date().toISOString() },
              ],
            }
          : team,
      );
      return { ...draft };
    });
  },

  updateMilestone(teamId: string, milestoneId: string, status: MilestoneStatus) {
    update((draft) => {
      draft.projects = draft.projects.map((project) =>
        project.teamId === teamId
          ? {
              ...project,
              milestones: project.milestones.map((milestone) =>
                milestone.id === milestoneId
                  ? { ...milestone, status, updatedAt: new Date().toISOString() }
                  : milestone,
              ),
            }
          : project,
      );
      return { ...draft };
    });
  },

  createTeam(payload: {
    programmeId: string;
    name: string;
    theme: string;
    leadId: string;
    capacity?: number;
  }): Team {
    const lead = state.users.find((user) => user.id === payload.leadId);
    const now = new Date().toISOString();
    const team: Team = {
      id: `team-${Date.now()}`,
      name: payload.name.trim(),
      theme: payload.theme,
      programmeId: payload.programmeId,
      mentorId: '',
      memberIds: [payload.leadId],
      members: lead ? [{ userId: lead.id, fullName: lead.name, role: 'lead', joinedAt: now }] : [],
      projectId: '',
      capacity: payload.capacity ?? 5,
      createdAt: now,
      messages: [],
    };
    update((draft) => ({ ...draft, teams: [team, ...draft.teams] }));
    return team;
  },

  addTeamMember(teamId: string, userId: string, role: TeamMemberRole): Team | undefined {
    const user = state.users.find((entry) => entry.id === userId);
    let updated: Team | undefined;
    update((draft) => {
      draft.teams = draft.teams.map((team) => {
        if (team.id !== teamId || !user || team.memberIds.includes(userId)) return team;
        if (team.memberIds.length >= team.capacity) return team;
        updated = {
          ...team,
          memberIds: [...team.memberIds, userId],
          members: [
            ...(team.members ?? []),
            { userId, fullName: user.name, role, joinedAt: new Date().toISOString() },
          ],
        };
        return updated;
      });
      return { ...draft };
    });
    return updated;
  },

  changeTeamMemberRole(teamId: string, userId: string, role: TeamMemberRole): Team | undefined {
    let updated: Team | undefined;
    update((draft) => {
      draft.teams = draft.teams.map((team) => {
        if (team.id !== teamId) return team;
        updated = {
          ...team,
          members: (team.members ?? []).map((member) =>
            member.userId === userId ? { ...member, role } : member,
          ),
        };
        return updated;
      });
      return { ...draft };
    });
    return updated;
  },

  removeTeamMember(teamId: string, userId: string): Team | undefined {
    let updated: Team | undefined;
    update((draft) => {
      draft.teams = draft.teams.map((team) => {
        if (team.id !== teamId) return team;
        updated = {
          ...team,
          memberIds: team.memberIds.filter((id) => id !== userId),
          members: (team.members ?? []).filter((member) => member.userId !== userId),
        };
        return updated;
      });
      return { ...draft };
    });
    return updated;
  },

  createProject(
    teamId: string,
    payload: { title: string; problem: string; theme: string; summary: string; objectives: string[] },
  ): Project | undefined {
    const team = state.teams.find((entry) => entry.id === teamId);
    if (!team) return undefined;
    const project: Project = {
      id: `proj-${Date.now()}`,
      teamId,
      title: payload.title.trim(),
      problem: payload.problem.trim(),
      theme: payload.theme,
      summary: payload.summary.trim(),
      objectives: payload.objectives.filter((objective) => objective.trim().length > 0),
      status: 'draft',
      milestones: [],
      resources: [],
    };
    update((draft) => ({
      ...draft,
      projects: [project, ...draft.projects],
      teams: draft.teams.map((entry) =>
        entry.id === teamId ? { ...entry, projectId: project.id } : entry,
      ),
    }));
    return project;
  },

  submitEvidence(teamId: string, milestoneId: string, fileName: string, note: string, userId: string) {
    const project = state.projects.find((item) => item.teamId === teamId);
    const milestone = project?.milestones.find((item) => item.id === milestoneId);
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      projectId: project?.id ?? '',
      teamId,
      milestoneId,
      title: milestone?.title ?? 'Milestone evidence',
      fileName,
      note,
      submittedAt: new Date().toISOString(),
      submittedBy: userId,
      status: 'submitted',
      reviewerId: state.teams.find((team) => team.id === teamId)?.mentorId,
      maxScore: 20,
    };
    update((draft) => {
      draft.projects = draft.projects.map((item) =>
        item.teamId === teamId
          ? {
              ...item,
              milestones: item.milestones.map((entry) =>
                entry.id === milestoneId
                  ? { ...entry, status: 'submitted', evidence: fileName, updatedAt: new Date().toISOString() }
                  : entry,
              ),
            }
          : item,
      );
      draft.submissions = [submission, ...draft.submissions];
      draft.notifications = [
        {
          id: `not-${Date.now()}`,
          userId: submission.reviewerId ?? 'u-grace',
          title: 'New milestone evidence',
          body: `${state.teams.find((team) => team.id === teamId)?.name ?? 'A team'} submitted ${submission.title}.`,
          createdAt: new Date().toISOString(),
          read: false,
          href: '/app/mentor/reviews',
          kind: 'feedback',
        },
        ...draft.notifications,
      ];
      return { ...draft };
    });
    return submission;
  },

  reviewSubmission(
    submissionId: string,
    reviewerId: string,
    payload: { status: 'approved' | 'revision'; score?: number; feedback: string },
  ) {
    update((draft) => {
      const submission = draft.submissions.find((item) => item.id === submissionId);
      if (!submission) return draft;
      draft.submissions = draft.submissions.map((item) =>
        item.id === submissionId
          ? {
              ...item,
              status: payload.status,
              score: payload.score,
              feedback: payload.feedback,
              reviewerId,
              revisionRequested: payload.status === 'revision' ? payload.feedback : undefined,
            }
          : item,
      );
      draft.projects = draft.projects.map((project) =>
        project.id === submission.projectId
          ? {
              ...project,
              milestones: project.milestones.map((milestone) =>
                milestone.id === submission.milestoneId
                  ? {
                      ...milestone,
                      status: payload.status === 'approved' ? 'approved' : 'revision',
                      feedback: payload.feedback,
                      updatedAt: new Date().toISOString(),
                    }
                  : milestone,
              ),
            }
          : project,
      );
      draft.mentorFeedback = [
        {
          id: `fb-${Date.now()}`,
          teamId: submission.teamId,
          authorId: reviewerId,
          milestoneId: submission.milestoneId,
          body: payload.feedback,
          createdAt: new Date().toISOString(),
          resolved: payload.status === 'approved',
        },
        ...draft.mentorFeedback,
      ];
      const team = draft.teams.find((item) => item.id === submission.teamId);
      draft.notifications = [
        ...(team?.memberIds.map((memberId) => ({
          id: `not-${Date.now()}-${memberId}`,
          userId: memberId,
          title: payload.status === 'approved' ? 'Milestone approved' : 'Revision requested',
          body: `${submission.title} has been reviewed. ${payload.feedback.slice(0, 110)}`,
          createdAt: new Date().toISOString(),
          read: false,
          href: '/app/project',
          kind: 'feedback' as const,
        })) ?? []),
        ...draft.notifications,
      ];
      return { ...draft };
    });
  },

  submitAssessment(assessmentId: string, userId: string, text: string) {
    update((draft) => {
      draft.assessments = draft.assessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, status: 'submitted', submittedAt: new Date().toISOString() }
          : assessment,
      );
      draft.assessmentSubmissions[assessmentId] = {
        userId,
        submittedAt: new Date().toISOString(),
        text,
      };
      return { ...draft };
    });
  },

  addMentorFeedback(teamId: string, authorId: string, body: string, milestoneId?: string) {
    update((draft) => {
      draft.mentorFeedback = [
        {
          id: `fb-${Date.now()}`,
          teamId,
          authorId,
          milestoneId,
          body,
          createdAt: new Date().toISOString(),
          resolved: false,
        },
        ...draft.mentorFeedback,
      ];
      return { ...draft };
    });
  },

  createNomination(payload: Omit<Nomination, 'id' | 'status' | 'nominatedAt'>) {
    update((draft) => {
      draft.nominations = [
        {
          ...payload,
          id: `nom-${Date.now()}`,
          status: 'nominated',
          nominatedAt: new Date().toISOString(),
        },
        ...draft.nominations,
      ];
      return { ...draft };
    });
  },

  setUserStatus(userId: string, status: User['status']) {
    update((draft) => {
      draft.users = draft.users.map((user) => (user.id === userId ? { ...user, status } : user));
      return { ...draft };
    });
  },

  updateIncident(id: string, patch: Partial<Pick<Incident, 'status' | 'severity' | 'assignedTo'>>, note?: string) {
    update((draft) => {
      draft.incidents = draft.incidents.map((incident) => {
        if (incident.id !== id) return incident;
        return {
          ...incident,
          ...patch,
          notes: note
            ? [...incident.notes, { author: 'Peter Ssemakula', body: note, at: new Date().toISOString() }]
            : incident.notes,
          actions: [
            ...incident.actions,
            {
              action: `Status set to ${patch.status ?? incident.status}`,
              actor: 'Peter Ssemakula',
              at: new Date().toISOString(),
            },
          ],
        };
      });
      return { ...draft };
    });
  },

  updatePrivacyRequest(id: string, status: PrivacyRequest['status'], note?: string) {
    update((draft) => {
      draft.privacyRequests = draft.privacyRequests.map((request) =>
        request.id === id
          ? { ...request, status, note: note ? `${request.note}\n${note}` : request.note }
          : request,
      );
      return { ...draft };
    });
  },

  updateProfile(userId: string, patch: Partial<User>) {
    update((draft) => {
      draft.users = draft.users.map((user) => (user.id === userId ? { ...user, ...patch } : user));
      return { ...draft };
    });
  },

  markNotificationRead(id: string) {
    update((draft) => {
      draft.notifications = draft.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      );
      return { ...draft };
    });
  },

  markAllNotificationsRead(userId: string) {
    update((draft) => {
      draft.notifications = draft.notifications.map((notification) =>
        notification.userId === userId ? { ...notification, read: true } : notification,
      );
      return { ...draft };
    });
  },

  addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    update((draft) => {
      draft.notifications = [
        { ...notification, id: `not-${Date.now()}`, createdAt: new Date().toISOString(), read: false },
        ...draft.notifications,
      ];
      return { ...draft };
    });
  },

  toggleSavedTalent(userId: string) {
    update((draft) => {
      draft.savedTalent = draft.savedTalent.includes(userId)
        ? draft.savedTalent.filter((id) => id !== userId)
        : [...draft.savedTalent, userId];
      return { ...draft };
    });
  },

  requestIntroduction(employerId: string, talentUserId: string, note: string) {
    const employer = state.users.find((entry) => entry.id === employerId);
    update((draft) => {
      draft.notifications = [
        {
          id: `not-${Date.now()}`,
          userId: talentUserId,
          title: 'Employer introduction request',
          body: `${employer?.organization ?? 'An employer'} would like to discuss an opportunity. ${note}`.trim(),
          createdAt: new Date().toISOString(),
          read: false,
          href: '/app/notifications',
          kind: 'system',
        },
        ...draft.notifications,
      ];
      return { ...draft };
    });
  },

  requestProgrammeBriefing(partnerId: string, programmeId: string, note: string) {
    const partner = state.users.find((entry) => entry.id === partnerId);
    const programme = state.programmes.find((entry) => entry.id === programmeId);
    update((draft) => {
      draft.notifications = [
        {
          id: `not-${Date.now()}`,
          userId: 'u-admin',
          title: 'Partner programme briefing request',
          body: `${partner?.organization ?? 'A partner'} requested a briefing on ${programme?.title ?? 'a programme'}. ${note}`.trim(),
          createdAt: new Date().toISOString(),
          read: false,
          href: '/app/admin',
          kind: 'system',
        },
        ...draft.notifications,
      ];
      return { ...draft };
    });
  },

  updateModuleStatus(moduleId: string, status: 'draft' | 'published' | 'archived') {
    update((draft) => {
      draft.modules = draft.modules.map((module) => (module.id === moduleId ? { ...module, status } : module));
      return { ...draft };
    });
  },

  assignMentor(teamId: string, mentorId: string) {
    update((draft) => {
      draft.teams = draft.teams.map((team) => (team.id === teamId ? { ...team, mentorId } : team));
      return { ...draft };
    });
  },

  gradeAssessment(assessmentId: string, score: number, feedback: string) {
    update((draft) => {
      draft.assessments = draft.assessments.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, status: 'graded', score, feedback, submittedAt: assessment.submittedAt ?? new Date().toISOString() }
          : assessment,
      );
      return { ...draft };
    });
  },

  createProgramme(
    payload: Omit<Programme, 'id' | 'enrolledCount' | 'moduleCount' | 'facilitatorId'>,
    facilitatorId: string,
  ) {
    const programme: Programme = {
      ...payload,
      id: `prog-${Date.now()}`,
      enrolledCount: 0,
      moduleCount: 0,
      facilitatorId,
    };
    update((draft) => ({ ...draft, programmes: [programme, ...draft.programmes] }));
    return programme;
  },

  addUser(user: User) {
    update((draft) => {
      if (draft.users.some((entry) => entry.email.toLowerCase() === user.email.toLowerCase())) return draft;
      draft.users = [user, ...draft.users];
      return { ...draft };
    });
  },

  assignRole(userId: string, role: Role) {
    update((draft) => {
      draft.users = draft.users.map((user) => (user.id === userId ? { ...user, role } : user));
      return { ...draft };
    });
  },

  approveRegistration(userId: string) {
    update((draft) => {
      draft.users = draft.users.map((user) => (user.id === userId ? { ...user, status: 'active' } : user));
      draft.notifications = [
        {
          id: `not-${Date.now()}`,
          userId,
          title: 'Account Approved',
          body: 'Your registration has been approved by an administrator. Welcome to YEP! You can now enrol in programmes.',
          createdAt: new Date().toISOString(),
          read: false,
          href: '/app/programmes',
          kind: 'approval',
        },
        ...draft.notifications,
      ];
      return { ...draft };
    });
  },

  rejectRegistration(userId: string) {
    update((draft) => {
      draft.users = draft.users.map((user) => (user.id === userId ? { ...user, status: 'rejected' } : user));
      return { ...draft };
    });
  },

  suspendAccount(userId: string) {
    update((draft) => {
      draft.users = draft.users.map((user) => (user.id === userId ? { ...user, status: 'suspended' } : user));
      return { ...draft };
    });
  },

  activateAccount(userId: string) {
    update((draft) => {
      draft.users = draft.users.map((user) => (user.id === userId ? { ...user, status: 'active' } : user));
      return { ...draft };
    });
  },

  enrolParticipant(userId: string, programmeId: string) {
    update((draft) => {
      const existing = draft.enrolments.find((e) => e.userId === userId && e.programmeId === programmeId);
      if (existing) return draft;
      const newEnrolment = {
        id: `enr-${Date.now()}`,
        userId,
        programmeId,
        status: 'active' as const,
        progress: 0,
        enrolledAt: new Date().toISOString(),
      };
      draft.enrolments = [newEnrolment, ...draft.enrolments];
      draft.programmes = draft.programmes.map((p) =>
        p.id === programmeId ? { ...p, enrolledCount: p.enrolledCount + 1 } : p,
      );
      draft.notifications = [
        {
          id: `not-${Date.now()}`,
          userId,
          title: 'Enrolment Confirmed',
          body: `You are now enrolled in ${draft.programmes.find((p) => p.id === programmeId)?.title ?? 'the programme'}. Access your learning modules now.`,
          createdAt: new Date().toISOString(),
          read: false,
          href: '/app/learning',
          kind: 'session',
        },
        ...draft.notifications,
      ];
      return { ...draft };
    });
  },

  issueCertificate(programmeId: string, participantId: string) {
    const code = `YEP-${Math.floor(100000 + Math.random() * 900000)}`;
    update((draft) => {
      const prog = draft.programmes.find((p) => p.id === programmeId);
      const user = draft.users.find((u) => u.id === participantId);
      const existing = draft.certificates.find((c) => c.programmeId === programmeId && c.participantId === participantId);
      if (existing) {
        draft.certificates = draft.certificates.map((c) =>
          c.id === existing.id ? { ...c, status: 'valid', issueDate: new Date().toISOString().slice(0, 10) } : c,
        );
        return { ...draft };
      }
      const cert: Certificate = {
        id: `cert-${Date.now()}`,
        programmeId,
        programmeTitle: prog?.title ?? 'Digital Empowerment Programme',
        level: prog?.level ?? 1,
        participantId,
        participantName: user?.name ?? 'Learner',
        code,
        status: 'valid',
        issueDate: new Date().toISOString().slice(0, 10),
        verificationNote: 'Issued with verified completion of Level One Virtual Exchange curriculum and assessments.',
      };
      draft.certificates = [cert, ...draft.certificates];
      draft.notifications = [
        {
          id: `not-${Date.now()}`,
          userId: participantId,
          title: 'Certificate Issued!',
          body: `Congratulations! Your certificate for ${cert.programmeTitle} is now available to download. Code: ${code}`,
          createdAt: new Date().toISOString(),
          read: false,
          href: '/app/certificates',
          kind: 'approval',
        },
        ...draft.notifications,
      ];
      return { ...draft };
    });
    return code;
  },

  addAnnouncement(announcement: Omit<Announcement, 'id' | 'publishedAt'>) {
    update((draft) => {
      const newAnn: Announcement = {
        ...announcement,
        id: `ann-${Date.now()}`,
        publishedAt: new Date().toISOString(),
      };
      draft.announcements = [newAnn, ...(draft.announcements ?? [])];
      return { ...draft };
    });
  },

  addDiscussionMessage(discussionId: string, authorId: string, authorName: string, authorRole: Role, message: string) {
    update((draft) => {
      draft.discussions = (draft.discussions ?? []).map((d) =>
        d.id === discussionId
          ? {
              ...d,
              messages: [
                ...d.messages,
                {
                  id: `msg-${Date.now()}`,
                  discussionId,
                  authorId,
                  authorName,
                  authorRole,
                  message,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : d,
      );
      return { ...draft };
    });
  },

  submitAssignment(assignmentId: string, userId: string, submissionText: string) {
    update((draft) => {
      const newSub: AssignmentSubmission = {
        id: `asub-${Date.now()}`,
        assignmentId,
        userId,
        submissionText,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };
      draft.assignmentSubmissionsList = [newSub, ...(draft.assignmentSubmissionsList ?? []).filter((s) => !(s.assignmentId === assignmentId && s.userId === userId))];
      return { ...draft };
    });
  },

  gradeAssignment(submissionId: string, pointsAwarded: number, feedback: string, gradedBy: string) {
    update((draft) => {
      draft.assignmentSubmissionsList = (draft.assignmentSubmissionsList ?? []).map((s) =>
        s.id === submissionId
          ? { ...s, status: 'graded', pointsAwarded, feedback, gradedBy, gradedAt: new Date().toISOString() }
          : s,
      );
      return { ...draft };
    });
  },
};
