import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatCard } from '@ui/cards/StatCard';
import { ArticleCard } from '@ui/cards/ArticleCard';
import { ArticleDetailDrawer } from '@ui/cards/ArticleDetailDrawer';
import { useSyncArticles, useMarkArticleAsRead, useSavedArticles, useUnsaveArticle, useSaveArticle } from '@features/news/queries';
import type { Article } from '@features/news/types';
import { AnalyzeArticleButton } from '@features/news/components/AnalyzeArticleButton';
import { useDashboardData } from '@features/dashboard/queries';
import type { DashboardData } from '@features/dashboard/types';
import { useAuthStore } from '@features/auth/store';
import { useEspecialidades } from '@features/matching/queries';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';
import { RefreshCw, Bookmark } from 'lucide-react';
import { Pagination } from '@ui/buttons/Pagination';
import { SegmentedToggle } from '@ui/buttons/SegmentedToggle';
import { useSearchStore } from '@features/search/store';

type ViewMode = 'noticias' | 'guardadas';
type SavedFilterKey = 'all' | 'alta_evidencia' | 'recientes';

// Mapeo de tipos de tags de backend a categorías visuales del frontend
const CATEGORY_MAP: Record<string, string> = {
  enfermedad: 'cardiologia',
  sintoma: 'neurologia',
  tratamiento: 'endocrinologia',
  medicamento: 'farmacologia',
};

const VIEW_OPTIONS = [
  { value: 'noticias' as ViewMode, label: 'Explorar', icon: <span className="material-symbols-outlined text-[16px]">explore</span> },
  { value: 'guardadas' as ViewMode, label: 'Guardadas', icon: <Bookmark size={14} /> },
];

function renderEmptyMessage(viewMode: ViewMode, savedCount: number): string {
  if (viewMode === 'noticias') return 'No hay noticias disponibles en esta categoría.';
  if (savedCount === 0) return 'Aún no has guardado ninguna noticia médica.';
  return 'No hay artículos en esta categoría.';
}

export const DoctorDashboardPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('noticias');
  const [savedArticlesLocal, setSavedArticlesLocal] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<keyof DashboardData>('novedades_48h');
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [savedFilter, setSavedFilter] = useState<SavedFilterKey>('all');
  const ITEMS_PER_PAGE = 10;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openArticle) {
      setSelectedArticle(location.state.openArticle);
      if (location.state.targetViewMode) {
        setViewMode(location.state.targetViewMode);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const currentUser = useAuthStore((s) => s.user);
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();
  const doctorName = currentUser?.name ?? 'Doctor';

  const { data: dashboardData, isLoading, isError } = useDashboardData();
  const { data: savedData, isLoading: isLoadingSaved, isError: isErrorSaved } = useSavedArticles(0, 200);
  const { byId: especialidadesById } = useEspecialidades();
  const syncMutation = useSyncArticles();
  const markAsReadMutation = useMarkArticleAsRead();
  const saveMutation = useSaveArticle();
  const unsaveMutation = useUnsaveArticle();

  const altaEvidenciaIds = useMemo(
    () => new Set((dashboardData?.alta_evidencia ?? []).map((a) => a.id)),
    [dashboardData]
  );

  const handleSync = () => syncMutation.mutate();

  const handleSelectCategory = (cat: keyof DashboardData) => {
    setSelectedCategory(cat);
    setShowAll(false);
    setCurrentPage(1);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setCurrentPage(1);
  };

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    markAsReadMutation.mutate(article.id);
  };

  const toggleSave = (id: string) => {
    setSavedArticlesLocal((prev) => {
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
    setCurrentPage(1);
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

  const query = useSearchStore((s) => s.query);

  const normalize = (str?: string | null) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // === Noticias (Explore) articles ===
  const activeArticles = (() => {
    if (!dashboardData) return [];
    let list: Article[] = [];
    if (showAll) {
      const seen = new Set<string>();
      for (const cat of Object.values(dashboardData) as Article[][]) {
        for (const a of cat) {
          if (!seen.has(a.id)) { seen.add(a.id); list.push(a); }
        }
      }
    } else {
      list = dashboardData[selectedCategory] ?? [];
    }

    const q = normalize(query.trim());
    if (!q) return list;

    return list.filter((a) => {
      if (normalize(a.titulo).includes(q)) return true;
      if (normalize(a.abstractText).includes(q)) return true;
      if (a.tags?.some((t) => normalize(t.valor).includes(q))) return true;
      const specialty = a.especialidadId ? especialidadesById.get(a.especialidadId) : null;
      if (specialty && normalize(specialty.nombre).includes(q)) return true;
      return false;
    });
  })();

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

    const q = normalize(query.trim());
    if (!q) return list;

    return list.filter((a) => {
      if (normalize(a.titulo).includes(q)) return true;
      if (normalize(a.abstractText).includes(q)) return true;
      if (a.tags?.some((t) => normalize(t.valor).includes(q))) return true;
      const specialty = a.especialidadId ? especialidadesById.get(a.especialidadId) : null;
      if (specialty && normalize(specialty.nombre).includes(q)) return true;
      return false;
    });
  }, [savedFilter, allSavedArticles, highEvidenceSaved, recentSaved, query, especialidadesById]);

  const handleSavedFilterChange = (filter: SavedFilterKey) => {
    setSavedFilter(filter);
    setCurrentPage(1);
  };

  // Decide which article list to paginate
  const currentArticles = viewMode === 'noticias' ? activeArticles : filteredSavedArticles;
  const totalPages = Math.ceil(currentArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = currentArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const currentIsLoading = viewMode === 'noticias' ? isLoading : isLoadingSaved;
  const currentIsError = viewMode === 'noticias' ? isError : isErrorSaved;

  return (
    <>
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <div
            className="relative overflow-hidden rounded-2xl text-white p-6 shadow-xl flex flex-col justify-between min-h-[180px]"
            style={{ background: 'linear-gradient(135deg, var(--color-welcome-from) 0%, var(--color-welcome-to) 100%)' }}
          >
            <div className="absolute top-5 right-5 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-xl">
              <span className="material-symbols-outlined text-[36px] sm:text-[40px] text-white/80">account_circle</span>
            </div>

            <div className="relative z-10 pr-16">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 text-blue-100 px-2.5 py-1 rounded-full mb-3">
                <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                {' '}PANEL MÉDICO
              </span>
              <h1 className="text-xl sm:text-2xl font-bold">{greeting}, {doctorName}</h1>
              <p className="text-blue-100 text-sm mt-1">
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/5 select-none pointer-events-none">
              medical_services
            </span>
          </div>

          {/* KPI Cards — switch based on viewMode */}
          {viewMode === 'noticias' ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div role="button" tabIndex={0} onClick={() => handleSelectCategory('novedades_48h')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCategory('novedades_48h'); }} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'novedades_48h' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Novedades 48h"
                  value={dashboardData?.novedades_48h?.length || 0}
                  icon={<span className="material-symbols-outlined text-xl">bolt</span>}
                  iconBg="var(--color-info-subtle)"
                  iconColor="var(--color-info)"
                />
              </div>
              <div role="button" tabIndex={0} onClick={() => handleSelectCategory('por_especialidad')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCategory('por_especialidad'); }} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'por_especialidad' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Por Especialidad"
                  value={dashboardData?.por_especialidad?.length || 0}
                  icon={<span className="material-symbols-outlined text-xl">assignment</span>}
                  iconBg="var(--color-success-subtle)"
                  iconColor="var(--color-success-strong)"
                />
              </div>
              <div role="button" tabIndex={0} onClick={() => handleSelectCategory('alta_evidencia')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCategory('alta_evidencia'); }} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'alta_evidencia' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Alta Evidencia"
                  value={dashboardData?.alta_evidencia?.length || 0}
                  icon={<span className="material-symbols-outlined text-xl">verified</span>}
                  iconBg="var(--color-caution-subtle)"
                  iconColor="var(--color-caution)"
                />
              </div>
              <div role="button" tabIndex={0} onClick={() => handleSelectCategory('no_leidos')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCategory('no_leidos'); }} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'no_leidos' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="No Leídos"
                  value={dashboardData?.no_leidos?.length || 0}
                  icon={<span className="material-symbols-outlined text-xl">mark_as_unread</span>}
                  iconBg="var(--color-danger-subtle)"
                  iconColor="var(--color-danger)"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div role="button" tabIndex={0} onClick={() => handleSavedFilterChange('all')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSavedFilterChange('all'); }} className={`cursor-pointer transition-all ${savedFilter === 'all' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Total Guardados"
                  value={totalSaved}
                  icon={<span className="material-symbols-outlined text-xl">bookmark_added</span>}
                  iconBg="var(--color-info-subtle)"
                  iconColor="var(--color-info)"
                />
              </div>
              <div role="button" tabIndex={0} onClick={() => handleSavedFilterChange('alta_evidencia')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSavedFilterChange('alta_evidencia'); }} className={`cursor-pointer transition-all ${savedFilter === 'alta_evidencia' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
                <StatCard
                  label="Alta Evidencia"
                  value={highEvidenceSaved.length}
                  icon={<span className="material-symbols-outlined text-xl">verified</span>}
                  iconBg="var(--color-caution-subtle)"
                  iconColor="var(--color-caution)"
                />
              </div>
              <div role="button" tabIndex={0} onClick={() => handleSavedFilterChange('recientes')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSavedFilterChange('recientes'); }} className={`cursor-pointer transition-all ${savedFilter === 'recientes' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
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
                <>
                  <button
                    onClick={handleSync}
                    disabled={syncMutation.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm border
                      ${syncMutation.isPending
                        ? 'bg-surface-subtle text-text-muted cursor-not-allowed border-border-strong'
                        : 'bg-white text-primary border-primary/20 hover:bg-primary/5 active:scale-95'}`}
                  >
                    <RefreshCw className={`w-3 h-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar PubMed'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShowAll}
                    className={`text-sm font-medium hover:underline shrink-0 transition-colors ${
                      showAll ? 'text-primary font-bold' : 'text-primary'
                    }`}
                  >
                    {showAll ? '✓ Viendo todas' : 'Ver todas'}
                  </button>
                </>
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
            {currentIsLoading && new Array(3).fill(null).map((_, i) => (
              <div key={`skeleton-doctor-${i}`} className="h-32 bg-surface-subtle animate-pulse rounded-2xl border border-border-strong" />
            ))}
            {!currentIsLoading && currentIsError && (
              <div className="p-8 text-center bg-danger-subtle rounded-2xl border border-danger/20 text-danger text-sm">
                {viewMode === 'noticias'
                  ? 'Error al cargar las noticias médicas. Por favor, intenta de nuevo más tarde.'
                  : 'Error al cargar tus noticias guardadas. Por favor, intenta de nuevo más tarde.'}
              </div>
            )}
            {!currentIsLoading && !currentIsError && paginatedArticles.length === 0 && (
              <div className="p-8 text-center bg-surface-subtle rounded-2xl border border-border-strong text-text-muted text-sm">
                {renderEmptyMessage(viewMode, allSavedArticles.length)}
              </div>
            )}
            {!currentIsLoading && !currentIsError && paginatedArticles.length > 0 && (
              <>
                {paginatedArticles.map((article: Article) => {
                  const mainTag = article.tags?.[0];
                  const specialtyVisual = specialtyVisualById(
                    article.especialidadId,
                    especialidadesById,
                  );
                  const category = mainTag?.valor || article.tipoPublicacion || 'General';
                  const categoryType = (CATEGORY_MAP[mainTag?.tipo ?? ''] || 'default') as never;
                  const timeAgo = article.updatedAt ? formatTimeAgo(article.updatedAt) : 'Reciente';
                  const isSaved = viewMode === 'guardadas' || savedArticlesLocal.has(article.id);

                  return (
                    <div
                      key={article.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenArticle(article)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenArticle(article); }}
                      className="cursor-pointer"
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
                        saved={isSaved}
                        onSave={(e?: React.MouseEvent) => {
                          e?.stopPropagation();
                          if (viewMode === 'guardadas') {
                            handleUnsaveSaved(article);
                          } else {
                            toggleSave(article.id);
                          }
                        }}
                        extraActions={
                          <div role="presentation" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                            <AnalyzeArticleButton
                              articleId={article.id}
                              articleTitle={article.titulo}
                            />
                          </div>
                        }
                      />
                    </div>
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
        isHighEvidence={selectedArticle ? altaEvidenciaIds.has(selectedArticle.id) : false}
        saved={selectedArticle
          ? viewMode === 'guardadas' || savedArticlesLocal.has(selectedArticle.id)
          : false
        }
        onSave={selectedArticle ? (e?: React.MouseEvent) => {
          e?.stopPropagation();
          if (viewMode === 'guardadas') {
            handleUnsaveSaved(selectedArticle);
            setSelectedArticle(null);
          } else {
            toggleSave(selectedArticle.id);
          }
        } : undefined}
        analyzeButton={selectedArticle ? (
          <AnalyzeArticleButton
            articleId={selectedArticle.id}
            articleTitle={selectedArticle.titulo}
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-primary/30 bg-primary-subtle text-primary text-sm font-semibold hover:bg-primary/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          />
        ) : undefined}
      />
    </>
  );
};
