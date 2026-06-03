import { signInWithEmailAndPassword, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { z } from 'zod';
import { auth } from '@lib/firebase/client';
import { apiFetch } from '@lib/http/client';
import { UserRoleSchema, type AuthUser } from './schemas';

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

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  await signInWithEmailAndPassword(auth, email, password);
  try {
    return await fetchMe();
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

export async function updateUserPassword(currentPass: string, newPass: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No hay sesión activa.');
  }
  const credential = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPass);
}
