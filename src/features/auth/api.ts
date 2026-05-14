import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { z } from 'zod';
import { auth } from '@lib/firebase/client';
import { apiFetch } from '@lib/http/client';
import { ApiError } from '@lib/http/errors';
import { UserRoleSchema, type AuthUser, type UserRole, type RegisterInput } from './schemas';
import { RoleMismatchError } from './errors';

const MeResponseSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  correo: z.string().email(),
  role: UserRoleSchema,
  especialidadId: z.string().uuid().nullable().optional(),
  activo: z.boolean(),
  createdAt: z.string().nullable().optional(),
});

type MeResponse = z.infer<typeof MeResponseSchema>;

function toAuthUser(me: MeResponse): AuthUser {
  return {
    id: me.id,
    name: me.nombre,
    email: me.correo,
    role: me.role,
    especialidadId: me.especialidadId ?? null,
  };
}

export async function fetchMe(): Promise<AuthUser> {
  const raw = await apiFetch<unknown>('/api/users/me');
  const parsed = MeResponseSchema.parse(raw);
  return toAuthUser(parsed);
}

export async function loginWithExpectedRole(expectedRole: UserRole): Promise<AuthUser> {
  try {
    const raw = await apiFetch<unknown>('/api/auth/login', {
      method: 'POST',
      body: { expectedRole },
    });
    const parsed = MeResponseSchema.parse(raw);
    return toAuthUser(parsed);
  } catch (err) {
    if (err instanceof ApiError && err.isForbidden) {
      const actualRole = err.metadata?.actualRole;
      const expectedRoleFromServer = err.metadata?.expectedRole;
      throw new RoleMismatchError(
        typeof actualRole === 'string' ? actualRole : 'desconocido',
        typeof expectedRoleFromServer === 'string' ? expectedRoleFromServer : expectedRole,
      );
    }
    throw err;
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
  expectedRole: UserRole,
): Promise<AuthUser> {
  await signInWithEmailAndPassword(auth, email, password);
  try {
    return await loginWithExpectedRole(expectedRole);
  } catch (err) {
    await signOut(auth).catch(() => {
      // best-effort cleanup; surface the original error
    });
    throw err;
  }
}

export async function signOutCurrentUser(): Promise<void> {
  await signOut(auth);
}

export async function registerUser(data: RegisterInput): Promise<void> {
  await apiFetch<unknown>('/api/auth/register', {
    method: 'POST',
    body: { nombre: data.nombre, correo: data.correo, rol: data.rol },
    auth: false,
  });
}
