import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  FileSearch,
  History,
  ListFilter,
  Plus,
  Users,
} from 'lucide-react';
import { PatientDetailCard } from '@ui/cards/PatientDetailCard';
import { ConsultationCard } from '@ui/cards/ConsultationCard';
import { SOAPModal } from '@ui/feedback/SOAPModal';
import { MOCK_CONSULTATIONS } from '@mocks/consultations';
import { MOCK_PATIENT } from '@mocks/patients';
import type { Consultation } from '@features/consultations/types';

type TabId = 'historial' | 'resumen' | 'documentos' | 'vitales';

interface TabDef {
  id: TabId;
  label: string;
  count?: number;
  disabled?: boolean;
}

const yearFormatter = new Intl.DateTimeFormat('es-MX', { year: 'numeric' });

function groupByYear(items: Consultation[]): Array<[string, Consultation[]]> {
  const groups = new Map<string, Consultation[]>();
  for (const c of items) {
    const key = yearFormatter.format(new Date(c.date));
    const list = groups.get(key) ?? [];
    list.push(c);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
}

export const ConsultationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('historial');

  const selectedConsultation = useMemo(
    () => MOCK_CONSULTATIONS.find((c) => c.id === selectedConsultationId),
    [selectedConsultationId]
  );

  const sortedConsultations = useMemo(
    () =>
      [...MOCK_CONSULTATIONS].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    []
  );

  const grouped = useMemo(() => groupByYear(sortedConsultations), [sortedConsultations]);

  const tabs: TabDef[] = [
    { id: 'historial', label: 'Historial', count: sortedConsultations.length },
    { id: 'resumen', label: 'Resumen', disabled: true },
    { id: 'documentos', label: 'Documentos', disabled: true },
    { id: 'vitales', label: 'Signos vitales', disabled: true },
  ];

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
            <span className="text-text-primary font-medium truncate">
              {MOCK_PATIENT.patient.nombre}
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
          <span className="px-2 text-[11px] font-mono text-text-subtle tabular-nums">
            12 / 84
          </span>
          <button
            type="button"
            aria-label="Siguiente paciente"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border-subtle bg-surface text-text-muted hover:text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0">
          <div className="lg:sticky lg:top-20">
            <PatientDetailCard
              patient={MOCK_PATIENT.patient}
              expediente={MOCK_PATIENT.expediente}
              consultas={MOCK_PATIENT.consultas}
              lastActivityAuthor="Dra. Ana Martínez"
              lastActivityAt={MOCK_PATIENT.patient.updatedAt}
            />
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
                      {tab.disabled && (
                        <span className="text-[9px] uppercase tracking-wide text-text-subtle ml-0.5">
                          Pronto
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
                  onClick={() => navigate('/medical-record/new-soap')}
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
                {sortedConsultations.length === 0 ? (
                  <EmptyState />
                ) : (
                  <Timeline groups={grouped} onViewSOAP={setSelectedConsultationId} />
                )}
              </>
            )}
          </div>

          {activeTab !== 'historial' && <PlaceholderPanel label={currentTabLabel(activeTab, tabs)} />}
        </section>
      </div>

      {selectedConsultation && (
        <SOAPModal
          isOpen={Boolean(selectedConsultationId)}
          onClose={() => setSelectedConsultationId(null)}
          date={selectedConsultation.date}
          doctorName={selectedConsultation.doctorName}
          soap={selectedConsultation.soap}
        />
      )}
    </main>
  );
};

function currentTabLabel(id: TabId, tabs: TabDef[]): string {
  return tabs.find((t) => t.id === id)?.label ?? '';
}

interface TimelineProps {
  groups: Array<[string, Consultation[]]>;
  onViewSOAP: (id: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ groups, onViewSOAP }) => {
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
              {items.map((consultation) => (
                <li key={consultation.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[29px] top-5 w-2 h-2 rounded-full bg-surface border-2 border-border-strong"
                  />
                  <ConsultationCard
                    consultation={consultation}
                    onViewSOAP={onViewSOAP}
                  />
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

const PlaceholderPanel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-border-strong bg-surface-subtle">
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-text-subtle mb-3">
      <FileSearch size={18} strokeWidth={2} aria-hidden="true" />
    </span>
    <h3 className="text-sm font-semibold text-text-primary tracking-tight">{label} — en camino</h3>
    <p className="mt-1 text-xs text-text-muted max-w-xs">
      Esta sección se habilitará cuando el backend exponga los endpoints correspondientes.
    </p>
  </div>
);
