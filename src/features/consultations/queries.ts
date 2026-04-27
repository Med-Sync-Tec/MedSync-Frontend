import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientKeys } from '@features/patients/queries';
import { createConsulta } from './api';
import type { Consulta, CreateConsultaInput } from './schemas';

export function useCreateConsulta(patientId: string) {
  const qc = useQueryClient();
  return useMutation<Consulta, Error, CreateConsultaInput>({
    mutationFn: (input) => createConsulta(patientId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.consultas(patientId) });
    },
  });
}
