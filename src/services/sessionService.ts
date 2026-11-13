import { demoDb } from '@/lib/demoDb';
import type { ExchangeSession } from '@/types';
import { ApiError, DEMO_MODE, apiRequest, demoDelay } from './apiClient';

export const sessionService = {
  async list(): Promise<ExchangeSession[]> {
    if (DEMO_MODE) {
      return demoDelay(
        [...demoDb.getState().sessions].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
        220,
      );
    }
    return apiRequest<ExchangeSession[]>('/sessions');
  },

  async registrations(userId: string): Promise<string[]> {
    if (DEMO_MODE) {
      const registrations = demoDb.getState().sessionRegistrations;
      return demoDelay(
        Object.entries(registrations)
          .filter(([, users]) => users.includes(userId))
          .map(([sessionId]) => sessionId),
        140,
      );
    }
    return apiRequest<string[]>('/me/session-registrations');
  },

  async register(sessionId: string, userId: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/sessions/${sessionId}/registrations`, { method: 'POST' });
      return;
    }
    await demoDelay(null, 420);
    const session = demoDb.getState().sessions.find((entry) => entry.id === sessionId);
    if (!session) {
      throw new ApiError({ status: 404, code: 'SESSION_NOT_FOUND', message: 'That session could not be found.' });
    }
    if (session.status !== 'upcoming') {
      throw new ApiError({
        status: 409,
        code: 'SESSION_CLOSED',
        message: 'Registration is not available for this session.',
      });
    }
    demoDb.registerSession(sessionId, userId);
  },

  async cancel(sessionId: string, userId: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/sessions/${sessionId}/registrations`, { method: 'DELETE' });
      return;
    }
    await demoDelay(null, 380);
    demoDb.cancelSession(sessionId, userId);
  },

  async create(
    payload: Omit<ExchangeSession, 'id' | 'registeredCount' | 'status'>,
  ): Promise<ExchangeSession> {
    if (!DEMO_MODE) {
      return apiRequest<ExchangeSession>('/sessions', { method: 'POST', body: JSON.stringify(payload) });
    }
    await demoDelay(null, 520);
    if (!payload.title.trim()) {
      throw new ApiError({ status: 422, code: 'VALIDATION', message: 'A session title is required.' });
    }
    return demoDb.createSession(payload);
  },
};
