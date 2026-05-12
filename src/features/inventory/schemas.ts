import { z } from 'zod';

export const MedicamentoEstadoSchema = z.enum(['vigente', 'en_revision', 'obsoleto']);
export type MedicamentoEstado = z.infer<typeof MedicamentoEstadoSchema>;

export const MedicamentoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  estado: MedicamentoEstadoSchema,
  descripcion: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});
export type Medicamento = z.infer<typeof MedicamentoSchema>;

export const MedicamentosPageSchema = z.object({
  content: z.array(MedicamentoSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
});
export type MedicamentosPage = z.infer<typeof MedicamentosPageSchema>;

export const CreateMedicamentoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(150),
  descripcion: z.string().max(1000).optional().default(''),
});
export type CreateMedicamentoInput = z.infer<typeof CreateMedicamentoSchema>;

export const UpdateMedicamentoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(150),
  estado: MedicamentoEstadoSchema,
  descripcion: z.string().max(1000).optional().default(''),
});
export type UpdateMedicamentoInput = z.infer<typeof UpdateMedicamentoSchema>;
