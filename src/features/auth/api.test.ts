import type { User, UserCredential, AuthCredential } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
}));

jest.mock('@lib/firebase/client', () => ({
  auth: { currentUser: null },
}));

jest.mock('@lib/http/client', () => ({
  apiFetch: jest.fn(),
}));

import {
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@lib/firebase/client';
import { apiFetch } from '@lib/http/client';
import { fetchMe, signInWithEmail, signOutCurrentUser, updateUserPassword } from './api';

const mockSignIn = jest.mocked(signInWithEmailAndPassword);
const mockSignOut = jest.mocked(signOut);
const mockCredential = jest.mocked(EmailAuthProvider.credential);
const mockReauthenticate = jest.mocked(reauthenticateWithCredential);
const mockUpdatePassword = jest.mocked(updatePassword);
const mockApiFetch = jest.mocked(apiFetch);

const mutableAuth = auth as unknown as { currentUser: Partial<User> | null };

const ME_RESPONSE = {
  id: 'f3b9c1a0-1234-4b5c-9d6e-7f8a9b0c1d2e',
  nombre: 'Dra. Ana López',
  correo: 'ana@clinica.com',
  role: 'DOCTOR',
  especialidadId: 'a1b2c3d4-5678-4abc-9def-012345678901',
  activo: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const EXPECTED_AUTH_USER = {
  id: ME_RESPONSE.id,
  name: 'Dra. Ana López',
  email: 'ana@clinica.com',
  role: 'DOCTOR',
  especialidadId: ME_RESPONSE.especialidadId,
};

beforeEach(() => {
  jest.clearAllMocks();
  mutableAuth.currentUser = null;
});

describe('fetchMe', () => {
  it('calls GET /api/users/me and maps {nombre, correo} to {name, email}', async () => {
    // Arrange
    mockApiFetch.mockResolvedValue(ME_RESPONSE);

    // Act
    const user = await fetchMe();

    // Assert
    expect(mockApiFetch).toHaveBeenCalledWith('/api/users/me');
    expect(user).toEqual(EXPECTED_AUTH_USER);
  });

  it('normalizes a missing especialidadId to null', async () => {
    const withoutSpecialty: Partial<typeof ME_RESPONSE> = { ...ME_RESPONSE };
    delete withoutSpecialty.especialidadId;
    mockApiFetch.mockResolvedValue(withoutSpecialty);

    const user = await fetchMe();

    expect(user.especialidadId).toBeNull();
  });

  it('throws when the backend response does not match the schema', async () => {
    mockApiFetch.mockResolvedValue({ id: 'not-a-uuid', nombre: 'x' });

    await expect(fetchMe()).rejects.toThrow();
  });
});

describe('signInWithEmail', () => {
  it('signs in with Firebase and returns the mapped backend profile', async () => {
    mockSignIn.mockResolvedValue({} as UserCredential);
    mockApiFetch.mockResolvedValue(ME_RESPONSE);

    const user = await signInWithEmail('ana@clinica.com', 'secret123');

    expect(mockSignIn).toHaveBeenCalledWith(auth, 'ana@clinica.com', 'secret123');
    expect(user).toEqual(EXPECTED_AUTH_USER);
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('propagates the Firebase error without calling the backend', async () => {
    const firebaseError = new Error('auth/invalid-credential');
    mockSignIn.mockRejectedValue(firebaseError);

    await expect(signInWithEmail('ana@clinica.com', 'bad')).rejects.toThrow(firebaseError);
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('signs out and rethrows the original error when fetching the profile fails', async () => {
    mockSignIn.mockResolvedValue({} as UserCredential);
    const profileError = new Error('backend down');
    mockApiFetch.mockRejectedValue(profileError);
    mockSignOut.mockResolvedValue(undefined);

    await expect(signInWithEmail('ana@clinica.com', 'secret123')).rejects.toThrow(profileError);
    expect(mockSignOut).toHaveBeenCalledWith(auth);
  });

  it('still surfaces the original error when the cleanup sign-out also fails', async () => {
    mockSignIn.mockResolvedValue({} as UserCredential);
    const profileError = new Error('backend down');
    mockApiFetch.mockRejectedValue(profileError);
    mockSignOut.mockRejectedValue(new Error('sign-out failed'));

    await expect(signInWithEmail('ana@clinica.com', 'secret123')).rejects.toThrow(
      'backend down',
    );
  });
});

describe('signOutCurrentUser', () => {
  it('delegates to Firebase signOut with the app auth instance', async () => {
    mockSignOut.mockResolvedValue(undefined);

    await signOutCurrentUser();

    expect(mockSignOut).toHaveBeenCalledWith(auth);
  });

  it('propagates sign-out errors', async () => {
    mockSignOut.mockRejectedValue(new Error('network down'));

    await expect(signOutCurrentUser()).rejects.toThrow('network down');
  });
});

describe('updateUserPassword', () => {
  it('throws when there is no active session', async () => {
    mutableAuth.currentUser = null;

    await expect(updateUserPassword('old', 'new123')).rejects.toThrow('No hay sesión activa.');
    expect(mockReauthenticate).not.toHaveBeenCalled();
  });

  it('throws when the current user has no email', async () => {
    mutableAuth.currentUser = { email: null };

    await expect(updateUserPassword('old', 'new123')).rejects.toThrow('No hay sesión activa.');
  });

  it('reauthenticates with the current credentials and then updates the password', async () => {
    const currentUser = { email: 'ana@clinica.com' };
    mutableAuth.currentUser = currentUser;
    const credential = { providerId: 'password' } as AuthCredential;
    mockCredential.mockReturnValue(credential as never);
    mockReauthenticate.mockResolvedValue({} as UserCredential);
    mockUpdatePassword.mockResolvedValue(undefined);

    await updateUserPassword('oldPass', 'newPass');

    expect(mockCredential).toHaveBeenCalledWith('ana@clinica.com', 'oldPass');
    expect(mockReauthenticate).toHaveBeenCalledWith(currentUser, credential);
    expect(mockUpdatePassword).toHaveBeenCalledWith(currentUser, 'newPass');
  });

  it('does not update the password when reauthentication fails', async () => {
    mutableAuth.currentUser = { email: 'ana@clinica.com' };
    mockCredential.mockReturnValue({});
    mockReauthenticate.mockRejectedValue(new Error('auth/invalid-credential'));

    await expect(updateUserPassword('wrong', 'newPass')).rejects.toThrow(
      'auth/invalid-credential',
    );
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });
});
