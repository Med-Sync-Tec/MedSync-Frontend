import React, { useEffect } from 'react';
import { Sparkles, X, AlertCircle, Tag, Info } from 'lucide-react';
import type { AnalyzeArticleResponse } from '../schemas';

interface ArticleAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Step in the analysis lifecycle — controls which panel renders. */
  phase: 'confirm' | 'loading' | 'result' | 'error';
  /** Article title for context in the confirm/loading screens. */
  articleTitle: string;
  /** Populated when {@code phase === 'result'}. */
  result: AnalyzeArticleResponse | null;
  /** Populated when {@code phase === 'error'}. */
  errorMessage: string | null;
  /** User confirmed; callers trigger the mutation. */
  onConfirm: () => void;
}

/**
 * Three-phase modal driving the article AI analyze flow.
 *
 * - {@code confirm} — warns the doctor that the existing tag list will be
 *   replaced before invoking. This matches the backend's documented
 *   replace-on-each-call semantics.
 * - {@code loading} — visible during the Groq round-trip (typically 1–3 s,
 *   bounded by the backend's 30 s timeout).
 * - {@code result} — renders extracted tags, the resolved specialty, and a
 *   provenance footer. If {@code hadAbstract === false} the doctor sees a
 *   "fewer tags than usual — analyzed without abstract" disclaimer.
 * - {@code error} — generic error pane; caller maps backend status codes
 *   into the message.
 */
export const ArticleAnalysisModal: React.FC<ArticleAnalysisModalProps> = ({
  isOpen,
  onClose,
  phase,
  articleTitle,
  result,
  errorMessage,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby="analyze-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 max-w-none w-full h-full"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
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
                id="analyze-modal-title"
                className="text-base font-semibold tracking-tight text-text-primary"
              >
                Análisis con IA
              </h2>
              <p className="text-xs text-text-muted truncate">{articleTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {phase === 'confirm' && (
            <div className="space-y-3 text-sm text-text-primary">
              <p>
                La IA va a clasificar este artículo en una especialidad y a extraer
                etiquetas clínicas a partir del vocabulario controlado.
              </p>
              <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                <AlertCircle size={16} className="shrink-0 text-warning mt-0.5" aria-hidden="true" />
                <p className="text-text-primary">
                  Esto <strong>reemplazará</strong> cualquier etiqueta existente del
                  artículo. ¿Continuar?
                </p>
              </div>
            </div>
          )}

          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-text-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <p className="text-sm">Analizando con IA…</p>
              <p className="text-xs text-text-subtle">Esto suele tardar 1–3 segundos.</p>
            </div>
          )}

          {phase === 'result' && result && (
            <div className="space-y-4">
              {result.especialidadNombre && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted">Clasificado como:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-subtle text-primary px-2 py-0.5 text-xs font-semibold">
                    {result.especialidadNombre}
                  </span>
                </div>
              )}

              {!result.hadAbstract && (
                <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm">
                  <Info size={16} className="shrink-0 text-info mt-0.5" aria-hidden="true" />
                  <p className="text-text-primary">
                    Analizado sin <em>abstract</em> — el número de etiquetas puede ser
                    menor de lo usual.
                  </p>
                </div>
              )}

              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                  <Tag size={14} aria-hidden="true" />
                  Etiquetas extraídas
                  <span className="text-text-subtle font-normal">({result.tags.length})</span>
                </h3>
                {result.tags.length === 0 ? (
                  <p className="text-sm text-text-muted italic">Sin etiquetas.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {result.tags.map((tag) => (
                      <li
                        key={tag.id}
                        className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-subtle/60 px-3 py-2 text-sm"
                      >
                        <span className="text-xs uppercase tracking-wide text-text-subtle font-semibold w-24 shrink-0">
                          {tag.tipo.toLowerCase()}
                        </span>
                        <span className="text-text-primary">{tag.valor}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="text-xs text-text-subtle">
                Analizado con <code className="font-mono">{result.modelUsed}</code> ·
                {' '}
                {result.promptTokens + result.completionTokens} tokens
                ({result.promptTokens} entrada / {result.completionTokens} salida)
              </p>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0 text-danger mt-0.5" aria-hidden="true" />
              <p className="text-text-primary">{errorMessage ?? 'Algo salió mal.'}</p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-subtle bg-surface-subtle">
          {phase === 'confirm' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border-strong text-text-primary text-sm font-medium hover:bg-surface-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <Sparkles size={14} aria-hidden="true" />
                Analizar
              </button>
            </>
          )}
          {(phase === 'result' || phase === 'error') && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Cerrar
            </button>
          )}
        </footer>
      </div>
    </dialog>
  );
};
