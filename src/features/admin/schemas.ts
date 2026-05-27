import { z } from 'zod';
import { UserRoleSchema } from '@features/auth/schemas';

export const SpecialtySchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  slug: z.string(),
  descripcion: z.string().nullable().optional(),
  activo: z.boolean(),
});

export const SpecialtyListSchema = z.array(SpecialtySchema);

export const CreateDoctorSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'Máximo 100 caracteres'),
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Formato de correo inválido')
    .max(100, 'Máximo 100 caracteres'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  especialidadId: z.string().uuid('Selecciona una especialidad'),
});

export const CreatedUserSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  correo: z.string().email(),
  role: UserRoleSchema,
  especialidadId: z.string().uuid().nullable().optional(),
  especialidadNombre: z.string().nullable().optional(),
  activo: z.boolean(),
  createdAt: z.string().nullable().optional(),
});

export type Specialty = z.infer<typeof SpecialtySchema>;
export type CreateDoctorInput = z.infer<typeof CreateDoctorSchema>;
export type CreatedUser = z.infer<typeof CreatedUserSchema>;
