import { demoDb } from '@/lib/demoDb';
import type { Enrolment, LearningModule, Programme } from '@/types';
import { ApiError, DEMO_MODE, apiRequest, demoDelay } from './apiClient';

export const programmeService = {
  async list(): Promise<Programme[]> {
    if (DEMO_MODE) return demoDelay(demoDb.getState().programmes, 240);
    return apiRequest<Programme[]>('/programmes');
  },

  async get(id: string): Promise<Programme> {
    if (DEMO_MODE) {
      const programme = demoDb.getState().programmes.find((entry) => entry.id === id);
      if (!programme) {
        throw new ApiError({ status: 404, code: 'PROGRAMME_NOT_FOUND', message: 'That programme could not be found.' });
      }
      return demoDelay(programme, 220);
    }
    return apiRequest<Programme>(`/programmes/${id}`);
  },

  async enrol(programmeId: string, userId: string): Promise<Enrolment> {
    if (!DEMO_MODE) {
      return apiRequest<Enrolment>(`/programmes/${programmeId}/enrolments`, { method: 'POST' });
    }
    await demoDelay(null, 500);
    const programme = demoDb.getState().programmes.find((entry) => entry.id === programmeId);
    if (!programme) {
      throw new ApiError({ status: 404, code: 'PROGRAMME_NOT_FOUND', message: 'That programme could not be found.' });
    }
    if (programme.status === 'closed') {
      throw new ApiError({
        status: 409,
        code: 'ENROLMENT_CLOSED',
        message: 'Enrolment for this programme is closed.',
      });
    }
    demoDb.enrol(programmeId, userId);
    const enrolment = demoDb
      .getState()
      .enrolments.find((entry) => entry.programmeId === programmeId && entry.userId === userId);
    if (!enrolment) {
      throw new ApiError({ status: 500, code: 'ENROLMENT_FAILED', message: 'Enrolment could not be completed.' });
    }
    return enrolment;
  },

  async getEnrolments(userId: string): Promise<Enrolment[]> {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb.getState().enrolments.filter((entry) => entry.userId === userId),
        180,
      );
    }
    return apiRequest<Enrolment[]>('/me/enrolments');
  },
};

export const learningService = {
  async getModules(programmeId: string): Promise<LearningModule[]> {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb
          .getState()
          .modules.filter((module) => module.programmeId === programmeId)
          .sort((a, b) => a.order - b.order),
        220,
      );
    }
    return apiRequest<LearningModule[]>(`/programmes/${programmeId}/modules`);
  },

  async getProgress(userId: string, programmeId: string): Promise<string[]> {
    if (DEMO_MODE) {
      return demoDelay(demoDb.getState().progress[`${userId}:${programmeId}`] ?? [], 150);
    }
    return apiRequest<string[]>(`/me/progress?programmeId=${encodeURIComponent(programmeId)}`);
  },

  async completeLesson(programmeId: string, lessonId: string, userId: string): Promise<{ completedLessonIds: string[] }> {
    if (!DEMO_MODE) {
      return apiRequest<{ completedLessonIds: string[] }>(
        `/programmes/${programmeId}/lessons/${lessonId}/complete`,
        { method: 'POST' },
      );
    }
    await demoDelay(null, 380);
    demoDb.completeLesson(programmeId, userId, lessonId);
    return { completedLessonIds: demoDb.getState().progress[`${userId}:${programmeId}`] ?? [] };
  },
};

export const userService = {
  async getProfile(userId: string) {
    if (DEMO_MODE) {
      return demoDelay(demoDb.getState().users.find((entry) => entry.id === userId) ?? null, 150);
    }
    return apiRequest(`/me`);
  },

  async updateProfile(userId: string, patch: Record<string, unknown>) {
    if (!DEMO_MODE) {
      return apiRequest(`/me`, { method: 'PATCH', body: JSON.stringify(patch) });
    }
    await demoDelay(null, 450);
    demoDb.updateProfile(userId, patch);
    return demoDb.getState().users.find((entry) => entry.id === userId) ?? null;
  },
};
