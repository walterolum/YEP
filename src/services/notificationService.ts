import { demoDb } from '@/lib/demoDb';
import type { AppNotification } from '@/types';
import { DEMO_MODE, apiRequest, demoDelay } from './apiClient';

export const notificationService = {
  async listForUser(userId: string): Promise<AppNotification[]> {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb
          .getState()
          .notifications.filter((notification) => notification.userId === userId)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
        160,
      );
    }
    return apiRequest<AppNotification[]>('/me/notifications');
  },

  async markRead(id: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/notifications/${id}/read`, { method: 'POST' });
      return;
    }
    demoDb.markNotificationRead(id);
  },

  async markAllRead(userId: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>('/me/notifications/read-all', { method: 'POST' });
      return;
    }
    demoDb.markAllNotificationsRead(userId);
  },
};
