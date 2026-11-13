import { demoDb } from '@/lib/demoDb';
import type { ContentStatus, LearningModule, Programme } from '@/types';
import { ApiError, DEMO_MODE, apiRequest, demoDelay } from './apiClient';

/**
 * Facilitator-facing operations. In production these map to the Spring Boot
 * endpoints documented in README.md; in demo mode they mutate the browser store.
 */
export const facilitatorService = {
  async listProgrammes(facilitatorId: string): Promise<Programme[]> {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb.getState().programmes.filter((programme) => programme.facilitatorId === facilitatorId),
        200,
      );
    }
    return apiRequest<Programme[]>('/facilitator/programmes');
  },

  async createProgramme(
    payload: Omit<Programme, 'id' | 'enrolledCount' | 'moduleCount' | 'facilitatorId'>,
    facilitatorId: string,
  ): Promise<Programme> {
    if (!DEMO_MODE) {
      return apiRequest<Programme>('/facilitator/programmes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    await demoDelay(null, 520);
    if (!payload.title.trim()) {
      throw new ApiError({ status: 422, code: 'VALIDATION', message: 'A programme title is required.' });
    }
    return demoDb.createProgramme(payload, facilitatorId);
  },

  async updateModuleStatus(moduleId: string, status: ContentStatus): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/facilitator/modules/${moduleId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return;
    }
    await demoDelay(null, 380);
    demoDb.updateModuleStatus(moduleId, status);
  },

  async listModules(): Promise<LearningModule[]> {
    if (DEMO_MODE) {
      return demoDelay(
        [...demoDb.getState().modules].sort((a, b) => a.order - b.order),
        200,
      );
    }
    return apiRequest<LearningModule[]>('/facilitator/modules');
  },

  async assignMentor(teamId: string, mentorId: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/facilitator/teams/${teamId}/mentor`, {
        method: 'PATCH',
        body: JSON.stringify({ mentorId }),
      });
      return;
    }
    await demoDelay(null, 420);
    demoDb.assignMentor(teamId, mentorId);
  },

  async gradeAssessment(assessmentId: string, score: number, feedback: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/facilitator/assessments/${assessmentId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ score, feedback }),
      });
      return;
    }
    await demoDelay(null, 480);
    demoDb.gradeAssessment(assessmentId, score, feedback);
  },
};
