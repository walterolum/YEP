import { demoDb } from '@/lib/demoDb';
import type { Project, Submission, Team, TeamMemberRole } from '@/types';
import { ApiError, DEMO_MODE, apiRequest, demoDelay } from './apiClient';

export const teamService = {
  async listForUser(userId: string): Promise<Team[]> {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb.getState().teams.filter((team) => team.memberIds.includes(userId)),
        200,
      );
    }
    return apiRequest<Team[]>('/me/teams');
  },

  /**
   * Forms a Level Two team. The caller becomes the lead, mirroring the server
   * rule so a team is never left without someone accountable for submissions.
   */
  async create(payload: {
    programmeId: string;
    name: string;
    theme: string;
    leadId: string;
  }): Promise<Team> {
    if (!DEMO_MODE) {
      return apiRequest<Team>('/teams', {
        method: 'POST',
        body: JSON.stringify({
          programmeId: payload.programmeId,
          name: payload.name,
          theme: payload.theme,
        }),
      });
    }
    await demoDelay(null, 500);
    const state = demoDb.getState();
    const duplicate = state.teams.some(
      (team) =>
        team.programmeId === payload.programmeId &&
        team.name.trim().toLowerCase() === payload.name.trim().toLowerCase(),
    );
    if (duplicate) {
      throw new ApiError({
        status: 409,
        code: 'TEAM_NAME_TAKEN',
        message: 'Another team in this programme already uses that name.',
      });
    }
    return demoDb.createTeam(payload);
  },

  /**
   * Adds a participant by email or account id. Email keeps the flow private:
   * there is no endpoint that lists young people to search through.
   */
  async addMember(
    teamId: string,
    payload: { userId?: string; email?: string; role: TeamMemberRole },
  ): Promise<Team> {
    if (!DEMO_MODE) {
      return apiRequest<Team>(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    await demoDelay(null, 400);
    const state = demoDb.getState();
    const team = state.teams.find((entry) => entry.id === teamId);
    if (!team) {
      throw new ApiError({ status: 404, code: 'TEAM_NOT_FOUND', message: 'That team could not be found.' });
    }
    const user = payload.userId
      ? state.users.find((entry) => entry.id === payload.userId)
      : state.users.find(
          (entry) => entry.email.toLowerCase() === (payload.email ?? '').trim().toLowerCase(),
        );
    if (!user) {
      throw new ApiError({
        status: 422,
        code: 'VALIDATION',
        message: 'No participant account matches that email address.',
        fieldErrors: { email: 'No participant account uses that email address.' },
      });
    }
    if (team.memberIds.includes(user.id)) {
      throw new ApiError({
        status: 409,
        code: 'ALREADY_TEAM_MEMBER',
        message: 'That person is already on this team.',
      });
    }
    if (team.memberIds.length >= team.capacity) {
      throw new ApiError({
        status: 409,
        code: 'TEAM_FULL',
        message: `This team already has its maximum of ${team.capacity} members.`,
      });
    }
    return demoDb.addTeamMember(teamId, user.id, payload.role) ?? team;
  },

  async changeMemberRole(teamId: string, userId: string, role: TeamMemberRole): Promise<Team> {
    if (!DEMO_MODE) {
      return apiRequest<Team>(`/teams/${teamId}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    }
    await demoDelay(null, 300);
    const updated = demoDb.changeTeamMemberRole(teamId, userId, role);
    if (!updated) {
      throw new ApiError({ status: 404, code: 'TEAM_NOT_FOUND', message: 'That team could not be found.' });
    }
    return updated;
  },

  async removeMember(teamId: string, userId: string): Promise<Team> {
    if (!DEMO_MODE) {
      return apiRequest<Team>(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
    }
    await demoDelay(null, 300);
    const updated = demoDb.removeTeamMember(teamId, userId);
    if (!updated) {
      throw new ApiError({ status: 404, code: 'TEAM_NOT_FOUND', message: 'That team could not be found.' });
    }
    return updated;
  },

  async listForMentor(mentorId: string): Promise<Team[]> {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb.getState().teams.filter((team) => team.mentorId === mentorId),
        200,
      );
    }
    return apiRequest<Team[]>('/mentor/teams');
  },

  async get(teamId: string): Promise<Team> {
    if (DEMO_MODE) {
      const team = demoDb.getState().teams.find((entry) => entry.id === teamId);
      if (!team) throw new ApiError({ status: 404, code: 'TEAM_NOT_FOUND', message: 'That team could not be found.' });
      return demoDelay(team, 180);
    }
    return apiRequest<Team>(`/teams/${teamId}`);
  },

  async postMessage(teamId: string, authorId: string, body: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/teams/${teamId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      return;
    }
    await demoDelay(null, 300);
    demoDb.postTeamMessage(teamId, authorId, body);
  },
};

export const projectService = {
  async getByTeam(teamId: string): Promise<Project> {
    if (DEMO_MODE) {
      const project = demoDb.getState().projects.find((entry) => entry.teamId === teamId);
      if (!project) throw new ApiError({ status: 404, code: 'PROJECT_NOT_FOUND', message: 'No project is linked to this team.' });
      return demoDelay(project, 200);
    }
    return apiRequest<Project>(`/teams/${teamId}/project`);
  },

  /** Creates the single Impact Project owned by a Level Two team. */
  async create(
    teamId: string,
    payload: { title: string; problem: string; theme: string; summary: string; objectives: string[] },
  ): Promise<Project> {
    if (!DEMO_MODE) {
      return apiRequest<Project>(`/teams/${teamId}/project`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    await demoDelay(null, 550);
    const state = demoDb.getState();
    if (state.projects.some((project) => project.teamId === teamId)) {
      throw new ApiError({
        status: 409,
        code: 'PROJECT_EXISTS',
        message: 'This team already has an Impact Project.',
      });
    }
    const project = demoDb.createProject(teamId, payload);
    if (!project) {
      throw new ApiError({ status: 404, code: 'TEAM_NOT_FOUND', message: 'That team could not be found.' });
    }
    return project;
  },

  async updateMilestone(teamId: string, milestoneId: string, status: Project['milestones'][number]['status']) {
    if (!DEMO_MODE) {
      return apiRequest(`/teams/${teamId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
    await demoDelay(null, 380);
    demoDb.updateMilestone(teamId, milestoneId, status);
  },

  async submitEvidence(
    teamId: string,
    milestoneId: string,
    fileName: string,
    note: string,
    userId: string,
    file?: File,
  ): Promise<Submission> {
    if (!DEMO_MODE) {
      const body = new FormData();
      body.append('note', note);
      if (file) body.append('file', file, fileName);
      return apiRequest<Submission>(`/teams/${teamId}/milestones/${milestoneId}/evidence`, {
        method: 'POST',
        body,
      });
    }
    await demoDelay(null, 650);
    if (!fileName) {
      throw new ApiError({ status: 422, code: 'FILE_REQUIRED', message: 'Select a file before submitting.' });
    }
    return demoDb.submitEvidence(teamId, milestoneId, fileName, note, userId);
  },

  async reviewSubmission(
    submissionId: string,
    reviewerId: string,
    payload: { status: 'approved' | 'revision'; score?: number; feedback: string },
  ): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/submissions/${submissionId}/review`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return;
    }
    await demoDelay(null, 550);
    demoDb.reviewSubmission(submissionId, reviewerId, payload);
  },
};

export const mentorService = {
  async listFeedback(mentorId: string) {
    if (DEMO_MODE) {
      const state = demoDb.getState();
      const teamIds = state.teams.filter((team) => team.mentorId === mentorId).map((team) => team.id);
      return demoDelay(
        state.mentorFeedback.filter((feedback) => teamIds.includes(feedback.teamId)),
        180,
      );
    }
    return apiRequest('/mentor/feedback');
  },

  async addFeedback(teamId: string, authorId: string, body: string, milestoneId?: string) {
    if (!DEMO_MODE) {
      return apiRequest('/mentor/feedback', {
        method: 'POST',
        body: JSON.stringify({ teamId, body, milestoneId }),
      });
    }
    await demoDelay(null, 400);
    demoDb.addMentorFeedback(teamId, authorId, body, milestoneId);
  },
};
