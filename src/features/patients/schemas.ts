import { z } from 'zod';

export const PatientSchema = z.object({
  id: z.string(),
  expedienteExternoId: z.string(),
  nombre: z.string(),
  fechaNacimiento: z.string(),
  genero: z.string(),
  medicoId: z.string(),
  activo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ExpedienteSchema = z.object({
  id: z.string(),
  pacienteExternoId: z.string(),
  doctorResponsableId: z.string(),
  createdAt: z.string(),
});

export const PatientConsultaLiteSchema = z.object({
  id: z.string(),
  fecha: z.string(),
  diagnostico: z.string(),
  prescripcion: z.string(),
});

export const PatientDetailSchema = z.object({
  patient: PatientSchema,
  expediente: ExpedienteSchema.optional(),
  consultas: z.array(PatientConsultaLiteSchema),
});

export type Patient = z.infer<typeof PatientSchema>;
export type Expediente = z.infer<typeof ExpedienteSchema>;
export type PatientConsultaLite = z.infer<typeof PatientConsultaLiteSchema>;
export type PatientDetail = z.infer<typeof PatientDetailSchema>;
