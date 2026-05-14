import { z } from 'zod';

export const UserRoleSchema = z.enum(['DOCTOR', 'COO', 'CMO']);

export const LoginCredentialsSchema = z.object({
  email: z.string().min(1, 'Este campo es obligatorio').email('Formato de correo inválido'),
  password: z.string().min(1, 'Este campo es obligatorio'),
});

export const RegisterSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  correo: z.string().min(1, 'Este campo es obligatorio').email('Formato de correo inválido'),
  rol: z.enum(['DOCTOR', 'COO'], { message: 'Selecciona un rol válido' }),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  // Optional: present once the COO assigns a specialty. Feature 4
  // (consulta AI) gates analysis on this being non-null.
  especialidadId: z.string().nullable().optional(),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
