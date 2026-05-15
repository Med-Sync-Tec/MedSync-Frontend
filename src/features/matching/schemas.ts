import { z } from 'zod';
import { TipoClinicoSchema } from '@features/news/schemas';

/**
 * Mirror of the backend {@code ArticleResponse} DTO surfaced by
 * {@code GET /api/patients/{id}/matching-articles}. Identical shape to the
 * single-article DTO consumed elsewhere — kept here so the matching feature
 * is self-contained and can evolve independently if the article module
 * splits its own schema later.
 *
 * The backend mapper lowercases {@code tipo} before serializing
 * (see ArticleRestMapper#toTagResponse), so we accept the lowercase enum
 * directly without a normalization step.
 */
export const MatchingArticleTagSchema = z.object({
  id: z.string(),
  tipo: TipoClinicoSchema,
  valor: z.string(),
  createdAt: z.string().optional(),
});

export const MatchingArticleSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  autores: z.string().nullable(),
  revista: z.string().nullable(),
  anioPub: z.number().int().nullable(),
  mesPub: z.string().nullable(),
  doi: z.string().nullable(),
  abstractText: z.string().nullable(),
  keywords: z.string().nullable(),
  tipoPublicacion: z.string().nullable(),
  url: z.string().nullable(),
  especialidadId: z.string().nullable(),
  tags: z.array(MatchingArticleTagSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const EspecialidadSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  slug: z.string().optional(),
  descripcion: z.string().nullable().optional(),
});

export type MatchingArticleTag = z.infer<typeof MatchingArticleTagSchema>;
export type MatchingArticle = z.infer<typeof MatchingArticleSchema>;
export type Especialidad = z.infer<typeof EspecialidadSchema>;
