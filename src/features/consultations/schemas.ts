import { z } from 'zod';

export const ConsultationTypeSchema = z.enum(['general', 'especialista', 'seguimiento']);

export const SOAPDataSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
});

export const ConsultationSummarySchema = z.object({
  id: z.string(),
  date: z.string(),
  reason: z.string(),
  diagnosis: z.string(),
  type: ConsultationTypeSchema,
});

export const ConsultationSchema = ConsultationSummarySchema.extend({
  doctorName: z.string(),
  soap: SOAPDataSchema,
});

export const ConsultaSchema = z.object({
  id: z.string(),
  fecha: z.string(),
  motivoConsulta: z.string(),
  subjetivo: z.string(),
  objetivo: z.string(),
  evaluacion: z.string(),
  plan: z.string(),
  prescripcion: z.string(),
  diagnostico: z.string(),
  createdAt: z.string(),
});

export const CreateConsultaInputSchema = z.object({
  fecha: z.string().min(1, 'Requerido'),
  motivoConsulta: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  subjetivo: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  objetivo: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  evaluacion: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  plan: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  prescripcion: z
    .string()
    .trim()
    .max(5000, 'Máximo 5000 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  diagnostico: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type ConsultationType = z.infer<typeof ConsultationTypeSchema>;
export type SOAPData = z.infer<typeof SOAPDataSchema>;
export type ConsultationSummary = z.infer<typeof ConsultationSummarySchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type Consulta = z.infer<typeof ConsultaSchema>;
export type CreateConsultaInput = z.infer<typeof CreateConsultaInputSchema>;

/**
 * Response envelope from {@code POST /api/consultas/{id}/analyze}.
 *
 * Mirrors the backend's {@code ConsultaAnalysisResponse}:
 * - {@code vocabularyStatus === 'EMPTY'} means the doctor's specialty has
 *   no controlled vocabulary loaded; the LLM was NOT called and
 *   {@code suggestions} is empty. The frontend renders a guidance card
 *   ("ask your COO to load a vocabulary").
 * - {@code suggestions[].tipo} is lowercase ("enfermedad" / "sintoma" / …),
 *   matching the existing patient-context shape so accepted suggestions
 *   can be piped straight into the bulk-add endpoint.
 */
export const VocabularyStatusSchema = z.enum(['POPULATED', 'EMPTY']);

export const ConsultaSuggestionSchema = z.object({
  tipo: z.string(),
  valor: z.string(),
});

export const ConsultaAnalysisResponseSchema = z.object({
  consultaId: z.string(),
  especialidadId: z.string(),
  especialidadSlug: z.string(),
  vocabularyStatus: VocabularyStatusSchema,
  suggestions: z.array(ConsultaSuggestionSchema),
  modelUsed: z.string(),
  promptTokens: z.number().int(),
  completionTokens: z.number().int(),
});

export type VocabularyStatus = z.infer<typeof VocabularyStatusSchema>;
export type ConsultaSuggestion = z.infer<typeof ConsultaSuggestionSchema>;
export type ConsultaAnalysisResponse = z.infer<typeof ConsultaAnalysisResponseSchema>;
