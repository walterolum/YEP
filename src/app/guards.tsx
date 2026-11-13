import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_HOME, type Role } from '@/types';

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas" role="status" aria-live="polite">
      <div className="flex items-center gap-2.5 text-sm text-slate">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Checking your session…
      </div>
    </div>
  );
}

export function RequireAuth() {
  const { status, user, expired } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <AuthLoading />;
  if (!user) {
    if (expired) return <Navigate to="/session-expired" replace />;
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (user.status === 'pending') {
    return <Navigate to="/account-pending" replace />;
  }
  if (user.status === 'suspended') {
    return <Navigate to="/account-suspended" replace />;
  }
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'pending') return <Navigate to="/account-pending" replace />;
  if (user.status === 'suspended') return <Navigate to="/account-suspended" replace />;
  if (!roles.includes(user.role)) {
    // If a participant attempts to access administrator routes, navigate to unauthorized
    if (roles.includes('admin') && user.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }
  return <Outlet />;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <AuthLoading />;
  if (user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from.startsWith('/app') ? from : ROLE_HOME[user.role]} replace />;
  }
  return <>{children}</>;
}

export function RoleLanding() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role]} replace />;
}
