/**
 * Thin API client for the YEP backend.
 * The JWT lives in sessionStorage; every request adds the bearer header.
 */

const TOKEN_KEY = 'yep.token';
const USER_KEY = 'yep.user';

export const session = {
  get token() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  },
  get user() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setUser(user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (session.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  const response = await fetch(`/api${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return null;
  }
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      session.clear();
    }
    const message = (payload && payload.message) || 'The request could not be completed.';
    throw new ApiError(message, response.status);
  }
  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body = {}) => request(path, { method: 'POST', body }),
  put: (path, body = {}) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  request,
};

/** Downloads a protected file (reports, certificates) with the bearer header. */
export async function download(path, fileName) {
  const response = await fetch(`/api${path}`, {
    headers: session.token ? { Authorization: `Bearer ${session.token}` } : {},
  });
  if (!response.ok) {
    throw new ApiError('That file could not be downloaded.', response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'yep-download';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
