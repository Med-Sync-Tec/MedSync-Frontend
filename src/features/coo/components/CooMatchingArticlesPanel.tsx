import React, { useMemo, useState } from 'react';
import { AlertTriangle, Bookmark, BookmarkCheck, Link2, Pill, X } from 'lucide-react';
import { ApiError } from '@lib/http/errors';
import type { ContextoTipo, PacienteContexto } from '@features/patients/schemas';
import { useEspecialidades } from '@features/matching/queries';
import { matchKey } from '@features/matching/useMatchIntersection';
import type { MatchingArticle } from '@features/matching/schemas';
import { MatchingArticleCard } from '@features/matching/components/MatchingArticleCard';
import { MatchExplainPanel } from '@features/matching/components/MatchExplainPanel';
import { TIPO_PALETTES } from '@features/matching/palette';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';
import { AnalyzeArticleButton } from '@features/news/components/AnalyzeArticleButton';
import { useSaveArticle, useUnsaveArticle } from '@features/news/queries';
import { useCooMatchingArticles } from '@features/matching/queries';

interface CooMatchingArticlesPanelProps {
  /** Synthetic medication contextos (from the catalog). */
  contextos: PacienteContexto[];
  matchedTagPairs: Set<string>;
  selectedTagKeys: ReadonlySet<string>;
  onClearFilter: () => void;
}

/**
 * COO counterpart of {@code MatchingArticlesPanel}. Consumes the catalog-wide
 * matching feed and reuses the very same leaf components (cards, chips, explain
 * panel) so the medication highlight looks identical to the patient screen.
 * Adds per-article "save" and "analyze with AI" actions so the COO can curate
 * and enrich the feed in place.
 */
export const CooMatchingArticlesPanel: React.FC<CooMatchingArticlesPanelProps> = ({
  contextos,
  matchedTagPairs,
  selectedTagKeys,
  onClearFilter,
}) => {
  const articlesQ = useCooMatchingArticles();
  const especialidadesQ = useEspecialidades();
  const [explainArticleId, setExplainArticleId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const saveMutation = useSaveArticle();
  const unsaveMutation = useUnsaveArticle();

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        unsaveMutation.mutate(id);
      } else {
        next.add(id);
        saveMutation.mutate(id);
      }
      return next;
    });
  };

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
  const explainEspName = explainArticle?.especialidadId ? explainVisual?.name ?? null : null;

  const selectedLabels = useMemo(() => {
    if (selectedTagKeys.size === 0) return [] as Array<{ key: string; valor: string }>;
    const map = new Map<string, string>();
    for (const ctx of contextos) {
      const key = matchKey(ctx.tipo, ctx.valor);
      if (selectedTagKeys.has(key)) map.set(key, ctx.valor);
    }
    return Array.from(map.entries()).map(([key, valor]) => ({ key, valor }));
  }, [contextos, selectedTagKeys]);

  return (
    <section
      aria-labelledby="coo-matching-articles-title"
      className="rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden"
    >
      <header className="px-5 pt-4 pb-3 border-b border-border-subtle flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            <Link2 size={12} strokeWidth={2.5} aria-hidden="true" />
            Artículos relevantes
          </div>
          <h3
            id="coo-matching-articles-title"
            className="text-sm font-semibold text-text-primary tracking-tight"
          >
            Conectados al catálogo de medicamentos
          </h3>
          <p className="text-[11px] text-text-subtle tracking-tight">
            Coincidencia automática por nombre de medicamento.
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
          {selectedLabels.map(({ key, valor }) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full border text-[11px] font-medium tracking-tight ${TIPO_PALETTES.medicamento.active}`}
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
          <ErrorState message={resolveErrorMessage(articlesQ.error)} onRetry={() => articlesQ.refetch()} />
        ) : articlesQ.isLoading ? (
          <ListSkeleton />
        ) : (articlesQ.data?.length ?? 0) === 0 ? (
          <EmptyFeed hasCatalog={contextos.length > 0} />
        ) : filteredArticles.length === 0 ? (
          <FilteredEmpty onClear={onClearFilter} />
        ) : (
          <ul className="space-y-3">
            {filteredArticles.map((article) => {
              const visual = article.especialidadId
                ? specialtyVisualById(article.especialidadId, especialidadesQ.byId)
                : null;
              const saved = savedIds.has(article.id);
              return (
                <li key={article.id} className="space-y-1.5">
                  <MatchingArticleCard
                    article={article}
                    matchedTagPairs={matchedTagPairs}
                    specialtyVisual={visual}
                    onOpenExplain={setExplainArticleId}
                  />
                  <div className="flex items-center gap-2 px-1">
                    <button
                      type="button"
                      onClick={() => toggleSave(article.id)}
                      aria-pressed={saved}
                      className={`inline-flex items-center gap-1.5 rounded-lg border text-xs font-semibold px-2.5 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                        saved
                          ? 'border-primary/40 bg-primary text-white hover:bg-primary/90'
                          : 'border-border-subtle bg-surface text-text-primary hover:bg-surface-muted'
                      }`}
                    >
                      {saved ? (
                        <BookmarkCheck size={14} aria-hidden="true" />
                      ) : (
                        <Bookmark size={14} aria-hidden="true" />
                      )}
                      {saved ? 'Guardado' : 'Guardar'}
                    </button>
                    <AnalyzeArticleButton articleId={article.id} articleTitle={article.titulo} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <MatchExplainPanel
        open={Boolean(explainArticle)}
        onClose={() => setExplainArticleId(null)}
        article={explainArticle}
        contextos={contextos}
        matchedTagPairs={matchedTagPairs}
        especialidadName={explainEspName}
        specialtyVisual={explainVisual}
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

const EmptyFeed: React.FC<{ hasCatalog: boolean }> = ({ hasCatalog }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 rounded-xl border border-dashed border-border-strong bg-surface-subtle">
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-text-subtle mb-3">
      <Pill size={18} strokeWidth={2} aria-hidden="true" />
    </span>
    <h4 className="text-sm font-semibold text-text-primary tracking-tight">
      {hasCatalog ? 'Aún no hay coincidencias' : 'Sin medicamentos en el catálogo'}
    </h4>
    <p className="mt-1 text-xs text-text-muted max-w-sm">
      {hasCatalog
        ? 'Ningún artículo analizado menciona un medicamento del catálogo. Analiza noticias con IA para descubrir coincidencias.'
        : 'Agrega medicamentos en Inventario para empezar a cruzarlos con las noticias.'}
    </p>
  </div>
);

const FilteredEmpty: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="flex flex-col items-center justify-center text-center py-8 rounded-xl border border-dashed border-border-strong bg-surface-subtle">
    <p className="text-[12px] text-text-muted tracking-tight">
      Ningún artículo del feed contiene todos los medicamentos seleccionados.
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

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
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
    if (error.isUnauthorized) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    if (error.status === 403) return 'Solo el COO puede consultar este match.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'No pudimos cargar los artículos relevantes.';
}
