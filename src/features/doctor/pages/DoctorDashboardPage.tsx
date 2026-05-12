import React, { useState } from 'react';
import { StatCard } from '@ui/cards/StatCard';
import { ArticleCard } from '@ui/cards/ArticleCard';
import { ChatCard } from '@ui/cards/ChatCard';
import { FAB } from '@ui/buttons/FAB';
import { useSyncArticles } from '@features/news/queries';
import type { Article } from '@features/news/types';
import { useDashboardData } from '@features/dashboard/queries';
import type { DashboardData } from '@features/dashboard/types';
import { RefreshCw } from 'lucide-react';
import { Pagination } from '@ui/buttons/Pagination';


// Mapeo de tipos de tags de backend a categorías visuales del frontend
const CATEGORY_MAP: Record<string, string> = {
  enfermedad: 'cardiologia',
  sintoma: 'neurologia',
  tratamiento: 'endocrinologia',
  medicamento: 'farmacologia',
};

export const DoctorDashboardPage: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<keyof DashboardData>('novedades_48h');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Consumir el endpoint de KPIs del dashboard
  const { data: dashboardData, isLoading, isError } = useDashboardData();
  const syncMutation = useSyncArticles();

  const handleSync = () => {
    syncMutation.mutate();
  };

  const toggleSave = (id: string) => {
    setSavedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
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

  const doctorName = 'Dr. García';

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
              <h1 className="text-xl sm:text-2xl font-bold">Buenos días, {doctorName}</h1>
              <p className="text-blue-100 text-sm mt-1">
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/5 select-none pointer-events-none">
              medical_services
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div onClick={() => { setSelectedCategory('novedades_48h'); setCurrentPage(1); }} className={`cursor-pointer transition-all ${selectedCategory === 'novedades_48h' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
              <StatCard
                label="Novedades 48h"
                value={dashboardData?.novedades_48h?.length || 0}
                icon={<span className="material-symbols-outlined text-xl">bolt</span>}
                iconBg="var(--color-info-subtle)"
                iconColor="var(--color-info)"
              />
            </div>
            <div onClick={() => { setSelectedCategory('por_especialidad'); setCurrentPage(1); }} className={`cursor-pointer transition-all ${selectedCategory === 'por_especialidad' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
              <StatCard
                label="Por Especialidad"
                value={dashboardData?.por_especialidad?.length || 0}
                icon={<span className="material-symbols-outlined text-xl">assignment</span>}
                iconBg="var(--color-success-subtle)"
                iconColor="var(--color-success-strong)"
              />
            </div>
            <div onClick={() => { setSelectedCategory('alta_evidencia'); setCurrentPage(1); }} className={`cursor-pointer transition-all ${selectedCategory === 'alta_evidencia' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
              <StatCard
                label="Alta Evidencia"
                value={dashboardData?.alta_evidencia?.length || 0}
                icon={<span className="material-symbols-outlined text-xl">verified</span>}
                iconBg="var(--color-caution-subtle)"
                iconColor="var(--color-caution)"
              />
            </div>
            <div onClick={() => { setSelectedCategory('no_leidos'); setCurrentPage(1); }} className={`cursor-pointer transition-all ${selectedCategory === 'no_leidos' ? 'ring-2 ring-primary rounded-xl' : 'opacity-80 hover:opacity-100'}`}>
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
            <h2 className="text-base sm:text-lg font-bold text-text-primary">Noticias Médicas Relevantes</h2>
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
              <button type="button" className="text-sm text-primary font-medium hover:underline shrink-0">
                Ver todas
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {isLoading ? (
              // Esqueleto de carga simple
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-surface-subtle animate-pulse rounded-2xl border border-border-strong" />
              ))
            ) : isError ? (
              <div className="p-8 text-center bg-danger-subtle rounded-2xl border border-danger/20 text-danger text-sm">
                Error al cargar las noticias médicas. Por favor, intenta de nuevo más tarde.
              </div>
            ) : !dashboardData || !dashboardData[selectedCategory] || dashboardData[selectedCategory].length === 0 ? (
              <div className="p-8 text-center bg-surface-subtle rounded-2xl border border-border-strong text-text-muted text-sm">
                No hay noticias disponibles en esta categoría.
              </div>
            ) : (
              (() => {
                const articles = dashboardData[selectedCategory];
                const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
                const paginatedArticles = articles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                return (
                  <>
                    {paginatedArticles.map((article: Article) => {
                      const mainTag = article.tags?.[0];
                      const category = mainTag?.valor || article.tipoPublicacion || 'General';
                      const categoryType = (CATEGORY_MAP[mainTag?.tipo] || 'default') as any;
                      const timeAgo = article.updatedAt ? formatTimeAgo(article.updatedAt) : 'Reciente';

                      return (
                        <ArticleCard
                          key={article.id}
                          category={category}
                          categoryType={categoryType}
                          timestamp={timeAgo}
                          title={article.titulo}
                          excerpt={article.abstractText}
                          source={article.revista}
                          matchText="PubMed"
                          matchVariant="normal"
                          saved={savedArticles.has(article.id)}
                          onSave={() => toggleSave(article.id)}
                          url={article.url}
                        />
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

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <ChatCard onClose={() => setChatOpen(false)} />
        )}
        <FAB
          label={chatOpen ? '' : 'MediBot IA'}
          icon={
            chatOpen
              ? <span className="material-symbols-outlined text-2xl">close</span>
              : <span className="material-symbols-outlined text-2xl">smart_toy</span>
          }
          onClick={() => setChatOpen((prev) => !prev)}
          aria-label={chatOpen ? 'Cerrar MediBot' : 'Abrir MediBot'}
        />
      </div>
    </>
  );
};
