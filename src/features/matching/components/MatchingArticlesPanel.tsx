import React, { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, Link2, X } from 'lucide-react';
import { ApiError } from '@lib/http/errors';
import type { ContextoTipo, PacienteContexto } from '@features/patients/schemas';
import { useMatchingArticles, useEspecialidades } from '../queries';
import { useMatchIntersection, matchKey } from '../useMatchIntersection';
import type { MatchingArticle } from '../schemas';
import { MatchingArticleCard } from './MatchingArticleCard';
import { ArticleDetailDrawer } from '@ui/cards/ArticleDetailDrawer';
import { TIPO_PALETTES } from '../palette';
import { specialtyVisualById } from '../specialtyVisuals';

interface MatchingArticlesPanelProps {
  patientId: string;
  contextos: PacienteContexto[];
  hasContextoQueryError: boolean;
  /** Filter set, keyed by `${tipo}::${valor.toLowerCase()}`. */
  selectedTagKeys: ReadonlySet<string>;
  onClearFilter: () => void;
}

/**
 * Renders the patient's matching-articles feed with the bidirectional
 * highlighting. Articles are not re-sorted — backend already orders by
 * {@code updated_at DESC}, the panel preserves that order. The selected
 * tag filter is applied client-side with AND semantics so the doctor can
 * narrow the feed by clicking contexto chips in {@code PatientContextosPanel}.
 */
export const MatchingArticlesPanel: React.FC<MatchingArticlesPanelProps> = ({
  patientId,
  contextos,
  hasContextoQueryError,
  selectedTagKeys,
  onClearFilter,
}) => {
  const articlesQ = useMatchingArticles(patientId);
  const especialidadesQ = useEspecialidades();
  const intersection = useMatchIntersection(contextos, articlesQ.data);
  const [explainArticleId, setExplainArticleId] = useState<string | null>(null);

  const filteredArticles = useMemo<MatchingArticle[]>(() => {
    const all = articlesQ.data ?? [];
    if (selectedTagKeys.size === 0) return all;
    return all.filter((article) => {
      const tagKeys = new Set(
        article.tags.map((t) => matchKey(t.tipo as ContextoTipo, t.valor)),
      );
      for (const wanted of selectedTagKeys) {
        if (!tagKeys.has(wanted)) return false;
      }
      return true;
    });
  }, [articlesQ.data, selectedTagKeys]);

  const explainArticle = useMemo(
    () =>
      explainArticleId
        ? (articlesQ.data ?? []).find((a) => a.id === explainArticleId) ?? null
        : null,
    [articlesQ.data, explainArticleId],
  );

  const explainVisual = explainArticle
    ? specialtyVisualById(explainArticle.especialidadId, especialidadesQ.byId)
    : null;

  const selectedLabels = useMemo(() => {
    if (selectedTagKeys.size === 0) return [] as Array<{ key: string; tipo: ContextoTipo; valor: string }>;
    const map = new Map<string, { tipo: ContextoTipo; valor: string }>();
    for (const ctx of contextos) {
      const key = matchKey(ctx.tipo, ctx.valor);
      if (selectedTagKeys.has(key)) {
        map.set(key, { tipo: ctx.tipo, valor: ctx.valor });
      }
    }
    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }));
  }, [contextos, selectedTagKeys]);

  return (
    <section
      aria-labelledby="matching-articles-title"
      className="rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden"
    >
      <header className="px-5 pt-4 pb-3 border-b border-border-subtle flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            <Link2 size={12} strokeWidth={2.5} aria-hidden="true" />
            Artículos relevantes
          </div>
          <h3
            id="matching-articles-title"
            className="text-sm font-semibold text-text-primary tracking-tight"
          >
            Conectados al contexto del paciente
          </h3>
          <p className="text-[11px] text-text-subtle tracking-tight">
            Coincidencia automática por especialidad y tags clínicos.
          </p>
        </div>
        {articlesQ.data && (
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md text-[11px] font-mono font-semibold tabular-nums bg-surface-muted text-text-muted">
            {filteredArticles.length}
            {selectedTagKeys.size > 0 ? `/${articlesQ.data.length}` : ''}
          </span>
        )}
      </header>

      {selectedLabels.length > 0 && (
        <div className="px-5 py-2.5 border-b border-border-subtle bg-surface-subtle flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            Filtrando por
          </span>
          {selectedLabels.map(({ key, tipo, valor }) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full border text-[11px] font-medium tracking-tight ${TIPO_PALETTES[tipo].active}`}
            >
              <Link2 size={10} strokeWidth={2.5} aria-hidden="true" />
              <span className="max-w-[160px] truncate">{valor}</span>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearFilter}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-border-subtle bg-surface text-[11px] font-medium text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <X size={11} strokeWidth={2.5} aria-hidden="true" />
            Limpiar
          </button>
        </div>
      )}

      <div className="px-5 py-4">
        {articlesQ.error ? (
          <ErrorState
            message={resolveErrorMessage(articlesQ.error)}
            onRetry={() => articlesQ.refetch()}
          />
        ) : articlesQ.isLoading ? (
          <ListSkeleton />
        ) : (articlesQ.data?.length ?? 0) === 0 ? (
          <EmptyFeed
            hasContextos={contextos.length > 0}
            hasContextoError={hasContextoQueryError}
          />
        ) : filteredArticles.length === 0 ? (
          <FilteredEmpty onClear={onClearFilter} />
        ) : (
          <ul className="space-y-3">
            {filteredArticles.map((article) => {
              const visual = article.especialidadId
                ? specialtyVisualById(article.especialidadId, especialidadesQ.byId)
                : null;
              return (
                <li key={article.id}>
                  <MatchingArticleCard
                    article={article}
                    matchedTagPairs={intersection.matchedTagPairs}
                    specialtyVisual={visual}
                    onOpenExplain={setExplainArticleId}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ArticleDetailDrawer
        article={explainArticle as any}
        isHighEvidence={explainArticle?.tipoPublicacion === 'Journal Article'}
        onClose={() => setExplainArticleId(null)}
      />
    </section>
  );
};

const ListSkeleton: React.FC = () => (
  <ul className="space-y-3">
    {[0, 1, 2].map((i) => (
      <li
        key={i}
        aria-hidden="true"
        className="rounded-xl border border-border-subtle bg-surface-subtle h-[110px] animate-pulse"
      />
    ))}
  </ul>
);

interface EmptyFeedProps {
  hasContextos: boolean;
  hasContextoError: boolean;
}

const EmptyFeed: React.FC<EmptyFeedProps> = ({ hasContextos, hasContextoError }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 rounded-xl border border-dashed border-border-strong bg-surface-subtle">
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-text-subtle mb-3">
      <BookOpen size={18} strokeWidth={2} aria-hidden="true" />
    </span>
    <h4 className="text-sm font-semibold text-text-primary tracking-tight">
      {hasContextos ? 'Aún no hay coincidencias' : 'Sin coincidencias todavía'}
    </h4>
    <p className="mt-1 text-xs text-text-muted max-w-sm">
      {hasContextoError
        ? 'No pudimos cargar el contexto del paciente — al recargar buscaremos coincidencias.'
        : hasContextos
          ? 'Aún no hay artículos analizados con tags que coincidan con este contexto.'
          : 'Agrega contexto clínico al paciente o analiza una consulta con IA para descubrir artículos relevantes.'}
    </p>
  </div>
);

const FilteredEmpty: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="flex flex-col items-center justify-center text-center py-8 rounded-xl border border-dashed border-border-strong bg-surface-subtle">
    <p className="text-[12px] text-text-muted tracking-tight">
      Ningún artículo del feed contiene todos los tags seleccionados.
    </p>
    <button
      type="button"
      onClick={onClear}
      className="mt-2 text-[12px] font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
    >
      Limpiar filtros
    </button>
  </div>
);

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div
    role="alert"
    aria-live="polite"
    className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-[12px] text-danger"
  >
    <AlertTriangle size={13} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 text-[11px] font-medium underline underline-offset-2 hover:opacity-80"
      >
        Reintentar
      </button>
    </div>
  </div>
);

function resolveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNotFound) return 'No encontramos al paciente.';
    if (error.isUnauthorized) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'No pudimos cargar los artículos relevantes.';
}
