import { z } from 'zod';
import { apiFetch } from '@lib/http/client';
import { ApiError } from '@lib/http/errors';
import { ConsultaSchema, type Consulta } from '@features/consultations/schemas';
import {
  ExpedienteSchema,
  PacienteContextoSchema,
  PatientSchema,
  type BulkAddPacienteContextoInput,
  type CreatePacienteContextoInput,
  type CreatePatientInput,
  type Expediente,
  type PacienteContexto,
  type Patient,
} from './schemas';

export async function listPatients(): Promise<Patient[]> {
  const raw = await apiFetch<unknown>('/api/patients');
  return z.array(PatientSchema).parse(raw);
}

export async function getPatient(id: string): Promise<Patient> {
  const raw = await apiFetch<unknown>(`/api/patients/${encodeURIComponent(id)}`);
  return PatientSchema.parse(raw);
}

export async function getExpediente(patientId: string): Promise<Expediente | null> {
  try {
    const raw = await apiFetch<unknown>(
      `/api/patients/${encodeURIComponent(patientId)}/expediente`,
    );
    return ExpedienteSchema.parse(raw);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) {
      return null;
    }
    throw error;
  }
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const body: Record<string, unknown> = {
    expedienteExternoId: input.expedienteExternoId,
    nombre: input.nombre,
    fechaNacimiento: input.fechaNacimiento,
  };
  if (input.genero) body.genero = input.genero;

  const raw = await apiFetch<unknown>('/api/patients', {
    method: 'POST',
    body,
  });
  return PatientSchema.parse(raw);
}

export async function getConsultasByPatient(patientId: string): Promise<Consulta[]> {
  const raw = await apiFetch<unknown>(
    `/api/patients/${encodeURIComponent(patientId)}/consultas`,
  );
  return z.array(ConsultaSchema).parse(raw);
}

export async function listPacienteContextos(patientId: string): Promise<PacienteContexto[]> {
  const raw = await apiFetch<unknown>(
    `/api/patients/${encodeURIComponent(patientId)}/contextos`,
  );
  return z.array(PacienteContextoSchema).parse(raw);
}

export async function createPacienteContexto(
  patientId: string,
  input: CreatePacienteContextoInput,
): Promise<PacienteContexto> {
  const raw = await apiFetch<unknown>(
    `/api/patients/${encodeURIComponent(patientId)}/contextos`,
    {
      method: 'POST',
      body: {
        tipo: input.tipo,
        valor: input.valor,
      },
    },
  );
  return PacienteContextoSchema.parse(raw);
}

export async function deletePacienteContexto(
  patientId: string,
  contextoId: string,
): Promise<void> {
  await apiFetch<void>(
    `/api/patients/${encodeURIComponent(patientId)}/contextos/${encodeURIComponent(contextoId)}`,
    { method: 'DELETE' },
  );
}

/**
 * Atomically inserts a batch of paciente_contexto rows. The backend is
 * transactional: any validation failure rolls back the entire batch.
 * Used by the consulta-AI review-then-save flow to persist accepted
 * suggestions in one round-trip.
 */
export async function bulkAddPacienteContextos(
  patientId: string,
  input: BulkAddPacienteContextoInput,
): Promise<PacienteContexto[]> {
  const raw = await apiFetch<unknown>(
    `/api/patients/${encodeURIComponent(patientId)}/contextos/bulk`,
    {
      method: 'POST',
      body: { entries: input.entries },
    },
  );
  return z.array(PacienteContextoSchema).parse(raw);
}
