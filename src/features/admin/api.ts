import { apiFetch } from '@lib/http/client';
import {
  CreatedUserSchema,
  SpecialtyListSchema,
  type CreateUserInput,
  type CreatedUser,
  type Specialty,
} from './schemas';

export async function listActiveSpecialties(): Promise<Specialty[]> {
  const raw = await apiFetch<unknown>('/api/especialidades');
  return SpecialtyListSchema.parse(raw);
}

export async function createUser(input: CreateUserInput): Promise<CreatedUser> {
  const raw = await apiFetch<unknown>('/api/admin/users', {
    method: 'POST',
    body: {
      correo: input.correo,
      nombre: input.nombre,
      password: input.password,
      rol: input.rol,
      especialidadId: input.rol === 'DOCTOR' ? input.especialidadId : undefined,
    },
  });
  return CreatedUserSchema.parse(raw);
}

// Backward compat alias
export const createDoctor = createUser;
