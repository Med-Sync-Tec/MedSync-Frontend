import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ArticleCard } from '@ui/cards/ArticleCard';
import { ArticleDetailDrawer } from '@ui/cards/ArticleDetailDrawer';
import { Pagination } from '@ui/buttons/Pagination';
import { AnalyzeArticleButton } from '@features/news/components/AnalyzeArticleButton';
import {
  useRecentArticles,
  useSyncArticles,
  useMarkArticleAsRead,
  useSaveArticle,
  useUnsaveArticle,
} from '@features/news/queries';
import type { Article } from '@features/news/types';
import { useEspecialidades } from '@features/matching/queries';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';

const CATEGORY_MAP: Record<string, string> = {
  enfermedad: 'cardiologia',
  sintoma: 'neurologia',
  tratamiento: 'endocrinologia',
  medicamento: 'farmacologia',
};

const PAGE_SIZE = 10;

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diffHrs = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Hace un momento';
  if (diffHrs < 24) return `Hace ${diffHrs} horas`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}

/**
 * COO news feed: browse recent PubMed articles, save them, and analyze with AI.
 * Analyzing an article populates its medication tags, which then surface on the
 * "Noticias por medicamento" matching screen.
 */
export const CooNewsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { data, isLoading, isError } = useRecentArticles(page, PAGE_SIZE);
  const { byId: especialidadesById } = useEspecialidades();
  const syncMutation = useSyncArticles();
  const markAsReadMutation = useMarkArticleAsRead();
  const saveMutation = useSaveArticle();
  const unsaveMutation = useUnsaveArticle();

  const articles = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    markAsReadMutation.mutate(article.id);
  };

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

  return (
    <>
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              Noticias médicas
            </h1>
            <p className="text-sm text-text-muted">
              Explora la evidencia más reciente, guárdala y analízala con IA.
            </p>
          </div>
          <button
            type="button"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm border ${
              syncMutation.isPending
                ? 'bg-surface-subtle text-text-muted cursor-not-allowed border-border-strong'
                : 'bg-surface text-primary border-primary/20 hover:bg-primary/5 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar PubMed'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-surface-subtle animate-pulse rounded-2xl border border-border-strong"
              />
            ))
          ) : isError ? (
            <div className="p-8 text-center bg-danger-subtle rounded-2xl border border-danger/20 text-danger text-sm">
              Error al cargar las noticias. Intenta de nuevo más tarde.
            </div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center bg-surface-subtle rounded-2xl border border-border-strong text-text-muted text-sm">
              No hay noticias disponibles. Sincroniza con PubMed para traer artículos.
            </div>
          ) : (
            articles.map((article) => {
              const mainTag = article.tags?.[0];
              const specialtyVisual = specialtyVisualById(article.especialidadId, especialidadesById);
              const category = mainTag?.valor || article.tipoPublicacion || 'General';
              const categoryType = (CATEGORY_MAP[mainTag?.tipo ?? ''] || 'default') as never;
              const timeAgo = article.updatedAt ? formatTimeAgo(article.updatedAt) : 'Reciente';

              return (
                <div key={article.id} onClick={() => handleOpenArticle(article)} className="cursor-pointer">
                  <ArticleCard
                    category={category}
                    categoryType={categoryType}
                    specialtyVisual={article.especialidadId ? specialtyVisual : null}
                    timestamp={timeAgo}
                    title={article.titulo}
                    excerpt={article.abstractText}
                    source={article.revista}
                    matchText="PubMed"
                    matchVariant="normal"
                    saved={savedIds.has(article.id)}
                    onSave={(e?: React.MouseEvent) => {
                      e?.stopPropagation();
                      toggleSave(article.id);
                    }}
                    url={article.url}
                    extraActions={
                      <span onClick={(e) => e.stopPropagation()}>
                        <AnalyzeArticleButton articleId={article.id} articleTitle={article.titulo} />
                      </span>
                    }
                  />
                </div>
              );
            })
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="mt-6 mb-2 flex justify-center">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </div>
      </main>

      <ArticleDetailDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isHighEvidence={false}
      />
    </>
  );
};
