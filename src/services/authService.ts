import { DEMO_PASSWORD } from '@/lib/demoAccounts';
import { demoDb } from '@/lib/demoDb';
import type { AuthSession, Role, User } from '@/types';
import { ApiError, DEMO_MODE, apiRequest, demoDelay } from './apiClient';

const SESSION_KEY = 'yep.demo.session.v1';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  dateOfBirth: string;
  password: string;
  interests: string[];
  privacyAccepted: boolean;
  communicationsConsent: boolean;
}

function buildSession(user: User): AuthSession {
  const issuedAt = Date.now();
  return { user, issuedAt, expiresAt: issuedAt + SESSION_TTL_MS, demo: DEMO_MODE };
}

function storeSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (!session?.user || session.expiresAt < Date.now()) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export const authService = {
  async getSession(): Promise<AuthSession | null> {
    if (DEMO_MODE) {
      const session = readStoredSession();
      if (!session) return null;
      const user = demoDb.getState().users.find((entry) => entry.id === session.user.id);
      if (!user || user.status !== 'active') {
        window.sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return { ...session, user };
    }
    return apiRequest<AuthSession | null>('/auth/session');
  },

  async login(email: string, password: string): Promise<AuthSession> {
    if (!DEMO_MODE) {
      return apiRequest<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    }
    await demoDelay(null, 550);
    const user = demoDb
      .getState()
      .users.find((entry) => entry.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || password !== DEMO_PASSWORD) {
      throw new ApiError({
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'The email or password does not match a demonstration account.',
      });
    }
    if (user.status === 'suspended') {
      throw new ApiError({
        status: 403,
        code: 'ACCOUNT_SUSPENDED',
        message: 'This account is suspended. Contact platform support if you believe this is an error.',
      });
    }
    const session = buildSession(user);
    storeSession(session);
    return session;
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    if (!DEMO_MODE) {
      return apiRequest<AuthSession>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    await demoDelay(null, 700);
    const exists = demoDb
      .getState()
      .users.some((entry) => entry.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (exists) {
      throw new ApiError({
        status: 409,
        code: 'EMAIL_IN_USE',
        message: 'An account already exists for this email address.',
        fieldErrors: { email: 'This email is already registered.' },
      });
    }
    const initials = payload.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
    const user: User = {
      id: `u-${Date.now()}`,
      name: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      role: 'participant',
      country: payload.country,
      dateOfBirth: payload.dateOfBirth,
      phone: payload.phone,
      initials,
      joinedAt: new Date().toISOString(),
      status: 'active',
      profileComplete: 45,
      timezone: 'Africa/Kampala',
      interests: payload.interests,
      skills: [],
      visibility: 'limited',
      contactPermission: false,
      bio: '',
    };
    demoDb.addUser(user);
    const session = buildSession(user);
    storeSession(session);
    return session;
  },

  async logout(): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>('/auth/logout', { method: 'POST' });
      return;
    }
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY);
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    if (!DEMO_MODE) {
      return apiRequest<{ message: string }>('/auth/password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    }
    await demoDelay(null, 600);
    return {
      message:
        'If an account exists for that address, a reset link has been sent. For this demonstration, use the link shown below.',
    };
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    if (!DEMO_MODE) {
      return apiRequest<{ message: string }>('/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
    }
    await demoDelay(null, 600);
    if (!token || token === 'expired') {
      throw new ApiError({
        status: 410,
        code: 'RESET_LINK_EXPIRED',
        message: 'This reset link has expired. Request a new link to continue.',
      });
    }
    return { message: 'Your demonstration password has been updated. Sign in to continue.' };
  },

  async verifyEmail(code: string): Promise<{ verified: boolean }> {
    if (!DEMO_MODE) {
      return apiRequest<{ verified: boolean }>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    }
    await demoDelay(null, 500);
    if (code !== '123456') {
      throw new ApiError({
        status: 400,
        code: 'INVALID_CODE',
        message: 'That verification code is not correct. For the demonstration, use 123456.',
      });
    }
    return { verified: true };
  },

  async switchDemoRole(role: Role): Promise<AuthSession> {
    if (!DEMO_MODE) {
      throw new ApiError({ status: 404, code: 'NOT_DEMO', message: 'Demo role switching is unavailable.' });
    }
    const account = demoDb.getState().users.find((entry) => entry.role === role);
    if (!account) {
      throw new ApiError({ status: 404, code: 'ROLE_NOT_FOUND', message: 'No demo account exists for this role.' });
    }
    const session = buildSession(account);
    storeSession(session);
    return session;
  },
};
