import { Mutex } from 'async-mutex';

const BASE = 'http://localhost:4000';

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

let onSessionLost: (() => void) | null = null;
export const setOnSessionLost = (fn: () => void) => {
  onSessionLost = fn;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const NO_REAUTH = new Set(['/auth/login', '/auth/register', '/auth/refresh']);

function rawFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(BASE + path, { ...options, headers, credentials: 'include' });
}

const refreshMutex = new Mutex();

export function refreshAccessToken(failedToken: string | null): Promise<boolean> {
  return refreshMutex.runExclusive(async () => {
    if (accessToken !== failedToken) return true;

    const res = await rawFetch('/auth/refresh', { method: 'POST' });
    if (!res.ok) {
      setAccessToken(null);
      onSessionLost?.();
      return false;
    }
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  });
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.message ?? 'Request failed', body?.details);
  return body as T;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const tokenUsed = accessToken;
  let res = await rawFetch(path, options);

  if (res.status === 401 && !NO_REAUTH.has(path)) {
    if (await refreshAccessToken(tokenUsed)) {
      res = await rawFetch(path, options);
    }
  }
  return parse<T>(res);
}
