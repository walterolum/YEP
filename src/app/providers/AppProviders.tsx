import type { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from '@/components/ui';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
