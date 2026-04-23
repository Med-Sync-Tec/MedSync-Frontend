import { z } from 'zod';

export const PatientStatusSchema = z.enum(['estable', 'critico', 'en-observacion', 'alta']);

export const PersonalInfoSchema = z.object({
  age: z.number().int().min(0),
  gender: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

export const MedicalHistorySchema = z.object({
  chronicConditions: z.array(z.string()),
  allergies: z.array(z.string()),
});

export const TreatmentSchema = z.object({
  icon: z.string().optional(),
  name: z.string(),
  dose: z.string(),
  instructions: z.string(),
});

export const VitalStatsSchema = z.object({
  bloodPressure: z.string(),
  bpm: z.number(),
  weight: z.number(),
  o2Sat: z.number(),
});

export const PatientDetailSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  status: PatientStatusSchema,
  personalInfo: PersonalInfoSchema,
  medicalHistory: MedicalHistorySchema,
  treatments: z.array(TreatmentSchema),
  vitalStats: VitalStatsSchema,
});

export type PatientStatus = z.infer<typeof PatientStatusSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type MedicalHistory = z.infer<typeof MedicalHistorySchema>;
export type Treatment = z.infer<typeof TreatmentSchema>;
export type VitalStats = z.infer<typeof VitalStatsSchema>;
export type PatientDetail = z.infer<typeof PatientDetailSchema>;
