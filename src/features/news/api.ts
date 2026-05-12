import { apiFetch } from '@lib/http/client';
import type { PagedArticlesResponse } from './types';

export const getRecentArticles = async (page = 0, size = 20): Promise<PagedArticlesResponse> => {
  return apiFetch<PagedArticlesResponse>(`/api/articles/recent?page=${page}&size=${size}`);
};

export const syncRecentArticles = async (): Promise<{ articulosProcesados: number }> => {
  return apiFetch<{ articulosProcesados: number }>('/api/articles/sync', { method: 'POST' });
};
