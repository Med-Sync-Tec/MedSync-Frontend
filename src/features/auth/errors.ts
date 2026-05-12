import { FirebaseError } from 'firebase/app';
import { ApiError } from '@lib/http/errors';
import type { UserRole } from './schemas';

export class RoleMismatchError extends Error {
  readonly actualRole: string;
  readonly expectedRole: string;

  constructor(actualRole: string, expectedRole: string) {
    super(
      `Tu cuenta tiene rol ${actualRole}. No puedes iniciar sesión como ${expectedRole}.`,
    );
    this.name = 'RoleMismatchError';
    this.actualRole = actualRole;
    this.expectedRole = expectedRole;
  }
}

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'El formato del correo no es válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
};

const ROLE_LABEL: Record<UserRole, string> = {
  DOCTOR: 'Doctor',
  COO: 'COO',
  CMO: 'CMO',
};

function roleLabel(raw: string): string {
  const upper = raw.toUpperCase();
  return (ROLE_LABEL as Record<string, string>)[upper] ?? raw;
}

export function describeAuthError(err: unknown): string {
  if (err instanceof RoleMismatchError) {
    return `Tu cuenta es ${roleLabel(err.actualRole)}. No puedes iniciar sesión como ${roleLabel(err.expectedRole)}.`;
  }
  if (err instanceof FirebaseError) {
    return FIREBASE_AUTH_MESSAGES[err.code] ?? `Error de autenticación (${err.code}).`;
  }
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Error desconocido al iniciar sesión.';
}
