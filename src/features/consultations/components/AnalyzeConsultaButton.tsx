import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ApiError } from '@lib/http/errors';
import { useAuthStore } from '@features/auth/store';
import { useBulkAddPacienteContextos } from '@features/patients/queries';
import type { ContextoTipo } from '@features/patients/schemas';
import { useAnalyzeConsulta } from '../queries';
import type { ConsultaAnalysisResponse } from '../schemas';
import { ConsultaSuggestionsModal } from './ConsultaSuggestionsModal';

interface AnalyzeConsultaButtonProps {
  consultaId: string;
  patientId: string;
  /** Compact mode swaps the label for icon-only. */
  compact?: boolean;
}

/**
 * "Analyze with AI" trigger for a consulta. Drives the full review-then-save
 * lifecycle in one component so callers (consultation cards, SOAP modal,
 * timeline rows) can drop it in anywhere with just the consulta + patient id.
 *
 * Disables itself when the authenticated user has no
 * {@code especialidadId} — the backend would reject the call with 400 and
 * the doctor cannot fix that from here.
 */
export const AnalyzeConsultaButton: React.FC<AnalyzeConsultaButtonProps> = ({
  consultaId,
  patientId,
  compact = false,
}) => {
  const especialidadId = useAuthStore((s) => s.user?.especialidadId ?? null);
  const analyze = useAnalyzeConsulta();
  const bulk = useBulkAddPacienteContextos(patientId);

  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'result' | 'empty-vocab' | 'error'>('loading');
  const [result, setResult] = useState<ConsultaAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const disabled = especialidadId == null;

  const start = () => {
    if (disabled) return;
    setIsOpen(true);
    setPhase('loading');
    setResult(null);
    setErrorMessage(null);
    analyze.mutate(consultaId, {
      onSuccess: (data) => {
        setResult(data);
        setPhase(data.vocabularyStatus === 'EMPTY' ? 'empty-vocab' : 'result');
      },
      onError: (err) => {
        setErrorMessage(mapAnalyzeError(err));
        setPhase('error');
      },
    });
  };

  const close = () => {
    if (bulk.isPending) return;
    setIsOpen(false);
  };

  const confirm = (entries: Array<{ tipo: ContextoTipo; valor: string }>) => {
    bulk.mutate(
      { entries },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: (err) => {
          setErrorMessage(mapBulkError(err));
          setPhase('error');
        },
      },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={disabled || analyze.isPending}
        title={
          disabled
            ? 'Tu usuario no tiene una especialidad asignada — pide al COO que la configure.'
            : 'Analizar la consulta con IA y sugerir contexto clínico'
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-subtle text-primary text-xs font-semibold px-2.5 py-1 hover:bg-primary/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <Sparkles size={14} aria-hidden="true" />
        {!compact && 'Sugerir con IA'}
      </button>

      <ConsultaSuggestionsModal
        isOpen={isOpen}
        onClose={close}
        phase={phase}
        result={result}
        errorMessage={errorMessage}
        isSaving={bulk.isPending}
        onConfirm={confirm}
      />
    </>
  );
};

function mapAnalyzeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 400) {
      // Either USER_HAS_NO_SPECIALTY (defensive — the button should be
      // disabled in that case) or INVALID_CONSULTA_DATA (empty SOAP).
      return err.message || 'La consulta no tiene texto suficiente para analizar.';
    }
    if (err.status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
    if (err.status === 404) return 'Consulta no encontrada en el sistema del hospital.';
    if (err.status === 502) return 'El servicio de IA devolvió una respuesta inválida. Intenta de nuevo en unos segundos.';
    if (err.status === 504) return 'El servicio de IA tardó demasiado. Intenta de nuevo.';
    return err.message || 'Error inesperado.';
  }
  return 'Error inesperado al conectar con el servidor.';
}

function mapBulkError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 400) {
      return 'Una o más entradas tienen datos inválidos. Ninguna se guardó.';
    }
    if (err.status === 404) return 'Paciente no encontrado.';
    if (err.status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
    return err.message || 'No se pudieron guardar las sugerencias.';
  }
  return 'Error inesperado al guardar las sugerencias.';
}
