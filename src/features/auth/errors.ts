import { FirebaseError } from 'firebase/app';
import { ApiError } from '@lib/http/errors';

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'El formato del correo no es válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
};

export function describeAuthError(err: unknown): string {
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
