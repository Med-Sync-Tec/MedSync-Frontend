import { FirebaseError } from 'firebase/app';
import { ApiError } from '@lib/http/errors';
import { describeAuthError } from './errors';

describe('describeAuthError', () => {
  it.each([
    ['auth/invalid-credential', 'Correo o contraseña incorrectos.'],
    ['auth/invalid-email', 'El formato del correo no es válido.'],
    ['auth/user-disabled', 'Esta cuenta está deshabilitada.'],
    ['auth/user-not-found', 'No existe una cuenta con ese correo.'],
    ['auth/wrong-password', 'Correo o contraseña incorrectos.'],
    ['auth/too-many-requests', 'Demasiados intentos fallidos. Intenta más tarde.'],
    ['auth/network-request-failed', 'Error de conexión. Verifica tu internet.'],
  ])('maps the Firebase code %s to its Spanish message', (code, expected) => {
    // Arrange
    const err = new FirebaseError(code, 'raw firebase message');

    // Act + Assert
    expect(describeAuthError(err)).toBe(expected);
  });

  it('falls back to a generic message including the code for unknown Firebase errors', () => {
    const err = new FirebaseError('auth/some-new-code', 'raw');

    expect(describeAuthError(err)).toBe('Error de autenticación (auth/some-new-code).');
  });

  it('returns the ApiError message verbatim', () => {
    const err = new ApiError(403, 'No tienes permisos para esta acción.');

    expect(describeAuthError(err)).toBe('No tienes permisos para esta acción.');
  });

  it('returns the message of a plain Error', () => {
    expect(describeAuthError(new Error('algo falló'))).toBe('algo falló');
  });

  it('returns the unknown-error message for non-Error values', () => {
    expect(describeAuthError('boom')).toBe('Error desconocido al iniciar sesión.');
    expect(describeAuthError(undefined)).toBe('Error desconocido al iniciar sesión.');
    expect(describeAuthError(null)).toBe('Error desconocido al iniciar sesión.');
    expect(describeAuthError(42)).toBe('Error desconocido al iniciar sesión.');
  });
});
