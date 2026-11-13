import type { ApiErrorShape } from '@/types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
export const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE as string | undefined) !== 'false';

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor({ status, code, message, fieldErrors }: ApiErrorShape) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const value = part.trim();
    if (value.startsWith(prefix)) {
      return decodeURIComponent(value.slice(prefix.length));
    }
  }
  return null;
}

/**
 * Spring Security's double-submit cookie strategy writes the token to a
 * readable XSRF-TOKEN cookie. The token must be echoed in the X-XSRF-TOKEN
 * header on every unsafe request. A single GET /auth/csrf primes the cookie
 * when the application has not made a read request yet.
 */
async function csrfToken(): Promise<string | null> {
  const existing = readCookie('XSRF-TOKEN');
  if (existing) return existing;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return readCookie('XSRF-TOKEN');
    const body = (await response.json()) as { token?: string };
    return body.token ?? readCookie('XSRF-TOKEN');
  } catch {
    return null;
  }
}

/**
 * Thin fetch wrapper used by every service module.
 * The Java Spring Boot API exposes the paths documented in README.md and uses an
 * HttpOnly cookie session plus a CSRF header. Credentials are included on every
 * request, and empty 204 responses resolve to undefined.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  const isFormData = init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!SAFE_METHODS.has(method)) {
    const token = await csrfToken();
    if (token) headers.set('X-XSRF-TOKEN', token);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    credentials: 'include',
    headers,
  });

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: payload?.code ?? `HTTP_${response.status}`,
      message: payload?.message ?? 'The request could not be completed. Please try again.',
      fieldErrors: payload?.fieldErrors,
    });
  }

  return payload as T;
}

export function demoDelay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

export function isNetworkDemoMode() {
  return DEMO_MODE;
}
