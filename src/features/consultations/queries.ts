import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientKeys } from '@features/patients/queries';
import { analyzeConsulta, createConsulta } from './api';
import type { Consulta, ConsultaAnalysisResponse, CreateConsultaInput } from './schemas';

export function useCreateConsulta(patientId: string) {
  const qc = useQueryClient();
  return useMutation<Consulta, Error, CreateConsultaInput>({
    mutationFn: (input) => createConsulta(patientId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.consultas(patientId) });
    },
  });
}

/**
 * Read-only mutation for {@code POST /api/consultas/{id}/analyze}. No cache
 * invalidation — the backend persists nothing, so query state cannot drift.
 */
export function useAnalyzeConsulta() {
  return useMutation<ConsultaAnalysisResponse, Error, string>({
    mutationFn: analyzeConsulta,
  });
}
