import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCooMatchingArticles, getMatchingArticles, listEspecialidades } from './api';
import type { Especialidad, MatchingArticle } from './schemas';

export const matchingKeys = {
  all: ['matching'] as const,
  articles: (patientId: string) => [...matchingKeys.all, 'articles', patientId] as const,
  cooArticles: () => [...matchingKeys.all, 'coo-articles'] as const,
  especialidades: () => [...matchingKeys.all, 'especialidades'] as const,
};

export function useMatchingArticles(patientId: string | undefined) {
  return useQuery<MatchingArticle[]>({
    queryKey: matchingKeys.articles(patientId ?? ''),
    queryFn: () => getMatchingArticles(patientId as string),
    enabled: Boolean(patientId),
  });
}

/**
 * COO-scoped matching feed: articles whose MEDICAMENTO tag hits the catalog.
 * Lives under {@code matchingKeys.all} so {@code useAnalyzeArticle} invalidates
 * it too — analyzing an article lights up new medication matches without a reload.
 */
export function useCooMatchingArticles() {
  return useQuery<MatchingArticle[]>({
    queryKey: matchingKeys.cooArticles(),
    queryFn: () => getCooMatchingArticles(),
  });
}

/**
 * Long stale time — the specialty catalog rarely changes during a doctor's
 * session and the side panel queries it on every match badge click.
 */
const ONE_HOUR_MS = 60 * 60 * 1000;

export function useEspecialidades() {
  const query = useQuery<Especialidad[]>({
    queryKey: matchingKeys.especialidades(),
    queryFn: listEspecialidades,
    staleTime: ONE_HOUR_MS,
    gcTime: ONE_HOUR_MS * 2,
  });

  const byId = useMemo(() => {
    const map = new Map<string, Especialidad>();
    for (const e of query.data ?? []) {
      map.set(e.id, e);
    }
    return map;
  }, [query.data]);

  return { ...query, byId };
}
