import React, { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Stethoscope, X } from 'lucide-react';
import { ApiError } from '@lib/http/errors';
import {
  useDeletePacienteContexto,
  usePacienteContextos,
} from '@features/patients/queries';
import type { ContextoTipo, PacienteContexto } from '@features/patients/schemas';
import { NewContextoModal } from './NewContextoModal';

interface PatientContextosPanelProps {
  patientId: string;
}

const TIPO_LABELS: Record<ContextoTipo, string> = {
  enfermedad: 'Enfermedad',
  sintoma: 'Síntoma',
  tratamiento: 'Tratamiento',
  medicamento: 'Medicamento',
};

const TIPO_STYLES: Record<ContextoTipo, string> = {
  enfermedad: 'bg-danger/10 text-danger border-danger/20',
  sintoma: 'bg-amber-100 text-amber-700 border-amber-200',
  tratamiento: 'bg-primary-subtle text-primary border-primary/20',
  medicamento: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

type Grouped = Record<ContextoTipo, PacienteContexto[]>;

const EMPTY_GROUPS: Grouped = {
  enfermedad: [],
  sintoma: [],
  tratamiento: [],
  medicamento: [],
};

function groupByTipo(items: PacienteContexto[]): Grouped {
  const groups: Grouped = {
    enfermedad: [],
    sintoma: [],
    tratamiento: [],
    medicamento: [],
  };
  for (const item of items) {
    groups[item.tipo].push(item);
  }
  return groups;
}

export const PatientContextosPanel: React.FC<PatientContextosPanelProps> = ({
  patientId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, error, refetch } = usePacienteContextos(patientId);
  const deleteMutation = useDeletePacienteContexto(patientId);

  const grouped = useMemo<Grouped>(
    () => (data ? groupByTipo(data) : EMPTY_GROUPS),
    [data],
  );

  const total = data?.length ?? 0;

  const handleDelete = (contextoId: string) => {
    deleteMutation.mutate(contextoId);
  };

  return (
    <section
      aria-labelledby="patient-contextos-title"
      className="rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden"
    >
      <header className="px-5 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Stethoscope
            size={12}
            strokeWidth={2}
            aria-hidden="true"
            className="text-text-subtle"
          />
          <h3
            id="patient-contextos-title"
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted"
          >
            Contexto clínico
          </h3>
          {total > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-mono font-semibold tabular-nums bg-surface-muted text-text-muted">
              {total}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border-subtle bg-surface text-[11px] font-medium text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <Plus size={11} strokeWidth={2.5} aria-hidden="true" />
          Agregar
        </button>
      </header>

      <div className="px-5 py-4">
        {error ? (
          <ErrorState message={resolveErrorMessage(error)} onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonChips />
        ) : total === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {(Object.keys(grouped) as ContextoTipo[])
              .filter((tipo) => grouped[tipo].length > 0)
              .map((tipo) => (
                <div key={tipo}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-subtle mb-1.5">
                    {TIPO_LABELS[tipo]}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {grouped[tipo].map((ctx) => (
                      <li key={ctx.id}>
                        <Chip
                          contexto={ctx}
                          onDelete={() => handleDelete(ctx.id)}
                          isDeleting={
                            deleteMutation.isPending &&
                            deleteMutation.variables === ctx.id
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </div>

      <NewContextoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patientId}
      />
    </section>
  );
};

interface ChipProps {
  contexto: PacienteContexto;
  onDelete: () => void;
  isDeleting: boolean;
}

const Chip: React.FC<ChipProps> = ({ contexto, onDelete, isDeleting }) => (
  <span
    className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full border text-[11px] font-medium tracking-tight ${TIPO_STYLES[contexto.tipo]} ${
      isDeleting ? 'opacity-50' : ''
    }`}
  >
    <span className="max-w-[180px] truncate" title={contexto.valor}>
      {contexto.valor}
    </span>
    <button
      type="button"
      onClick={onDelete}
      disabled={isDeleting}
      aria-label={`Eliminar ${TIPO_LABELS[contexto.tipo].toLowerCase()}: ${contexto.valor}`}
      className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-text-primary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed"
    >
      <X size={10} strokeWidth={2.5} aria-hidden="true" />
    </button>
  </span>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-2">
    <p className="text-[12px] text-text-muted tracking-tight">
      Sin contexto clínico registrado.
    </p>
    <p className="mt-0.5 text-[11px] text-text-subtle tracking-tight">
      Agrega enfermedades, síntomas, tratamientos o medicamentos relevantes.
    </p>
  </div>
);

const SkeletonChips: React.FC = () => (
  <div className="flex flex-wrap gap-1.5">
    {[80, 110, 60, 95].map((w, i) => (
      <span
        key={i}
        aria-hidden="true"
        className="inline-block h-5 rounded-full bg-surface-muted animate-pulse"
        style={{ width: w }}
      />
    ))}
  </div>
);

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div
    role="alert"
    aria-live="polite"
    className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-[12px] text-danger"
  >
    <AlertTriangle size={13} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 text-[11px] font-medium underline underline-offset-2 hover:opacity-80"
      >
        Reintentar
      </button>
    </div>
  </div>
);

function resolveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNotFound) return 'No encontramos al paciente.';
    if (error.isUnauthorized) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'No pudimos cargar el contexto clínico.';
}
