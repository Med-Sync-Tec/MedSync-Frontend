import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecentArticles, syncRecentArticles, markArticleAsRead } from './api';

export const newsKeys = {
  all: ['news'] as const,
  recent: () => [...newsKeys.all, 'recent'] as const,
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
