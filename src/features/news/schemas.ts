import { z } from 'zod';

/**
 * Clinical type discriminator shared between articles and patient context.
 * Mirrors the backend's {@code TipoClinico} enum, surfaced lowercase by the
 * REST mappers to match the existing patient-context convention.
 */
export const TipoClinicoSchema = z.enum([
  'enfermedad',
  'sintoma',
  'tratamiento',
  'medicamento',
]);
export type TipoClinico = z.infer<typeof TipoClinicoSchema>;

/** AI-extracted (or manually-added) tag attached to an article. */
export const ArticleTagSchema = z.object({
  id: z.string(),
  tipo: TipoClinicoSchema.or(z.string()), // backend may surface either case; we accept and normalize downstream
  valor: z.string(),
});
export type ArticleTagDTO = z.infer<typeof ArticleTagSchema>;

/**
 * Response envelope from {@code POST /api/articles/{id}/analyze}.
 *
 * - {@code modelUsed} / {@code promptTokens} / {@code completionTokens} are
 *   surfaced for a provenance footer ("Analyzed with llama-3.3-70b-versatile
 *   in 580 tokens").
 * - {@code hadAbstract} is {@code false} when the backend analyzed an article
 *   without an abstract (PubMed letters / editorials); the UI renders a
 *   "fewer tags than usual" disclaimer in that case.
 */
export const AnalyzeArticleResponseSchema = z.object({
  articleId: z.string(),
  especialidadId: z.string().nullable(),
  especialidadNombre: z.string().nullable(),
  tags: z.array(
    z.object({
      id: z.string(),
      // Backend returns tipo uppercase here (TipoClinico.name()); normalize
      // to lowercase on read so the frontend pipeline stays consistent.
      tipo: z.string(),
      valor: z.string(),
    }),
  ),
  modelUsed: z.string(),
  promptTokens: z.number().int(),
  completionTokens: z.number().int(),
  hadAbstract: z.boolean(),
});
export type AnalyzeArticleResponse = z.infer<typeof AnalyzeArticleResponseSchema>;
