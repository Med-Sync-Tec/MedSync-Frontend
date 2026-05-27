import { z } from 'zod';
import { apiFetch } from '@lib/http/client';
import {
  EspecialidadSchema,
  MatchingArticleSchema,
  type Especialidad,
  type MatchingArticle,
} from './schemas';

/**
 * {@code GET /api/patients/{patientId}/matching-articles}. The backend
 * already enforces the (especialidadId, tipo, valor) join — the client only
 * needs to consume the ordered list (most-recently updated articles first).
 */
export async function getMatchingArticles(
  patientId: string,
  limit = 50,
): Promise<MatchingArticle[]> {
  const raw = await apiFetch<unknown>(
    `/api/patients/${encodeURIComponent(patientId)}/matching-articles?limit=${limit}`,
  );
  return z.array(MatchingArticleSchema).parse(raw);
}

/**
 * {@code GET /api/coo/matching-articles}. COO-scoped variant: the backend
 * joins article {@code MEDICAMENTO} tags against the whole medication catalog
 * (case-insensitive). Same {@link MatchingArticle} shape as the patient feed,
 * so every downstream component (cards, chips, explain panel) is reused.
 */
export async function getCooMatchingArticles(limit = 50): Promise<MatchingArticle[]> {
  const raw = await apiFetch<unknown>(`/api/coo/matching-articles?limit=${limit}`);
  return z.array(MatchingArticleSchema).parse(raw);
}

/**
 * {@code GET /api/especialidades}. Specialty catalog is small and changes
 * rarely; consumers cache the result with a long stale time so the
 * matching panel can look up names for free.
 */
export async function listEspecialidades(): Promise<Especialidad[]> {
  const raw = await apiFetch<unknown>('/api/especialidades');
  return z.array(EspecialidadSchema).parse(raw);
}
