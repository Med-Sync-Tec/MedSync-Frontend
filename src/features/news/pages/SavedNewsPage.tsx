import React, { useState, useMemo } from 'react';
import { StatCard } from '@ui/cards/StatCard';
import { ArticleCard } from '@ui/cards/ArticleCard';
import { ArticleDetailDrawer } from '@ui/cards/ArticleDetailDrawer';
import { useSavedArticles, useUnsaveArticle, useMarkArticleAsRead } from '@features/news/queries';
import type { Article } from '@features/news/types';
import { useAuthStore } from '@features/auth/store';
import { Pagination } from '@ui/buttons/Pagination';
import { Bookmark } from 'lucide-react';
import { useSearchStore } from '@features/search/store';
import { useEspecialidades } from '@features/matching/queries';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';

const CATEGORY_MAP: Record<string, string> = {
  enfermedad: 'cardiologia',
  sintoma: 'neurologia',
  tratamiento: 'endocrinologia',
  medicamento: 'farmacologia',
};

type FilterKey = 'all' | 'alta_evidencia' | 'recientes';

export const SavedNewsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const ITEMS_PER_PAGE = 10;

  const currentUser = useAuthStore((s) => s.user);
  const doctorName = currentUser?.name ?? 'Doctor';

  const { byId: especialidadesById } = useEspecialidades();

  // Fetch ALL saved articles (large page to filter client-side)
  const { data: savedData, isLoading, isError } = useSavedArticles(0, 200);
  const unsaveMutation = useUnsaveArticle();
  const markAsReadMutation = useMarkArticleAsRead();

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    markAsReadMutation.mutate(article.id);
  };

  const toggleSave = (article: Article) => {
    unsaveMutation.mutate(article.id);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return 'Hace un momento';
    if (diffHrs < 24) return `Hace ${diffHrs} horas`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  };

  const allArticles = savedData?.items || [];
  const totalSaved = savedData?.total || 0;

  // KPI counts
  const highEvidenceArticles = useMemo(
    () => allArticles.filter(a => a.tipoPublicacion === 'Journal Article'),
    [allArticles]
  );
  const recentArticles = useMemo(
    () => allArticles.filter(a => {
      const diffHrs = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
      return diffHrs < 48;
    }),
    [allArticles]
  );

  const query = useSearchStore((s) => s.query);

  // Filtered list based on active KPI and search query
  const filteredArticles = useMemo(() => {
    let list = allArticles;
    if (activeFilter === 'alta_evidencia') list = highEvidenceArticles;
    if (activeFilter === 'recientes') list = recentArticles;

    const normalize = (str?: string | null) => {
      if (!str) return '';
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const q = normalize(query.trim());
    if (!q) return list;

    return list.filter((a) => {
      if (normalize(a.titulo).includes(q)) return true;
      if (normalize(a.abstractText).includes(q)) return true;
      if (a.tags?.some((t) => normalize(t.valor).includes(q))) return true;
      
      const specialty = a.especialidadId ? especialidadesById.get(a.especialidadId) : null;
      if (specialty) {
        if (normalize(specialty.nombre).includes(q)) return true;
      }

      return false;
    });
  }, [activeFilter, allArticles, highEvidenceArticles, recentArticles, query]);

  // Client-side pagination on filtered list
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (filter: FilterKey) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const filterLabels: Record<FilterKey, string> = {
    all: 'Todos los artículos guardados',
    alta_evidencia: 'Artículos de Alta Evidencia',
    recientes: 'Artículos recientes (48h)',
  };

  return (
    <>
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Welcome card */}
          <div
            className="relative overflow-hidden rounded-2xl text-white p-6 shadow-xl flex flex-col justify-between min-h-[180px]"
            style={{ background: 'linear-gradient(135deg, var(--color-welcome-from) 0%, var(--color-welcome-to) 100%)' }}
          >
            <div className="absolute top-5 right-5 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-xl">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px] text-white/80">bookmark</span>
            </div>

            <div className="relative z-10 pr-16">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 text-blue-100 px-2.5 py-1 rounded-full mb-3">
                <Bookmark size={14} />
                BIBLIOTECA PERSONAL
              </span>
              <h1 className="text-xl sm:text-2xl font-bold">Noticias Guardadas</h1>
              <p className="text-blue-100 text-sm mt-1">
                Tus artículos médicos marcados para consulta posterior, {doctorName}.
              </p>
            </div>

            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/5 select-none pointer-events-none">
              library_books
            </span>
          </div>

          {/* KPI Cards — each one filters the list below */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`cursor-pointer transition-all text-left w-full ${activeFilter === 'all' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}
            >
              <StatCard
                label="Total Guardados"
                value={totalSaved}
                icon={<span className="material-symbols-outlined text-xl">bookmark_added</span>}
                iconBg="var(--color-info-subtle)"
                iconColor="var(--color-info)"
              />
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('alta_evidencia')}
              className={`cursor-pointer transition-all text-left w-full ${activeFilter === 'alta_evidencia' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}
            >
              <StatCard
                label="Alta Evidencia"
                value={highEvidenceArticles.length}
                icon={<span className="material-symbols-outlined text-xl">verified</span>}
                iconBg="var(--color-caution-subtle)"
                iconColor="var(--color-caution)"
              />
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('recientes')}
              className={`cursor-pointer transition-all text-left w-full ${activeFilter === 'recientes' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}
            >
              <StatCard
                label="Recientes (48h)"
                value={recentArticles.length}
                icon={<span className="material-symbols-outlined text-xl">schedule</span>}
                iconBg="var(--color-success-subtle)"
                iconColor="var(--color-success-strong)"
              />
            </button>
            <div className="opacity-80">
              <StatCard
                label="Colecciones"
                value={1}
                icon={<span className="material-symbols-outlined text-xl">folder_special</span>}
                iconBg="var(--color-danger-subtle)"
                iconColor="var(--color-danger)"
              />
            </div>
          </div>

        </div>

        {/* Article list */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              {filterLabels[activeFilter]}
            </h2>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => handleFilterChange('all')}
                className="text-sm text-primary font-medium hover:underline shrink-0"
              >
                Ver todos
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {isLoading && new Array(3).fill(null).map((_, i) => (
              <div key={`skeleton-saved-news-item-${i}`} className="h-32 bg-surface-subtle animate-pulse rounded-2xl border border-border-strong" />
            ))}
            {!isLoading && isError && (
              <div className="p-8 text-center bg-danger-subtle rounded-2xl border border-danger/20 text-danger text-sm">
                Error al cargar tus noticias guardadas. Por favor, intenta de nuevo más tarde.
              </div>
            )}
            {!isLoading && !isError && paginatedArticles.length === 0 && (
              <div className="p-8 text-center bg-surface-subtle rounded-2xl border border-border-strong text-text-muted text-sm">
                {allArticles.length === 0
                  ? 'Aún no has guardado ninguna noticia médica.'
                  : 'No hay artículos en esta categoría.'}
              </div>
            )}
            {!isLoading && !isError && paginatedArticles.length > 0 && (
              <>
                {paginatedArticles.map((article: Article) => {
                  const mainTag = article.tags?.[0];
                  const category = mainTag?.valor || article.tipoPublicacion || 'General';
                  const categoryType = (CATEGORY_MAP[mainTag?.tipo ?? ''] || 'default') as never;
                  const timeAgo = article.updatedAt ? formatTimeAgo(article.updatedAt) : 'Reciente';
                  const specialtyVisual = specialtyVisualById(
                    article.especialidadId,
                    especialidadesById,
                  );

                  return (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => handleOpenArticle(article)}
                      className="cursor-pointer w-full text-left"
                    >
                      <ArticleCard
                        category={category}
                        categoryType={categoryType}
                        specialtyVisual={specialtyVisual}
                        timestamp={timeAgo}
                        title={article.titulo}
                        excerpt={article.abstractText}
                        source={article.revista}
                        matchText="PubMed"
                        matchVariant="normal"
                        saved={true}
                        onSave={(e?: React.MouseEvent) => { e?.stopPropagation(); toggleSave(article); }}
                      />
                    </button>
                  );
                })}

                {totalPages > 1 && (
                  <div className="mt-6 mb-2 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </main>

      <ArticleDetailDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isHighEvidence={selectedArticle?.tipoPublicacion === 'Journal Article'}
      />
    </>
  );
};
