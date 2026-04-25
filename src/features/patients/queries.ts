import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@lib/http/errors';
import type { Consulta } from '@features/consultations/schemas';
import {
  createPatient,
  getConsultasByPatient,
  getExpediente,
  getPatient,
  listPatients,
} from './api';
import type { CreatePatientInput, Expediente, Patient } from './schemas';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  detail: (id: string) => [...patientKeys.all, 'detail', id] as const,
  expediente: (id: string) => [...patientKeys.all, 'expediente', id] as const,
  consultas: (id: string) => [...patientKeys.all, 'consultas', id] as const,
};

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation<Patient, Error, CreatePatientInput>({
    mutationFn: createPatient,
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: patientKeys.lists() });
      qc.setQueryData(patientKeys.detail(created.id), created);
    },
  });
}

export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: patientKeys.lists(),
    queryFn: listPatients,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery<Patient>({
    queryKey: patientKeys.detail(id ?? ''),
    queryFn: () => getPatient(id as string),
    enabled: Boolean(id),
  });
}

export function useExpediente(patientId: string | undefined) {
  return useQuery<Expediente | null>({
    queryKey: patientKeys.expediente(patientId ?? ''),
    queryFn: () => getExpediente(patientId as string),
    enabled: Boolean(patientId),
  });
}

export function useConsultasByPatient(patientId: string | undefined) {
  return useQuery<Consulta[]>({
    queryKey: patientKeys.consultas(patientId ?? ''),
    queryFn: () => getConsultasByPatient(patientId as string),
    enabled: Boolean(patientId),
  });
}

export interface PatientDetailData {
  patient: Patient;
  expediente: Expediente | null;
  consultas: Consulta[];
}

export interface PatientDetailResult {
  data: PatientDetailData | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePatientDetail(id: string | undefined): PatientDetailResult {
  const enabled = Boolean(id);
  const queries = useQueries({
    queries: [
      {
        queryKey: patientKeys.detail(id ?? ''),
        queryFn: () => getPatient(id as string),
        enabled,
      },
      {
        queryKey: patientKeys.expediente(id ?? ''),
        queryFn: () => getExpediente(id as string),
        enabled,
      },
      {
        queryKey: patientKeys.consultas(id ?? ''),
        queryFn: () => getConsultasByPatient(id as string),
        enabled,
      },
    ],
  });

  const [patientQ, expedienteQ, consultasQ] = queries;

  const isLoading = queries.some((q) => q.isPending && q.fetchStatus !== 'idle');
  const isFetching = queries.some((q) => q.isFetching);

  const criticalError =
    (patientQ.error instanceof ApiError ? patientQ.error : patientQ.error as Error | null) ??
    (consultasQ.error as Error | null) ??
    null;

  const refetch = () => {
    void patientQ.refetch();
    void expedienteQ.refetch();
    void consultasQ.refetch();
  };

  if (!enabled) {
    return { data: null, isLoading: false, isFetching: false, error: null, refetch };
  }

  if (!patientQ.data || !consultasQ.data) {
    return {
      data: null,
      isLoading,
      isFetching,
      error: criticalError,
      refetch,
    };
  }

  return {
    data: {
      patient: patientQ.data,
      expediente: expedienteQ.data ?? null,
      consultas: consultasQ.data,
    },
    isLoading: false,
    isFetching,
    error: null,
    refetch,
  };
}
