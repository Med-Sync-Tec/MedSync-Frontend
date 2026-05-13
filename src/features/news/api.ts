import { apiFetch } from '@lib/http/client';
import type { PagedArticlesResponse } from './types';

export const getRecentArticles = async (page = 0, size = 20): Promise<PagedArticlesResponse> => {
  return apiFetch<PagedArticlesResponse>(`/api/articles/recent?page=${page}&size=${size}`);
};

export const syncRecentArticles = async (): Promise<{ articulosProcesados: number }> => {
  return apiFetch<{ articulosProcesados: number }>('/api/articles/sync', { method: 'POST' });
};

export const markArticleAsRead = async (articleId: string): Promise<void> => {
  return apiFetch<void>(`/api/articles/${articleId}/read`, { method: 'POST' });
};
