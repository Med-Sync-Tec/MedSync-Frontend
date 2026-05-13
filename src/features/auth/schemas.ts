import { z } from 'zod';

export const UserRoleSchema = z.enum(['DOCTOR', 'COO', 'CMO']);

export const LoginCredentialsSchema = z.object({
  email: z.string().min(1, 'Este campo es obligatorio').email('Formato de correo inválido'),
  password: z.string().min(1, 'Este campo es obligatorio'),
});

export const RegisterSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  correo: z.string().min(1, 'Este campo es obligatorio').email('Formato de correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(100),
  rol: UserRoleSchema,
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
