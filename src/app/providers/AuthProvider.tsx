import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authService, type RegisterPayload } from '@/services/authService';
import { readStoredSession } from '@/services/authService';
import type { AuthSession, Role, User } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  status: AuthStatus;
  expired: boolean;
  rememberedEmail: string;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  switchDemoRole: (role: Role) => Promise<AuthSession>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REMEMBERED_EMAIL_KEY = 'yep.rememberedEmail';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [expired, setExpired] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';
  });
  const sessionRef = useRef<AuthSession | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    let active = true;
    authService
      .getSession()
      .then((result) => {
        if (!active) return;
        setSession(result);
        setStatus(result ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setStatus('anonymous');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function checkExpiry() {
      const current = sessionRef.current;
      if (!current) return;
      if (current.expiresAt <= Date.now()) {
        setSession(null);
        setStatus('anonymous');
        setExpired(true);
        void authService.logout();
      }
    }
    const interval = window.setInterval(checkExpiry, 60_000);
    window.addEventListener('focus', checkExpiry);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkExpiry);
    };
  }, []);

  const login = useCallback(async (email: string, password: string, remember = false) => {
    const result = await authService.login(email, password);
    setSession(result);
    setStatus('authenticated');
    setExpired(false);
    if (remember) {
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      setRememberedEmail(email);
    } else {
      window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      setRememberedEmail('');
    }
    return result;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    setSession(result);
    setStatus('authenticated');
    setExpired(false);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    setStatus('anonymous');
    setExpired(false);
  }, []);

  const switchDemoRole = useCallback(async (role: Role) => {
    const result = await authService.switchDemoRole(role);
    setSession(result);
    setStatus('authenticated');
    setExpired(false);
    return result;
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await authService.getSession();
    setSession(result);
    setStatus(result ? 'authenticated' : 'anonymous');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      status,
      expired,
      rememberedEmail,
      login,
      register,
      logout,
      switchDemoRole,
      refreshUser,
    }),
    [session, status, expired, rememberedEmail, login, register, logout, switchDemoRole, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
