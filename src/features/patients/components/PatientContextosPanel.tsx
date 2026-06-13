import React, { useMemo, useState } from 'react';
import { AlertTriangle, Link2, Plus, Stethoscope, X } from 'lucide-react';
import { ApiError } from '@lib/http/errors';
import {
  useDeletePacienteContexto,
  usePacienteContextos,
} from '@features/patients/queries';
import type { ContextoTipo, PacienteContexto } from '@features/patients/schemas';
import { matchKey } from '@features/matching/useMatchIntersection';
import { TIPO_PALETTES, TIPO_ORDER } from '@features/matching/palette';
import { NewContextoModal } from './NewContextoModal';

interface PatientContextosPanelProps {
  patientId: string;
  /** Per-contexto count of matching articles (from {@code useMatchIntersection}). */
  contextoMatchCounts?: Map<string, number>;
  /** Active filter set keyed by `${tipo}::${valor.toLowerCase()}`. */
  selectedTagKeys?: ReadonlySet<string>;
  /** Toggle a contexto's tag key in the filter set (multi-select AND). */
  onToggleFilter?: (key: string) => void;
}

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
  contextoMatchCounts,
  selectedTagKeys,
  onToggleFilter,
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
      id="patient-contextos"
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
        {error && <ErrorState message={resolveErrorMessage(error)} onRetry={() => refetch()} />}
        {!error && isLoading && <SkeletonChips />}
        {!error && !isLoading && total === 0 && <EmptyState />}
        {!error && !isLoading && total > 0 && (
          <div className="space-y-3">
            {TIPO_ORDER.filter((tipo) => grouped[tipo].length > 0).map((tipo) => (
              <div key={tipo}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-subtle mb-1.5 flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`inline-block w-1.5 h-1.5 rounded-full ${TIPO_PALETTES[tipo].dot}`}
                  />
                  {TIPO_PALETTES[tipo].label}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {grouped[tipo].map((ctx) => {
                    const key = matchKey(ctx.tipo, ctx.valor);
                    const matchCount = contextoMatchCounts?.get(ctx.id) ?? 0;
                    const selected = selectedTagKeys?.has(key) ?? false;
                    return (
                      <li key={ctx.id}>
                        <ContextoChip
                          contexto={ctx}
                          matchCount={matchCount}
                          selected={selected}
                          onToggleFilter={onToggleFilter ? () => onToggleFilter(key) : undefined}
                          onDelete={() => handleDelete(ctx.id)}
                          isDeleting={
                            deleteMutation.isPending &&
                            deleteMutation.variables === ctx.id
                          }
                        />
                      </li>
                    );
                  })}
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

interface ContextoChipProps {
  contexto: PacienteContexto;
  matchCount: number;
  selected: boolean;
  onToggleFilter?: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

/**
 * Compound chip: the body acts as a filter toggle when {@code onToggleFilter}
 * is supplied, and the trailing X always deletes. We split click targets so
 * a user filtering by tag does not accidentally delete a clinical record.
 */
const ContextoChip: React.FC<ContextoChipProps> = ({
  contexto,
  matchCount,
  selected,
  onToggleFilter,
  onDelete,
  isDeleting,
}) => {
  const palette = TIPO_PALETTES[contexto.tipo];
  const hasMatches = matchCount > 0;
  const colorClass = hasMatches ? palette.active : palette.muted;
  const mutedExtra = hasMatches ? '' : 'opacity-70';
  const ringClass = selected
    ? 'ring-2 ring-offset-1 ring-offset-surface ring-text-primary/60'
    : '';
  const filterable = Boolean(onToggleFilter && hasMatches);
  const matchLabel = matchCount === 1 ? 'artículo relevante' : 'artículos relevantes';
  const matchTooltip = hasMatches ? `Aparece en ${matchCount} ${matchLabel}.` : contexto.valor;
  const filterAriaLabel = selected
    ? `Quitar filtro: ${contexto.valor}`
    : `Filtrar artículos por: ${contexto.valor}`;

  return (
    <span
      className={`group relative inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full border text-[11px] font-medium tracking-tight ${colorClass} ${mutedExtra} ${ringClass} ${
        isDeleting ? 'opacity-50' : ''
      }`}
    >
      {hasMatches && (
        <Link2
          size={11}
          strokeWidth={2.5}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
      {filterable ? (
        <button
          type="button"
          onClick={onToggleFilter}
          aria-pressed={selected}
          aria-label={filterAriaLabel}
          className="max-w-[180px] truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          title={`Aparece en ${matchCount} ${matchLabel}.`}
        >
          {contexto.valor}
        </button>
      ) : (
        <span
          className="max-w-[180px] truncate"
          title={matchTooltip}
        >
          {contexto.valor}
        </span>
      )}
      {hasMatches && (
        <span
          className={`shrink-0 inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold tabular-nums ${
            colorClass.includes('text-white') ? 'text-white/90' : 'text-text-muted'
          }`}
          aria-label={`Aparece en ${matchCount} artículos relevantes`}
        >
          ×{matchCount}
        </span>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label={`Eliminar ${palette.label.toLowerCase()}: ${contexto.valor}`}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed"
      >
        <X size={10} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </span>
  );
};

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
        key={`skeleton-chip-${i}-w${w}`}
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
