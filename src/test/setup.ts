import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { resetDemoData } from '@/lib/demoDb';

/**
 * Node 25 ships a partial localStorage implementation into jsdom which does not
 * expose the Storage methods. Replace both stores with a deterministic
 * in-memory version so the demo persistence layer behaves like a browser.
 */
function createStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
  };
}

Object.defineProperty(window, 'localStorage', { value: createStorage(), configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: createStorage(), configurable: true });

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

window.scrollTo = () => undefined;

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetDemoData();
});

afterEach(() => {
  cleanup();
});
