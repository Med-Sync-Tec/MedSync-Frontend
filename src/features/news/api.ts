import { apiFetch } from '@lib/http/client';
import type { PagedArticlesResponse } from './types';
import { AnalyzeArticleResponseSchema, type AnalyzeArticleResponse } from './schemas';

export const getRecentArticles = async (page = 0, size = 20): Promise<PagedArticlesResponse> => {
  return apiFetch<PagedArticlesResponse>(`/api/articles/recent?page=${page}&size=${size}`);
};

export const syncRecentArticles = async (): Promise<{ articulosProcesados: number }> => {
  return apiFetch<{ articulosProcesados: number }>('/api/articles/sync', { method: 'POST' });
};

export const markArticleAsRead = async (articleId: string): Promise<void> => {
  return apiFetch<void>(`/api/articles/${articleId}/read`, { method: 'POST' });
};

export const getSavedArticles = async (page = 0, size = 20): Promise<PagedArticlesResponse> => {
  return apiFetch<PagedArticlesResponse>(`/api/articles/saved?page=${page}&size=${size}`);
};

export const saveArticle = async (articleId: string): Promise<void> => {
  return apiFetch<void>(`/api/articles/${articleId}/save`, { method: 'POST' });
};

export const unsaveArticle = async (articleId: string): Promise<void> => {
  return apiFetch<void>(`/api/articles/${articleId}/save`, { method: 'DELETE' });
};


/**
 * Trigger Groq-backed AI classification + tag extraction for an article.
 *
 * Atomically replaces the article's especialidad and tag list. The doctor
 * should be warned client-side before invoking (the existing tag list is
 * dropped). On success the backend persists state — callers should also
 * invalidate any cached article queries.
 */
export const analyzeArticle = async (articleId: string): Promise<AnalyzeArticleResponse> => {
  const raw = await apiFetch<unknown>(`/api/articles/${encodeURIComponent(articleId)}/analyze`, {
    method: 'POST',
  });
  return AnalyzeArticleResponseSchema.parse(raw);
};
