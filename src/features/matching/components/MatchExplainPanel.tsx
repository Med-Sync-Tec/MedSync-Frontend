import React, { useEffect } from 'react';
import { Link2, X } from 'lucide-react';
import type { ContextoTipo, PacienteContexto } from '@features/patients/schemas';
import type { MatchingArticle } from '../schemas';
import { matchKey, tagMatchKey } from '../useMatchIntersection';
import { TIPO_PALETTES, TIPO_ORDER } from '../palette';
import type { SpecialtyVisual } from '../specialtyVisuals';
import { TagChip } from './TagChip';

interface MatchExplainPanelProps {
  open: boolean;
  onClose: () => void;
  article: MatchingArticle | null;
  contextos: PacienteContexto[];
  matchedTagPairs: Set<string>;
  especialidadName: string | null;
  specialtyVisual?: SpecialtyVisual | null;
  /** Optional scroll target for the "Editar contexto" footer link. */
  onJumpToContextos?: () => void;
}

/**
 * Slide-over side panel that explains why an article matched the patient.
 * Two-column comparison: contextos on the left, article tags on the right.
 * Matched rows are highlighted with the {@code active} palette in both
 * columns so the doctor can see the connection visually.
 *
 * Closes on Escape and on backdrop click — the focus management is kept
 * intentionally minimal here; the trigger button receives focus back
 * naturally because the panel does not portal outside the article card.
 */
export const MatchExplainPanel: React.FC<MatchExplainPanelProps> = ({
  open,
  onClose,
  article,
  contextos,
  matchedTagPairs,
  especialidadName,
  specialtyVisual,
  onJumpToContextos,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !article) return null;

  const matchedKeys = new Set<string>();
  for (const tag of article.tags) {
    if (matchedTagPairs.has(tagMatchKey(article.id, tag.id))) {
      matchedKeys.add(matchKey(tag.tipo as ContextoTipo, tag.valor));
    }
  }

  const groupedContextos = TIPO_ORDER.reduce<Record<ContextoTipo, PacienteContexto[]>>(
    (acc, tipo) => {
      acc[tipo] = contextos.filter((c) => c.tipo === tipo);
      return acc;
    },
    { enfermedad: [], sintoma: [], tratamiento: [], medicamento: [] },
  );

  const matchCount = matchedKeys.size;
  const totalTags = article.tags.length;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Por qué coincide este artículo">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="flex-1 bg-black/30 backdrop-blur-[1px]"
      />
      <aside className="w-full max-w-[640px] h-full bg-surface shadow-2xl flex flex-col border-l border-border-subtle">
        <header className="px-5 pt-4 pb-3 border-b border-border-subtle flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              <Link2 size={12} strokeWidth={2.5} aria-hidden="true" />
              ¿Por qué coincide?
            </div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight leading-snug line-clamp-2">
              {article.titulo}
            </h3>
            {specialtyVisual ? (
              <span
                className={`inline-flex items-center gap-1 h-5 px-2 rounded-full border text-[10px] font-semibold tracking-tight ${specialtyVisual.badgeBg} ${specialtyVisual.badgeText} ${specialtyVisual.badgeBorder}`}
              >
                <specialtyVisual.Icon size={11} strokeWidth={2.2} aria-hidden="true" />
                <span className="max-w-[200px] truncate">{specialtyVisual.name}</span>
              </span>
            ) : (
              <p className="text-[11px] text-text-subtle tracking-tight">
                {especialidadName ?? 'Sin especialidad asignada'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md border border-border-subtle bg-surface text-text-muted hover:text-text-primary hover:bg-surface-muted hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <X size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <p className="text-[12px] text-text-primary tracking-tight">
            Este artículo coincide porque comparte la especialidad{' '}
            <span className="font-semibold">
              {especialidadName ?? 'sin asignar'}
            </span>{' '}
            y <span className="font-semibold">{matchCount}</span>{' '}
            {matchCount === 1 ? 'de sus tags está' : 'de sus tags están'} en el contexto
            clínico del paciente
            {totalTags > 0 && ` (de ${totalTags} en total)`}.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-5 px-5 py-4">
          <section aria-label="Contexto del paciente" className="min-w-0">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted mb-2">
              Contexto del paciente
            </h4>
            <div className="space-y-3">
              {TIPO_ORDER.map((tipo) => {
                const items = groupedContextos[tipo];
                if (items.length === 0) return null;
                return (
                  <div key={tipo}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-subtle mb-1.5 flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`inline-block w-1.5 h-1.5 rounded-full ${TIPO_PALETTES[tipo].dot}`}
                      />
                      {TIPO_PALETTES[tipo].label}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {items.map((ctx) => (
                        <li key={ctx.id}>
                          <TagChip
                            tipo={ctx.tipo}
                            valor={ctx.valor}
                            matched={matchedKeys.has(matchKey(ctx.tipo, ctx.valor))}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {contextos.length === 0 && (
                <p className="text-[12px] text-text-muted tracking-tight">
                  El paciente aún no tiene contexto clínico registrado.
                </p>
              )}
            </div>
          </section>

          <section aria-label="Tags del artículo" className="min-w-0">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted mb-2">
              Tags del artículo
            </h4>
            {article.tags.length === 0 ? (
              <p className="text-[12px] text-text-muted tracking-tight">
                Este artículo aún no tiene tags clínicos. Analízalo con IA para
                extraerlos.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <li key={tag.id}>
                    <TagChip
                      tipo={tag.tipo as ContextoTipo}
                      valor={tag.valor}
                      matched={matchedTagPairs.has(tagMatchKey(article.id, tag.id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {onJumpToContextos && (
          <footer className="px-5 py-3 border-t border-border-subtle bg-surface-subtle">
            <button
              type="button"
              onClick={() => {
                onJumpToContextos();
                onClose();
              }}
              className="text-[12px] font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
            >
              Editar contexto del paciente →
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
};
