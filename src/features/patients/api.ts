import { z } from 'zod';
import { apiFetch } from '@lib/http/client';
import { ApiError } from '@lib/http/errors';
import { ConsultaSchema, type Consulta } from '@features/consultations/schemas';
import {
  ExpedienteSchema,
  PatientSchema,
  type CreatePatientInput,
  type Expediente,
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
