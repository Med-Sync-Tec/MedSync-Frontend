import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@ui/cards/StatCard';
import { ArticleCard } from '@ui/cards/ArticleCard';
import { ArticleDetailDrawer } from '@ui/cards/ArticleDetailDrawer';
import { Pagination } from '@ui/buttons/Pagination';
import { SegmentedToggle } from '@ui/buttons/SegmentedToggle';
import { AnalyzeArticleButton } from '@features/news/components/AnalyzeArticleButton';
import {
  useRecentArticles,
  useSyncArticles,
  useMarkArticleAsRead,
  useSaveArticle,
  useUnsaveArticle,
  useSavedArticles,
} from '@features/news/queries';
import type { Article } from '@features/news/types';
import { useEspecialidades } from '@features/matching/queries';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';
import { useDashboardData } from '@features/dashboard/queries';
import { fetchMedicamentos } from '@features/inventory/api';
import { RefreshCw, Bookmark } from 'lucide-react';

type ViewMode = 'noticias' | 'guardadas';
type SavedFilterKey = 'all' | 'alta_evidencia' | 'recientes';

const CATEGORY_MAP: Record<string, string> = {
  enfermedad: 'cardiologia',
  sintoma: 'neurologia',
  tratamiento: 'endocrinologia',
  medicamento: 'farmacologia',
};

const PAGE_SIZE = 10;

const VIEW_OPTIONS = [
  { value: 'noticias' as ViewMode, label: 'Explorar', icon: <span className="material-symbols-outlined text-[16px]">explore</span> },
  { value: 'guardadas' as ViewMode, label: 'Guardadas', icon: <Bookmark size={14} /> },
];

function formatTimeAgo(dateStr: string): string {
  const diffHrs = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Hace un momento';
  if (diffHrs < 24) return `Hace ${diffHrs} horas`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}

export const CooDashboardPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('noticias');
  const [page, setPage] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [savedFilter, setSavedFilter] = useState<SavedFilterKey>('all');
  const [savedPage, setSavedPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.openArticle) {
      setSelectedArticle(location.state.openArticle);
      if (location.state.targetViewMode) {
        setViewMode(location.state.targetViewMode);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const { data, isLoading, isError } = useRecentArticles(page, PAGE_SIZE);
  const { data: savedData, isLoading: isLoadingSaved, isError: isErrorSaved } = useSavedArticles(0, 200);
  const { data: dashboardData } = useDashboardData();
  const { data: medData } = useQuery({
    queryKey: ['medicamentos-count'],
    queryFn: () => fetchMedicamentos({ size: 1 }),
  });

  const totalArticulos = data?.total ?? 0;
  const totalMedicamentos = medData?.totalElements ?? 0;
  const sinLeer = dashboardData?.no_leidos?.length ?? 0;
  const altaEvidencia = dashboardData?.alta_evidencia?.length ?? 0;
  const { byId: especialidadesById } = useEspecialidades();
  const syncMutation = useSyncArticles();
  const markAsReadMutation = useMarkArticleAsRead();
  const saveMutation = useSaveArticle();
  const unsaveMutation = useUnsaveArticle();

  const articles = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  // === Saved articles ===
  const allSavedArticles = savedData?.items ?? [];
  const totalSaved = savedData?.total ?? 0;

  const highEvidenceSaved = useMemo(
    () => allSavedArticles.filter(a => a.tipoPublicacion === 'Journal Article'),
    [allSavedArticles]
  );
  const recentSaved = useMemo(
    () => allSavedArticles.filter(a => {
      const diffHrs = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
      return diffHrs < 48;
    }),
    [allSavedArticles]
  );

  const filteredSavedArticles = useMemo(() => {
    let list = allSavedArticles;
    if (savedFilter === 'alta_evidencia') list = highEvidenceSaved;
    if (savedFilter === 'recientes') list = recentSaved;
    return list;
  }, [savedFilter, allSavedArticles, highEvidenceSaved, recentSaved]);

  const savedTotalPages = Math.ceil(filteredSavedArticles.length / PAGE_SIZE);
  const paginatedSavedArticles = filteredSavedArticles.slice(
    (savedPage - 1) * PAGE_SIZE,
    savedPage * PAGE_SIZE,
  );

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

  const handleUnsaveSaved = (article: Article) => {
    unsaveMutation.mutate(article.id);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(0);
    setSavedPage(1);
  };

  const handleSavedFilterChange = (filter: SavedFilterKey) => {
    setSavedFilter(filter);
    setSavedPage(1);
  };

  return (
    <>
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="relative overflow-hidden rounded-2xl text-white p-6 shadow-xl flex flex-col justify-between min-h-[180px]"
            style={{ background: 'linear-gradient(135deg, var(--color-welcome-from) 0%, var(--color-welcome-to) 100%)' }}
          >
            <div className="absolute top-5 right-5 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-xl">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px] text-white/80">inventory_2</span>
            </div>
            <div className="relative z-10 pr-16">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 text-blue-100 px-2.5 py-1 rounded-full mb-3">
                <span className="material-symbols-outlined text-[14px]">business_center</span>
                PANEL OPERACIONES
              </span>
              <h1 className="text-xl sm:text-2xl font-bold">Panel de Operaciones</h1>
              <p className="text-blue-100 text-sm mt-1">
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/5 select-none pointer-events-none">
              warehouse
            </span>
          </div>

          {/* KPI Cards — switch based on viewMode */}
          {viewMode === 'noticias' ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                label="Artículos PubMed"
                value={totalArticulos}
                icon={<span className="material-symbols-outlined text-xl">library_books</span>}
                iconBg="var(--color-info-subtle)"
                iconColor="var(--color-info)"
              />
              <StatCard
                label="Sin leer"
                value={sinLeer}
                icon={<span className="material-symbols-outlined text-xl">mark_email_unread</span>}
                iconBg="var(--color-danger-subtle)"
                iconColor="var(--color-danger)"
              />
              <StatCard
                label="Medicamentos"
                value={totalMedicamentos}
                icon={<span className="material-symbols-outlined text-xl">medication</span>}
                iconBg="var(--color-caution-subtle)"
                iconColor="var(--color-caution)"
              />
              <StatCard
                label="Alta evidencia"
                value={altaEvidencia}
                icon={<span className="material-symbols-outlined text-xl">verified</span>}
                iconBg="var(--color-success-subtle)"
                iconColor="var(--color-success-strong)"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div onClick={() => handleSavedFilterChange('all')} className={`cursor-pointer transition-all ${savedFilter === 'all' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Total Guardados"
                  value={totalSaved}
                  icon={<span className="material-symbols-outlined text-xl">bookmark_added</span>}
                  iconBg="var(--color-info-subtle)"
                  iconColor="var(--color-info)"
                />
              </div>
              <div onClick={() => handleSavedFilterChange('alta_evidencia')} className={`cursor-pointer transition-all ${savedFilter === 'alta_evidencia' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Alta Evidencia"
                  value={highEvidenceSaved.length}
                  icon={<span className="material-symbols-outlined text-xl">verified</span>}
                  iconBg="var(--color-caution-subtle)"
                  iconColor="var(--color-caution)"
                />
              </div>
              <div onClick={() => handleSavedFilterChange('recientes')} className={`cursor-pointer transition-all ${savedFilter === 'recientes' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Recientes (48h)"
                  value={recentSaved.length}
                  icon={<span className="material-symbols-outlined text-xl">schedule</span>}
                  iconBg="var(--color-success-subtle)"
                  iconColor="var(--color-success-strong)"
                />
              </div>
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
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-4">
              <SegmentedToggle options={VIEW_OPTIONS} value={viewMode} onChange={handleViewModeChange} />
            </div>
            <div className="flex items-center gap-3">
              {viewMode === 'noticias' && (
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
              )}
              {viewMode === 'guardadas' && savedFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSavedFilterChange('all')}
                  className="text-sm text-primary font-medium hover:underline shrink-0"
                >
                  Ver todos
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {viewMode === 'noticias' ? (
              <>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-surface-subtle animate-pulse rounded-2xl border border-border-strong" />
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
                          specialtyVisual={specialtyVisual}
                          timestamp={timeAgo}
                          title={article.titulo}
                          excerpt={article.abstractText}
                          source={article.revista}
                          matchText="PubMed"
                          matchVariant="normal"
                          saved={savedIds.has(article.id)}
                          onSave={(e?: React.MouseEvent) => { e?.stopPropagation(); toggleSave(article.id); }}
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
              </>
            ) : (
              <>
                {isLoadingSaved ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-surface-subtle animate-pulse rounded-2xl border border-border-strong" />
                  ))
                ) : isErrorSaved ? (
                  <div className="p-8 text-center bg-danger-subtle rounded-2xl border border-danger/20 text-danger text-sm">
                    Error al cargar tus noticias guardadas. Intenta de nuevo más tarde.
                  </div>
                ) : paginatedSavedArticles.length === 0 ? (
                  <div className="p-8 text-center bg-surface-subtle rounded-2xl border border-border-strong text-text-muted text-sm">
                    {allSavedArticles.length === 0
                      ? 'Aún no has guardado ninguna noticia médica.'
                      : 'No hay artículos en esta categoría.'}
                  </div>
                ) : (
                  paginatedSavedArticles.map((article) => {
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
                          specialtyVisual={specialtyVisual}
                          timestamp={timeAgo}
                          title={article.titulo}
                          excerpt={article.abstractText}
                          source={article.revista}
                          matchText="PubMed"
                          matchVariant="normal"
                          saved={true}
                          onSave={(e?: React.MouseEvent) => { e?.stopPropagation(); handleUnsaveSaved(article); }}
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

                {!isLoadingSaved && !isErrorSaved && savedTotalPages > 1 && (
                  <div className="mt-6 mb-2 flex justify-center">
                    <Pagination
                      currentPage={savedPage}
                      totalPages={savedTotalPages}
                      onPageChange={setSavedPage}
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
        isHighEvidence={false}
      />
    </>
  );
};
