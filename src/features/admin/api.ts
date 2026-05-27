import { apiFetch } from '@lib/http/client';
import {
  CreatedUserSchema,
  SpecialtyListSchema,
  type CreateDoctorInput,
  type CreatedUser,
  type Specialty,
} from './schemas';

export async function listActiveSpecialties(): Promise<Specialty[]> {
  const raw = await apiFetch<unknown>('/api/especialidades');
  return SpecialtyListSchema.parse(raw);
}

export async function createDoctor(input: CreateDoctorInput): Promise<CreatedUser> {
  const raw = await apiFetch<unknown>('/api/admin/users', {
    method: 'POST',
    body: {
      correo: input.correo,
      nombre: input.nombre,
      password: input.password,
      rol: 'DOCTOR',
      especialidadId: input.especialidadId,
    },
  });
  return CreatedUserSchema.parse(raw);
}
