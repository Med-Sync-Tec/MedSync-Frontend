import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, Search, Users } from 'lucide-react';
import { PatientCard, type PatientCardStatus } from '@ui/cards/PatientCard';
import { ApiError } from '@lib/http/errors';
import { usePatients } from '@features/patients/queries';
import { PatientListSkeleton } from '@features/patients/components/PatientListSkeleton';
import { NewPatientModal } from '@features/patients/components/NewPatientModal';
import type { Patient } from '@features/patients/schemas';

function deriveStatus(patient: Patient): PatientCardStatus {
  return patient.activo ? 'estable' : 'alta';
}

export const PatientsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = usePatients();

  const patients = useMemo<Patient[]>(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.expedienteExternoId.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const handleOpen = (id: string) => {
    setSelectedId(id);
    navigate(`/patients/${id}/history`);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            <Users size={12} strokeWidth={2} aria-hidden="true" />
            Pacientes
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Gestión de pacientes
          </h1>
          <p className="text-sm text-text-muted" aria-live="polite">
            {isLoading
              ? 'Cargando pacientes…'
              : `${patients.length} ${
                  patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'
                } en tu cartera`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center h-9 w-64 rounded-lg border border-border-subtle bg-surface focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-colors">
            <span className="pl-3 text-text-subtle flex items-center">
              <Search size={14} strokeWidth={2} aria-hidden="true" />
            </span>
            <input
              type="search"
              placeholder="Buscar por nombre o expediente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading || isError}
              className="flex-1 min-w-0 bg-transparent border-0 text-sm text-text-primary placeholder-text-subtle px-2 focus:outline-none focus:ring-0"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsNewOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
            Nuevo paciente
          </button>
        </div>
      </header>

      <section
        aria-label="Lista de pacientes"
        className="rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden"
      >
        <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between gap-3 bg-surface-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
            {isLoading
              ? 'Cargando…'
              : `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`}
            {isFetching && !isLoading ? ' · actualizando' : ''}
          </span>
          <span className="text-[11px] text-text-subtle tracking-tight">
            Haz clic en un paciente para abrir su historial
          </span>
        </div>

        {isLoading ? (
          <PatientListSkeleton rows={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : patients.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-muted" aria-live="polite">
            Sin coincidencias para &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {filtered.map((p) => (
              <li key={p.id}>
                <PatientCard
                  name={p.nombre}
                  patientId={p.expedienteExternoId}
                  status={deriveStatus(p)}
                  needsAttention={false}
                  selected={selectedId === p.id}
                  onClick={() => handleOpen(p.id)}
                  className="rounded-none"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <NewPatientModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        onCreated={(p) => {
          setIsNewOpen(false);
          navigate(`/patients/${p.id}/history`);
        }}
      />
    </main>
  );
};

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center py-16">
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-text-subtle mb-3">
      <Users size={18} strokeWidth={2} aria-hidden="true" />
    </span>
    <h3 className="text-sm font-semibold text-text-primary tracking-tight">
      Aún no tienes pacientes
    </h3>
    <p className="mt-1 text-xs text-text-muted max-w-xs">
      Los pacientes que registres aparecerán aquí para consultar su historial.
    </p>
  </div>
);

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'No pudimos cargar la lista de pacientes.';

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-danger/10 text-danger mb-3">
        <AlertTriangle size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-text-primary tracking-tight">
        Error al cargar pacientes
      </h3>
      <p className="mt-1 text-xs text-text-muted max-w-sm">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        Reintentar
      </button>
    </div>
  );
};
