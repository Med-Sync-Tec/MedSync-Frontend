import { z } from 'zod';

export const UserRoleSchema = z.enum(['DOCTOR', 'COO', 'CMO']);

export const LoginCredentialsSchema = z.object({
  email: z.string().min(1, 'Este campo es obligatorio').email('Formato de correo inválido'),
  password: z.string().min(1, 'Este campo es obligatorio'),
  rememberMe: z.boolean().optional(),
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
