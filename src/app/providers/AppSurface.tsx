import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

/**
 * Marks the authenticated application surface. Shared primitives use this to
 * apply the app-only 3D styling without touching public or authentication
 * pages, which never render inside this provider.
 */
const AppSurfaceContext = createContext(false);

export function AppSurfaceProvider({ children }: { children: ReactNode }) {
  return <AppSurfaceContext.Provider value>{children}</AppSurfaceContext.Provider>;
}

export function useAppSurface() {
  return useContext(AppSurfaceContext);
}
