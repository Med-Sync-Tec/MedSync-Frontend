import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ApiError } from '@lib/http/errors';
import { useAnalyzeArticle } from '../queries';
import type { AnalyzeArticleResponse } from '../schemas';
import { ArticleAnalysisModal } from './ArticleAnalysisModal';

interface AnalyzeArticleButtonProps {
  articleId: string;
  articleTitle: string;
  /** Optional callback fired with the response after a successful analyze. */
  onAnalyzed?: (result: AnalyzeArticleResponse) => void;
  /** Optional className for the trigger (default is a compact icon-text combo). */
  className?: string;
}

/**
 * Self-contained "Analyze with AI" button + modal pair for an article.
 *
 * Owns its own modal state and lifecycle: click → confirm → loading →
 * result/error. The parent only supplies the article identity. Mutation
 * cache invalidation lives inside {@code useAnalyzeArticle}, so the
 * dashboard article list refreshes automatically on the next refetch.
 */
export const AnalyzeArticleButton: React.FC<AnalyzeArticleButtonProps> = ({
  articleId,
  articleTitle,
  onAnalyzed,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'confirm' | 'loading' | 'result' | 'error'>('confirm');
  const [result, setResult] = useState<AnalyzeArticleResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const analyze = useAnalyzeArticle();

  const open = () => {
    setPhase('confirm');
    setResult(null);
    setErrorMessage(null);
    setIsOpen(true);
  };

  const close = () => {
    if (analyze.isPending) return; // don't let users dismiss mid-call
    setIsOpen(false);
  };

  const confirm = () => {
    setPhase('loading');
    analyze.mutate(articleId, {
      onSuccess: (data) => {
        setResult(data);
        setPhase('result');
        onAnalyzed?.(data);
      },
      onError: (err) => {
        setErrorMessage(mapErrorToMessage(err));
        setPhase('error');
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          className ??
          'inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-subtle text-primary text-xs font-semibold px-2.5 py-1 hover:bg-primary/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring'
        }
        aria-label="Analizar artículo con IA"
      >
        <Sparkles size={14} aria-hidden="true" />
        Analizar con IA
      </button>

      <ArticleAnalysisModal
        isOpen={isOpen}
        onClose={close}
        phase={phase}
        articleTitle={articleTitle}
        result={result}
        errorMessage={errorMessage}
        onConfirm={confirm}
      />
    </>
  );
};

/**
 * Translates backend status codes (surfaced as {@link ApiError}) into
 * doctor-friendly Spanish messages. Stays inside this module so the modal
 * remains a pure presenter.
 */
function mapErrorToMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 400) {
      return 'Este artículo no tiene texto analizable (título, abstract y keywords vacíos).';
    }
    if (err.status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
    if (err.status === 404) return 'Artículo no encontrado.';
    if (err.status === 502) return 'El servicio de IA devolvió una respuesta inválida. Intenta de nuevo en unos segundos.';
    if (err.status === 504) return 'El servicio de IA tardó demasiado. Intenta de nuevo.';
    return err.message || 'Error inesperado.';
  }
  return 'Error inesperado al conectar con el servidor.';
}
