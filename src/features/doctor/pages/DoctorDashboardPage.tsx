import React, { useState } from 'react';
import { StatCard } from '@ui/cards/StatCard';
import { ArticleCard } from '@ui/cards/ArticleCard';
import { ChatCard } from '@ui/cards/ChatCard';
import { FAB } from '@ui/buttons/FAB';

const mockStats = {
  alertasCriticas:    { value: 3, badge: '+2 nuevos' },
  coincidenciasMedia: { value: 12 },
  coincidenciasBaja:  { value: 8 },
  totalCoincidencias: { value: 28 },
};

const mockArticles = [
  {
    id: '1',
    category: 'Farmacología',
    categoryType: 'farmacologia' as const,
    timestamp: 'Hace 2 horas',
    title: 'Nueva interacción descubierta entre metformina y estatinas en pacientes diabéticos',
    excerpt: 'Un estudio reciente publicado en NEJM revela una interacción significativa entre metformina y rosuvastatina que puede aumentar el riesgo de miopatía en pacientes con DM2.',
    source: 'NEJM',
    matchText: '3 coincidencias',
    matchVariant: 'alert' as const,
  },
  {
    id: '2',
    category: 'Cardiología',
    categoryType: 'cardiologia' as const,
    timestamp: 'Hace 5 horas',
    title: 'Actualización en guías de manejo de hipertensión arterial 2025',
    excerpt: 'La Sociedad Europea de Cardiología actualiza sus guías de práctica clínica para el manejo de HTA, con nuevos umbrales de tratamiento y algoritmos simplificados.',
    source: 'ESC Guidelines',
    matchText: '5 coincidencias',
    matchVariant: 'normal' as const,
  },
  {
    id: '3',
    category: 'Endocrinología',
    categoryType: 'endocrinologia' as const,
    timestamp: 'Hace 1 día',
    title: 'Inhibidores SGLT-2 muestran beneficio adicional en insuficiencia cardíaca con FEr',
    excerpt: 'Los resultados del ensayo EMPEROR-Reduced confirman la reducción del 25% en eventos cardiovasculares mayores con empagliflozina independientemente del estado diabético.',
    source: 'Lancet',
    matchText: '2 coincidencias',
    matchVariant: 'normal' as const,
  },
  {
    id: '4',
    category: 'Infectología',
    categoryType: 'infecciosas' as const,
    timestamp: 'Hace 2 días',
    title: 'Resistencia antimicrobiana: nuevas estrategias de desescalada en UTI',
    excerpt: 'Revisión sistemática de estrategias de desescalada antibiótica en UCI que demuestra reducción de resistencia sin impacto negativo en mortalidad a 30 días.',
    source: 'Clin Infect Dis',
    matchText: '1 coincidencia',
    matchVariant: 'normal' as const,
  },
  {
    id: '5',
    category: 'Neurología',
    categoryType: 'neurologia' as const,
    timestamp: 'Hace 3 días',
    title: 'Terapia anticoagulante en fibrilación auricular: cuándo y cómo revertir',
    excerpt: 'Guía práctica actualizada para el manejo de sangrado en pacientes anticoagulados con FA, incluyendo el uso de agentes reversores de nueva generación.',
    source: 'Stroke Journal',
    matchText: '4 coincidencias',
    matchVariant: 'alert' as const,
  },
];

export const DoctorDashboardPage: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

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
            <StatCard
              label="Alertas Críticas"
              value={mockStats.alertasCriticas.value}
              icon={<span className="material-symbols-outlined text-xl">emergency</span>}
              badge={mockStats.alertasCriticas.badge}
              badgeVariant="warning"
              iconBg="var(--color-danger-subtle)"
              iconColor="var(--color-danger)"
            />
            <StatCard
              label="Coincidencias Media"
              value={mockStats.coincidenciasMedia.value}
              icon={<span className="material-symbols-outlined text-xl">warning</span>}
              iconBg="var(--color-info-subtle)"
              iconColor="var(--color-info)"
            />
            <StatCard
              label="Coincidencias Baja"
              value={mockStats.coincidenciasBaja.value}
              icon={<span className="material-symbols-outlined text-xl">info</span>}
              iconBg="var(--color-caution-subtle)"
              iconColor="var(--color-caution)"
            />
            <StatCard
              label="Total Coincidencias"
              value={mockStats.totalCoincidencias.value}
              icon={<span className="material-symbols-outlined text-xl">analytics</span>}
              iconBg="var(--color-success-subtle)"
              iconColor="var(--color-success-strong)"
            />
          </div>

        </div>

        <div>
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary">Noticias Médicas Relevantes</h2>
            <button type="button" className="text-sm text-primary font-medium hover:underline shrink-0">
              Ver todas
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {mockArticles.map((article) => (
              <ArticleCard
                key={article.id}
                category={article.category}
                categoryType={article.categoryType}
                timestamp={article.timestamp}
                title={article.title}
                excerpt={article.excerpt}
                source={article.source}
                matchText={article.matchText}
                matchVariant={article.matchVariant}
                saved={savedArticles.has(article.id)}
                onSave={() => toggleSave(article.id)}
              />
            ))}
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
