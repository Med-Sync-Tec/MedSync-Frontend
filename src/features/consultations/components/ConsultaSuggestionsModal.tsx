import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, CheckSquare, Info, Sparkles, Square, X } from 'lucide-react';
import { ContextoTipoSchema, type ContextoTipo } from '@features/patients/schemas';
import type { ConsultaAnalysisResponse } from '../schemas';

interface ConsultaSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Drives which inner panel is rendered. */
  phase: 'loading' | 'result' | 'empty-vocab' | 'error';
  result: ConsultaAnalysisResponse | null;
  errorMessage: string | null;
  /** True while the bulk-add mutation is in flight. */
  isSaving: boolean;
  /**
   * Called when the doctor confirms the selected (and possibly edited)
   * suggestions. The caller fires the bulk-add mutation.
   */
  onConfirm: (entries: Array<{ tipo: ContextoTipo; valor: string }>) => void;
}

/**
 * Internal editable suggestion row. Carries the parsed {@link ContextoTipo}
 * (so accepting a row never produces an invalid bulk-add payload) plus the
 * doctor's possibly-edited {@code valor}. {@code selected} drives the
 * checkbox state.
 */
interface EditableRow {
  key: string;
  tipo: ContextoTipo;
  valor: string;
  selected: boolean;
}

/**
 * Normalizes a raw suggestion (whose {@code tipo} is a free string from the
 * backend) into a {@link ContextoTipo}-typed row. Rows that fail parsing
 * are dropped silently — the LLM is constrained to the vocabulary on the
 * backend, so this defensive parse should always succeed in practice.
 */
function toEditableRows(suggestions: ConsultaAnalysisResponse['suggestions']): EditableRow[] {
  const out: EditableRow[] = [];
  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    const parsed = ContextoTipoSchema.safeParse(s.tipo.toLowerCase());
    if (!parsed.success) continue;
    out.push({ key: `${parsed.data}-${i}`, tipo: parsed.data, valor: s.valor, selected: true });
  }
  return out;
}

export const ConsultaSuggestionsModal: React.FC<ConsultaSuggestionsModalProps> = ({
  isOpen,
  onClose,
  phase,
  result,
  errorMessage,
  isSaving,
  onConfirm,
}) => {
  const initialRows = useMemo<EditableRow[]>(
    () => (result ? toEditableRows(result.suggestions) : []),
    [result],
  );
  const [rows, setRows] = useState<EditableRow[]>(initialRows);

  // Rebind rows whenever the result envelope changes (a new analyze call
  // may produce a different suggestion set; without this reset the modal
  // would keep showing the previous batch).
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const selectedCount = rows.filter((r) => r.selected).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  const toggleAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  };

  const toggleRow = (key: string) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, selected: !r.selected } : r)),
    );
  };

  const editValor = (key: string, valor: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, valor } : r)));
  };

  const submit = () => {
    const accepted = rows
      .filter((r) => r.selected && r.valor.trim().length > 0)
      .map(({ tipo, valor }) => ({ tipo, valor: valor.trim() }));
    if (accepted.length === 0) return;
    onConfirm(accepted);
  };

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby="consulta-ai-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 max-w-none w-full h-full"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => (isSaving ? undefined : onClose())}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-popover">
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle bg-surface-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-subtle text-primary ring-1 ring-primary/15">
              <Sparkles size={18} strokeWidth={2.25} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="consulta-ai-title"
                className="text-base font-semibold tracking-tight text-text-primary"
              >
                Sugerencias de IA
              </h2>
              <p className="text-xs text-text-muted">
                Revisa y selecciona las que quieras guardar en el contexto del paciente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-text-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <p className="text-sm">Generando sugerencias…</p>
            </div>
          )}

          {phase === 'empty-vocab' && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-3 text-sm">
              <Info size={16} className="shrink-0 text-warning mt-0.5" aria-hidden="true" />
              <p className="text-text-primary">
                Tu especialidad no tiene un vocabulario clínico cargado todavía. Pide
                al COO que cargue el archivo correspondiente antes de volver a
                intentar.
              </p>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0 text-danger mt-0.5" aria-hidden="true" />
              <p className="text-text-primary">{errorMessage ?? 'Algo salió mal.'}</p>
            </div>
          )}

          {phase === 'result' && result && (
            <div className="space-y-4">
              {result.suggestions.length === 0 ? (
                <p className="text-sm text-text-muted italic">
                  La IA no encontró sugerencias relevantes en esta consulta.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-text-primary hover:bg-surface-muted transition-colors"
                    >
                      {allSelected ? (
                        <CheckSquare size={14} aria-hidden="true" />
                      ) : (
                        <Square size={14} aria-hidden="true" />
                      )}
                      {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                    </button>
                    <span>
                      {selectedCount} de {rows.length} seleccionadas
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {rows.map((row) => (
                      <li
                        key={row.key}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          row.selected
                            ? 'border-primary/30 bg-primary-subtle/40'
                            : 'border-border-subtle bg-surface-subtle/60'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleRow(row.key)}
                          className="inline-flex items-center justify-center w-5 h-5 rounded border border-border-strong text-primary"
                          aria-label={row.selected ? 'Desmarcar' : 'Marcar'}
                          aria-pressed={row.selected}
                        >
                          {row.selected && <Check size={14} aria-hidden="true" />}
                        </button>
                        <span className="text-xs uppercase tracking-wide text-text-subtle font-semibold w-24 shrink-0">
                          {row.tipo}
                        </span>
                        <input
                          type="text"
                          value={row.valor}
                          onChange={(e) => editValor(row.key, e.target.value)}
                          className="flex-1 rounded-md border border-border-subtle bg-surface px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="text-xs text-text-subtle">
                Analizado con <code className="font-mono">{result.modelUsed}</code> ·
                {' '}
                {result.promptTokens + result.completionTokens} tokens
                ({result.promptTokens} entrada / {result.completionTokens} salida)
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-subtle bg-surface-subtle">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border-strong text-text-primary text-sm font-medium hover:bg-surface-muted transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            {phase === 'result' && rows.length > 0 ? 'Cancelar' : 'Cerrar'}
          </button>
          {phase === 'result' && rows.length > 0 && (
            <button
              type="button"
              onClick={submit}
              disabled={isSaving || selectedCount === 0}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              {isSaving ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Guardando…
                </>
              ) : (
                <>
                  <Check size={14} aria-hidden="true" />
                  Guardar {selectedCount} {selectedCount === 1 ? 'sugerencia' : 'sugerencias'}
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </dialog>
  );
};
