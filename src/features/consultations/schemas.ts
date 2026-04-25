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

export type ConsultationType = z.infer<typeof ConsultationTypeSchema>;
export type SOAPData = z.infer<typeof SOAPDataSchema>;
export type ConsultationSummary = z.infer<typeof ConsultationSummarySchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type Consulta = z.infer<typeof ConsultaSchema>;
