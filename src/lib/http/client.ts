import { env } from '@config/env';
import { auth } from '@lib/firebase/client';
import { ApiError, BackendErrorSchema } from './errors';

type Json = Record<string, unknown> | unknown[];

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Json;
  signal?: AbortSignal;
  auth?: boolean;
}

const BASE_URL = env.VITE_API_BASE_URL.replace(/\/$/, '');

async function getIdTokenOrNull(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function buildHeaders(needsAuth: boolean, hasBody: boolean): Promise<Headers> {
  const headers = new Headers();
  if (hasBody) headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  if (needsAuth) {
    const token = await getIdTokenOrNull();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

async function parseError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    return new ApiError(response.status, response.statusText || 'Request failed');
  }
  const parsed = BackendErrorSchema.safeParse(body);
  if (!parsed.success) {
    return new ApiError(response.status, response.statusText || 'Request failed');
  }
  return new ApiError(parsed.data.status, parsed.data.message, parsed.data.details ?? []);
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, auth: needsAuth = true } = options;
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = await buildHeaders(needsAuth, body !== undefined);

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
