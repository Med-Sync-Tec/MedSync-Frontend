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

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_AGE_YEARS = 150;

function isPastNotTooOld(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed.getTime() >= today.getTime()) return false;
  const ageMs = today.getTime() - parsed.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  return ageYears <= MAX_AGE_YEARS;
}

export const CreatePatientInputSchema = z.object({
  expedienteExternoId: z
    .string()
    .trim()
    .min(1, 'Requerido')
    .max(100, 'Máximo 100 caracteres'),
  nombre: z
    .string()
    .trim()
    .min(1, 'Requerido')
    .max(200, 'Máximo 200 caracteres'),
  fechaNacimiento: z
    .string()
    .trim()
    .refine((v) => ISO_DATE_RE.test(v), 'Usa formato AAAA-MM-DD')
    .refine(isPastNotTooOld, 'La fecha debe ser pasada y la edad menor a 150 años'),
  genero: z
    .string()
    .trim()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type Patient = z.infer<typeof PatientSchema>;
export type Expediente = z.infer<typeof ExpedienteSchema>;
export type PatientConsultaLite = z.infer<typeof PatientConsultaLiteSchema>;
export type PatientDetail = z.infer<typeof PatientDetailSchema>;
export type CreatePatientInput = z.infer<typeof CreatePatientInputSchema>;
