import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  analyzeArticle,
  getRecentArticles,
  getSavedArticles,
  markArticleAsRead,
  saveArticle,
  syncRecentArticles,
  unsaveArticle,
} from './api';
import type { AnalyzeArticleResponse } from './schemas';

export const newsKeys = {
  all: ['news'] as const,
  recent: () => [...newsKeys.all, 'recent'] as const,
  saved: () => [...newsKeys.all, 'saved'] as const,
};

export const useRecentArticles = (page = 0, size = 5) => {
  return useQuery({
    queryKey: [...newsKeys.recent(), { page, size }],
    queryFn: () => getRecentArticles(page, size),
  });
};

export const useSyncArticles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncRecentArticles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
};

export const useMarkArticleAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => markArticleAsRead(articleId),
    onSuccess: () => {
      // Invalidar el dashboard para que los "no leídos" se actualicen
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useSavedArticles = (page = 0, size = 10) => {
  return useQuery({
    queryKey: [...newsKeys.saved(), { page, size }],
    queryFn: () => getSavedArticles(page, size),
  });
};

export const useSaveArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => saveArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.saved() });
    },
  });
};

export const useUnsaveArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => unsaveArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.saved() });
    },
  });
};

/**
 * Mutation hook for {@code POST /api/articles/{id}/analyze}.
 *
 * Invalidates the recent-articles cache on success so the updated tag list
 * and especialidad are picked up the next time the list refetches.
 */
export const useAnalyzeArticle = () => {
  const queryClient = useQueryClient();
  return useMutation<AnalyzeArticleResponse, Error, string>({
    mutationFn: analyzeArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
};
