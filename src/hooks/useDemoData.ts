import { useSyncExternalStore } from 'react';
import { getDemoState, subscribeDemo } from '@/lib/demoDb';

export function useDemoData() {
  return useSyncExternalStore(subscribeDemo, getDemoState, getDemoState);
}

export function useDemoUser(userId?: string) {
  const state = useDemoData();
  return userId ? state.users.find((user) => user.id === userId) : undefined;
}
