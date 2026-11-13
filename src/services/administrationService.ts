import { demoDb } from '@/lib/demoDb';
import type { Incident, PrivacyRequest, Role, User } from '@/types';
import { DEMO_MODE, apiRequest, demoDelay } from './apiClient';

export const administrationService = {
  async setUserStatus(userId: string, status: User['status']): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return;
    }
    await demoDelay(null, 420);
    demoDb.setUserStatus(userId, status);
  },

  async assignRole(userId: string, role: Role): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/admin/users/${userId}/roles`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      return;
    }
    await demoDelay(null, 450);
    demoDb.assignRole(userId, role);
  },

  async updateIncident(
    id: string,
    patch: Partial<Pick<Incident, 'status' | 'severity' | 'assignedTo'>>,
    note?: string,
  ): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/admin/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...patch, note }),
      });
      return;
    }
    await demoDelay(null, 480);
    demoDb.updateIncident(id, patch, note);
  },

  async updatePrivacyRequest(id: string, status: PrivacyRequest['status'], note?: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/admin/privacy-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      return;
    }
    await demoDelay(null, 420);
    demoDb.updatePrivacyRequest(id, status, note);
  },

  async setModuleStatus(moduleId: string, status: 'draft' | 'published' | 'archived'): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/admin/modules/${moduleId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return;
    }
    await demoDelay(null, 380);
    demoDb.updateModuleStatus(moduleId, status);
  },

  async inviteUser(payload: {
    name: string;
    email: string;
    role: Role;
    organization?: string;
    country: string;
  }): Promise<User> {
    if (!DEMO_MODE) {
      return apiRequest<User>('/admin/users/invitations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    await demoDelay(null, 520);
    const name = payload.name.trim();
    const email = payload.email.trim().toLowerCase();
    if (name.length < 3) throw new Error('Enter the person’s full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    const existing = demoDb.getState().users.some((entry) => entry.email.toLowerCase() === email);
    if (existing) throw new Error('An account already exists for that email address.');
    const user: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: payload.role,
      country: payload.country,
      organization: payload.organization?.trim() || undefined,
      initials: name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join(''),
      joinedAt: new Date().toISOString(),
      status: 'invited',
      profileComplete: 0,
      timezone: 'Africa/Kampala',
      interests: [],
      skills: [],
      visibility: 'hidden',
      contactPermission: false,
    };
    demoDb.addUser(user);
    return user;
  },

  async getAuditLog() {
    if (DEMO_MODE) return demoDelay(demoDb.getState().auditLog, 200);
    return apiRequest('/admin/audit-log');
  },
};
