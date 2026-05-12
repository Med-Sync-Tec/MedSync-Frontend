import { apiFetch } from '@lib/http/client';
import { ConsultaSchema, type Consulta, type CreateConsultaInput } from './schemas';

export async function createConsulta(
  patientId: string,
  input: CreateConsultaInput,
): Promise<Consulta> {
  const body: Record<string, unknown> = { fecha: input.fecha };
  if (input.motivoConsulta) body.motivoConsulta = input.motivoConsulta;
  if (input.subjetivo) body.subjetivo = input.subjetivo;
  if (input.objetivo) body.objetivo = input.objetivo;
  if (input.evaluacion) body.evaluacion = input.evaluacion;
  if (input.plan) body.plan = input.plan;
  if (input.prescripcion) body.prescripcion = input.prescripcion;
  if (input.diagnostico) body.diagnostico = input.diagnostico;

  const raw = await apiFetch<unknown>(
    `/api/patients/${encodeURIComponent(patientId)}/consultas`,
    { method: 'POST', body },
  );
  return ConsultaSchema.parse(raw);
}
