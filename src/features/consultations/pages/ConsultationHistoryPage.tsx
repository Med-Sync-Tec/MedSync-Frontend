import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  History,
  ListFilter,
  Plus,
  Users,
} from 'lucide-react';
import { PatientDetailCard } from '@ui/cards/PatientDetailCard';
import { ConsultationCard } from '@ui/cards/ConsultationCard';
import { SOAPModal } from '@ui/feedback/SOAPModal';
import { ApiError } from '@lib/http/errors';
import { usePatientDetail, usePacienteContextos } from '@features/patients/queries';
import {
  PatientDetailCardSkeleton,
  ConsultationTimelineSkeleton,
} from '@features/patients/components/PatientDetailCardSkeleton';
import { PatientContextosPanel } from '@features/patients/components/PatientContextosPanel';
import { MatchingArticlesPanel } from '@features/matching/components/MatchingArticlesPanel';
import { useMatchingArticles } from '@features/matching/queries';
import { useMatchIntersection } from '@features/matching/useMatchIntersection';
import type { Consulta, ConsultationSummary } from '@features/consultations/schemas';
import { AnalyzeConsultaButton } from '@features/consultations/components/AnalyzeConsultaButton';

type TabId = 'historial' | 'resumen' | 'documentos' | 'vitales';

interface TabDef {
  id: TabId;
  label: string;
  count?: number;
  disabled?: boolean;
}

const yearFormatter = new Intl.DateTimeFormat('es-MX', { year: 'numeric' });

function toConsultationSummary(c: Consulta): ConsultationSummary {
  return {
    id: c.id,
    date: c.fecha,
    reason: c.motivoConsulta,
    diagnosis: c.diagnostico,
    type: 'general',
  };
}

function groupByYear(items: Consulta[]): Array<[string, Consulta[]]> {
  const groups = new Map<string, Consulta[]>();
  for (const c of items) {
    const parsed = new Date(c.fecha);
    const key = Number.isNaN(parsed.getTime()) ? '—' : yearFormatter.format(parsed);
    const list = groups.get(key) ?? [];
    list.push(c);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
}

export const ConsultationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('historial');

  const { data, isLoading, error, refetch } = usePatientDetail(patientId);

  // Parallel reads driving the match indicator system. Kept here (not deeper
  // down) so the contextos panel and the matching-articles panel consume the
  // same query results and the derived intersection is computed once.
  const contextosQ = usePacienteContextos(patientId);
  const matchingQ = useMatchingArticles(patientId);
  const intersection = useMatchIntersection(contextosQ.data, matchingQ.data);

  const [selectedTagKeys, setSelectedTagKeys] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  const toggleTagFilter = useCallback((key: string) => {
    setSelectedTagKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const clearTagFilter = useCallback(() => {
    setSelectedTagKeys((prev) => (prev.size === 0 ? prev : new Set<string>()));
  }, []);


  const consultas = useMemo<Consulta[]>(() => data?.consultas ?? [], [data]);
  const sortedConsultations = useMemo(
    () =>
      [...consultas].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      ),
    [consultas],
  );

  const grouped = useMemo(() => groupByYear(sortedConsultations), [sortedConsultations]);

  const selectedConsultation = useMemo(
    () => consultas.find((c) => c.id === selectedConsultationId) ?? null,
    [consultas, selectedConsultationId],
  );

  const tabs: TabDef[] = [
    { id: 'historial', label: 'Historial', count: sortedConsultations.length },
  ];

  if (!patientId) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageError
          title="Paciente no especificado"
          message="La URL no contiene un identificador de paciente válido."
          onRetry={() => navigate('/doctor/patients')}
          retryLabel="Ir a pacientes"
        />
      </main>
    );
  }

  const patientName = data?.patient.nombre ?? 'Paciente';

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
      <nav
        aria-label="Migas de pan"
        className="flex items-center justify-between gap-3 mb-5"
      >
        <ol className="flex items-center gap-1.5 text-[13px] tracking-tight min-w-0">
          <li>
            <button
              type="button"
              onClick={() => navigate('/doctor/patients')}
              className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors"
            >
              <Users size={13} strokeWidth={2} aria-hidden="true" />
              Pacientes
            </button>
          </li>
          <li aria-hidden="true" className="text-text-subtle">
            <ChevronRightIcon size={13} strokeWidth={2} />
          </li>
          <li className="min-w-0">
            <span className="text-text-primary font-medium truncate" aria-live="polite">
              {isLoading ? 'Cargando…' : patientName}
            </span>
          </li>
          <li aria-hidden="true" className="text-text-subtle">
            <ChevronRightIcon size={13} strokeWidth={2} />
          </li>
          <li>
            <span className="text-text-muted">Historial</span>
          </li>
        </ol>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            aria-label="Paciente anterior"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border-subtle bg-surface text-text-muted hover:text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <ChevronLeft size={14} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Siguiente paciente"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border-subtle bg-surface text-text-muted hover:text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {error ? (
        <PageError
          title="Error al cargar paciente"
          message={resolveErrorMessage(error)}
          onRetry={() => refetch()}
          retryLabel="Reintentar"
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-20 space-y-4">
              {isLoading || !data ? (
                <PatientDetailCardSkeleton />
              ) : (
                <PatientDetailCard
                  patient={data.patient}
                  expediente={data.expediente ?? undefined}
                  consultas={data.consultas}
                  lastActivityAt={data.patient.updatedAt}
                />
              )}
            </div>
          </aside>

          <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-20 flex flex-col gap-6 lg:gap-8">
              {patientId && (
                <PatientContextosPanel
                  patientId={patientId}
                  contextoMatchCounts={intersection.contextoMatchCounts}
                  selectedTagKeys={selectedTagKeys}
                  onToggleFilter={toggleTagFilter}
                />
              )}
              {patientId && (
                <MatchingArticlesPanel
                  patientId={patientId}
                  contextos={contextosQ.data ?? []}
                  hasContextoQueryError={Boolean(contextosQ.error)}
                  selectedTagKeys={selectedTagKeys}
                  onClearFilter={clearTagFilter}
                />
              )}
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <div className="border-b border-border-subtle mb-5">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div
                  role="tablist"
                  aria-label="Secciones del paciente"
                  className="flex items-center gap-1 -mb-px"
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        aria-controls={`panel-${tab.id}`}
                        disabled={tab.disabled}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative inline-flex items-center gap-1.5 h-10 px-3 text-[13px] font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-t-md ${
                          isActive
                            ? 'text-text-primary'
                            : tab.disabled
                              ? 'text-text-subtle cursor-not-allowed'
                              : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {tab.label}
                        {typeof tab.count === 'number' && (
                          <span
                            className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-mono font-semibold tabular-nums ${
                              isActive
                                ? 'bg-primary-subtle text-primary'
                                : 'bg-surface-muted text-text-muted'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}

                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border-subtle bg-surface text-[12px] font-medium text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <ListFilter size={12} strokeWidth={2} aria-hidden="true" />
                    Filtrar
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/patients/${patientId}/consultas/new`)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-white text-[12px] font-medium hover:bg-primary-hover transition-colors shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                  >
                    <Plus size={12} strokeWidth={2.5} aria-hidden="true" />
                    Nueva consulta
                  </button>
                </div>
              </div>
            </div>

            <div
              id="panel-historial"
              role="tabpanel"
              aria-labelledby="tab-historial"
              hidden={activeTab !== 'historial'}
            >
              {activeTab === 'historial' && (
                <>
                  {isLoading ? (
                    <ConsultationTimelineSkeleton items={4} />
                  ) : sortedConsultations.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <Timeline
                      groups={grouped}
                      onViewSOAP={setSelectedConsultationId}
                      patientId={patientId ?? ''}
                    />
                  )}
                </>
              )}
            </div>


          </section>
        </div>
      )}

      {selectedConsultation && (
        <SOAPModal
          isOpen={Boolean(selectedConsultationId)}
          onClose={() => setSelectedConsultationId(null)}
          date={selectedConsultation.fecha}
          doctorName={data?.patient.medicoId ?? '—'}
          soap={{
            subjective: selectedConsultation.subjetivo,
            objective: selectedConsultation.objetivo,
            assessment: selectedConsultation.evaluacion,
            plan: selectedConsultation.plan,
          }}
        />
      )}
    </main>
  );
};

function resolveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'No pudimos cargar el historial del paciente.';
}

function currentTabLabel(id: TabId, tabs: TabDef[]): string {
  return tabs.find((t) => t.id === id)?.label ?? '';
}

interface TimelineProps {
  groups: Array<[string, Consulta[]]>;
  onViewSOAP: (id: string) => void;
  patientId: string;
}

const Timeline: React.FC<TimelineProps> = ({ groups, onViewSOAP, patientId }) => {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute left-[15px] top-2 bottom-2 w-px bg-border-subtle"
      />
      <ol className="space-y-8">
        {groups.map(([year, items]) => (
          <li key={year}>
            <div className="relative flex items-center gap-3 mb-3">
              <span
                aria-hidden="true"
                className="relative z-10 inline-flex items-center justify-center w-[31px] h-6 rounded-full bg-surface border border-border-strong text-[10px] font-mono font-semibold text-text-primary tabular-nums tracking-tight"
              >
                {year}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                {items.length} {items.length === 1 ? 'consulta' : 'consultas'}
              </span>
              <span aria-hidden="true" className="flex-1 h-px bg-border-subtle" />
            </div>
            <ol className="space-y-2 pl-10">
              {items.map((consulta) => (
                <li key={consulta.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[29px] top-5 w-2 h-2 rounded-full bg-surface border-2 border-border-strong"
                  />
                  <div className="flex flex-col gap-2">
                    <ConsultationCard
                      consultation={toConsultationSummary(consulta)}
                      onViewSOAP={onViewSOAP}
                    />
                    {patientId && (
                      <div className="flex justify-end">
                        <AnalyzeConsultaButton
                          consultaId={consulta.id}
                          patientId={patientId}
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-border-strong bg-surface-subtle">
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-text-subtle mb-3">
      <History size={18} strokeWidth={2} aria-hidden="true" />
    </span>
    <h3 className="text-sm font-semibold text-text-primary tracking-tight">Sin historial</h3>
    <p className="mt-1 text-xs text-text-muted">
      Este paciente aún no tiene consultas registradas.
    </p>
  </div>
);


interface PageErrorProps {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel: string;
}

const PageError: React.FC<PageErrorProps> = ({ title, message, onRetry, retryLabel }) => (
  <div
    role="alert"
    aria-live="polite"
    className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-border-subtle bg-surface shadow-card px-6"
  >
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-danger/10 text-danger mb-3">
      <AlertTriangle size={18} strokeWidth={2} aria-hidden="true" />
    </span>
    <h3 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h3>
    <p className="mt-1 text-xs text-text-muted max-w-md">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      {retryLabel}
    </button>
  </div>
);
