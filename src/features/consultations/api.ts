import { apiFetch, http } from '@lib/http/client';
import { auth } from '@lib/firebase/client';
import {
  ConsultaAnalysisResponseSchema,
  ConsultaSchema,
  SOAPDictationResultSchema,
  type Consulta,
  type ConsultaAnalysisResponse,
  type CreateConsultaInput,
  type SOAPDictationResult,
} from './schemas';

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

/**
 * Trigger Groq-backed extraction of clinical-context suggestions for a
 * consulta. Read-only on the backend — nothing is persisted. The caller
 * surfaces the suggestions in a review panel and uses the bulk
 * patient-context endpoint to persist the accepted subset.
 */
export async function sendDictation(audio: Blob): Promise<SOAPDictationResult> {
  const formData = new FormData();
  formData.append('audio', audio, 'dictation.webm');
  const token = await auth.currentUser?.getIdToken();
  const response = await http.post<unknown>('/api/soap/dictation', formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return SOAPDictationResultSchema.parse(response.data);
}

export async function analyzeConsulta(consultaId: string): Promise<ConsultaAnalysisResponse> {
  const raw = await apiFetch<unknown>(
    `/api/consultas/${encodeURIComponent(consultaId)}/analyze`,
    { method: 'POST' },
  );
  return ConsultaAnalysisResponseSchema.parse(raw);
}
