import React from 'react';
import { AlertTriangle, Link2, Pill } from 'lucide-react';
import type { Medicamento } from '@features/inventory/schemas';
import { matchKey } from '@features/matching/useMatchIntersection';
import { TIPO_PALETTES } from '@features/matching/palette';

interface MedicamentosPanelProps {
  medicamentos: Medicamento[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  /** Per-medication count of matching articles (keyed by medication id). */
  matchCountById: Map<string, number>;
  /** Active filter set keyed by `${tipo}::${valor.toLowerCase()}`. */
  selectedTagKeys: ReadonlySet<string>;
  /** Toggle a medication's tag key in the filter set (multi-select AND). */
  onToggleFilter: (key: string) => void;
}

const PALETTE = TIPO_PALETTES.medicamento;

/**
 * COO counterpart of {@code PatientContextosPanel}: the whole medication
 * catalog acts as the "context". Each chip is a filter toggle and shows how
 * many matching articles mention that medication. Read-only — the catalog is
 * managed from the inventory screen, not here.
 */
export const MedicamentosPanel: React.FC<MedicamentosPanelProps> = ({
  medicamentos,
  isLoading,
  hasError,
  onRetry,
  matchCountById,
  selectedTagKeys,
  onToggleFilter,
}) => {
  const total = medicamentos.length;

  return (
    <section
      aria-labelledby="coo-medicamentos-title"
      className="rounded-2xl border border-border-subtle bg-surface shadow-card overflow-hidden"
    >
      <header className="px-5 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Pill size={12} strokeWidth={2} aria-hidden="true" className="text-text-subtle" />
          <h3
            id="coo-medicamentos-title"
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted"
          >
            Catálogo de medicamentos
          </h3>
          {total > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-mono font-semibold tabular-nums bg-surface-muted text-text-muted">
              {total}
            </span>
          )}
        </div>
      </header>

      <div className="px-5 py-4">
        {hasError ? (
          <ErrorState onRetry={onRetry} />
        ) : isLoading ? (
          <SkeletonChips />
        ) : total === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {medicamentos.map((med) => {
              const key = matchKey('medicamento', med.nombre);
              const matchCount = matchCountById.get(med.id) ?? 0;
              const selected = selectedTagKeys.has(key);
              return (
                <li key={med.id}>
                  <MedicamentoChip
                    nombre={med.nombre}
                    matchCount={matchCount}
                    selected={selected}
                    onToggleFilter={() => onToggleFilter(key)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

interface MedicamentoChipProps {
  nombre: string;
  matchCount: number;
  selected: boolean;
  onToggleFilter: () => void;
}

const MedicamentoChip: React.FC<MedicamentoChipProps> = ({
  nombre,
  matchCount,
  selected,
  onToggleFilter,
}) => {
  const hasMatches = matchCount > 0;
  const colorClass = hasMatches ? PALETTE.active : PALETTE.muted;
  const mutedExtra = hasMatches ? '' : 'opacity-70';
  const ringClass = selected
    ? 'ring-2 ring-offset-1 ring-offset-surface ring-text-primary/60'
    : '';

  return (
    <span
      className={`group relative inline-flex items-center gap-1 pl-2 pr-2 py-0.5 rounded-full border text-[11px] font-medium tracking-tight ${colorClass} ${mutedExtra} ${ringClass}`}
    >
      {hasMatches && (
        <Link2 size={11} strokeWidth={2.5} aria-hidden="true" className="shrink-0" />
      )}
      {hasMatches ? (
        <button
          type="button"
          onClick={onToggleFilter}
          aria-pressed={selected}
          aria-label={
            selected ? `Quitar filtro: ${nombre}` : `Filtrar artículos por: ${nombre}`
          }
          className="max-w-[180px] truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          title={`Aparece en ${matchCount} ${
            matchCount === 1 ? 'artículo relevante' : 'artículos relevantes'
          }.`}
        >
          {nombre}
        </button>
      ) : (
        <span className="max-w-[180px] truncate" title={nombre}>
          {nombre}
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
    </span>
  );
};

const EmptyState: React.FC = () => (
  <div className="text-center py-2">
    <p className="text-[12px] text-text-muted tracking-tight">
      No hay medicamentos en el catálogo.
    </p>
    <p className="mt-0.5 text-[11px] text-text-subtle tracking-tight">
      Agrega medicamentos desde la pantalla de Inventario.
    </p>
  </div>
);

const SkeletonChips: React.FC = () => (
  <div className="flex flex-wrap gap-1.5">
    {[80, 110, 60, 95, 70].map((w, i) => (
      <span
        key={i}
        aria-hidden="true"
        className="inline-block h-5 rounded-full bg-surface-muted animate-pulse"
        style={{ width: w }}
      />
    ))}
  </div>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div
    role="alert"
    aria-live="polite"
    className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-[12px] text-danger"
  >
    <AlertTriangle size={13} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p>No pudimos cargar el catálogo de medicamentos.</p>
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
