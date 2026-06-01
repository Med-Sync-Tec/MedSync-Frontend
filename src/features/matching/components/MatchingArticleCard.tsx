import React from 'react';
import { ExternalLink, Link2, Sparkles } from 'lucide-react';
import type { ContextoTipo } from '@features/patients/schemas';
import type { MatchingArticle } from '../schemas';
import { tagMatchKey } from '../useMatchIntersection';
import type { SpecialtyVisual } from '../specialtyVisuals';
import { TagChip } from './TagChip';

interface MatchingArticleCardProps {
  article: MatchingArticle;
  matchedTagPairs: Set<string>;
  specialtyVisual: SpecialtyVisual | null;
  onOpenExplain: (articleId: string) => void;
}

function buildMeta(article: MatchingArticle): string {
  const parts: string[] = [];
  if (article.revista) parts.push(article.revista);
  if (article.anioPub != null) parts.push(String(article.anioPub));
  return parts.join(' · ');
}

/**
 * Patient-scoped article card. The header badge ("Coincide en N de M tags")
 * is the entry point into the explain side panel; matched tag chips render
 * with the {@code active} palette so the connection between the patient's
 * contextos and the article surface is visible at a glance.
 */
export const MatchingArticleCard: React.FC<MatchingArticleCardProps> = ({
  article,
  matchedTagPairs,
  specialtyVisual,
  onOpenExplain,
}) => {
  const matchCount = article.tags.reduce(
    (acc, tag) => (matchedTagPairs.has(tagMatchKey(article.id, tag.id)) ? acc + 1 : acc),
    0,
  );
  const total = article.tags.length;
  const onlySpecialty = total > 0 && matchCount === 0;
  const meta = buildMeta(article);
  const SpecialtyIcon = specialtyVisual?.Icon ?? Sparkles;

  return (
    <article className="relative rounded-xl border border-border-subtle bg-surface shadow-card overflow-hidden flex transition-colors transition-shadow hover:border-primary/40 hover:shadow-md focus-within:border-primary/40">
        <button
          type="button"
          onClick={() => onOpenExplain(article.id)}
          aria-label={`Ver detalles de: ${article.titulo}`}
          className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-xl"
        />
      {specialtyVisual && (
        <div
          aria-hidden="true"
          className={`relative z-[1] shrink-0 w-1.5 ${specialtyVisual.sidebar}`}
        />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
      <header className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {specialtyVisual ? (
            <span
              className={`inline-flex items-center gap-1 h-5 px-2 rounded-full border text-[10px] font-semibold tracking-tight ${specialtyVisual.badgeBg} ${specialtyVisual.badgeText} ${specialtyVisual.badgeBorder}`}
              title={specialtyVisual.name}
            >
              <SpecialtyIcon size={11} strokeWidth={2.2} aria-hidden="true" />
              <span className="max-w-[160px] truncate">{specialtyVisual.name}</span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">
              <Sparkles size={11} strokeWidth={2} aria-hidden="true" />
              Sin especialidad
            </div>
          )}
          <h4 className="text-sm font-semibold text-text-primary tracking-tight leading-snug line-clamp-2">
            {article.titulo}
          </h4>
          {meta && (
            <p className="text-[11px] text-text-subtle tracking-tight truncate">{meta}</p>
          )}
        </div>

        {total > 0 && (
          <button
            type="button"
            onClick={() => onOpenExplain(article.id)}
            className={`relative z-10 shrink-0 inline-flex items-center gap-1 rounded-full border px-2 h-6 text-[11px] font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              onlySpecialty
                ? 'border-border-subtle bg-surface-muted text-text-muted hover:bg-surface'
                : 'border-primary/30 bg-primary-subtle text-primary hover:bg-primary/15'
            }`}
            aria-label={
              onlySpecialty
                ? 'Coincide por especialidad. Ver detalle.'
                : `Coincide en ${matchCount} de ${total} tags. Ver detalle.`
            }
          >
            <Link2 size={11} strokeWidth={2.5} aria-hidden="true" />
            {onlySpecialty
              ? 'Coincide por especialidad'
              : `Coincide en ${matchCount} de ${total}`}
          </button>
        )}
      </header>

      {article.tags.length > 0 && (
        <ul className="px-4 pb-3 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => {
            const matched = matchedTagPairs.has(tagMatchKey(article.id, tag.id));
            return (
              <li key={tag.id}>
                <TagChip
                  tipo={tag.tipo as ContextoTipo}
                  valor={tag.valor}
                  matched={matched}
                  title={
                    matched
                      ? `Coincide con el contexto del paciente: ${tag.tipo} — ${tag.valor}`
                      : `${tag.tipo} — ${tag.valor}`
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      <footer className="px-4 py-2 border-t border-border-subtle bg-surface-subtle flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-muted tracking-tight truncate">
          {article.doi ? `DOI ${article.doi}` : (article.tipoPublicacion ?? '')}
        </span>
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary"
        >
          Detalles
        </span>
      </footer>
      </div>
    </article>
  );
};
