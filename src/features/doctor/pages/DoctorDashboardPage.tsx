import React, { useState, useMemo } from 'react';
import { StatCard } from '@ui/cards/StatCard';
import { ArticleCard } from '@ui/cards/ArticleCard';
import { ArticleDetailDrawer } from '@ui/cards/ArticleDetailDrawer';
import { useSyncArticles, useMarkArticleAsRead } from '@features/news/queries';
import type { Article } from '@features/news/types';
import { AnalyzeArticleButton } from '@features/news/components/AnalyzeArticleButton';
import { useDashboardData } from '@features/dashboard/queries';
import type { DashboardData } from '@features/dashboard/types';
import { useAuthStore } from '@features/auth/store';
import { useSaveArticle, useUnsaveArticle } from '@features/news/queries';
import { useEspecialidades } from '@features/matching/queries';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';
import { RefreshCw } from 'lucide-react';
import { Pagination } from '@ui/buttons/Pagination';
import { useSearchStore } from '@features/search/store';


// Mapeo de tipos de tags de backend a categorías visuales del frontend
const CATEGORY_MAP: Record<string, string> = {
  enfermedad: 'cardiologia',
  sintoma: 'neurologia',
  tratamiento: 'endocrinologia',
  medicamento: 'farmacologia',
};

export const DoctorDashboardPage: React.FC = () => {
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<keyof DashboardData>('novedades_48h');
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const ITEMS_PER_PAGE = 10;

  const currentUser = useAuthStore((s) => s.user);
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();
  const doctorName = currentUser?.name ?? 'Doctor';

  const { data: dashboardData, isLoading, isError } = useDashboardData();
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
    setSavedArticles((prev) => {
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
  })();

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
                PANEL MÉDICO
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

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div onClick={() => handleSelectCategory('novedades_48h')} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'novedades_48h' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
              <StatCard
                label="Novedades 48h"
                value={dashboardData?.novedades_48h?.length || 0}
                icon={<span className="material-symbols-outlined text-xl">bolt</span>}
                iconBg="var(--color-info-subtle)"
                iconColor="var(--color-info)"
              />
            </div>
            <div onClick={() => handleSelectCategory('por_especialidad')} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'por_especialidad' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
              <StatCard
                label="Por Especialidad"
                value={dashboardData?.por_especialidad?.length || 0}
                icon={<span className="material-symbols-outlined text-xl">assignment</span>}
                iconBg="var(--color-success-subtle)"
                iconColor="var(--color-success-strong)"
              />
            </div>
            <div onClick={() => handleSelectCategory('alta_evidencia')} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'alta_evidencia' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
              <StatCard
                label="Alta Evidencia"
                value={dashboardData?.alta_evidencia?.length || 0}
                icon={<span className="material-symbols-outlined text-xl">verified</span>}
                iconBg="var(--color-caution-subtle)"
                iconColor="var(--color-caution)"
              />
            </div>
            <div onClick={() => handleSelectCategory('no_leidos')} className={`cursor-pointer transition-all ${!showAll && selectedCategory === 'no_leidos' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
              <StatCard
                label="No Leídos"
                value={dashboardData?.no_leidos?.length || 0}
                icon={<span className="material-symbols-outlined text-xl">mark_as_unread</span>}
                iconBg="var(--color-danger-subtle)"
                iconColor="var(--color-danger)"
              />
            </div>
          </div>

        </div>

        <div>
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              {showAll ? 'Todas las Noticias Médicas' : 'Noticias Médicas Relevantes'}
            </h2>
            <div className="flex items-center gap-3">
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
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-surface-subtle animate-pulse rounded-2xl border border-border-strong" />
              ))
            ) : isError ? (
              <div className="p-8 text-center bg-danger-subtle rounded-2xl border border-danger/20 text-danger text-sm">
                Error al cargar las noticias médicas. Por favor, intenta de nuevo más tarde.
              </div>
            ) : activeArticles.length === 0 ? (
              <div className="p-8 text-center bg-surface-subtle rounded-2xl border border-border-strong text-text-muted text-sm">
                No hay noticias disponibles en esta categoría.
              </div>
            ) : (
              (() => {
                const totalPages = Math.ceil(activeArticles.length / ITEMS_PER_PAGE);
                const paginatedArticles = activeArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                return (
                  <>
                    {paginatedArticles.map((article: Article) => {
                      const mainTag = article.tags?.[0];
                      const specialtyVisual = specialtyVisualById(
                        article.especialidadId,
                        especialidadesById,
                      );
                      const category = mainTag?.valor || article.tipoPublicacion || 'General';
                      const categoryType = (CATEGORY_MAP[mainTag?.tipo] || 'default') as any;
                      const timeAgo = article.updatedAt ? formatTimeAgo(article.updatedAt) : 'Reciente';

                      return (
                        <div
                          key={article.id}
                          onClick={() => handleOpenArticle(article)}
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
                            saved={savedArticles.has(article.id)}
                            onSave={(e?: React.MouseEvent) => { e?.stopPropagation(); toggleSave(article.id); }}
                            url={article.url}
                            extraActions={
                              <span onClick={(e) => e.stopPropagation()}>
                                <AnalyzeArticleButton
                                  articleId={article.id}
                                  articleTitle={article.titulo}
                                />
                              </span>
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
                );
              })()
            )}
          </div>
        </div>

      </main>

      <ArticleDetailDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isHighEvidence={selectedArticle ? altaEvidenciaIds.has(selectedArticle.id) : false}
      />
    </>
  );
};
