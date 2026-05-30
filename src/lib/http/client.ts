import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
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
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use(async (config) => {
  const needsAuth = config.headers?.['X-Auth-Skip'] !== '1';
  if (!needsAuth) {
    config.headers?.delete?.('X-Auth-Skip');
    return config;
  }
  const token = await getIdTokenOrNull();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) {
      if (error.response) {
        const parsed = BackendErrorSchema.safeParse(error.response.data);
        if (parsed.success) {
          const { status, message, details, ...rest } = parsed.data;
          return Promise.reject(
            new ApiError(status, message, details ?? [], rest as Record<string, unknown>),
          );
        }
        return Promise.reject(
          new ApiError(
            error.response.status,
            error.response.statusText || error.message || 'Request failed',
          ),
        );
      }
      return Promise.reject(new ApiError(0, error.message || 'Network error'));
    }
    return Promise.reject(error);
  },
);

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, auth: needsAuth = true } = options;
  const config: AxiosRequestConfig = {
    url: path.startsWith('/') ? path : `/${path}`,
    method,
    data: body,
    signal,
    headers: needsAuth ? undefined : { 'X-Auth-Skip': '1' },
  };

  const response = await http.request<T>(config);
  if (response.status === 204) return undefined as T;
  return response.data;
}
