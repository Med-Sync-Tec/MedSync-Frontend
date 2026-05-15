import { useMemo } from 'react';
import type { PacienteContexto, ContextoTipo } from '@features/patients/schemas';
import type { MatchingArticle } from './schemas';

function makeKey(tipo: ContextoTipo, valor: string): string {
  return `${tipo}::${valor.trim().toLowerCase()}`;
}

export interface MatchIntersection {
  /** Normalized `${tipo}::${valor}` keys derived from the patient's contextos. */
  contextoKeys: Set<string>;
  /** Lookup from normalized key to the underlying contexto id. */
  contextoIdByKey: Map<string, string>;
  /** `(articleId, tagId)` pairs whose tag matched a contexto. */
  matchedTagPairs: Set<string>;
  /** Per-article tally of matched tags. */
  articleMatchCounts: Map<string, number>;
  /** Per-contexto tally of articles containing that tag. */
  contextoMatchCounts: Map<string, number>;
}

const EMPTY: MatchIntersection = {
  contextoKeys: new Set(),
  contextoIdByKey: new Map(),
  matchedTagPairs: new Set(),
  articleMatchCounts: new Map(),
  contextoMatchCounts: new Map(),
};

/**
 * Computes the bidirectional join between a patient's contextos and the
 * matching-articles feed entirely on the client. Derives a parallel set of
 * highlights without mutating the source payloads — every component
 * downstream consumes this shared snapshot, so the colored chips, the
 * "N of M" badges and the per-contexto counters are always consistent.
 *
 * Memoized on the two query results: invalidating either contextos or
 * matching-articles triggers a fresh intersection, which is what makes
 * newly-accepted consulta suggestions "light up" article matches without a
 * reload.
 */
export function useMatchIntersection(
  contextos: PacienteContexto[] | undefined,
  articles: MatchingArticle[] | undefined,
): MatchIntersection {
  return useMemo<MatchIntersection>(() => {
    if (!contextos || !articles) return EMPTY;

    const contextoKeys = new Set<string>();
    const contextoIdByKey = new Map<string, string>();
    for (const ctx of contextos) {
      const key = makeKey(ctx.tipo, ctx.valor);
      contextoKeys.add(key);
      // Last writer wins on duplicate (tipo, valor) — the panel collapses them anyway.
      contextoIdByKey.set(key, ctx.id);
    }

    const matchedTagPairs = new Set<string>();
    const articleMatchCounts = new Map<string, number>();
    const contextoMatchCounts = new Map<string, number>();

    for (const article of articles) {
      let count = 0;
      for (const tag of article.tags) {
        const key = makeKey(tag.tipo, tag.valor);
        if (!contextoKeys.has(key)) continue;
        matchedTagPairs.add(`${article.id}::${tag.id}`);
        count += 1;
        const contextoId = contextoIdByKey.get(key);
        if (contextoId) {
          contextoMatchCounts.set(
            contextoId,
            (contextoMatchCounts.get(contextoId) ?? 0) + 1,
          );
        }
      }
      articleMatchCounts.set(article.id, count);
    }

    return {
      contextoKeys,
      contextoIdByKey,
      matchedTagPairs,
      articleMatchCounts,
      contextoMatchCounts,
    };
  }, [contextos, articles]);
}

export function tagMatchKey(articleId: string, tagId: string): string {
  return `${articleId}::${tagId}`;
}

export { makeKey as matchKey };
